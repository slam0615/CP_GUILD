import React, { useState, useEffect } from 'react';
import { PixelCard, PixelBtn } from './Common';
import { AppState } from '../types';

interface TaskProps {
  appState: AppState;
  onOpenModal: (type: 'draw' | 'write' | 'side') => void;
  onReset: (type: 'draw' | 'write') => void;
  onRefreshSideQuest: () => void;
  spicyQuote: string;
}

export const ArtTask = ({ appState, onOpenModal, onReset, spicyQuote }: TaskProps) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const targetSat = new Date(now);
      targetSat.setDate(now.getDate() + ((7 - now.getDay()) % 7 === 0 ? 6 : (6 - now.getDay())));
      targetSat.setHours(23, 59, 59);
      const ms = targetSat.getTime() - now.getTime();
      const total = 604800000; // 7 days
      
      if (ms < 0) {
        setTimeLeft("已截止");
        setProgress(100);
      } else {
        const d = Math.floor(ms / 86400000);
        const h = Math.floor((ms % 86400000) / 3600000);
        setTimeLeft(`${d}天 ${h}時`);
        setProgress(Math.max(0, Math.min(100, ((total - ms) / total) * 100)));
      }
    };
    calc();
    const int = setInterval(calc, 60000);
    return () => clearInterval(int);
  }, []);

  return (
    <PixelCard className="relative group p-0 overflow-visible">
      <div className="bg-stone-800 text-white px-4 py-2 border-b-4 border-[#433422] flex justify-between items-center">
        <span className="font-bold flex items-center gap-2 text-pink-300"><i className="fa-solid fa-palette"></i> WEEKLY ART</span>
        <span className="text-xs text-yellow-400 font-retro">REWARD: 150XP</span>
      </div>
      <div className="p-6 relative">
         <div className="absolute -top-3 -right-3 max-w-[60%] text-right z-10">
            <span className="bg-red-500 text-white text-xs px-2 py-1 border-2 border-black transform rotate-2 inline-block shadow-pixel-sm font-bold">{spicyQuote}</span>
        </div>
        <h2 className="text-2xl font-bold mb-1 text-[#433422]">每週產糧耕作</h2>
        <div className="mb-6">
          <div className="w-full h-6 bg-[#C0A080] border-4 border-[#433422] relative">
            <div style={{ width: appState.draw.done ? '100%' : `${progress}%` }} className={`h-full border-r-4 border-[#433422] transition-all duration-1000 ${appState.draw.done ? 'bg-green-500' : 'bg-pink-500'}`}></div>
          </div>
          <div className="flex justify-between text-xs mt-2 font-bold text-[#8C7B65]">
            <span>STATUS: <span className={appState.draw.done ? 'text-green-600' : 'text-[#8C7B65]'}>{appState.draw.done ? '完成' : '進行中'}</span></span>
            <span className="text-red-600">{appState.draw.done ? '已入庫' : timeLeft}</span>
          </div>
        </div>
        <PixelBtn 
          fullWidth 
          onClick={() => onOpenModal('draw')} 
          disabled={appState.draw.done}
          className={appState.draw.done ? "bg-green-600 text-white border-green-800" : "bg-pink-500 text-white border-pink-700"}
        >
          {appState.draw.done ? <><i className="fa-solid fa-check"></i> 作物已入庫</> : <><i className="fa-solid fa-upload"></i> 提交繪圖</>}
        </PixelBtn>
        <button onClick={() => onReset('draw')} className="w-full mt-2 text-[#8C7B65] text-xs hover:text-[#433422] py-2">
            <i className="fa-solid fa-rotate-left"></i> 重置任務狀態
        </button>
      </div>
    </PixelCard>
  );
};

