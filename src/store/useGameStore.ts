import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { db } from '../lib/cloudbase';
import {
  buildCloudGameState,
  createDailyTemplate,
  createUserTask,
  createInitialGameData,
  ensureDailyTemplateTasks,
  getCloudSyncErrorMessage,
  mergeGameData,
  normalizeUserEmail,
  pickLatestCloudGameDoc,
  reconcileGameDataPoints,
  resetExampleGameData,
  shouldUseLocalGameDataForSync,
  getTaskAwardedPoints,
  toggleUserTaskCompletion,
  updateUserTask,
  type CloudGameStateDocument,
  type EditTaskInput,
  type GameData,
  type NewTaskInput,
  type SyncedNpcMessage
} from '../lib/gameSync';

type NpcState = GameData['npcState'];

interface GameStoreState extends GameData {
  currentUserEmail: string | null;
  isSyncing: boolean;
  syncError: string | null;
  setSyncIdentity: (email: string | null) => void;
  setProfileName: (name: string) => Promise<void>;
  syncFromCloud: (email: string) => Promise<void>;
  syncToCloud: () => Promise<void>;
  clearLocalData: () => void;
  addTask: (input: NewTaskInput) => Promise<boolean>;
  ensureDailyTasksForDate: (dateKey: string) => Promise<void>;
  editTask: (taskId: string, input: EditTaskInput) => Promise<boolean>;
  deleteTask: (taskId: string) => Promise<boolean>;
  toggleTask: (taskId: string) => Promise<{ awardedPoints: number }>;
  redeemReward: (rewardId: string, rewardName: string, points: number) => Promise<boolean>;
  setNpcState: (state: NpcState) => Promise<void>;
  addNpcMessage: (message: Omit<SyncedNpcMessage, 'timestamp'> & { timestamp?: string }) => Promise<void>;
}

const COLLECTION_NAME = 'lifegaming_user_states';

const withUpdatedAt = <T extends Partial<GameData>>(updates: T): T & { updatedAt: string } => ({
  ...updates,
  updatedAt: new Date().toISOString()
});

const createInitialState = () => createInitialGameData();

