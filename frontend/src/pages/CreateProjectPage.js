// NJ (Noah) Dollenberg u24596142 41
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const CreateProjectPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        language: 'JavaScript',
        version: '1.0.0',
        isPublic: true
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Creating project:', formData);
        alert('Project created successfully!');
        navigate('/home');
    };

    return (
        <div className="create-project-page">
            <Header />
            <main className="main-content">
                <div className="container">
                    <h1>Create New Project</h1>
                    
                    <form onSubmit={handleSubmit} className="project-form">
                        <div className="form-group">
                            <label htmlFor="name">Project Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="language">Language</label>
                            <select
                                id="language"
                                name="language"
                                value={formData.language}
                                onChange={handleInputChange}
                            >
                                <option value="JavaScript">JavaScript</option>
                                <option value="Python">Python</option>
                                <option value="Java">Java</option>
                                <option value="React">React</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="version">Version</label>
                            <input
                                type="text"
                                id="version"
                                name="version"
                                value={formData.version}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>
                                <input
                                    type="checkbox"
                                    name="isPublic"
                                    checked={formData.isPublic}
                                    onChange={handleInputChange}
                                />
                                Make this project public
                            </label>
                        </div>

                        <div className="form-actions">
                            <button type="button" onClick={() => navigate('/home')}>
                                Cancel
                            </button>
                            <button type="submit">
                                Create Project
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default CreateProjectPage;