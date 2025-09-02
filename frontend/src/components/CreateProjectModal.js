// u24596142 NJ (Noah) Dollenberg 41
import React, { useState } from 'react';

const CreateProjectModal = ({ onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        language: 'JavaScript',
        version: '1.0.0',
        isPublic: true,
        owners: 'me'
    });
    const [errors, setErrors] = useState({});
    const [dragActive, setDragActive] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);

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
            name: file.name,
            size: file.size,
            type: file.type
        }));
        setUploadedFiles(prev => [...prev, ...fileArray]);
    };

    const removeFile = (index) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const projectData = {
            ...formData,
            files: uploadedFiles,
            createdAt: new Date().toISOString()
        };

        if (onSubmit) {
            onSubmit(projectData);
        } else {
            console.log('Creating project:', projectData);
            alert('Project created successfully!');
            onClose();
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Create Project</h2>
                    <button className="modal-close" onClick={onClose}>
                        &times;
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="project-form">
                    <div className="form-section">
                        <label className="section-title">Project Files</label>
                        <div
                            className={`file-upload-area ${dragActive ? 'drag-active' : ''}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <div className="upload-content">
                                <div className="upload-icon">📁</div>
                                <p>Drag & Drop files here</p>
                                <p>or</p>
                                <input
                                    type="file"
                                    id="file-input"
                                    multiple
                                    onChange={handleFileChange}
                                    className="file-input"
                                />
                                <label htmlFor="file-input" className="btn btn-secondary">
                                    Add Files
                                </label>
                            </div>
                        </div>

                        {uploadedFiles.length > 0 && (
                            <div className="uploaded-files">
                                {uploadedFiles.map((file, index) => (
                                    <div key={index} className="file-item">
                                        <span className="file-name">{file.name}</span>
                                        <span className="file-size">{formatFileSize(file.size)}</span>
                                        <button
                                            type="button"
                                            className="file-remove"
                                            onClick={() => removeFile(index)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="name" className="form-label">Project Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={`form-input ${errors.name ? 'error' : ''}`}
                                placeholder="Enter project name"
                                required
                            />
                            {errors.name && <div className="error-message">{errors.name}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="language" className="form-label">Language</label>
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
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="description" className="form-label">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                className={`form-input ${errors.description ? 'error' : ''}`}
                                placeholder="Describe your project"
                                rows="3"
                                required
                            />
                            {errors.description && <div className="error-message">{errors.description}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="version" className="form-label">Version</label>
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
                    </div>

                    <div className="form-section">
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Public</label>
                                <div className="radio-group">
                                    <label className="radio-label">
                                        <input
                                            type="radio"
                                            name="isPublic"
                                            value="true"
                                            checked={formData.isPublic === true}
                                            onChange={(e) => setFormData(prev => ({ ...prev, isPublic: true }))}
                                        />
                                        Yes
                                    </label>
                                    <label className="radio-label">
                                        <input
                                            type="radio"
                                            name="isPublic"
                                            value="false"
                                            checked={formData.isPublic === false}
                                            onChange={(e) => setFormData(prev => ({ ...prev, isPublic: false }))}
                                        />
                                        No
                                    </label>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Owners</label>
                                <div className="radio-group">
                                    <label className="radio-label">
                                        <input
                                            type="radio"
                                            name="owners"
                                            value="me"
                                            checked={formData.owners === 'me'}
                                            onChange={handleInputChange}
                                        />
                                        Me
                                    </label>
                                    <label className="radio-label">
                                        <input
                                            type="radio"
                                            name="owners"
                                            value="friends"
                                            checked={formData.owners === 'friends'}
                                            onChange={handleInputChange}
                                        />
                                        Friends
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Create Project
                        </button>
                    </div>
                </form>

                <style jsx>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
          }

          .modal-content {
            background-color: var(--white);
            border-radius: 16px;
            padding: 0;
            position: relative;
            max-width: 600px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 24px 32px;
            border-bottom: 1px solid var(--fill-color);
          }

          .modal-header h2 {
            font-family: 'Inter', sans-serif;
            font-size: 24px;
            font-weight: 700;
            color: var(--main-text);
            margin: 0;
          }

          .modal-close {
            background: none;
            border: none;
            font-size: 32px;
            color: var(--soft-text);
            cursor: pointer;
            line-height: 1;
            padding: 0;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .modal-close:hover {
            color: var(--main-text);
          }

          .project-form {
            padding: 32px;
          }

          .form-section {
            margin-bottom: 32px;
          }

          .section-title {
            font-family: 'Inter', sans-serif;
            font-size: 16px;
            font-weight: 600;
            color: var(--main-text);
            display: block;
            margin-bottom: 16px;
          }

          .file-upload-area {
            border: 2px dashed var(--fill-color);
            border-radius: 8px;
            padding: 40px 20px;
            text-align: center;
            transition: all 0.3s ease;
            background-color: #fafafa;
          }

          .file-upload-area.drag-active {
            border-color: var(--highlight);
            background-color: rgba(245, 203, 92, 0.1);
          }

          .upload-content p {
            font-family: 'Khula', sans-serif;
            color: var(--soft-text);
            margin: 8px 0;
          }

          .upload-icon {
            font-size: 48px;
            margin-bottom: 16px;
          }

          .file-input {
            display: none;
          }

          .uploaded-files {
            margin-top: 16px;
            border: 1px solid var(--fill-color);
            border-radius: 8px;
            padding: 16px;
            background-color: var(--white);
          }

          .file-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 8px 0;
            border-bottom: 1px solid var(--accent-bg);
          }

          .file-item:last-child {
            border-bottom: none;
          }

          .file-name {
            flex: 1;
            font-family: 'Khula', sans-serif;
            font-size: 14px;
            color: var(--main-text);
          }

          .file-size {
            font-family: 'Khula', sans-serif;
            font-size: 12px;
            color: var(--soft-text);
          }

          .file-remove {
            background: none;
            border: none;
            color: var(--soft-text);
            cursor: pointer;
            font-size: 20px;
            padding: 4px;
            line-height: 1;
          }

          .file-remove:hover {
            color: #e74c3c;
          }

          .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 24px;
          }

          .form-group.full-width {
            grid-column: 1 / -1;
          }

          .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }

          .radio-group {
            display: flex;
            gap: 16px;
          }

          .radio-label {
            display: flex;
            align-items: center;
            gap: 8px;
            font-family: 'Khula', sans-serif;
            color: var(--main-text);
            cursor: pointer;
          }

          .radio-label input[type="radio"] {
            accent-color: var(--highlight);
          }

          .form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 16px;
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid var(--fill-color);
          }

          textarea.form-input {
            resize: vertical;
            min-height: 80px;
          }

          @media (max-width: 768px) {
            .modal-content {
              margin: 10px;
              max-height: 95vh;
            }

            .modal-header {
              padding: 20px 24px;
            }

            .project-form {
              padding: 24px;
            }

            .form-grid {
              grid-template-columns: 1fr;
              gap: 16px;
            }

            .form-row {
              grid-template-columns: 1fr;
            }

            .form-actions {
              flex-direction: column-reverse;
            }

            .file-upload-area {
              padding: 32px 16px;
            }
          }
        `}</style>
            </div>
        </div>
    );
};

export default CreateProjectModal;