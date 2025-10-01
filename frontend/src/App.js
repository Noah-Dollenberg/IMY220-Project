// NJ (Noah) Dollenberg u24596142
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SplashPage from './pages/SplashPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import ProjectPage from './pages/ProjectPage';
import CreateProjectPage from './pages/CreateProjectPage';
import SearchPage from './pages/SearchPage';
import { authAPI } from './services/api';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    const updateCurrentUser = (updatedUser) => {
        setCurrentUser(updatedUser);
    };

    useEffect(() => {
        checkAuthentication();
    }, []);

    const checkAuthentication = async () => {
        const token = localStorage.getItem('userToken');
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await authAPI.getCurrentUser();
            setCurrentUser(response.user);
            setIsAuthenticated(true);
        } catch (error) {
            handleLogout();
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
        setIsAuthenticated(false);
        setCurrentUser(null);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-accent">
                <div className="font-khula text-dark text-lg">Loading...</div>
            </div>
        );
    }

    return (
        <BrowserRouter>
            <div className="min-h-screen bg-accent">
                <Routes>
                    <Route
                        path="/"
                        element={isAuthenticated ? <Navigate to="/home" replace /> : <SplashPage />}
                    />
                    <Route
                        path="/home"
                        element={isAuthenticated ? <HomePage currentUser={currentUser} onLogout={handleLogout} /> : <Navigate to="/" replace />}
                    />
                    <Route
                        path="/profile/:userId"
                        element={isAuthenticated ? <ProfilePage currentUser={currentUser} onLogout={handleLogout} onUpdateUser={updateCurrentUser} /> : <Navigate to="/" replace />}
                    />
                    <Route
                        path="/project/:projectId"
                        element={isAuthenticated ? <ProjectPage currentUser={currentUser} onLogout={handleLogout} /> : <Navigate to="/" replace />}
                    />
                    <Route
                        path="/create-project"
                        element={isAuthenticated ? <CreateProjectPage currentUser={currentUser} onLogout={handleLogout} /> : <Navigate to="/" replace />}
                    />
                    <Route
                        path="/search"
                        element={isAuthenticated ? <SearchPage currentUser={currentUser} onLogout={handleLogout} /> : <Navigate to="/" replace />}
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;