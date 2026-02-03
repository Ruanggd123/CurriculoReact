import React, { useState, useRef, useEffect } from 'react';
import A4Page from './A4Page';
import DocumentWorkspace from './DocumentWorkspace';
import { useOverflowDetection } from '../hooks/useOverflowDetection';
import { useToast } from './Toast';
import { generateA4PDF } from '../utils/a4PdfGenerator';

const PageManager: React.FC = () => {
    // Array of page contents (for now, simple strings/ids)
    const [pages, setPages] = useState<number[]>([1]);
    const { addToast } = useToast();
    const [isGenerating, setIsGenerating] = useState(false);

    // We only monitor the last page for overflow to add a new one
    // In a full implementation, we'd need refs for all pages to handle insertions
    const lastPageContentRef = useRef<HTMLDivElement>(null);
    const { isOverflowing } = useOverflowDetection(lastPageContentRef);

    useEffect(() => {
        if (isOverflowing) {
            // Add a new page
            setPages(prev => {
                const newPageNum = prev.length + 1;
                addToast(`Nova página adicionada (Página ${newPageNum}) por excesso de conteúdo`, 'info');
                return [...prev, newPageNum];
            });
            // Ideally, move the overflowing content.
            // For V1, we just add the page and let the user move to it or type there.
        }
    }, [isOverflowing, addToast]);

    const handleDownload = async () => {
        setIsGenerating(true);
        addToast('Gerando PDF...', 'info');

        try {
            // Collect IDs
            const pageIds = pages.map(p => `a4-page-${p}`);
            // Use a slight delay only to allow the toast to render if needed, but 'immediate' request implies minimizing this.
            // However, React state updates are async. A 0ms timeout allows the render cycle to finish showing the spinner/toast.
            await new Promise(resolve => setTimeout(resolve, 10)); // Tiny yield for UI update

            await generateA4PDF(pageIds, 'meu-documento.pdf');
            addToast('PDF baixado com sucesso!', 'success');
        } catch (error) {
            console.error(error);
            addToast('Falha ao gerar PDF', 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <DocumentWorkspace>
            {pages.map((pageNum, index) => {
                const isLast = index === pages.length - 1;
                return (
                    <A4Page
                        key={pageNum}
                        pageNumber={pageNum}
                        id={`a4-page-${pageNum}`}
                    >
                        <div
                            ref={isLast ? lastPageContentRef : null}
                            contentEditable
                            className="outline-none w-full h-full p-4 relative"
                            suppressContentEditableWarning
                            style={{
                                // Visual guide for text area
                                minHeight: '100%',
                            }}
                        >
                            {index === 0 && pages.length === 1 ? (
                                <p className="text-gray-400 pointer-events-none absolute">
                                    Comece a digitar seu documento...
                                </p>
                            ) : null}
                        </div>

                        {/* Overflow Warning/Indicator */}
                        {isLast && isOverflowing && (
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-red-500 animate-pulse" title="Limite excedido" />
                        )}
                    </A4Page>
                );
            })}

            <div className="fixed bottom-8 right-8 flex gap-2 print:hidden z-50">
                <button
                    onClick={handleDownload}
                    disabled={isGenerating}
                    className={`${isGenerating ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} text-white px-4 py-2 rounded-lg shadow-lg transition flex items-center gap-2`}
                >
                    {isGenerating ? (
                        <>
                            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                            Gerando...
                        </>
                    ) : (
                        'Baixar PDF'
                    )}
                </button>
                <button
                    onClick={() => setPages(p => [...p, p.length + 1])}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition"
                >
                    Adicionar Página
                </button>
                <div className="bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200">
                    {pages.length} Páginas
                </div>
            </div>
        </DocumentWorkspace>
    );
};

export default PageManager;
