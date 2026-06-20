import React, { useState, useEffect } from 'react';
import { useToast } from './Toast';
import { ResumePreview } from './ResumePreview';
import { LeftSidebar } from './LeftSidebar';
import { FormPanel } from './FormPanel';
import { OnboardingTour } from './OnboardingTour';
import { useHistoryState } from '../hooks/useHistoryState';
import { DownloadIcon, UndoIcon, RedoIcon, CheckIcon, CreditCardIcon, PixIcon, PencilIcon, SwatchIcon, DocumentTextIcon } from './icons';
import type { Resume, ResumeData, UiConfig, View } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { createPayment, getConfig, consumeUsage, checkPremiumStatus } from '../services/api';
import { gerarPDFDemo, gerarPDFPremium } from '../utils/pdfGenerator';
import { generateA4PDF, generateResumePDF } from '../utils/a4PdfGenerator';
import { CodeEditor } from './CodeEditor';
import { keysService, MASTER_KEY, KeyData } from '../services/keysService';

const PREVIEW_SCALE = 0.72;

/**
 * Componente que escala o preview de currículo corretamente.
 * Usa ResizeObserver para medir a altura real do conteúdo A4
 * e ajusta o wrapper para ter as dimensões visuais corretas.
 * Isso evita o colapso de layout que `scale` CSS causava.
 */
const ScaledPreview: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const innerRef = React.useRef<HTMLDivElement>(null);
    const [innerHeight, setInnerHeight] = React.useState(1123); // altura default de 1 página A4

    React.useEffect(() => {
        const el = innerRef.current;
        if (!el) return;
        const observer = new ResizeObserver(() => {
            setInnerHeight(el.scrollHeight);
        });
        observer.observe(el);
        setInnerHeight(el.scrollHeight);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            id="preview-wrapper"
            style={{
                // Largura visual = largura A4 real * escala
                // A4 em pixels (96dpi) ≈ 794px; 794 * 0.72 ≈ 572px
                width: `${794 * PREVIEW_SCALE}px`,
                // Altura visual = altura real * escala
                height: `${innerHeight * PREVIEW_SCALE}px`,
                flexShrink: 0,
                position: 'relative',
            }}
        >
            <div
                ref={innerRef}
                style={{
                    transform: `scale(${PREVIEW_SCALE})`,
                    transformOrigin: 'top left',
                    width: `${100 / PREVIEW_SCALE}%`, // Compensa a escala para manter a largura real
                }}
            >
                {children}
            </div>
        </div>
    );
};

interface ResumeBuilderProps {
    initialResume: Resume;
    saveResume: (id: string, data: ResumeData, ui: UiConfig) => void;
    setCurrentView: (view: View) => void;
}

