import React, { useState, useEffect, useRef } from 'react';
import { LightBulbIcon, ArrowLeftIcon, CheckIcon } from './icons';

interface Step {
    target: string; // data-tour attribute value
    title: string;
    content: string;
    position?: 'left' | 'right' | 'top' | 'bottom' | 'center';
}

// Passos específicos para Desktop
const desktopSteps: Step[] = [
    {
        target: 'center',
        title: 'Bem-vindo ao Studio!',
        content: 'Vamos fazer um tour rápido para você criar o currículo perfeito em minutos.',
        position: 'center'
    },
    {
        target: 'sidebar-nav',
        title: 'Navegação e Seções',
        content: 'Aqui você escolhe qual parte do currículo quer editar. Arraste para reordenar as seções como quiser!',
        position: 'right'
    },
    {
        target: 'sidebar-add',
        title: 'Adicionar Mais',
        content: 'Clique aqui para adicionar novas seções como "Idiomas", "Projetos" ou "Certificações".',
        position: 'right'
    },
    {
        target: 'form-panel',
        title: 'Editor Inteligente',
        content: 'Preencha seus dados aqui. O editor se adapta automaticamente ao modelo escolhido.',
        position: 'left' 
    },
    {
        target: 'toolbar-download',
        title: 'Baixe seu PDF',
        content: 'Quando terminar, clique aqui para baixar seu currículo profissional em alta qualidade.',
        position: 'bottom'
    }
];

// Passos específicos para Mobile (Focados na Navbar inferior)
const mobileSteps: Step[] = [
    {
        target: 'center',
        title: 'Bem-vindo!',
        content: 'Crie seu currículo profissional direto pelo celular de forma fácil e rápida.',
        position: 'center'
    },
    {
        target: 'mobile-bottom-nav',
        title: 'Navegação Principal',
        content: 'Use esta barra inferior para alternar entre Editar seus dados, mudar o Design e Visualizar o resultado.',
        position: 'top'
    },
    {
        target: 'sidebar-nav', // No mobile, isso é a lista de seções
        title: 'Suas Informações',
        content: 'Toque em uma seção para editar. Ex: "Dados Pessoais" ou "Experiência".',
        position: 'bottom'
    },
    {
        target: 'sidebar-add',
        title: 'Adicionar Seções',
        content: 'Precisa de mais espaço? Adicione seções extras como Idiomas ou Cursos aqui.',
        position: 'top'
    }
];

