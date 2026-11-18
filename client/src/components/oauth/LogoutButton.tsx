import React from 'react';
import { logout } from '../../api/apiClient';

const LogoutButton: React.FC = () => {
    const handleLogout = async () => {
        try {
            await logout();
        } finally {
            localStorage.removeItem('google_token');
            window.location.reload();
        }
    };

    return <button onClick={handleLogout}>Log out</button>;
};

export default LogoutButton;
