import React, { useState } from 'react';
import { 
    grantAdminPrivileges, 
    revokeAdminPrivileges, 
    checkAdminStatus 
} from '../services/adminService';

const AdminManagement = () => {
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'
    const [loading, setLoading] = useState(false);

    const handleAction = async (action) => {
        if (!username) {
            setMessage('Please enter a username');
            setMessageType('error');
            return;
        }

        // Get current user's username
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (action === 'revoke' && username === currentUser?.username) {
            setMessage('You cannot revoke your own admin privileges');
            setMessageType('error');
            return;
        }

        setLoading(true);
        let response;

        try {
            switch (action) {
                case 'grant':
                    response = await grantAdminPrivileges(username);
                    break;
                case 'revoke':
                    response = await revokeAdminPrivileges(username);
                    break;
                case 'check':
                    response = await checkAdminStatus(username);
                    if (response.success) {
                        setMessage(`User ${username} is ${response.isAdmin ? 'an admin' : 'not an admin'}`);
                        setMessageType(response.success ? 'success' : 'error');
                        setLoading(false);
                        return;
                    }
                    break;
                default:
                    break;
            }

            setMessage(response.message);
            setMessageType(response.success ? 'success' : 'error');
        } catch (error) {
            setMessage('An error occurred');
            setMessageType('error');
        }

        setLoading(false);
    };

    return (
        <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Admin Management</h2>
            
            <div className="mb-4">
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                />
            </div>

            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => handleAction('grant')}
                    disabled={loading}
                    className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                    Grant Admin
                </button>
                <button
                    onClick={() => handleAction('revoke')}
                    disabled={loading}
                    className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                    Revoke Admin
                </button>
                <button
                    onClick={() => handleAction('check')}
                    disabled={loading}
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Check Status
                </button>
            </div>

            {loading && (
                <div className="text-center text-gray-600">
                    Processing...
                </div>
            )}

            {message && (
                <div className={`mt-4 p-3 rounded-lg ${
                    messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                    {message}
                </div>
            )}
        </div>
    );
};

export default AdminManagement; 