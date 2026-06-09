import { Crown, Download, Share2, Star } from 'lucide-react';
import { weeklyReports } from '../data/mockData';

export function Review() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="pop-title flex items-center gap-3">
            <Crown className="w-8 h-8 text-pop-purple" />
            复盘中心
          </h2>
          <p className="text-pop-black/70 font-bold mt-1">真实任务完成后，这里会生成你的复盘数据</p>
        </div>
        <div className="flex gap-3">
          <button className="pop-btn !py-2 !px-4" disabled>
            <Share2 className="w-4 h-4 inline mr-1" />
            分享
          </button>
          <button className="pop-btn-blue !py-2 !px-4" disabled>
            <Download className="w-4 h-4 inline mr-1" />
            导出周报
          </button>
        </div>
      </div>

      {weeklyReports.length === 0 ? (
        <div className="pop-card bg-white p-8 text-center">
          <Star className="mx-auto mb-4 h-12 w-12 text-pop-yellow fill-pop-yellow" />
          <h3 className="text-2xl font-black text-pop-black">暂无复盘数据</h3>
          <p className="mt-2 font-bold text-pop-black/60">
            示例周报已清空。等你开始完成真实任务后，这里会展示属于你的周报、趋势和建议。
          </p>
        </div>
      ) : null}
    </div>
  );
}
