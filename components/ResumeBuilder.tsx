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
import { generateA4PDF } from '../utils/a4PdfGenerator';
import { CodeEditor } from './CodeEditor';

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
        // --- NATIVE PRINT STRATEGY (High Fidelity, No Server) ---
        setForceWatermark(false);
        setIsNativePrinting(true);

        setTimeout(() => {
            const original = document.getElementById('resume-preview-container');
            if (!original) {
                addToast("Erro: Currículo não encontrado.", "error");
                setIsNativePrinting(false);
                return;
            }

            let mount = document.getElementById('print-mount');
            if (!mount) {
                mount = document.createElement('div');
                mount.id = 'print-mount';
                document.body.appendChild(mount);
            }
            mount.innerHTML = '';

            const clone = original.cloneNode(true) as HTMLElement;
            clone.style.transform = 'none';
            clone.style.margin = '0';
            clone.style.padding = '0';
            clone.style.position = 'absolute';
            clone.style.left = '0';
            clone.style.top = '0';
            clone.style.width = '100%';
            clone.style.boxShadow = 'none';
            clone.style.border = 'none';

            mount.appendChild(clone);
            window.print();

            setTimeout(() => {
                mount!.innerHTML = '';
                setIsNativePrinting(false);
            }, 500);

        }, 500);
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
                        <div className="p-4 flex justify-center bg-gray-900/50 min-h-full">
                            <div className="my-auto scale-[0.45] sm:scale-[0.6] origin-top transform-gpu">
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
                <div className="flex-1 overflow-auto p-8 flex justify-center bg-[#0f172a] relative custom-scrollbar">
                    {viewMode === 'visual' ? (
                        <div id="preview-wrapper" className="my-auto">
                            <ResumePreview resumeData={resumeData} uiConfig={uiConfig} showWatermark={shouldShowWatermark} isPrinting={isNativePrinting} />
                        </div>
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
        </div>
    );
};