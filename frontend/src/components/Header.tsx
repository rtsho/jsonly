import React, { useState } from 'react';
import { FileText, LogIn, LogOut, Mail } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import AuthModal from './AuthModal';

const Header = () => {
  const { user, signInWithGoogle, signOut } = useAppContext();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <header className="pt-6 pb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-purple-600 p-2 rounded-lg mr-3">
            <FileText size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600">
              Document Analyzer
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Upload your documents for instant analysis
            </p>
          </div>
        </div>
        
        <div>
          {user ? (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-300">{user.displayName || user.email}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 text-sm transition-colors"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm transition-colors"
            >
              <LogIn size={16} />
              Sign In
            </button>
          )}
        </div>
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>
  );
};

export default Header;