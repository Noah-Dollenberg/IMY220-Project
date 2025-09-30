// NJ (Noah) Dollenberg u24596142 41
import React, { useState, useEffect } from 'react';
import { friendsAPI, projectsAPI, searchAPI } from '../services/api';

const InviteFriendsModal = ({ projectId, onClose, onInviteSent }) => {
    const [friends, setFriends] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredFriends, setFilteredFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [inviting, setInviting] = useState(new Set());

    useEffect(() => {
        fetchFriends();
    }, []);

    useEffect(() => {
        if (searchQuery.trim()) {
            const filtered = friends.filter(friend =>
                friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                friend.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredFriends(filtered);
        } else {
            setFilteredFriends(friends);
        }
    }, [searchQuery, friends]);

    const fetchFriends = async () => {
        try {
            const currentUser = JSON.parse(localStorage.getItem('userData'));
            const response = await friendsAPI.getFriends(currentUser._id);
            setFriends(response.friends || []);
        } catch (error) {
            console.error('Failed to fetch friends:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (friendId) => {
        setInviting(prev => new Set(prev).add(friendId));
        try {
            await projectsAPI.sendInvitation(projectId, friendId);
            if (onInviteSent) onInviteSent();
            alert('Invitation sent successfully!');
        } catch (error) {
            alert('Failed to send invitation: ' + error.message);
        } finally {
            setInviting(prev => {
                const newSet = new Set(prev);
                newSet.delete(friendId);
                return newSet;
            });
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>
                
                <div className="form-header">
                    <h3>Invite Friends to Project</h3>
                    <p>Select friends to invite to collaborate on this project</p>
                </div>

                <div className="form-group">
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Search friends..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="friends-invite-list">
                    {loading ? (
                        <div className="loading-message">Loading friends...</div>
                    ) : filteredFriends.length === 0 ? (
                        <div className="empty-state">
                            <p>{searchQuery ? 'No friends found matching your search' : 'No friends to invite'}</p>
                        </div>
                    ) : (
                        filteredFriends.map(friend => (
                            <div key={friend._id} className="friend-invite-item">
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
                                    className="btn btn-primary btn-small"
                                    onClick={() => handleInvite(friend._id)}
                                    disabled={inviting.has(friend._id)}
                                >
                                    {inviting.has(friend._id) ? 'Inviting...' : 'Invite'}
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className="form-actions">
                    <button className="btn btn-secondary" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InviteFriendsModal;