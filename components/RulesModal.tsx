
import React from 'react';

interface RulesModalProps {
  onClose: () => void;
}

const RulesModal: React.FC<RulesModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-[#fffef0] border-[10px] border-[#8b0000] w-full max-w-2xl p-8 shadow-[0_0_60px_rgba(0,0,0,0.8)] relative overflow-y-auto max-h-[90vh]">
        {/* 傳統角飾 */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#b8860b]"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#b8860b]"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#b8860b]"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#b8860b]"></div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-800 transition-colors"
        >
          <i className="fas fa-times text-4xl"></i>
        </button>

        <h2 className="text-5xl font-black text-[#8b0000] mb-12 text-center tracking-widest" style={{ fontFamily: 'var(--font-art)' }}>
          遊戲說明
        </h2>

        <div className="space-y-12 text-[#2d1b0d]">
          <section className="flex gap-8 items-start">
            <div className="bg-[#8b0000] p-4 text-[#f8e1a1] border-2 border-[#b8860b]">
              <i className="fas fa-hand-pointer text-4xl"></i>
            </div>
            <div>
              <h3 className="text-3xl font-black mb-3">配對消除</h3>
              <p className="text-2xl leading-relaxed font-bold">點擊兩張「完全相同」的麻將，即可將其消除。消除場上所有麻將即告勝利。</p>
            </div>
          </section>

          <section className="flex gap-8 items-start">
            <div className="bg-[#8b0000] p-4 text-[#f8e1a1] border-2 border-[#b8860b]">
              <i className="fas fa-unlock text-4xl"></i>
            </div>
            <div>
              <h3 className="text-3xl font-black mb-3">選牌規則</h3>
              <p className="text-2xl leading-relaxed font-bold">牌的左右兩側至少有一邊是空的，且上方沒有其他牌壓著，才可點選。</p>
            </div>
          </section>

          <section className="flex gap-8 items-start">
            <div className="bg-[#8b0000] p-4 text-[#f8e1a1] border-2 border-[#b8860b]">
              <i className="fas fa-magic text-4xl"></i>
            </div>
            <div>
              <h3 className="text-3xl font-black mb-3">求助功能</h3>
              <p className="text-2xl leading-relaxed font-bold">若找不到解法，可點擊下方「提示」或「洗牌」。我們保證每局遊戲都有解法。</p>
            </div>
          </section>
        </div>

        <div className="mt-16">
          <button 
            onClick={onClose}
            className="w-full py-6 bg-[#8b0000] hover:bg-[#a00000] text-[#f8e1a1] border-4 border-[#b8860b] text-3xl font-black transition-all shadow-xl active:scale-95 tracking-widest"
          >
            我懂了，開始遊戲
          </button>
        </div>
      </div>
    </div>
  );
};

export default RulesModal;
