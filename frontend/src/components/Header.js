// NJ (Noah) Dollenberg u24596142 41
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
    const location = useLocation();

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
                            to="/profile/123"
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
                        <div className="user-profile">
                            <div className="profile-pic">
                                PFP
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Header;