// NJ (Noah) Dollenberg u24596142 41
import React, { useState } from 'react';
import ProjectPreview from './ProjectPreview';

const Feed = ({ feedType = 'local' }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('latest');
    const [filterBy, setFilterBy] = useState('all');

    const dummyProjects = {
        local: [
            {
                id: 1,
                name: "Noah's Project",
                description: "Latest message",
                contributors: 4,
                status: 'checked-in',
                lastUpdate: '2 hours ago',
                owner: { name: "User A", avatar: "A" }
            },
            {
                id: 2,
                name: "Josh's Project",
                description: "Latest message",
                contributors: 3,
                status: 'checked-out',
                lastUpdate: '1 day ago',
                owner: { name: "User B", avatar: "B" }
            },
            {
                id: 3,
                name: "Bonk's Project",
                description: "Latest message",
                contributors: 2,
                status: 'checked-in',
                lastUpdate: '3 days ago',
                owner: { name: "User C", avatar: "C" }
            },
            {
                id: 4,
                name: "Squish's Project",
                description: "Latest message",
                contributors: 5,
                status: 'checked-out',
                lastUpdate: '1 week ago',
                owner: { name: "User D", avatar: "D" }
            }
        ],
        global: [
            {
                id: 5,
                name: "David's Project",
                description: "Public project description",
                contributors: 2000,
                status: 'checked-in',
                lastUpdate: '1 hour ago',
                owner: { name: "User I", avatar: "I" }
            },
            {
                id: 6,
                name: "Micheal's Project",
                description: "Open source collaboration",
                contributors: 1000,
                status: 'checked-out',
                lastUpdate: '3 hours ago',
                owner: { name: "User J", avatar: "J" }
            },
            {
                id: 7,
                name: "John's Project",
                description: "Community driven development",
                contributors: 6000,
                status: 'checked-in',
                lastUpdate: '6 hours ago',
                owner: { name: "User K", avatar: "K" }
            },
            {
                id: 8,
                name: "Bob's Project",
                description: "Learning project for beginners",
                contributors: 100,
                status: 'checked-out',
                lastUpdate: '12 hours ago',
                owner: { name: "User L", avatar: "L" }
            }
        ]
    };

    const projects = dummyProjects[feedType] || [];

    const filteredProjects = projects
        .filter(project => {
            const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filterBy === 'all' || project.status === filterBy;
            return matchesSearch && matchesFilter;
        })
        .sort((a, b) => {
            if (sortBy === 'contributors') {
                return b.contributors - a.contributors;
            }
            return new Date(b.lastUpdate) - new Date(a.lastUpdate);
        });

    const handleRefresh = () => {
        console.log('Refreshing feed...');
    };

    return (
        <div className="feed">
            <div className="feed-header">
                <h2 className="feed-title">
                    [{feedType === 'local' ? 'B' : 'B'}] {feedType.toUpperCase()} FEED
                    <span className="feed-badge">PFP</span>
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
                            <h3>AVAILABLE PROJECTS</h3>
                            <div className="projects-list">
                                {filteredProjects.map(project => (
                                    <ProjectPreview
                                        key={project.id}
                                        project={project}
                                        showActivity={false}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="activity-feed">
                            <h3>ACTIVITY</h3>
                            <div className="activity-list">
                                {filteredProjects.map(project => (
                                    <div key={`activity-${project.id}`} className="activity-item">
                                        <div className="activity-avatar">{project.owner.avatar}</div>
                                        <div className="activity-content">
                                            <strong>{project.name}</strong>
                                            <p>{project.description}</p>
                                            <span className="activity-time">{project.lastUpdate}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {feedType === 'global' && (
                    <div className="available-projects">
                        <h3>AVAILABLE PROJECTS</h3>
                        <div className="projects-list">
                            {filteredProjects.map(project => (
                                <ProjectPreview
                                    key={project.id}
                                    project={project}
                                    showContributors={true}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Feed;