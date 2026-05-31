import React, { useState, useEffect } from 'react';
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Palette, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const PRIMARY_COLORS = [
  { name: 'Gold', value: '42 90% 64%' }, // Default
  { name: 'Emerald', value: '160 84% 39%' },
  { name: 'Ocean', value: '217 91% 60%' },
  { name: 'Royal', value: '262 83% 58%' },
  { name: 'Crimson', value: '0 72% 51%' },
];

const SECONDARY_COLORS = [
  { name: 'Dark', value: '0 0% 13%' },
  { name: 'Deep Blue', value: '222 47% 11%' },
  { name: 'Slate', value: '215 25% 27%' },
];

export default function ColorCustomizer() {
  const { theme, setTheme } = useTheme();
  const [primary, setPrimary] = useState('42 90% 64%');
  const [secondary, setSecondary] = useState('0 0% 13%');

  useEffect(() => {
    document.documentElement.style.setProperty('--brand-primary', primary);
  }, [primary]);

  useEffect(() => {
    document.documentElement.style.setProperty('--brand-secondary', secondary);
  }, [secondary]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="fixed bottom-24 right-6 md:top-6 md:right-24 z-50 rounded-full h-12 w-12 bg-card border-white/10 shadow-2xl hover:bg-white/5">
          <Palette className="w-5 h-5 text-white" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 bg-card/90 backdrop-blur-xl border-white/10 p-4 rounded-3xl" align="end" side="top">
        <div className="flex flex-col gap-6">
          <div>
            <h4 className="text-sm font-bold text-white mb-3">Modo de Exibição</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant={theme === 'light' ? 'secondary' : 'ghost'} 
                className={`rounded-xl gap-2 h-10 ${theme === 'light' ? 'bg-white text-black' : 'text-muted-foreground'}`}
                onClick={() => setTheme('light')}
              >
                <Sun size={16} /> Claro
              </Button>
              <Button 
                variant={theme === 'dark' ? 'secondary' : 'ghost'} 
                className={`rounded-xl gap-2 h-10 ${theme === 'dark' ? 'bg-white text-black' : 'text-muted-foreground'}`}
                onClick={() => setTheme('dark')}
              >
                <Moon size={16} /> Escuro
              </Button>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-3">Cor Primária</h4>
            <div className="flex flex-wrap gap-2">
              {PRIMARY_COLORS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setPrimary(c.value)}
                  className="w-10 h-10 rounded-full border-2 border-transparent transition-all flex items-center justify-center"
                  style={{ backgroundColor: `hsl(${c.value})`, borderColor: primary === c.value ? 'white' : 'transparent' }}
                >
                  {primary === c.value && <Check size={14} className="text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-3">Cor Secundária</h4>
            <div className="flex flex-wrap gap-2">
              {SECONDARY_COLORS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSecondary(c.value)}
                  className="w-10 h-10 rounded-full border-2 border-transparent transition-all flex items-center justify-center"
                  style={{ backgroundColor: `hsl(${c.value})`, borderColor: secondary === c.value ? 'white' : 'transparent' }}
                >
                  {secondary === c.value && <Check size={14} className="text-white" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
