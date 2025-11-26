import React, { useState, useEffect } from 'react';
import { PixelCard, PixelBtn } from './Common';
import { AppState, Title, Holiday, LogEntry, Achievement } from '../types';
import { BGM_LIST, ACHIEVEMENTS, DEFAULT_HOLIDAYS } from '../constants';
import html2canvas from 'html2canvas';

interface HeaderProps {
  appState: AppState;
  currentTitle: Title;
}

export const Header = ({ appState, currentTitle }: HeaderProps) => {
  return (
    <div className="w-full max-w-5xl mb-6 relative">
       <div className="p-4 bg-[#5C4033] border-4 border-[#433422] shadow-[6px_6px_0_0_rgba(67,52,34,0.5)] text-[#FFFBF0] mb-4 text-center transform -rotate-1">
            <h1 className="text-xl md:text-3xl font-bold text-yellow-400 leading-relaxed tracking-wider font-pixel">
                <i className="fa-solid fa-seedling"></i> 2026年的同人女大冒險 <i className="fa-solid fa-seedling"></i><br/>
                <span className="text-sm md:text-lg text-[#FFFBF0] mt-2 block font-pixel">～狼若回頭，是為了拿起鋤頭～</span>
            </h1>
        </div>

        <PixelCard className="p-4 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6 w-full md:w-auto">
                 <div className="relative group cursor-pointer animate-float">
                    <div className={`w-24 h-24 border-4 flex items-center justify-center overflow-hidden shadow-pixel-sm rounded-xl transition-all duration-500 bg-rank-${currentTitle.rank} border-[#433422]`}>
                        <i className={`fa-solid ${currentTitle.icon} text-5xl text-[#433422] drop-shadow-md`}></i>
                    </div>
                    <div className="absolute -bottom-3 -right-3 bg-black text-white text-xs px-2 py-1 font-retro border-2 border-white z-10">
                        LV.{appState.rpg.level}
                    </div>
                    <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 text-white text-[10px] px-2 py-0.5 border-2 border-white font-bold whitespace-nowrap z-20 shadow-sm bg-rank-${currentTitle.rank === 'bronze' ? 'bronze' : currentTitle.rank === 'silver' ? 'silver' : currentTitle.rank === 'gold' ? 'gold' : 'plat'} text-[#433422]`}>
                        {currentTitle.rank.toUpperCase()}
                    </div>
                </div>
                
                <div className="flex-1">
                    <div className="text-xs text-[#8C7B65] mb-1 tracking-widest font-bold">ADVENTURER STATUS</div>
                    <h2 className="text-xl md:text-2xl text-[#433422] font-bold tracking-wider font-pixel">{currentTitle.name}</h2>
                    <div className="text-sm text-green-700 font-bold mt-1 border-t-2 border-[#8C7B65] pt-1 font-pixel">
                        <i className="fa-solid fa-quote-left text-xs text-[#8C7B65] mr-2"></i> {currentTitle.status}
                    </div>
                </div>
            </div>
            
            <div className="w-full md:w-1/2 font-retro text-xs space-y-2">
                <div className="flex justify-between text-[#433422] font-bold"><span>HARVEST EXP</span><span>{appState.rpg.xp}/{appState.rpg.nextLevelXp}</span></div>
                <div className="w-full h-6 bg-[#8C7B65] border-4 border-[#433422] p-1 relative">
                    <div style={{ width: `${Math.min((appState.rpg.xp / appState.rpg.nextLevelXp) * 100, 100)}%` }} className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500 relative"></div>
                </div>
                <div className="flex justify-between text-[#8C7B65] pt-1 border-t border-[#8C7B65]">
                    <span>每日打卡: <span className="text-blue-600 font-bold">{appState.checkin.streak}</span> 天</span>
                    <span>總登入: <span className="text-blue-600 font-bold">{appState.checkin.total}</span> 次</span>
                </div>
            </div>
        </PixelCard>
    </div>
  );
};

export const BGMPlayer = () => {
  const [current, setCurrent] = useState(BGM_LIST[0]);
  const playRandom = () => setCurrent(BGM_LIST[Math.floor(Math.random() * BGM_LIST.length)]);
  
  useEffect(() => playRandom(), []);

  return (
    <PixelCard className="bg-[#2D2D2D] text-white p-3 flex items-center justify-between gap-4 shadow-pixel-sm relative overflow-hidden mb-6">
        <div className="flex items-center gap-4 z-10 w-full">
            <div className="bg-black border-2 border-stone-600 p-2 flex gap-1 items-end h-8">
                <div className="w-1 h-full bg-green-400 animate-[pulse_1s_infinite]"></div>
                <div className="w-1 h-3/4 bg-green-400 animate-[pulse_1.2s_infinite]"></div>
                <div className="w-1 h-1/2 bg-green-400 animate-[pulse_0.8s_infinite]"></div>
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-[10px] text-green-400 font-retro mb-1 flex justify-between">
                    <span>CREATOR RADIO</span>
                </div>
                <div 
                  className="text-sm font-bold text-yellow-300 cursor-pointer hover:text-white truncate transition-colors font-pixel" 
                  title="Search on YouTube" 
                  onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(`${current.artist} ${current.title}`)}`, '_blank')}
                >
                    ♫ {current.artist} - {current.title}
                </div>
            </div>
            <button onClick={playRandom} className="text-stone-400 hover:text-white bg-stone-800 p-2 rounded border-2 border-stone-600 active:translate-y-1">
              <i className="fa-solid fa-forward-step"></i>
            </button>
        </div>
        <div className="absolute right-0 top-0 text-stone-800 text-6xl opacity-20 pointer-events-none"><i className="fa-solid fa-music"></i></div>
    </PixelCard>
  );
};

export const Logs = ({ history, onExportCSV, onRetro }: { history: LogEntry[], onExportCSV: () => void, onRetro: () => void }) => {
  const [filter, setFilter] = useState('all');
  
  const exportImg = () => {
    const el = document.getElementById('history-log-container');
    if (el) html2canvas(el, { backgroundColor: "#FFFBF0" }).then(canvas => {
      const link = document.createElement('a');
      link.download = 'adventure_logs.png';
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  const filtered = history.filter(h => filter === 'all' || h.type === filter);

  return (
    <PixelCard className="p-0 bg-[#FFFBF0] border-[#5C4033]">
        <div className="bg-[#5C4033] text-[#FFFBF0] px-4 py-2 border-b-4 border-[#433422] flex justify-between items-center">
            <span className="font-bold font-pixel"><i className="fa-solid fa-warehouse"></i> 穀倉紀錄</span>
            <div className="flex gap-2 items-center">
                <button onClick={onExportCSV} className="text-xs bg-green-700 hover:bg-green-600 text-white px-2 py-1 border border-[#8C7B65]"><i className="fa-solid fa-file-csv"></i></button>
                <button onClick={exportImg} className="text-xs bg-blue-700 hover:bg-blue-600 text-white px-2 py-1 border border-[#8C7B65] mr-1"><i className="fa-solid fa-image"></i></button>
                <button onClick={onRetro} className="text-xs bg-[#8C7B65] hover:bg-[#6e5d4a] text-white px-2 py-1 border border-[#433422] mr-1"><i className="fa-solid fa-clock-rotate-left"></i> 補登</button>
                <select onChange={(e) => setFilter(e.target.value)} className="bg-[#8C7B65] text-white border-2 border-[#433422] p-1 focus:outline-none text-xs font-pixel">
                    <option value="all">全部</option>
                    <option value="draw">繪圖</option>
                    <option value="write">寫作</option>
                    <option value="side">支線</option>
                </select>
            </div>
        </div>
        <div id="history-log-container" className="p-2 min-h-[200px] max-h-[400px] overflow-y-auto bg-[#FFFBF0] text-[#433422] font-pixel">
            {filtered.length === 0 ? <div className="text-center py-4 text-[#8C7B65]">穀倉空空如也...</div> : 
              filtered.map(item => (
                <div key={item.id} className="border-b border-[#E8DCCA] pb-2 mb-2">
                  <div className="flex justify-between text-xs text-[#8C7B65] mb-1">
                    <span>{item.displayDate}</span>
                    <span className={`font-bold ${item.type === 'draw' ? 'text-pink-600' : item.type === 'write' ? 'text-blue-600' : 'text-purple-600'}`}>
                      [{item.type === 'draw' ? '繪圖' : item.type === 'write' ? '寫作' : '支線'}]
                    </span>
                  </div>
                  <div className="pl-2 border-l-2 border-[#8C7B65] break-words">{item.note}</div>
                </div>
              ))
            }
        </div>
    </PixelCard>
  );
};

export const Sidebar = ({ 
  appState, 
  onGenerateReport, 
  onAddHoliday,
  onResetData 
}: { 
  appState: AppState, 
  onGenerateReport: (t: 'month' | 'quarter' | 'year') => void,
  onAddHoliday: (n: string, d: string) => void,
  onResetData: () => void
}) => {
  const [hName, setHName] = useState("");
  const [hDate, setHDate] = useState("");

  const holidays = [...DEFAULT_HOLIDAYS, ...appState.customHolidays].map(h => {
    // Basic day diff logic
    const now = new Date();
    let target = new Date();
    if (h.type === 'custom' && h.date.length === 10) {
      target = new Date(h.date);
    } else {
      const [m, d] = h.date.split('-').map(Number);
      target = new Date(now.getFullYear(), m - 1, d);
      if (target < now && target.toDateString() !== now.toDateString()) target.setFullYear(now.getFullYear() + 1);
    }
    const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return { ...h, daysLeft: diff };
  }).sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 5);

  return (
    <div className="space-y-8 font-pixel">
        <PixelCard className="p-0 bg-teal-100 border-[#433422]">
            <div className="bg-teal-700 text-white p-2 border-b-4 border-[#433422] text-center font-bold">
                <i className="fa-solid fa-chart-line"></i> 冒險公會報表
            </div>
            <div className="p-4 space-y-2">
                <PixelBtn fullWidth onClick={() => onGenerateReport('month')} className="bg-teal-500 border-teal-700 text-white text-left px-4"><i className="fa-solid fa-calendar-days w-6"></i> 本月結算</PixelBtn>
                <PixelBtn fullWidth onClick={() => onGenerateReport('quarter')} className="bg-teal-600 border-teal-800 text-white text-left px-4"><i className="fa-solid fa-chart-pie w-6"></i> 季度總結</PixelBtn>
                <PixelBtn fullWidth onClick={() => onGenerateReport('year')} className="bg-yellow-600 border-yellow-800 text-white text-left px-4"><i className="fa-solid fa-crown w-6"></i> 年度回顧</PixelBtn>
            </div>
        </PixelCard>

        <PixelCard className="p-0">
             <div className="bg-yellow-500 text-black p-2 border-b-4 border-[#433422] text-center font-bold flex justify-between px-4">
                <span><i className="fa-solid fa-medal"></i> 榮譽勳章</span>
                <span className="font-retro text-xs pt-1">{appState.rpg.unlockedAchievements.length}/{ACHIEVEMENTS.length}</span>
            </div>
            <div className="flex flex-col gap-2 p-2 bg-[#E8DCCA] max-h-[300px] overflow-y-auto">
              {ACHIEVEMENTS.map(ach => {
                const unlocked = appState.rpg.unlockedAchievements.includes(ach.id);
                return (
                  <div key={ach.id} className={`flex items-center gap-3 p-2 bg-white border-b-2 border-[#C0A080] ${unlocked ? '' : 'grayscale opacity-60'}`}>
                    <div className={`min-w-[40px] h-[40px] flex items-center justify-center border-2 border-black ${unlocked ? 'bg-yellow-300' : 'bg-gray-200'}`}>
                      <i className={`fa-solid ${ach.icon} text-lg`}></i>
                    </div>
                    <div>
                      <div className="text-xs font-bold">{ach.name}</div>
                      <div className="text-[10px] text-gray-600">{ach.desc}</div>
                    </div>
                  </div>
                )
              })}
            </div>
        </PixelCard>

        <PixelCard className="p-0">
             <div className="bg-red-600 text-white p-2 border-b-4 border-[#433422] text-center font-bold"><i className="fa-solid fa-calendar-days"></i> 耕作時令</div>
             <div className="bg-red-100 p-3 border-b-2 border-red-200">
                <div className="flex gap-2 mb-2">
                    <input value={hName} onChange={e => setHName(e.target.value)} className="w-full text-xs p-1 border-2 border-[#433422]" placeholder="名稱" />
                    <input type="date" value={hDate} onChange={e => setHDate(e.target.value)} className="w-24 text-xs p-1 border-2 border-[#433422]" />
                </div>
                <button onClick={() => { if(hName && hDate) { onAddHoliday(hName, hDate); setHName(""); setHDate(""); }}} className="w-full bg-red-500 text-white text-xs font-bold py-1 border-2 border-[#433422] hover:bg-red-400">新增</button>
             </div>
             <div className="p-4 space-y-3 bg-white max-h-[200px] overflow-y-auto">
               {holidays.map((h, i) => (
                 <div key={i} className="flex items-center gap-2 border-b border-[#E8DCCA] pb-2">
                   <div className="text-[10px] font-bold text-gray-400 w-8">{h.date.length > 5 ? h.date.substring(5) : h.date}</div>
                   <div className="flex-1 text-sm font-bold text-gray-800 flex justify-between">
                     <span>{h.name}</span>
                     <span className={`text-[10px] text-white px-1.5 rounded ${h.daysLeft <= 0 ? 'bg-red-600' : 'bg-blue-500'}`}>{h.daysLeft <= 0 ? '今天!' : `${h.daysLeft}天`}</span>
                   </div>
                 </div>
               ))}
             </div>
        </PixelCard>

        <div className="text-center">
            <button onClick={onResetData} className="text-[10px] text-gray-500 hover:text-red-500 font-retro">[RESET DATA]</button>
            <div className="text-[10px] text-green-700 font-bold mt-1">Auto-Save Enabled <i className="fa-solid fa-check"></i></div>
        </div>
    </div>
  );
};