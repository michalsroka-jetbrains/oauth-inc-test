import axios from "axios";
import qs from "qs";
import { OAuth2Client } from 'google-auth-library';
import { ApiConfig } from "./config";

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

export interface TokenSet {
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
}

export type PrincipalKind = 'user' | 'service-account';

export interface Principal {
    email: string;
    kind: PrincipalKind;
    scopes: string[];
}

export async function exchangeAuthorizationCode(config: ApiConfig, code: string): Promise<TokenSet> {
    const response = await axios.post(
        GOOGLE_TOKEN_URL,
        qs.stringify({
            code,
            client_id: config.clientId,
            client_secret: config.clientSecret,
            redirect_uri: config.redirectUri,
            grant_type: 'authorization_code',
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { access_token, refresh_token, expires_in } = response.data;
    return { accessToken: access_token, refreshToken: refresh_token, expiresIn: expires_in };
}

export async function refreshAccessToken(config: ApiConfig, refreshToken: string): Promise<TokenSet> {
    try {
        const response = await axios.post(
            GOOGLE_TOKEN_URL,
            qs.stringify({
                client_id: config.clientId,
                client_secret: config.clientSecret,
                refresh_token: refreshToken,
                grant_type: 'refresh_token',
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const { access_token, expires_in } = response.data;
        return { accessToken: access_token, expiresIn: expires_in };
    } catch (error: any) {
        console.error('Error refreshing access token:', error.response?.data || error.message);
        throw error;
    }
}

export async function getPrincipalFromAccessToken(accessToken: string): Promise<Principal> {
    const oauth2Client = new OAuth2Client();
    const tokenInfo = await oauth2Client.getTokenInfo(accessToken);
    const email = tokenInfo.email ?? '';

    return {
        email,
        kind: email.endsWith('iam.gserviceaccount.com') ? 'service-account' : 'user',
        scopes: tokenInfo.scopes,
    };
}
