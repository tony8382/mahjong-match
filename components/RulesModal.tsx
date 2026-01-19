
import React from 'react';

interface RulesModalProps {
  onClose: () => void;
}

const RulesModal: React.FC<RulesModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-white border-8 border-yellow-500 w-full max-w-2xl rounded-[3rem] p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-y-auto max-h-[90vh]">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors"
        >
          <i className="fas fa-times text-4xl"></i>
        </button>

        <h2 className="text-5xl font-black text-green-800 mb-10 text-center pb-4">
          🀄 玩法很簡單
        </h2>

        <div className="space-y-10 text-gray-800">
          <section className="flex gap-6 items-start">
            <div className="bg-green-100 p-6 rounded-[2rem] text-green-700 shrink-0">
              <i className="fas fa-hand-pointer text-4xl"></i>
            </div>
            <div>
              <h3 className="text-3xl font-black mb-3 text-green-900">怎麼連連看？</h3>
              <p className="text-2xl leading-relaxed font-medium">點擊兩張「完全一樣」的牌，就可以把它們消掉。消光桌上所有的牌就贏了！</p>
            </div>
          </section>

          <section className="flex gap-6 items-start">
            <div className="bg-yellow-100 p-6 rounded-[2rem] text-yellow-700 shrink-0">
              <i className="fas fa-unlock text-4xl"></i>
            </div>
            <div>
              <h3 className="text-3xl font-black mb-3 text-yellow-900">哪張牌可以點？</h3>
              <p className="text-2xl leading-relaxed font-medium">左右兩邊只要有一邊沒被擋住，且上面沒有其他牌壓著，就可以點選。</p>
            </div>
          </section>

          <section className="flex gap-6 items-start">
            <div className="bg-blue-100 p-6 rounded-[2rem] text-blue-700 shrink-0">
              <i className="fas fa-magic text-4xl"></i>
            </div>
            <div>
              <h3 className="text-3xl font-black mb-3 text-blue-900">找不到牌怎麼辦？</h3>
              <p className="text-2xl leading-relaxed font-medium">別擔心！點擊下方的「提示」魔法棒，我們會幫您找。也可以點擊「洗牌」把牌重新打亂喔！</p>
            </div>
          </section>
        </div>

        <div className="mt-14">
          <button 
            onClick={onClose}
            className="w-full py-6 bg-green-600 hover:bg-green-700 text-white rounded-[2rem] text-3xl font-black transition-all shadow-xl active:scale-95"
          >
            我懂了，開始遊戲！
          </button>
        </div>
      </div>
    </div>
  );
};

export default RulesModal;