export const WritingTask = ({ appState, onOpenModal, onReset, spicyQuote }: TaskProps) => {
  const [phase, setPhase] = useState({ title: "", desc: "", p: 0 });

  useEffect(() => {
    const now = new Date();
    const day = now.getDate();
    const totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    let title = "Week 1: 起步期", desc = "目標 1250 字。";
    if (day > 7) { title = "Week 2: 發展期"; desc = "目標 2500 字。"; }
    if (day > 14) { title = "Week 3: 高潮期"; desc = "目標 3750 字。"; }
    if (day > 21) { title = "Week 4: 收尾期"; desc = "目標 5000 字。"; }
    setPhase({ title, desc, p: (day / totalDays) * 100 });
  }, []);

  return (
    <PixelCard className="relative group p-0">
       <div className="bg-stone-800 text-white px-4 py-2 border-b-4 border-[#433422] flex justify-between items-center">
        <span className="font-bold flex items-center gap-2 text-blue-300"><i className="fa-solid fa-book"></i> MONTHLY NOVEL</span>
        <span className="text-xs text-yellow-400 font-retro">REWARD: 500XP</span>
      </div>
      <div className="p-6 relative">
         <div className="absolute -top-3 -right-3 max-w-[60%] text-right z-10">
            <span className="bg-blue-600 text-white text-xs px-2 py-1 border-2 border-black transform -rotate-1 inline-block shadow-pixel-sm font-bold">{spicyQuote}</span>
        </div>
        <div className="flex justify-between items-end mb-2">
            <h2 className="text-2xl font-bold text-[#433422]">月度小說更新</h2>
        </div>
        <div className="mb-2">
            <div className="w-full h-8 bg-[#C0A080] border-4 border-[#433422] flex relative">
                {[1,2,3,4].map(w => (
                  <div key={w} className="w-1/4 h-full border-r-2 border-[#8C7B65] flex items-center justify-center text-[10px] z-10 mix-blend-multiply text-[#433422]">W{w}</div>
                ))}
                <div style={{ width: appState.write.done ? '100%' : `${phase.p}%` }} className={`absolute top-0 left-0 h-full border-r-4 border-[#433422] transition-all duration-1000 ${appState.write.done ? 'bg-green-500' : 'bg-blue-500 opacity-80'}`}></div>
            </div>
        </div>
        <div className="bg-blue-50 border-2 border-blue-200 p-3 mb-6 flex items-start gap-3">
            <i className="fa-solid fa-circle-info text-blue-500 mt-1"></i>
            <div>
                <div className="text-xs font-bold text-blue-800 mb-1">{phase.title}</div>
                <div className="text-xs text-blue-600">{phase.desc}</div>
            </div>
        </div>
        <PixelBtn 
          fullWidth 
          onClick={() => onOpenModal('write')} 
          disabled={appState.write.done}
          className={appState.write.done ? "bg-green-600 text-white border-green-800" : "bg-blue-500 text-white border-blue-700"}
        >
          {appState.write.done ? <><i className="fa-solid fa-check"></i> 作物已入庫</> : <><i className="fa-solid fa-file-word"></i> 提交文章</>}
        </PixelBtn>
        <button onClick={() => onReset('write')} className="w-full mt-2 text-[#8C7B65] text-xs hover:text-[#433422] py-2">
            <i className="fa-solid fa-rotate-left"></i> 重置任務狀態
        </button>
      </div>
    </PixelCard>
  );
};

export const SideQuestTask = ({ appState, onOpenModal, onRefreshSideQuest }: TaskProps) => {
  return (
    <PixelCard className="p-0">
      <div className="bg-purple-800 text-white px-4 py-2 border-b-4 border-[#433422] flex justify-between items-center">
          <span className="font-bold flex items-center gap-2 text-purple-200"><i className="fa-solid fa-flask"></i> 靈感煉金術</span>
          <span className="text-xs text-yellow-400 font-retro">+50XP</span>
      </div>
      <div className="p-6 bg-purple-50">
          <div className="flex flex-col gap-4">
              <div className="border-4 border-[#433422] bg-white shadow-pixel-sm p-4 relative">
                  <div className="absolute -top-3 left-3 bg-black text-white px-2 py-0.5 text-xs font-bold transform -rotate-1">CURRENT PROMPT</div>
                  <div className="mt-2 space-y-3">
                      <div className="flex items-start gap-3">
                          <div className="bg-purple-200 text-purple-900 font-bold px-2 py-1 text-xs border-2 border-black min-w-[60px] text-center mt-1">題目</div>
                          <div className="text-lg font-bold text-[#433422] border-b-2 border-[#E8DCCA] pb-1 w-full">{appState.side.text || "--"}</div>
                      </div>
                      <div className="flex items-start gap-3">
                          <div className="bg-yellow-200 text-yellow-900 font-bold px-2 py-1 text-xs border-2 border-black min-w-[60px] text-center mt-1">挑戰</div>
                          <div className="text-sm font-bold text-[#6D5A45] w-full leading-6">{appState.side.concept || "--"}</div>
                      </div>
                  </div>
              </div>
              <div className="flex gap-4">
                  <PixelBtn onClick={onRefreshSideQuest} className="w-1/3 bg-[#C0A080] border-[#8C7B65] text-white text-sm"><i className="fa-solid fa-rotate"></i> 重骰</PixelBtn>
                  <PixelBtn 
                    onClick={() => onOpenModal('side')} 
                    disabled={appState.side.done}
                    className={`w-2/3 ${appState.side.done ? 'bg-stone-500 border-stone-600' : 'bg-purple-600 border-purple-800'} text-white`}
                  >
                     {appState.side.done ? '已完成' : <><i className="fa-solid fa-check"></i> 接受挑戰</>}
                  </PixelBtn>
              </div>
          </div>
      </div>
    </PixelCard>
  );
};