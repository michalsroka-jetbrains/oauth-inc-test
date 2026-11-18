import React from 'react';

const GOOGLE_OAUTH2_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const CLIENT_ID = '66335514708-c5sg7boq7scjfqadfmmq4f6rsj87vq7a.apps.googleusercontent.com';
const REDIRECT_URI = 'http://localhost:8000/auth/callback';
const SCOPE = 'email https://www.googleapis.com/auth/bigquery';

const LoginButton: React.FC = () => {
    const handleLogin = () => {
        const params = new URLSearchParams({
            client_id: CLIENT_ID ?? '',
            redirect_uri: REDIRECT_URI ?? '',
            response_type: 'code',
            scope: SCOPE,
            access_type: 'offline',
            prompt: 'consent',
        });

        window.location.href = `${GOOGLE_OAUTH2_URL}?${params.toString()}`;
    };

    return <button onClick={handleLogin}>Login with Google</button>;
};

export default LoginButton;
