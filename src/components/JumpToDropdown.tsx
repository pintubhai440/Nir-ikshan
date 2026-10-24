import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Compass } from 'lucide-react';

export interface JumpOption {
  id: string;
  title: string;
  badge?: string;
  icon?: React.ElementType;
  iconBg?: string;
  category?: string;
}

interface JumpToDropdownProps {
  currentValue: string;
  options: JumpOption[];
  onSelect: (id: string) => void;
  hubOptionLabel?: string;
  hubOptionId?: string;
  hubIcon?: React.ElementType;
  className?: string;
  align?: 'right' | 'left';
}

export const JumpToDropdown: React.FC<JumpToDropdownProps> = ({
  currentValue,
  options,
  onSelect,
  hubOptionLabel = 'Executive Hub (All Modules)',
  hubOptionId = 'hub',
  hubIcon: HubIcon,
  className = '',
  align = 'right',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const isHub = currentValue === hubOptionId;
  const currentOption = options.find((opt) => opt.id === currentValue);
  const displayLabel = isHub ? hubOptionLabel : (currentOption?.title || currentValue);
  const CurrentIcon = isHub ? (HubIcon || Compass) : (currentOption?.icon || Compass);

  return (
    <div className={`relative inline-flex items-center gap-1.5 ${className}`} ref={dropdownRef}>
      <span className="text-[11px] font-bold text-slate-500 hidden sm:inline select-none">
        Jump to:
      </span>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-white hover:bg-sky-50/60 text-slate-800 border border-slate-200/90 hover:border-[#0077B6]/50 shadow-2xs font-bold text-xs transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0077B6]/20 active:scale-98 group"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="w-5 h-5 rounded-md bg-[#CAF0F8]/60 text-[#0077B6] flex items-center justify-center shrink-0">
          <CurrentIcon className="w-3.5 h-3.5" />
        </div>
        <span className="text-[#03045E] font-bold max-w-[130px] sm:max-w-[190px] truncate text-left">
          {displayLabel}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-[#0077B6] transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-[#0077B6]' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute top-full mt-2 z-50 w-72 sm:w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/90 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
          role="listbox"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              Quick Navigation
            </span>
            <span className="text-[10px] font-mono text-[#0077B6] font-bold bg-[#CAF0F8] px-2 py-0.5 rounded-full">
              {options.length + 1} Portals
            </span>
          </div>

          {/* Hub Option */}
          <button
            type="button"
            onClick={() => {
              onSelect(hubOptionId);
              setIsOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
              isHub
                ? 'bg-sky-50 text-[#03045E] font-black border border-sky-200/80 shadow-2xs'
                : 'hover:bg-slate-50 text-slate-700 font-semibold'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#03045E] flex items-center justify-center shrink-0">
                {HubIcon ? <HubIcon className="w-4 h-4" /> : <Compass className="w-4 h-4" />}
              </div>
              <div className="truncate">
                <div className="truncate text-slate-900 font-bold">{hubOptionLabel}</div>
                <div className="text-[10px] text-slate-400 font-normal">Command Center Hub</div>
              </div>
            </div>
            {isHub && <Check className="w-4 h-4 text-[#0077B6] shrink-0 ml-2" />}
          </button>

          <div className="h-px bg-slate-100 my-1"></div>

          {/* Scrollable list of modules */}
          <div className="max-h-64 sm:max-h-72 overflow-y-auto space-y-0.5 pr-1 scrollbar-thin">
            {options.map((opt) => {
              const isSelected = currentValue === opt.id;
              const IconComp = opt.icon || Compass;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onSelect(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer group ${
                    isSelected
                      ? 'bg-sky-50 text-[#03045E] font-black border border-sky-200/80 shadow-2xs'
                      : 'hover:bg-slate-50 text-slate-700 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                        opt.iconBg || 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 truncate">
                      <div className="truncate text-slate-800 group-hover:text-[#0077B6] font-bold">
                        {opt.title}
                      </div>
                      {opt.badge && (
                        <span className="text-[10px] text-slate-400 block truncate">
                          {opt.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-[#0077B6] shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
