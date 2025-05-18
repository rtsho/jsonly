import React from 'react';
import { Link, useLocation } from 'react-router-dom'; // Import Link and useLocation
import { Key, Activity, CreditCard, Menu, File, Home } from 'lucide-react'; // Import icons and Menu, File, Home

interface SidebarProps {
  isCollapsed: boolean;
  onMenuToggle: () => void; // Add onMenuToggle to props
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onMenuToggle }) => { // Accept onMenuToggle prop
  const location = useLocation(); // Get current location

  const menuItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/template', icon: File, label: 'Templates' },
    { path: '/credentials', icon: Key, label: 'Credentials' },
    { path: '/usage', icon: Activity, label: 'Usage' },
    { path: '/billing', icon: CreditCard, label: 'Billing' },
  ];

  return (
    <div className={`flex flex-col bg-gray-800 text-gray-100 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}> {/* Adjust width based on collapse state */}
      {/* Sidebar Header */}
      <div className={`flex items-center justify-between p-4 text-lg font-bold border-b border-gray-700 ${isCollapsed ? 'justify-center' : ''}`}> {/* Added flex and justify-between */}
        {!isCollapsed && '🟣 PDF Analyzer'} {/* Change text based on collapse state */}
        <button
          onClick={onMenuToggle} // Call toggle function on click
          className="p-1 rounded-md hover:bg-gray-700 transition-colors"
          aria-label="Toggle Menu"
        >
          <Menu size={24} className="text-gray-300" />
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-2 py-2 rounded-md transition-colors cursor-pointer ${
              location.pathname === item.path ? 'bg-gray-700' : 'hover:bg-gray-700' // Apply highlight class
            }`}
            title={item.label} // Added title
          >
            <item.icon size={20} className={`${isCollapsed ? 'mx-auto' : 'mr-3'}`} /> {/* Center icon when collapsed */}
            {!isCollapsed && item.label} {/* Hide text when collapsed */}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;