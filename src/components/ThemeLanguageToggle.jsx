import React from 'react';
import { Sun, Moon, Languages, Check } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeLanguageToggle = () => {
  const { darkMode, setDarkMode, lang, setLang } = useTheme();

  const languages = [
    { code: 'EN', name: 'English' }, { code: 'HI', name: 'Hindi' },
    { code: 'AR', name: 'Arabic' }, { code: 'ES', name: 'Spanish' },
    { code: 'FR', name: 'French' }, { code: 'DE', name: 'German' },
    { code: 'RU', name: 'Russian' }, { code: 'ZH', name: 'Chinese' },
    { code: 'JA', name: 'Japanese' }, { code: 'PT', name: 'Portuguese' },
    { code: 'IT', name: 'Italian' }, { code: 'KO', name: 'Korean' }
  ];

  return (
    <div className="flex items-center gap-4 ml-6 px-3 py-1.5 rounded-full border border-neutral-200 dark:border-blue-900/50 bg-white/50 dark:bg-blue-950/30 backdrop-blur-md shadow-sm">
      <button 
        onClick={() => setDarkMode(!darkMode)}
        className="relative p-1 rounded-full transition-all hover:scale-110 active:scale-95"
      >
        {darkMode ? <Sun size={18} className="text-yellow-400 fill-yellow-400/20" /> : <Moon size={18} className="text-blue-600" />}
      </button>

      <div className="w-[1px] h-4 bg-neutral-300 dark:bg-blue-800" />

      <div className="relative group cursor-pointer flex items-center gap-1.5">
        <Languages size={18} className="text-blue-600 dark:text-blue-400" />
        <span className="text-[11px] font-bold tracking-wider dark:text-blue-100">{lang}</span>
        
        <div className="absolute top-full right-0 mt-2 w-40 max-h-64 overflow-y-auto py-2 bg-white dark:bg-[#050b1a] border border-neutral-100 dark:border-blue-900 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100]">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className="w-full px-4 py-2 text-left text-xs hover:bg-blue-50 dark:hover:bg-blue-900/40 dark:text-blue-100 flex items-center justify-between"
            >
              {l.name}
              {lang === l.code && <Check size={12} className="text-blue-600" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
export default ThemeLanguageToggle;