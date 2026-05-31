import React from 'react';
import { Star, MapPin, Bookmark } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SalonCard({ name, address, rating, image, onClick }) {
  return (
    <Card 
      onClick={onClick} 
      className="relative w-full h-[200px] overflow-hidden cursor-pointer group border-0 ring-1 ring-border/50 hover:ring-border transition-all"
    >
      <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30 pointer-events-none"></div>
      
      <Badge variant="secondary" className="absolute top-3 left-3 bg-white/95 hover:bg-white text-black font-bold flex items-center gap-1.5 px-2 py-1">
        <Star size={12} fill="#F5C451" color="#F5C451" />
        {rating}
      </Badge>
      
      <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-colors">
        <Bookmark size={16} />
      </button>

      <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
        <h3 className="text-lg font-semibold text-white mb-1 leading-tight">{name}</h3>
        <div className="flex items-center gap-1.5 text-[13px] text-gray-300">
          <MapPin size={12} />
          <span className="truncate">{address}</span>
        </div>
      </div>
    </Card>
  );
}
