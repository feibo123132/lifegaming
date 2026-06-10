import { useState } from 'react';
import { 
  LayoutDashboard, 
  ListTodo, 
  BarChart3, 
  MessageCircle, 
  ShoppingBag, 
  PieChart,
  Menu,
  X,
  Flame,
  Sparkles,
  Crown,
  Star,
  LogOut,
  ShieldCheck,
  Pencil,
  Check
} from 'lucide-react';
import { cn } from '../utils/helpers';
import { useAuthStore } from '../store/useAuthStore';
import { useGameStore } from '../store/useGameStore';
import { getPlayerProgress } from '../lib/gameSync';
import type { TabType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const navItems: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: '首页', icon: LayoutDashboard },
  { id: 'tasks', label: '任务', icon: ListTodo },
  { id: 'data', label: '数据记录', icon: BarChart3 },
  { id: 'npc', label: '虾教头', icon: MessageCircle },
  { id: 'shop', label: '积分商城', icon: ShoppingBag },
  { id: 'review', label: '复盘中心', icon: PieChart },
];

export function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const { user, logout } = useAuthStore();
  const tasks = useGameStore((state) => state.tasks);
  const profileName = useGameStore((state) => state.profileName);
  const setProfileName = useGameStore((state) => state.setProfileName);
  const userPoints = useGameStore((state) => state.userPoints);
  const isSyncing = useGameStore((state) => state.isSyncing);
  
  const progress = getPlayerProgress(tasks);
  const progressPercent = (progress.exp / progress.maxExp) * 100;
  const fallbackName = user?.email?.split('@')[0] || '新玩家';
  const displayName = profileName || fallbackName;
  const displayEmail = user?.email || '已完成个人身份认证';

  const handleLogout = async () => {
    if (window.confirm('确定要退出登录吗？')) {
      await logout();
    }
  };

  const startEditingName = () => {
    setNameDraft(displayName);
    setIsEditingName(true);
  };

  const saveProfileName = async () => {
    await setProfileName(nameDraft);
    setIsEditingName(false);
  };

  return (
    <div className="min-h-screen bg-pop-yellow">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b-4 border-pop-black px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="pop-icon-box w-12 h-12 bg-pop-red">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <span className="font-black text-xl text-pop-black">设计人生</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="pop-btn p-2 !px-3 !py-2"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-72 bg-white border-r-4 border-pop-black transition-transform duration-300",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <div className="p-6 h-full overflow-y-auto">
            {/* Logo */}
            <div className="hidden lg:flex items-center gap-3 mb-8">
              <div className="pop-icon-box bg-pop-red w-14 h-14">
                <Flame className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="font-black text-2xl text-pop-black">设计人生</h1>
                <p className="text-sm font-bold text-pop-black/60">游戏化自律系统</p>
              </div>
            </div>

            {/* User Stats Card */}
            <div className="pop-card bg-pop-yellow p-5 mb-6 relative overflow-hidden">
              {/* 装饰性元素 */}
              <div className="absolute top-2 right-2">
                <Star className="w-6 h-6 text-pop-black fill-pop-black" />
              </div>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="pop-icon-box bg-white w-14 h-14 relative">
                  <span className="text-3xl">🦞</span>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-pop-red rounded-full border-2 border-pop-black flex items-center justify-center">
                    <Crown className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="min-w-0">
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        value={nameDraft}
                        onChange={(event) => setNameDraft(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            void saveProfileName();
                          }
                          if (event.key === 'Escape') {
                            setIsEditingName(false);
                          }
                        }}
                        className="min-w-0 flex-1 rounded-pop border-3 border-pop-black bg-white px-2 py-1 text-sm font-black text-pop-black"
                        maxLength={16}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => void saveProfileName()}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pop border-3 border-pop-black bg-pop-green text-white shadow-pop-sm"
                        aria-label="保存昵称"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="min-w-0 truncate font-black text-lg text-pop-black">{displayName}</p>
                      <button
                        type="button"
                        onClick={startEditingName}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-pop border-3 border-pop-black bg-white text-pop-blue shadow-pop-sm transition-all hover:bg-pop-blue hover:text-white"
                        aria-label="编辑昵称"
                        title="编辑昵称"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                  <div className="pop-tag-yellow text-xs !px-2 !py-0.5">
                    Lv.{progress.level} {progress.levelTitle}
                  </div>
                </div>
              </div>

              <div className="mb-4 bg-white border-3 border-pop-black rounded-pop p-3">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-5 h-5 text-pop-green shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs font-black text-pop-black">个人身份认证</p>
                    <p className="text-xs font-bold text-pop-black/60 truncate">{displayEmail}</p>
                    <p className="text-xs font-black text-pop-green">{isSyncing ? '同步中...' : '多端同步已开启'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-3 w-full flex items-center justify-center gap-2 rounded-pop border-3 border-pop-black bg-pop-red px-3 py-2 text-xs font-black text-white shadow-pop-sm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop"
                >
                  <LogOut className="w-4 h-4" />
                  退出登录
                </button>
              </div>
              
              {/* EXP Bar */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm font-bold text-pop-black">
                  <span>经验值</span>
                  <span>{progress.exp}/{progress.maxExp}</span>
                </div>
                <div className="pop-progress h-4">
                  <div 
                    className="pop-progress-bar bg-pop-green transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Points */}
              <div className="flex items-center justify-between bg-white border-3 border-pop-black rounded-pop p-3">
                <span className="font-bold text-pop-black">可用积分</span>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-pop-red" />
                  <span className="font-black text-xl text-pop-red">{userPoints}</span>
                </div>
              </div>

              {/* 连击天数 */}
              <div className="mt-3 flex items-center justify-center gap-2 bg-pop-red text-white font-bold py-2 rounded-pop border-3 border-pop-black">
                <Flame className="w-5 h-5" />
                <span>连续打卡 {progress.streak} 天</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-4 px-5 py-4 rounded-pop border-4 transition-all duration-200 font-bold text-base",
                      isActive
                        ? "bg-pop-black text-pop-yellow border-pop-black shadow-pop-sm"
                        : "bg-white text-pop-black border-pop-black shadow-pop-sm hover:shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-pop flex items-center justify-center border-3 border-pop-black",
                      isActive ? "bg-pop-yellow text-pop-black" : "bg-pop-yellow"
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span>{item.label}</span>
                    {isActive && (
                      <Star className="w-5 h-5 ml-auto fill-pop-yellow" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Footer Decoration */}
            <div className="mt-8 p-4 bg-pop-blue rounded-pop border-4 border-pop-black text-center">
              <p className="text-white font-bold text-sm">🎮 游戏人生</p>
              <p className="text-white/80 text-xs mt-1">让自律变得有趣！</p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto min-h-screen">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-pop-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
