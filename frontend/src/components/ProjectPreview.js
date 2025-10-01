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
        <div className="bg-accent border border-fill rounded p-4 hover:bg-white transition-all cursor-pointer">
            <div className="flex justify-between items-center gap-4">
                <div className="flex gap-3 items-start flex-1">
                    <div className="w-10 h-10 bg-highlight rounded-full flex items-center justify-center text-dark font-inter font-semibold text-sm flex-shrink-0">
                        {project.owner.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                        <Link 
                            to={`/project/${project.id}`} 
                            className="font-inter font-semibold text-dark hover:text-darker transition-colors block mb-1"
                        >
                            {project.name}
                        </Link>
                        <p className="font-khula text-darker text-sm mb-1">{project.description}</p>
                        <span className="font-khula text-xs text-darker">{project.lastUpdate}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    <div
                        className={`w-3 h-3 rounded-full ${
                            project.status === 'checked-in' ? 'bg-green-500' : 'bg-red-500'
                        }`}
                    ></div>
                    <span className="font-khula text-sm text-darker capitalize">{project.status}</span>
                </div>

                {showContributors && (
                    <div className="text-center flex-shrink-0">
                        <div className="font-inter text-lg font-bold text-dark">
                            {formatContributors(project.contributors)}
                        </div>
                        <div className="font-khula text-xs text-darker">contributors</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectPreview;