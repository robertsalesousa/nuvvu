import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function SearchBar() {
  return (
    <div className="flex gap-3 items-center w-full">
      <div className="flex-1 flex items-center bg-input rounded-full px-4 h-12 relative overflow-hidden focus-within:ring-1 focus-within:ring-ring">
        <Search size={18} className="text-muted-foreground mr-2 shrink-0" />
        <Input 
          type="text" 
          placeholder="Buscar salão, cortes, etc..." 
          className="flex-1 bg-transparent border-0 h-full px-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm shadow-none"
        />
      </div>
      <Button variant="secondary" size="icon" className="h-12 w-12 rounded-xl bg-input shrink-0">
        <SlidersHorizontal size={18} />
      </Button>
    </div>
  );
}
