// NJ (Noah) Dollenberg u24596142 41
import React, { useState, useEffect } from 'react';
import ProjectPreview from './ProjectPreview';
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

            setProjects(projectsResponse.projects || []);
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

    if (loading) {
        return (
            <div className="feed loading">
                <div className="loading-message">Loading projects...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="feed error">
                <div className="error-message">
                    Error loading feed: {error}
                    <button onClick={handleRefresh} className="btn btn-secondary">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="feed">
            <div className="feed-header">
                <h2 className="feed-title">
                    [{feedType === 'local' ? 'L' : 'G'}] {feedType.toUpperCase()} FEED
                </h2>

                <div className="feed-controls">
                    <div className="search-control">
                        <input
                            type="text"
                            placeholder="Search for project..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <div className="filter-controls">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="sort-select"
                        >
                            <option value="latest">Sort by Latest</option>
                            <option value="contributors">Sort by Contributors</option>
                        </select>

                        <div className="status-filters">
                            <button
                                className={`filter-btn ${filterBy === 'checked-in' ? 'active' : ''}`}
                                onClick={() => setFilterBy(filterBy === 'checked-in' ? 'all' : 'checked-in')}
                            >
                                Checked-In
                            </button>
                            <button
                                className={`filter-btn ${filterBy === 'checked-out' ? 'active' : ''}`}
                                onClick={() => setFilterBy(filterBy === 'checked-out' ? 'all' : 'checked-out')}
                            >
                                Checked-Out
                            </button>
                        </div>

                        <button onClick={handleRefresh} className="refresh-btn">
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            <div className="feed-content">
                {feedType === 'local' && (
                    <div className="feed-sections">
                        <div className="available-projects">
                            <h3>AVAILABLE PROJECTS ({filteredProjects.length})</h3>
                            <div className="projects-list">
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
                                    <div className="empty-state">
                                        <p>No projects found</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="activity-feed">
                            <h3>ACTIVITY ({activities.length})</h3>
                            <div className="activity-list">
                                {activities.length > 0 ? (
                                    activities.map(activity => (
                                        <div key={activity._id} className="activity-item">
                                            <div className="activity-avatar">
                                                {activity.userInfo?.name?.charAt(0) || 'U'}
                                            </div>
                                            <div className="activity-content">
                                                <strong>{activity.projectInfo?.name}</strong>
                                                <p>{activity.message}</p>
                                                <span className="activity-time">
                                                    {new Date(activity.timestamp).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-state">
                                        <p>No activity yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {feedType === 'global' && (
                    <div className="available-projects">
                        <h3>AVAILABLE PROJECTS ({filteredProjects.length})</h3>
                        <div className="projects-list">
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
                                <div className="empty-state">
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