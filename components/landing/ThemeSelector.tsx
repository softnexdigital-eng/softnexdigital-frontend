'use client';
import { useState, useEffect } from 'react';

interface ThemeInfo {
  id: string;
  name: string;
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}

interface ThemeSelectorProps {
  themes: ThemeInfo[];
  currentTheme: string;
  onSelect: (themeId: string) => void;
}

export type { ThemeInfo };

export default function ThemeSelector({ themes, currentTheme, onSelect }: ThemeSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show after a small delay for better UX
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Floating Theme Switcher Button - visible on mobile */}
      <div
        className={`fixed top-4 right-4 z-50 transition-all duration-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-white shadow-xl rounded-sm p-3 border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:scale-105"
          title="Switch Theme"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        </button>
      </div>

      {/* Theme Selector Panel */}
      <div
        className={`fixed top-20 right-4 z-50 transition-all duration-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        } ${
          isExpanded ? 'scale-100' : 'scale-95 pointer-events-none opacity-0'
        }`}
      >
        <div className="bg-white/95 backdrop-blur-lg shadow-2xl rounded-sm border border-gray-200/90 p-4 min-w-[220px]">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              🎨 Select Theme
            </span>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex flex-col gap-1.5">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => {
                  onSelect(theme.id);
                  setIsExpanded(false);
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-all duration-300 ${
                  currentTheme === theme.id
                    ? 'scale-[1.02] shadow-sm'
                    : 'opacity-70 hover:opacity-100 hover:scale-[1.01]'
                }`}
                style={{
                  backgroundColor: currentTheme === theme.id ? theme.color + '15' : 'transparent',
                  borderLeft: currentTheme === theme.id ? `3px solid ${theme.color}` : '3px solid transparent',
                }}
                title={theme.label}
              >
                <span
                  className="w-5 h-5 rounded-sm flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: theme.color }}
                />
                <span className="flex-1 text-left">
                  <span className="text-gray-800 font-medium block text-xs">{theme.name}</span>
                  <span className="text-gray-400 text-[10px] block">{theme.label}</span>
                </span>
                {currentTheme === theme.id && (
                  <span className="text-red-500 text-xs font-bold">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
