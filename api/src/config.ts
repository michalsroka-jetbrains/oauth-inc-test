import dotenv from "dotenv";

dotenv.config();

export interface ApiConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    sessionSecret: string;
    gcpProjectId: string;
    bigQueryLocation: string;
    allowedOrigin: string;
    port: number;
}

function required(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable ${name}`);
    }
    return value;
}

export function loadConfig(): ApiConfig {
    return {
        clientId: required('CLIENT_ID'),
        clientSecret: required('CLIENT_SECRET'),
        redirectUri: required('REDIRECT_URI'),
        sessionSecret: required('SESSION_SECRET'),
        gcpProjectId: required('GCP_PROJECT_ID'),
        bigQueryLocation: process.env.BIGQUERY_LOCATION ?? 'us-east1',
        allowedOrigin: process.env.ALLOWED_ORIGIN ?? 'http://localhost:3000',
        port: Number(process.env.PORT ?? 8000),
    };
}
