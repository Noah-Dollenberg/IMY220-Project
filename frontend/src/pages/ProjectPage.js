// u24596142 NJ (Noah) Dollenberg 41
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';

const ProjectPage = () => {
    const { projectId } = useParams();
    const [activeTab, setActiveTab] = useState('overview');

    const projectData = {
        id: projectId,
        name: `Project #${projectId}`,
        description: "A comprehensive web application for version control and collaboration",
        language: "JavaScript",
        version: "1.2.0",
        status: "checked-in",
        contributors: 5,
        lastUpdate: "2 hours ago",
        owner: {
            name: "John Developer",
            avatar: "JD"
        },
        files: [
            { name: "index.js", size: "2.4 KB", modified: "2 hours ago" },
            { name: "package.json", size: "1.8 KB", modified: "1 day ago" },
            { name: "README.md", size: "3.2 KB", modified: "3 days ago" },
            { name: "src/components", type: "folder", items: 8, modified: "1 day ago" }
        ],
        messages: [
            { id: 1, type: "check-in", user: "John Developer", message: "Fixed authentication bug", time: "2 hours ago" },
            { id: 2, type: "check-out", user: "Sarah Coder", message: "Working on user interface updates", time: "4 hours ago" },
            { id: 3, type: "check-in", user: "Mike Wilson", message: "Added new API endpoints", time: "1 day ago" }
        ]
    };

    const tabContent = {
        overview: (
            <div className="project-overview">
                <div className="project-stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">📁</div>
                        <div className="stat-info">
                            <span className="stat-number">{projectData.files.length}</span>
                            <span className="stat-label">Files</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-info">
                            <span className="stat-number">{projectData.contributors}</span>
                            <span className="stat-label">Contributors</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🔄</div>
                        <div className="stat-info">
                            <span className="stat-number">{projectData.version}</span>
                            <span className="stat-label">Version</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">⚡</div>
                        <div className="stat-info">
                            <span className="stat-status">{projectData.status}</span>
                            <span className="stat-label">Status</span>
                        </div>
                    </div>
                </div>

                <div className="project-description-card">
                    <h3>About this Project</h3>
                    <p>{projectData.description}</p>
                    <div className="project-meta">
                        <span className="meta-item">
                            <strong>Language:</strong> {projectData.language}
                        </span>
                        <span className="meta-item">
                            <strong>Last Updated:</strong> {projectData.lastUpdate}
                        </span>
                    </div>
                </div>
            </div>
        ),
        files: (
            <div className="project-files">
                <div className="files-header">
                    <h3>Project Files</h3>
                    <button className="btn btn-primary btn-small">Add File</button>
                </div>
                <div className="files-list">
                    {projectData.files.map((file, index) => (
                        <div key={index} className="file-item">
                            <div className="file-icon">
                                {file.type === 'folder' ? '📁' : '📄'}
                            </div>
                            <div className="file-details">
                                <span className="file-name">{file.name}</span>
                                <span className="file-meta">
                                    {file.type === 'folder'
                                        ? `${file.items} items`
                                        : file.size
                                    } • Modified {file.modified}
                                </span>
                            </div>
                            <div className="file-actions">
                                <button className="btn-icon">👁️</button>
                                <button className="btn-icon">✏️</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ),
        messages: (
            <div className="project-messages">
                <div className="messages-header">
                    <h3>Check-in/Check-out Messages</h3>
                    <button className="btn btn-primary btn-small">New Message</button>
                </div>
                <div className="messages-list">
                    {projectData.messages.map((message) => (
                        <div key={message.id} className={`message-item ${message.type}`}>
                            <div className="message-indicator">
                                {message.type === 'check-in' ? '⬆️' : '⬇️'}
                            </div>
                            <div className="message-content">
                                <div className="message-header">
                                    <span className="message-user">{message.user}</span>
                                    <span className="message-type">{message.type}</span>
                                    <span className="message-time">{message.time}</span>
                                </div>
                                <p className="message-text">{message.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    };

    return (
        <div className="project-page">
            <Header />

            <main className="project-content">
                <div className="container">
                    <div className="project-layout">
                        <div className="project-header-section">
                            <div className="project-title-area">
                                <div className="project-owner-info">
                                    <div className="owner-avatar-large">{projectData.owner.avatar}</div>
                                    <div className="title-details">
                                        <h1 className="project-title">{projectData.name}</h1>
                                        <p className="project-owner">by {projectData.owner.name}</p>
                                    </div>
                                </div>
                                <div className="project-actions">
                                    <button className="btn btn-secondary">Clone</button>
                                    <button className="btn btn-primary">Edit Project</button>
                                </div>
                            </div>
                        </div>

                        <div className="project-nav">
                            <button
                                className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
                                onClick={() => setActiveTab('overview')}
                            >
                                📊 Overview
                            </button>
                            <button
                                className={`nav-tab ${activeTab === 'files' ? 'active' : ''}`}
                                onClick={() => setActiveTab('files')}
                            >
                                📁 Files
                            </button>
                            <button
                                className={`nav-tab ${activeTab === 'messages' ? 'active' : ''}`}
                                onClick={() => setActiveTab('messages')}
                            >
                                💬 Messages
                            </button>
                        </div>

                        <div className="project-main-content">
                            {tabContent[activeTab]}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProjectPage;