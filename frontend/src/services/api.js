//NJ (Noah) Dollenberg u24596142 41
const API_BASE_URL = '';

const getAuthHeaders = () => {
    const token = localStorage.getItem('userToken');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

const handleResponse = async (response) => {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'API request failed');
    }
    return data;
};

export const authAPI = {
    login: async (email, password) => {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        return handleResponse(response);
    },

    signup: async (email, password) => {
        const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        return handleResponse(response);
    },

    getCurrentUser: async () => {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    logout: () => {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
    }
};

export const projectsAPI = {
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/api/projects`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    getById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    create: async (projectData) => {
        const response = await fetch(`${API_BASE_URL}/api/projects`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(projectData)
        });
        return handleResponse(response);
    },

    checkout: async (id) => {
        const response = await fetch(`${API_BASE_URL}/api/projects/${id}/checkout`, {
            method: 'POST',
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    checkin: async (id, message, version, files = []) => {
        const response = await fetch(`${API_BASE_URL}/api/projects/${id}/checkin`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ message, version, files })
        });
        return handleResponse(response);
    }
};

export const activityAPI = {
    getFeed: async (feedType) => {
        const response = await fetch(`${API_BASE_URL}/api/activity/${feedType}`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    }
};

export const searchAPI = {
    users: async (query) => {
        const response = await fetch(`${API_BASE_URL}/api/search/users?q=${encodeURIComponent(query)}`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    projects: async (query, type, hashtag) => {
        const params = new URLSearchParams();
        if (query) params.append('q', query);
        if (type) params.append('type', type);
        if (hashtag) params.append('hashtag', hashtag);

        const response = await fetch(`${API_BASE_URL}/api/search/projects?${params}`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    }
};

export const usersAPI = {
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/api/users`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    search: async (query) => {
        const response = await fetch(`${API_BASE_URL}/api/users/search?q=${encodeURIComponent(query)}`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    getById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    update: async (id, userData) => {
        const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(userData)
        });
        return handleResponse(response);
    }
};

export const friendsAPI = {
    sendRequest: async (userId) => {
        const response = await fetch(`${API_BASE_URL}/api/friends/request`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ userId })
        });
        return handleResponse(response);
    },

    acceptRequest: async (requestId) => {
        const response = await fetch(`${API_BASE_URL}/api/friends/accept`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ requestId })
        });
        return handleResponse(response);
    },

    declineRequest: async (requestId) => {
        const response = await fetch(`${API_BASE_URL}/api/friends/decline`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ requestId })
        });
        return handleResponse(response);
    },

    getRequests: async () => {
        const response = await fetch(`${API_BASE_URL}/api/friends/requests`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    getFriends: async (userId) => {
        const response = await fetch(`${API_BASE_URL}/api/friends/${userId}`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    }
};