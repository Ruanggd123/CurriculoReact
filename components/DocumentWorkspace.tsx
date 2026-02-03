import React from 'react';

interface DocumentWorkspaceProps {
    children: React.ReactNode;
}

const DocumentWorkspace: React.FC<DocumentWorkspaceProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-100 flex flex-col items-center py-8 print:bg-white print:py-0 print:block">
            <div className="w-full max-w-screen-xl flex flex-col items-center">
                {children}
            </div>
        </div>
    );
};

export default DocumentWorkspace;
