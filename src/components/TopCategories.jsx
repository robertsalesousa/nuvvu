import React from 'react';
import { Scissors, Sparkles, Smile, Droplet } from 'lucide-react';

const categories = [
  { name: 'Corte', icon: Scissors, active: true },
  { name: 'Tintura', icon: Droplet, active: false },
  { name: 'Facial', icon: Smile, active: false },
  { name: 'Massagem', icon: Sparkles, active: false }
];

export default function TopCategories() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 px-4 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {categories.map((cat, idx) => (
        <div key={idx} className={`flex flex-col items-center gap-2 cursor-pointer group ${cat.active ? 'active' : ''}`}>
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-200 ${cat.active ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-card text-foreground group-hover:bg-muted shadow-sm'}`}>
            <cat.icon size={24} />
          </div>
          <span className={`text-[13px] font-medium ${cat.active ? 'text-primary' : 'text-muted-foreground'}`}>
            {cat.name}
          </span>
        </div>
      ))}
    </div>
  );
}
