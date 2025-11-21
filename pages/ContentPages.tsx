import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '../components/Toast';
import { TemplateThumbnails } from '../components/TemplateThumbnails';
import { 
    PencilIcon, TrashIcon, DuplicateIcon, PlusIcon, CheckIcon,
    ChevronDownIcon, ChevronUpIcon, SparklesIcon, DocumentTextIcon, DownloadIcon, UserIcon, BriefcaseIcon, QuoteIcon,
    StarIcon, ShieldCheckIcon, BookOpenIcon, LifebuoyIcon
} from '../components/icons';
import type { View, Resume, TemplateOption } from '../types';
import { initialResumeData, initialUiConfig } from '../initialData';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { generateId } from '../utils';

interface PageComponentProps {
  setCurrentView?: (view: View) => void;
  onApplyTemplate?: (template: TemplateOption) => void;
}

// ==================== SHARED COMPONENTS ====================

export const PageWrapper: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ${className} relative z-10 animate-in fade-in duration-500`}>
        {children}
    </div>
);

const PageHeader: React.FC<{ title: string; subtitle: string; centered?: boolean }> = ({ title, subtitle, centered = true }) => (
    <div className={`mb-16 ${centered ? 'text-center' : ''}`}>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-cyan-200 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">{title}</h1>
        <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-slate-400 dark:text-slate-300 leading-relaxed">{subtitle}</p>
    </div>
);

// ==================== HELPER COMPONENTS FOR CAROUSEL ====================

const MiniResumeVisual: React.FC<{ type: 'creative' | 'executive' | 'modern' | 'classic' }> = ({ type }) => {
    // Visual representations of filled resumes
    if (type === 'creative') {
        return (
            <div className="w-full h-full bg-white flex flex-col overflow-hidden text-[4px] text-gray-800 relative">
                <div className="h-1/4 bg-purple-600 p-2 flex flex-col justify-center text-white relative">
                    <div className="font-bold text-[8px] leading-tight">MARIA SILVA</div>
                    <div className="opacity-80 tracking-widest mt-0.5">UX DESIGNER</div>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 rounded-full"></div>
                </div>
                <div className="flex-1 flex p-2 gap-2">
                    <div className="flex-1 space-y-1.5">
                        <div className="w-4 h-1 bg-purple-200 rounded"></div>
                        <div className="space-y-0.5">
                            <div className="w-full h-0.5 bg-gray-200"></div>
                            <div className="w-full h-0.5 bg-gray-200"></div>
                            <div className="w-3/4 h-0.5 bg-gray-200"></div>
                        </div>
                        <div className="w-4 h-1 bg-purple-200 rounded mt-2"></div>
                         <div className="space-y-0.5">
                            <div className="w-full h-0.5 bg-gray-200"></div>
                            <div className="w-2/3 h-0.5 bg-gray-200"></div>
                        </div>
                    </div>
                    <div className="w-1/3 space-y-2">
                         <div className="w-full h-1 bg-gray-100 rounded"></div>
                         <div className="flex flex-wrap gap-0.5">
                             {[1,2,3,4].map(i => <div key={i} className="w-3 h-1 bg-purple-100 rounded-sm"></div>)}
                         </div>
                    </div>
                </div>
            </div>
        );
    }
    if (type === 'modern') {
        return (
             <div className="w-full h-full bg-white flex text-[4px] text-gray-800 overflow-hidden">
                <div className="w-1/3 bg-slate-800 text-gray-300 p-2 space-y-2">
                    <div className="w-6 h-6 rounded-full bg-slate-600 mx-auto"></div>
                    <div className="w-full h-0.5 bg-slate-700"></div>
                    <div className="w-full h-0.5 bg-slate-700"></div>
                    <div className="mt-4 w-full h-1 bg-slate-700 rounded"></div>
                    <div className="w-full h-0.5 bg-slate-700"></div>
                </div>
                <div className="flex-1 p-2 space-y-2">
                     <div className="text-[8px] font-bold text-slate-800">JOÃO SOUZA</div>
                     <div className="text-[5px] text-slate-500 uppercase">Desenvolvedor Fullstack</div>
                     <div className="w-full h-px bg-gray-200 my-1"></div>
                     <div className="space-y-1">
                         <div className="w-6 h-1 bg-blue-200 rounded"></div>
                         <div className="w-full h-0.5 bg-gray-200"></div>
                         <div className="w-full h-0.5 bg-gray-200"></div>
                     </div>
                     <div className="space-y-1">
                         <div className="w-6 h-1 bg-blue-200 rounded"></div>
                         <div className="w-full h-0.5 bg-gray-200"></div>
                         <div className="w-full h-0.5 bg-gray-200"></div>
                     </div>
                </div>
             </div>
        )
    }
    // Default / Executive / Classic
    return (
         <div className="w-full h-full bg-white p-3 flex flex-col text-[4px] text-gray-800 overflow-hidden relative">
            {type === 'executive' && <div className="absolute top-0 left-0 w-full h-2 bg-blue-900"></div>}
            <div className="text-center mb-2 mt-1">
                 <div className="font-serif text-[8px] font-bold">CARLOS MENDES</div>
                 <div className="text-gray-500 mt-0.5">GERENTE DE PROJETOS</div>
            </div>
            <div className="space-y-2">
                 <div className="w-full border-b border-gray-300 pb-0.5 font-bold text-[5px] uppercase text-blue-900">Resumo</div>
                 <div className="w-full h-0.5 bg-gray-200"></div>
                 <div className="w-full h-0.5 bg-gray-200"></div>
                 
                 <div className="w-full border-b border-gray-300 pb-0.5 font-bold text-[5px] uppercase text-blue-900 mt-1">Experiência</div>
                 <div className="flex justify-between font-bold"><span className="w-10 h-1 bg-gray-300"></span><span>2020-2023</span></div>
                 <div className="w-full h-0.5 bg-gray-200 mt-0.5"></div>
                 <div className="w-3/4 h-0.5 bg-gray-200"></div>
            </div>
         </div>
    )
}

const TemplateShowcaseCarousel: React.FC<{ onSelect: (t: TemplateOption) => void }> = ({ onSelect }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 340;
            scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    const templates: { id: TemplateOption; name: string; tag: string; desc: string; component: React.ReactNode }[] = [
        { id: 'creative', name: 'Criativo', tag: 'PRO', desc: 'Ideal para Design, Marketing e Tech.', component: <MiniResumeVisual type="creative" /> },
        { id: 'modern', name: 'Moderno', tag: 'Recomendado', desc: 'Equilíbrio perfeito para todas as áreas.', component: <MiniResumeVisual type="modern" /> },
        { id: 'executive', name: 'Executivo', tag: 'PRO', desc: 'Sóbrio e direto para alta gestão.', component: <MiniResumeVisual type="executive" /> },
        { id: 'classic', name: 'Clássico', tag: 'Grátis', desc: 'O padrão aceito globalmente.', component: <MiniResumeVisual type="classic" /> },
        { id: 'compact', name: 'Compacto', tag: 'Grátis', desc: 'Para currículos de uma página.', component: <MiniResumeVisual type="classic" /> },
    ];

    return (
        <div className="relative w-full max-w-7xl mx-auto px-4">
             {/* Controls */}
             <button onClick={() => scroll('left')} className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-3 bg-slate-800/90 text-white rounded-full hover:bg-blue-600 hover:scale-110 transition-all hidden md:flex border border-slate-600 shadow-lg shadow-black/50">
                 <ChevronDownIcon className="w-6 h-6 rotate-90" />
             </button>
             <button onClick={() => scroll('right')} className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-3 bg-slate-800/90 text-white rounded-full hover:bg-blue-600 hover:scale-110 transition-all hidden md:flex border border-slate-600 shadow-lg shadow-black/50">
                 <ChevronDownIcon className="w-6 h-6 -rotate-90" />
             </button>

            <div 
                ref={scrollRef}
                className="flex gap-10 overflow-x-auto snap-x snap-mandatory py-12 px-4 md:px-12 hide-scrollbar"
                style={{ scrollPaddingLeft: '20px' }}
            >
                {templates.map((t) => (
                    <div key={t.id} className="snap-center shrink-0 w-[280px] md:w-[320px] group relative select-none perspective-1000">
                        
                        {/* The Glowing Border Layer (Outside the card content) */}
                        <div className="absolute -inset-[3px] bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-100 blur-md transition duration-500 group-hover:duration-200 animate-gradient-xy"></div>
                        
                        {/* Card Container */}
                        <div 
                            className="relative bg-white rounded-xl shadow-2xl aspect-[210/297] transform transition-all duration-300 ease-out group-hover:scale-[1.03] group-hover:-translate-y-1 z-10 cursor-pointer overflow-hidden"
                            onClick={() => onSelect(t.id)}
                        >
                            {/* Visual Content */}
                            <div className="absolute inset-0 pointer-events-none">
                                {t.component}
                            </div>
                            
                            {/* Hover Overlay (Darken + Button) */}
                            <div className="absolute inset-0 bg-slate-900/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-6 text-center backdrop-blur-[2px]">
                                <h3 className="text-2xl font-bold text-white mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{t.name}</h3>
                                <p className="text-sm text-gray-300 mb-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">{t.desc}</p>
                                <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-full shadow-lg hover:shadow-blue-500/50 transform scale-90 group-hover:scale-100 transition-all duration-300 delay-100 flex items-center gap-2">
                                    <SparklesIcon className="w-4 h-4" />
                                    Usar Modelo
                                </button>
                            </div>
                        </div>

                        {/* Badges (Floating above everything, z-20) */}
                        <div className="absolute top-4 right-4 z-20 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                            {t.tag === 'PRO' ? (
                                <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-black px-3 py-1.5 rounded-lg shadow-xl border border-white/20">PRO</span>
                            ) : t.tag === 'Recomendado' ? (
                                <span className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-xs font-black px-3 py-1.5 rounded-lg shadow-xl border border-white/20">HOT</span>
                            ) : (
                                    <span className="bg-slate-800 text-gray-200 text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl border border-white/20">GRÁTIS</span>
                            )}
                        </div>
                        
                        {/* Shadow/Reflection below */}
                        <div className="absolute -bottom-8 left-8 right-8 h-4 bg-black/50 blur-xl rounded-[100%] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
                    </div>
                ))}
            </div>

            {/* Pricing Hook */}
            <div className="mt-4 text-center">
                 <p className="text-slate-400 mb-4">Alguns modelos são exclusivos para membros Pro.</p>
                 <div className="flex flex-col sm:flex-row justify-center gap-4 text-sm">
                     <div className="flex items-center justify-center text-gray-300"><div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>Grátis: Clássico e Compacto</div>
                     <div className="flex items-center justify-center text-white font-bold"><div className="w-2 h-2 bg-purple-500 rounded-full mr-2 shadow-[0_0_10px_#a855f7]"></div>Pro: Criativo e Executivo</div>
                 </div>
            </div>
        </div>
    )
}

// ==================== PAGE IMPLEMENTATIONS ====================

interface MyResumesPageProps extends PageComponentProps {
    resumes: Resume[];
    setResumes: React.Dispatch<React.SetStateAction<Resume[]>>;
    setActiveResumeId: (id: string) => void;
}

export const MyResumesPage: React.FC<MyResumesPageProps> = ({ setCurrentView, resumes, setResumes, setActiveResumeId }) => {
    const { addToast } = useToast();
    const { user } = useAuth();
    
    const handleCreateResume = () => {
        const newResume: Resume = {
            id: generateId(),
            title: 'Novo Currículo',
            lastModified: new Date().toISOString(),
            data: { ...initialResumeData, personal: { ...initialResumeData.personal, name: 'Seu Nome'}},
            ui: initialUiConfig,
        };
        setResumes(prev => [newResume, ...prev]);
        setActiveResumeId(newResume.id);
        if (setCurrentView) setCurrentView('builder');
        addToast('Novo currículo criado!', 'success');
    };

    const handleEditResume = (id: string) => {
        setActiveResumeId(id);
        if (setCurrentView) setCurrentView('builder');
    };
    
    const handleDeleteResume = (idToDelete: string) => {
        setResumes(prev => prev.filter(r => r.id !== idToDelete));
        addToast('Currículo excluído!', 'error');
    };

    const handleDuplicateResume = (resumeToDuplicate: Resume) => {
        const newResume: Resume = {
            ...resumeToDuplicate,
            id: generateId(),
            title: `${resumeToDuplicate.title} (Cópia)`,
            lastModified: new Date().toISOString(),
        };
        setResumes(prev => [newResume, ...prev]);
        addToast('Currículo duplicado!', 'success');
    };

    const handleActionClick = (e: React.MouseEvent, callback: () => void) => {
        e.stopPropagation();
        callback();
    };
    
    const formatLastModified = (dateString: string) => {
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        } catch (e) {
            return 'recentemente';
        }
    }

    return (
        <PageWrapper>
            {/* Flashy Hero Welcome Section */}
            <div className="relative mb-16 p-8 md:p-12 rounded-3xl overflow-hidden border border-white/10 shadow-2xl group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-indigo-900/60 to-slate-900/90 z-0"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 z-0"></div>
                
                {/* Animated glow */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl animate-pulse z-0"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight">
                            Olá, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">{user?.email?.split('@')[0] || 'Visitante'}</span>!
                        </h1>
                        <p className="text-lg text-blue-100/80 font-light">Seu próximo grande passo na carreira começa aqui.</p>
                    </div>
                    <button 
                        onClick={handleCreateResume}
                        className="group/btn relative px-8 py-4 bg-white text-slate-900 font-bold rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all transform hover:-translate-y-1 overflow-hidden"
                    >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-200 via-white to-blue-200 opacity-0 group-hover/btn:opacity-50 transition-opacity duration-500"></div>
                        <span className="relative flex items-center gap-3">
                            <PlusIcon className="w-5 h-5 text-blue-600" />
                            Novo Currículo
                        </span>
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <DocumentTextIcon className="w-6 h-6 text-blue-400"/>
                    Seus Documentos
                </h2>
                <span className="text-sm font-medium text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700">{resumes.length} projetos</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {/* New Resume Card Button */}
                <button 
                    onClick={handleCreateResume}
                    className="group relative flex flex-col items-center justify-center gap-6 p-8 rounded-2xl border-2 border-dashed border-slate-600 hover:border-blue-400 bg-slate-800/30 hover:bg-slate-800/60 transition-all h-[340px]"
                >
                    <div className="w-20 h-20 rounded-full bg-slate-800 group-hover:bg-blue-500/20 flex items-center justify-center transition-all duration-500 group-hover:scale-110 border border-slate-700 group-hover:border-blue-500/50">
                        <PlusIcon className="w-8 h-8 text-slate-400 group-hover:text-blue-400" />
                    </div>
                    <span className="font-bold text-lg text-slate-400 group-hover:text-blue-400 transition-colors">Criar em Branco</span>
                </button>

                {resumes.map(resume => (
                    <div 
                        key={resume.id}
                        className="relative bg-slate-800/40 backdrop-blur-md rounded-2xl overflow-hidden group cursor-pointer border border-slate-700/50 hover:border-blue-500/50 hover:shadow-[0_10px_40px_-10px_rgba(59,130,246,0.2)] transition-all duration-300 hover:-translate-y-2 h-[340px] flex flex-col"
                        onClick={() => handleEditResume(resume.id)}
                    >
                        {/* Visual Preview Placeholder */}
                        <div className="h-48 bg-slate-700/50 relative overflow-hidden group-hover:h-44 transition-all duration-300">
                             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                             {/* Document Paper Simulation */}
                             <div className="absolute top-6 left-1/2 -translate-x-1/2 w-3/4 h-full bg-white shadow-2xl rounded-t-lg opacity-90 group-hover:translate-y-2 transition-transform duration-500">
                                <div className="h-4 w-1/3 bg-slate-200 m-4 rounded"></div>
                                <div className="h-2 w-2/3 bg-slate-100 mx-4 my-2 rounded"></div>
                                <div className="h-2 w-full bg-slate-100 mx-4 my-1 rounded"></div>
                                <div className="h-2 w-full bg-slate-100 mx-4 my-1 rounded"></div>
                             </div>
                             <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80"></div>
                             
                             {/* Hover Overlay */}
                             <div className="absolute inset-0 bg-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="bg-blue-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg transform scale-90 group-hover:scale-100 transition-transform">Editar</div>
                             </div>
                        </div>

                        <div className="p-6 flex-1 flex flex-col justify-between bg-gradient-to-b from-slate-800 to-slate-900">
                            <div>
                                <h3 className="text-xl font-bold text-white truncate leading-tight mb-2 group-hover:text-blue-400 transition-colors" title={resume.title}>{resume.title}</h3>
                                <div className="text-xs text-slate-400 flex items-center gap-2 bg-slate-950/50 py-1 px-2 rounded-lg w-fit">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                                    {formatLastModified(resume.lastModified)}
                                </div>
                            </div>
                             <div className="pt-4 flex justify-between items-center border-t border-slate-700/50 mt-auto">
                                <div className="flex gap-1">
                                    <button onClick={(e) => handleActionClick(e, () => handleDuplicateResume(resume))} className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="Duplicar"><DuplicateIcon className="w-5 h-5" /></button>
                                    <button onClick={(e) => handleActionClick(e, () => handleDeleteResume(resume.id))} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Excluir"><TrashIcon className="w-5 h-5" /></button>
                                </div>
                                <button className="p-2 text-blue-400 hover:text-white hover:bg-blue-600 rounded-lg transition-all" title="Editar">
                                    <PencilIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </PageWrapper>
    );
};

export const TemplatesPage: React.FC<PageComponentProps> = ({ setCurrentView, onApplyTemplate }) => {
    const { user } = useAuth();
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateOption>('classic');

    const handleSelect = (template: TemplateOption) => {
        setSelectedTemplate(template);
    };
    
    const handleConfirm = () => {
        if (onApplyTemplate) {
            onApplyTemplate(selectedTemplate);
        } else {
            // Fallback
            setCurrentView?.('builder');
        }
    }
    
    return (
    <PageWrapper>
        <PageHeader title="Todos os Modelos" subtitle="Uma galeria completa para cada etapa da sua carreira." />
        <div className="glass p-8 rounded-3xl border border-white/10 shadow-2xl bg-slate-900/50">
             <TemplateThumbnails currentTemplate={selectedTemplate} onSelectTemplate={handleSelect} />
             <div className="mt-8 text-center">
                <button onClick={handleConfirm} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors">
                    Usar Modelo
                </button>
             </div>
        </div>
    </PageWrapper>
)};

export const PlansPage: React.FC<PageComponentProps> = ({ setCurrentView }) => {
    const { user, updateSubscription } = useAuth();
    const { addToast } = useToast();

    const handleUpgrade = () => {
        if (!user) {
            if (setCurrentView) setCurrentView('auth');
            return;
        }
        updateSubscription('pro');
        addToast('Parabéns! Você agora é Pro.', 'success');
        if (setCurrentView) setCurrentView('assinatura');
    };
    
    const handleFree = () => {
        if (!user && setCurrentView) setCurrentView('auth');
    }

    return (
        <PageWrapper>
            <PageHeader title="Invista na Sua Carreira" subtitle="Planos flexíveis projetados para você conseguir a entrevista dos sonhos." />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto items-center mt-12">
                
                {/* Basic / Single */}
                <div className="glass rounded-3xl p-8 border border-white/5 hover:border-white/20 bg-slate-900/40 backdrop-blur-md transition-all duration-300 flex flex-col h-auto order-2 md:order-1">
                    <h3 className="text-xl font-bold text-slate-300">Avulso</h3>
                    <p className="mt-2 text-sm text-slate-400 h-10">Para uma necessidade imediata e única.</p>
                    <div className="my-8">
                        <span className="text-4xl font-extrabold text-white">R$9,90</span>
                        <span className="text-sm text-slate-500"> /download</span>
                    </div>
                    <button onClick={() => setCurrentView?.('builder')} className="w-full py-3 rounded-xl border border-slate-600 text-slate-300 font-semibold hover:bg-white/5 hover:border-white transition-colors mb-8">
                        Criar Currículo
                    </button>
                    <ul className="space-y-4 text-sm text-slate-300">
                        <li className="flex items-center"><CheckIcon className="w-5 h-5 text-green-500 mr-3" />1 Download PDF Profissional</li>
                        <li className="flex items-center"><CheckIcon className="w-5 h-5 text-green-500 mr-3" />Sem marca d'água</li>
                        <li className="flex items-center"><CheckIcon className="w-5 h-5 text-slate-600 mr-3" />Acesso a Modelos Premium</li>
                    </ul>
                </div>

                {/* PRO PLAN - Highlighted - OCULTADO VISUALMENTE PARA O PÚBLICO GERAL 
                <div className="relative rounded-3xl p-[2px] bg-gradient-to-b from-cyan-400 via-blue-500 to-purple-600 shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)] order-1 md:order-2 transform md:-translate-y-8 z-20 hover:scale-[1.02] transition-transform duration-300">
                    ... CONTEÚDO MANTIDO MAS OCULTO ...
                </div>
                */}

                {/* Free Plan */}
                <div className="glass rounded-3xl p-8 border border-white/5 hover:border-white/20 bg-slate-900/40 backdrop-blur-md transition-all duration-300 flex flex-col h-auto order-3">
                    <h3 className="text-xl font-bold text-slate-300">Iniciante</h3>
                    <p className="mt-2 text-sm text-slate-400 h-10">Para testar a ferramenta.</p>
                    <div className="my-8">
                        <span className="text-4xl font-extrabold text-white">Grátis</span>
                    </div>
                    <button onClick={() => setCurrentView?.('builder')} className="w-full py-3 rounded-xl border border-slate-700 text-slate-500 font-semibold cursor-not-allowed mb-8 bg-slate-800/50 disabled:opacity-70">
                        Começar Agora
                    </button>
                    <ul className="space-y-4 text-sm text-slate-400">
                        <li className="flex items-center"><CheckIcon className="w-5 h-5 text-slate-500 mr-3" />1 Currículo</li>
                        <li className="flex items-center"><CheckIcon className="w-5 h-5 text-slate-500 mr-3" />Download com Marca d'água</li>
                        <li className="flex items-center"><CheckIcon className="w-5 h-5 text-slate-500 mr-3" />Acesso limitado ao Editor</li>
                    </ul>
                </div>
            </div>
        </PageWrapper>
    );
};

export const CreateResumePage: React.FC<PageComponentProps> = ({ setCurrentView, onApplyTemplate }) => {
    const handleAction = (template?: TemplateOption) => {
        if (template && onApplyTemplate) {
            onApplyTemplate(template);
        } else {
            setCurrentView?.('builder');
        }
    };
    
    // JS for scroll animations
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                    }
                });
            },
            { threshold: 0.1 }
        );

        const sections = document.querySelectorAll('.section-fade-in');
        sections.forEach((section) => observer.observe(section));

        return () => sections.forEach((section) => observer.unobserve(section));
    }, []);

    const features = [
        {
            icon: <SparklesIcon className="w-8 h-8 text-purple-400" />,
            title: "Modelos Vencedores",
            desc: "Designs aprovados por recrutadores que passam fácil pelos sistemas de triagem (ATS)."
        },
        {
            icon: <PencilIcon className="w-8 h-8 text-blue-400" />,
            title: "Edição Intuitiva",
            desc: "Altere qualquer informação e veja a mágica acontecer em tempo real na sua tela."
        },
        {
            icon: <DownloadIcon className="w-8 h-8 text-green-400" />,
            title: "PDF Perfeito",
            desc: "Exporte seu currículo em alta resolução com links clicáveis, pronto para enviar."
        }
    ];

    const testimonials = [
        {
            name: "Juliana S.",
            role: "Designer de Produto",
            quote: "A ferramenta é incrível! Consegui criar um currículo visualmente impressionante em 15 minutos. Fui chamada para 3 entrevistas na mesma semana.",
            stars: 5,
        },
        {
            name: "Ricardo M.",
            role: "Engenheiro de Software",
            quote: "O modelo 'Tech' é perfeito. Minimalista, direto ao ponto e passa uma imagem super profissional. O PDF gerado é impecável.",
            stars: 5,
        },
        {
            name: "Fernanda L.",
            role: "Recém-formada em Adm.",
            quote: "Estava perdida sem saber como montar meu primeiro currículo. O CurriculumPro me guiou passo a passo e o resultado ficou melhor do que eu imaginava.",
            stars: 5,
        }
    ];
    
    return (
        <div className="flex flex-col items-center w-full overflow-x-hidden">
            <div className="absolute inset-0 -z-10 animated-gradient-bg"></div>
            
            {/* Hero Section */}
            <section className="w-full flex items-center justify-center min-h-[90vh] text-center px-4 pt-20">
                <div className="relative z-10 max-w-4xl mx-auto">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm font-bold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <SparklesIcon className="w-4 h-4 mr-2" />
                        Aprovado por +10.000 Profissionais
                    </div>
                    <div className="relative mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white leading-tight relative z-10">
                            Crie um Currículo <span className="text-blue-400">Vencedor</span>
                        </h1>
                    </div>
                    <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed font-light animate-in fade-in slide-in-from-bottom-8 duration-900">
                        A plataforma que une <span className="text-white font-semibold">Design Premium</span> e <span className="text-white font-semibold">Facilidade</span> para você conquistar a vaga dos seus sonhos.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-10 duration-1000">
                        <button 
                            onClick={() => handleAction()} 
                            className="px-8 py-4 bg-white text-slate-900 font-black text-lg rounded-full hover:bg-slate-200 transition-all shadow-[0_0_50px_-10px_rgba(255,255,255,0.4)] hover:shadow-[0_0_80px_-10px_rgba(59,130,246,0.6)] hover:scale-105 active:scale-95"
                        >
                            Começar Gratuitamente
                        </button>
                        <button
                            onClick={() => setCurrentView?.('templates')}
                            className="px-8 py-4 bg-white/10 text-white font-bold text-lg rounded-full hover:bg-white/20 transition-all border border-white/20 backdrop-blur-sm"
                        >
                            Ver Modelos
                        </button>
                    </div>
                    <p className="mt-4 text-sm text-slate-500 animate-in fade-in slide-in-from-bottom-12 duration-1000">Não precisa de cartão de crédito.</p>
                </div>
            </section>

            {/* Features Section */}
            <section className="w-full py-24 bg-slate-900/50 border-y border-white/5 section-fade-in">
                <PageWrapper>
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-white">A plataforma <span className="text-blue-400">definitiva</span> para sua carreira</h2>
                        <p className="text-slate-400 mt-4 max-w-2xl mx-auto text-lg">Tudo que você precisa para se destacar no mercado de trabalho.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {features.map((feature, index) => (
                            <div key={index} className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/80 hover:-translate-y-2 transition-all duration-300">
                                <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center mb-6 border border-slate-700">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                                <p className="text-slate-400 text-base leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </PageWrapper>
            </section>
            
             {/* Testimonials Section */}
            <section className="w-full py-24 section-fade-in">
                <PageWrapper>
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-white">O que dizem <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">nossos usuários</span></h2>
                        <p className="text-slate-400 mt-4 max-w-2xl mx-auto text-lg">Milhares de profissionais já conquistaram suas vagas dos sonhos.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((t, i) => (
                             <div key={i} className="glass rounded-2xl p-8 border border-white/10 flex flex-col">
                                 <QuoteIcon className="w-8 h-8 text-purple-400 mb-4" />
                                 <p className="text-slate-300 leading-relaxed flex-1">"{t.quote}"</p>
                                 <div className="mt-6 pt-6 border-t border-white/10">
                                     <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-white">{t.name}</p>
                                            <p className="text-sm text-slate-400">{t.role}</p>
                                        </div>
                                        <div className="flex gap-1">
                                            {[...Array(t.stars)].map((_, j) => <StarIcon key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
                                        </div>
                                     </div>
                                 </div>
                             </div>
                        ))}
                    </div>
                </PageWrapper>
            </section>

            {/* Templates Showcase */}
            <section className="w-full bg-slate-900/50 py-24 border-t border-white/5 relative overflow-hidden section-fade-in">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
                <PageWrapper>
                    <div className="flex flex-col items-center justify-center mb-16 text-center">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Modelos que <span className="text-blue-400">Conquistam</span></h2>
                        <p className="text-slate-300 max-w-2xl text-lg">Nossos templates são desenhados para passar nos sistemas de RH e impressionar recrutadores.</p>
                    </div>
                    <TemplateShowcaseCarousel onSelect={handleAction} />
                </PageWrapper>
            </section>
            
            {/* CTA Footer */}
            <section className="w-full py-24 text-center section-fade-in">
                <h2 className="text-4xl font-bold text-white mb-4">Pronto para conseguir o emprego?</h2>
                <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">Junte-se a milhares de profissionais e dê o próximo passo na sua carreira.</p>
                <button onClick={() => handleAction()} className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-full text-xl shadow-lg hover:shadow-blue-500/30 hover:scale-105 transition-all">
                    Criar Meu Currículo Agora
                </button>
            </section>
        </div>
    );
};

// Placeholder Components for secondary pages (kept simple but using new wrapper)
export const BlogPage: React.FC<PageComponentProps> = () => {
    const articles = [
        { title: "O Guia Definitivo para Vencer os Robôs (ATS) em 2025", category: "Otimização de CV", description: "Entenda como os sistemas de triagem funcionam e quais palavras-chave são essenciais para garantir que seu currículo chegue a mãos humanas." },
        { title: "Storytelling no Currículo: Como Contar sua Trajetória e Engajar Recrutadores", category: "Dicas de Carreira", description: "Vá além da lista de tarefas. Aprenda a construir uma narrativa poderosa que mostra seu impacto e sua jornada profissional." },
        { title: "5 Erros Comuns que Eliminam seu Currículo (e como evitá-los)", category: "Erros Comuns", description: "De clichês a erros de formatação, revelamos os detalhes que fazem a diferença entre o 'sim' e o 'não' na primeira triagem." }
    ];
    return (
        <PageWrapper>
            <PageHeader title="Carreira em Foco" subtitle="Dicas, tendências e segredos do mercado para você se destacar." />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((article, index) => (
                    <div key={index} className="glass p-6 rounded-2xl border border-white/10 flex flex-col hover:-translate-y-2 transition-transform duration-300">
                        <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full self-start mb-4">{article.category}</span>
                        <h3 className="text-xl font-bold text-white mb-3 flex-1">{article.title}</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-4">{article.description}</p>
                        <button className="font-semibold text-blue-400 hover:text-blue-300 self-start">Ler mais &rarr;</button>
                    </div>
                ))}
            </div>
        </PageWrapper>
    );
}

export const WorkWithUsPage: React.FC<PageComponentProps> = () => (
     <PageWrapper>
        <PageHeader title="Faça Parte da Nossa Missão" subtitle="Estamos construindo o futuro do recrutamento, um currículo de cada vez." />
         <div className="max-w-3xl mx-auto text-center glass rounded-2xl border border-white/10 p-12">
             <p className="text-gray-300 text-lg leading-relaxed mb-6">No CurriculumPro, não somos apenas uma empresa de tecnologia. Somos um time apaixonado por resolver um problema real: a desconexão entre talentos e oportunidades. Se você é criativo, proativo e acredita que a tecnologia pode empoderar pessoas, seu lugar pode ser aqui.</p>
             <h3 className="text-xl font-bold text-white mb-4">Vagas Abertas</h3>
             <p className="text-gray-400 mb-8">Nenhuma no momento, mas estamos sempre de olho em talentos excepcionais.</p>
             <p className="text-gray-300">Envie seu currículo (feito aqui, claro!) e portfólio para <a href="mailto:ruangmes159@gmail.com" className="text-blue-400 font-semibold hover:underline">ruangmes159@gmail.com</a></p>
        </div>
    </PageWrapper>
);

export const ImportLinkedInPage: React.FC<PageComponentProps> = () => (
    <PageWrapper>
        <PageHeader title="Importar do LinkedIn" subtitle="Economize tempo e traga seus dados com um clique." />
        <div className="text-center py-20 glass rounded-2xl border border-white/5">
             <h3 className="text-2xl font-bold text-white mb-4">Em Breve</h3>
             <p className="text-gray-400 max-w-md mx-auto">Estamos desenvolvendo esta funcionalidade para tornar sua vida ainda mais fácil. Exclusivo para usuários Pro.</p>
        </div>
    </PageWrapper>
);

const AccordionItem: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-gray-700 py-4">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left text-lg font-medium text-white py-2 hover:text-blue-400 transition-colors">
                <span>{title}</span>
                {isOpen ? <ChevronUpIcon className="w-5 h-5 text-blue-400" /> : <ChevronDownIcon className="w-5 h-5" />}
            </button>
            {isOpen && <div className="mt-2 text-gray-400 leading-relaxed pb-4 prose prose-invert max-w-none">{children}</div>}
        </div>
    );
}

export const FaqPage: React.FC<PageComponentProps> = ({ setCurrentView }) => (
    <PageWrapper>
        <PageHeader title="Perguntas Frequentes" subtitle="Respostas rápidas para as dúvidas mais comuns." />
        <div className="max-w-3xl mx-auto glass p-8 rounded-2xl border border-white/10">
            <AccordionItem title="Qual a diferença entre o PDF Grátis e o Pago?">
                <p>O PDF Gratuito (Demo) inclui uma marca d'água discreta. É ótimo para rascunhos e testes. O PDF Premium (pago) é 100% limpo, sem nenhuma marca, ideal para enviar para as empresas e causar a melhor impressão.</p>
            </AccordionItem>
            <AccordionItem title="O pagamento é uma assinatura?">
                <p>Não. Atualmente, oferecemos um pagamento único para cada download premium. Você paga apenas quando precisa baixar um currículo sem a marca d'água. Não há cobranças recorrentes.</p>
            </AccordionItem>
            <AccordionItem title="Meus dados estão seguros?">
                <p>Sim. A segurança dos seus dados é nossa prioridade máxima. Todas as informações são armazenadas de forma segura no seu próprio navegador (usando LocalStorage) e não são enviadas para nossos servidores, exceto no momento de gerar o PDF. Não vendemos ou compartilhamos seus dados com terceiros.</p>
            </AccordionItem>
             <AccordionItem title="Posso editar meu currículo depois?">
                <p>Com certeza! Seus currículos ficam salvos no navegador do seu dispositivo. Ao acessar o site novamente, você pode continuar de onde parou na seção "Meus Currículos".</p>
            </AccordionItem>
        </div>
    </PageWrapper>
);

export const HelpCenterPage: React.FC<PageComponentProps> = ({ setCurrentView }) => (
    <PageWrapper>
        <PageHeader title="Central de Ajuda" subtitle="Seu guia completo para o CurriculumPro." />
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
            <div onClick={() => setCurrentView?.('faq')} className="glass p-8 rounded-2xl border border-white/10 hover:border-blue-500/50 hover:-translate-y-2 transition-all cursor-pointer">
                <BookOpenIcon className="w-10 h-10 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white">FAQ</h3>
                <p className="text-gray-400 mt-2">Encontre respostas para as perguntas mais comuns.</p>
            </div>
             <div onClick={() => setCurrentView?.('contato')} className="glass p-8 rounded-2xl border border-white/10 hover:border-purple-500/50 hover:-translate-y-2 transition-all cursor-pointer">
                <LifebuoyIcon className="w-10 h-10 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white">Suporte Direto</h3>
                <p className="text-gray-400 mt-2">Fale com nossa equipe para resolver qualquer problema.</p>
            </div>
        </div>
    </PageWrapper>
);

export const SupportPage: React.FC<PageComponentProps> = () => (
    <PageWrapper>
        <PageHeader title="Suporte por E-mail" subtitle="Estamos prontos para te ajudar com qualquer questão." />
        <div className="text-center glass p-12 rounded-2xl border border-white/10 max-w-2xl mx-auto">
            <p className="text-gray-300 text-lg">Para um atendimento mais rápido, envie sua dúvida para:</p>
            <a href="mailto:ruangmes159@gmail.com" className="text-2xl font-bold text-blue-400 hover:text-blue-300 transition-colors my-4 block">ruangmes159@gmail.com</a>
            <p className="text-sm text-gray-500">Nossa equipe responde, em média, em até 24 horas úteis.</p>
        </div>
    </PageWrapper>
);

const LegalContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="prose prose-lg prose-invert max-w-none glass rounded-xl shadow-lg p-8 md:p-12 text-gray-300 border border-white/10 leading-relaxed">
        {children}
    </div>
);

export const AboutPage: React.FC<PageComponentProps> = ({ setCurrentView }) => (
    <PageWrapper>
        <PageHeader title="De Recrutador a Criador" subtitle="Nascemos da frustração para criar a solução." />
        <LegalContent>
            <h2>Nossa História</h2>
            <p>Meu nome é Francisco Ruan. Por mais de uma década, estive do outro lado da mesa, como recrutador em grandes empresas de tecnologia. Vi incontáveis currículos e, com o tempo, uma verdade dolorosa se tornou clara: talentos incríveis eram descartados antes mesmo de terem a chance de uma entrevista.</p>
            <p>O culpado? Robôs. Softwares de triagem (ATS) que eliminavam candidatos por causa de formatação inadequada, palavras-chave ausentes ou layouts que não eram 'amigáveis' para o sistema.</p>
            <blockquote>Cansado de ver profissionais brilhantes perdendo oportunidades por detalhes que nada diziam sobre sua competência, decidi agir.</blockquote>
            <p>O CurriculumPro não é apenas um construtor de currículos; é a minha missão de devolver o poder ao candidato. É uma ferramenta construída com o conhecimento de quem já esteve lá dentro, projetada para que sua história — e não um algoritmo — seja o que realmente importa. Nosso objetivo é simples: criar o caminho mais rápido e bonito entre seu talento e a vaga dos seus sonhos.</p>
        </LegalContent>
    </PageWrapper>
);

export const ContactPage: React.FC<PageComponentProps> = ({ setCurrentView }) => {
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            addToast("Mensagem enviada com sucesso!", "success");
            (e.target as HTMLFormElement).reset();
        }, 1500);
    };

    return (
        <PageWrapper>
            <PageHeader title="Vamos Conversar" subtitle="Sua opinião é o que nos move. Para dúvidas, sugestões ou parcerias, use os canais abaixo." />
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                <div className="glass p-8 rounded-2xl border border-white/10">
                     <h3 className="text-2xl font-bold text-white mb-4">Envie uma Mensagem</h3>
                     <form className="space-y-6" onSubmit={handleSubmit}>
                        <input name="name" type="text" placeholder="Seu Nome" required className="w-full p-3 rounded bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                        <input name="email" type="email" placeholder="Seu Email" required className="w-full p-3 rounded bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                        <textarea name="message" placeholder="Sua mensagem..." rows={5} required className="w-full p-3 rounded bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
                        <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-70">
                            {isLoading ? "Enviando..." : "Enviar Mensagem"}
                        </button>
                     </form>
                </div>
                 <div className="space-y-8">
                    <div className="text-white">
                        <h4 className="font-bold text-lg mb-2">Uma mensagem do fundador:</h4>
                        <p className="text-gray-400 italic">"Olá! Sou Francisco Ruan. Se tiver qualquer problema ou uma ideia para melhorar nossa plataforma, quero muito ouvir. Minha equipe e eu lemos todas as mensagens."</p>
                    </div>
                    <div className="text-white">
                        <h4 className="font-bold text-lg mb-2">Contato Direto</h4>
                        <p className="text-gray-400">Para todas as questões (suporte, parcerias, imprensa), envie um e-mail para:</p>
                        <a href="mailto:ruangmes159@gmail.com" className="text-blue-400 hover:underline font-semibold">ruangmes159@gmail.com</a>
                    </div>
                     <div className="text-white">
                        <h4 className="font-bold text-lg mb-2">Endereço</h4>
                        <p className="text-gray-400">Av. Faria Lima, 400, São Paulo - SP</p>
                        <p className="text-xs text-gray-500">(Escritório Virtual)</p>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

export const TermsPage: React.FC<PageComponentProps> = () => (
    <PageWrapper>
        <PageHeader title="Termos de Uso" subtitle="Última atualização: 24 de Julho de 2024" />
        <LegalContent>
            <h2>1. Aceitação dos Termos</h2>
            <p>Ao acessar e utilizar a plataforma CurriculumPro ("Serviço"), você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com estes termos, não deverá utilizar o Serviço.</p>
            <h2>2. Uso do Serviço</h2>
            <p>O CurriculumPro fornece uma ferramenta para criação de currículos. Você é responsável por todo o conteúdo que insere. O uso do serviço para fins ilegais ou não autorizados é estritamente proibido.</p>
            <h2>3. Pagamentos e Acesso Premium</h2>
            <p>Oferecemos um modelo de pagamento único ("pay-per-download") para acesso a recursos premium, como a remoção de marca d'água. Não operamos com assinaturas ou cobranças recorrentes. Todos os pagamentos são processados por gateways seguros e não armazenamos suas informações de cartão de crédito.</p>
        </LegalContent>
    </PageWrapper>
);

export const PrivacyPolicyPage: React.FC<PageComponentProps> = () => (
    <PageWrapper>
        <PageHeader title="Política de Privacidade" subtitle="Sua confiança é a nossa prioridade." />
        <LegalContent>
            <h2>1. Coleta de Dados</h2>
            <p><strong>Dados do Currículo:</strong> Todas as informações que você insere (nome, experiência, etc.) são armazenadas localmente no seu navegador (`LocalStorage`). Esses dados não são enviados ou armazenados em nossos servidores, exceto temporariamente durante o processo de geração do PDF, sendo descartados logo após.</p>
            <p><strong>Dados de Pagamento:</strong> Seu e-mail é coletado durante o processo de pagamento para verificação de status e envio de recibo. Não coletamos ou armazenamos números de cartão de crédito; todo o processamento é feito por nosso parceiro de pagamentos, que é compatível com PCI.</p>
            <h2>2. Uso dos Dados</h2>
            <p>Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros para fins de marketing. Usamos seu e-mail apenas para comunicações essenciais relacionadas ao serviço, como confirmação de pagamento e suporte.</p>
        </LegalContent>
    </PageWrapper>
);

export const CookiePolicyPage: React.FC<PageComponentProps> = () => (
    <PageWrapper>
        <PageHeader title="Política de Cookies" subtitle="Como usamos cookies para melhorar sua experiência." />
        <LegalContent>
            <p>Utilizamos apenas cookies essenciais e de performance. Eles nos ajudam a entender como o site é usado (de forma anônima) e a manter funcionalidades básicas, como lembrar se você já viu nosso tour de boas-vindas. Não usamos cookies de publicidade ou rastreamento de terceiros.</p>
        </LegalContent>
    </PageWrapper>
);

export const DataRequestPage: React.FC<PageComponentProps> = () => (
    <PageWrapper>
        <PageHeader title="Solicitação de Dados (LGPD)" subtitle="Você no controle das suas informações." />
        <LegalContent>
            <p>Em conformidade com a Lei Geral de Proteção de Dados (LGPD), você tem o direito de solicitar acesso, correção ou exclusão de seus dados pessoais. Como a maioria dos dados do seu currículo é armazenada localmente, você pode simplesmente limpar o cache do seu navegador.</p>
            <p>Para quaisquer dados que possamos ter armazenado (como seu e-mail de um pagamento), envie uma solicitação para nosso Encarregado de Proteção de Dados (DPO) através do e-mail: <a href="mailto:ruangmes159@gmail.com" className="text-blue-400">ruangmes159@gmail.com</a>.</p>
        </LegalContent>
    </PageWrapper>
);