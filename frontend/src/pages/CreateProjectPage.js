// NJ (Noah) Dollenberg u24596142 41
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import InviteFriendsModal from '../components/InviteFriendsModal';
import { projectsAPI } from '../services/api';

const CreateProjectPage = ({ currentUser, onLogout }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        language: 'JavaScript',
        version: '1.0.0',
        isPublic: true
    });

    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const [errors, setErrors] = useState({});
    const [showInviteFriends, setShowInviteFriends] = useState(false);
    const [createdProjectId, setCreatedProjectId] = useState(null);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Project name is required';
        } else if (formData.name.length < 3) {
            newErrors.name = 'Project name must be at least 3 characters';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Project description is required';
        } else if (formData.description.length < 10) {
            newErrors.description = 'Description must be at least 10 characters';
        }

        if (!formData.version.trim()) {
            newErrors.version = 'Version is required';
        } else if (!/^\d+\.\d+\.\d+$/.test(formData.version)) {
            newErrors.version = 'Version must be in format X.Y.Z (e.g., 1.0.0)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            handleFiles(e.target.files);
        }
    };

    const handleFiles = (files) => {
        const fileArray = Array.from(files).map(file => ({
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            type: file.type,
            file: file
        }));
        setUploadedFiles(prev => [...prev, ...fileArray]);
    };

    const removeFile = (fileId) => {
        setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const projectData = {
                ...formData,
                files: uploadedFiles.map(file => ({
                    name: file.name,
                    size: file.size,
                    type: file.type
                }))
            };

            const response = await projectsAPI.create(projectData);
            setCreatedProjectId(response.projectId);
            alert('Project created successfully!');
            
            // Ask if user wants to invite friends
            const inviteFriends = window.confirm('Would you like to invite friends to collaborate on this project?');
            if (inviteFriends) {
                setShowInviteFriends(true);
            } else {
                navigate('/home');
            }
        } catch (error) {
            alert('Failed to create project: ' + error.message);
        }
    };

    const handleInviteSent = () => {
        // Invitation sent successfully
    };

    const handleCloseInviteModal = () => {
        setShowInviteFriends(false);
        navigate('/home');
    };

    return (
        <div className="create-project-page">
            <Header currentUser={currentUser} onLogout={onLogout} />
            <main className="main-content">
                <div className="container">
                    <div className="create-project-container">
                        <div className="page-header">
                            <h1>Create New Project</h1>
                            <p>Set up your new project with all the details and files needed to get started</p>
                        </div>

                        <form onSubmit={handleSubmit} className="create-project-form">
                            <div className="form-section">
                                <h3 className="section-title">Project Files</h3>
                                <div
                                    className={`file-upload-area ${dragActive ? 'drag-active' : ''} ${uploadedFiles.length > 0 ? 'has-files' : ''}`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    <div className="upload-content">
                                        <div className="upload-icon">📁</div>
                                        <h4>Drag & Drop files here</h4>
                                        <p>or click to browse and select files</p>
                                        <input
                                            type="file"
                                            id="file-input"
                                            multiple
                                            onChange={handleFileChange}
                                            className="file-input"
                                        />
                                        <label htmlFor="file-input" className="btn btn-secondary">
                                            Choose Files
                                        </label>
                                    </div>
                                </div>

                                {uploadedFiles.length > 0 && (
                                    <div className="uploaded-files">
                                        <h4>Uploaded Files ({uploadedFiles.length})</h4>
                                        <div className="files-list">
                                            {uploadedFiles.map((file) => (
                                                <div key={file.id} className="file-item">
                                                    <div className="file-icon">📄</div>
                                                    <div className="file-details">
                                                        <span className="file-name">{file.name}</span>
                                                        <span className="file-size">{formatFileSize(file.size)}</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="file-remove"
                                                        onClick={() => removeFile(file.id)}
                                                        title="Remove file"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="form-section">
                                <h3 className="section-title">Project Details</h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label htmlFor="name" className="form-label">Project Name *</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className={`form-input ${errors.name ? 'error' : ''}`}
                                            placeholder="Enter a unique project name"
                                            required
                                        />
                                        {errors.name && <div className="error-message">{errors.name}</div>}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="language" className="form-label">Primary Language</label>
                                        <select
                                            id="language"
                                            name="language"
                                            value={formData.language}
                                            onChange={handleInputChange}
                                            className="form-input"
                                        >
                                            <option value="JavaScript">JavaScript</option>
                                            <option value="Python">Python</option>
                                            <option value="Java">Java</option>
                                            <option value="C++">C++</option>
                                            <option value="React">React</option>
                                            <option value="Node.js">Node.js</option>
                                            <option value="TypeScript">TypeScript</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <div className="form-group full-width">
                                        <label htmlFor="description" className="form-label">Description *</label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            className={`form-input ${errors.description ? 'error' : ''}`}
                                            placeholder="Describe what your project does and its main features"
                                            rows="4"
                                            required
                                        />
                                        {errors.description && <div className="error-message">{errors.description}</div>}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="version" className="form-label">Initial Version *</label>
                                        <input
                                            type="text"
                                            id="version"
                                            name="version"
                                            value={formData.version}
                                            onChange={handleInputChange}
                                            className={`form-input ${errors.version ? 'error' : ''}`}
                                            placeholder="1.0.0"
                                            required
                                        />
                                        {errors.version && <div className="error-message">{errors.version}</div>}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Visibility</label>
                                        <div className="radio-group">
                                            <label className="radio-option">
                                                <input
                                                    type="radio"
                                                    name="isPublic"
                                                    value="true"
                                                    checked={formData.isPublic === true}
                                                    onChange={() => setFormData(prev => ({ ...prev, isPublic: true }))}
                                                />
                                                <span className="radio-mark"></span>
                                                <div className="radio-content">
                                                    <span className="radio-title">Public</span>
                                                    <span className="radio-description">Anyone can view this project</span>
                                                </div>
                                            </label>
                                            <label className="radio-option">
                                                <input
                                                    type="radio"
                                                    name="isPublic"
                                                    value="false"
                                                    checked={formData.isPublic === false}
                                                    onChange={() => setFormData(prev => ({ ...prev, isPublic: false }))}
                                                />
                                                <span className="radio-mark"></span>
                                                <div className="radio-content">
                                                    <span className="radio-title">Private</span>
                                                    <span className="radio-description">Only you and collaborators can view</span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3 className="section-title">Invite Friends (Optional)</h3>
                                <p className="section-description">You can invite friends to collaborate on this project after creation, or skip this step for now.</p>
                                <div className="invite-friends-preview">
                                    <div className="invite-info">
                                        <span className="invite-icon">👥</span>
                                        <span className="invite-text">Invite friends after project creation</span>
                                    </div>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-large"
                                    onClick={() => navigate('/home')}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-large"
                                >
                                    Create Project
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>

            {showInviteFriends && createdProjectId && (
                <InviteFriendsModal
                    projectId={createdProjectId}
                    onClose={handleCloseInviteModal}
                    onInviteSent={handleInviteSent}
                />
            )}
        </div>
    );
};

export default CreateProjectPage;