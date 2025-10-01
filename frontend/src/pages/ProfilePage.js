// NJ (Noah) Dollenberg u24596142 41
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ProjectPreview from '../components/ProjectPreview';
import EditProfileModal from '../components/EditProfileModal';
import { usersAPI, projectsAPI, friendsAPI } from '../services/api';

const ProfilePage = ({ currentUser, onLogout, onUpdateUser }) => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [profileUser, setProfileUser] = useState(null);
    const [userProjects, setUserProjects] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [friends, setFriends] = useState([]);
    const [projectInvitations, setProjectInvitations] = useState([]);
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
            const [userResponse, projectsResponse, friendsResponse] = await Promise.all([
                usersAPI.getById(userId),
                projectsAPI.getAll(),
                friendsAPI.getFriends(userId)
            ]);

            setProfileUser(userResponse.user);
            setFriends(friendsResponse.friends || []);

            const userOwnedProjects = projectsResponse.projects.filter(
                project => project.owner.toString() === userId
            );
            setUserProjects(userOwnedProjects);

            if (isOwnProfile) {
                try {
                    const [friendRequestsResponse, projectInvitationsResponse] = await Promise.all([
                        friendsAPI.getRequests(),
                        projectsAPI.getInvitations()
                    ]);
                    setFriendRequests(friendRequestsResponse.requests || []);
                    setProjectInvitations(projectInvitationsResponse.invitations || []);
                } catch (err) {
                    console.error('Failed to load requests:', err);
                    setFriendRequests([]);
                    setProjectInvitations([]);
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
            if (isOwnProfile && onUpdateUser) {
                onUpdateUser(response.user);
            }
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

    const handleAcceptProjectInvitation = async (projectId, invitedBy) => {
        try {
            await projectsAPI.acceptInvitation(projectId, invitedBy);
            setProjectInvitations(prev => prev.filter(inv => 
                !(inv.projectId.toString() === projectId && inv.invitedBy.toString() === invitedBy)
            ));
            fetchProfileData(); // Refresh to show new project
        } catch (err) {
            alert('Failed to accept project invitation: ' + err.message);
        }
    };

    const handleDeclineProjectInvitation = async (projectId, invitedBy) => {
        try {
            await projectsAPI.declineInvitation(projectId, invitedBy);
            setProjectInvitations(prev => prev.filter(inv => 
                !(inv.projectId.toString() === projectId && inv.invitedBy.toString() === invitedBy)
            ));
        } catch (err) {
            alert('Failed to decline project invitation: ' + err.message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-accent">
                <Header currentUser={currentUser} onLogout={onLogout} />
                <div className="flex justify-center py-8">
                    <div className="font-khula text-darker">Loading profile...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-accent">
                <Header currentUser={currentUser} onLogout={onLogout} />
                <div className="flex justify-center py-8">
                    <div className="font-khula text-red-600">Error loading profile: {error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-accent">
            <Header currentUser={currentUser} onLogout={onLogout} />

            <main className="py-8">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white rounded p-6">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-20 h-20 bg-highlight rounded-full flex items-center justify-center flex-shrink-0">
                                        {profileUser?.profilePicture ? (
                                            <img 
                                                src={profileUser.profilePicture} 
                                                alt="Profile" 
                                                className="w-20 h-20 rounded-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-dark text-2xl">👤</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h1 className="font-inter text-xl font-bold text-dark mb-2">{profileUser?.name || 'Unknown User'}</h1>
                                        {isOwnProfile && (
                                            <button
                                                className="bg-fill text-dark px-3 py-1 rounded font-khula text-sm hover:bg-accent transition-colors"
                                                onClick={() => setShowEditProfile(true)}
                                            >
                                                Edit Profile
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">📧</span>
                                        <span className="font-khula text-dark text-sm">{profileUser?.email}</span>
                                    </div>
                                    {profileUser?.birthDate && (
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">🎂</span>
                                            <span className="font-khula text-dark text-sm">{profileUser.birthDate}</span>
                                        </div>
                                    )}
                                    {profileUser?.company && (
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">🏢</span>
                                            <span className="font-khula text-dark text-sm">{profileUser.company}</span>
                                        </div>
                                    )}
                                    {profileUser?.country && (
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">🌍</span>
                                            <span className="font-khula text-dark text-sm">{profileUser.country}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-around pt-6 border-t border-fill">
                                    <div className="text-center">
                                        <div className="font-inter text-xl font-bold text-dark">{userProjects.length}</div>
                                        <div className="font-khula text-xs text-darker">Projects</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-inter text-xl font-bold text-dark">{friends.length}</div>
                                        <div className="font-khula text-xs text-darker">Friends</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-inter text-xl font-bold text-dark">
                                            {new Date(profileUser?.createdAt).getFullYear()}
                                        </div>
                                        <div className="font-khula text-xs text-darker">Joined</div>
                                    </div>
                                </div>
                            </div>

                            {isOwnProfile && (
                                <>
                                    <div className="bg-white rounded p-6">
                                        <h3 className="font-inter text-lg font-semibold text-dark mb-4">Friend Requests ({friendRequests.length})</h3>
                                        <div className="space-y-3">
                                            {friendRequests.length > 0 ? (
                                                friendRequests.map(request => (
                                                    <div key={request._id} className="flex items-center gap-3 p-3 bg-accent rounded border border-fill">
                                                        <div className="w-10 h-10 bg-highlight rounded-full flex items-center justify-center flex-shrink-0">
                                                            {request.requesterInfo?.profilePicture ? (
                                                                <img src={request.requesterInfo.profilePicture} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
                                                            ) : (
                                                                <span className="text-dark">👤</span>
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="font-inter font-medium text-dark text-sm">
                                                                {request.requesterInfo?.name || 'Unknown'}
                                                            </div>
                                                            <div className="font-khula text-xs text-darker">
                                                                {request.requesterInfo?.email}
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                className="bg-highlight text-dark px-3 py-1 rounded font-khula text-xs hover:bg-yellow-400 transition-colors"
                                                                onClick={() => handleAcceptFriend(request._id)}
                                                            >
                                                                Accept
                                                            </button>
                                                            <button 
                                                                className="bg-fill text-dark px-3 py-1 rounded font-khula text-xs hover:bg-accent transition-colors"
                                                                onClick={() => handleDeclineFriend(request._id)}
                                                            >
                                                                Decline
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-4 font-khula text-darker">
                                                    <p>No friend requests</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-white rounded p-6">
                                        <h3 className="font-inter text-lg font-semibold text-dark mb-4">Project Invitations ({projectInvitations.length})</h3>
                                        <div className="space-y-3">
                                            {projectInvitations.length > 0 ? (
                                                projectInvitations.map(invitation => (
                                                    <div key={`${invitation.projectId}-${invitation.invitedBy}`} className="flex items-center gap-3 p-3 bg-accent rounded border border-fill">
                                                        <div className="w-10 h-10 bg-highlight rounded-full flex items-center justify-center flex-shrink-0">
                                                            <span className="text-dark">📁</span>
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="font-inter font-medium text-dark text-sm">
                                                                {invitation.projectInfo?.name || 'Unknown Project'}
                                                            </div>
                                                            <div className="font-khula text-xs text-darker">
                                                                Invited by {invitation.inviterInfo?.name || 'Unknown'}
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                className="bg-highlight text-dark px-3 py-1 rounded font-khula text-xs hover:bg-yellow-400 transition-colors"
                                                                onClick={() => handleAcceptProjectInvitation(invitation.projectId, invitation.invitedBy)}
                                                            >
                                                                Accept
                                                            </button>
                                                            <button 
                                                                className="bg-fill text-dark px-3 py-1 rounded font-khula text-xs hover:bg-accent transition-colors"
                                                                onClick={() => handleDeclineProjectInvitation(invitation.projectId, invitation.invitedBy)}
                                                            >
                                                                Decline
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-4 font-khula text-darker">
                                                    <p>No project invitations</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="bg-white rounded p-6">
                                <h3 className="font-inter text-lg font-semibold text-dark mb-4">Friends</h3>
                                <div className="space-y-3 max-h-80 overflow-y-auto">
                                    {friends.length > 0 ? (
                                        friends.map(friend => (
                                            <div key={friend._id} className="flex items-center gap-3 p-3 hover:bg-accent rounded border border-transparent hover:border-fill transition-all">
                                                <div className="w-10 h-10 bg-highlight rounded-full flex items-center justify-center flex-shrink-0">
                                                    {friend.profilePicture ? (
                                                        <img src={friend.profilePicture} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
                                                    ) : (
                                                        <span className="text-dark">👤</span>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-inter font-medium text-dark text-sm">{friend.name}</div>
                                                    <div className="font-khula text-xs text-darker">{friend.email}</div>
                                                </div>
                                                {friend._id !== currentUser._id && (
                                                    <button 
                                                        className="bg-fill text-dark px-3 py-1 rounded font-khula text-xs hover:bg-accent transition-colors"
                                                        onClick={() => navigate(`/profile/${friend._id}`)}
                                                    >
                                                        View Profile
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-4 font-khula text-darker">
                                            <p>No friends yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-3">
                            <div className="bg-white rounded p-6">
                                <div className="mb-6">
                                    <h2 className="font-inter text-2xl font-bold text-dark mb-1">Projects</h2>
                                    <p className="font-khula text-darker">Projects {isOwnProfile ? "you've" : `${profileUser?.name} has`} created</p>
                                </div>

                                <div className="space-y-4">
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
                                        <div className="text-center py-8">
                                            <p className="font-khula text-darker mb-4">No projects yet</p>
                                            {isOwnProfile && (
                                                <button
                                                    className="bg-highlight text-dark px-4 py-2 rounded font-khula hover:bg-yellow-400 transition-colors"
                                                    onClick={() => navigate('/create-project')}
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