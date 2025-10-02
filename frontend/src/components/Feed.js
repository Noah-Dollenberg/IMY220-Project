// NJ (Noah) Dollenberg u24596142 41
import React, { useState, useEffect } from 'react';
import ProjectPreview from './ProjectPreview';
import ActivityList from './ActivityList';
import { projectsAPI, activityAPI } from '../services/api';

const Feed = ({ feedType = 'local' }) => {
    const [projects, setProjects] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('latest');
    const [filterBy, setFilterBy] = useState('all');

    useEffect(() => {
        fetchData();
    }, [feedType]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            const [projectsResponse, activitiesResponse] = await Promise.all([
                projectsAPI.getAll(),
                activityAPI.getFeed(feedType)
            ]);

            let filteredProjects = projectsResponse.projects || [];
            
            if (feedType === 'local') {
                const currentUser = JSON.parse(localStorage.getItem('userData'));
                // Filter to show only user's own projects and friends' projects
                filteredProjects = filteredProjects.filter(project => 
                    project.owner === currentUser._id || 
                    project.members?.includes(currentUser._id)
                );
            }

            setProjects(filteredProjects);
            setActivities(activitiesResponse.activities || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredProjects = projects
        .filter(project => {
            const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filterBy === 'all' || project.status === filterBy;
            return matchesSearch && matchesFilter;
        })
        .sort((a, b) => {
            if (sortBy === 'contributors') {
                return (b.members?.length || 0) - (a.members?.length || 0);
            }
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        });

    const handleRefresh = () => {
        fetchData();
    };

    const handleDeleteActivity = async (activityId) => {
        try {
            await activityAPI.delete(activityId);
            setActivities(prev => prev.filter(activity => activity._id !== activityId));
        } catch (err) {
            alert('Failed to delete activity: ' + err.message);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <div className="font-khula text-darker">Loading projects...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white border border-fill rounded p-4">
                <div className="font-khula text-dark mb-2">
                    Error loading feed: {error}
                </div>
                <button 
                    onClick={handleRefresh} 
                    className="bg-highlight text-dark px-4 py-2 rounded font-khula hover:bg-yellow-400 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded p-6">
            <h2 className="font-inter text-lg font-bold text-dark mb-6">
                [{feedType === 'local' ? 'L' : 'G'}] {feedType.toUpperCase()} FEED
            </h2>

            <div className="space-y-4 mb-6">
                <input
                    type="text"
                    placeholder="Search for project..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-fill rounded font-khula focus:outline-none focus:border-highlight"
                />

                <div className="flex flex-wrap gap-4 items-center">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 border border-fill rounded font-khula focus:outline-none focus:border-highlight"
                    >
                        <option value="latest">Sort by Latest</option>
                        <option value="contributors">Sort by Contributors</option>
                    </select>

                    <div className="flex gap-2">
                        <button
                            className={`px-3 py-2 rounded font-khula text-sm transition-colors ${
                                filterBy === 'checked-in' 
                                    ? 'bg-green-500 text-white' 
                                    : 'bg-fill text-dark hover:bg-accent'
                            }`}
                            onClick={() => setFilterBy(filterBy === 'checked-in' ? 'all' : 'checked-in')}
                        >
                            Checked-In
                        </button>
                        <button
                            className={`px-3 py-2 rounded font-khula text-sm transition-colors ${
                                filterBy === 'checked-out' 
                                    ? 'bg-red-500 text-white' 
                                    : 'bg-fill text-dark hover:bg-accent'
                            }`}
                            onClick={() => setFilterBy(filterBy === 'checked-out' ? 'all' : 'checked-out')}
                        >
                            Checked-Out
                        </button>
                    </div>

                    <button 
                        onClick={handleRefresh} 
                        className="px-4 py-2 bg-highlight text-dark rounded font-khula hover:bg-yellow-400 transition-colors"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            <div>
                {feedType === 'local' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <h3 className="font-inter text-base font-bold text-dark mb-4">AVAILABLE PROJECTS ({filteredProjects.length})</h3>
                            <div className="space-y-3">
                                {filteredProjects.length > 0 ? (
                                    filteredProjects.map(project => (
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
                                                    name: project.ownerInfo?.name || 'Unknown',
                                                    avatar: project.ownerInfo?.name?.charAt(0) || 'U'
                                                }
                                            }}
                                            showActivity={false}
                                        />
                                    ))
                                ) : (
                                    <div className="text-center py-8 font-khula text-darker">
                                        <p>No projects found</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-inter text-base font-bold text-dark mb-4">ACTIVITY ({activities.length})</h3>
                            <ActivityList 
                                activities={activities} 
                                onDeleteActivity={handleDeleteActivity}
                                maxVisible={5}
                            />
                        </div>
                    </div>
                )}

                {feedType === 'global' && (
                    <div>
                        <h3 className="font-inter text-base font-bold text-dark mb-4">AVAILABLE PROJECTS ({filteredProjects.length})</h3>
                        <div className="space-y-3">
                            {filteredProjects.length > 0 ? (
                                filteredProjects.map(project => (
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
                                                name: project.ownerInfo?.name || 'Unknown',
                                                avatar: project.ownerInfo?.name?.charAt(0) || 'U'
                                            }
                                        }}
                                        showContributors={true}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-8 font-khula text-darker">
                                    <p>No projects found</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Feed;