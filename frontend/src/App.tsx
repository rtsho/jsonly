import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FileUploadSection from './components/FileUploadSection';
import Header from './components/Header';
import { AppProvider } from './context/AppContext';
import VerifyEmail from './components/VerifyEmail';

function App() {
  return (
    <Router>
      <AppProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100">
          <div className="container mx-auto px-4 py-8">
            <Header />
            <Routes>
              <Route path="/" element={<FileUploadSection />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
            </Routes>
            <footer className="mt-16 text-center text-gray-400 text-sm">
              <p>© {new Date().getFullYear()} PDF Analyzer. All rights reserved.</p>
            </footer>
          </div>
        </div>
      </AppProvider>
    </Router>
  );
}

export default App;