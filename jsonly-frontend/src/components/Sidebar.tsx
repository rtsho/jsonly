import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Key, Activity, CreditCard, Menu, File, Home } from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onMenuToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onMenuToggle }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/template', icon: File, label: 'Templates' },
    { path: '/credentials', icon: Key, label: 'Credentials & API' },
    { path: '/usage', icon: Activity, label: 'Usage' },
    { path: '/subscription', icon: CreditCard, label: 'My Subscription' },
  ];

  return (
    <div className={`flex flex-col bg-gray-800 text-gray-100 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className={`flex items-center justify-between p-4 text-lg font-bold border-b border-gray-700 ${isCollapsed ? 'justify-center' : ''}`}>
        {!isCollapsed && '🟣 PDF Analyzer'}
        <button
          onClick={onMenuToggle}
          className="p-1 rounded-md hover:bg-gray-700 transition-colors"
          aria-label="Toggle Menu"
        >
          <Menu size={24} className="text-gray-300" />
        </button>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-2 py-2 rounded-md transition-colors cursor-pointer ${
              location.pathname === item.path ? 'bg-gray-700' : 'hover:bg-gray-700'
            }`}
            title={item.label}
          >
            <item.icon size={20} className={`${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
            {!isCollapsed && item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;