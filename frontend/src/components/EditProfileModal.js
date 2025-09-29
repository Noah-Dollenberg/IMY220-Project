// NJ (Noah) Dollenberg u24596142 41
import React, { useState } from 'react';

const EditProfileModal = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        company: user?.company || '',
        country: user?.country || '',
        birthDate: user?.birthDate || '',
        profilePicture: user?.profilePicture || null
    });

    const [previewImage, setPreviewImage] = useState(user?.profilePicture || null);
    const [dragActive, setDragActive] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageUpload = (file) => {
        if (file && file.type.startsWith('image/')) {
            if (file.size > 10 * 1024 * 1024) {
                alert('Image must be smaller than 10MB');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    const maxSize = 150;
                    let { width, height } = img;
                    
                    if (width > height) {
                        if (width > maxSize) {
                            height = (height * maxSize) / width;
                            width = maxSize;
                        }
                    } else {
                        if (height > maxSize) {
                            width = (width * maxSize) / height;
                            height = maxSize;
                        }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    const compressedDataUrl = canvas.toDataURL('image/jpeg', 1);
                    setPreviewImage(compressedDataUrl);
                    setFormData(prev => ({
                        ...prev,
                        profilePicture: compressedDataUrl
                    }));
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFileInput = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleImageUpload(file);
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

        const file = e.dataTransfer.files[0];
        if (file) {
            handleImageUpload(file);
        }
    };

    const removeImage = () => {
        setPreviewImage(null);
        setFormData(prev => ({
            ...prev,
            profilePicture: null
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            await onSave(formData);
        } catch (error) {
            alert('Failed to save profile: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content edit-profile-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Edit Profile</h2>
                    <button className="modal-close" onClick={onClose}>
                        &times;
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="edit-profile-form">
                    <div className="form-group profile-picture-section">
                        <label className="form-label">Profile Picture</label>
                        <div className="profile-picture-container">
                            <div className="current-picture">
                                {previewImage ? (
                                    <img src={previewImage} alt="Profile Preview" className="profile-preview" />
                                ) : (
                                    <div className="profile-placeholder">
                                        <span className="placeholder-text">
                                            {formData.name?.charAt(0) || 'U'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div
                                className={`image-upload-area ${dragActive ? 'drag-active' : ''}`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <div className="upload-content">
                                    <div className="upload-icon">📷</div>
                                    <p>Drag & drop an image here</p>
                                    <p>or</p>
                                    <input
                                        type="file"
                                        id="profile-picture-input"
                                        accept="image/*"
                                        onChange={handleFileInput}
                                        className="file-input"
                                    />
                                    <label htmlFor="profile-picture-input" className="btn btn-secondary btn-small">
                                        Choose Image
                                    </label>
                                </div>
                            </div>

                            {previewImage && (
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-small remove-image-btn"
                                    onClick={removeImage}
                                >
                                    Remove Image
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="name" className="form-label">Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                className="form-input"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Your full name"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="form-input"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="your.email@example.com"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="company" className="form-label">Company</label>
                            <input
                                type="text"
                                id="company"
                                name="company"
                                className="form-input"
                                value={formData.company}
                                onChange={handleInputChange}
                                placeholder="Company name"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="country" className="form-label">Country</label>
                            <input
                                type="text"
                                id="country"
                                name="country"
                                className="form-input"
                                value={formData.country}
                                onChange={handleInputChange}
                                placeholder="Your country"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="birthDate" className="form-label">Birth Date</label>
                            <input
                                type="date"
                                id="birthDate"
                                name="birthDate"
                                className="form-input"
                                value={formData.birthDate}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;