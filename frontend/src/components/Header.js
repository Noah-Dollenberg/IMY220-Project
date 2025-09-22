// NJ (Noah) Dollenberg u24596142 41
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const Header = ({ currentUser }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = () => {
        authAPI.logout();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="container">
                <div className="nav-container">
                    <Link to="/home" className="nav-brand">
                        <span className="brand-icon">[B]</span>
                        BranchOut
                    </Link>
                    <div className="nav-links">
                        <Link
                            to="/home"
                            className={`nav-link ${location.pathname === '/home' ? 'active' : ''}`}
                        >
                            Home
                        </Link>
                        <Link
                            to={`/profile/${currentUser?._id}`}
                            className={`nav-link ${location.pathname.startsWith('/profile') ? 'active' : ''}`}
                        >
                            Profile
                        </Link>
                        <Link
                            to="/create-project"
                            className={`btn btn-primary create-btn ${location.pathname === '/create-project' ? 'active' : ''}`}
                        >
                            Create Project
                        </Link>
                        <div className="user-profile" onClick={() => setShowUserMenu(!showUserMenu)}>
                            <div className="profile-pic">
                                {currentUser?.name?.charAt(0) || 'U'}
                            </div>
                            {showUserMenu && (
                                <div className="user-menu">
                                    <div className="user-info">
                                        <span className="user-name">{currentUser?.name || 'User'}</span>
                                        <span className="user-email">{currentUser?.email}</span>
                                    </div>
                                    <hr />
                                    <button onClick={() => {
                                        setShowUserMenu(false);
                                        navigate(`/profile/${currentUser?._id}`);
                                    }}>
                                        View Profile
                                    </button>
                                    <button onClick={handleLogout}>
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