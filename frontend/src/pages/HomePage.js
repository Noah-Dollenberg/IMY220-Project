// u24596142 NJ (Noah) Dollenberg 41
import React, { useState } from 'react';
import Header from '../components/Header';
import Feed from '../components/Feed';

const HomePage = ({ currentUser, onLogout }) => {
    const [activeTab, setActiveTab] = useState('local');

    return (
        <div className="min-h-screen bg-accent">
            <Header currentUser={currentUser} onLogout={onLogout} />

            <main className="py-8">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-8">
                        <h1 className="font-inter text-3xl font-bold text-dark mb-2">Welcome back!</h1>
                        <p className="font-khula text-darker">Here's what's happening in your projects</p>
                    </div>

                    <div className="flex justify-center mb-8">
                        <div className="bg-white rounded-lg p-1 shadow-sm">
                            <button
                                className={`px-6 py-2 rounded font-khula text-sm font-medium transition-colors ${
                                    activeTab === 'local' 
                                        ? 'bg-highlight text-dark' 
                                        : 'text-darker hover:text-dark'
                                }`}
                                onClick={() => setActiveTab('local')}
                            >
                                Local Feed
                            </button>
                            <button
                                className={`px-6 py-2 rounded font-khula text-sm font-medium transition-colors ${
                                    activeTab === 'global' 
                                        ? 'bg-highlight text-dark' 
                                        : 'text-darker hover:text-dark'
                                }`}
                                onClick={() => setActiveTab('global')}
                            >
                                Global Feed
                            </button>
                        </div>
                    </div>

                    <Feed feedType={activeTab} />
                </div>
            </main>
        </div>
    );
};

export default HomePage;