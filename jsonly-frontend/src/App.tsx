import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FileUploadSection from './components/FileUploadSection';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { AppProvider, useAppContext } from './context/AppContext';
import AuthModal from './components/AuthModal';
import VerifyEmail from './components/VerifyEmail';
import HomePage from './pages/HomePage';
import TemplatePage from './pages/TemplatePage';
import CredentialsPage from './pages/CredentialsPage';
import UsagePage from './pages/UsagePage';
import SubscriptionPage from './pages/SubscriptionPage';
import PrivacyNotice from './pages/PrivacyNotice'; // Assuming .md files are handled or converted
import TermsOfService from './pages/TermsOfService'; // Assuming .md files are handled or converted

function AppWithModal() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const { isAuthModalOpen, setIsAuthModalOpen } = useAppContext();

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100">
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <Sidebar isCollapsed={isSidebarCollapsed} onMenuToggle={toggleSidebar} />
      <div className={`flex-1 flex flex-col transition-all duration-300`}>
        <div className={`container mx-auto px-4 py-8 transition-all duration-300 ${isSidebarCollapsed ? 'pl-8' : 'pl-16'}`}>
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/template" element={<TemplatePage />} />
            <Route path="/credentials" element={<CredentialsPage />} />
            <Route path="/usage" element={<UsagePage />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/privacy" element={<PrivacyNotice />} />
            <Route path="/terms" element={<TermsOfService />} />
          </Routes>
          <footer className="w-full text-center py-4 text-gray-400 text-sm border-t border-gray-800 mt-8">
            <div className="mb-2">
              <a href="/privacy" className="hover:underline mx-2">Privacy Notice</a> |
              <a href="/terms" className="hover:underline mx-2">Terms of Service</a>
            </div>
            <p>© {new Date().getFullYear()} JSONly. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppProvider>
        <AppWithModal />
      </AppProvider>
    </Router>
  );
}

export default App;