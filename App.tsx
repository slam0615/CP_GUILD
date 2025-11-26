
import React, { useState, useEffect, useRef } from 'react';
import { TITLES, PROMPTS, CHALLENGES, SPICY_QUOTES, ACHIEVEMENTS, DEFAULT_HOLIDAYS } from './constants';
import { AppState, LogEntry, Rank, ReportData } from './types';
import { Header, BGMPlayer, Logs, Sidebar } from './components/Dashboard';
import { ArtTask, WritingTask, SideQuestTask } from './components/Tasks';
import { PixelBtn, PixelCard, PixelInput, PixelTextArea, Toast } from './components/Common';

const INITIAL_STATE: AppState = {
  rpg: { level: 1, xp: 0, nextLevelXp: 100, unlockedAchievements: [], lastReportRank: null },
  checkin: { lastDate: null, streak: 0, total: 0 },
  history: [],
  customHolidays: [],
  draw: { done: false, count: 0, lastResetWeek: null },
  write: { done: false, count: 0, lastResetMonth: null },
  side: { done: false, text: "", concept: "", date: null, count: 0 }
};

export default function App() {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [loaded, setLoaded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeModalType, setActiveModalType] = useState<'draw' | 'write' | 'side' | null>(null);
  const [isRetro, setIsRetro] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: "" });
  const [reportData, setReportData] = useState<ReportData | null>(null);

  // Form State
  const [formData, setFormData] = useState({ cp: "", title: "", words: 0, rating: "G", note: "", date: "" });

  // Load / Save with Safe Merging
  useEffect(() => {
    const saved = localStorage.getItem('farmingRpg_v17_react');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Deep merge to ensure all new state properties exist even if loading old data
        const mergedState: AppState = {
          ...INITIAL_STATE,
          ...parsed,
          rpg: { ...INITIAL_STATE.rpg, ...(parsed.rpg || {}) },
          checkin: { ...INITIAL_STATE.checkin, ...(parsed.checkin || {}) },
          draw: { ...INITIAL_STATE.draw, ...(parsed.draw || {}) },
          write: { ...INITIAL_STATE.write, ...(parsed.write || {}) },
          side: { ...INITIAL_STATE.side, ...(parsed.side || {}) },
          history: Array.isArray(parsed.history) ? parsed.history : INITIAL_STATE.history,
          customHolidays: Array.isArray(parsed.customHolidays) ? parsed.customHolidays : INITIAL_STATE.customHolidays,
        };
        setState(mergedState);
      } catch (e) {
        console.error("Failed to load save data", e);
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem('farmingRpg_v17_react', JSON.stringify(state));
  }, [state, loaded]);

  // Daily Checkin & Resets
  useEffect(() => {
    if (!loaded) return;
    const now = new Date();
    const todayStr = now.toDateString();
    
    // Checkin
    if (state.checkin.lastDate !== todayStr) {
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      const isConsecutive = state.checkin.lastDate === yesterday.toDateString();
      setState(prev => ({
        ...prev,
        checkin: {
          lastDate: todayStr,
          streak: isConsecutive ? prev.checkin.streak + 1 : 1,
          total: prev.checkin.total + 1
        }
      }));
      showToast(isConsecutive ? `每日打卡成功！(連續 ${state.checkin.streak + 1} 天)` : "每日打卡成功！");
    }

    // Weekly/Monthly Resets
    const d = new Date(now);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
    const monday = new Date(d.setDate(diff));
    const currentWeek = `${monday.getFullYear()}-W${Math.ceil((((monday.getTime() - new Date(monday.getFullYear(),0,1).getTime())/86400000)+1)/7)}`;
    const currentMonth = `${now.getFullYear()}-M${now.getMonth() + 1}`;

    if (state.draw.lastResetWeek !== currentWeek) {
      setState(prev => ({ ...prev, draw: { ...prev.draw, done: false, lastResetWeek: currentWeek } }));
    }
    if (state.write.lastResetMonth !== currentMonth) {
      setState(prev => ({ ...prev, write: { ...prev.write, done: false, lastResetMonth: currentMonth } }));
    }
  }, [loaded]);

  // Confetti Helper
  const triggerConfetti = () => {
    if ((window as any).confetti) {
      (window as any).confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
  };

  const showToast = (msg: string) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 3000);
  };

  const gainXp = (amount: number) => {
    setState(prev => {
      let { xp, level, nextLevelXp } = prev.rpg;
      xp += amount;
      while (xp >= nextLevelXp) {
        xp -= nextLevelXp;
        level++;
        // Formula: 100 + level * 15. Level 50 approx 22500 XP
        nextLevelXp = 100 + (level * 15); 
        showToast(`LEVEL UP! LV.${level}`);
      }
      return { ...prev, rpg: { ...prev.rpg, xp, level, nextLevelXp } };
    });
  };

  // NEW: Helper to calculate stats from history
  const calculateStats = (history: LogEntry[]) => {
    const now = new Date();
    const todayStr = now.toDateString();
    
    let totalWords = 0;
    let r18Count = 0;
    let gCount = 0;
    let maxDaily = 0;
    let todayCount = 0;
    
    const dailyCounts: Record<string, number> = {};
    const cpHistory: string[] = [];

    history.forEach(h => {
      // Basic counts
      if (h.wordCount) totalWords += h.wordCount;
      if (h.rating === 'R-18') r18Count++;
      if (h.rating === 'G') gCount++;
      if (h.cp) cpHistory.push(h.cp);

      // Daily stats
      const d = new Date(h.date).toDateString();
      dailyCounts[d] = (dailyCounts[d] || 0) + 1;
      if (d === todayStr) todayCount++;
    });

    maxDaily = Math.max(...Object.values(dailyCounts), 0);

    // CP Streaks (Last 5)
    const recentCPs = cpHistory.slice(0, 5);
    const uniqueRecentCPs = new Set(recentCPs).size;
    
    return {
      totalWords, r18Count, gCount, maxDaily, todayCount, recentCPs, uniqueRecentCPs
    };
  };

  const checkAchievements = (newState: AppState, type: string, currentEntry: LogEntry) => {
    const unlocked = [...newState.rpg.unlockedAchievements];
    const unlock = (id: string) => {
      if (!unlocked.includes(id)) {
        unlocked.push(id);
        showToast(`成就解鎖: ${ACHIEVEMENTS.find(a => a.id === id)?.name}`);
      }
    };
    
    // 1. Basic Triggers
    if (type === 'draw') unlock('first_draw');
    if (type === 'write') unlock('first_write');
    if (type === 'side') unlock('side_starter');
    
    // 2. Count & Level Stats
    if (newState.draw.count >= 10) unlock('draw_10');
    if (newState.draw.count >= 30) unlock('draw_30');
    if (newState.draw.count >= 50) unlock('draw_50');
    if (newState.write.count >= 10) unlock('write_10');
    if (newState.write.count >= 30) unlock('write_30');
    if (newState.write.count >= 50) unlock('write_50'); // Replaces bard
    if (newState.write.count >= 50) unlock('bard'); // Re-map old ID if needed or just use write_50
    if (newState.side.count >= 20) unlock('side_20');
    if (newState.side.count >= 30) unlock('archmage'); // 30 side quests
    if (newState.history.length >= 88) unlock('merchant'); // 88 total posts
    if (newState.history.length >= 100) unlock('total_100');

    // Levels
    if (newState.rpg.level >= 5) unlock('level_5');
    if (newState.rpg.level >= 20) unlock('level_20');
    if (newState.rpg.level >= 30) unlock('level_30');
    if (newState.rpg.level >= 40) unlock('level_40');
    if (newState.rpg.level >= 50) unlock('level_50');

    // 3. Historical Data Analysis
    const stats = calculateStats(newState.history);

    // Content Stats
    if (stats.r18Count > 0) unlock('r18_driver');
    if (stats.r18Count >= 10) unlock('abyss_walker');
    if (stats.gCount >= 5) unlock('pure_love');
    if (stats.gCount >= 20) unlock('saint');
    // Consecutive 10 G-rated? (Complex, verify last 10)
    const last10 = newState.history.slice(0, 10);
    if (last10.length === 10 && last10.every(h => h.rating !== 'R-18')) unlock('paladin');

    // Words
    if (currentEntry.wordCount && currentEntry.wordCount >= 10000) unlock('word_count_king');
    if (currentEntry.type === 'write' && currentEntry.wordCount && currentEntry.wordCount < 500) unlock('short_poet');
    if (stats.totalWords >= 50000) unlock('word_accumulator');
    
    // Monthly Words (Complex: Filter by current month)
    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    const monthWords = newState.history
        .filter(h => h.date.startsWith(currentMonthPrefix))
        .reduce((sum, h) => sum + (h.wordCount || 0), 0);
    if (monthWords > 30000) unlock('berserker');

    // Titles
    if (currentEntry.title) {
        if (currentEntry.title.length > 15) unlock('light_novelist');
        if (currentEntry.title.includes('無題') || currentEntry.title.toLowerCase().includes('untitled')) unlock('naming_sense_zero');
    }

    // CP Logic
    if (stats.recentCPs.length === 5) {
        if (stats.uniqueRecentCPs === 1) unlock('cp_devoted');
        if (stats.uniqueRecentCPs === 5) unlock('harem_master');
    }

    // Daily Intensity
    if (stats.maxDaily >= 3) unlock('tentacle_monster');

    // 4. Streaks
    const totalCount = newState.draw.count + newState.write.count;
    if (totalCount >= 3) unlock('streak_3');
    if (totalCount >= 10) unlock('streak_10');
    if (totalCount >= 30) unlock('streak_30');
    if (newState.checkin.streak >= 30) unlock('daily_checkin_30');

    // 5. Time & Date Analysis
    const entryDate = new Date(currentEntry.date);
    const hour = entryDate.getHours();
    const day = entryDate.getDay(); // 0=Sun, 1=Mon...
    const month = entryDate.getMonth() + 1;
    const dateNum = entryDate.getDate();

    // Time of Day
    if (hour >= 5 && hour <= 9) unlock('early_bird');
    if (hour >= 12 && hour <= 13) unlock('lunch_break');
    if (hour >= 9 && hour <= 17 && day >= 1 && day <= 5) unlock('workday_hero');
    if (hour >= 22 || hour <= 2) unlock('night_owl');
    if (hour >= 2 && hour <= 5) unlock('midnight_emo');
    if (hour === 3) unlock('assassin');

    // Day of Week
    if (day === 1) unlock('blue_monday');
    if (day === 5) unlock('happy_friday');
    if (day === 0 || day === 6) unlock('weekend_warrior');
    // Sunday late submission
    if (day === 0 && hour >= 23) unlock('procrastinator');
    // Monday speed run (assuming check happens on submission)
    if (day === 1 && currentEntry.type === 'draw') unlock('speed_runner');

    // Holidays
    if ((month === 2 || month === 3) && dateNum === 14) unlock('valentine_lover');
    
    // Check if it's ANY holiday in the list
    const isHoliday = [...DEFAULT_HOLIDAYS, ...newState.customHolidays].some(h => {
        // Simple MM-DD check
        if (h.date.length === 5) { // MM-DD
             const [m, d] = h.date.split('-').map(Number);
             return m === month && d === dateNum;
        }
        return h.date === entryDate.toISOString().split('T')[0];
    });
    if (isHoliday) unlock('holiday_sniper');

    // 6. Meta / Special
    // Double Kill (Draw + Write same day)
    const todayEntries = newState.history.filter(h => new Date(h.date).toDateString() === entryDate.toDateString());
    const hasDraw = todayEntries.some(h => h.type === 'draw');
    const hasWrite = todayEntries.some(h => h.type === 'write');
    if (hasDraw && hasWrite) unlock('double_kill');

    // Balanced Diet
    if (newState.draw.count > 5 && newState.write.count > 5) {
        const ratio = Math.abs(newState.draw.count - newState.write.count) / Math.max(newState.draw.count, newState.write.count);
        if (ratio < 0.2) unlock('balanced_diet');
    }

    // Retro
    const diffTime = Math.abs(new Date().getTime() - entryDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    if (diffDays > 30) unlock('retro_gamer');
    if (diffDays > 360) unlock('necromancer');

    // Endgame
    if (unlocked.length >= 50) unlock('achievement_hunter');
    if (newState.rpg.level >= 50 && unlocked.length >= 40) unlock('legend');

    return unlocked;
  };

  const handleSubmit = () => {
    if (!activeModalType) return;
    
    // Validation
    if (activeModalType === 'draw' && (!formData.cp || !formData.rating)) { alert("請填寫 CP 與分級"); return; }
    if (activeModalType === 'write' && (!formData.cp || !formData.title || formData.words <= 0)) { alert("請填寫完整資訊"); return; }
    
    const date = isRetro && formData.date ? new Date(formData.date).toISOString() : new Date().toISOString();
    const displayDate = new Date(date).toLocaleDateString('zh-TW');
    
    let note = formData.note;
    if (activeModalType === 'draw') note = `[${formData.rating}] ${formData.cp} | ${formData.note}`;
    if (activeModalType === 'write') note = `[${formData.rating}] ${formData.cp} <${formData.title}> (${formData.words}字) | ${formData.note}`;

    const entry: LogEntry = {
      id: Date.now(),
      date,
      displayDate,
      type: activeModalType,
      note,
      cp: formData.cp,
      title: formData.title,
      wordCount: Number(formData.words),
      rating: formData.rating
    };

    setState(prev => {
      const next = { ...prev };
      next.history = [entry, ...prev.history];
      
      if (!isRetro) {
        // Updated Rewards to match 1-year goal
        if (activeModalType === 'draw') { next.draw.done = true; next.draw.count++; gainXp(150); }
        if (activeModalType === 'write') { next.write.done = true; next.write.count++; gainXp(500); }
        if (activeModalType === 'side') { next.side.done = true; next.side.count++; gainXp(50); }
      }
      
      // Pass the fully updated state AND the new entry to checkAchievements
      next.rpg.unlockedAchievements = checkAchievements(next, activeModalType, entry);
      return next;
    });

    setModalOpen(false);
    triggerConfetti();
    setFormData({ cp: "", title: "", words: 0, rating: "G", note: "", date: "" });
  };

  const handleResetTask = (type: 'draw' | 'write') => {
    if (confirm("確定要重置任務狀態嗎？這將允許你重複提交任務。")) {
      setState(prev => {
        const next = { ...prev, [type]: { ...prev[type], done: false } };
        // Check for reset master immediately
        const unlocked = [...next.rpg.unlockedAchievements];
        if (!unlocked.includes('reset_master')) {
           unlocked.push('reset_master');
           showToast("成就解鎖: 洗點大師");
           next.rpg.unlockedAchievements = unlocked;
        }
        return next;
      });
    }
  };

  const refreshSideQuest = () => {
     const text = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
     const concept = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
     setState(prev => ({ ...prev, side: { ...prev.side, done: false, text, concept, date: new Date().toDateString() } }));
  };
  
  // Initial Side Quest
  useEffect(() => {
    if (!state.side.date || state.side.date !== new Date().toDateString()) refreshSideQuest();
  }, [loaded]);

  const generateReport = (type: 'month' | 'quarter' | 'year') => {
    const now = new Date();
    let logs = state.history;
    let title = "";
    
    // Time Filtering
    if (type === 'month') {
        const prefix = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
        logs = logs.filter(h => h.date.startsWith(prefix));
        title = `${prefix} 月報`;
    } else if (type === 'year') {
        logs = logs.filter(h => h.date.startsWith(String(now.getFullYear())));
        title = `${now.getFullYear()} 年度總結`;
    } else {
        title = "季度總結";
    }

    // Basic Stats
    const totalCount = logs.length;
    const wordCount = logs.reduce((acc, curr) => acc + (curr.wordCount || 0), 0);
    const r18Count = logs.filter(l => l.rating === 'R-18' || l.note.includes('R-18')).length;
    const r18Ratio = totalCount > 0 ? (r18Count / totalCount) * 100 : 0;
    
    // CP Analysis
    const cpCounts: Record<string, number> = {};
    logs.forEach(l => { if(l.cp) cpCounts[l.cp] = (cpCounts[l.cp] || 0) + 1; });
    const topCp = Object.keys(cpCounts).length > 0 
      ? Object.entries(cpCounts).sort((a,b) => b[1] - a[1])[0][0] 
      : "無";

    // Score & Rank
    const score = (totalCount * 10) + (wordCount / 500) + (r18Count * 5);
    let rank = "D";
    if (score > 50) rank = "C";
    if (score > 150) rank = "B";
    if (score > 300) rank = "A";
    if (score > 500) rank = "S";
    if (score > 800) rank = "SS";

    // Flavor Text & Class Logic
    let flavorText = "公會的一般冒險者。";
    let rpgClass = "村民";

    // Stats Calculation (0-100)
    const str = Math.min(100, wordCount / 500); // Volume
    const agi = Math.min(100, totalCount * 5); // Speed/Count
    const int = Math.min(100, logs.filter(l => l.type === 'side').length * 10 + 20); // Variety
    const chr = Math.min(100, state.rpg.unlockedAchievements.length * 2); // Prestige

    // Class Determination Logic
    if (r18Ratio > 60) {
      rpgClass = "深淵術士 (Abyss Warlock)";
      flavorText = "你在慾望的深淵中凝視，深淵也凝視著你。產糧尺度驚人。";
    } else if (r18Ratio < 10 && totalCount > 5) {
      rpgClass = "光之聖騎士 (Paladin)";
      flavorText = "純愛戰神，守護著最後的淨土，你的糧食充滿了神聖的光輝。";
    } else if (wordCount > 20000) {
      rpgClass = "吟遊詩人 (Bard)";
      flavorText = "你的文字量足以編寫史詩，鍵盤是你最強的武器。";
    } else if (totalCount > 20) {
      rpgClass = "暗影刺客 (Assassin)";
      flavorText = "天下武功唯快不破，你的產糧速度快到讓人看不見車尾燈。";
    } else if (logs.some(l => l.type === 'side')) {
      rpgClass = "煉金術師 (Alchemist)";
      flavorText = "擅長將各種奇怪的梗提煉成美味的糧食。";
    }

    setReportData({ 
      title, 
      count: totalCount, 
      wordCount, 
      rank, 
      topCp, 
      r18Ratio, 
      flavorText, 
      rpgClass,
      stats: { str, agi, int, chr }
    });
  };

  const currentTitle = TITLES.slice().reverse().find(t => state.rpg.level >= t.lv) || TITLES[0];

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 pb-32 font-pixel text-farm-text">
      <Header appState={state} currentTitle={currentTitle} />
      
      <main className="w-full max-w-5xl space-y-6">
        <BGMPlayer />
        
        <PixelCard className="bg-[#2D2D2D] text-green-400 p-6 relative">
             <div className="absolute -top-4 left-4 bg-red-600 text-white px-3 py-1 text-xs font-bold border-4 border-white transform rotate-2 shadow-pixel-sm font-retro z-10">SYSTEM ALERT</div>
             <h1 className="text-lg md:text-xl font-mono text-center leading-relaxed mt-2">{SPICY_QUOTES[Math.floor(Math.random() * SPICY_QUOTES.length)]}</h1>
        </PixelCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <ArtTask appState={state} onOpenModal={(t) => { setActiveModalType(t); setModalOpen(true); setIsRetro(false); }} onReset={handleResetTask} onRefreshSideQuest={refreshSideQuest} spicyQuote="自耕農是沒有休息日的。" />
                <WritingTask appState={state} onOpenModal={(t) => { setActiveModalType(t); setModalOpen(true); setIsRetro(false); }} onReset={handleResetTask} onRefreshSideQuest={refreshSideQuest} spicyQuote="截稿日是第一生產力。" />
                <SideQuestTask appState={state} onOpenModal={(t) => { setActiveModalType(t); setModalOpen(true); setIsRetro(false); }} onReset={handleResetTask} onRefreshSideQuest={refreshSideQuest} spicyQuote="" />
                <Logs history={state.history} onExportCSV={() => {/* Logic handled in Logs component or util */}} onRetro={() => { setIsRetro(true); setModalOpen(true); setActiveModalType('draw'); }} />
            </div>
            <div className="lg:col-span-1 space-y-8">
                <Sidebar 
                  appState={state} 
                  onGenerateReport={generateReport} 
                  onAddHoliday={(n, d) => setState(prev => ({ ...prev, customHolidays: [...prev.customHolidays, { name: n, date: d, type: 'custom' }] }))}
                  onResetData={() => { if(confirm("Clear All Data?")) { localStorage.removeItem('farmingRpg_v17_react'); window.location.reload(); } }}
                />
            </div>
        </div>
      </main>

      <Toast message={toast.msg} show={toast.show} />

      {/* Submission Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
            <div className="relative w-full max-w-md bg-[#FFFBF0] border-4 border-farm-border shadow-pixel p-6 animate-[float_0.3s_ease-out] z-50">
                 <div className="bg-green-600 text-white px-3 py-1 absolute -top-4 left-4 border-2 border-farm-border font-retro text-xs shadow-pixel-sm transform -rotate-2">
                    {isRetro ? "RETROACTIVE" : "SUBMISSION"}
                 </div>
                 <div className="text-center mb-4 mt-2">
                    <h3 className="text-2xl font-bold text-farm-text mb-1">{isRetro ? "補登模式" : "提交產出"}</h3>
                    <p className="text-xs text-[#8C7B65]">填寫你的作品資訊</p>
                 </div>

                 {isRetro && (
                   <div className="mb-4 bg-yellow-50 p-3 border-2 border-farm-border">
                      <div className="flex gap-2 mb-2"><PixelInput type="date" onChange={e => setFormData({...formData, date: e.target.value})} /></div>
                      <div className="flex justify-between gap-2 text-xs font-bold">
                         {['draw', 'write', 'side'].map(t => (
                           <label key={t} className="flex items-center cursor-pointer">
                             <input type="radio" name="rtype" checked={activeModalType === t} onChange={() => setActiveModalType(t as any)} className="mr-1" />
                             {t === 'draw' ? '繪圖' : t === 'write' ? '文章' : '支線'}
                           </label>
                         ))}
                      </div>
                   </div>
                 )}

                 <div className="space-y-3">
                    {(activeModalType === 'draw' || activeModalType === 'write') && (
                      <div><label className="text-xs font-bold block mb-1">CP (配對)</label><PixelInput value={formData.cp} onChange={e => setFormData({...formData, cp: e.target.value})} placeholder="例如：五夏" /></div>
                    )}
                    {activeModalType === 'write' && (
                       <>
                        <div><label className="text-xs font-bold block mb-1">標題</label><PixelInput value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} /></div>
                        <div><label className="text-xs font-bold block mb-1">字數</label><PixelInput type="number" value={formData.words} onChange={e => setFormData({...formData, words: parseInt(e.target.value)})} /></div>
                       </>
                    )}
                    {(activeModalType === 'draw' || activeModalType === 'write') && (
                      <div>
                        <label className="text-xs font-bold block mb-1">分級</label>
                        <select className="w-full bg-[#FFFBF0] border-2 border-farm-border p-2 font-pixel text-sm" value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})}>
                          <option value="G">G (全年齡)</option>
                          <option value="R-15">R-15</option>
                          <option value="R-18">R-18</option>
                        </select>
                      </div>
                    )}
                    <div><label className="text-xs font-bold block mb-1">備註</label><PixelTextArea rows={3} value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} /></div>
                 </div>

                 <div className="flex gap-4 mt-6">
                    <PixelBtn className="flex-1 bg-stone-300 border-stone-400" onClick={() => setModalOpen(false)}>取消</PixelBtn>
                    <PixelBtn className="flex-1 bg-green-500 text-white border-green-700" onClick={handleSubmit}>確認入庫</PixelBtn>
                 </div>
            </div>
        </div>
      )}

      {/* Report Modal */}
      {reportData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
             <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setReportData(null)}></div>
             <div className="relative w-full max-w-lg bg-[#FFFBF0] border-4 border-farm-border p-0 flex flex-col max-h-[90vh] z-50 overflow-hidden">
                <div className="bg-[#433422] text-white p-3 border-b-4 border-farm-border font-bold text-center flex justify-between items-center shrink-0">
                    <span><i className="fa-solid fa-scroll"></i> 冒險者公會分析</span>
                    <button onClick={() => setReportData(null)}><i className="fa-solid fa-xmark"></i></button>
                </div>
                <div className="p-6 overflow-y-auto">
                   <div className="text-center mb-6">
                      <div className="inline-block bg-black text-white px-3 py-1 font-retro text-xs transform -rotate-2 border-2 border-white shadow-md mb-2">{reportData.rpgClass}</div>
                      <div className="text-3xl font-bold text-farm-text mb-1">{reportData.title}</div>
                      <div className="text-xs text-[#8C7B65] font-pixel">{reportData.flavorText}</div>
                   </div>

                   {/* Stats Bars */}
                   <div className="mb-6 space-y-2 font-retro text-xs text-farm-text">
                      <div className="flex items-center gap-2">
                        <span className="w-8 font-bold">STR</span>
                        <div className="flex-1 h-3 bg-stone-300 border border-black"><div style={{width: `${reportData.stats.str}%`}} className="h-full bg-red-500"></div></div>
                        <span className="w-6 text-right">{Math.round(reportData.stats.str)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-8 font-bold">AGI</span>
                        <div className="flex-1 h-3 bg-stone-300 border border-black"><div style={{width: `${reportData.stats.agi}%`}} className="h-full bg-green-500"></div></div>
                        <span className="w-6 text-right">{Math.round(reportData.stats.agi)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-8 font-bold">INT</span>
                        <div className="flex-1 h-3 bg-stone-300 border border-black"><div style={{width: `${reportData.stats.int}%`}} className="h-full bg-blue-500"></div></div>
                        <span className="w-6 text-right">{Math.round(reportData.stats.int)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-8 font-bold">CHR</span>
                        <div className="flex-1 h-3 bg-stone-300 border border-black"><div style={{width: `${reportData.stats.chr}%`}} className="h-full bg-yellow-500"></div></div>
                        <span className="w-6 text-right">{Math.round(reportData.stats.chr)}</span>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4 mb-6 text-farm-text">
                      <div className="border-2 border-farm-border bg-white p-2 text-center">
                        <div className="text-xs text-[#8C7B65]">產出總數</div>
                        <div className="text-xl font-bold">{reportData.count}</div>
                      </div>
                      <div className="border-2 border-farm-border bg-white p-2 text-center">
                        <div className="text-xs text-[#8C7B65]">總字數</div>
                        <div className="text-xl font-bold text-blue-600">{reportData.wordCount}</div>
                      </div>
                      <div className="border-2 border-farm-border bg-white p-2 text-center">
                        <div className="text-xs text-[#8C7B65]">最愛CP</div>
                        <div className="text-lg font-bold truncate">{reportData.topCp}</div>
                      </div>
                      <div className="border-2 border-farm-border bg-white p-2 text-center">
                        <div className="text-xs text-[#8C7B65]">R18 濃度</div>
                        <div className="text-xl font-bold text-pink-600">{Math.round(reportData.r18Ratio)}%</div>
                      </div>
                   </div>
                   
                   <div className="border-4 border-farm-border bg-[#FDF6E3] p-4 text-center">
                      <div className="text-xs text-[#8C7B65] mb-1">公會評級</div>
                      <div className="text-5xl font-retro font-bold text-farm-text">{reportData.rank}</div>
                   </div>
                </div>
             </div>
        </div>
      )}
    </div>
  );
}
