// NJ (Noah) Dollenberg u24596142 41
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import ProjectPreview from '../components/ProjectPreview';
import EditProfileModal from '../components/EditProfileModal';
import { usersAPI, projectsAPI, friendsAPI } from '../services/api';

const ProfilePage = ({ currentUser, onLogout }) => {
    const { userId } = useParams();
    const [profileUser, setProfileUser] = useState(null);
    const [userProjects, setUserProjects] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showEditProfile, setShowEditProfile] = useState(false);

    const isOwnProfile = currentUser?._id === userId;

    useEffect(() => {
        fetchProfileData();
    }, [userId]);

    const fetchProfileData = async () => {
        setLoading(true);
        setError(null);

        try {
            const [userResponse, projectsResponse] = await Promise.all([
                usersAPI.getById(userId),
                projectsAPI.getAll()
            ]);

            setProfileUser(userResponse.user);

            const userOwnedProjects = projectsResponse.projects.filter(
                project => project.owner.toString() === userId
            );
            setUserProjects(userOwnedProjects);

            if (isOwnProfile) {
                try {
                    const friendRequestsResponse = await friendsAPI.getRequests();
                    setFriendRequests(friendRequestsResponse.requests || []);
                } catch (err) {
                    console.error('Failed to load friend requests:', err);
                    setFriendRequests([]);
                }
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditProfile = async (updatedData) => {
        try {
            const response = await usersAPI.update(userId, updatedData);
            setProfileUser(response.user);
            setShowEditProfile(false);
        } catch (err) {
            alert('Failed to update profile: ' + err.message);
        }
    };

    const handleAcceptFriend = async (requestId) => {
        try {
            await friendsAPI.acceptRequest(requestId);
            setFriendRequests(prev => prev.filter(req => req._id !== requestId));
            fetchProfileData();
        } catch (err) {
            alert('Failed to accept friend request: ' + err.message);
        }
    };

    const handleDeclineFriend = async (requestId) => {
        try {
            await friendsAPI.declineRequest(requestId);
            setFriendRequests(prev => prev.filter(req => req._id !== requestId));
        } catch (err) {
            alert('Failed to decline friend request: ' + err.message);
        }
    };

    if (loading) {
        return (
            <div className="profile-page">
                <Header currentUser={currentUser} onLogout={onLogout} />
                <div className="loading-message">Loading profile...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-page">
                <Header currentUser={currentUser} onLogout={onLogout} />
                <div className="error-message">Error loading profile: {error}</div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <Header currentUser={currentUser} onLogout={onLogout} />

            <main className="profile-content">
                <div className="container">
                    <div className="profile-layout">
                        <div className="profile-sidebar">
                            <div className="profile-card">
                                <div className="profile-header">
                                    <div className="profile-avatar-large">
                                        {profileUser?.profilePicture ? (
                                            <img 
                                                src={profileUser.profilePicture} 
                                                alt="Profile" 
                                                className="avatar-image"
                                            />
                                        ) : (
                                            <div className="default-avatar">👤</div>
                                        )}
                                    </div>
                                    <div className="profile-info">
                                        <h1 className="profile-name">{profileUser?.name || 'Unknown User'}</h1>
                                        {isOwnProfile && (
                                            <button
                                                className="btn btn-secondary edit-profile-btn"
                                                onClick={() => setShowEditProfile(true)}
                                            >
                                                Edit Profile
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="profile-details">
                                    <div className="detail-item">
                                        <span className="detail-icon">📧</span>
                                        <span className="detail-text">{profileUser?.email}</span>
                                    </div>
                                    {profileUser?.birthDate && (
                                        <div className="detail-item">
                                            <span className="detail-icon">🎂</span>
                                            <span className="detail-text">{profileUser.birthDate}</span>
                                        </div>
                                    )}
                                    {profileUser?.company && (
                                        <div className="detail-item">
                                            <span className="detail-icon">🏢</span>
                                            <span className="detail-text">{profileUser.company}</span>
                                        </div>
                                    )}
                                    {profileUser?.country && (
                                        <div className="detail-item">
                                            <span className="detail-icon">🌍</span>
                                            <span className="detail-text">{profileUser.country}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="profile-stats">
                                    <div className="stat-item">
                                        <span className="stat-number">{userProjects.length}</span>
                                        <span className="stat-label">Projects</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-number">{profileUser?.friends?.length || 0}</span>
                                        <span className="stat-label">Friends</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-number">
                                            {new Date(profileUser?.createdAt).getFullYear()}
                                        </span>
                                        <span className="stat-label">Joined</span>
                                    </div>
                                </div>
                            </div>

                            {isOwnProfile && friendRequests.length > 0 && (
                                <div className="friend-requests-section">
                                    <h3>Friend Requests ({friendRequests.length})</h3>
                                    <div className="friend-requests">
                                        {friendRequests.map(request => (
                                            <div key={request._id} className="request-item">
                                                <div className="request-info">
                                                    <div className="friend-avatar">
                                                        {request.requesterInfo?.profilePicture ? (
                                                            <img src={request.requesterInfo.profilePicture} alt="Profile" className="avatar-image" />
                                                        ) : (
                                                            <div className="default-avatar">👤</div>
                                                        )}
                                                    </div>
                                                    <div className="request-details">
                                                        <span className="friend-name">
                                                            {request.requesterInfo?.name || 'Unknown'}
                                                        </span>
                                                        <span className="friend-email">
                                                            {request.requesterInfo?.email}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="request-actions">
                                                    <button
                                                        className="btn-small btn-primary"
                                                        onClick={() => handleAcceptFriend(request._id)}
                                                    >
                                                        Accept
                                                    </button>
                                                    <button 
                                                        className="btn-small btn-secondary"
                                                        onClick={() => handleDeclineFriend(request._id)}
                                                    >
                                                        Decline
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="friends-section">
                                <h3>Friends ({profileUser?.friends?.length || 0})</h3>
                                <div className="friends-list">
                                    {profileUser?.friends?.length > 0 ? (
                                        profileUser.friends.map(friend => (
                                            <div key={friend._id} className="friend-item">
                                                <div className="friend-avatar">
                                                    {friend.profilePicture ? (
                                                        <img src={friend.profilePicture} alt="Profile" className="avatar-image" />
                                                    ) : (
                                                        <div className="default-avatar">👤</div>
                                                    )}
                                                </div>
                                                <div className="friend-details">
                                                    <span className="friend-name">{friend.name}</span>
                                                    <span className="friend-email">{friend.email}</span>
                                                </div>
                                                <button 
                                                    className="btn-small btn-secondary"
                                                    onClick={() => window.location.href = `/profile/${friend._id}`}
                                                >
                                                    View Profile
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="empty-state">
                                            <p>No friends yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="profile-main">
                            <div className="section-header">
                                <div>
                                    <h2>Projects ({userProjects.length})</h2>
                                    <p>Projects {isOwnProfile ? "you've" : `${profileUser?.name} has`} created</p>
                                </div>
                            </div>

                            <div className="projects-grid">
                                {userProjects.length > 0 ? (
                                    userProjects.map(project => (
                                        <ProjectPreview
                                            key={project._id}
                                            project={{
                                                id: project._id,
                                                name: project.name,
                                                description: project.description,
                                                contributors: project.members?.length || 0,
                                                status: project.status,
                                                lastUpdate: new Date(project.updatedAt).toLocaleDateString(),
                                                owner: {
                                                    name: profileUser.name,
                                                    avatar: profileUser.name?.charAt(0) || 'U'
                                                }
                                            }}
                                            showContributors={true}
                                        />
                                    ))
                                ) : (
                                    <div className="empty-state">
                                        <p>No projects yet</p>
                                        {isOwnProfile && (
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => window.location.href = '/create-project'}
                                            >
                                                Create Your First Project
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {showEditProfile && (
                <EditProfileModal
                    user={profileUser}
                    onClose={() => setShowEditProfile(false)}
                    onSave={handleEditProfile}
                />
            )}
        </div>
    );
};

export default ProfilePage;