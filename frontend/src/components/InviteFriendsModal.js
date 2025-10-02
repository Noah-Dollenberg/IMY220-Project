// NJ (Noah) Dollenberg u24596142 41
import React, { useState, useEffect } from 'react';
import { friendsAPI, projectsAPI, searchAPI } from '../services/api';

const InviteFriendsModal = ({ projectId, onClose, onInviteSent }) => {
    const [friends, setFriends] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredFriends, setFilteredFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [inviting, setInviting] = useState(new Set());
    const [invitedUsers, setInvitedUsers] = useState(new Set());

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
            setInvitedUsers(prev => new Set(prev).add(friendId));
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 max-h-96" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-fill">
                    <div>
                        <h3 className="font-inter text-lg font-bold text-dark">Invite Friends to Project</h3>
                        <p className="font-khula text-darker text-sm">Select friends to invite to collaborate on this project</p>
                    </div>
                    <button className="text-darker hover:text-dark text-2xl" onClick={onClose}>×</button>
                </div>

                <div className="p-6">
                    <input
                        type="text"
                        className="w-full px-3 py-2 border border-fill rounded font-khula focus:outline-none focus:border-highlight mb-4"
                        placeholder="Search friends..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    <div className="max-h-48 overflow-y-auto space-y-3">
                        {loading ? (
                            <div className="text-center py-4 font-khula text-darker">Loading friends...</div>
                        ) : filteredFriends.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="font-khula text-darker">{searchQuery ? 'No friends found matching your search' : 'No friends to invite'}</p>
                            </div>
                        ) : (
                            filteredFriends.map(friend => (
                                <div key={friend._id} className="flex items-center gap-3 p-3 bg-accent rounded-lg">
                                    <div className="w-10 h-10 bg-highlight rounded-full flex items-center justify-center text-dark font-inter font-semibold flex-shrink-0 overflow-hidden">
                                        {friend.profilePicture ? (
                                            <img 
                                                src={friend.profilePicture} 
                                                alt="Profile" 
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'block';
                                                }}
                                            />
                                        ) : null}
                                        <span className={`${friend.profilePicture ? 'hidden' : ''}`}>
                                            {friend.name?.charAt(0) || '👤'}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-khula font-medium text-dark">{friend.name}</div>
                                        <div className="font-khula text-sm text-darker truncate">{friend.email}</div>
                                    </div>
                                    <button
                                        className={`px-3 py-1 rounded font-khula text-sm transition-colors ${
                                            invitedUsers.has(friend._id) 
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                                : 'bg-highlight text-dark hover:bg-yellow-400'
                                        }`}
                                        onClick={() => !invitedUsers.has(friend._id) && handleInvite(friend._id)}
                                        disabled={inviting.has(friend._id) || invitedUsers.has(friend._id)}
                                    >
                                        {inviting.has(friend._id) ? 'Inviting...' : invitedUsers.has(friend._id) ? 'Invited' : 'Invite'}
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>


            </div>
        </div>
    );
};

export default InviteFriendsModal;