// NJ (Noah) Dollenberg u24596142 41
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import InviteFriendsModal from '../components/InviteFriendsModal';
import { projectsAPI, friendsAPI } from '../services/api';

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
    const [projectImage, setProjectImage] = useState(null);
    const [projectImagePreview, setProjectImagePreview] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [errors, setErrors] = useState({});
    const [showInviteFriends, setShowInviteFriends] = useState(false);
    const [createdProjectId, setCreatedProjectId] = useState(null);
    const [friends, setFriends] = useState([]);
    const [selectedFriends, setSelectedFriends] = useState([]);


    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const userId = currentUser._id || currentUser.id;
                console.log('Fetching friends for user:', userId);
                const friendsData = await friendsAPI.getFriends(userId);
                console.log('Friends data received:', friendsData);
                setFriends(friendsData.friends || []);
            } catch (error) {
                console.error('Failed to fetch friends:', error);
            }
        };

        if (currentUser?._id || currentUser?.id) {
            fetchFriends();
        }
    }, [currentUser]);

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

    const generateHashtagsFromFiles = (files) => {
        const extensions = files.map(file => {
            const ext = file.name.split('.').pop().toLowerCase();
            return ext;
        });

        const hashtags = new Set();

        if (formData.language) {
            hashtags.add(formData.language);
        }

        const extensionMap = {
            'js': 'JavaScript',
            'jsx': 'React',
            'ts': 'TypeScript',
            'tsx': 'React',
            'py': 'Python',
            'java': 'Java',
            'cpp': 'C++',
            'c': 'C',
            'cs': 'CSharp',
            'php': 'PHP',
            'rb': 'Ruby',
            'go': 'Go',
            'rs': 'Rust',
            'swift': 'Swift',
            'kt': 'Kotlin',
            'html': 'HTML',
            'css': 'CSS',
            'scss': 'SCSS',
            'json': 'JSON',
            'xml': 'XML',
            'sql': 'SQL',
            'md': 'Documentation',
            'sh': 'Shell',
            'yml': 'DevOps',
            'yaml': 'DevOps',
            'dockerfile': 'Docker',
            'vue': 'Vue'
        };

        extensions.forEach(ext => {
            if (extensionMap[ext]) {
                hashtags.add(extensionMap[ext]);
            }
        });

        return Array.from(hashtags);
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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB');
                return;
            }

            setProjectImage(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setProjectImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeProjectImage = () => {
        setProjectImage(null);
        setProjectImagePreview(null);
    };



    const toggleFriendSelection = (friendId) => {
        setSelectedFriends(prev =>
            prev.includes(friendId)
                ? prev.filter(id => id !== friendId)
                : [...prev, friendId]
        );
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
            const fileObjects = uploadedFiles.map(f => f.file);
            const generatedHashtags = generateHashtagsFromFiles(fileObjects);

            let imageBase64 = null;
            if (projectImage) {
                const reader = new FileReader();
                imageBase64 = await new Promise((resolve) => {
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(projectImage);
                });
            }

            const projectData = {
                name: formData.name,
                description: formData.description,
                language: formData.language,
                version: formData.version,
                isPublic: formData.isPublic,
                image: imageBase64,
                hashtags: generatedHashtags,
                files: []
            };

            const response = await projectsAPI.create(projectData);
            setCreatedProjectId(response.projectId);

            if (uploadedFiles.length > 0) {
                await projectsAPI.uploadFiles(response.projectId, fileObjects);
            }

            if (selectedFriends.length > 0) {
                try {
                    await Promise.all(
                        selectedFriends.map(friendId =>
                            projectsAPI.sendInvitation(response.projectId, friendId)
                        )
                    );
                    alert(`Project created successfully! Invitations sent to ${selectedFriends.length} friend${selectedFriends.length !== 1 ? 's' : ''}.`);
                } catch (inviteError) {
                    console.error('Invitation error:', inviteError);
                    alert('Project created successfully, but some invitations failed to send.');
                }
            } else {
                alert('Project created successfully!');
            }

            navigate('/home');
        } catch (error) {
            alert('Failed to create project: ' + error.message);
        }
    };

    return (
        <div className="min-h-screen bg-accent">
            <Header currentUser={currentUser} onLogout={onLogout} />
            <main className="py-8">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="bg-white rounded p-8">
                        <div className="mb-8">
                            <h1 className="font-inter text-2xl font-bold text-dark mb-2">Create New Project</h1>
                            <p className="font-khula text-darker">Set up your new project with all the details and files needed to get started</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">

                            <div>
                                <h3 className="font-inter text-lg font-semibold text-dark mb-4">Project Image (Optional)</h3>
                                <div className="flex items-start gap-4">
                                    {projectImagePreview ? (
                                        <div className="relative">
                                            <img
                                                src={projectImagePreview}
                                                alt="Project preview"
                                                className="w-32 h-32 object-cover rounded border border-fill"
                                            />
                                            <button
                                                type="button"
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                                                onClick={removeProjectImage}
                                                title="Remove image"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-32 h-32 border-2 border-dashed border-fill rounded flex items-center justify-center bg-accent">
                                            <span className="text-4xl">🖼️</span>
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <p className="font-khula text-darker mb-3">Upload an image to represent your project</p>
                                        <input
                                            type="file"
                                            id="image-input"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="image-input"
                                            className="inline-block bg-fill text-dark px-4 py-2 rounded font-khula hover:bg-accent transition-colors cursor-pointer"
                                        >
                                            {projectImagePreview ? 'Change Image' : 'Choose Image'}
                                        </label>
                                        <p className="font-khula text-xs text-darker mt-2">Max size: 5MB. Supported formats: JPG, PNG, GIF</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-inter text-lg font-semibold text-dark mb-4">Project Files</h3>
                                <div
                                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? 'border-highlight bg-yellow-50' : 'border-fill'
                                        }`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    <div>
                                        <div className="text-4xl mb-4">📁</div>
                                        <h4 className="font-inter font-medium text-dark mb-2">Drag & Drop files here</h4>
                                        <p className="font-khula text-darker mb-4">or click to browse and select files</p>
                                        <input
                                            type="file"
                                            id="file-input"
                                            multiple
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        <label htmlFor="file-input" className="bg-fill text-dark px-4 py-2 rounded font-khula hover:bg-accent transition-colors cursor-pointer">
                                            Choose Files
                                        </label>
                                    </div>
                                </div>

                                {uploadedFiles.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="font-inter font-medium text-dark mb-3">Uploaded Files ({uploadedFiles.length})</h4>
                                        <div className="space-y-2">
                                            {uploadedFiles.map((file) => (
                                                <div key={file.id} className="flex items-center gap-3 p-3 bg-accent rounded border border-fill">
                                                    <div className="text-xl">📄</div>
                                                    <div className="flex-1">
                                                        <div className="font-khula font-medium text-dark">{file.name}</div>
                                                        <div className="font-khula text-sm text-darker">{formatFileSize(file.size)}</div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="text-red-500 hover:text-red-700 text-xl"
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
                            <div>
                                <h3 className="font-inter text-lg font-semibold text-dark mb-4">Project Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block font-khula text-sm font-medium text-dark mb-1">Project Name *</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded font-khula focus:outline-none focus:border-highlight ${errors.name ? 'border-red-500' : 'border-fill'
                                                }`}
                                            placeholder="Enter a unique project name"
                                            required
                                        />
                                        {errors.name && <div className="text-red-500 text-sm mt-1 font-khula">{errors.name}</div>}
                                    </div>

                                    <div>
                                        <label htmlFor="language" className="block font-khula text-sm font-medium text-dark mb-1">Primary Language</label>
                                        <select
                                            id="language"
                                            name="language"
                                            value={formData.language}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-fill rounded font-khula focus:outline-none focus:border-highlight"
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

                                    <div className="md:col-span-2">
                                        <label htmlFor="description" className="block font-khula text-sm font-medium text-dark mb-1">Description *</label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded font-khula focus:outline-none focus:border-highlight ${errors.description ? 'border-red-500' : 'border-fill'
                                                }`}
                                            placeholder="Describe what your project does and its main features"
                                            rows="4"
                                            required
                                        />
                                        {errors.description && <div className="text-red-500 text-sm mt-1 font-khula">{errors.description}</div>}
                                    </div>

                                    <div>
                                        <label htmlFor="version" className="block font-khula text-sm font-medium text-dark mb-1">Initial Version *</label>
                                        <input
                                            type="text"
                                            id="version"
                                            name="version"
                                            value={formData.version}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded font-khula focus:outline-none focus:border-highlight ${errors.version ? 'border-red-500' : 'border-fill'
                                                }`}
                                            placeholder="1.0.0"
                                            required
                                        />
                                        {errors.version && <div className="text-red-500 text-sm mt-1 font-khula">{errors.version}</div>}
                                    </div>

                                    <div>
                                        <label className="block font-khula text-sm font-medium text-dark mb-3">Visibility</label>
                                        <div className="space-y-3">
                                            <label className="flex items-start gap-3 p-3 border border-fill rounded cursor-pointer hover:bg-accent">
                                                <input
                                                    type="radio"
                                                    name="isPublic"
                                                    value="true"
                                                    checked={formData.isPublic === true}
                                                    onChange={() => setFormData(prev => ({ ...prev, isPublic: true }))}
                                                    className="mt-1"
                                                />
                                                <div>
                                                    <div className="font-khula font-medium text-dark">Public</div>
                                                    <div className="font-khula text-sm text-darker">Anyone can view this project</div>
                                                </div>
                                            </label>
                                            <label className="flex items-start gap-3 p-3 border border-fill rounded cursor-pointer hover:bg-accent">
                                                <input
                                                    type="radio"
                                                    name="isPublic"
                                                    value="false"
                                                    checked={formData.isPublic === false}
                                                    onChange={() => setFormData(prev => ({ ...prev, isPublic: false }))}
                                                    className="mt-1"
                                                />
                                                <div>
                                                    <div className="font-khula font-medium text-dark">Private</div>
                                                    <div className="font-khula text-sm text-darker">Only you and collaborators can view</div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-inter text-lg font-semibold text-dark mb-2">Invite Friends (Optional)</h3>
                                <p className="font-khula text-darker mb-4">Select friends to invite to collaborate on this project.</p>

                                {friends.length > 0 ? (
                                    <div className="border border-fill rounded">
                                        <div className={`space-y-2 p-4 ${friends.length > 3 ? 'max-h-48 overflow-y-auto' : ''}`}>
                                            {friends.map((friend) => {
                                                const friendId = friend._id || friend.id;
                                                return (
                                                    <div key={friendId} className="flex items-center justify-between p-3 bg-accent rounded border border-fill">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                                                {friend.profilePicture ? (
                                                                    <img src={friend.profilePicture} alt={friend.name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full bg-highlight flex items-center justify-center text-dark text-sm font-bold">
                                                                        {friend.name?.charAt(0) || 'U'}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="font-khula font-medium text-dark">{friend.name}</div>
                                                                <div className="font-khula text-sm text-darker">{friend.email}</div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            className={`px-4 py-2 rounded font-khula transition-colors ${selectedFriends.includes(friendId)
                                                                    ? 'bg-highlight text-dark hover:bg-yellow-400'
                                                                    : 'bg-fill text-dark hover:bg-accent'
                                                                }`}
                                                            onClick={() => toggleFriendSelection(friendId)}
                                                        >
                                                            {selectedFriends.includes(friendId) ? 'Invited' : 'Invite'}
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {selectedFriends.length > 0 && (
                                            <div className="p-3 bg-yellow-50 border-t border-fill">
                                                <p className="font-khula text-sm text-darker">
                                                    {selectedFriends.length} friend{selectedFriends.length !== 1 ? 's' : ''} will be invited
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-4 bg-accent border border-fill rounded">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">👥</span>
                                            <span className="font-khula text-dark">No friends to invite yet</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    type="button"
                                    className="px-6 py-3 bg-fill text-dark rounded font-khula hover:bg-accent transition-colors"
                                    onClick={() => navigate('/home')}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-highlight text-dark rounded font-khula hover:bg-yellow-400 transition-colors"
                                >
                                    Create Project
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>


        </div>
    );
};

export default CreateProjectPage;