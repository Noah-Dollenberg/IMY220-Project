// NJ (Noah) Dollenberg u24596142 41
import React from 'react';
import { Link } from 'react-router-dom';

const ProjectPreview = ({ project, showContributors = false, showActivity = true }) => {
    const getStatusColor = (status) => {
        return status === 'checked-in' ? '#27ae60' : '#e74c3c';
    };

    const formatContributors = (count) => {
        if (count >= 1000) {
            return `${Math.floor(count / 1000)}k`;
        }
        return count.toString();
    };

    return (
        <div className="project-preview">
            <div className="project-main">
                <div className="project-info">
                    <div className="project-header">
                        <div className="project-owner">
                            <div className="owner-avatar">{project.owner.avatar}</div>
                        </div>
                        <div className="project-details">
                            <Link to={`/project/${project.id}`} className="project-name">
                                {project.name}
                            </Link>
                            <p className="project-description">{project.description}</p>
                            <span className="project-time">{project.lastUpdate}</span>
                        </div>
                    </div>
                </div>

                <div className="project-status">
                    <div
                        className="status-indicator"
                        style={{ backgroundColor: getStatusColor(project.status) }}
                    ></div>
                    <span className="status-text">{project.status}</span>
                </div>

                {showContributors && (
                    <div className="project-contributors">
                        <span className="contributors-count">
                            {formatContributors(project.contributors)}
                        </span>
                        <span className="contributors-label">contributors</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectPreview;