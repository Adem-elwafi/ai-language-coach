import React, { useState } from 'react';
import { 
  Home, 
  BookOpen, 
  History, 
  Settings, 
  LogIn, 
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '../utils/cn';
import SidebarItem from './SidebarItem';

const Sidebar = ({ onNavigate }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('journal');

  const menuItems = [
    { id: 'journal', label: 'Journal Entry', icon: Home },
    { id: 'history', label: 'History', icon: History },
    { id: 'lessons', label: 'My Lessons', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'login', label: 'Login', icon: LogIn },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleItemClick = (itemId) => {
    setActiveItem(itemId);
    if (onNavigate) {
      onNavigate(itemId);
    }
    console.log(`Sidebar item clicked: ${itemId}`);
  };

  return (
    <div
      className={cn(
        'h-screen bg-slate-800 dark:bg-gray-900 text-white dark:text-white flex flex-col overflow-hidden transition-[width] duration-300 ease-in-out border-r border-slate-700 dark:border-gray-800',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="h-[72px] px-4 py-3 border-b  border-slate-700 dark:border-gray-700 flex items-center justify-between">
        <div className={cn('flex items-center gap-2 overflow-hidden ',isCollapsed ? 'max-w-0 opacity-0' : 'max-w-xs opacity-100')} >
          <div className=" w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-lg">🇫🇷</span>
          </div>
          <h2
            className={cn(
              'text-xl font-bold transition-[max-width,opacity] duration-200 ease-out whitespace-nowrap',
              
            )}
          >
            AI Coach
          </h2>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-slate-700 dark:hover:bg-gray-800 rounded"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activeItem === item.id}
            isCollapsed={isCollapsed}
            onClick={() => handleItemClick(item.id)}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700 dark:border-gray-700">
        <div className={cn(
          'space-y-2 overflow-hidden transition-[max-width,opacity] duration-200 ease-out',
          isCollapsed ? 'max-w-0 opacity-0' : 'max-w-xs opacity-100'
        )}>
          <div className="flex items-center gap-3 p-2">
            <div className="w-8 h-8 bg-slate-700 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <User size={16} />
            </div>
            <div>
              <p className="text-sm font-medium">Guest User</p>
              <p className="text-xs text-slate-400 dark:text-gray-400">Not logged in</p>
            </div>
          </div>
          <div className="text-xs text-slate-400 dark:text-gray-400 text-center">
            AI Language Coach v1.0
          </div>
        </div>
        {isCollapsed && (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-slate-700 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <User size={16} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
