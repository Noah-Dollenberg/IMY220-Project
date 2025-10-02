// u24596142 NJ (Noah) Dollenberg 41
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { projectsAPI } from '../services/api';

const CreateProjectPage = ({ currentUser }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    language: 'JavaScript',
    version: '1.0.0',
    isPublic: true
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [fileObjects, setFileObjects] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    const fileArray = Array.from(files);
    const fileInfo = fileArray.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type
    }));
    setUploadedFiles(prev => [...prev, ...fileInfo]);
    setFileObjects(prev => [...prev, ...fileArray]);
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setFileObjects(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const projectData = {
        name: formData.name,
        description: formData.description,
        language: formData.language,
        version: formData.version,
        isPublic: formData.isPublic,
        files: []
      };

      const response = await projectsAPI.create(projectData);
      
      // Upload files if any
      if (fileObjects.length > 0) {
        await projectsAPI.uploadFiles(response.projectId, fileObjects);
      }

      alert('Project created successfully!');
      navigate('/home');
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to create project' });
    } finally {
      setIsSubmitting(false);
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
            <button
              type="button"
              className="btn btn-secondary btn-large"
              onClick={() => navigate('/home')}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-large"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Project...' : 'Create Project'}
            </button>
          </div>

          {errors.submit && (
            <div className="error-message submit-error">{errors.submit}</div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;