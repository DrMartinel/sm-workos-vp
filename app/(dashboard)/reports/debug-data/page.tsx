'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Terminal } from 'lucide-react';

interface DebugResults {
    nodeDailystat: any[];
    revenueIap: any[];
    revenueCpc: any[];
    spend: any[];
}

const ResultCard = ({ title, data }: { title: string; data: any[] | undefined }) => {
    const hasData = data && data.length > 0;
    return (
        <Card className={hasData ? 'border-green-300' : 'border-red-300'}>
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    {title}
                    <span className={`px-2 py-1 text-xs rounded-full ${hasData ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {hasData ? `Found: ${data.length}` : 'No Data'}
                    </span>
                </CardTitle>
            </CardHeader>
            {hasData && (
                <CardContent>
                    <pre className="p-4 bg-gray-50 rounded-md overflow-x-auto text-sm">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                </CardContent>
            )}
        </Card>
    );
};

export default function DebugDataPage() {
    const [nodeId, setNodeId] = useState('3671');
    const [date, setDate] = useState('2025-06-29');
    const [results, setResults] = useState<DebugResults | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCheckData = async () => {
        setIsLoading(true);
        setError(null);
        setResults(null);
        try {
            const response = await fetch(`/api/debug-data?nodeId=${nodeId}&date=${date}`);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.details || data.error || 'An unknown error occurred');
            }
            setResults(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Raw Data Debug Tool</h1>
                <p className="text-gray-500">
                    Use this tool to check for the existence of raw data in source tables for a specific node and date.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Input Parameters</CardTitle>
                </CardHeader>
                <CardContent className="flex items-end gap-4">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="nodeId">Node ID</Label>
                        <Input id="nodeId" value={nodeId} onChange={(e) => setNodeId(e.target.value)} />
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="date">Date</Label>
                        <Input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} />
                    </div>
                    <Button onClick={handleCheckData} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Check Data
                    </Button>
                </CardContent>
            </Card>

            {error && (
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>API Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            
            {results && (
                 <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Results for Node <span className="font-mono text-blue-600">{nodeId}</span> on <span className="font-mono text-blue-600">{date}</span></h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <ResultCard title="Downloads (aa_node_dailystat)" data={results.nodeDailystat} />
                        <ResultCard title="Ad Spend (aa_spend)" data={results.spend} />
                        <ResultCard title="IAP Revenue (aa_revenue_iap)" data={results.revenueIap} />
                        <ResultCard title="CPC Revenue (aa_revenue_cpc)" data={results.revenueCpc} />
                    </div>
                 </div>
            )}
        </div>
    );
}
