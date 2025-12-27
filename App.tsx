import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HistoryItem } from './types';

// Helper for Persian digits
const toPersianDigits = (n: number | string) => {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return n.toString().replace(/\d/g, (x) => farsiDigits[parseInt(x)]);
};

// Theme Definitions with Device Specific Colors
const themes = {
  gold: {
    id: 'gold',
    name: 'مشکی و طلایی (لوکس)',
    bg: 'bg-slate-900',
    textMain: 'text-amber-400',
    textSec: 'text-slate-400',
    textHeader: 'text-amber-500',
    // Device specific
    deviceBody: 'from-slate-900 to-slate-800 border-slate-700',
    deviceScreen: 'bg-[#2a2f23]', // Darker LCD
    deviceScreenText: 'text-amber-500',
    deviceButton: 'from-amber-200 via-amber-400 to-amber-600',
    deviceButtonBorder: 'border-amber-700',
    accent: 'bg-amber-500',
    accentHover: 'hover:bg-amber-600',
    modalBg: 'bg-slate-800',
    border: 'border-amber-500/20',
    glowColor: 'bg-amber-500/20'
  },
  emerald: {
    id: 'emerald',
    name: 'سبز کلاسیک (نوستالژی)',
    bg: 'bg-stone-100', // Light background to make the device pop
    textMain: 'text-emerald-800',
    textSec: 'text-stone-500',
    textHeader: 'text-emerald-800',
    // Device specific (Matching the image)
    deviceBody: 'from-[#10b981] to-[#047857] border-[#065f46]', // Teal gradient
    deviceScreen: 'bg-[#c8cdba]', // Classic Grey/Green LCD
    deviceScreenText: 'text-black',
    deviceButton: 'from-gray-100 via-gray-300 to-gray-400', // Chrome look
    deviceButtonBorder: 'border-gray-500',
    accent: 'bg-emerald-600',
    accentHover: 'hover:bg-emerald-700',
    modalBg: 'bg-white',
    border: 'border-emerald-200',
    glowColor: 'bg-emerald-900/5'
  },
  blue: {
    id: 'blue',
    name: 'آبی آسمانی',
    bg: 'bg-slate-200',
    textMain: 'text-blue-900',
    textSec: 'text-slate-500',
    textHeader: 'text-blue-800',
    // Device specific
    deviceBody: 'from-blue-500 to-blue-700 border-blue-800',
    deviceScreen: 'bg-[#dbeafe]',
    deviceScreenText: 'text-blue-900',
    deviceButton: 'from-white via-blue-50 to-blue-200',
    deviceButtonBorder: 'border-blue-300',
    accent: 'bg-blue-600',
    accentHover: 'hover:bg-blue-700',
    modalBg: 'bg-white',
    border: 'border-blue-200',
    glowColor: 'bg-blue-500/10'
  }
};

type ThemeKey = keyof typeof themes;

