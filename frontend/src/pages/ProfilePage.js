// NJ (Noah) Dollenberg u24596142 41
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import ProjectPreview from '../components/ProjectPreview';
import EditProfileModal from '../components/EditProfileModal';
import CreateProjectModal from '../components/CreateProjectModal';

const ProfilePage = () => {
    const { userId } = useParams();
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showCreateProject, setShowCreateProject] = useState(false);

    const userData = {
        id: userId,
        name: "USER'S NAME",
        email: "email@example.com",
        birthDate: "2000/01/01",
        company: "COMPANY",
        country: "COUNTRY",
        avatar: "PFP",
        joinDate: "January 2024",
        projectsCount: 12,
        followersCount: 45,
        followingCount: 38
    };

    const userProjects = [
        {
            id: 1,
            name: "M's Project",
            description: "A React-based web application for task management",
            contributors: 3,
            status: 'checked-in',
            lastUpdate: '2 hours ago',
            owner: { name: userData.name, avatar: userData.avatar }
        },
        {
            id: 2,
            name: "N's Project",
            description: "Python data analysis tool for market research",
            contributors: 5,
            status: 'checked-out',
            lastUpdate: '1 day ago',
            owner: { name: userData.name, avatar: userData.avatar }
        },
        {
            id: 3,
            name: "O's Project",
            description: "Mobile app for fitness tracking using React Native",
            contributors: 2,
            status: 'checked-in',
            lastUpdate: '3 days ago',
            owner: { name: userData.name, avatar: userData.avatar }
        },
        {
            id: 4,
            name: "P's Project",
            description: "E-commerce platform built with Node.js and MongoDB",
            contributors: 8,
            status: 'checked-out',
            lastUpdate: '1 week ago',
            owner: { name: userData.name, avatar: userData.avatar }
        }
    ];

    const friends = [
        { id: 1, name: "User1", avatar: "1", status: "online" },
        { id: 2, name: "User2", avatar: "2", status: "offline" },
        { id: 3, name: "User3", avatar: "3", status: "online" },
        { id: 4, name: "User4", avatar: "4", status: "away" }
    ];

    const friendRequests = [
        { id: 1, name: "Alex Johnson", avatar: "A", mutualFriends: 5 },
        { id: 2, name: "Sarah Wilson", avatar: "S", mutualFriends: 3 }
    ];

    return (
        <div className="profile-page">
            <Header />

            <main className="profile-content">
                <div className="container">
                    <div className="profile-layout">
                        <div className="profile-sidebar">
                            <div className="profile-card">
                                <div className="profile-header">
                                    <div className="profile-avatar-large">
                                        {userData.avatar}
                                    </div>
                                    <div className="profile-info">
                                        <h1 className="profile-name">{userData.name}</h1>
                                        <button
                                            className="btn btn-secondary edit-profile-btn"
                                            onClick={() => setShowEditProfile(true)}
                                        >
                                            Edit Profile
                                        </button>
                                    </div>
                                </div>

                                <div className="profile-details">
                                    <div className="detail-item">
                                        <span className="detail-icon">📧</span>
                                        <span className="detail-text">{userData.email}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-icon">🎂</span>
                                        <span className="detail-text">{userData.birthDate}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-icon">🏢</span>
                                        <span className="detail-text">{userData.company}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-icon">🌍</span>
                                        <span className="detail-text">{userData.country}</span>
                                    </div>
                                </div>

                                <div className="profile-stats">
                                    <div className="stat-item">
                                        <span className="stat-number">{userData.projectsCount}</span>
                                        <span className="stat-label">Projects</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-number">{userData.followersCount}</span>
                                        <span className="stat-label">Followers</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-number">{userData.followingCount}</span>
                                        <span className="stat-label">Following</span>
                                    </div>
                                </div>
                            </div>

                            <div className="friends-section">
                                <h3>Friends</h3>
                                <div className="friends-list">
                                    {friends.map(friend => (
                                        <div key={friend.id} className="friend-item">
                                            <div className="friend-avatar">
                                                {friend.avatar}
                                                <div className={`status-indicator ${friend.status}`}></div>
                                            </div>
                                            <span className="friend-name">{friend.name}</span>
                                        </div>
                                    ))}
                                </div>

                                {friendRequests.length > 0 && (
                                    <div className="friend-requests">
                                        <h4>Friend Requests</h4>
                                        {friendRequests.map(request => (
                                            <div key={request.id} className="request-item">
                                                <div className="request-info">
                                                    <div className="friend-avatar">{request.avatar}</div>
                                                    <div className="request-details">
                                                        <span className="friend-name">{request.name}</span>
                                                        <span className="mutual-friends">{request.mutualFriends} mutual friends</span>
                                                    </div>
                                                </div>
                                                <div className="request-actions">
                                                    <button className="btn-small btn-primary">Add</button>
                                                    <button className="btn-small btn-secondary">Decline</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="profile-main">
                            <div className="section-header">
                                <div>
                                    <h2>Latest Projects</h2>
                                    <p>Projects you've created or contributed to</p>
                                </div>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setShowCreateProject(true)}
                                >
                                    Create Project
                                </button>
                            </div>

                            <div className="projects-grid">
                                {userProjects.map(project => (
                                    <ProjectPreview
                                        key={project.id}
                                        project={project}
                                        showContributors={true}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {showEditProfile && (
                <EditProfileModal
                    user={userData}
                    onClose={() => setShowEditProfile(false)}
                />
            )}

            {showCreateProject && (
                <CreateProjectModal
                    onClose={() => setShowCreateProject(false)}
                />
            )}

            <style jsx>{`
        .profile-page {
          min-height: 100vh;
          background-color: var(--accent-bg);
        }

        .profile-content {
          padding: 32px 0;
        }

        .profile-layout {
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: 32px;
        }

        .profile-sidebar {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .profile-card {
          background-color: var(--white);
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        .profile-avatar-large {
          width: 80px;
          height: 80px;
          background-color: var(--fill-color);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', sans-serif;
          font-size: 32px;
          font-weight: 700;
          color: var(--main-text);
          flex-shrink: 0;
        }

        .profile-info {
          flex: 1;
        }

        .profile-name {
          font-family: 'Inter', sans-serif;
          font-size: 24px;
          font-weight: 700;
          color: var(--main-text);
          margin-bottom: 12px;
        }

        .edit-profile-btn {
          padding: 8px 16px;
          font-size: 14px;
        }

        .profile-details {
          margin-bottom: 24px;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .detail-item:last-child {
          margin-bottom: 0;
        }

        .detail-icon {
          font-size: 16px;
          width: 20px;
        }

        .detail-text {
          font-family: 'Khula', sans-serif;
          color: var(--main-text);
          font-size: 14px;
        }

        .profile-stats {
          display: flex;
          justify-content: space-around;
          padding-top: 24px;
          border-top: 1px solid var(--fill-color);
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          font-family: 'Inter', sans-serif;
          font-size: 24px;
          font-weight: 700;
          color: var(--main-text);
          display: block;
        }

        .stat-label {
          font-family: 'Khula', sans-serif;
          font-size: 12px;
          color: var(--soft-text);
        }

        .friends-section {
          background-color: var(--white);
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .friends-section h3 {
          font-family: 'Inter', sans-serif;
          font-size: 18px;
          font-weight: 600;
          color: var(--main-text);
          margin-bottom: 16px;
        }

        .friends-section h4 {
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          font-weight: 600;
          color: var(--main-text);
          margin-bottom: 12px;
          margin-top: 24px;
        }

        .friends-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .friend-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px;
          border-radius: 8px;
          transition: background-color 0.3s ease;
        }

        .friend-item:hover {
          background-color: var(--accent-bg);
        }

        .friend-avatar {
          position: relative;
          width: 36px;
          height: 36px;
          background-color: var(--fill-color);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: var(--main-text);
          flex-shrink: 0;
        }

        .status-indicator {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid white;
        }

        .status-indicator.online {
          background-color: #27ae60;
        }

        .status-indicator.offline {
          background-color: #95a5a6;
        }

        .status-indicator.away {
          background-color: #f39c12;
        }

        .friend-name {
          font-family: 'Khula', sans-serif;
          font-size: 14px;
          color: var(--main-text);
        }

        .friend-requests {
          border-top: 1px solid var(--fill-color);
          padding-top: 16px;
        }

        .request-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid var(--accent-bg);
        }

        .request-item:last-child {
          border-bottom: none;
        }

        .request-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .request-details {
          display: flex;
          flex-direction: column;
        }

        .mutual-friends {
          font-family: 'Khula', sans-serif;
          font-size: 12px;
          color: var(--soft-text);
        }

        .request-actions {
          display: flex;
          gap: 8px;
        }

        .btn-small {
          padding: 4px 8px;
          font-size: 12px;
          border-radius: 4px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-small.btn-primary {
          background-color: var(--highlight);
          color: var(--main-text);
        }

        .btn-small.btn-secondary {
          background-color: var(--fill-color);
          color: var(--main-text);
        }

        .profile-main {
          background-color: var(--white);
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .section-header h2 {
          font-family: 'Inter', sans-serif;
          font-size: 24px;
          font-weight: 700;
          color: var(--main-text);
          margin-bottom: 4px;
        }

        .section-header p {
          font-family: 'Khula', sans-serif;
          color: var(--soft-text);
          font-size: 14px;
        }

        .projects-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        @media (max-width: 1024px) {
          .profile-layout {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          
          .profile-sidebar {
            order: 2;
          }
          
          .profile-main {
            order: 1;
          }
        }

        @media (max-width: 768px) {
          .profile-content {
            padding: 20px 0;
          }
          
          .section-header {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }
          
          .profile-header {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
        </div>
    );
};

export default ProfilePage;