import { useState } from 'react';
import { Check, Calendar, Target, Sparkles, TrendingUp, Star, Flame } from 'lucide-react';
import { cn, CATEGORY_LABELS, getWeekDates } from '../utils/helpers';
import { initialTasks } from '../data/mockData';
import type { Task, ViewMode } from '../types';
import { PointsAnimation } from '../components/PointsAnimation';

type CategoryFilter = 'all' | 'main' | 'side' | 'daily';

export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [showAnimation, setShowAnimation] = useState(false);
  const [lastPoints, setLastPoints] = useState(0);

  const filteredTasks = tasks.filter(task => 
    categoryFilter === 'all' || task.category === categoryFilter
  );

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const newCompleted = !task.completed;
        if (newCompleted && !task.completed) {
          setLastPoints(task.points);
          setShowAnimation(true);
        }
        return { 
          ...task, 
          completed: newCompleted,
          completedAt: newCompleted ? new Date() : undefined
        };
      }
      return task;
    }));
  };

  const weekDates = getWeekDates();

  // Mock week data
  const weekData = weekDates.map((date, index) => ({
    date,
    completed: [3, 5, 4, 6, 2, 5, completedCount][index] || 4,
    total: 7,
    isToday: date.toDateString() === new Date().toDateString(),
  }));

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
      {/* Category Filter */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {([
          { key: 'all', label: '全部', color: 'bg-pop-black text-white' },
          { key: 'main', label: '主线', color: 'bg-pop-blue text-white' },
          { key: 'side', label: '支线', color: 'bg-pop-green text-white' },
          { key: 'daily', label: '日常', color: 'bg-pop-purple text-white' },
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
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            onClick={() => toggleTask(task.id)}
            className={cn(
              "pop-list-item cursor-pointer",
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
                    task.category === 'main' && "bg-pop-blue text-white",
                    task.category === 'side' && "bg-pop-green text-white",
                    task.category === 'daily' && "bg-pop-purple text-white"
                  )}>
                    {CATEGORY_LABELS[task.category]}
                  </span>
                  {task.completed && (
                    <span className="pop-tag-yellow text-xs flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      +{task.points}积分
                    </span>
                  )}
                </div>
                <p className={cn(
                  "font-bold text-lg transition-colors",
                  task.completed ? "text-pop-black/40 line-through" : "text-pop-black"
                )}>
                  {task.title}
                </p>
              </div>

              <div className="text-right">
                <div className={cn(
                  "pop-tag text-base",
                  task.completed ? "bg-pop-green text-white" : "bg-pop-yellow"
                )}>
                  <Star className="w-4 h-4 mr-1 inline" />
                  {task.points}分
                </div>
              </div>
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
              day.isToday && "bg-pop-yellow ring-4 ring-pop-red"
            )}
          >
            <p className="text-xs font-bold text-pop-black/60 mb-1">
              {['一', '二', '三', '四', '五', '六', '日'][index]}
            </p>
            <p className={cn(
              "text-xl font-black mb-2",
              day.isToday ? "text-pop-red" : "text-pop-black"
            )}>
              {day.date.getDate()}
            </p>
            <div className="space-y-1">
              <div className="pop-progress h-2 !border-2">
                <div 
                  className="pop-progress-bar !border-r-2"
                  style={{ width: `${(day.completed / day.total) * 100}%` }}
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
            { name: '主线任务', count: 5, color: 'bg-pop-blue', icon: Target },
            { name: '支线任务', count: 12, color: 'bg-pop-green', icon: TrendingUp },
            { name: '日常任务', count: 21, color: 'bg-pop-purple', icon: Calendar },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.name} className="flex items-center gap-3 bg-white border-3 border-pop-black rounded-pop p-3">
                <div className={cn("w-10 h-10 rounded-pop border-3 border-pop-black flex items-center justify-center", item.color)}>
                  <Icon className="w-5 h-5 text-white" />
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
          { label: '完成天数', value: '22/30', icon: Calendar, color: 'bg-pop-yellow' },
          { label: '平均完成率', value: '78%', icon: TrendingUp, color: 'bg-pop-green' },
          { label: '主线完成', value: '8/10', icon: Target, color: 'bg-pop-blue' },
          { label: '专注时长', value: '45h', icon: Sparkles, color: 'bg-pop-red' },
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
            { name: '主线任务', completed: 8, total: 10, color: 'bg-pop-blue' },
            { name: '支线任务', completed: 18, total: 24, color: 'bg-pop-green' },
            { name: '日常任务', completed: 52, total: 60, color: 'bg-pop-purple' },
          ].map((item) => (
            <div key={item.name}>
              <div className="flex justify-between text-sm font-bold mb-2">
                <span className="text-pop-black">{item.name}</span>
                <span className="text-pop-black/60">{item.completed}/{item.total}</span>
              </div>
              <div className="pop-progress">
                <div 
                  className={cn("pop-progress-bar", item.color)}
                  style={{ width: `${(item.completed / item.total) * 100}%` }}
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
        
        {/* View Mode Switcher - 波普艺术风格 */}
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

      {/* View Content */}
      <div className="animate-pop-in">
        {viewMode === 'day' && renderDayView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'month' && renderMonthView()}
      </div>
    </div>
  );
}
