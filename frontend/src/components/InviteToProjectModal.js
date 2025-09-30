//NJ (Noah) Dollenberg u24596142 41
import React, { useState, useEffect } from 'react';
import { usersAPI, projectsAPI } from '../services/api';

const InviteToProjectModal = ({ projectId, isOpen, onClose, onInviteSent }) => {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && searchQuery.length >= 2) {
            searchUsers();
        }
    }, [searchQuery, isOpen]);

    const searchUsers = async () => {
        try {
            setLoading(true);
            const response = await usersAPI.search(searchQuery);
            setUsers(response.users);
        } catch (error) {
            console.error('Error searching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (userId) => {
        try {
            await projectsAPI.sendInvitation(projectId, userId);
            onInviteSent?.();
            onClose();
        } catch (error) {
            console.error('Error sending invitation:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Invite Users to Project</h3>
                    <button onClick={onClose} className="close-btn">×</button>
                </div>
                <div className="modal-body">
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    {loading && <div>Searching...</div>}
                    <div className="users-list">
                        {users.map(user => (
                            <div key={user._id} className="user-item">
                                <div>
                                    <strong>{user.name}</strong>
                                    <div>{user.email}</div>
                                </div>
                                <button 
                                    onClick={() => handleInvite(user._id)}
                                    className="invite-btn"
                                >
                                    Invite
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InviteToProjectModal;