import { useState } from 'react';
import { 
  Moon, 
  Utensils, 
  Dumbbell, 
  Video, 
  Upload, 
  Plus,
  Clock,
  Flame,
  Activity,
  Camera,
  Star,
  Trophy
} from 'lucide-react';
import { cn } from '../utils/helpers';
import { sleepRecords, dietRecords, exerciseRecords, videoProjects } from '../data/mockData';
import { getThemeCopy } from '../lib/theme';
import { useThemeMode } from '../lib/themeContext';

type DataTab = 'sleep' | 'diet' | 'exercise' | 'video';

export function DataRecord() {
  const themeMode = useThemeMode();
  const copy = getThemeCopy(themeMode);
  const [activeTab, setActiveTab] = useState<DataTab>('sleep');

  const tabs = [
    { id: 'sleep' as DataTab, label: '睡眠', icon: Moon, color: 'bg-pop-purple', bgColor: 'bg-pop-purple/20' },
    { id: 'diet' as DataTab, label: '饮食', icon: Utensils, color: 'bg-pop-orange', bgColor: 'bg-pop-orange/20' },
    { id: 'exercise' as DataTab, label: '运动', icon: Dumbbell, color: 'bg-pop-green', bgColor: 'bg-pop-green/20' },
    { id: 'video' as DataTab, label: '视频', icon: Video, color: 'bg-pop-red', bgColor: 'bg-pop-red/20' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="pop-title flex items-center gap-3">
            <Trophy className="w-8 h-8 text-pop-red" />
            {copy.dataTitle}
          </h2>
          <p className="text-pop-black/70 font-bold mt-1">记录你的生活数据，追踪健康习惯</p>
        </div>
        <div className="pop-tag bg-pop-yellow">
          <Star className="w-4 h-4 mr-1 inline" />
          连续记录 0 天
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-3 rounded-pop border-4 font-bold transition-all whitespace-nowrap shadow-pop-sm",
                isActive
                  ? `${tab.color} text-white border-pop-black`
                  : "bg-white text-pop-black border-pop-black hover:shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-pop border-3 border-pop-black flex items-center justify-center",
                isActive ? "bg-white" : tab.color
              )}>
                <Icon className={cn("w-4 h-4", isActive ? "text-pop-black" : "text-white")} />
              </div>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sleep Tab */}
      {activeTab === 'sleep' && (
        <div className="space-y-4">
          {/* Upload Card */}
          <div className="pop-card bg-pop-purple/10 border-dashed border-4 !border-pop-purple">
            <div className="text-center py-8">
              <div className="pop-icon-box bg-pop-purple w-20 h-20 mx-auto mb-4">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-black text-xl text-pop-black mb-2">上传睡眠截图</h3>
              <p className="text-pop-black/60 font-bold mb-6">支持自动识别睡眠时长、深睡比例等数据</p>
              <button className="pop-btn-blue">
                <Upload className="w-5 h-5 inline mr-2" />
                选择图片
              </button>
            </div>
          </div>

          {/* Recent Records */}
          <div className="pop-card">
            <h3 className="font-black text-xl text-pop-black mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-pop-purple" />
              最近7天睡眠记录
            </h3>
            <div className="space-y-3">
              {sleepRecords.length === 0 && (
                <p className="py-6 text-center font-bold text-pop-black/50">暂无睡眠记录</p>
              )}
              {sleepRecords.map((record) => (
                <div 
                  key={record.id}
                  className="pop-list-item !mb-2 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="pop-icon-box bg-pop-purple w-12 h-12">
                      <Moon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-pop-black">{record.date}</p>
                      <p className="text-sm font-bold text-pop-black/60">深睡 {record.deepSleep} 小时</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-2xl text-pop-black">{record.duration}h</p>
                    <p className={cn(
                      "pop-tag text-xs !px-2 !py-0.5",
                      record.quality >= 85 ? "bg-pop-green text-white" : 
                      record.quality >= 70 ? "bg-pop-yellow" : "bg-pop-red text-white"
                    )}>
                      {record.quality}分
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sleep Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: '平均睡眠', value: '0', unit: 'h', color: 'bg-pop-purple' },
              { label: '平均深睡', value: '0', unit: 'h', color: 'bg-pop-blue' },
              { label: '平均质量', value: '0', unit: '分', color: 'bg-pop-green' },
            ].map((stat, i) => (
              <div key={i} className="pop-card text-center !p-4">
                <p className="text-sm font-bold text-pop-black/60 mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-pop-black">
                  {stat.value}<span className="text-lg">{stat.unit}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Diet Tab */}
      {activeTab === 'diet' && (
        <div className="space-y-4">
          {/* Today's Meals */}
          <div className="pop-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-xl text-pop-black flex items-center gap-2">
                <Utensils className="w-6 h-6 text-pop-orange" />
                今日饮食
              </h3>
              <button className="pop-btn-green !py-2 !px-4">
                <Plus className="w-4 h-4 inline mr-1" />
                添加记录
              </button>
            </div>
            
            <div className="space-y-3">
              {dietRecords.length === 0 && (
                <p className="py-6 text-center font-bold text-pop-black/50">暂无饮食记录</p>
              )}
              {dietRecords.map((record) => (
                <div 
                  key={record.id}
                  className="pop-list-item !mb-2 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="pop-icon-box bg-pop-orange w-12 h-12">
                      <Utensils className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-pop-black">
                        {record.meal === 'breakfast' ? '🌅 早餐' : 
                         record.meal === 'lunch' ? '☀️ 午餐' : '🌙 晚餐'}
                      </p>
                      <p className="text-sm font-bold text-pop-black/60">
                        蛋白质{record.protein}g · 碳水{record.carbs}g · 脂肪{record.fat}g
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-2xl text-pop-orange">{record.calories}</p>
                    <p className="text-xs font-bold text-pop-black/60">kcal</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-4 pt-4 border-t-4 border-pop-black/10">
              <div className="flex justify-between items-center">
                <span className="font-bold text-pop-black text-lg">今日摄入</span>
                <span className="pop-tag bg-pop-orange text-white text-xl font-black">
                  {dietRecords.reduce((sum, r) => sum + r.calories, 0)} kcal
                </span>
              </div>
            </div>
          </div>

          {/* Upload Photo */}
          <div className="pop-card bg-pop-orange/10 border-dashed border-4 !border-pop-orange">
            <div className="text-center py-6">
              <div className="pop-icon-box bg-pop-orange w-16 h-16 mx-auto mb-3">
                <Camera className="w-7 h-7 text-white" />
              </div>
              <p className="font-bold text-pop-black">拍照记录饮食</p>
              <p className="text-sm text-pop-black/60">自动估算卡路里</p>
            </div>
          </div>
        </div>
      )}

      {/* Exercise Tab */}
      {activeTab === 'exercise' && (
        <div className="space-y-4">
          {/* Add Exercise */}
          <div className="pop-card">
            <h3 className="font-black text-xl text-pop-black mb-4 flex items-center gap-2">
              <Activity className="w-6 h-6 text-pop-green" />
              记录运动
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { name: '跑步', icon: '🏃', color: 'bg-pop-blue' },
                { name: '力量训练', icon: '💪', color: 'bg-pop-red' },
                { name: '游泳', icon: '🏊', color: 'bg-pop-cyan' },
                { name: '骑行', icon: '🚴', color: 'bg-pop-green' },
                { name: '瑜伽', icon: '🧘', color: 'bg-pop-purple' },
                { name: '其他', icon: '⚡', color: 'bg-pop-orange' },
              ].map((type) => (
                <button
                  key={type.name}
                  className="pop-card !p-4 text-left hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-pop border-3 border-pop-black flex items-center justify-center text-xl", type.color)}>
                      {type.icon}
                    </div>
                    <span className="font-bold text-pop-black">{type.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Exercises */}
          <div className="pop-card">
            <h3 className="font-black text-xl text-pop-black mb-4">最近运动</h3>
            <div className="space-y-3">
              {exerciseRecords.length === 0 && (
                <p className="py-6 text-center font-bold text-pop-black/50">暂无运动记录</p>
              )}
              {exerciseRecords.map((record) => (
                <div 
                  key={record.id}
                  className="pop-list-item !mb-2 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="pop-icon-box bg-pop-green w-12 h-12">
                      <Dumbbell className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-pop-black">{record.type}</p>
                      <p className="text-sm font-bold text-pop-black/60">{record.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-2xl text-pop-black">{record.duration}分钟</p>
                    <p className="pop-tag bg-pop-green text-white text-xs">
                      <Flame className="w-3 h-3 inline mr-1" />
                      {record.calories} kcal
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Goal */}
          <div className="pop-card bg-pop-green !text-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black text-lg flex items-center gap-2">
                <Trophy className="w-6 h-6" />
                本周运动目标
              </h3>
              <span className="pop-tag bg-white text-pop-green font-black">0/5 次</span>
            </div>
            <div className="pop-progress bg-white/30 !border-white">
              <div className="pop-progress-bar bg-white !border-white" style={{ width: '0%' }} />
            </div>
            <p className="font-bold mt-3">还没有运动记录。</p>
          </div>
        </div>
      )}

      {/* Video Tab */}
      {activeTab === 'video' && (
        <div className="space-y-4">
          {/* New Project */}
          <button className="w-full pop-card bg-pop-red/10 border-dashed border-4 !border-pop-red hover:scale-[1.01]">
            <div className="text-center py-6">
              <div className="pop-icon-box bg-pop-red w-16 h-16 mx-auto mb-3">
                <Plus className="w-7 h-7 text-white" />
              </div>
              <p className="font-black text-xl text-pop-black">新建视频项目</p>
            </div>
          </button>

          {/* Projects */}
          <div className="space-y-4">
            {videoProjects.length === 0 && (
              <p className="py-6 text-center font-bold text-pop-black/50">暂无视频项目</p>
            )}
            {videoProjects.map((project) => (
              <div key={project.id} className="pop-card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-black text-lg text-pop-black">{project.title}</h3>
                    <p className="text-sm font-bold text-pop-black/60">截止日期: {project.deadline}</p>
                  </div>
                  <span className={cn(
                    "pop-tag",
                    project.stage === 'publish' ? "bg-pop-green text-white" :
                    project.stage === 'edit' ? "bg-pop-blue text-white" :
                    project.stage === 'shoot' ? "bg-pop-purple text-white" :
                    project.stage === 'script' ? "bg-pop-yellow" :
                    "bg-pop-black text-white"
                  )}>
                    {project.stage === 'idea' ? '💡 选题' :
                     project.stage === 'script' ? '📝 脚本' :
                     project.stage === 'shoot' ? '🎬 拍摄' :
                     project.stage === 'edit' ? '✂️ 剪辑' : '🚀 发布'}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-pop-black/60">项目进度</span>
                    <span className="font-black text-pop-red">{project.progress}%</span>
                  </div>
                  <div className="pop-progress">
                    <div 
                      className="pop-progress-bar bg-pop-red"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* 阶段指示器 */}
                <div className="flex gap-2 mt-4">
                  {['选题', '脚本', '拍摄', '剪辑', '发布'].map((stage, index) => (
                    <div key={stage} className="flex-1 text-center">
                      <div 
                        className={cn(
                          "h-2 rounded-full mb-1",
                          index < ['idea', 'script', 'shoot', 'edit', 'publish'].indexOf(project.stage) + 1
                            ? "bg-pop-green"
                            : "bg-pop-black/10"
                        )}
                      />
                      <span className="text-xs font-bold text-pop-black/60">{stage}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