export const useGameStore = create<GameStoreState>()(
  persist(
    (set, get) => ({
      ...createInitialState(),
      currentUserEmail: null,
      isSyncing: false,
      syncError: null,

      setSyncIdentity: (email) => {
        set({ currentUserEmail: email ? normalizeUserEmail(email) : null });
      },

      clearLocalData: () => {
        set({
          ...createInitialState(),
          currentUserEmail: null,
          isSyncing: false,
          syncError: null
        });
      },

      syncFromCloud: async (email) => {
        const userId = normalizeUserEmail(email);
        const shouldReuseLocalData = shouldUseLocalGameDataForSync(get().currentUserEmail, userId);
        const localSnapshot = shouldReuseLocalData
          ? {
              tasks: get().tasks,
              dailyTemplates: get().dailyTemplates,
              profileName: get().profileName,
              userPoints: get().userPoints,
              redeemedRewardIds: get().redeemedRewardIds,
              redeemHistory: get().redeemHistory,
              npcMessages: get().npcMessages,
              npcState: get().npcState,
              updatedAt: get().updatedAt
            }
          : createInitialGameData();

        set({ currentUserEmail: userId, isSyncing: true, syncError: null });

        try {
          const collection = db.collection(COLLECTION_NAME);
          const query = collection.where({ userId });
          const result = await query.limit(20).get();
          const cloudDoc = pickLatestCloudGameDoc(result.data as CloudGameStateDocument[] | undefined);

          if (!cloudDoc?.data) {
            const now = new Date().toISOString();
            const cleanSnapshot = resetExampleGameData({ ...localSnapshot, updatedAt: now });
            set({ ...cleanSnapshot, syncError: null });
            await collection.add({
              ...buildCloudGameState(userId, cleanSnapshot, now),
              createTime: now
            });
            return;
          }

          const merged = mergeGameData(localSnapshot, cloudDoc.data);
          set({ ...merged, syncError: null });

          if (merged.updatedAt !== cloudDoc.data.updatedAt) {
            const document = buildCloudGameState(userId, merged);
            if (cloudDoc._id) {
              await collection.doc(cloudDoc._id).update(document);
            } else {
              await query.update(document);
            }
          }
        } catch (err: any) {
          console.error('Game cloud sync failed:', err);
          set({
            syncError: getCloudSyncErrorMessage(err, '云端同步失败，请检查数据库集合、权限和安全域名配置')
          });
        } finally {
          set({ isSyncing: false });
        }
      },

      syncToCloud: async () => {
        const email = get().currentUserEmail;
        if (!email) return;

        const userId = normalizeUserEmail(email);
        const data = {
          tasks: get().tasks,
          dailyTemplates: get().dailyTemplates,
          profileName: get().profileName,
          userPoints: get().userPoints,
          redeemedRewardIds: get().redeemedRewardIds,
          redeemHistory: get().redeemHistory,
          npcMessages: get().npcMessages,
          npcState: get().npcState,
          updatedAt: get().updatedAt
        };

        try {
          const collection = db.collection(COLLECTION_NAME);
          const query = collection.where({ userId });
          const result = await query.limit(20).get();
          const cloudDoc = pickLatestCloudGameDoc(result.data as CloudGameStateDocument[] | undefined);
          const document = buildCloudGameState(userId, data);

          if (cloudDoc?._id) {
            await collection.doc(cloudDoc._id).update(document);
          } else {
            await collection.add({
              ...document,
              createTime: document.updateTime
            });
          }

          set({ syncError: null });
        } catch (err: any) {
          console.error('Game cloud upload failed:', err);
          set({
            syncError: getCloudSyncErrorMessage(err, '云端保存失败，请稍后重试')
          });
        }
      },

      addTask: async (input) => {
        const template = input.category === 'daily' && input.saveAsDailyTemplate
          ? createDailyTemplate(input, `daily-template-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)
          : null;
        const task = createUserTask(
          { ...input, templateId: template?.id },
          `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        );
        if (!task) return false;

        set((state) => withUpdatedAt({
          tasks: [task, ...state.tasks],
          dailyTemplates: template ? [template, ...state.dailyTemplates] : state.dailyTemplates
        }));
        await get().syncToCloud();
        return true;
      },

      ensureDailyTasksForDate: async (dateKey) => {
        const currentData = {
          profileName: get().profileName,
          tasks: get().tasks,
          dailyTemplates: get().dailyTemplates,
          userPoints: get().userPoints,
          redeemedRewardIds: get().redeemedRewardIds,
          redeemHistory: get().redeemHistory,
          npcMessages: get().npcMessages,
          npcState: get().npcState,
          updatedAt: get().updatedAt
        };
        const nextData = ensureDailyTemplateTasks(currentData, dateKey);
        if (nextData === currentData) return;

        set({ ...nextData });
        await get().syncToCloud();
      },

      setProfileName: async (name) => {
        set(withUpdatedAt({
          profileName: name.trim().slice(0, 16)
        }));
        await get().syncToCloud();
      },

      editTask: async (taskId, input) => {
        const task = get().tasks.find((item) => item.id === taskId);
        if (!task || !updateUserTask(task, input)) return false;

        set((state) => withUpdatedAt({
          tasks: state.tasks.map((item) => {
            if (item.id !== taskId) return item;
            return updateUserTask(item, input) || item;
          })
        }));
        await get().syncToCloud();
        return true;
      },

      deleteTask: async (taskId) => {
        const task = get().tasks.find((item) => item.id === taskId);
        if (!task) return false;

        set((state) => withUpdatedAt({
          tasks: state.tasks.filter((item) => item.id !== taskId),
          userPoints: Math.max(0, state.userPoints - getTaskAwardedPoints(task))
        }));
        await get().syncToCloud();
        return true;
      },

      toggleTask: async (taskId) => {
        let awardedPoints = 0;
        set((state) => withUpdatedAt({
          tasks: state.tasks.map((task) => {
            if (task.id !== taskId) return task;
            const result = toggleUserTaskCompletion(task);
            awardedPoints = result.pointsDelta;
            return result.task;
          }),
          userPoints: Math.max(0, state.userPoints + awardedPoints)
        }));
        await get().syncToCloud();
        return { awardedPoints };
      },

      redeemReward: async (rewardId, rewardName, points) => {
        if (get().redeemedRewardIds.includes(rewardId) || get().userPoints < points) return false;

        set((state) => withUpdatedAt({
          userPoints: state.userPoints - points,
          redeemedRewardIds: [...state.redeemedRewardIds, rewardId],
          redeemHistory: [
            {
              id: `${rewardId}-${Date.now()}`,
              name: rewardName,
              date: new Date().toISOString().slice(0, 10),
              points
            },
            ...state.redeemHistory
          ]
        }));
        await get().syncToCloud();
        return true;
      },

      setNpcState: async (npcState) => {
        set(withUpdatedAt({ npcState }));
        await get().syncToCloud();
      },

      addNpcMessage: async (message) => {
        set((state) => withUpdatedAt({
          npcMessages: [
            ...state.npcMessages,
            {
              ...message,
              timestamp: message.timestamp || new Date().toISOString()
            }
          ]
        }));
        await get().syncToCloud();
      }
    }),
    {
      name: 'lifegaming-game-state-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tasks: state.tasks,
        dailyTemplates: state.dailyTemplates,
        profileName: state.profileName,
        userPoints: state.userPoints,
        redeemedRewardIds: state.redeemedRewardIds,
        redeemHistory: state.redeemHistory,
        npcMessages: state.npcMessages,
        npcState: state.npcState,
        updatedAt: state.updatedAt,
        currentUserEmail: state.currentUserEmail
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<GameStoreState>;
        const gameData = reconcileGameDataPoints({
          tasks: persisted.tasks ?? currentState.tasks,
          dailyTemplates: persisted.dailyTemplates ?? currentState.dailyTemplates,
          profileName: typeof persisted.profileName === 'string' ? persisted.profileName : currentState.profileName,
          userPoints: persisted.userPoints ?? currentState.userPoints,
          redeemedRewardIds: persisted.redeemedRewardIds ?? currentState.redeemedRewardIds,
          redeemHistory: persisted.redeemHistory ?? currentState.redeemHistory,
          npcMessages: persisted.npcMessages ?? currentState.npcMessages,
          npcState: persisted.npcState ?? currentState.npcState,
          updatedAt: persisted.updatedAt ?? currentState.updatedAt
        });

        return {
          ...currentState,
          ...persisted,
          ...gameData
        };
      }
    }
  )
);
