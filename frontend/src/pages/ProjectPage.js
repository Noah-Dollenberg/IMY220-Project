// u24596142 NJ (Noah) Dollenberg 41
import React from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';

const ProjectPage = () => {
    const { projectId } = useParams();

    return (
        <div className="project-page">
            <Header />

            <main className="project-content">
                <div className="container">
                    <div className="project-layout">
                        <div className="project-header">
                            <h1>Project #{projectId}</h1>
                            <p>Project details will be implemented in future deliverables</p>
                        </div>

                        <div className="placeholder-content">
                            <div className="card">
                                <h2>Project Information</h2>
                                <p>This page will contain:</p>
                                <ul>
                                    <li>Project details and description</li>
                                    <li>File browser and code viewer</li>
                                    <li>Check-in/check-out messages</li>
                                    <li>Project contributors</li>
                                    <li>Project settings</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProjectPage;