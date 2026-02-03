import React, { useState, useEffect } from 'react';
import type { ResumeData } from '../types';

interface CodeEditorProps {
    data: ResumeData;
    onChange: (data: ResumeData) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ data, onChange }) => {
    const [jsonString, setJsonString] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Initialize/Sync with external data
    useEffect(() => {
        setJsonString(JSON.stringify(data, null, 2));
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setJsonString(newValue);

        try {
            const parsed = JSON.parse(newValue);
            // Basic validation check (optional, but good to ensure structure)
            if (typeof parsed === 'object' && parsed !== null) {
                setError(null);
                onChange(parsed as ResumeData);
            }
        } catch (err: any) {
            setError(err.message || 'Invalid JSON');
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-[#1e1e1e] text-vl-gray rounded-lg shadow-xl overflow-hidden border border-gray-700">
            <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-gray-700">
                <span className="text-sm font-mono text-gray-400">resume.json</span>
                {error && <span className="text-xs text-red-400 bg-red-900/30 px-2 py-1 rounded">{error}</span>}
                {!error && <span className="text-xs text-green-400">Valid</span>}
            </div>
            <textarea
                value={jsonString}
                onChange={handleChange}
                spellCheck={false}
                className="flex-1 w-full h-full p-4 bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm resize-none focus:outline-none custom-scrollbar leading-relaxed"
                style={{ tabSize: 2 }}
            />
        </div>
    );
};
