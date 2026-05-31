import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function FinancialCard({ title, value, change, trend, icon: Icon }) {
  return (
    <Card className="bg-card/50 border-white/5 overflow-hidden group hover:border-white/10 transition-all">
      <CardContent className="p-6 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-premium rounded-bl-full opacity-50 group-hover:opacity-70 transition-opacity" />
        
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-white/10 transition-colors">
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${trend === 'up' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {change}
            </div>
          )}
        </div>
        
        <div>
          <p className="text-muted-foreground text-sm mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
        </div>
      </CardContent>
    </Card>
  );
}
