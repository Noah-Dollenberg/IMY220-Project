// NJ (Noah) Dollenberg u24596142 41
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import InviteFriendsModal from '../components/InviteFriendsModal';
import ProjectActivityList from '../components/ProjectActivityList';
import ProjectEditModal from '../components/ProjectEditModal';
import { projectsAPI, activityAPI } from '../services/api';

const ProjectPage = ({ currentUser, onLogout }) => {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [checkingOut, setCheckingOut] = useState(false);
    const [checkingIn, setCheckingIn] = useState(false);
    const [checkinData, setCheckinData] = useState({
        message: '',
        version: '',
        files: []
    });
    const [showInviteFriends, setShowInviteFriends] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    useEffect(() => {
        fetchProject();
    }, [projectId]);

    const fetchProject = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await projectsAPI.getById(projectId);
            setProject(response.project);
            setCheckinData(prev => ({
                ...prev,
                version: response.project.version
            }));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckout = async () => {
        setCheckingOut(true);
        try {
            await projectsAPI.checkout(projectId);
            await fetchProject();
        } catch (err) {
            alert('Failed to checkout project: ' + err.message);
        } finally {
            setCheckingOut(false);
        }
    };

    const handleCheckin = async (e) => {
        e.preventDefault();

        if (!checkinData.message || !checkinData.version) {
            alert('Please provide both a message and version');
            return;
        }

        setCheckingIn(true);
        try {
            await projectsAPI.checkin(
                projectId,
                checkinData.message,
                checkinData.version,
                checkinData.files
            );
            await fetchProject();
            setCheckinData({ message: '', version: project.version, files: [] });
        } catch (err) {
            alert('Failed to checkin project: ' + err.message);
        } finally {
            setCheckingIn(false);
        }
    };

    const isProjectMember = project?.members?.some(
        member => member.toString() === currentUser?._id
    );

    const isProjectOwner = project?.owner?.toString() === currentUser?._id;

    const canCheckout = isProjectMember && project?.status === 'checked-in';
    const canCheckin = isProjectMember &&
        project?.status === 'checked-out' &&
        project?.checkedOutBy?.toString() === currentUser?._id;

    const handleInviteFriends = () => {
        setShowInviteFriends(true);
    };

    const handleInviteSent = () => {
        // Invitation sent successfully
    };

    const handleCloseInviteModal = () => {
        setShowInviteFriends(false);
    };

    const handleEditProject = () => {
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
    };

    const handleProjectUpdate = () => {
        fetchProject();
    };

    const handleDeleteProject = async () => {
        if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            return;
        }

        setDeleting(true);
        try {
            await projectsAPI.delete(projectId);
            window.location.href = '/';
        } catch (err) {
            alert('Failed to delete project: ' + err.message);
        } finally {
            setDeleting(false);
        }
    };

    const handleDeleteActivity = async (activityId) => {
        try {
            await activityAPI.delete(activityId);
            setProject(prev => ({
                ...prev,
                recentActivity: prev.recentActivity?.filter(activity => activity._id !== activityId) || []
            }));
        } catch (err) {
            alert('Failed to delete activity: ' + err.message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-accent">
                <Header currentUser={currentUser} onLogout={onLogout} />
                <div className="flex justify-center items-center py-20">
                    <div className="font-khula text-darker text-lg">Loading project...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-accent">
                <Header currentUser={currentUser} onLogout={onLogout} />
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <div className="font-khula text-red-800">Error loading project: {error}</div>
                    </div>
                </div>
            </div>
        );
    }

    const overviewContent = (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-accent rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">📁</div>
                    <div className="font-inter text-xl font-bold text-dark">{project.files?.length || 0}</div>
                    <div className="font-khula text-sm text-darker">Files</div>
                </div>
                <div className="bg-accent rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">👥</div>
                    <div className="font-inter text-xl font-bold text-dark">{project.members?.length || 0}</div>
                    <div className="font-khula text-sm text-darker">Members</div>
                </div>
                <div className="bg-accent rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">📄</div>
                    <div className="font-inter text-xl font-bold text-dark">{project.version}</div>
                    <div className="font-khula text-sm text-darker">Version</div>
                </div>
                <div className="bg-accent rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">⚡</div>
                    <div className="font-inter text-xl font-bold text-dark">{project.status}</div>
                    <div className="font-khula text-sm text-darker">Status</div>
                </div>
            </div>

            <div className="bg-accent rounded-lg p-6">
                <h3 className="font-inter text-lg font-bold text-dark mb-4">About this Project</h3>
                <p className="font-khula text-darker mb-4">{project.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="font-khula">
                        <span className="font-semibold text-dark">Language:</span>
                        <span className="text-darker ml-2">{project.language}</span>
                    </div>
                    <div className="font-khula">
                        <span className="font-semibold text-dark">Type:</span>
                        <span className="text-darker ml-2">{project.type}</span>
                    </div>
                    <div className="font-khula">
                        <span className="font-semibold text-dark">Last Updated:</span>
                        <span className="text-darker ml-2">{new Date(project.updatedAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            <div className="bg-accent rounded-lg p-6">
                <h3 className="font-inter text-lg font-bold text-dark mb-4">Actions</h3>
                
                {canCheckout && (
                    <div className="mb-4">
                        <button
                            className="px-6 py-3 bg-green-500 text-white rounded font-khula hover:bg-green-600 transition-colors disabled:opacity-50"
                            onClick={handleCheckout}
                            disabled={checkingOut}
                        >
                            {checkingOut ? 'Checking Out...' : 'Check Out Project'}
                        </button>
                    </div>
                )}

                {canCheckin && (
                    <div className="bg-white rounded-lg p-4 border border-fill mb-4">
                        <h4 className="font-inter text-base font-bold text-dark mb-4">Check In Project</h4>
                        <form onSubmit={handleCheckin} className="space-y-4">
                            <div>
                                <label className="block font-khula font-medium text-dark mb-2">Check-in Message</label>
                                <textarea
                                    value={checkinData.message}
                                    onChange={(e) => setCheckinData(prev => ({
                                        ...prev,
                                        message: e.target.value
                                    }))}
                                    placeholder="Describe your changes..."
                                    rows="3"
                                    className="w-full px-3 py-2 border border-fill rounded font-khula focus:outline-none focus:border-highlight"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-khula font-medium text-dark mb-2">Version</label>
                                <input
                                    type="text"
                                    value={checkinData.version}
                                    onChange={(e) => setCheckinData(prev => ({
                                        ...prev,
                                        version: e.target.value
                                    }))}
                                    placeholder="1.0.1"
                                    className="w-full px-3 py-2 border border-fill rounded font-khula focus:outline-none focus:border-highlight"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-6 py-3 bg-blue-500 text-white rounded font-khula hover:bg-blue-600 transition-colors disabled:opacity-50"
                                disabled={checkingIn}
                            >
                                {checkingIn ? 'Checking In...' : 'Check In Project'}
                            </button>
                        </form>
                    </div>
                )}

                {!isProjectMember && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <p className="font-khula text-yellow-800">You are not a member of this project</p>
                    </div>
                )}

                {isProjectOwner && project?.status === 'checked-in' && (
                    <div>
                        <button
                            className="px-6 py-3 bg-red-500 text-white rounded font-khula hover:bg-red-600 transition-colors disabled:opacity-50"
                            onClick={handleDeleteProject}
                            disabled={deleting}
                        >
                            {deleting ? 'Deleting...' : 'Delete Project'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    const handleFileUpload = async (files) => {
        if (!files || files.length === 0) return;
        
        setUploading(true);
        try {
            await projectsAPI.uploadFiles(projectId, Array.from(files));
            await fetchProject();
        } catch (err) {
            alert('Failed to upload files: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleFileInputChange = (e) => {
        handleFileUpload(e.target.files);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        handleFileUpload(e.dataTransfer.files);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDownloadFile = (file) => {
        try {
            projectsAPI.downloadFile(projectId, file.filename);
        } catch (err) {
            alert('Failed to download file: ' + err.message);
        }
    };

    const handleRemoveFile = async (file) => {
        if (!window.confirm(`Are you sure you want to remove ${file.originalName}?`)) {
            return;
        }
        
        try {
            await projectsAPI.removeFiles(projectId, [file.filename]);
            await fetchProject();
        } catch (err) {
            alert('Failed to remove file: ' + err.message);
        }
    };

    const canModifyFiles = isProjectMember && 
        project?.status === 'checked-out' && 
        project?.checkedOutBy?.toString() === currentUser?._id;

    const filesContent = (
        <div>
            <div className="mb-6 flex justify-between items-center">
                <h3 className="font-inter text-lg font-bold text-dark">Project Files ({project.files?.length || 0})</h3>
                {canModifyFiles && (
                    <div className="flex gap-2">
                        <input
                            type="file"
                            multiple
                            onChange={handleFileInputChange}
                            className="hidden"
                            id="file-input"
                        />
                        <label
                            htmlFor="file-input"
                            className="px-4 py-2 bg-blue-500 text-white rounded font-khula hover:bg-blue-600 transition-colors cursor-pointer"
                        >
                            Add Files
                        </label>
                    </div>
                )}
            </div>
            
            {canModifyFiles && (
                <div
                    className={`mb-6 border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    <div className="text-4xl mb-4">📁</div>
                    <p className="font-khula text-darker mb-2">
                        {uploading ? 'Uploading files...' : 'Drag and drop files here or click "Add Files" above'}
                    </p>
                    <p className="font-khula text-sm text-gray-500">Maximum file size: 10MB</p>
                </div>
            )}
            
            <div className="space-y-3">
                {project.files?.length > 0 ? (
                    project.files.map((file, index) => {
                        const fileName = file.originalName || file;
                        const fileSize = file.size ? `${(file.size / 1024).toFixed(1)} KB` : '';
                        const uploadDate = file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString() : '';
                        
                        return (
                            <div key={index} className="flex items-center gap-3 p-4 bg-accent rounded-lg">
                                <div className="text-2xl">📄</div>
                                <div className="flex-1">
                                    <div className="font-khula font-medium text-dark">{fileName}</div>
                                    <div className="font-khula text-sm text-darker">
                                        {fileSize && `${fileSize} • `}
                                        {uploadDate && `Uploaded ${uploadDate}`}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleDownloadFile(file)}
                                        className="px-3 py-1 bg-green-500 text-white rounded text-sm font-khula hover:bg-green-600 transition-colors"
                                    >
                                        Download
                                    </button>
                                    {canModifyFiles && (
                                        <button
                                            onClick={() => handleRemoveFile(file)}
                                            className="px-3 py-1 bg-red-500 text-white rounded text-sm font-khula hover:bg-red-600 transition-colors"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-12 bg-accent rounded-lg">
                        <div className="text-4xl mb-4">📁</div>
                        <p className="font-khula text-darker">
                            {canModifyFiles ? 'No files in this project yet. Upload some files to get started!' : 'No files in this project yet'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );

    const messagesContent = (
        <div>
            <div className="mb-6">
                <h3 className="font-inter text-lg font-bold text-dark">Recent Activity ({project.recentActivity?.length || 0})</h3>
            </div>
            <ProjectActivityList 
                activities={project.recentActivity || []} 
                onDeleteActivity={handleDeleteActivity}
                maxVisible={5}
            />
        </div>
    );

    const tabContent = {
        overview: overviewContent,
        files: filesContent,
        messages: messagesContent
    };

    return (
        <div className="min-h-screen bg-accent">
            <Header currentUser={currentUser} onLogout={onLogout} />

            <main className="py-8">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="bg-white rounded-lg shadow-sm">
                        <div className="p-6 border-b border-fill">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 bg-highlight rounded-full flex items-center justify-center text-dark font-inter font-bold text-xl overflow-hidden">
                                        {project.ownerInfo?.profilePicture ? (
                                            <img 
                                                src={project.ownerInfo.profilePicture} 
                                                alt="Owner" 
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'block';
                                                }}
                                            />
                                        ) : null}
                                        <span className={`${project.ownerInfo?.profilePicture ? 'hidden' : ''}`}>
                                            {project.ownerInfo?.name?.charAt(0) || 'U'}
                                        </span>
                                    </div>
                                    <div>
                                        <h1 className="font-inter text-2xl font-bold text-dark mb-1">{project.name}</h1>
                                        <p className="font-khula text-darker mb-2">
                                            by {project.ownerInfo?.name || 'Unknown'}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-3 py-1 rounded-full text-sm font-khula ${
                                                project.status === 'checked-in' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {project.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex gap-2">
                                    {isProjectOwner && (
                                        <button
                                            className="px-4 py-2 bg-highlight text-dark rounded font-khula hover:bg-yellow-400 transition-colors"
                                            onClick={handleInviteFriends}
                                        >
                                            Invite Friends
                                        </button>
                                    )}
                                    {isProjectOwner && project?.status === 'checked-out' && 
                                     project?.checkedOutBy?.toString() === currentUser?._id && (
                                        <button
                                            className="px-4 py-2 bg-blue-500 text-white rounded font-khula hover:bg-blue-600 transition-colors"
                                            onClick={handleEditProject}
                                        >
                                            Edit Project
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="border-b border-fill">
                            <div className="flex">
                                <button
                                    className={`px-6 py-4 font-khula font-medium transition-colors border-b-2 ${
                                        activeTab === 'overview' 
                                            ? 'border-highlight text-dark bg-accent' 
                                            : 'border-transparent text-darker hover:text-dark hover:bg-accent'
                                    }`}
                                    onClick={() => setActiveTab('overview')}
                                >
                                    📊 Overview
                                </button>
                                <button
                                    className={`px-6 py-4 font-khula font-medium transition-colors border-b-2 ${
                                        activeTab === 'files' 
                                            ? 'border-highlight text-dark bg-accent' 
                                            : 'border-transparent text-darker hover:text-dark hover:bg-accent'
                                    }`}
                                    onClick={() => setActiveTab('files')}
                                >
                                    📁 Files
                                </button>
                                <button
                                    className={`px-6 py-4 font-khula font-medium transition-colors border-b-2 ${
                                        activeTab === 'messages' 
                                            ? 'border-highlight text-dark bg-accent' 
                                            : 'border-transparent text-darker hover:text-dark hover:bg-accent'
                                    }`}
                                    onClick={() => setActiveTab('messages')}
                                >
                                    💬 Activity
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {tabContent[activeTab]}
                        </div>
                    </div>
                </div>
            </main>

            {showInviteFriends && (
                <InviteFriendsModal
                    projectId={projectId}
                    onClose={handleCloseInviteModal}
                    onInviteSent={handleInviteSent}
                />
            )}

            {showEditModal && (
                <ProjectEditModal
                    project={project}
                    currentUser={currentUser}
                    onClose={handleCloseEditModal}
                    onUpdate={handleProjectUpdate}
                />
            )}
        </div>
    );
};

export default ProjectPage;