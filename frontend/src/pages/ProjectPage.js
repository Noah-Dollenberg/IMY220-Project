// NJ (Noah) Dollenberg u24596142 41
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import { projectsAPI } from '../services/api';

const ProjectPage = ({ currentUser }) => {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [checkingOut, setCheckingOut] = useState(false);
    const [checkingIn, setCheckingIn] = useState(false);
    const [checkinData, setCheckinData] = useState({
        message: '',
        version: '',
        files: []
    });

    useEffect(() => {
        fetchProject();
    }, [projectId]);

    const fetchProject = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await projectsAPI.getById(projectId);
            setProject(response.project);
            setCheckinData(prev => ({
                ...prev,
                version: response.project.version
            }));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckout = async () => {
        setCheckingOut(true);
        try {
            await projectsAPI.checkout(projectId);
            await fetchProject();
            alert('Project checked out successfully!');
        } catch (err) {
            alert('Failed to checkout project: ' + err.message);
        } finally {
            setCheckingOut(false);
        }
    };

    const handleCheckin = async (e) => {
        e.preventDefault();

        if (!checkinData.message || !checkinData.version) {
            alert('Please provide both a message and version');
            return;
        }

        setCheckingIn(true);
        try {
            await projectsAPI.checkin(
                projectId,
                checkinData.message,
                checkinData.version,
                checkinData.files
            );
            await fetchProject();
            setCheckinData({ message: '', version: project.version, files: [] });
            alert('Project checked in successfully!');
        } catch (err) {
            alert('Failed to checkin project: ' + err.message);
        } finally {
            setCheckingIn(false);
        }
    };

    const isProjectMember = project?.members?.some(
        member => member.toString() === currentUser?._id
    );

    const canCheckout = isProjectMember && project?.status === 'checked-in';
    const canCheckin = isProjectMember &&
        project?.status === 'checked-out' &&
        project?.checkedOutBy?.toString() === currentUser?._id;

    if (loading) {
        return (
            <div className="project-page">
                <Header currentUser={currentUser} />
                <div className="loading-message">Loading project...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="project-page">
                <Header currentUser={currentUser} />
                <div className="error-message">Error loading project: {error}</div>
            </div>
        );
    }

    const overviewContent = (
        <div className="project-overview">
            <div className="project-stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">📁</div>
                    <div className="stat-info">
                        <span className="stat-number">{project.files?.length || 0}</span>
                        <span className="stat-label">Files</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-info">
                        <span className="stat-number">{project.members?.length || 0}</span>
                        <span className="stat-label">Members</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📄</div>
                    <div className="stat-info">
                        <span className="stat-number">{project.version}</span>
                        <span className="stat-label">Version</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">⚡</div>
                    <div className="stat-info">
                        <span className="stat-status">{project.status}</span>
                        <span className="stat-label">Status</span>
                    </div>
                </div>
            </div>

            <div className="project-description-card">
                <h3>About this Project</h3>
                <p>{project.description}</p>
                <div className="project-meta">
                    <span className="meta-item">
                        <strong>Language:</strong> {project.language}
                    </span>
                    <span className="meta-item">
                        <strong>Type:</strong> {project.type}
                    </span>
                    <span className="meta-item">
                        <strong>Last Updated:</strong> {new Date(project.updatedAt).toLocaleDateString()}
                    </span>
                </div>
            </div>

            <div className="project-actions-card">
                <h3>Actions</h3>
                <div className="action-buttons">
                    {canCheckout && (
                        <button
                            className="btn btn-primary"
                            onClick={handleCheckout}
                            disabled={checkingOut}
                        >
                            {checkingOut ? 'Checking Out...' : 'Check Out Project'}
                        </button>
                    )}

                    {canCheckin && (
                        <div className="checkin-form">
                            <h4>Check In Project</h4>
                            <form onSubmit={handleCheckin}>
                                <div className="form-group">
                                    <label>Check-in Message</label>
                                    <textarea
                                        value={checkinData.message}
                                        onChange={(e) => setCheckinData(prev => ({
                                            ...prev,
                                            message: e.target.value
                                        }))}
                                        placeholder="Describe your changes..."
                                        rows="3"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Version</label>
                                    <input
                                        type="text"
                                        value={checkinData.version}
                                        onChange={(e) => setCheckinData(prev => ({
                                            ...prev,
                                            version: e.target.value
                                        }))}
                                        placeholder="1.0.1"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-success"
                                    disabled={checkingIn}
                                >
                                    {checkingIn ? 'Checking In...' : 'Check In Project'}
                                </button>
                            </form>
                        </div>
                    )}

                    {!isProjectMember && (
                        <div className="not-member-message">
                            <p>You are not a member of this project</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const filesContent = (
        <div className="project-files">
            <div className="files-header">
                <h3>Project Files ({project.files?.length || 0})</h3>
            </div>
            <div className="files-list">
                {project.files?.length > 0 ? (
                    project.files.map((fileName, index) => (
                        <div key={index} className="file-item">
                            <div className="file-icon">📄</div>
                            <div className="file-details">
                                <span className="file-name">{fileName}</span>
                                <span className="file-meta">File</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        <p>No files in this project yet</p>
                    </div>
                )}
            </div>
        </div>
    );

    const messagesContent = (
        <div className="project-messages">
            <div className="messages-header">
                <h3>Recent Activity ({project.recentActivity?.length || 0})</h3>
            </div>
            <div className="messages-list">
                {project.recentActivity?.length > 0 ? (
                    project.recentActivity.map((activity) => (
                        <div key={activity._id} className={`message-item ${activity.type}`}>
                            <div className="message-indicator">
                                {activity.type === 'check-in' ? '⬆️' : '⬇️'}
                            </div>
                            <div className="message-content">
                                <div className="message-header">
                                    <span className="message-user">
                                        {activity.userInfo?.name || 'Unknown User'}
                                    </span>
                                    <span className="message-type">{activity.type}</span>
                                    <span className="message-time">
                                        {new Date(activity.timestamp).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="message-text">{activity.message}</p>
                                {activity.version && (
                                    <span className="message-version">Version: {activity.version}</span>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        <p>No activity yet</p>
                    </div>
                )}
            </div>
        </div>
    );

    const tabContent = {
        overview: overviewContent,
        files: filesContent,
        messages: messagesContent
    };

    return (
        <div className="project-page">
            <Header currentUser={currentUser} />

            <main className="project-content">
                <div className="container">
                    <div className="project-layout">
                        <div className="project-header-section">
                            <div className="project-title-area">
                                <div className="project-owner-info">
                                    <div className="owner-avatar-large">
                                        {project.ownerInfo?.name?.charAt(0) || 'U'}
                                    </div>
                                    <div className="title-details">
                                        <h1 className="project-title">{project.name}</h1>
                                        <p className="project-owner">
                                            by {project.ownerInfo?.name || 'Unknown'}
                                        </p>
                                        <div className="project-status-badge">
                                            <span className={`status-indicator ${project.status}`}>
                                                {project.status}
                                            </span>
                                        </div>
                                    </div>
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
                                💬 Activity
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