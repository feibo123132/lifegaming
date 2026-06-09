import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { db } from '../lib/cloudbase';
import {
  buildCloudGameState,
  createInitialGameData,
  mergeGameData,
  normalizeUserEmail,
  type GameData,
  type SyncedNpcMessage
} from '../lib/gameSync';

type NpcState = GameData['npcState'];

interface GameStoreState extends GameData {
  currentUserEmail: string | null;
  isSyncing: boolean;
  syncError: string | null;
  setSyncIdentity: (email: string | null) => void;
  syncFromCloud: (email: string) => Promise<void>;
  syncToCloud: () => Promise<void>;
  clearLocalData: () => void;
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
        const localSnapshot = {
          tasks: get().tasks,
          userPoints: get().userPoints,
          redeemedRewardIds: get().redeemedRewardIds,
          redeemHistory: get().redeemHistory,
          npcMessages: get().npcMessages,
          npcState: get().npcState,
          updatedAt: get().updatedAt
        };

        set({ currentUserEmail: userId, isSyncing: true, syncError: null });

        try {
          const collection = db.collection(COLLECTION_NAME);
          const query = collection.where({ userId });
          const result = await query.limit(1).get();
          const cloudDoc = result.data?.[0] as { _id?: string; data?: GameData } | undefined;

          if (!cloudDoc?.data) {
            const now = new Date().toISOString();
            await collection.add({
              ...buildCloudGameState(userId, { ...localSnapshot, updatedAt: now }, now),
              createTime: now
            });
            return;
          }

          const merged = mergeGameData(localSnapshot, cloudDoc.data);
          set(merged);

          if (merged.updatedAt !== cloudDoc.data.updatedAt) {
            await query.update(buildCloudGameState(userId, merged));
          }
        } catch (err: any) {
          console.error('Game cloud sync failed:', err);
          set({ syncError: err?.message || '云端同步失败，请检查数据库集合、权限和安全域名配置' });
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
          const count = await query.count();
          const document = buildCloudGameState(userId, data);

          if (count.total > 0) {
            await query.update(document);
          } else {
            await collection.add({
              ...document,
              createTime: document.updateTime
            });
          }
        } catch (err: any) {
          console.error('Game cloud upload failed:', err);
          set({ syncError: err?.message || '云端保存失败，请稍后重试' });
        }
      },

      toggleTask: async (taskId) => {
        let awardedPoints = 0;
        set((state) => withUpdatedAt({
          tasks: state.tasks.map((task) => {
            if (task.id !== taskId) return task;
            const completed = !task.completed;
            if (completed && !task.completed) {
              awardedPoints = task.points;
            }
            return {
              ...task,
              completed,
              completedAt: completed ? new Date().toISOString() as unknown as Date : undefined
            };
          }),
          userPoints: state.userPoints + awardedPoints
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
        userPoints: state.userPoints,
        redeemedRewardIds: state.redeemedRewardIds,
        redeemHistory: state.redeemHistory,
        npcMessages: state.npcMessages,
        npcState: state.npcState,
        updatedAt: state.updatedAt,
        currentUserEmail: state.currentUserEmail
      })
    }
  )
);
