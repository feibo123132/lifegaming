import { type FormEvent, type MouseEvent, useEffect, useRef, useState } from 'react';
import { Check, Calendar, Target, Sparkles, TrendingUp, Star, Flame, Plus, Trash2, Pencil, X } from 'lucide-react';
import { cn, CATEGORY_LABELS, getWeekDates } from '../utils/helpers';
import type { ViewMode } from '../types';
import { PointsAnimation } from '../components/PointsAnimation';
import { useGameStore } from '../store/useGameStore';
import { filterTasksByDate, getDefaultTaskPoints, getLocalDateKey, isRecurringDailyTask, sortTasksForDisplay } from '../lib/gameSync';
import { playTaskCompletionSound, shouldPlayTaskCompletionSound } from '../lib/taskCompletionSound';

type CategoryFilter = 'all' | 'main' | 'side' | 'daily';
type TaskCategory = Exclude<CategoryFilter, 'all'>;

export function Tasks() {
  const tasks = useGameStore((state) => state.tasks);
  const toggleSyncedTask = useGameStore((state) => state.toggleTask);
  const addSyncedTask = useGameStore((state) => state.addTask);
  const ensureDailyTasksForDate = useGameStore((state) => state.ensureDailyTasksForDate);
  const editSyncedTask = useGameStore((state) => state.editTask);
  const deleteSyncedTask = useGameStore((state) => state.deleteTask);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory>('daily');
  const [newTaskPoints, setNewTaskPoints] = useState(getDefaultTaskPoints('daily'));
  const [saveDailyTemplate, setSaveDailyTemplate] = useState(true);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingPoints, setEditingPoints] = useState(10);
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedDateKey, setSelectedDateKey] = useState(() => getLocalDateKey());
  const [showAnimation, setShowAnimation] = useState(false);
  const [lastPoints, setLastPoints] = useState(0);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const selectedDate = new Date(`${selectedDateKey}T00:00:00`);
  const selectedDateLabel = selectedDate.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const tasksForSelectedDate = filterTasksByDate(sortTasksForDisplay(tasks), selectedDateKey);
  const filteredTasks = tasksForSelectedDate.filter(task => 
    categoryFilter === 'all' || task.category === categoryFilter
  );

  const completedCount = tasksForSelectedDate.filter(t => t.completed).length;
  const totalCount = tasksForSelectedDate.length;
  const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  useEffect(() => {
    void ensureDailyTasksForDate(selectedDateKey);
  }, [ensureDailyTasksForDate, selectedDateKey]);

  const toggleTask = async (taskId: string) => {
    const { awardedPoints } = await toggleSyncedTask(taskId);
    if (shouldPlayTaskCompletionSound(awardedPoints)) {
      playTaskCompletionSound();
      setLastPoints(awardedPoints);
      setShowAnimation(true);
    }
  };

  const addTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const created = await addSyncedTask({
      title: newTaskTitle,
      category: newTaskCategory,
      points: newTaskPoints,
      dateKey: selectedDateKey,
      saveAsDailyTemplate: newTaskCategory === 'daily' && saveDailyTemplate
    });

    if (created) {
      setNewTaskTitle('');
      setNewTaskPoints(getDefaultTaskPoints(newTaskCategory));
    }
  };

  const selectNewTaskCategory = (category: TaskCategory) => {
    setNewTaskCategory(category);
    setNewTaskPoints(getDefaultTaskPoints(category));
  };

  const deleteTask = async (event: MouseEvent<HTMLButtonElement>, taskId: string) => {
    event.stopPropagation();
    await deleteSyncedTask(taskId);
  };

  const startEditingTask = (event: MouseEvent<HTMLButtonElement>, task: (typeof tasks)[number]) => {
    event.stopPropagation();
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
    setEditingPoints(task.points);
  };

  const cancelEditingTask = (event?: MouseEvent<HTMLButtonElement>) => {
    event?.stopPropagation();
    setEditingTaskId(null);
    setEditingTitle('');
    setEditingPoints(10);
  };

  const saveEditingTask = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!editingTaskId) return;

    const updated = await editSyncedTask(editingTaskId, {
      title: editingTitle,
      points: editingPoints
    });

    if (updated) {
      cancelEditingTask();
    }
  };

  const weekDates = getWeekDates(new Date(selectedDate));

  const weekData = weekDates.map((date) => {
    const dateKey = getLocalDateKey(date);
    const dayTasks = filterTasksByDate(tasks, dateKey);

    return {
      date,
      completed: dayTasks.filter((task) => task.completed).length,
      total: dayTasks.length,
      isSelected: dateKey === selectedDateKey,
    };
  });

  const openNativeDatePicker = () => {
    const input = dateInputRef.current;
    if (!input) return;

    input.focus();
    try {
      input.showPicker();
    } catch {
      input.click();
    }
  };

  // Mock month data - heatmap
  const getHeatmapColor = (_day: number) => {
    const completion = Math.random();
    if (completion > 0.8) return 'bg-pop-red';
    if (completion > 0.6) return 'bg-pop-orange';
    if (completion > 0.4) return 'bg-pop-yellow';
    if (completion > 0.2) return 'bg-pop-yellow/50';
    return 'bg-white border-2 border-pop-black/20';
  };

  const renderDayView = () => (
    <>
      <form onSubmit={addTask} className="pop-card bg-white !p-4 mb-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-black text-pop-black">任务名称</label>
            <input
              value={newTaskTitle}
              onChange={(event) => setNewTaskTitle(event.target.value)}
              className="pop-input w-full"
              placeholder="今天要完成什么？"
              maxLength={40}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-black text-pop-black">类型</label>
            <div className="grid grid-cols-3 gap-2 rounded-pop border-4 border-pop-black bg-white p-1 shadow-pop-sm">
              {([
                { key: 'main', label: '主线' },
                { key: 'side', label: '支线' },
                { key: 'daily', label: '日常' }
              ] as const).map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => selectNewTaskCategory(item.key)}
                  className={cn(
                    "rounded-pop px-3 py-2 text-sm font-black transition-all",
                    newTaskCategory === item.key
                      ? cn(
                        "shadow-pop-sm",
                        item.key === 'main' && "bg-pop-yellow text-pop-black",
                        item.key === 'side' && "bg-pop-blue text-white",
                        item.key === 'daily' && "bg-pop-green text-white"
                      )
                      : "text-pop-black hover:bg-white"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-28">
            <label className="mb-2 block text-sm font-black text-pop-black">积分</label>
            <input
              value={newTaskPoints}
              onChange={(event) => setNewTaskPoints(Number(event.target.value))}
              className="pop-input w-full text-center"
              type="number"
              min={1}
              max={999}
            />
          </div>

          <button
            type="submit"
            disabled={!newTaskTitle.trim()}
            className="pop-btn-primary flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-5 w-5" />
            添加
          </button>
        </div>

        {newTaskCategory === 'daily' && (
          <label className="mt-3 flex w-fit cursor-pointer items-center gap-3 rounded-pop border-3 border-pop-black bg-pop-yellow px-4 py-2 font-black text-pop-black shadow-pop-sm">
            <input
              checked={saveDailyTemplate}
              onChange={(event) => setSaveDailyTemplate(event.target.checked)}
              className="h-5 w-5 accent-pop-green"
              type="checkbox"
            />
            <span>每天自动出现</span>
          </label>
        )}
      </form>

      {/* Category Filter */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {([
          { key: 'all', label: '全部', color: 'bg-pop-black text-white' },
          { key: 'main', label: '主线', color: 'bg-pop-yellow text-pop-black' },
          { key: 'side', label: '支线', color: 'bg-pop-blue text-white' },
          { key: 'daily', label: '日常', color: 'bg-pop-green text-white' },
        ] as const).map((cat) => (
          <button
            key={cat.key}
            onClick={() => setCategoryFilter(cat.key as CategoryFilter)}
            className={cn(
              "px-5 py-2.5 rounded-pop border-4 border-pop-black font-bold whitespace-nowrap transition-all shadow-pop-sm",
              categoryFilter === cat.key
                ? cat.color
                : "bg-white text-pop-black hover:shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 && (
          <div className="pop-card bg-white p-8 text-center">
            <div className="pop-icon-box mx-auto mb-4 h-16 w-16 bg-pop-yellow">
              <Target className="h-8 w-8 text-pop-black" />
            </div>
            <p className="text-xl font-black text-pop-black">暂无任务</p>
            <p className="mt-2 text-sm font-bold text-pop-black/60">给 {selectedDateLabel} 添加一个任务后，它会在这里出现。</p>
          </div>
        )}

        {filteredTasks.map((task) => (
          <div
            key={task.id}
            onClick={() => {
              if (editingTaskId !== task.id) {
                void toggleTask(task.id);
              }
            }}
            className={cn(
              "pop-list-item",
              editingTaskId === task.id ? "cursor-default" : "cursor-pointer",
              task.completed && "bg-pop-green/20 border-pop-green"
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-8 h-8 rounded-pop border-4 flex items-center justify-center transition-all",
                task.completed
                  ? "bg-pop-green border-pop-green"
                  : "bg-white border-pop-black hover:bg-pop-yellow"
              )}>
                {task.completed && <Check className="w-5 h-5 text-white" />}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={cn(
                    "pop-tag text-xs",
                    task.category === 'main' && "bg-pop-yellow text-pop-black",
                    task.category === 'side' && "bg-pop-blue text-white",
                    task.category === 'daily' && "bg-pop-green text-white"
                  )}>
                    {CATEGORY_LABELS[task.category]}
                  </span>
                  {isRecurringDailyTask(task) && (
                    <span className="rounded-pop border-3 border-pop-black bg-pop-yellow px-2.5 py-0.5 text-xs font-black text-pop-black shadow-pop-sm">
                      每天
                    </span>
                  )}
                  {task.completed && (
                    <span className="pop-tag-yellow text-xs flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      +{task.points}积分
                    </span>
                  )}
                </div>
                {editingTaskId === task.id ? (
                  <input
                    value={editingTitle}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) => setEditingTitle(event.target.value)}
                    className="pop-input !px-3 !py-2 text-lg font-bold"
                    maxLength={40}
                  />
                ) : (
                  <p className={cn(
                    "font-bold text-lg transition-colors",
                    task.completed ? "text-pop-black/40 line-through" : "text-pop-black"
                  )}>
                    {task.title}
                  </p>
                )}
              </div>

              <div className="text-right">
                {editingTaskId === task.id ? (
                  <input
                    value={editingPoints}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) => setEditingPoints(Number(event.target.value))}
                    className="pop-input w-24 !px-3 !py-2 text-center font-black"
                    type="number"
                    min={1}
                    max={999}
                  />
                ) : (
                  <div className={cn(
                    "pop-tag text-base",
                    task.completed ? "bg-pop-green text-white" : "bg-pop-yellow"
                  )}>
                    <Star className="w-4 h-4 mr-1 inline" />
                    {task.points}分
                  </div>
                )}
              </div>

              {editingTaskId === task.id ? (
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={saveEditingTask}
                    disabled={!editingTitle.trim()}
                    className="flex h-11 w-11 items-center justify-center rounded-pop border-4 border-pop-black bg-pop-green text-white shadow-pop-sm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={`保存任务：${task.title}`}
                    title="保存"
                  >
                    <Check className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditingTask}
                    className="flex h-11 w-11 items-center justify-center rounded-pop border-4 border-pop-black bg-white text-pop-black shadow-pop-sm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop"
                    aria-label={`取消编辑：${task.title}`}
                    title="取消"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={(event) => startEditingTask(event, task)}
                    className="flex h-11 w-11 items-center justify-center rounded-pop border-4 border-pop-black bg-white text-pop-blue shadow-pop-sm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-pop-blue hover:text-white hover:shadow-pop"
                    aria-label={`编辑任务：${task.title}`}
                    title="编辑任务"
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={(event) => deleteTask(event, task.id)}
                    className="flex h-11 w-11 items-center justify-center rounded-pop border-4 border-pop-black bg-white text-pop-red shadow-pop-sm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-pop-red hover:text-white hover:shadow-pop"
                    aria-label={`删除任务：${task.title}`}
                    title="删除任务"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );

  const renderWeekView = () => (
    <div className="space-y-6">
      {/* Week Overview */}
      <div className="grid grid-cols-7 gap-2">
        {weekData.map((day, index) => (
          <div 
            key={index}
            className={cn(
              "pop-card p-3 text-center !p-3",
              day.isSelected && "bg-pop-yellow ring-4 ring-pop-red"
            )}
          >
            <p className="text-xs font-bold text-pop-black/60 mb-1">
              {['一', '二', '三', '四', '五', '六', '日'][index]}
            </p>
            <p className={cn(
              "text-xl font-black mb-2",
              day.isSelected ? "text-pop-red" : "text-pop-black"
            )}>
              {day.date.getDate()}
            </p>
            <div className="space-y-1">
              <div className="pop-progress h-2 !border-2">
                <div 
                  className="pop-progress-bar !border-r-2"
                  style={{ width: `${day.total > 0 ? (day.completed / day.total) * 100 : 0}%` }}
                />
              </div>
              <p className="text-xs font-bold text-pop-black/60">
                {day.completed}/{day.total}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="pop-card bg-pop-blue !text-white">
          <p className="text-sm font-bold text-white/80 mb-1">本周完成任务</p>
          <p className="text-3xl font-black">{weekData.reduce((acc, d) => acc + d.completed, 0)}</p>
        </div>
        <div className="pop-card bg-pop-green !text-white">
          <p className="text-sm font-bold text-white/80 mb-1">平均完成率</p>
          <p className="text-3xl font-black">
            {Math.round(weekData.reduce((acc, d) => acc + (d.completed / d.total), 0) / 7 * 100)}%
          </p>
        </div>
        <div className="pop-card bg-pop-red !text-white">
          <p className="text-sm font-bold text-white/80 mb-1">完美天数</p>
          <p className="text-3xl font-black">
            {weekData.filter(d => d.completed === d.total).length}
          </p>
        </div>
      </div>

      {/* Weekly Tasks Summary */}
      <div className="pop-card">
        <h3 className="font-black text-xl text-pop-black mb-4 flex items-center gap-2">
          <Target className="w-6 h-6 text-pop-blue" />
          本周任务概览
        </h3>
        <div className="space-y-3">
          {[
            { name: '主线任务', count: tasks.filter(task => task.category === 'main').length, color: 'bg-pop-yellow', icon: Target },
            { name: '支线任务', count: tasks.filter(task => task.category === 'side').length, color: 'bg-pop-blue', icon: TrendingUp },
            { name: '日常任务', count: tasks.filter(task => task.category === 'daily').length, color: 'bg-pop-green', icon: Calendar },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.name} className="flex items-center gap-3 bg-white border-3 border-pop-black rounded-pop p-3">
                <div className={cn("w-10 h-10 rounded-pop border-3 border-pop-black flex items-center justify-center", item.color)}>
                  <Icon className={cn("w-5 h-5", item.color === 'bg-pop-yellow' ? "text-pop-black" : "text-white")} />
                </div>
                <span className="flex-1 font-bold text-pop-black">{item.name}</span>
                <span className="pop-tag bg-pop-yellow font-black">{item.count}个</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderMonthView = () => (
    <div className="space-y-6">
      {/* Month Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: '完成天数', value: '0/0', icon: Calendar, color: 'bg-pop-yellow' },
          { label: '平均完成率', value: `${completionRate.toFixed(0)}%`, icon: TrendingUp, color: 'bg-pop-green' },
          { label: '主线完成', value: `${tasks.filter(task => task.category === 'main' && task.completed).length}/${tasks.filter(task => task.category === 'main').length}`, icon: Target, color: 'bg-pop-blue' },
          { label: '专注时长', value: '0h', icon: Sparkles, color: 'bg-pop-red' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="pop-card">
              <div className="flex items-center gap-2 mb-2">
                <div className={cn("w-10 h-10 rounded-pop border-3 border-pop-black flex items-center justify-center", stat.color)}>
                  <Icon className="w-5 h-5 text-pop-black" />
                </div>
                <span className="text-sm font-bold text-pop-black/60">{stat.label}</span>
              </div>
              <p className="text-2xl font-black text-pop-black">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Heatmap */}
      <div className="pop-card">
        <h3 className="font-black text-xl text-pop-black mb-4 flex items-center gap-2">
          <Flame className="w-6 h-6 text-pop-red" />
          本月完成度热力图
        </h3>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 30 }, (_, i) => (
            <div 
              key={i}
              className={cn(
                "aspect-square rounded-pop border-3 border-pop-black",
                getHeatmapColor(i)
              )}
              title={`${i + 1}日`}
            />
          ))}
        </div>
        <div className="flex items-center justify-end gap-2 mt-4 text-sm font-bold text-pop-black/60">
          <span>低</span>
          <div className="flex gap-1">
            <div className="w-6 h-6 bg-white border-2 border-pop-black/20 rounded-pop" />
            <div className="w-6 h-6 bg-pop-yellow/50 border-2 border-pop-black rounded-pop" />
            <div className="w-6 h-6 bg-pop-yellow border-2 border-pop-black rounded-pop" />
            <div className="w-6 h-6 bg-pop-orange border-2 border-pop-black rounded-pop" />
            <div className="w-6 h-6 bg-pop-red border-2 border-pop-black rounded-pop" />
          </div>
          <span>高</span>
        </div>
      </div>

      {/* Monthly Progress */}
      <div className="pop-card">
        <h3 className="font-black text-xl text-pop-black mb-4">任务类型分布</h3>
        <div className="space-y-4">
          {[
            { name: '主线任务', completed: tasks.filter(task => task.category === 'main' && task.completed).length, total: tasks.filter(task => task.category === 'main').length, color: 'bg-pop-yellow' },
            { name: '支线任务', completed: tasks.filter(task => task.category === 'side' && task.completed).length, total: tasks.filter(task => task.category === 'side').length, color: 'bg-pop-blue' },
            { name: '日常任务', completed: tasks.filter(task => task.category === 'daily' && task.completed).length, total: tasks.filter(task => task.category === 'daily').length, color: 'bg-pop-green' },
          ].map((item) => (
            <div key={item.name}>
              <div className="flex justify-between text-sm font-bold mb-2">
                <span className="text-pop-black">{item.name}</span>
                <span className="text-pop-black/60">{item.completed}/{item.total}</span>
              </div>
              <div className="pop-progress">
                <div 
                  className={cn("pop-progress-bar", item.color)}
                  style={{ width: `${item.total > 0 ? (item.completed / item.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {showAnimation && (
        <PointsAnimation 
          points={lastPoints} 
          onComplete={() => setShowAnimation(false)} 
        />
      )}

      {/* Header with View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="pop-title flex items-center gap-3">
            <Target className="w-8 h-8 text-pop-red" />
            任务
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="pop-tag bg-pop-yellow">
              已完成 {completedCount}/{totalCount}
            </span>
            <span className="pop-tag bg-pop-green text-white">
              完成率 {completionRate.toFixed(0)}%
            </span>
          </div>
        </div>
        
        {/* Date picker and view mode switcher - 波普艺术风格 */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={openNativeDatePicker}
              className="flex cursor-pointer items-center gap-2 rounded-pop border-4 border-pop-black bg-white px-4 py-2 font-black text-pop-black shadow-pop-sm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop"
              aria-label="打开系统日历选择任务日期"
            >
              <Calendar className="h-5 w-5 text-pop-red" />
              <span>{selectedDateLabel}</span>
            </button>
            <input
              ref={dateInputRef}
              aria-label="选择任务日期"
              className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
              tabIndex={-1}
              type="date"
              value={selectedDateKey}
              onChange={(event) => setSelectedDateKey(event.target.value || getLocalDateKey())}
            />
          </div>
          <div className="pop-switch">
            {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  "pop-switch-btn",
                  viewMode === mode && "active"
                )}
              >
                {mode === 'day' ? '天' : mode === 'week' ? '周' : '月'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* View Content */}
      <div className="animate-pop-in">
        {viewMode === 'day' && renderDayView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'month' && renderMonthView()}
      </div>
    </div>
  );
}
