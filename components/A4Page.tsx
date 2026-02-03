import React, { forwardRef } from 'react';

interface A4PageProps {
    children?: React.ReactNode;
    pageNumber?: number;
    className?: string;
    id?: string;
}

const A4Page = forwardRef<HTMLDivElement, A4PageProps>(({ children, pageNumber, className = "", id }, ref) => {
    return (
        <div
            ref={ref}
            id={id}
            className={`relative bg-white shadow-2xl mx-auto my-8 overflow-hidden print:shadow-none print:my-0 print:mx-auto ${className}`}
            style={{
                width: '210mm',
                minHeight: '297mm', // Relaxed height to allow sensing overflow before cutting
                maxHeight: '297mm', // Strict height visual
                padding: '20mm',
                pageBreakAfter: 'always'
            }}
        >
            <div className="h-full w-full relative">
                {children}
            </div>

            {pageNumber && (
                <div className="absolute bottom-4 right-8 text-gray-400 text-xs print:hidden pointer-events-none">
                    Página {pageNumber}
                </div>
            )}
        </div>
    );
});

A4Page.displayName = 'A4Page';

export default A4Page;
