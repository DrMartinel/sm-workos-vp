import { NextRequest, NextResponse } from 'next/server';
import { BigQuery, BigQueryOptions } from '@google-cloud/bigquery';
import mysql from 'mysql2/promise';
import * as path from 'path';
import * as fs from 'fs/promises';

// In-memory cache
const cache = new Map<string, { data: any[], timestamp: number }>();
const CACHE_DURATION_MS = 500 * 60 * 1000; // 500 minutes

interface DataSourceDefinition {
    source: 'bigquery' | 'mysql' | 'google_sheet';
    queryFile: string;
    // other potential properties...
    metrics?: string[];
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

function initializeMySqlConnection() {
    console.log(`[MySQL] Attempting to connect to host: ${process.env.DB_HOST}`);
    const connection = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        // namedPlaceholders: true, // Not needed for positional '?' placeholders
    });
    return connection;
}

async function runQueryBySource(sourceType: string, query: string, params: any, uniqueRequestId: string): Promise<any[]> {
    switch (sourceType) {
        case 'bigquery':
            console.time(`[API /${uniqueRequestId}]   L-2: BQ Client Init`);
            const bigquery = initializeBigQuery();
            console.timeEnd(`[API /${uniqueRequestId}]   L-2: BQ Client Init`);
            const options = {
                query: query,
                location: 'US', // This could be part of the definition
                params: params,
            };
            console.log(`[API /${uniqueRequestId}]   L-2: Executing BigQuery query (includes data download)...`);
            console.time(`[API /${uniqueRequestId}]   L-2: BQ Query Execution & Download`);
            const [rows] = await bigquery.query(options);
            console.timeEnd(`[API /${uniqueRequestId}]   L-2: BQ Query Execution & Download`);
            return rows;
        case 'mysql':
            const mysqlPool = initializeMySqlConnection();
            try {
                // MySQL's driver uses '?' for positional placeholders.
                // We convert our @-placeholders to '?'
                const mysqlQuery = query.replace(/@startDate|@endDate/g, '?');

                // Count how many pairs of placeholders we have to build the params array dynamically.
                const placeholderCount = (query.match(/@startDate/g) || []).length;
                const queryParams: string[] = [];
                for (let i = 0; i < placeholderCount; i++) {
                    queryParams.push(params.startDate, params.endDate);
                }
                
                console.log(`[MySQL Debug] Executing Query: ${mysqlQuery}`);
                console.log(`[MySQL Debug] With Params: ${JSON.stringify(queryParams)}`);

                const [mysqlRows] = await mysqlPool.execute(mysqlQuery, queryParams);
                return mysqlRows as any[];
            } catch (err: any) {
                if (err.code === 'ECONNREFUSED') {
                    const host = process.env.DB_HOST || 'not set';
                    throw new Error(
                        `MySQL connection refused at host: ${host}. ` +
                        `Please ensure the MySQL server is running and DB_HOST in .env.local is correct.`
                    );
                }
                throw err; // Re-throw other errors
            } finally {
                await mysqlPool.end();
            }
        // Future cases for 'google_sheet', etc.
        default:
            throw new Error(`Unsupported data source type: ${sourceType}`);
    }
}

