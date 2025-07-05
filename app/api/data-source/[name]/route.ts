import { NextRequest, NextResponse } from 'next/server';
import { BigQuery, BigQueryOptions } from '@google-cloud/bigquery';
import * as path from 'path';
import * as fs from 'fs/promises';

// In-memory cache
const cache = new Map<string, { data: any[], timestamp: number }>();
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

interface DataSourceDefinition {
    source: 'bigquery' | 'mysql' | 'google_sheet';
    queryFile: string;
    // other potential properties...
}

function initializeBigQuery(): BigQuery {
    const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    const projectId = process.env.GCLOUD_PROJECT;

    if (!credentialsJson || !projectId) {
        throw new Error('Google Cloud environment variables are not set.');
    }

    const credentials = JSON.parse(credentialsJson);
    const config: BigQueryOptions = {
        projectId,
        credentials: {
            client_email: credentials.client_email,
            private_key: credentials.private_key.replace(/\\n/g, '\n'),
        }
    };
    return new BigQuery(config);
}

async function runQueryBySource(sourceType: string, query: string, params: any): Promise<any[]> {
    switch (sourceType) {
        case 'bigquery':
            const bigquery = initializeBigQuery();
            const options = {
                query: query,
                location: 'US', // This could be part of the definition
                params: params,
            };
            const [rows] = await bigquery.query(options);
            return rows;
        // Future cases for 'mysql', 'google_sheet', etc.
        default:
            throw new Error(`Unsupported data source type: ${sourceType}`);
    }
}

export async function GET(request: NextRequest, { params }: { params: { name: string } }) {
    const dataSourceName = params.name;
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // --- 1. Validate input
    if (!startDate || !endDate) {
        return NextResponse.json({ error: 'startDate and endDate are required' }, { status: 400 });
    }

    // --- 2. Check Cache
    const cacheKey = `${dataSourceName}-${startDate}-${endDate}`;
    const cached = cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION_MS)) {
        console.log(`[Cache] HIT for ${cacheKey}`);
        return NextResponse.json(cached.data);
    }
     console.log(`[Cache] MISS for ${cacheKey}`);

    try {
        // --- 3. Load data source definition and query
        // Using a template literal with a static path helps Next.js/Webpack discover the module at build time.
        const definitionModule = await import(`../../../../data-sources/${dataSourceName}/definition.ts`);
        const definition: DataSourceDefinition = definitionModule.default;

        const queryPath = path.join(process.cwd(), 'data-sources', dataSourceName, definition.queryFile);
        let query = await fs.readFile(queryPath, 'utf-8');

        // --- 4. Replace placeholders safely
        // We go back to parameterized queries to avoid SQLi and type errors
        query = query.replace(/@DS_START_DATE/g, '@startDate').replace(/@DS_END_DATE/g, '@endDate');

        // --- 5. Execute query
        const rows = await runQueryBySource(definition.source, query, { startDate, endDate });

        // --- 6. Clean and Cache Result
        const cleanRows = rows.map(row => {
            const newRow = {...row};
            if (newRow.date && newRow.date.value) {
                newRow.date = newRow.date.value;
            }
            return newRow;
        });

        cache.set(cacheKey, { data: cleanRows, timestamp: Date.now() });

        return NextResponse.json(cleanRows);
    } catch (error) {
        console.error(`[${dataSourceName} API Error]`, error);
        // Distinguish between file not found and other errors
        if (error && (error as NodeJS.ErrnoException).code === 'ERR_MODULE_NOT_FOUND') {
            return NextResponse.json({ error: `Data source '${dataSourceName}' not found.` }, { status: 404 });
        }
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ error: `Failed to fetch data for '${dataSourceName}'`, details: errorMessage }, { status: 500 });
    }
} 