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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-semibold">Edit Profile</h2>
                    <button className="text-gray-500 hover:text-gray-700 text-2xl" onClick={onClose}>
                        &times;
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                        <div className="flex flex-col items-center space-y-4">
                            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                {previewImage ? (
                                    <img src={previewImage} alt="Profile Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-yellow-400 flex items-center justify-center text-white text-4xl font-bold">
                                        <span>
                                            {user?.avatarEmoji || '👤'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div
                                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                                    }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <div className="space-y-2">
                                    <div className="text-2xl">📷</div>
                                    <p className="text-sm text-gray-600">Drag & drop an image here</p>
                                    <p className="text-sm text-gray-600">or</p>
                                    <input
                                        type="file"
                                        id="profile-picture-input"
                                        accept="image/*"
                                        onChange={handleFileInput}
                                        className="hidden"
                                    />
                                    <label htmlFor="profile-picture-input" className="inline-block px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 cursor-pointer">
                                        Choose Image
                                    </label>
                                </div>
                            </div>

                            {previewImage && (
                                <button
                                    type="button"
                                    className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                                    onClick={removeImage}
                                >
                                    Remove Image
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Your full name"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="your.email@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                            <input
                                type="text"
                                id="company"
                                name="company"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.company}
                                onChange={handleInputChange}
                                placeholder="Company name"
                            />
                        </div>

                        <div>
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                            <input
                                type="text"
                                id="country"
                                name="country"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.country}
                                onChange={handleInputChange}
                                placeholder="Your country"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">Birth Date</label>
                            <input
                                type="date"
                                id="birthDate"
                                name="birthDate"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.birthDate}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-6 border-t">
                        <button
                            type="button"
                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
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