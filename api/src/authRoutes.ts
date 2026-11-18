import { NextFunction, Request, Response, Router } from "express";
import { ApiConfig } from "./config";
import { exchangeAuthorizationCode, getPrincipalFromAccessToken, refreshAccessToken } from "./tokenService";

export function authRouter(config: ApiConfig): Router {
    const router = Router();

    router.get('/auth/callback', async (req, res) => {
        const code = req.query.code;
        if (typeof code !== 'string') {
            res.status(400).send('Missing authorization code.');
            return;
        }

        try {
            const tokens = await exchangeAuthorizationCode(config, code);
            const principal = await getPrincipalFromAccessToken(tokens.accessToken);

            req.session.accessToken = tokens.accessToken;
            req.session.refreshToken = tokens.refreshToken;
            req.session.tokenExpiry = Date.now() + tokens.expiresIn * 1000;
            req.session.principalEmail = principal.email;

            res.status(200).send('Auth completed. This window can be closed.');
        } catch (error: any) {
            console.error('Error exchanging code for tokens:', error.response?.data || error.message);
            res.status(500).send('Authentication failed.');
        }
    });

    router.post('/auth/logout', (req, res) => {
        req.session.destroy((error) => {
            if (error) {
                res.status(500).send('Logout failed.');
                return;
            }
            res.status(204).end();
        });
    });

    return router;
}

export function requireFreshSessionToken(config: ApiConfig) {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (!req.session.accessToken || !req.session.refreshToken) {
            res.status(401).send('Unauthorized');
            return;
        }

        try {
            if (!req.session.tokenExpiry || Date.now() >= req.session.tokenExpiry) {
                const refreshed = await refreshAccessToken(config, req.session.refreshToken);
                req.session.accessToken = refreshed.accessToken;
                req.session.tokenExpiry = Date.now() + refreshed.expiresIn * 1000;
            }
            next();
        } catch (error) {
            console.error('Error refreshing session token:', error);
            res.status(401).send('Session expired.');
        }
    };
}
