import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const getAdminHeaders = () => {
    const adminApiKey = localStorage.getItem('admin_api_key');
    return {
        headers: {
            'Authorization': `Api-Key ${adminApiKey}`
        }
    };
};

export const grantAdminPrivileges = async (username) => {
    try {
        const response = await axios.post(
            `${API_URL}/admin/grant/`,
            { username },
            getAdminHeaders()
        );
        return { success: true, message: response.data.message };
    } catch (error) {
        return { 
            success: false, 
            message: error.response?.data?.error || 'Failed to grant admin privileges' 
        };
    }
};

export const revokeAdminPrivileges = async (username) => {
    try {
        // Get the current admin's username from localStorage
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (!currentUser || !currentUser.username) {
            throw new Error('Current user information not found');
        }

        const response = await axios.post(
            `${API_URL}/admin/revoke/`,
            { 
                username,
                requesting_admin: currentUser.username
            },
            getAdminHeaders()
        );
        return { success: true, message: response.data.message };
    } catch (error) {
        return { 
            success: false, 
            message: error.response?.data?.error || 'Failed to revoke admin privileges' 
        };
    }
};

export const checkAdminStatus = async (username) => {
    try {
        const response = await axios.get(
            `${API_URL}/admin/check/${username}/`,
            getAdminHeaders()
        );
        return { 
            success: true, 
            isAdmin: response.data.is_admin,
            message: response.data.message 
        };
    } catch (error) {
        return { 
            success: false, 
            message: error.response?.data?.error || 'Failed to check admin status' 
        };
    }
}; 