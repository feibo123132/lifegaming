import { useState } from 'react';
import { 
  Sparkles, 
  Check, 
  Lock,
  Gift,
  History,
  Trophy,
  Star,
  Flame,
  ShoppingBag
} from 'lucide-react';
import { cn } from '../utils/helpers';
import { rewards, currentUser } from '../data/mockData';

export function Shop() {
  const [userPoints, setUserPoints] = useState(currentUser.totalPoints);
  const [redeemedIds, setRedeemedIds] = useState<string[]>(
    rewards.filter(r => r.redeemed).map(r => r.id)
  );
  const [showAnimation, setShowAnimation] = useState(false);
  const [lastRedeemed, setLastRedeemed] = useState('');

  const handleRedeem = (rewardId: string, name: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward || redeemedIds.includes(rewardId)) return;

    if (userPoints >= reward.points) {
      setUserPoints(prev => prev - reward.points);
      setRedeemedIds(prev => [...prev, rewardId]);
      setLastRedeemed(name);
      setShowAnimation(true);
    }
  };

  const redeemHistory = [
    { name: '电影之夜', date: '2026-04-01', points: 100 },
    { name: '咖啡券', date: '2026-03-28', points: 50 },
  ];

  return (
    <div className="space-y-6">
      {showAnimation && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="animate-float">
            <div className="pop-card bg-pop-yellow !p-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-2xl font-black text-pop-black">成功兑换</p>
              <p className="text-xl font-bold text-pop-red">{lastRedeemed}！</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="pop-title flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-pop-orange" />
            积分商城
          </h2>
          <p className="text-pop-black/70 font-bold mt-1">完成任务赚取积分，兑换专属奖励</p>
        </div>
        <div className="pop-card bg-pop-yellow !p-4 flex items-center gap-3">
          <div className="pop-icon-box bg-pop-red w-12 h-12">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-pop-black/60">可用积分</p>
            <p className="text-3xl font-black text-pop-black">{userPoints}</p>
          </div>
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {rewards.map((reward) => {
          const isRedeemed = redeemedIds.includes(reward.id);
          const canAfford = userPoints >= reward.points;

          return (
            <div
              key={reward.id}
              className={cn(
                "pop-card !p-5 transition-all",
                isRedeemed && "opacity-75"
              )}
            >
              <div className="text-6xl mb-4 text-center">{reward.icon}</div>
              <h3 className="font-black text-lg text-pop-black text-center mb-2">
                {reward.name}
              </h3>
              <div className="flex items-center justify-center gap-1 mb-4">
                <Star className="w-5 h-5 text-pop-yellow fill-pop-yellow" />
                <span className="font-black text-xl text-pop-black">{reward.points}</span>
                <span className="text-sm font-bold text-pop-black/60">积分</span>
              </div>
              
              <button
                onClick={() => handleRedeem(reward.id, reward.name)}
                disabled={isRedeemed || !canAfford}
                className={cn(
                  "w-full py-3 rounded-pop border-4 font-black transition-all flex items-center justify-center gap-2",
                  isRedeemed
                    ? "bg-pop-green text-white border-pop-green cursor-default"
                    : canAfford
                    ? "pop-btn-red !shadow-pop-sm"
                    : "bg-pop-black/10 text-pop-black/40 border-pop-black/20 cursor-not-allowed"
                )}
              >
                {isRedeemed ? (
                  <>
                    <Check className="w-5 h-5" />
                    已兑换
                  </>
                ) : canAfford ? (
                  <>
                    <Gift className="w-5 h-5" />
                    立即兑换
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    积分不足
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Redeem History */}
      <div className="pop-card">
        <div className="flex items-center gap-2 mb-4">
          <div className="pop-icon-box bg-pop-blue w-10 h-10">
            <History className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-black text-xl text-pop-black">兑换记录</h3>
        </div>
        
        {redeemHistory.length > 0 ? (
          <div className="space-y-3">
            {redeemHistory.map((item, index) => (
              <div
                key={index}
                className="pop-list-item !mb-2 flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-pop-black">{item.name}</p>
                  <p className="text-sm font-bold text-pop-black/60">{item.date}</p>
                </div>
                <div className="pop-tag bg-pop-red text-white font-black">
                  <Star className="w-4 h-4 mr-1 inline" />
                  -{item.points}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-pop-black/60 text-center py-8 font-bold">暂无兑换记录</p>
        )}
      </div>

      {/* Achievement Banner */}
      <div className="pop-card bg-pop-red !text-white">
        <div className="flex items-center gap-4">
          <div className="pop-icon-box bg-white w-16 h-16">
            <Trophy className="w-8 h-8 text-pop-red" />
          </div>
          <div>
            <h3 className="font-black text-2xl flex items-center gap-2">
              <Flame className="w-6 h-6" />
              积分达人
            </h3>
            <p className="font-bold text-white/90">已累计获得 1580 积分，超越 88% 的用户！</p>
          </div>
        </div>
      </div>
    </div>
  );
}
