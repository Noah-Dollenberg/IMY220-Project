// NJ (Noah) Dollenberg u24596142
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SplashPage from './pages/SplashPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import ProjectPage from './pages/ProjectPage';

const App = () => {
    return (
        <BrowserRouter>
            <div className="app">
                <Routes>
                    <Route path="/" element={<SplashPage />} />
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/profile/:userId" element={<ProfilePage />} />
                    <Route path="/project/:projectId" element={<ProjectPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
};

export default App;