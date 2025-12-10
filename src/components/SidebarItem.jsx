import React from 'react';
import { cn } from '../utils/cn';

const SidebarItem = ({
  icon: Icon,
  label,
  active = false,
  isCollapsed,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center p-3 rounded-lg transition-colors duration-200',
        active
          ? 'bg-primary-600 text-white shadow-lg'
          : 'hover:bg-slate-700 text-slate-200 hover:text-white',
        isCollapsed ? 'justify-center' : 'gap-3'
      )}
      aria-label={label}
    >
      <Icon className="flex-shrink-0" size={20} />
      <span
        className={cn(
          'font-medium whitespace-nowrap overflow-hidden transition-[max-width,opacity] duration-300 ease-in-out',
          isCollapsed ? 'max-w-0 opacity-0' : 'max-w-xs opacity-100'
        )}
      >
        {label}
      </span>
    </button>
  );
};

export default SidebarItem;
