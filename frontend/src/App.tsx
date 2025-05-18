import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FileUploadSection from './components/FileUploadSection';
import Header from './components/Header';
import Sidebar from './components/Sidebar'; // Import Sidebar component
import { AppProvider, useAppContext } from './context/AppContext';
import AuthModal from './components/AuthModal';
import VerifyEmail from './components/VerifyEmail';
import HomePage from './pages/HomePage'; // Import HomePage
import TemplatePage from './pages/TemplatePage'; // Import TemplatePage
import CredentialsPage from './pages/CredentialsPage'; // Import CredentialsPage
import UsagePage from './pages/UsagePage'; // Import UsagePage
import BillingPage from './pages/BillingPage'; // Import BillingPage

function AppWithModal() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false); // State for sidebar collapse
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
            <Route path="/billing" element={<BillingPage />} />
          </Routes>
          <footer className="mt-16 text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} PDF Analyzer. All rights reserved.</p>
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