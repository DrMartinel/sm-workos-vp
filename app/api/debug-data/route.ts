import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Re-use the existing MySQL connection logic
function initializeMySqlConnection() {
    console.log(`[MySQL Debug] Attempting to connect to host: ${process.env.DB_HOST}`);
    return mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
    });
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const nodeId = searchParams.get('nodeId');
    const date = searchParams.get('date');

    if (!nodeId || !date) {
        return NextResponse.json({ error: 'nodeId and date are required' }, { status: 400 });
    }

    const mysqlPool = initializeMySqlConnection();

    try {
        const queries = {
            nodeDailystat: 'SELECT * FROM aa_node_dailystat WHERE node_id = ? AND date = ?',
            revenueIap: 'SELECT * FROM aa_revenue_iap WHERE node_id = ? AND date = ?',
            revenueCpc: 'SELECT * FROM aa_revenue_cpc WHERE node_id = ? AND date = ?',
            spend: 'SELECT * FROM aa_spend WHERE node_id = ? AND date = ?',
        };

        const [nodeDailystat] = await mysqlPool.execute(queries.nodeDailystat, [nodeId, date]);
        const [revenueIap] = await mysqlPool.execute(queries.revenueIap, [nodeId, date]);
        const [revenueCpc] = await mysqlPool.execute(queries.revenueCpc, [nodeId, date]);
        const [spend] = await mysqlPool.execute(queries.spend, [nodeId, date]);

        const results = {
            nodeDailystat,
            revenueIap,
            revenueCpc,
            spend,
        };
        
        return NextResponse.json(results);

    } catch (error) {
        console.error(`[Debug API Error]`, error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ error: `Failed to fetch debug data`, details: errorMessage }, { status: 500 });
    } finally {
        await mysqlPool.end();
    }
}
