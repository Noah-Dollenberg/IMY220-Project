// NJ (Noah) Dollenberg u24596142 41
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authAPI, friendsAPI, projectsAPI } from '../services/api';

const Header = ({ currentUser, onLogout }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [hoverTimeout, setHoverTimeout] = useState(null);
    const [notificationCount, setNotificationCount] = useState(0);

    useEffect(() => {
        if (currentUser) {
            loadNotifications();
        }
    }, [currentUser]);

    const loadNotifications = async () => {
        try {
            const friendRequests = await friendsAPI.getRequests().catch(() => ({ requests: [] }));
            const projectInvitations = await projectsAPI.getInvitations().catch(() => ({ invitations: [] }));
            const total = (friendRequests.requests?.length || 0) + (projectInvitations.invitations?.length || 0);
            setNotificationCount(total);
        } catch (error) {
            console.error('Failed to load notifications:', error);
            setNotificationCount(0);
        }
    };

    window.refreshNotifications = loadNotifications;

    const handleLogout = () => {
        authAPI.logout();
        if (onLogout) onLogout();
        navigate('/');
    };

    return (
        <nav className="bg-white border-b-4 border-highlight">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex justify-between items-center py-4">
                    <Link to="/home" className="flex items-center font-inter text-xl font-bold text-dark">
                        <span className="bg-highlight text-dark px-2 py-1 rounded mr-2 font-bold">[B]</span>
                        BranchOut
                    </Link>
                    <div className="flex items-center space-x-8">
                        <Link
                            to="/home"
                            className={`font-khula text-sm font-medium ${
                                location.pathname === '/home' 
                                    ? 'text-dark' 
                                    : 'text-darker hover:text-dark'
                            }`}
                        >
                            Home
                        </Link>
                        <Link
                            to={`/profile/${currentUser?._id}`}
                            className={`font-khula text-sm font-medium relative ${
                                location.pathname.startsWith('/profile') 
                                    ? 'text-dark' 
                                    : 'text-darker hover:text-dark'
                            }`}
                        >
                            Profile
                            {notificationCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {notificationCount > 9 ? '9+' : notificationCount}
                                </span>
                            )}
                        </Link>
                        <Link
                            to="/search"
                            className={`font-khula text-sm font-medium ${
                                location.pathname === '/search' 
                                    ? 'text-dark' 
                                    : 'text-darker hover:text-dark'
                            }`}
                        >
                            Search
                        </Link>
                        <Link
                            to="/create-project"
                            className="bg-highlight text-dark px-4 py-2 rounded font-khula text-sm font-medium hover:bg-yellow-400 transition-colors"
                        >
                            Create Project
                        </Link>
                        <div 
                            className="relative"
                            onMouseEnter={() => {
                                if (hoverTimeout) clearTimeout(hoverTimeout);
                                setShowUserMenu(true);
                            }}
                            onMouseLeave={() => {
                                const timeout = setTimeout(() => setShowUserMenu(false), 1500);
                                setHoverTimeout(timeout);
                            }}
                        >
                            <div className="w-8 h-8 bg-fill rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors">
                                {currentUser?.profilePicture ? (
                                    <img 
                                        src={currentUser.profilePicture} 
                                        alt="Profile" 
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                ) : (
                                    <span className="text-dark">👤</span>
                                )}
                            </div>
                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow-lg py-1 z-50 border border-fill">
                                    <div className="px-4 py-2 text-sm text-dark border-b border-fill font-khula">
                                        <span className="font-bold">{currentUser?.name || 'User'}</span>
                                    </div>
                                    <button 
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-sm text-darker hover:bg-accent font-khula"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Header;