export const OnboardingTour: React.FC = () => {
    const [stepIndex, setStepIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [activeSteps, setActiveSteps] = useState<Step[]>(desktopSteps);
    const [isMobileView, setIsMobileView] = useState(false);
    
    const lastScrolledTarget = useRef<string | null>(null);

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobileView(mobile);
            setActiveSteps(mobile ? mobileSteps : desktopSteps);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        // Delay inicial para carregar UI
        try {
            const hasSeenTour = localStorage.getItem('hasSeenTour_v2');
            if (!hasSeenTour) {
                setTimeout(() => setIsVisible(true), 1500);
            }
        } catch (e) { console.warn('LocalStorage blocked'); }

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Scroll Logic
    useEffect(() => {
        if (!isVisible) return;
        const step = activeSteps[stepIndex];
        if (!step) return;
        
        if (lastScrolledTarget.current === step.target) return;
        
        if (step.target !== 'center') {
            const element = document.querySelector(`[data-tour="${step.target}"]`);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                }, 100);
                lastScrolledTarget.current = step.target;
            }
        } else {
             lastScrolledTarget.current = step.target;
        }
    }, [stepIndex, isVisible, activeSteps]);

    // Rect Update Logic
    useEffect(() => {
        if (!isVisible) return;

        const updateRect = () => {
            const step = activeSteps[stepIndex];
            if (!step) return; 
            
            if (step.target === 'center') {
                setTargetRect(null);
                return;
            }

            const element = document.querySelector(`[data-tour="${step.target}"]`);
            if (element) {
                const rect = element.getBoundingClientRect();
                setTargetRect(rect);
            } else {
                setTargetRect(null);
            }
        };

        const timer = setTimeout(updateRect, 300);
        window.addEventListener('resize', updateRect);
        
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateRect);
        };
    }, [stepIndex, isVisible, activeSteps]);

    const handleNext = () => {
        if (stepIndex < activeSteps.length - 1) {
            setStepIndex(prev => prev + 1);
        } else {
            finishTour();
        }
    };

    const handlePrev = () => {
        if (stepIndex > 0) {
            setStepIndex(prev => prev + 1);
        }
    };

    const finishTour = () => {
        setIsVisible(false);
        try {
            localStorage.setItem('hasSeenTour_v2', 'true');
        } catch (e) {}
    };

    if (!isVisible) return null;

    const currentStep = activeSteps[stepIndex];
    if (!currentStep) return null;
    
    const isCenter = currentStep.position === 'center';

    // --- RENDERERS ---

    const SpotlightOverlay = () => (
        <div className="absolute inset-0 transition-all duration-500 ease-out"
             style={{
                 background: isCenter ? 'rgba(0, 0, 0, 0.8)' : 'transparent'
             }}
        />
    );

    const TargetHighlight = () => {
        if (isCenter || !targetRect) return null;
        return (
            <div 
                className="spotlight-highlight"
                style={{
                    position: 'absolute',
                    borderRadius: '0.75rem',
                    transition: 'all 500ms ease-out',
                    pointerEvents: 'none',
                    border: '2px solid #60a5fa', // Corresponds to border-blue-400
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)',
                    top: targetRect.top - 8,
                    left: targetRect.left - 8,
                    width: targetRect.width + 16,
                    height: targetRect.height + 16,
                    zIndex: 100
                }}
            />
        );
    };

    const MobileCard = () => (
        <div className="fixed bottom-0 left-0 right-0 bg-[#1e293b] rounded-t-3xl p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-[102] border-t border-gray-700 animate-slide-up">
            <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto mb-6 opacity-50"></div>
            
            <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-900/50 flex-shrink-0">
                    <LightBulbIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white mb-2">{currentStep.title}</h3>
                    <p className="text-gray-300 text-base leading-relaxed">{currentStep.content}</p>
                </div>
            </div>

            <div className="flex gap-3">
                {stepIndex > 0 && (
                    <button 
                        onClick={handlePrev}
                        className="p-4 rounded-xl bg-gray-800 text-gray-300 font-bold flex-shrink-0 border border-gray-700 hover:bg-gray-700"
                    >
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                )}
                <button 
                    onClick={handleNext} 
                    className="flex-1 py-4 bg-blue-600 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-blue-500 active:scale-95 transition-all flex justify-center items-center gap-2"
                >
                    {stepIndex === activeSteps.length - 1 ? (
                        <> <CheckIcon className="w-6 h-6"/> Vamos lá! </>
                    ) : (
                        'Próximo'
                    )}
                </button>
            </div>
            
            <div className="mt-4 text-center">
                <button onClick={finishTour} className="text-sm font-medium text-gray-500 py-2 px-4">
                    Pular Tutorial
                </button>
            </div>
        </div>
    );

    const DesktopCard = () => {
        const style = getDesktopStyles(currentStep, targetRect);
        return (
            <div 
                className={`pointer-events-auto transition-all duration-500 absolute max-w-sm w-full z-[102] ${isCenter ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''}`}
                style={!isCenter ? style.pos : {}}
            >
                <div className={`absolute text-blue-500 drop-shadow-md transition-all duration-500 ${style.arrowClass}`}>
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="currentColor" className="transform rotate-45">
                       <path d="M0 0 L20 20 L40 0 Z" /> 
                    </svg>
                </div>

                <div className="bg-slate-800/95 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl animate-in fade-in zoom-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="p-2 bg-blue-600 rounded-lg shadow-lg flex-shrink-0">
                            <LightBulbIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">{currentStep.title}</h3>
                            <p className="text-slate-300 text-sm leading-relaxed">{currentStep.content}</p>
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
                         <button onClick={finishTour} className="text-xs font-bold text-slate-500 hover:text-white uppercase tracking-wider transition-colors">
                            Pular
                        </button>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-600 font-mono mr-2">{stepIndex + 1} / {activeSteps.length}</span>
                            {stepIndex > 0 && (
                                <button onClick={handlePrev} className="p-1.5 rounded-md hover:bg-white/10 text-gray-300"><ArrowLeftIcon className="w-4 h-4"/></button>
                            )}
                            <button 
                                onClick={handleNext} 
                                className="px-4 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-500 transition-colors shadow-lg"
                            >
                                {stepIndex === activeSteps.length - 1 ? 'Concluir' : 'Próximo'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[100] overflow-hidden">
            <SpotlightOverlay />
            <TargetHighlight />
            
            {isMobileView ? <MobileCard /> : <DesktopCard />}

            <style>{`
                .spotlight-highlight::after {
                    content: '';
                    position: absolute;
                    top: -2px; left: -2px; right: -2px; bottom: -2px;
                    border-radius: inherit;
                    /* A animação de brilho agora é aplicada aqui, separada do 'buraco' */
                    animation: pulse-glow 2.5s ease-in-out infinite;
                    pointer-events: none;
                }

                /* Animação mais leve que afeta apenas um box-shadow pequeno */
                @keyframes pulse-glow {
                    0%, 100% {
                        box-shadow: 0 0 15px 2px rgba(96, 165, 250, 0.6);
                    }
                    50% {
                        box-shadow: 0 0 25px 8px rgba(96, 165, 250, 0.9);
                    }
                }
                
                @keyframes slide-up {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

// Helper function for desktop positioning
const getDesktopStyles = (step: Step, rect: DOMRect | null) => {
    if (!rect || step.position === 'center') return { pos: {}, arrowClass: 'hidden' };

    let top = 0;
    let left = 0;
    let arrowClass = '';

    // Basic logic
    if (step.position === 'right') {
        top = rect.top;
        left = rect.right + 20;
        arrowClass = '-left-2 top-6 -rotate-90';
    } else if (step.position === 'left') {
        top = rect.top;
        left = rect.left - 340; // Approx card width
        arrowClass = '-right-2 top-6 rotate-90';
    } else if (step.position === 'bottom') {
        top = rect.bottom + 20;
        left = rect.left + (rect.width/2) - 170; // Center
        arrowClass = '-top-2 left-1/2 -translate-x-1/2 rotate-180';
    } else if (step.position === 'top') {
        top = rect.top - 200;
        left = rect.left;
        arrowClass = '-bottom-2 left-1/2';
    }

    // Screen bounds check (simple)
    if (top < 20) top = 20;
    if (left < 20) left = 20;
    
    // Special case: Download button on top right
    if (step.target === 'toolbar-download') {
        left = window.innerWidth - 400;
        top = rect.bottom + 30;
        arrowClass = '-top-3 right-8 rotate-180';
    }

    return { pos: { top, left }, arrowClass };
};