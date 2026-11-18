import { google, bigquery_v2 } from 'googleapis';

const MAX_STATUS_POLLS = 10;
const POLL_INTERVAL_MS = 1000;

export interface BigQueryRequest {
    accessToken: string;
    projectId: string;
    location: string;
    query: string;
}

function buildBigQueryClient(accessToken: string): bigquery_v2.Bigquery {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    return google.bigquery({ version: 'v2', auth });
}

async function waitForJobCompletion(
    bigQuery: bigquery_v2.Bigquery,
    projectId: string,
    location: string,
    jobId: string
): Promise<void> {
    for (let poll = 0; poll < MAX_STATUS_POLLS; poll++) {
        const jobStatusResponse = await bigQuery.jobs.get({ location, projectId, jobId });
        const jobStatus = jobStatusResponse.data.status;

        if (jobStatus?.errorResult) {
            throw new Error(`Job failed with error: ${jobStatus.errorResult.message}`);
        }
        if (jobStatus?.state === 'DONE') {
            return;
        }
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }
    throw new Error(`BigQuery job ${jobId} did not finish after ${MAX_STATUS_POLLS} polls`);
}

export async function runBigQuery(request: BigQueryRequest): Promise<bigquery_v2.Schema$TableRow[]> {
    const { accessToken, projectId, location, query } = request;
    const bigQuery = buildBigQueryClient(accessToken);

    try {
        const res = await bigQuery.jobs.insert({
            projectId,
            requestBody: {
                configuration: {
                    query: {
                        query,
                        useLegacySql: false,
                    },
                },
            },
        });

        const jobId = res.data.jobReference?.jobId;
        if (!jobId) {
            throw new Error('BigQuery did not return a job id');
        }

        await waitForJobCompletion(bigQuery, projectId, location, jobId);

        const result = await bigQuery.jobs.getQueryResults({ projectId, jobId, location });
        return result.data.rows ?? [];
    } catch (error) {
        console.error('BigQuery API error:', error);
        throw error;
    }
}
