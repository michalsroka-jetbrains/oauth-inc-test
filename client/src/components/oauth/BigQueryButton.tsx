import React, { useState } from 'react';
import { BigQueryRow, fetchBigQueryData } from '../../api/apiClient';

const BigQueryButton: React.FC = () => {
    const [rows, setRows] = useState<BigQueryRow[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleBigQueryRequest = async () => {
        setLoading(true);
        setError(null);
        try {
            setRows(await fetchBigQueryData());
        } catch (e) {
            console.error('Error fetching BigQuery data:', e);
            setError('Could not fetch BigQuery data.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button onClick={handleBigQueryRequest} disabled={loading}>
                {loading ? 'Fetching…' : 'Fetch BigQuery Data'}
            </button>
            {error && <p className="error">{error}</p>}
            {rows.length > 0 && (
                <ul>
                    {rows.map((row, index) => (
                        <li key={index}>{(row.f ?? []).map((cell) => String(cell.v)).join(' · ')}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default BigQueryButton;
