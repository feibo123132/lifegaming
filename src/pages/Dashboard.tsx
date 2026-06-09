import { 
  Target, 
  TrendingUp, 
  Zap, 
  Award,
  Moon,
  Dumbbell,
  Utensils,
  Video,
  Star,
  Flame,
  Sparkles,
  Crown
} from 'lucide-react';
import { ProgressRing } from '../components/ProgressRing';
import { currentUser, sleepRecords, exerciseRecords, dietRecords, videoProjects } from '../data/mockData';
import { cn, formatDate } from '../utils/helpers';
import { useGameStore } from '../store/useGameStore';

export function Dashboard() {
  const tasks = useGameStore((state) => state.tasks);
  const userPoints = useGameStore((state) => state.userPoints);
  const isSyncing = useGameStore((state) => state.isSyncing);
  const syncError = useGameStore((state) => state.syncError);
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  const todaySleep = sleepRecords[sleepRecords.length - 1];
  const stats = [
    { label: '今日任务', value: `${completedTasks}/${totalTasks}`, icon: Target, color: 'bg-pop-blue', iconColor: 'text-white' },
    { label: '可用积分', value: userPoints.toString(), icon: Zap, color: 'bg-pop-yellow', iconColor: 'text-pop-black' },
    { label: '连续打卡', value: `${currentUser.streak}天`, icon: TrendingUp, color: 'bg-pop-green', iconColor: 'text-white' },
    { label: '本周排名', value: '暂无', icon: Award, color: 'bg-pop-purple', iconColor: 'text-white' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="pop-title">欢迎回来，{currentUser.name}！</h2>
            <span className="text-3xl animate-bounce">👋</span>
          </div>
          <p className="text-pop-black/70 font-bold mt-1">{formatDate(new Date())}</p>
          <p className={cn("mt-2 text-sm font-black", syncError ? "text-pop-red" : "text-pop-black/50")}>
            {syncError ? `云端同步异常：${syncError}` : isSyncing ? '正在同步云端数据...' : '云端同步已就绪'}
          </p>
        </div>
        <div className="pop-tag-yellow text-lg">
          <Flame className="w-5 h-5 mr-1 inline" />
          连续 {currentUser.streak} 天
        </div>
      </div>

      {/* Main Stats Card - Level & Progress */}
      <div className="pop-card bg-pop-yellow p-6 relative overflow-hidden">
        {/* 装饰元素 */}
        <div className="absolute top-4 right-4 opacity-20">
          <Crown className="w-24 h-24 text-pop-black" />
        </div>
        <div className="absolute -bottom-4 -left-4 opacity-10">
          <Star className="w-32 h-32 text-pop-black fill-pop-black" />
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-3">
              <div className="pop-tag bg-pop-black text-pop-yellow text-lg">
                <Crown className="w-5 h-5 mr-1" />
                当前等级
              </div>
            </div>
            <p className="text-4xl font-black text-pop-black">Lv.{currentUser.level} 进阶玩家</p>
            <div className="bg-white border-4 border-pop-black rounded-pop p-4 inline-block">
              <p className="text-pop-black font-bold">距离下一级还需</p>
              <p className="text-2xl font-black text-pop-red">{currentUser.maxExp - currentUser.exp} 经验值</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <ProgressRing progress={taskProgress} size={160} strokeWidth={12}>
              <div className="text-center">
                <p className="text-5xl font-black text-pop-black">{completedTasks}</p>
                <p className="text-sm font-bold text-pop-black/60">已完成</p>
              </div>
            </ProgressRing>
            <div className="mt-3 pop-tag-yellow">
              <Sparkles className="w-4 h-4 mr-1 inline" />
              今日进度 {taskProgress.toFixed(0)}%
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index}
              className="pop-card p-5 hover:scale-[1.02]"
            >
              <div className={cn("pop-icon-box mb-3", stat.color)}>
                <Icon className={cn("w-6 h-6", stat.iconColor)} />
              </div>
              <p className="text-3xl font-black text-pop-black">{stat.value}</p>
              <p className="text-sm font-bold text-pop-black/60">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Health Overview */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Sleep */}
        <div className="pop-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="pop-icon-box bg-pop-purple">
              <Moon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-black text-lg text-pop-black">睡眠</h3>
              <p className="text-sm font-bold text-pop-black/60">昨晚 {todaySleep?.duration || 0} 小时</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm font-bold">
              <span className="text-pop-black/70">质量评分</span>
              <span className="font-black text-pop-purple">{todaySleep?.quality || 0}分</span>
            </div>
            <div className="pop-progress">
              <div 
                className="pop-progress-bar bg-pop-purple"
                style={{ width: `${todaySleep?.quality || 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Exercise */}
        <div className="pop-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="pop-icon-box bg-pop-green">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-black text-lg text-pop-black">运动</h3>
              <p className="text-sm font-bold text-pop-black/60">本周 {exerciseRecords.length} 次</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm font-bold">
              <span className="text-pop-black/70">本周达标</span>
              <span className="font-black text-pop-green">{Math.min(exerciseRecords.length * 20, 100)}%</span>
            </div>
            <div className="pop-progress">
              <div 
                className="pop-progress-bar bg-pop-green"
                style={{ width: `${Math.min(exerciseRecords.length * 20, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Diet */}
        <div className="pop-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="pop-icon-box bg-pop-orange">
              <Utensils className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-black text-lg text-pop-black">饮食</h3>
              <p className="text-sm font-bold text-pop-black/60">今日 {dietRecords.length} 餐记录</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm font-bold">
              <span className="text-pop-black/70">营养均衡</span>
              <span className="font-black text-pop-orange">良好</span>
            </div>
            <div className="pop-progress">
              <div className="pop-progress-bar bg-pop-orange w-4/5" />
            </div>
          </div>
        </div>
      </div>

      {/* Video Progress */}
      <div className="pop-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="pop-icon-box bg-pop-red">
            <Video className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-black text-lg text-pop-black">视频项目进度</h3>
            <p className="text-sm font-bold text-pop-black/60">暂无视频目标</p>
          </div>
          <div className="pop-tag-red">
            <Flame className="w-4 h-4 mr-1 inline" />
            0%
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-sm font-bold">
            <span className="text-pop-black/70">已创建 {videoProjects.length} 条视频项目</span>
            <span className="font-black text-pop-red">0/0</span>
          </div>
          <div className="pop-progress h-6">
            <div 
              className="pop-progress-bar bg-pop-red"
              style={{ width: '0%' }}
            />
          </div>
        </div>
        
        {/* 阶段指示器 */}
        <div className="flex justify-between mt-4">
          {['选题', '脚本', '拍摄', '剪辑', '发布'].map((stage, i) => (
            <div key={stage} className="flex flex-col items-center">
              <div className={cn(
                "w-8 h-8 rounded-full border-3 border-pop-black flex items-center justify-center font-bold text-sm",
                "bg-white text-pop-black/40"
              )}>
                {i + 1}
              </div>
              <span className={cn(
                "text-xs font-bold mt-1",
                "text-pop-black/40"
              )}>{stage}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="pop-card bg-pop-blue p-5">
        <h3 className="font-black text-xl text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-6 h-6" />
          快速行动
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Target, label: '查看任务', color: 'bg-pop-yellow' },
            { icon: Moon, label: '记录睡眠', color: 'bg-pop-purple' },
            { icon: Dumbbell, label: '记录运动', color: 'bg-pop-green' },
            { icon: Utensils, label: '记录饮食', color: 'bg-pop-orange' },
          ].map((action, i) => {
            const Icon = action.icon;
            return (
              <button
                key={i}
                className="pop-btn !shadow-pop-sm hover:!shadow-pop flex flex-col items-center gap-2 !py-4"
              >
                <div className={cn("w-12 h-12 rounded-pop border-3 border-pop-black flex items-center justify-center", action.color)}>
                  <Icon className="w-6 h-6 text-pop-black" />
                </div>
                <span className="font-bold text-sm">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
