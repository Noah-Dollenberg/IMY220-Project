// NJ (Noah) Dollenberg u24596142 41
import React, { useState } from 'react';

const EditProfileModal = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        company: user?.company || '',
        country: user?.country || '',
        birthDate: user?.birthDate || ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSave) {
            onSave(formData);
        }
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Edit Profile</h2>
                    <button className="modal-close" onClick={onClose}>
                        &times;
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="edit-profile-form">
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

                    <div className="form-group">
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

                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;