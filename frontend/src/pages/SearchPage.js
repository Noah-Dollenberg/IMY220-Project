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
        <div className="min-h-screen bg-accent">
            <Header currentUser={currentUser} onLogout={onLogout} />
            
            <main className="py-8">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="bg-white rounded p-6">
                        <h1 className="font-inter text-2xl font-bold text-dark mb-6">Find Users</h1>
                        
                        <div className="mb-6">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={handleInputChange}
                                    placeholder="Search by name or email..."
                                    className="w-full px-4 py-3 border border-fill rounded-lg font-khula focus:outline-none focus:border-highlight"
                                />
                                {loading && <span className="absolute right-3 top-3 font-khula text-sm text-darker">Searching...</span>}
                            </div>
                        </div>

                        <div>
                            {loading ? (
                                <div className="text-center py-8 font-khula text-darker">Loading users...</div>
                            ) : filteredUsers.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredUsers.map(user => (
                                        <div key={user._id} className="bg-accent border border-fill rounded-lg p-4">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-12 h-12 bg-highlight rounded-full flex items-center justify-center flex-shrink-0">
                                                    {user.profilePicture ? (
                                                        <img src={user.profilePicture} alt="Profile" className="w-12 h-12 rounded-full object-cover" />
                                                    ) : (
                                                        <span className="text-dark text-lg">👤</span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-inter font-semibold text-dark truncate">{user.name}</h3>
                                                    <p className="font-khula text-sm text-darker truncate">{user.email}</p>
                                                    {user.company && <p className="font-khula text-sm text-darker truncate">{user.company}</p>}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button 
                                                    className="flex-1 bg-highlight text-dark px-3 py-2 rounded font-khula text-sm hover:bg-yellow-400 transition-colors"
                                                    onClick={() => navigate(`/profile/${user._id}`)}
                                                >
                                                    View Profile
                                                </button>
                                                {user._id !== currentUser._id && !isFriend(user._id) && (
                                                    <button 
                                                        className="flex-1 bg-fill text-dark px-3 py-2 rounded font-khula text-sm hover:bg-accent transition-colors"
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
                                <div className="text-center py-8 font-khula text-darker">
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