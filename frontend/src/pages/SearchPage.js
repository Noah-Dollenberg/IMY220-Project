// NJ (Noah) Dollenberg u24596142 41
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { usersAPI, friendsAPI } from '../services/api';

const SearchPage = ({ currentUser, onLogout }) => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [allUsers, setAllUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [friendsList, setFriendsList] = useState([]);

    useEffect(() => {
        loadAllUsers();
        loadFriends();
    }, []);

    const loadAllUsers = async () => {
        try {
            const response = await usersAPI.getAll();
            const users = response.users.filter(user => user._id !== currentUser._id);
            setAllUsers(users);
            setFilteredUsers(users);
        } catch (error) {
            console.error('Load users error:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadFriends = async () => {
        try {
            const response = await friendsAPI.getFriends(currentUser._id);
            setFriendsList(response.friends || []);
        } catch (error) {
            console.error('Load friends error:', error);
        }
    };

    const isFriend = (userId) => {
        return friendsList.some(friend => friend._id === userId);
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        
        if (!value.trim()) {
            setFilteredUsers(allUsers);
        } else {
            const filtered = allUsers.filter(user => 
                user.name?.toLowerCase().includes(value.toLowerCase()) ||
                user.email?.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredUsers(filtered);
        }
    };

    const sendFriendRequest = async (userId) => {
        try {
            await friendsAPI.sendRequest(userId);
            alert('Friend request sent!');
        } catch (error) {
            alert('Failed to send friend request: ' + error.message);
        }
    };

    return (
        <div className="search-page">
            <Header currentUser={currentUser} onLogout={onLogout} />
            
            <main className="search-content">
                <div className="container">
                    <div className="search-container">
                        <h1>Find Users</h1>
                        
                        <div className="search-form">
                            <div className="search-input-group">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={handleInputChange}
                                    placeholder="Search by name or email..."
                                    className="form-input"
                                />
                                {loading && <span className="search-loading">Searching...</span>}
                            </div>
                        </div>

                        <div className="search-results">
                            {loading ? (
                                <div className="loading-message">Loading users...</div>
                            ) : filteredUsers.length > 0 ? (
                                <div className="users-grid">
                                    {filteredUsers.map(user => (
                                        <div key={user._id} className="user-card">
                                            <div className="user-avatar">
                                                {user.profilePicture ? (
                                                    <img src={user.profilePicture} alt="Profile" className="avatar-image" />
                                                ) : (
                                                    <div className="default-avatar">👤</div>
                                                )}
                                            </div>
                                            <div className="user-info">
                                                <h3>{user.name}</h3>
                                                <p>{user.email}</p>
                                                {user.company && <p>{user.company}</p>}
                                            </div>
                                            <div className="user-actions">
                                                <button 
                                                    className="btn btn-primary btn-small"
                                                    onClick={() => navigate(`/profile/${user._id}`)}
                                                >
                                                    View Profile
                                                </button>
                                                {user._id !== currentUser._id && !isFriend(user._id) && (
                                                    <button 
                                                        className="btn btn-secondary btn-small"
                                                        onClick={() => sendFriendRequest(user._id)}
                                                    >
                                                        Add Friend
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <p>{searchQuery ? `No users found matching "${searchQuery}"` : 'No users found'}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SearchPage;