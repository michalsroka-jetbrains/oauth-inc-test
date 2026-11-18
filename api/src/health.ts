import { Router } from "express";

export interface HealthStatus {
    status: 'ok';
    uptimeSeconds: number;
    timestamp: string;
}

export function getHealthStatus(): HealthStatus {
    return {
        status: 'ok',
        uptimeSeconds: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
    };
}

export function healthRouter(): Router {
    const router = Router();
    router.get('/healthz', (_req, res) => {
        res.json(getHealthStatus());
    });
    return router;
}