export const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ initialResume, saveResume, setCurrentView }) => {
    const { addToast } = useToast();
    const { user } = useAuth();
    const [resumeData, setResumeData, undo, redo, canUndo, canRedo] = useHistoryState<ResumeData>(initialResume.data);
    const [uiConfig, setUiConfig] = useHistoryState<UiConfig>(initialResume.ui);

    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'visual' | 'code'>('visual');
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [isNativePrinting, setIsNativePrinting] = useState(false);
    const [forceWatermark, setForceWatermark] = useState<boolean | null>(null);

    // PDF Preview Modal
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
    const [pdfFilename, setPdfFilename] = useState<string>('curriculo.pdf');

    // Key System States
    const [showKeyModal, setShowKeyModal] = useState(false);
    const [keyInput, setKeyInput] = useState('');
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [isKeyProcessing, setIsKeyProcessing] = useState(false);
    const [adminKeys, setAdminKeys] = useState<KeyData[]>([]);

    // Mobile specific state
    const [isMobile, setIsMobile] = useState(false);
    const [mobileView, setMobileView] = useState<'edit' | 'design' | 'preview'>('edit');
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

    // Payment States
    const [hasPaidSession, setHasPaidSession] = useState(() => {
        try {
            // Initialize state from session storage to persist across reloads
            return sessionStorage.getItem(`hasPaidSession_${initialResume.id}`) === 'true';
        } catch (e) {
            console.warn('Session storage is not available.');
            return false;
        }
    });
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [payerEmail, setPayerEmail] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');
    const [isProcessing, setIsProcessing] = useState(false);

    // Dynamic Config from Backend
    const [paymentConfig, setPaymentConfig] = useState({
        preco: 9.90,
        titulo: "Download Premium",
        descricao: "Sem marca d'água"
    });

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (!isMobile) return;

        const handleFocusIn = (event: FocusEvent) => {
            if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
                setIsKeyboardVisible(true);
            }
        };
        const handleFocusOut = (event: FocusEvent) => {
            if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
                setIsKeyboardVisible(false);
            }
        };

        document.addEventListener('focusin', handleFocusIn);
        document.addEventListener('focusout', handleFocusOut);

        return () => {
            document.removeEventListener('focusin', handleFocusIn);
            document.removeEventListener('focusout', handleFocusOut);
        };
    }, [isMobile]);

    // Persist paid session status to sessionStorage
    useEffect(() => {
        try {
            if (hasPaidSession) {
                sessionStorage.setItem(`hasPaidSession_${initialResume.id}`, 'true');
            } else {
                sessionStorage.removeItem(`hasPaidSession_${initialResume.id}`);
            }
        } catch (e) {
            console.warn('Session storage is not available.');
        }
    }, [hasPaidSession, initialResume.id]);

    // Save effect
    useEffect(() => {
        saveResume(initialResume.id, resumeData, uiConfig);
    }, [resumeData, uiConfig, initialResume.id, saveResume]);

    // Load Payment Config
    useEffect(() => {
        getConfig().then(config => setPaymentConfig(prev => ({ ...prev, ...config })));
    }, []);

    // Capturar Retorno do Pagamento (Status na URL)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const status = params.get('status');
        const emailParam = params.get('email');

        if (status) {
            window.history.replaceState({}, document.title, window.location.pathname);
            if (status === 'success' && emailParam) {
                setHasPaidSession(true);
                setPayerEmail(emailParam);
                setForceWatermark(false);
                addToast('Pagamento confirmado! Acesso liberado.', 'success');
                checkPremiumStatus(emailParam).catch(() => console.warn('Verificação de status em segundo plano.'));
            } else if (status === 'failure') {
                addToast('O pagamento não foi aprovado. Tente novamente.', 'error');
            } else if (status === 'pending') {
                addToast('Pagamento em processamento. Aguarde a confirmação.', 'info');
            }
        }
    }, [addToast]);

    const scrollToSection = (sectionId: string) => {
        if (window.innerWidth < 768) return;
        const element = document.getElementById(sectionId);
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const handleDownloadClick = async () => {
        setIsGeneratingPdf(true);
        addToast("Capturando layout em alta resolução...", "info");

        try {
            const cleanName = resumeData.personal.name.replace(/[^a-zA-Z0-9]/g, '_') || 'curriculo';
            const filename = `curriculo_${cleanName}.pdf`;
            
            // Chama o novo gerador nativo (que agora retorna o Blob)
            const blob = await generateResumePDF('resume-preview-container');
            const url = URL.createObjectURL(blob);
            
            setPdfPreviewUrl(url);
            setPdfFilename(filename);
            
            addToast("Pré-visualização gerada com sucesso!", "success");
        } catch (error) {
            console.error("Erro ao capturar PDF:", error);
            addToast("Erro ao gerar a visualização. Tente novamente.", "error");
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const executeDownload = () => {
        if (!pdfPreviewUrl) return;
        const link = document.createElement('a');
        link.href = pdfPreviewUrl;
        link.download = pdfFilename;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => { document.body.removeChild(link); }, 200);
        addToast("Download iniciado!", "success");
        setShowKeyModal(false);
        setKeyInput('');
        setIsAdminMode(false);
    };

    const handleKeySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!keyInput.trim()) return;

        setIsKeyProcessing(true);
        try {
            if (keyInput.trim() === MASTER_KEY) {
                // Admin Mode
                setIsAdminMode(true);
                const keys = await keysService.listKeys();
                setAdminKeys(keys);
                addToast("Modo Admin ativado!", "success");
            } else {
                // Validate Normal Key
                const isValid = await keysService.validateAndUseKey(keyInput.trim());
                if (isValid) {
                    addToast("Key validada com sucesso!", "success");
                    executeDownload();
                } else {
                    addToast("Key inválida ou já utilizada.", "error");
                }
            }
        } catch (error) {
            addToast("Erro ao validar Key.", "error");
        } finally {
            setIsKeyProcessing(false);
        }
    };

    const handleGenerateKey = async () => {
        setIsKeyProcessing(true);
        try {
            await keysService.generateNewKey();
            const keys = await keysService.listKeys();
            setAdminKeys(keys);
            addToast(`Nova Key gerada!`, "success");
        } catch (error) {
            addToast("Erro ao gerar nova Key.", "error");
        } finally {
            setIsKeyProcessing(false);
        }
    };

    const handleFreeDownload = () => {
        setShowPaymentModal(false);
        setForceWatermark(true);
        addToast("Preparando layout...", "info");
        setIsGeneratingPdf(true);
        setTimeout(() => handleDownloadPdf(false), 1500);
    }

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!payerEmail) {
            addToast("Por favor, informe seu e-mail.", "error");
            return;
        }
        setIsProcessing(true);
        try {
            const response = await createPayment(payerEmail, paymentMethod);
            if (response && response.checkoutUrl) {
                addToast(`Redirecionando para pagamento via ${paymentMethod === 'pix' ? 'Pix' : 'Cartão'}...`, "success");
                window.location.href = response.checkoutUrl;
            } else {
                addToast("Erro ao obter link de pagamento.", "error");
                setIsProcessing(false);
            }
        } catch (error: any) {
            let msg = error.message || "Erro de conexão.";
            if (msg.includes('Failed to fetch')) {
                msg = "Erro de conexão. Verifique sua internet ou bloqueadores de anúncio.";
            }
            addToast(msg, "error");
            setIsProcessing(false);
        }
    }

    const handleDownloadPdf = async (isPremium: boolean) => {
        setIsGeneratingPdf(true);
        try {
            addToast("Enviando para o servidor de PDF...", "info");
            const previewElement = document.getElementById('resume-preview-container');
            if (!previewElement) throw new Error("Erro interno: Preview não encontrado.");

            const clone = previewElement.cloneNode(true) as HTMLElement;
            const nonPrintables = clone.querySelectorAll('.no-print-export');
            nonPrintables.forEach(el => el.remove());
            const pageIndicators = clone.querySelectorAll('div[style*="top:"][style*="297mm"]');
            pageIndicators.forEach(el => el.remove());

            const capturedHtml = clone.outerHTML;
            const emailToVerify = user?.email || payerEmail || resumeData.personal.email;
            const dataForPdf: ResumeData = { ...resumeData, personal: { ...resumeData.personal, email: emailToVerify } };

            const result = isPremium ? await gerarPDFPremium(dataForPdf, uiConfig, capturedHtml) : await gerarPDFDemo(dataForPdf, uiConfig, capturedHtml);

            if (isPremium && result.premium === false) {
                addToast(result.erro || "Acesso Premium necessário.", "error");
                setShowPaymentModal(true);
                setIsGeneratingPdf(false);
                return;
            }

            if (result.sucesso) {
                const cleanName = resumeData.personal.name.replace(/[^a-zA-Z0-9]/g, '_') || 'curriculo';
                const filename = `curriculo_${cleanName}.pdf`;

                if (result.pdfBase64) {
                    const binStr = atob(result.pdfBase64);
                    const len = binStr.length;
                    const arr = new Uint8Array(len);
                    for (let i = 0; i < len; i++) arr[i] = binStr.charCodeAt(i);
                    const blob = new Blob([arr], { type: 'application/pdf' });
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = filename;
                    document.body.appendChild(link);
                    link.click();
                    setTimeout(() => { document.body.removeChild(link); window.URL.revokeObjectURL(url); }, 200);
                } else if (result.pdfUrl) {
                    const link = document.createElement('a');
                    link.href = result.pdfUrl;
                    link.download = filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
                addToast("Download iniciado!", "success");

                if (isPremium) {
                    await consumeUsage(emailToVerify);
                    if (user?.subscriptionStatus !== 'pro') {
                        setHasPaidSession(false);
                        setForceWatermark(null);
                        addToast("Sessão de download único finalizada.", "info");
                    }
                }
            } else {
                const msg = result.erro || "Falha ao gerar PDF.";
                addToast(msg.includes('acordando') ? "Servidor iniciando... Tente novamente em 10s." : msg, "error");
            }
        } catch (error: any) {
            console.error("Erro UI:", error);
            addToast("Erro de conexão. Tente novamente.", "error");
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const shouldShowWatermark = forceWatermark !== null
        ? forceWatermark
        : (user?.subscriptionStatus !== 'pro' && !hasPaidSession);

    const handleMobileNav = (view: 'edit' | 'design' | 'preview') => {
        if (view === 'edit') {
            setActiveSection(null);
        } else if (view === 'design') {
            setActiveSection('appearance');
        }
        setMobileView(view);
    };

    const MobileBottomNav = () => (
        <div className={`md:hidden fixed bottom-0 left-0 right-0 h-20 bg-gray-900 border-t border-gray-700/50 flex justify-around items-center z-30 shadow-[0_-5px_20px_rgba(0,0,0,0.3)] transition-transform duration-300 ${isKeyboardVisible ? 'translate-y-full' : 'translate-y-0'}`} data-tour="mobile-bottom-nav">
            {[
                { view: 'edit', label: 'Editar', icon: <PencilIcon className="w-6 h-6 mb-1" /> },
                { view: 'design', label: 'Design', icon: <SwatchIcon className="w-6 h-6 mb-1" /> },
                { view: 'preview', label: 'Visualizar', icon: <DocumentTextIcon className="w-6 h-6 mb-1" /> }
            ].map(item => {
                const isActive = mobileView === item.view;
                return (
                    <button key={item.view} onClick={() => handleMobileNav(item.view as any)} className={`flex flex-col items-center justify-center transition-colors duration-200 p-2 rounded-lg ${isActive ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}>
                        {item.icon}
                        <span className="text-xs font-bold tracking-wide">{item.label}</span>
                    </button>
                )
            })}
        </div>
    );

    if (isMobile) {
        const isEditingSection = mobileView === 'edit' && activeSection;
        const isEditingAppearance = mobileView === 'design';

        return (
            <div className="flex flex-col h-full bg-transparent text-white overflow-hidden">
                <div className="h-16 border-b border-gray-700 flex items-center justify-between px-4 bg-gray-900/80 backdrop-blur-sm z-10 flex-shrink-0">
                    <button onClick={() => setCurrentView('meus-curriculos')} className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                        <span>Voltar</span>
                    </button>
                    <button onClick={handleDownloadClick} disabled={isGeneratingPdf} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm disabled:opacity-70">
                        {isGeneratingPdf ? 'Gerando...' : 'Baixar PDF'}
                    </button>
                </div>
                <main className="flex-1 overflow-y-auto pb-24 bg-[#0f172a]">
                    {(isEditingSection || isEditingAppearance) ? (
                        <FormPanel
                            activeSection={activeSection || 'appearance'}
                            resumeData={resumeData} setResumeData={setResumeData}
                            uiConfig={uiConfig} setUiConfig={setUiConfig}
                            onClose={() => handleMobileNav('edit')}
                            isMobile={true}
                        />
                    ) : mobileView === 'edit' ? (
                        <LeftSidebar
                            activeSection={activeSection}
                            setActiveSection={setActiveSection}
                            resumeData={resumeData}
                            setResumeData={setResumeData}
                            scrollToSection={() => { }}
                            isMobile={true}
                        />
                    ) : (
                        <div className="p-4 flex justify-center items-start bg-gray-900/50 min-h-full overflow-auto">
                            <div style={{
                                transform: 'scale(0.43)',
                                transformOrigin: 'top center',
                                /* Margem negativa para compensar o espaço que o scale deixa */
                                marginBottom: 'calc(-57% * var(--pages, 1))',
                            }}>
                                <ResumePreview resumeData={resumeData} uiConfig={uiConfig} showWatermark={shouldShowWatermark} isPrinting={isNativePrinting} />
                            </div>
                        </div>
                    )}
                </main>
                <MobileBottomNav />
                <OnboardingTour />
                {showPaymentModal && (

                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="bg-[#1e293b] rounded-2xl shadow-2xl max-w-md w-full p-8 border border-gray-700 relative">
                            <button onClick={() => setShowPaymentModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>

                            <div className="text-center space-y-6">
                                <div className="mx-auto w-24 h-24 bg-blue-900/30 rounded-full flex items-center justify-center mb-2"><DownloadIcon className="w-12 h-12 text-blue-400" /></div>
                                <div><h3 className="text-3xl font-bold text-white">{paymentConfig.titulo}</h3><p className="text-gray-400 mt-2 text-base">Geração via Nuvem com formatação perfeita.</p></div>

                                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 shadow-xl border border-blue-400/30">
                                    <div className="text-3xl font-black text-white">R$ {paymentConfig.preco.toFixed(2).replace('.', ',')}</div>
                                    <div className="text-blue-100 text-sm mb-4">Pagamento único</div>
                                    <ul className="text-left text-sm text-white space-y-2 mb-6 bg-white/10 p-4 rounded-lg">
                                        <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4 text-green-300" /> <span>{paymentConfig.descricao}</span></li>
                                        <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4 text-green-300" /> <span>Layout 100% Otimizado</span></li>
                                    </ul>

                                    <form onSubmit={handlePaymentSubmit} className="space-y-3">
                                        <div className="space-y-2 mb-4">
                                            <p className="text-sm text-white font-medium text-left">Escolha a forma de pagamento:</p>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button type="button" onClick={() => setPaymentMethod('pix')} className={`flex items-center justify-center gap-3 p-5 rounded-xl border-2 transition-all duration-200 text-lg ${paymentMethod === 'pix' ? 'bg-white text-blue-900 border-white font-bold shadow-lg scale-105' : 'bg-white/10 text-gray-300 border-white/10 hover:bg-white/20 hover:border-white/30'}`}>
                                                    <PixIcon className={`w-7 h-7 ${paymentMethod === 'pix' ? 'text-blue-600' : 'text-gray-400'}`} /> Pix
                                                </button>
                                                <button type="button" onClick={() => setPaymentMethod('card')} className={`flex items-center justify-center gap-3 p-5 rounded-xl border-2 transition-all duration-200 text-lg ${paymentMethod === 'card' ? 'bg-white text-blue-900 border-white font-bold shadow-lg scale-105' : 'bg-white/10 text-gray-300 border-white/10 hover:bg-white/20 hover:border-white/30'}`}>
                                                    <CreditCardIcon className={`w-7 h-7 ${paymentMethod === 'card' ? 'text-blue-600' : 'text-gray-400'}`} /> Cartão
                                                </button>
                                            </div>
                                        </div>
                                        <input type="email" required value={payerEmail} onChange={e => setPayerEmail(e.target.value)} className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:ring-2 focus:ring-white focus:outline-none" placeholder="Seu melhor e-mail" />
                                        <button type="submit" disabled={isProcessing} className="w-full py-3 bg-white text-blue-900 font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-lg disabled:opacity-70 disabled:cursor-wait mt-2">
                                            {isProcessing ? 'Gerando Link...' : (paymentMethod === 'pix' ? 'Gerar Pix' : 'Pagar com Cartão')}
                                        </button>
                                    </form>
                                </div>
                                <button onClick={handleFreeDownload} className="text-gray-400 hover:text-white text-sm underline mt-4 decoration-gray-600 hover:decoration-white">
                                    📥 Baixar PDF Gratuito (com marca d'água)
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="hidden md:flex h-full bg-transparent text-white overflow-hidden relative">
            <LeftSidebar activeSection={activeSection} setActiveSection={setActiveSection} resumeData={resumeData} setResumeData={setResumeData} scrollToSection={scrollToSection} />
            {activeSection && (
                <div className="w-[450px] z-20 shadow-2xl">
                    <FormPanel activeSection={activeSection} resumeData={resumeData} setResumeData={setResumeData} uiConfig={uiConfig} setUiConfig={setUiConfig} onClose={() => setActiveSection(null)} />
                </div>
            )}
            <div className="flex-1 flex flex-col relative bg-transparent overflow-hidden">
                <div className="h-16 border-b border-gray-700 flex items-center justify-between px-6 bg-gray-900/80 backdrop-blur-sm z-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setCurrentView('meus-curriculos')} className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                            <span className="hidden sm:inline">Voltar</span>
                        </button>
                        <div className="h-6 w-px bg-gray-700"></div>
                        <span className="font-medium truncate max-w-[300px]">{resumeData.personal.name || 'Meu Currículo'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* View Toggle */}
                        <div className="flex bg-gray-800 rounded-lg p-1 mr-2 border border-gray-700">
                            <button
                                onClick={() => setViewMode('visual')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'visual' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                            >
                                Visual
                            </button>
                            <button
                                onClick={() => setViewMode('code')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'code' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                            >
                                Código (JSON)
                            </button>
                        </div>

                        <button onClick={() => undo()} disabled={!canUndo} className="p-2 text-gray-400 hover:text-white disabled:opacity-30 transition-colors rounded-lg hover:bg-gray-800"><UndoIcon className="w-5 h-5" /></button>
                        <button onClick={() => redo()} disabled={!canRedo} className="p-2 text-gray-400 hover:text-white disabled:opacity-30 transition-colors rounded-lg hover:bg-gray-800"><RedoIcon className="w-5 h-5" /></button>
                        <button onClick={handleDownloadClick} disabled={isGeneratingPdf} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-900/20 font-bold disabled:opacity-70 transform hover:-translate-y-px">
                            {isGeneratingPdf ? <span className="animate-pulse">Processando...</span> : <> <DownloadIcon className="w-5 h-5" /> <span>Baixar PDF</span> </>}
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-auto flex justify-center items-start bg-[#0f172a] relative custom-scrollbar py-8">
                    {viewMode === 'visual' ? (
                        /*
                         * ESTRATÉGIA DE ESCALA:
                         * - O wrapper externo tem a largura/altura VISUAL (após escala)
                         * - O div interno tem o tamanho real do A4 e recebe transform: scale()
                         * - Isso evita o colapso de layout que a prop CSS "scale" causava
                         *
                         * Folha A4 = ~794px de largura
                         * Escala 0.72 → 794 * 0.72 ≈ 572px de largura visual
                         */
                        <ScaledPreview>
                            <ResumePreview resumeData={resumeData} uiConfig={uiConfig} showWatermark={shouldShowWatermark} isPrinting={isNativePrinting} />
                        </ScaledPreview>
                    ) : (
                        <div className="w-full h-full max-w-4xl mx-auto">
                            <CodeEditor data={resumeData} onChange={setResumeData} />
                        </div>
                    )}
                </div>
            </div>
            <OnboardingTour />
            {showPaymentModal && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-[#1e293b] rounded-2xl shadow-2xl max-w-md w-full p-8 border border-gray-700 relative">
                    <button onClick={() => setShowPaymentModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>

                    <div className="text-center space-y-6">
                        <div className="mx-auto w-24 h-24 bg-blue-900/30 rounded-full flex items-center justify-center mb-4"><DownloadIcon className="w-12 h-12 text-blue-400" /></div>
                        <div><h3 className="text-4xl font-bold text-white">{paymentConfig.titulo}</h3><p className="text-gray-400 mt-2 text-base">Geração via Nuvem com formatação perfeita.</p></div>

                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 shadow-xl border border-blue-400/30">
                            <div className="text-3xl font-black text-white">R$ {paymentConfig.preco.toFixed(2).replace('.', ',')}</div>
                            <div className="text-blue-100 text-sm mb-4">Pagamento único</div>
                            <ul className="text-left text-sm text-white space-y-2 mb-6 bg-white/10 p-4 rounded-lg">
                                <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4 text-green-300" /> <span>{paymentConfig.descricao}</span></li>
                                <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4 text-green-300" /> <span>Layout 100% Otimizado</span></li>
                            </ul>

                            <form onSubmit={handlePaymentSubmit} className="space-y-3">
                                <div className="space-y-2 mb-4">
                                    <p className="text-sm text-white font-medium text-left">Escolha a forma de pagamento:</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button type="button" onClick={() => setPaymentMethod('pix')} className={`flex items-center justify-center gap-3 p-5 rounded-xl border-2 transition-all duration-200 text-lg ${paymentMethod === 'pix' ? 'bg-white text-blue-900 border-white font-bold shadow-lg scale-105' : 'bg-white/10 text-gray-300 border-white/10 hover:bg-white/20 hover:border-white/30'}`}>
                                            <PixIcon className={`w-8 h-8 ${paymentMethod === 'pix' ? 'text-blue-600' : 'text-gray-400'}`} /> Pix
                                        </button>
                                        <button type="button" onClick={() => setPaymentMethod('card')} className={`flex items-center justify-center gap-3 p-5 rounded-xl border-2 transition-all duration-200 text-lg ${paymentMethod === 'card' ? 'bg-white text-blue-900 border-white font-bold shadow-lg scale-105' : 'bg-white/10 text-gray-300 border-white/10 hover:bg-white/20 hover:border-white/30'}`}>
                                            <CreditCardIcon className={`w-8 h-8 ${paymentMethod === 'card' ? 'text-blue-600' : 'text-gray-400'}`} /> Cartão
                                        </button>
                                    </div>
                                </div>
                                <input type="email" required value={payerEmail} onChange={e => setPayerEmail(e.target.value)} className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:ring-2 focus:ring-white focus:outline-none" placeholder="Seu melhor e-mail" />
                                <button type="submit" disabled={isProcessing} className="w-full py-3 bg-white text-blue-900 font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-lg disabled:opacity-70 disabled:cursor-wait mt-2">
                                    {isProcessing ? 'Gerando Link...' : (paymentMethod === 'pix' ? 'Gerar Pix' : 'Pagar com Cartão')}
                                </button>
                            </form>
                        </div>
                        <button onClick={handleFreeDownload} className="text-gray-400 hover:text-white text-sm underline mt-4 decoration-gray-600 hover:decoration-white">
                            📥 Baixar PDF Gratuito (com marca d'água)
                        </button>
                    </div>
                </div>
            </div>)}

            {/* Modal de Pré-visualização do PDF */}
            {pdfPreviewUrl && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 lg:p-10 animate-fade-in">
                    <div className="bg-slate-800 rounded-2xl w-full max-w-6xl h-full max-h-[95vh] flex flex-col overflow-hidden shadow-2xl border border-slate-700/50">
                        <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-800/80">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <DocumentTextIcon className="w-6 h-6 text-blue-400" /> 
                                    Pré-visualização do PDF
                                </h3>
                                <p className="text-sm text-slate-400 mt-1">Verifique as margens e a resolução antes de baixar.</p>
                            </div>
                            <button 
                                onClick={() => {
                                    URL.revokeObjectURL(pdfPreviewUrl);
                                    setPdfPreviewUrl(null);
                                }} 
                                className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        
                        <div className="flex-1 bg-slate-950 p-2 md:p-6 overflow-hidden">
                            <iframe 
                                src={`${pdfPreviewUrl}#toolbar=0`} 
                                className="w-full h-full rounded-xl border border-slate-800 bg-white shadow-inner" 
                                title="Visualização do Currículo"
                            />
                        </div>
                        
                        <div className="p-4 border-t border-slate-700/50 flex justify-end gap-4 bg-slate-800/80">
                            <button 
                                onClick={() => {
                                    URL.revokeObjectURL(pdfPreviewUrl);
                                    setPdfPreviewUrl(null);
                                }} 
                                className="px-5 py-2.5 rounded-lg text-slate-300 hover:bg-slate-700 font-medium transition-colors"
                            >
                                Voltar ao Editor
                            </button>
                                <button 
                                onClick={() => setShowKeyModal(true)} 
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-lg font-bold shadow-lg shadow-blue-900/30 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
                            >
                                <DownloadIcon className="w-5 h-5" /> Confirmar Download
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Validação de Key / Admin */}
            {showKeyModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 animate-fade-in">
                    <div className="bg-slate-800 rounded-2xl w-full max-w-md flex flex-col overflow-hidden shadow-2xl border border-slate-700/50 p-6 relative">
                        <button onClick={() => { setShowKeyModal(false); setIsAdminMode(false); setKeyInput(''); }} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        
                        {!isAdminMode ? (
                            <form onSubmit={handleKeySubmit} className="space-y-6">
                                <div className="text-center">
                                    <h3 className="text-2xl font-bold text-white">Chave de Acesso</h3>
                                    <p className="text-slate-400 mt-2 text-sm">Insira sua Key única para liberar o download do currículo.</p>
                                </div>
                                <div>
                                    <input 
                                        type="text" 
                                        value={keyInput} 
                                        onChange={e => setKeyInput(e.target.value)} 
                                        placeholder="EX: A1B2-C3D4-E5F6"
                                        className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-center text-lg tracking-widest font-mono uppercase"
                                        autoFocus
                                        required
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={isKeyProcessing}
                                    className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white py-3 rounded-lg font-bold shadow-lg shadow-blue-900/30 transition-all disabled:opacity-50 disabled:cursor-wait"
                                >
                                    {isKeyProcessing ? 'Validando...' : 'Liberar Download'}
                                </button>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h3 className="text-2xl font-bold text-emerald-400">Painel Admin</h3>
                                    <p className="text-slate-400 mt-2 text-sm">Gerenciador de Chaves de Acesso</p>
                                </div>
                                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 max-h-48 overflow-y-auto space-y-2">
                                    {adminKeys.length === 0 ? (
                                        <p className="text-slate-500 text-center text-sm">Nenhuma chave gerada ainda.</p>
                                    ) : (
                                        adminKeys.slice().reverse().map(k => (
                                            <div key={k.id} className="flex items-center justify-between bg-slate-800 p-2 rounded border border-slate-700/50">
                                                <span className="font-mono text-sm text-slate-300">{k.id}</span>
                                                <span className={`text-xs px-2 py-1 rounded-full ${k.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                                    {k.status === 'active' ? 'Ativa' : 'Usada'}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <button 
                                    onClick={handleGenerateKey}
                                    disabled={isKeyProcessing}
                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg font-bold shadow-lg shadow-emerald-900/30 transition-all disabled:opacity-50"
                                >
                                    {isKeyProcessing ? 'Gerando...' : 'Gerar Nova Key'}
                                </button>
                                <button 
                                    onClick={executeDownload}
                                    className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg font-medium transition-all"
                                >
                                    Fazer Download como Admin
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};