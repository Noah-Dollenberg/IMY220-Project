//NJ (Noah) Dollenberg u24596142 41
import React, { useState, useEffect } from 'react';
import { projectsAPI } from '../services/api';

const ProjectInvitations = () => {
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadInvitations();
    }, []);

    const loadInvitations = async () => {
        try {
            const response = await projectsAPI.getInvitations();
            setInvitations(response.invitations);
        } catch (error) {
            console.error('Error loading invitations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (projectId, invitedBy) => {
        try {
            await projectsAPI.acceptInvitation(projectId, invitedBy);
            loadInvitations();
        } catch (error) {
            console.error('Error accepting invitation:', error);
        }
    };

    const handleDecline = async (projectId, invitedBy) => {
        try {
            await projectsAPI.declineInvitation(projectId, invitedBy);
            loadInvitations();
        } catch (error) {
            console.error('Error declining invitation:', error);
        }
    };

    if (loading) return <div>Loading invitations...</div>;

    if (invitations.length === 0) {
        return <div>No project invitations</div>;
    }

    return (
        <div className="project-invitations">
            <h3>Project Invitations</h3>
            {invitations.map((invitation) => (
                <div key={`${invitation.projectId}-${invitation.invitedBy}`} className="invitation-item">
                    <div>
                        <strong>{invitation.inviterInfo?.name}</strong> invited you to join 
                        <strong> {invitation.projectInfo?.name}</strong>
                    </div>
                    <div className="invitation-actions">
                        <button 
                            onClick={() => handleAccept(invitation.projectId, invitation.invitedBy)}
                            className="accept-btn"
                        >
                            Accept
                        </button>
                        <button 
                            onClick={() => handleDecline(invitation.projectId, invitation.invitedBy)}
                            className="decline-btn"
                        >
                            Decline
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProjectInvitations;