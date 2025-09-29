// u24596142 NJ (Noah) Dollenberg 41
import React, { useState } from 'react';
import Header from '../components/Header';
import Feed from '../components/Feed';

const HomePage = ({ currentUser, onLogout }) => {
    const [activeTab, setActiveTab] = useState('local');

    return (
        <div className="home-page">
            <Header currentUser={currentUser} onLogout={onLogout} />

            <main className="home-content">
                <div className="container">
                    <div className="home-header">
                        <div className="welcome-section">
                            <h1>Welcome back!</h1>
                            <p>Here's what's happening in your projects</p>
                        </div>
                    </div>

                    <div className="feed-tabs">
                        <button
                            className={`tab-button ${activeTab === 'local' ? 'active' : ''}`}
                            onClick={() => setActiveTab('local')}
                        >
                            Local Feed
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'global' ? 'active' : ''}`}
                            onClick={() => setActiveTab('global')}
                        >
                            Global Feed
                        </button>
                    </div>

                    <div className="feed-container">
                        {activeTab === 'local' && <Feed feedType="local" />}
                        {activeTab === 'global' && <Feed feedType="global" />}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HomePage;