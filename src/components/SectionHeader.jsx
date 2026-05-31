import React from 'react';

export default function SectionHeader({ title, actionText = "See All" }) {
  return (
    <div className="flex justify-between items-center mb-4 px-4 md:px-0">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        {actionText}
      </button>
    </div>
  );
}