export async function GET(request: NextRequest, { params }: { params: { name:string } }) {
    const handlerStart = Date.now();
    // Use `await` as required by Next.js App Router for dynamic routes.
    const { name: dataSourceName } = await params;
    const uniqueRequestId = `${dataSourceName}-${handlerStart}`;

    console.log(`[API /${dataSourceName}] Request received. Unique ID: ${uniqueRequestId}`);

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
        console.log(`[Cache] HIT for ${cacheKey}. Returning ${cached.data.length} cached rows.`);
        return NextResponse.json(cached.data);
    }
     console.log(`[Cache] MISS for ${cacheKey}`);

    try {
        console.time(`[API /${uniqueRequestId}] L-1: Total Handler Time`);

        console.time(`[API /${uniqueRequestId}]   Step 1: Load Definition`);
        const definitionModule = await import(`../../../../data-sources/${dataSourceName}/definition.ts`);
        const definition: DataSourceDefinition = definitionModule.default;
        console.timeEnd(`[API /${uniqueRequestId}]   Step 1: Load Definition`);

        console.time(`[API /${uniqueRequestId}]   Step 2: Read Query File`);
        const queryPath = path.join(process.cwd(), 'data-sources', dataSourceName, definition.queryFile);
        let query = await fs.readFile(queryPath, 'utf-8');
        console.timeEnd(`[API /${uniqueRequestId}]   Step 2: Read Query File`);
        
        query = query.replace(/@DS_START_DATE/g, '@startDate').replace(/@DS_END_DATE/g, '@endDate');

        console.log(`[API /${uniqueRequestId}] --- Starting Step 3: Execute Query ---`);
        console.time(`[API /${uniqueRequestId}]   Step 3: Run Query By Source`);
        const rows = await runQueryBySource(definition.source, query, { startDate, endDate }, uniqueRequestId);
        console.timeEnd(`[API /${uniqueRequestId}]   Step 3: Run Query By Source`);
        console.log(`[API /${uniqueRequestId}] --- Finished Step 3: Execute Query ---`);


        console.log(`[${dataSourceName} Query] Fetched ${rows.length} rows from the database.`);
        const metrics = definition.metrics || [];

        console.time(`[API /${uniqueRequestId}]   Step 4: Clean Data`);
        const cleanRows = rows.map(row => {
            const newRow = {...row};
            if (newRow.date && newRow.date.value) {
                newRow.date = newRow.date.value;
            }

            // Convert metric values from string (from DB driver) to number
            metrics.forEach(metric => {
                if (newRow[metric] !== null && newRow[metric] !== undefined) {
                    newRow[metric] = parseFloat(newRow[metric]);
                }
            });

            return newRow;
        });
        console.timeEnd(`[API /${uniqueRequestId}]   Step 4: Clean Data`);
        
        console.time(`[API /${uniqueRequestId}]   Step 5: Store in Cache`);
        console.log(`[Cache] Storing ${cleanRows.length} rows for key: ${cacheKey}`);
        cache.set(cacheKey, { data: cleanRows, timestamp: Date.now() });
        console.timeEnd(`[API /${uniqueRequestId}]   Step 5: Store in Cache`);


        const rowCount = cleanRows.length;
        console.time(`[API /${uniqueRequestId}]   Step 6: JSON Stringify`);
        const responseJsonString = JSON.stringify(cleanRows);
        console.timeEnd(`[API /${uniqueRequestId}]   Step 6: JSON Stringify`);
        const responseSize = responseJsonString.length;
        
        console.log(`[API /${dataSourceName}] Query returned ${rowCount} rows.`);
        console.log(`[API /${dataSourceName}] JSON response size: ${(responseSize / 1024 / 1024).toFixed(2)} MB`);
        
        console.log(`[API /${uniqueRequestId}] --- Preparing to send response ---`);
        console.timeEnd(`[API /${uniqueRequestId}] L-1: Total Handler Time`);
        return NextResponse.json(cleanRows);
    } catch (error) {
        // We need to end the timer here in case of an error to avoid warnings.
        console.timeEnd(`[API /${uniqueRequestId}] L-1: Total Handler Time`);
        console.error(`[${dataSourceName} API Error]`, error);
        // Distinguish between file not found and other errors
        if (error && (error as NodeJS.ErrnoException).code === 'ERR_MODULE_NOT_FOUND') {
            return NextResponse.json({ error: `Data source '${dataSourceName}' not found.` }, { status: 404 });
        }
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ error: `Failed to fetch data for '${dataSourceName}'`, details: errorMessage }, { status: 500 });
    }
} 