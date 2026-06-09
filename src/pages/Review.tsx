import { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Target,
  Clock,
  Zap,
  Award,
  Download,
  Share2,
  Star,
  Crown,
  Flame,
  TrendingUp as TrendIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { cn } from '../utils/helpers';
import { weeklyReports } from '../data/mockData';

const trendData = [
  { day: '周一', points: 85, tasks: 5 },
  { day: '周二', points: 120, tasks: 7 },
  { day: '周三', points: 95, tasks: 6 },
  { day: '周四', points: 140, tasks: 8 },
  { day: '周五', points: 110, tasks: 6 },
  { day: '周六', points: 160, tasks: 9 },
  { day: '周日', points: 130, tasks: 7 },
];

const timeDistribution = [
  { name: '工作', value: 40, color: '#4834DF' },
  { name: '运动', value: 20, color: '#2ED573' },
  { name: '学习', value: 25, color: '#A55EEA' },
  { name: '休息', value: 15, color: '#FF6B35' },
];

export function Review() {
  const [selectedWeek, setSelectedWeek] = useState(0);

  const currentReport = weeklyReports[selectedWeek];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="pop-title flex items-center gap-3">
            <Crown className="w-8 h-8 text-pop-purple" />
            复盘中心
          </h2>
          <p className="text-pop-black/70 font-bold mt-1">虾教头为你生成的游戏周报</p>
        </div>
        <div className="flex gap-3">
          <button className="pop-btn !py-2 !px-4">
            <Share2 className="w-4 h-4 inline mr-1" />
            分享
          </button>
          <button className="pop-btn-blue !py-2 !px-4">
            <Download className="w-4 h-4 inline mr-1" />
            导出周报
          </button>
        </div>
      </div>

      {/* Week Selector */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {weeklyReports.map((report, index) => (
          <button
            key={index}
            onClick={() => setSelectedWeek(index)}
            className={cn(
              "px-5 py-3 rounded-pop border-4 font-bold whitespace-nowrap transition-all shadow-pop-sm",
              selectedWeek === index
                ? "bg-pop-black text-pop-yellow border-pop-black"
                : "bg-white text-pop-black border-pop-black hover:shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5"
            )}
          >
            <Calendar className="w-4 h-4 inline mr-1" />
            {report.week}
          </button>
        ))}
      </div>

      {/* Weekly Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: '完成任务', 
            value: `${currentReport.completedTasks}/${currentReport.totalTasks}`,
            sub: `${Math.round((currentReport.completedTasks / currentReport.totalTasks) * 100)}% 完成率`,
            icon: Target, 
            color: 'bg-pop-blue' 
          },
          { 
            label: '获得积分', 
            value: currentReport.totalPoints.toString(),
            sub: `+${currentReport.totalPoints - (weeklyReports[selectedWeek - 1]?.totalPoints || 400)} 较上周`,
            icon: Zap, 
            color: 'bg-pop-yellow' 
          },
          { 
            label: '睡眠达标', 
            value: `${currentReport.sleepDays}天`,
            sub: '本周目标 7 天',
            icon: Clock, 
            color: 'bg-pop-purple' 
          },
          { 
            label: '运动次数', 
            value: `${currentReport.exerciseDays}次`,
            sub: '本周目标 5 次',
            icon: Award, 
            color: 'bg-pop-green' 
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="pop-card !p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className={cn("pop-icon-box w-10 h-10", stat.color)}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-bold text-pop-black/60">{stat.label}</span>
              </div>
              <p className="text-2xl font-black text-pop-black">{stat.value}</p>
              <p className={cn(
                "text-sm font-bold",
                stat.sub.includes('+') ? "text-pop-green" : "text-pop-black/60"
              )}>{stat.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Points Trend */}
        <div className="pop-card">
          <h3 className="font-black text-xl text-pop-black mb-4 flex items-center gap-2">
            <TrendIcon className="w-6 h-6 text-pop-yellow" />
            积分趋势
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FFD93D" />
                <XAxis dataKey="day" stroke="#1A1A1A" fontSize={12} fontWeight="bold" />
                <YAxis stroke="#1A1A1A" fontSize={12} fontWeight="bold" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFD93D', 
                    border: '4px solid #1A1A1A',
                    borderRadius: '12px',
                    fontWeight: 'bold'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="points" 
                  stroke="#1A1A1A" 
                  strokeWidth={4}
                  dot={{ fill: '#FF4757', stroke: '#1A1A1A', strokeWidth: 3, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Time Distribution */}
        <div className="pop-card">
          <h3 className="font-black text-xl text-pop-black mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-pop-blue" />
            时间分配
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={timeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="#1A1A1A"
                  strokeWidth={3}
                >
                  {timeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFD93D', 
                    border: '4px solid #1A1A1A',
                    borderRadius: '12px',
                    fontWeight: 'bold'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {timeDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-1">
                <div 
                  className="w-4 h-4 rounded-pop border-2 border-pop-black" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-bold text-pop-black">{item.name} {item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Comparison */}
      <div className="pop-card">
        <h3 className="font-black text-xl text-pop-black mb-4 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-pop-green" />
          各周对比
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyReports}>
              <CartesianGrid strokeDasharray="3 3" stroke="#FFD93D" />
              <XAxis dataKey="week" stroke="#1A1A1A" fontSize={12} fontWeight="bold" />
              <YAxis stroke="#1A1A1A" fontSize={12} fontWeight="bold" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#FFD93D', 
                  border: '4px solid #1A1A1A',
                  borderRadius: '12px',
                  fontWeight: 'bold'
                }}
              />
              <Bar dataKey="completedTasks" fill="#4834DF" name="已完成" radius={[8, 8, 0, 0]} stroke="#1A1A1A" strokeWidth={3} />
              <Bar dataKey="totalTasks" fill="#E5E7EB" name="总任务" radius={[8, 8, 0, 0]} stroke="#1A1A1A" strokeWidth={3} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* NPC Review */}
      <div className="pop-card bg-pop-yellow">
        <div className="flex items-start gap-4">
          <div className="pop-icon-box bg-pop-red w-16 h-16 flex-shrink-0">
            <span className="text-4xl">🦞</span>
          </div>
          <div className="flex-1">
            <h3 className="font-black text-xl text-pop-black mb-3 flex items-center gap-2">
              <Star className="w-6 h-6 text-pop-red fill-pop-red" />
              虾教头的本周点评
            </h3>
            <p className="text-pop-black font-bold leading-relaxed text-lg">
              这一周你的表现不错！完成了 <span className="text-pop-red">{currentReport.completedTasks}</span> 个任务，
              获得了 <span className="text-pop-red">{currentReport.totalPoints}</span> 积分。
              不过我发现你定的每周运动五次的目标，实际上只完成了 <span className="text-pop-red">{currentReport.exerciseDays}</span> 次。
              建议不用追求强度，先把运动的次数稳定下来。保持这个节奏，下周争取突破！💪
            </p>
            <div className="flex gap-3 mt-4 flex-wrap">
              <span className="pop-tag bg-pop-blue text-white">
                <Target className="w-4 h-4 inline mr-1" />
                任务完成率 {Math.round((currentReport.completedTasks / currentReport.totalTasks) * 100)}%
              </span>
              <span className="pop-tag bg-pop-green text-white">
                <Clock className="w-4 h-4 inline mr-1" />
                睡眠达标 {currentReport.sleepDays}天
              </span>
              <span className="pop-tag bg-pop-yellow">
                <Flame className="w-4 h-4 inline mr-1" />
                运动 {currentReport.exerciseDays}次
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Improvement Suggestions */}
      <div className="pop-card">
        <h3 className="font-black text-xl text-pop-black mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-pop-green" />
          改进建议
        </h3>
        <div className="space-y-3">
          {[
            { title: '增加运动频率', desc: '建议每天安排30分钟运动，可以从简单的散步开始', priority: 'high', color: 'bg-pop-red' },
            { title: '保持睡眠规律', desc: '睡眠时间逐渐稳定在7-8小时，提高睡眠质量', priority: 'medium', color: 'bg-pop-yellow' },
            { title: '优化任务分配', desc: '将大任务拆分为小目标，更容易获得成就感', priority: 'low', color: 'bg-pop-green' },
          ].map((suggestion, index) => (
            <div key={index} className="pop-list-item !mb-2 flex items-start gap-3">
              <div className={cn("w-4 h-4 rounded-full mt-1 border-2 border-pop-black", suggestion.color)} />
              <div>
                <h4 className="font-black text-pop-black text-lg">{suggestion.title}</h4>
                <p className="font-bold text-pop-black/60">{suggestion.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
