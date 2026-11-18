import express, { Express } from "express";
import cors from "cors";
import session from 'express-session';
import { loadConfig } from "./config";
import { healthRouter } from "./health";
import { authRouter, requireFreshSessionToken } from "./authRoutes";
import { runBigQuery } from "./bigqueryService";
import { getPrincipalFromAccessToken } from "./tokenService";

const SAMPLE_QUERY = 'SELECT text_col, num_col FROM `test_id.test_table_a` LIMIT 10;';

const config = loadConfig();
const app: Express = express();

app.use(express.json());
app.use(
    cors({
        origin: config.allowedOrigin,
        credentials: true,
    })
);
app.use(
    session({
        secret: config.sessionSecret,
        resave: false,
        saveUninitialized: false,
    })
);

app.use(healthRouter());
app.use(authRouter(config));

app.get('/api/bigquery/data', requireFreshSessionToken(config), async (req, res) => {
    try {
        const data = await runBigQuery({
            accessToken: req.session.accessToken!,
            projectId: config.gcpProjectId,
            location: config.bigQueryLocation,
            query: SAMPLE_QUERY,
        });
        res.json(data);
    } catch (error) {
        console.error('Error fetching BigQuery data:', error);
        res.status(500).send('Failed to fetch BigQuery data.');
    }
});

app.get('/api/sa/bigquery/data', async (req, res) => {
    const accessToken = req.headers['x-oauth-token'];
    if (!accessToken || typeof accessToken !== 'string') {
        res.status(401).send('Unauthorized');
        return;
    }

    try {
        const principal = await getPrincipalFromAccessToken(accessToken);
        if (principal.kind !== 'service-account') {
            res.status(403).send('Only service accounts may call this endpoint.');
            return;
        }

        const data = await runBigQuery({
            accessToken,
            projectId: config.gcpProjectId,
            location: config.bigQueryLocation,
            query: SAMPLE_QUERY,
        });
        res.json(data);
    } catch (error) {
        console.error('Error fetching BigQuery data:', error);
        res.status(500).send('Failed to fetch BigQuery data.');
    }
});

app.listen(config.port, () => {
    console.log(`API listening on port ${config.port}`);
});
