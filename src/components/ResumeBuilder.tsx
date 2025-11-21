import React, { useState, useEffect } from 'react';
import { useToast } from './Toast';
import { ResumePreview } from './ResumePreview';
import { LeftSidebar } from './LeftSidebar';
import { FormPanel } from './FormPanel';
import { OnboardingTour } from './OnboardingTour';
import { useHistoryState } from '../hooks/useHistoryState';
import { DownloadIcon, UndoIcon, RedoIcon, CheckIcon, CreditCardIcon, PixIcon } from './icons';
import type { Resume, ResumeData, UiConfig, View } from '../types';
import { useAuth } from '../contexts/AuthContext';
// FIX: Replaced non-existent 'registerDownload' with 'consumeUsage'.
import { createPayment, getConfig, consumeUsage, checkPremiumStatus } from '../services/api';
import { gerarPDFDemo, gerarPDFPremium } from '../utils/pdfGenerator';

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
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [forceWatermark, setForceWatermark] = useState<boolean | null>(null);
  
  // Payment States
  const [hasPaidSession, setHasPaidSession] = useState(false);
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
          // Limpa a URL para evitar reprocessamento ao recarregar
          window.history.replaceState({}, document.title, window.location.pathname);

          if (status === 'success' && emailParam) {
              // Liberação otimista para melhor UX
              setHasPaidSession(true);
              setPayerEmail(emailParam);
              setForceWatermark(false);
              addToast('Pagamento confirmado! Acesso liberado.', 'success');

              // Verifica status no backend para garantir e atualizar estado global se necessário
              checkPremiumStatus(emailParam).catch(() => {
                  console.warn('Verificação de status em segundo plano.');
              });
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
      // 1. Verifica permissões locais (Logado Pro ou Sessão Paga Ativa)
      if (user?.subscriptionStatus === 'pro' || hasPaidSession) {
          setForceWatermark(false);
          setTimeout(() => {
              handleDownloadPdf(true);
          }, 200);
          return;
      }

      const emailToCheck = user?.email || resumeData.personal.email;

      // 2. Verifica status no backend (Evita pagamento duplo se o usuário já pagou mas a sessão caiu)
      if (emailToCheck && emailToCheck.includes('@')) {
          addToast("Verificando status...", "info");
          try {
              const isPremium = await checkPremiumStatus(emailToCheck);
              
              if (isPremium) {
                  addToast("Assinatura ativa encontrada! Liberando download...", "success");
                  setHasPaidSession(true);
                  setPayerEmail(emailToCheck);
                  setForceWatermark(false);
                  setTimeout(() => {
                      handleDownloadPdf(true);
                  }, 200);
                  return;
              }
          } catch (error) {
              console.error("Erro ao verificar status:", error);
          }
      }

      // 3. Se não tiver crédito, abre modal de pagamento
      setPayerEmail(emailToCheck || '');
      setShowPaymentModal(true);
  };

  const handleFreeDownload = () => {
      // Fechar modal e ativar marca d'água visualmente
      setShowPaymentModal(false);
      setForceWatermark(true);
      
      // Feedback imediato
      addToast("Preparando layout...", "info");
      setIsGeneratingPdf(true);

      // Timeout maior para garantir que o React redesenhou a tela com a marca d'água
      // e que o browser renderizou os novos estilos antes da captura
      setTimeout(() => {
          handleDownloadPdf(false); 
      }, 1500); 
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!payerEmail) {
          addToast("Por favor, informe seu e-mail.", "error");
          return;
      }
      setIsProcessing(true);
      try {
          // Chama o backend para criar o pagamento e obter a URL de checkout
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
        
        // CAPTURA HTML DO PREVIEW
        const previewElement = document.getElementById('resume-preview-container');
        if (!previewElement) {
            throw new Error("Erro interno: Preview não encontrado.");
        }

        // CLONAR E LIMPAR O HTML
        // Isso remove as linhas pontilhadas e indicadores de página que forçam páginas extras
        const clone = previewElement.cloneNode(true) as HTMLElement;
        
        // Remove elementos marcados como 'no-print-export' (linhas de quebra, botões, etiquetas de página)
        const nonPrintables = clone.querySelectorAll('.no-print-export');
        nonPrintables.forEach(el => el.remove());

        // Remove elementos absolutos de paginação se existirem (garantia extra caso a classe falhe)
        const pageIndicators = clone.querySelectorAll('div[style*="top:"][style*="297mm"]');
        pageIndicators.forEach(el => el.remove());

        const capturedHtml = clone.outerHTML;
        const emailToVerify = user?.email || payerEmail || resumeData.personal.email;
        const dataForPdf: ResumeData = {
            ...resumeData,
            personal: { ...resumeData.personal, email: emailToVerify }
        };

        let result;
        if (isPremium) {
            result = await gerarPDFPremium(dataForPdf, uiConfig, capturedHtml);
            if (result.premium === false) { 
                addToast(result.erro || "Acesso Premium necessário.", "error");
                setShowPaymentModal(true); 
                setIsGeneratingPdf(false);
                return;
            }
        } else {
            result = await gerarPDFDemo(dataForPdf, uiConfig, capturedHtml);
        }

        if (result.sucesso) {
            const cleanName = resumeData.personal.name.replace(/[^a-zA-Z0-9]/g, '_') || 'curriculo';
            const filename = `curriculo_${cleanName}.pdf`;

            // Download Direto via Blob (Base64)
            if (result.pdfBase64) {
                const binStr = atob(result.pdfBase64);
                const len = binStr.length;
                const arr = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    arr[i] = binStr.charCodeAt(i);
                }
                const blob = new Blob([arr], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                
                // Cria link invisível e clica
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                
                // Limpeza
                setTimeout(() => {
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                }, 200);
                
                addToast("Download iniciado!", "success");
            } 
            // Fallback para URL (Premium com Storage)
            else if (result.pdfUrl) {
                 const link = document.createElement('a');
                 link.href = result.pdfUrl;
                 link.download = filename;
                 // IMPORTANTE: NÃO definir target="_blank" para evitar bloqueadores de popup
                 // O backend já envia headers 'Content-Disposition: attachment' para garantir download direto
                 document.body.appendChild(link);
                 link.click();
                 document.body.removeChild(link);
                 
                 addToast("Download iniciado!", "success");
            }

            if (isPremium) {
                // FIX: Replaced `registerDownload` with `consumeUsage` and removed extra argument.
                await consumeUsage(emailToVerify);

                // ✅ LÓGICA DE CONSUMO DE CRÉDITO ÚNICO
                if (user?.subscriptionStatus !== 'pro') {
                    setHasPaidSession(false);
                    setForceWatermark(null);
                    addToast("Sessão de download único finalizada.", "info");
                }
            }
        } else {
            // Tratamento para Cold Start e Erros
            const msg = result.erro || "Falha ao gerar PDF.";
            if (msg.includes('acordando')) {
                 addToast("Servidor iniciando... Tente novamente em 10s.", "info");
            } else {
                 addToast(msg, "error");
            }
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
  
  return (
      <div className="flex h-screen bg-gray-900 text-white overflow-hidden relative">
        <LeftSidebar 
            activeSection={activeSection} 
            setActiveSection={setActiveSection} 
            resumeData={resumeData} 
            setResumeData={setResumeData} 
            scrollToSection={scrollToSection} 
        />
        
        {activeSection && (
             <div className="absolute left-20 md:left-24 top-0 bottom-0 w-full md:w-[450px] z-20 md:static md:z-0 transition-all duration-300 shadow-2xl">
                 <FormPanel 
                    activeSection={activeSection} 
                    resumeData={resumeData} 
                    setResumeData={setResumeData} 
                    uiConfig={uiConfig} 
                    setUiConfig={setUiConfig} 
                    onClose={() => setActiveSection(null)} 
                 />
             </div>
        )}

        <div className="flex-1 flex flex-col relative bg-gray-800/50 overflow-hidden">
             <div className="h-16 border-b border-gray-700 flex items-center justify-between px-4 md:px-6 bg-gray-900/80 backdrop-blur-sm z-10">
                 <div className="flex items-center gap-4">
                     <button onClick={() => setCurrentView('meus-curriculos')} className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                         </svg>
                         <span className="hidden sm:inline">Voltar</span>
                     </button>
                     <div className="h-6 w-px bg-gray-700 hidden sm:block"></div>
                     <span className="font-medium truncate max-w-[150px] sm:max-w-[300px] text-sm sm:text-base">{resumeData.personal.name || 'Meu Currículo'}</span>
                 </div>
                 
                 <div className="flex items-center gap-2 sm:gap-3">
                     <button onClick={() => undo()} disabled={!canUndo} className="p-2 text-gray-400 hover:text-white disabled:opacity-30 transition-colors rounded-lg hover:bg-gray-800"><UndoIcon className="w-5 h-5" /></button>
                     <button onClick={() => redo()} disabled={!canRedo} className="p-2 text-gray-400 hover:text-white disabled:opacity-30 transition-colors rounded-lg hover:bg-gray-800"><RedoIcon className="w-5 h-5" /></button>
                     
                     <button 
                        onClick={handleDownloadClick} 
                        disabled={isGeneratingPdf}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-50 transition-all shadow-lg shadow-blue-900/20 font-bold text-sm sm:text-base disabled:opacity-70 disabled:cursor-wait"
                     >
                        {isGeneratingPdf ? <span className="animate-pulse">Processando...</span> : <> <DownloadIcon className="w-5 h-5" /> <span className="hidden sm:inline">Baixar PDF</span> </>}
                     </button>
                 </div>
             </div>

             <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center bg-[#0f172a] relative custom-scrollbar">
                <div className="my-auto">
                    <ResumePreview
                        resumeData={resumeData}
                        uiConfig={uiConfig}
                        showWatermark={shouldShowWatermark}
                        isPrinting={false}
                    />
                </div>
             </div>
        </div>
        
        <OnboardingTour />
        
        {showPaymentModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-[#1e293b] rounded-2xl shadow-2xl max-w-md w-full p-8 border border-gray-700 relative">
                    <button onClick={() => setShowPaymentModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                    
                    <div className="text-center space-y-6">
                         <div className="mx-auto w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center mb-2"><DownloadIcon className="w-8 h-8 text-blue-400" /></div>
                        <div><h3 className="text-2xl font-bold text-white">{paymentConfig.titulo}</h3><p className="text-gray-400 mt-2 text-sm">Geração via Nuvem com formatação perfeita.</p></div>
                        
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 shadow-xl border border-blue-400/30">
                            <div className="text-3xl font-black text-white">R$ {paymentConfig.preco.toFixed(2).replace('.', ',')}</div>
                            <div className="text-blue-100 text-sm mb-4">Pagamento único</div>
                            <ul className="text-left text-sm text-white space-y-2 mb-6 bg-white/10 p-4 rounded-lg">
                                <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4 text-green-300"/> <span>{paymentConfig.descricao}</span></li>
                                <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4 text-green-300"/> <span>Layout 100% Otimizado</span></li>
                            </ul>
                            
                            <form onSubmit={handlePaymentSubmit} className="space-y-3">
                                
                                <div className="space-y-2 mb-4">
                                    <p className="text-sm text-white font-medium text-left">Escolha a forma de pagamento:</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button 
                                            type="button"
                                            onClick={() => setPaymentMethod('pix')}
                                            className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${paymentMethod === 'pix' ? 'bg-white text-blue-900 border-white font-bold shadow-lg scale-105' : 'bg-white/10 text-gray-300 border-white/10 hover:bg-white/20 hover:border-white/30'}`}
                                        >
                                            <PixIcon className={`w-5 h-5 ${paymentMethod === 'pix' ? 'text-blue-600' : 'text-gray-400'}`} /> Pix
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setPaymentMethod('card')}
                                            className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${paymentMethod === 'card' ? 'bg-white text-blue-900 border-white font-bold shadow-lg scale-105' : 'bg-white/10 text-gray-300 border-white/10 hover:bg-white/20 hover:border-white/30'}`}
                                        >
                                            <CreditCardIcon className={`w-5 h-5 ${paymentMethod === 'card' ? 'text-blue-600' : 'text-gray-400'}`} /> Cartão
                                        </button>
                                    </div>
                                </div>

                                <input 
                                    type="email" 
                                    required 
                                    value={payerEmail} 
                                    onChange={e => setPayerEmail(e.target.value)} 
                                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:ring-2 focus:ring-white focus:outline-none" 
                                    placeholder="Seu melhor e-mail" 
                                />
                                <button 
                                    type="submit" 
                                    disabled={isProcessing}
                                    className="w-full py-3 bg-white text-blue-900 font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-lg disabled:opacity-70 disabled:cursor-wait mt-2"
                                >
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
};
