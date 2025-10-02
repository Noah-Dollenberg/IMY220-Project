// NJ (Noah) Dollenberg u24596142 41
import React, { useState } from 'react';
import { projectsAPI } from '../services/api';

const ProjectEditModal = ({ project, currentUser, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        name: project.name || '',
        description: project.description || '',
        version: project.version || ''
    });
    const [loading, setLoading] = useState(false);



    const isOwner = project.owner?.toString() === currentUser?._id;
    const isMember = project.members?.some(member => member.toString() === currentUser?._id);
    const isCheckedOutByUser = project.status === 'checked-out' && 
                              project.checkedOutBy?.toString() === currentUser?._id;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };



    const handleUpdateProject = async (e) => {
        e.preventDefault();
        if (!isOwner || !isCheckedOutByUser) return;

        setLoading(true);
        try {
            await projectsAPI.update(project._id, formData);
            onUpdate();
            alert('Project updated successfully!');
        } catch (error) {
            alert('Failed to update project: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMember = async (memberId) => {
        if (!isOwner || !isCheckedOutByUser) return;
        
        if (window.confirm('Are you sure you want to remove this member?')) {
            try {
                await projectsAPI.removeMember(project._id, memberId);
                onUpdate();
                alert('Member removed successfully!');
            } catch (error) {
                alert('Failed to remove member: ' + error.message);
            }
        }
    };









    if (!isCheckedOutByUser) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <h2 className="font-inter text-xl font-bold text-dark mb-4">Project Not Available</h2>
                    <p className="font-khula text-darker mb-4">
                        Project must be checked out by you to make changes.
                    </p>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-500 text-white rounded font-khula hover:bg-gray-600"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto m-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="font-inter text-2xl font-bold text-dark">Edit Project</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Project Details */}
                    {isOwner && (
                        <div className="bg-accent rounded-lg p-4">
                            <h3 className="font-inter text-lg font-bold text-dark mb-4">Project Details</h3>
                            <form onSubmit={handleUpdateProject} className="space-y-4">
                                <div>
                                    <label className="block font-khula font-medium text-dark mb-2">Project Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-fill rounded font-khula focus:outline-none focus:border-highlight"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-khula font-medium text-dark mb-2">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="w-full px-3 py-2 border border-fill rounded font-khula focus:outline-none focus:border-highlight"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-khula font-medium text-dark mb-2">Version</label>
                                    <input
                                        type="text"
                                        name="version"
                                        value={formData.version}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-fill rounded font-khula focus:outline-none focus:border-highlight"
                                        required
                                    />
                                </div>

                            </form>
                        </div>
                    )}

                    {/* Members Management */}
                    {isOwner && (
                        <div className="bg-accent rounded-lg p-4">
                            <h3 className="font-inter text-lg font-bold text-dark mb-4">Members</h3>
                            <div className="space-y-2">
                                {project.memberInfo?.map(member => (
                                    <div key={member._id} className="flex items-center justify-between p-2 bg-white rounded">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-highlight rounded-full flex items-center justify-center text-dark font-inter font-bold text-sm">
                                                {member.name?.charAt(0) || 'U'}
                                            </div>
                                            <span className="font-khula text-dark">{member.name}</span>
                                            {member._id === project.owner?.toString() && (
                                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Owner</span>
                                            )}
                                        </div>
                                        {member._id !== project.owner?.toString() && (
                                            <button
                                                onClick={() => handleRemoveMember(member._id)}
                                                className="px-3 py-1 bg-red-500 text-white rounded text-sm font-khula hover:bg-red-600"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Update Project Button */}
                    {isOwner && (
                        <div className="flex justify-end">
                            <button
                                onClick={handleUpdateProject}
                                disabled={loading}
                                className="px-4 py-2 bg-blue-500 text-white rounded font-khula hover:bg-blue-600 disabled:opacity-50"
                            >
                                {loading ? 'Updating...' : 'Update Project'}
                            </button>
                        </div>
                    )}






                </div>
            </div>
        </div>
    );
};

export default ProjectEditModal;