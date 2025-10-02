// NJ (Noah) Dollenberg u24596142 41
import React, { useState } from 'react';

const ProjectActivityList = ({ activities, onDeleteActivity, maxVisible = 5 }) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [activityToDelete, setActivityToDelete] = useState(null);

    const handleDeleteClick = (activity) => {
        setActivityToDelete(activity);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (activityToDelete && onDeleteActivity) {
            onDeleteActivity(activityToDelete._id);
        }
        setShowDeleteModal(false);
        setActivityToDelete(null);
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setActivityToDelete(null);
    };

    const containerStyle = {
        maxHeight: activities.length > maxVisible ? '300px' : 'auto',
        overflowY: activities.length > maxVisible ? 'auto' : 'visible',
        paddingRight: activities.length > maxVisible ? '12px' : '0'
    };

    return (
        <>
            <div style={containerStyle} className="space-y-3">
                {activities.length > 0 ? (
                    activities.map((activity) => (
                        <div key={activity._id} className="flex items-start gap-3 p-4 bg-accent rounded-lg group">
                            <div className="text-xl">
                                {activity.type === 'check-in' ? '⬆️' : '⬇️'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-inter font-semibold text-dark">
                                        {activity.userInfo?.name || 'Unknown User'}
                                    </span>
                                    <span className="px-2 py-1 bg-highlight rounded text-xs font-khula text-dark">
                                        {activity.type}
                                    </span>
                                    <span className="font-khula text-xs text-darker">
                                        {new Date(activity.timestamp).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="font-khula text-darker text-sm mb-1">{activity.message}</p>
                                {activity.version && (
                                    <span className="font-khula text-xs text-darker bg-white px-2 py-1 rounded">
                                        Version: {activity.version}
                                    </span>
                                )}
                            </div>
                            {onDeleteActivity && (
                                <button
                                    onClick={() => handleDeleteClick(activity)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 p-1"
                                    title="Delete activity"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-accent rounded-lg">
                        <div className="text-4xl mb-4">💬</div>
                        <p className="font-khula text-darker">No activity yet</p>
                    </div>
                )}
            </div>

            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                        <h3 className="font-inter text-lg font-bold text-dark mb-4">Delete Activity</h3>
                        <p className="font-khula text-darker mb-6">
                            Are you sure you want to delete this activity? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 border border-fill rounded font-khula text-dark hover:bg-accent transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-500 text-white rounded font-khula hover:bg-red-600 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProjectActivityList;