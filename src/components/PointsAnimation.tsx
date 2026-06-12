import { useEffect, useState } from 'react';
import { Star, Sparkles } from 'lucide-react';

interface PointsAnimationProps {
  points: number;
  onComplete: () => void;
}

export function PointsAnimation({ points, onComplete }: PointsAnimationProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="animate-float">
        <div className="pop-card bg-pop-yellow !p-8 text-center border-8 animate-pop-in">
          {/* 装饰性星星 */}
          <div className="absolute -top-4 -left-4 text-4xl animate-bounce">⭐</div>
          <div className="absolute -top-2 -right-6 text-3xl animate-pulse">✨</div>
          <div className="absolute -bottom-4 -left-6 text-3xl animate-pulse delay-150">✨</div>
          <div className="absolute -bottom-2 -right-4 text-4xl animate-bounce delay-150">⭐</div>
          
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="pop-icon-box bg-pop-red w-20 h-20 animate-pulse">
                <Star className="w-10 h-10 text-white fill-white" />
              </div>
              <div className="absolute inset-0 animate-sparkle">
                <Sparkles className="w-20 h-20 text-pop-yellow" />
              </div>
            </div>
            <div className="text-5xl font-black text-pop-black animate-bounce">
              +{points}
            </div>
            <div className="pop-tag bg-pop-red text-white text-xl font-black">
              积分GET！
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
