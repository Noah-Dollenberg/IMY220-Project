// NJ (Noah) Dollenberg u24596142 41
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import ProjectPreview from '../components/ProjectPreview';
import EditProfileModal from '../components/EditProfileModal';

const ProfilePage = () => {
    const { userId } = useParams();
    const [showEditProfile, setShowEditProfile] = useState(false);

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
            name: "Eddie's Project",
            description: "A React-based web application for task management",
            contributors: 3,
            status: 'checked-in',
            lastUpdate: '2 hours ago',
            owner: { name: userData.name, avatar: userData.avatar }
        },
        {
            id: 2,
            name: "Squish's Project",
            description: "Python data analysis tool for market research",
            contributors: 5,
            status: 'checked-out',
            lastUpdate: '1 day ago',
            owner: { name: userData.name, avatar: userData.avatar }
        },
        {
            id: 3,
            name: "Bonk's Project",
            description: "Mobile app for fitness tracking using React Native",
            contributors: 2,
            status: 'checked-in',
            lastUpdate: '3 days ago',
            owner: { name: userData.name, avatar: userData.avatar }
        },
        {
            id: 4,
            name: "Josh's Project",
            description: "E-commerce platform built with Node.js and MongoDB",
            contributors: 8,
            status: 'checked-out',
            lastUpdate: '1 week ago',
            owner: { name: userData.name, avatar: userData.avatar }
        }
    ];

    const friends = [
        { id: 1, name: "Bonk", avatar: "B", status: "online" },
        { id: 2, name: "Squish", avatar: "S", status: "offline" },
        { id: 3, name: "Josh", avatar: "J", status: "online" },
        { id: 4, name: "Eddie", avatar: "E", status: "away" }
    ];

    const friendRequests = [
        { id: 1, name: "David", avatar: "D", mutualFriends: 5 },
        { id: 2, name: "Micheal", avatar: "M", mutualFriends: 3 }
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
        </div>
    );
};

export default ProfilePage;