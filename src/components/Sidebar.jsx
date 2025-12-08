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

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('journal');

  const menuItems = [
    { id: 'journal', label: 'Journal Entry', icon: <Home size={20} /> },
    { id: 'history', label: 'History', icon: <History size={20} /> },
    { id: 'lessons', label: 'My Lessons', icon: <BookOpen size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
    { id: 'login', label: 'Login', icon: <LogIn size={20} /> },
    { id: 'profile', label: 'Profile', icon: <User size={20} /> },
  ];

  const handleItemClick = (itemId) => {
    setActiveItem(itemId);
    console.log(`Sidebar item clicked: ${itemId}`);
    // TODO: Add navigation logic later
  };

  return (
    <div className={`h-screen bg-gray-900 text-white transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <span className="text-lg">🇫🇷</span>
            </div>
            <h2 className="text-xl font-bold">AI Coach</h2>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-gray-800 rounded"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleItemClick(item.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
              activeItem === item.id
                ? 'bg-primary-600 text-white'
                : 'hover:bg-gray-800 text-gray-300'
            } ${isCollapsed ? 'justify-center' : ''}`}
            aria-label={item.label}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!isCollapsed && (
              <span className="font-medium">{item.label}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        {!isCollapsed ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-2">
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                <User size={16} />
              </div>
              <div>
                <p className="text-sm font-medium">Guest User</p>
                <p className="text-xs text-gray-400">Not logged in</p>
              </div>
            </div>
            <div className="text-xs text-gray-500 text-center">
              AI Language Coach v1.0
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
              <User size={16} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