function App() {
  const [count, setCount] = useState<number>(0);
  const [target, setTarget] = useState<number>(100);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Settings state
  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(true);
  
  // Theme state
  const [currentTheme, setCurrentTheme] = useState<ThemeKey>('gold');
  const t = themes[currentTheme]; // Shortcut for current theme styles

  // New states for features
  const [isCustomTarget, setIsCustomTarget] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  
  // Audio for click sound
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const presets = [34, 100, 14, 1000, 14000];

  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-mechanical-switch-click-1144.mp3'); // Mechanical click sound
    audioRef.current.volume = 0.3;

    // Load from local storage
    const savedCount = localStorage.getItem('salavat_count');
    const savedTarget = localStorage.getItem('salavat_target');
    const savedHistory = localStorage.getItem('salavat_history');
    const savedTheme = localStorage.getItem('salavat_theme');
    const savedVibration = localStorage.getItem('salavat_vibration');

    if (savedCount) setCount(parseInt(savedCount, 10));
    
    if (savedTarget) {
      const t = parseInt(savedTarget, 10);
      setTarget(t);
      if (!presets.includes(t)) {
        setIsCustomTarget(true);
      }
    }
    
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedTheme && themes[savedTheme as ThemeKey]) {
      setCurrentTheme(savedTheme as ThemeKey);
    }
    if (savedVibration !== null) {
      setVibrationEnabled(savedVibration === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('salavat_count', count.toString());
    localStorage.setItem('salavat_target', target.toString());
    localStorage.setItem('salavat_history', JSON.stringify(history));
    localStorage.setItem('salavat_theme', currentTheme);
    localStorage.setItem('salavat_vibration', vibrationEnabled.toString());
    
    // Update body background
    document.body.className = t.bg + (currentTheme === 'gold' ? ' text-slate-100' : ' text-slate-800');
    
    const metaThemeColor = document.querySelector("meta[name=theme-color]");
    if (metaThemeColor) {
        metaThemeColor.setAttribute("content", currentTheme === 'gold' ? '#1e293b' : (currentTheme === 'emerald' ? '#f5f5f4' : '#e2e8f0'));
    }

  }, [count, target, history, currentTheme, vibrationEnabled]);

  const handleIncrement = useCallback(() => {
    if (vibrationEnabled && navigator.vibrate) {
      navigator.vibrate(15);
    }
    if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
    }
    
    setCount(prev => prev + 1);
  }, [vibrationEnabled]);

  const handleResetClick = () => {
    if (count > 0) {
      setShowResetModal(true);
    }
  };

  const confirmReset = (save: boolean) => {
    if (save) {
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        count: count,
        date: new Date().toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        target: target
      };
      setHistory(prev => [newItem, ...prev]);
    }
    setCount(0);
    setShowResetModal(false);
  };

  const handleTargetOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'custom') {
      setIsCustomTarget(true);
    } else {
      setTarget(parseInt(val, 10));
      setIsCustomTarget(false);
    }
  };

  const handleManualTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val > 0) {
        setTarget(val);
    }
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className={`min-h-screen ${t.bg} flex flex-col items-center py-6 px-4 font-sans select-none transition-colors duration-500 overflow-hidden`}>
      
      {/* Header */}
      <header className="w-full max-w-md flex justify-between items-center mb-4 z-10">
        <div>
          <h1 className={`text-xl font-bold ${t.textHeader}`}>ذکر شمار</h1>
        </div>
        <button 
            onClick={() => setShowHistory(true)}
            className={`p-2 rounded-full hover:bg-black/5 transition-colors ${t.textHeader}`}
            title="تاریخچه"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </button>
      </header>

      {/* TARGET SELECTOR (External) */}
      <div className="w-full max-w-[280px] mb-6 z-10">
          <div className={`flex items-center justify-between gap-2 ${t.modalBg} px-3 py-2 rounded-full text-sm shadow-md border ${t.border}`}>
                <span className={`${t.textSec} text-xs`}>هدف:</span>
                {isCustomTarget ? (
                    <div className="flex items-center gap-2">
                        <input 
                            type="number"
                            value={target}
                            onChange={handleManualTargetChange}
                            className={`w-16 bg-transparent border-b outline-none text-center font-bold text-lg ${currentTheme === 'gold' ? 'border-amber-500 text-amber-500' : 'border-emerald-500 text-emerald-700'}`}
                            autoFocus
                            dir="ltr" 
                        />
                        <button onClick={() => { setIsCustomTarget(false); setTarget(100); }} className="text-red-400 text-xs">×</button>
                    </div>
                ) : (
                    <select 
                        value={target} 
                        onChange={handleTargetOptionChange}
                        className={`bg-transparent border-none outline-none font-bold cursor-pointer text-sm ${t.textMain} text-right`}
                        dir="rtl"
                    >
                        <option value="34">۳۴ (تسبیحات)</option>
                        <option value="100">۱۰۰ (تسبیح)</option>
                        <option value="14">۱۴ (معصومین)</option>
                        <option value="1000">۱۰۰۰ (نذر)</option>
                        <option value="14000">۱۴۰۰۰ (کبیر)</option>
                        <option value="custom">دستی...</option>
                    </select>
                )}
            </div>
      </div>

      {/* PHYSICAL DEVICE UI */}
      <div className="relative w-[300px] h-[380px] mt-2 flex justify-center">
         
         {/* Device Shadow */}
         <div className="absolute inset-0 bg-black/30 blur-2xl rounded-[60px] transform translate-y-4 scale-95"></div>

         {/* Device Body (SVG Shape) */}
         <div className={`relative w-full h-full rounded-[50px] bg-gradient-to-b ${t.deviceBody} shadow-inner border-b-8 border-r-4`}>
             
             {/* Highlight/Gloss effect on body */}
             <div className="absolute top-0 left-10 right-10 h-10 bg-white/10 rounded-full blur-xl"></div>
             
             {/* LCD Screen Area */}
             <div className="absolute top-[50px] left-[35px] right-[35px] h-[100px] bg-black/20 rounded-xl p-2 border-b border-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center">
                 {/* The Glass */}
                 <div className={`w-full h-full rounded-lg ${t.deviceScreen} shadow-[inset_0_2px_6px_rgba(0,0,0,0.4)] relative overflow-hidden flex flex-col items-center justify-center border-4 border-black/5`}>
                      {/* LCD Shadow/Glare */}
                      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-black/5 to-transparent pointer-events-none"></div>
                      
                      {/* LCD Flicker/Glow Effect */}
                      <div className={`absolute inset-0 pointer-events-none animate-lcd-flicker mix-blend-hard-light ${t.glowColor}`}></div>

                      {/* Digits */}
                      <span className={`text-6xl font-bold tracking-widest drop-shadow-sm ${t.deviceScreenText} relative z-10`} style={{ fontFamily: 'monospace' }}>
                         {count.toString().padStart(4, '0').replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)])}
                      </span>
                      
                      {/* Small Target Info inside LCD */}
                      <div className="absolute bottom-1 right-2 flex items-center gap-1 opacity-60 z-10">
                         <span className={`text-[10px] ${t.deviceScreenText}`}>TARGET</span>
                         <span className={`text-xs font-bold ${t.deviceScreenText}`}>{target}</span>
                      </div>
                 </div>
             </div>

             {/* Brand/Label Area above buttons */}
             <div className="absolute top-[160px] left-[40px] right-[40px] flex justify-between px-1 pointer-events-none z-20">
                 <span className="text-[10px] font-bold text-white/50 tracking-wider drop-shadow-md">ریست</span>
                 <span className="text-[10px] font-bold text-white/50 tracking-wider drop-shadow-md">تنظیمات</span>
             </div>

             {/* Small Left Button (Reset) */}
             <button 
                onClick={handleResetClick}
                className="absolute top-[185px] left-[45px] w-8 h-8 rounded-full bg-gradient-to-br from-stone-200 to-stone-400 shadow-lg border border-stone-500 active:scale-90 transition-transform flex items-center justify-center"
                aria-label="ریست"
             >
                 <div className="w-full h-full rounded-full bg-gradient-to-br from-white/60 to-transparent"></div>
             </button>

             {/* Small Right Button (Settings/LED) */}
             <button 
                onClick={() => setShowSettings(true)}
                className="absolute top-[185px] right-[45px] w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 shadow-lg border border-yellow-700 active:scale-90 transition-transform flex items-center justify-center group"
                aria-label="تنظیمات"
             >
                 <div className="w-full h-full rounded-full bg-gradient-to-br from-white/40 to-transparent"></div>
             </button>

             {/* Main Big Button */}
             <div className="absolute bottom-[40px] left-0 right-0 flex justify-center">
                 <div className="relative w-36 h-36 rounded-full bg-gradient-to-b from-black/20 to-white/10 p-1">
                     <button
                        onClick={handleIncrement}
                        className={`w-full h-full rounded-full bg-gradient-to-br ${t.deviceButton} shadow-[0_10px_20px_rgba(0,0,0,0.4),inset_0_2px_5px_rgba(255,255,255,0.7)] border-4 ${t.deviceButtonBorder} active:shadow-[inset_0_5px_10px_rgba(0,0,0,0.6)] active:scale-[0.98] transition-all duration-100 flex items-center justify-center group`}
                     >
                         {/* Chrome Reflection Effect */}
                         <div className="absolute top-4 left-4 right-4 h-16 bg-gradient-to-b from-white/60 to-transparent rounded-full blur-[2px]"></div>
                         
                         {/* Grip Texture */}
                         <div className="w-20 h-20 rounded-full border-2 border-black/5 opacity-30"></div>
                     </button>
                 </div>
             </div>
             
             {/* Grip Lines on sides */}
             <div className="absolute bottom-20 left-2 w-1 h-12 bg-black/20 rounded-full"></div>
             <div className="absolute bottom-20 left-4 w-1 h-10 bg-black/20 rounded-full"></div>
             
             <div className="absolute bottom-20 right-2 w-1 h-12 bg-black/20 rounded-full"></div>
             <div className="absolute bottom-20 right-4 w-1 h-10 bg-black/20 rounded-full"></div>

         </div>
      </div>

      <p className={`mt-8 ${t.textSec} text-sm text-center opacity-60`}>
         برای شمارش دکمه بزرگ را فشار دهید
      </p>

      {/* Settings Modal */}
      {showSettings && (
         <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`${t.modalBg} rounded-2xl p-6 shadow-2xl w-full max-w-sm border ${t.border}`}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className={`text-xl font-bold ${t.textHeader}`}>تنظیمات</h3>
                    <button onClick={() => setShowSettings(false)} className={t.textSec}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="mb-6 space-y-4">
                     {/* General Settings */}
                     <div>
                        <h4 className={`text-sm font-bold ${t.textMain} mb-3`}>تنظیمات عمومی</h4>
                        <button
                            onClick={() => setVibrationEnabled(!vibrationEnabled)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${t.border} hover:bg-black/5`}
                        >
                            <span className={t.textSec}>لرزش (ویبره) هنگام شمارش</span>
                            <div className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${vibrationEnabled ? t.accent : 'bg-slate-300'}`}>
                                 <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${vibrationEnabled ? 'left-1' : 'right-1'}`}></div>
                            </div>
                        </button>
                    </div>

                    {/* Theme Settings */}
                    <div>
                        <h4 className={`text-sm font-bold ${t.textMain} mb-3`}>طرح و رنگ دستگاه</h4>
                        <div className="grid grid-cols-1 gap-3">
                            {Object.values(themes).map((theme) => (
                                <button
                                    key={theme.id}
                                    onClick={() => setCurrentTheme(theme.id as ThemeKey)}
                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${currentTheme === theme.id ? `border-current ${t.textHeader} bg-black/5` : `border-transparent hover:bg-black/5 ${t.textSec}`}`}
                                >
                                    <div className={`w-8 h-8 rounded bg-gradient-to-br ${theme.deviceBody}`}></div>
                                    <span>{theme.name}</span>
                                    {currentTheme === theme.id && (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-auto" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-200/20">
                    <button 
                        onClick={() => setShowSettings(false)}
                        className={`w-full py-3 rounded-xl font-bold ${t.accent} text-white hover:opacity-90 transition-colors`}
                    >
                        تایید و بازگشت
                    </button>
                </div>
            </div>
         </div>
      )}

      {/* Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
           <div className={`${t.modalBg} rounded-2xl p-6 shadow-2xl w-full max-w-sm text-center border ${t.border}`}>
              <h3 className={`text-xl font-bold ${t.textMain} mb-2`}>پایان شمارش؟</h3>
              <p className={`${t.textSec} mb-6 text-sm`}>
                آیا می‌خواهید {toPersianDigits(count)} ذکر فرستاده شده را در تاریخچه ذخیره کنید؟
              </p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => confirmReset(true)}
                  className={`w-full ${t.accent} text-white font-bold py-3 rounded-xl hover:opacity-90 transition-colors`}
                >
                  بله، ذخیره کن و صفر شو
                </button>
                <button 
                  onClick={() => confirmReset(false)}
                  className={`w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold py-3 rounded-xl transition-colors`}
                >
                  خیر، فقط صفر شو (بدون ذخیره)
                </button>
                <button 
                  onClick={() => setShowResetModal(false)}
                  className={`w-full ${t.textSec} hover:opacity-80 text-sm py-2`}
                >
                  انصراف
                </button>
              </div>
           </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className={`${t.modalBg} rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl overflow-hidden border ${t.border}`}>
            <div className={`p-4 border-b border-gray-100/10 flex justify-between items-center ${currentTheme === 'gold' ? 'bg-slate-800' : 'bg-gray-100'}`}>
              <h2 className={`font-bold ${t.textHeader}`}>تاریخچه ذکرها</h2>
              <button onClick={() => setShowHistory(false)} className={`${t.textSec} hover:opacity-70`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="overflow-y-auto p-4 space-y-3 flex-1">
              {history.length === 0 ? (
                <div className={`text-center py-8 ${t.textSec}`}>هنوز ذکری ثبت نشده است.</div>
              ) : (
                history.map((item) => (
                  <div key={item.id} className={`flex justify-between items-center p-3 rounded-xl border ${t.border} ${currentTheme === 'gold' ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                    <div>
                      <div className={`font-bold text-lg ${t.textMain}`}>{toPersianDigits(item.count)} <span className={`text-xs ${t.textSec} font-normal`}>ذکر</span></div>
                      <div className={`text-xs ${t.textSec}`}>{toPersianDigits(item.date)}</div>
                    </div>
                    <button 
                        onClick={() => deleteHistoryItem(item.id)}
                        className="text-red-400 hover:text-red-600 p-2"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;