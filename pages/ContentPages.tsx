import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '../components/Toast';
import { TemplateThumbnails } from '../components/TemplateThumbnails';
import { 
    PencilIcon, TrashIcon, DuplicateIcon, PlusIcon, CheckIcon,
    ChevronDownIcon, ChevronUpIcon, SparklesIcon, DocumentTextIcon, DownloadIcon, UserIcon, BriefcaseIcon, QuoteIcon,
    StarIcon, ShieldCheckIcon, BookOpenIcon, LifebuoyIcon, XMarkIcon
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

// ==================== HELPER COMPONENTS FOR CAROUSEL ====================

const MiniResumeVisual: React.FC<{ type: 'creative' | 'executive' | 'modern' | 'classic' | 'tech' }> = ({ type }) => {
    // High-fidelity realistic mini document preview
    if (type === 'creative') {
        return (
            <div className="w-full h-full bg-white flex flex-col text-slate-800 select-none overflow-hidden font-sans">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-violet-600 p-2.5 text-white relative">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-white/20 border border-white/40 flex items-center justify-center font-bold text-[8px] text-white">
                            MS
                        </div>
                        <div>
                            <div className="font-extrabold text-[9px] tracking-tight leading-none">MARIA SILVA</div>
                            <div className="text-[5.5px] font-medium text-purple-200 tracking-wider uppercase mt-0.5">Senior UX / Product Designer</div>
                        </div>
                    </div>
                    <div className="mt-1.5 flex gap-2 text-[4.5px] text-purple-200">
                        <span>São Paulo, SP</span>
                        <span>•</span>
                        <span>maria.design@email.com</span>
                        <span>•</span>
                        <span>linkedin.com/in/mariaux</span>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 p-2.5 flex gap-2.5 bg-slate-50/50">
                    <div className="flex-1 space-y-2">
                        <div>
                            <div className="text-[6px] font-bold uppercase text-purple-800 tracking-wider mb-1 border-b border-purple-200 pb-0.5">
                                Experiência Profissional
                            </div>
                            <div className="space-y-1.5">
                                <div>
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-[6px] font-bold text-slate-900">Lead Product Designer • FinTech</span>
                                        <span className="text-[4.5px] text-slate-500 font-medium">2022 - Atual</span>
                                    </div>
                                    <div className="text-[5px] text-slate-600 leading-tight mt-0.5">
                                        Liderança do Design System com +120 componentes. Redesenho de onboarding aumentando conversão em +32%.
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-[6px] font-bold text-slate-900">Product Designer • E-commerce</span>
                                        <span className="text-[4.5px] text-slate-500 font-medium">2020 - 2022</span>
                                    </div>
                                    <div className="text-[5px] text-slate-600 leading-tight mt-0.5">
                                        Pesquisa de usabilidade com 50+ usuários e testes A/B no checkout mobile.
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="text-[6px] font-bold uppercase text-purple-800 tracking-wider mb-1 border-b border-purple-200 pb-0.5">
                                Formação Acadêmica
                            </div>
                            <div className="text-[5.5px] font-semibold text-slate-900">Bacharelado em Design Digital</div>
                            <div className="text-[4.5px] text-slate-500">Universidade de São Paulo (USP) • 2016 - 2020</div>
                        </div>
                    </div>

                    <div className="w-[35%] space-y-2 border-l border-slate-200 pl-2">
                        <div>
                            <div className="text-[6px] font-bold uppercase text-purple-800 tracking-wider mb-1">
                                Habilidades
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {['Figma', 'Design System', 'UX Research', 'Prototipagem', 'Design Ops', 'User Testing'].map(s => (
                                    <span key={s} className="px-1 py-0.5 rounded bg-purple-100/80 text-purple-800 text-[4px] font-bold">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="text-[6px] font-bold uppercase text-purple-800 tracking-wider mb-1">
                                Idiomas
                            </div>
                            <div className="text-[4.5px] text-slate-700 space-y-0.5">
                                <div className="flex justify-between"><span>Português</span><span className="font-bold">Nativo</span></div>
                                <div className="flex justify-between"><span>Inglês</span><span className="font-bold">Fluente (C1)</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (type === 'modern') {
        return (
            <div className="w-full h-full bg-white flex text-slate-800 select-none overflow-hidden font-sans">
                {/* Dark Sidebar */}
                <div className="w-[34%] bg-slate-900 text-slate-200 p-2.5 flex flex-col justify-between">
                    <div className="space-y-2.5">
                        <div className="text-center">
                            <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-400/40 text-blue-300 mx-auto flex items-center justify-center font-bold text-[8px] mb-1">
                                JS
                            </div>
                            <div className="text-[8px] font-bold text-white tracking-tight leading-none">JOÃO SOUZA</div>
                            <div className="text-[4.5px] text-blue-400 uppercase tracking-widest mt-0.5 font-medium">Tech Lead / Full Stack</div>
                        </div>

                        <div className="space-y-1 text-[4.5px] text-slate-400 border-t border-slate-800 pt-1.5">
                            <div>📍 São Paulo - Brasil</div>
                            <div>✉️ joao.dev@email.com</div>
                            <div>🔗 github.com/joaosouza</div>
                        </div>

                        <div className="space-y-1">
                            <div className="text-[5.5px] font-bold text-blue-400 uppercase tracking-wider">Stack Técnica</div>
                            <div className="flex flex-wrap gap-0.5">
                                {['React', 'TypeScript', 'Node.js', 'Go', 'AWS', 'Docker', 'Postgres'].map(t => (
                                    <span key={t} className="bg-slate-800 border border-slate-700 text-slate-300 text-[4px] px-1 py-0.5 rounded">
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="text-[4px] text-slate-500 border-t border-slate-800 pt-1">
                        ATS Optimized • Gupy & Workday
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-2.5 space-y-2 bg-white">
                    <div>
                        <div className="text-[6.5px] font-bold uppercase text-slate-900 tracking-wider mb-1 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block"></span>
                            Experiência Profissional
                        </div>
                        <div className="space-y-1.5 pl-2 border-l border-blue-200">
                            <div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-[6px] font-bold text-slate-900">Tech Lead • Banco Digital</span>
                                    <span className="text-[4.5px] text-blue-600 font-bold">2022 - Atual</span>
                                </div>
                                <div className="text-[5px] text-slate-600 leading-tight mt-0.5">
                                    Arquitetura de microsserviços suportando 4M transações diárias com 99.99% disponibilidade.
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-[6px] font-bold text-slate-900">Engenheiro Sênior • SaaS Global</span>
                                    <span className="text-[4.5px] text-slate-500 font-bold">2019 - 2022</span>
                                </div>
                                <div className="text-[5px] text-slate-600 leading-tight mt-0.5">
                                    Redução de latência de API em 45% e liderança de mentoria técnica para 6 devs.
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="text-[6.5px] font-bold uppercase text-slate-900 tracking-wider mb-1 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block"></span>
                            Formação & Certificações
                        </div>
                        <div className="pl-2 border-l border-blue-200 space-y-0.5">
                            <div className="text-[5.5px] font-bold text-slate-900">Ciência da Computação — UNICAMP</div>
                            <div className="text-[4.5px] text-slate-500">AWS Certified Solutions Architect (2023)</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (type === 'tech') {
        return (
            <div className="w-full h-full bg-[#0b1120] text-slate-200 flex flex-col text-[4.5px] select-none overflow-hidden font-mono p-2.5">
                <div className="border-b border-emerald-500/30 pb-1.5 mb-1.5 flex justify-between items-end">
                    <div>
                        <div className="text-[8px] font-black text-emerald-400 leading-none">RAFAEL LIMA</div>
                        <div className="text-[5px] text-slate-400 mt-0.5">Senior DevOps & Cloud Architect</div>
                    </div>
                    <div className="text-[4px] text-emerald-400/80 bg-emerald-950/60 px-1 py-0.5 rounded border border-emerald-500/20">
                        {`>_ ATS 99.4%`}
                    </div>
                </div>

                <div className="space-y-1.5 flex-1">
                    <div>
                        <div className="text-emerald-400 font-bold text-[5.5px] mb-0.5">## Experiência Recente</div>
                        <div className="space-y-1 pl-1.5 border-l border-emerald-500/40">
                            <div>
                                <div className="text-slate-100 font-bold text-[5.5px]">Cloud Architect @ Nubank (2021 - Presente)</div>
                                <div className="text-slate-400 text-[4.5px]">Migração multi-cloud Kubernetes, reduzindo custos de infra em 38%.</div>
                            </div>
                            <div>
                                <div className="text-slate-100 font-bold text-[5.5px]">DevOps Engineer @ Stone (2018 - 2021)</div>
                                <div className="text-slate-400 text-[4.5px]">Implementação de CI/CD automatizado reduzindo tempo de release em 80%.</div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="text-emerald-400 font-bold text-[5.5px] mb-0.5">## Tecnologias</div>
                        <div className="flex flex-wrap gap-1">
                            {['Terraform', 'Kubernetes', 'AWS', 'GCP', 'Docker', 'Linux', 'Go', 'Prometheus'].map(i => (
                                <span key={i} className="px-1 py-0.2 rounded bg-slate-800 text-cyan-300 border border-slate-700 text-[4px]">
                                    {i}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Default: Executive / Classic Luxury
    return (
        <div className="w-full h-full bg-white p-3 flex flex-col text-slate-900 select-none overflow-hidden relative font-serif">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900"></div>
            
            <div className="text-center mb-2 mt-1 border-b border-slate-300 pb-1.5">
                <div className="text-[8.5px] font-black tracking-wide text-slate-900 uppercase">CARLOS MENDES</div>
                <div className="text-[5px] text-blue-900 font-sans font-bold tracking-widest uppercase mt-0.5">
                    DIRETOR DE OPERAÇÕES & SCALE-UPS
                </div>
                <div className="text-[4px] text-slate-500 font-sans mt-0.5 flex justify-center gap-2">
                    <span>São Paulo, Brasil</span>
                    <span>•</span>
                    <span>carlos.mendes@exec.com</span>
                    <span>•</span>
                    <span>+55 11 99887-6655</span>
                </div>
            </div>

            <div className="space-y-2 flex-1 font-sans">
                <div>
                    <div className="font-serif font-bold text-[5.5px] uppercase tracking-wider text-blue-950 border-b border-blue-900/30 pb-0.5 mb-1">
                        Resumo Executivo
                    </div>
                    <p className="text-[4.8px] text-slate-700 leading-relaxed">
                        Líder sênior com 12+ anos em expansão operacional, governança corporativa e gestão de P&L de R$ 120M+. Histórico comprovado de estruturação de equipes de alta performance.
                    </p>
                </div>

                <div>
                    <div className="font-serif font-bold text-[5.5px] uppercase tracking-wider text-blue-950 border-b border-blue-900/30 pb-0.5 mb-1">
                        Histórico Profissional
                    </div>
                    <div className="space-y-1">
                        <div>
                            <div className="flex justify-between items-baseline font-bold text-[5.5px] text-slate-900">
                                <span>Chief Operating Officer (COO) — LogTech Brasil</span>
                                <span className="text-[4.5px] text-slate-500 font-medium">2021 - Presente</span>
                            </div>
                            <div className="text-[4.8px] text-slate-600 leading-tight mt-0.5">
                                Expansão para 18 capitais brasileiras, crescendo receita anual em +140% e liderando equipe de 240 pessoas.
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-baseline font-bold text-[5.5px] text-slate-900">
                                <span>Diretor de Operações — Retail Tech</span>
                                <span className="text-[4.5px] text-slate-500 font-medium">2017 - 2021</span>
                            </div>
                            <div className="text-[4.8px] text-slate-600 leading-tight mt-0.5">
                                Redução de custos logísticos em 24% e implementação de metodologias ágeis em toda a organização.
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="font-serif font-bold text-[5.5px] uppercase tracking-wider text-blue-950 border-b border-blue-900/30 pb-0.5 mb-1">
                        Formação Acadêmica & Board
                    </div>
                    <div className="text-[5px] text-slate-800">
                        <span className="font-bold">MBA Executivo Global</span> — FGV & Insead (2018)
                    </div>
                </div>
            </div>
        </div>
    );
};

const TemplateShowcaseCarousel: React.FC<{ onSelect: (t: TemplateOption) => void }> = ({ onSelect }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 340;
            scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    const templates: { id: TemplateOption; name: string; tag: string; tagColor: string; desc: string; component: React.ReactNode }[] = [
        { 
            id: 'modern', 
            name: 'Moderno Tech', 
            tag: 'Mais Usado', 
            tagColor: 'from-blue-500 to-cyan-500', 
            desc: 'Barra lateral de destaque, ideal para Tech, Produto e Inovação.', 
            component: <MiniResumeVisual type="modern" /> 
        },
        { 
            id: 'executive', 
            name: 'Executivo Luxo', 
            tag: 'Alta Gestão', 
            tagColor: 'from-amber-500 to-yellow-500', 
            desc: 'Serifa refinada e estrutura imponente para gerentes, diretores e C-level.', 
            component: <MiniResumeVisual type="executive" /> 
        },
        { 
            id: 'tech', 
            name: 'Dev & Dark Mode', 
            tag: 'ATS 99%', 
            tagColor: 'from-emerald-500 to-teal-500', 
            desc: 'Visual terminal moderno para programadores, DevOps e cientistas de dados.', 
            component: <MiniResumeVisual type="tech" /> 
        },
        { 
            id: 'creative', 
            name: 'Criativo Studio', 
            tag: 'Design & Mkt', 
            tagColor: 'from-purple-500 to-pink-500', 
            desc: 'Gradientes modernos e chips de skills para quem quer brilhar visualmente.', 
            component: <MiniResumeVisual type="creative" /> 
        },
        { 
            id: 'classic', 
            name: 'Clássico Tradicional', 
            tag: 'Universal', 
            tagColor: 'from-slate-600 to-slate-700', 
            desc: 'Formatação padrão global que passa sem atrito em qualquer sistema de RH.', 
            component: <MiniResumeVisual type="classic" /> 
        },
    ];

    return (
        <div className="relative w-full max-w-7xl mx-auto px-2 sm:px-4">
            {/* Scroll Navigation Arrows */}
            <button 
                onClick={() => scroll('left')} 
                className="absolute -left-2 sm:left-2 top-1/2 -translate-y-1/2 z-30 p-3 bg-slate-900/90 text-white rounded-full hover:bg-blue-600 hover:scale-110 transition-all hidden md:flex border border-slate-700 shadow-2xl backdrop-blur-md"
                aria-label="Anterior"
            >
                <ChevronDownIcon className="w-5 h-5 rotate-90" />
            </button>
            <button 
                onClick={() => scroll('right')} 
                className="absolute -right-2 sm:right-2 top-1/2 -translate-y-1/2 z-30 p-3 bg-slate-900/90 text-white rounded-full hover:bg-blue-600 hover:scale-110 transition-all hidden md:flex border border-slate-700 shadow-2xl backdrop-blur-md"
                aria-label="Próximo"
            >
                <ChevronDownIcon className="w-5 h-5 -rotate-90" />
            </button>

            <div 
                ref={scrollRef}
                className="flex gap-6 sm:gap-8 overflow-x-auto snap-x snap-mandatory py-8 px-2 sm:px-6 hide-scrollbar"
                style={{ scrollPaddingLeft: '16px' }}
            >
                {templates.map((t) => (
                    <div key={t.id} className="snap-center shrink-0 w-[270px] sm:w-[310px] group relative select-none">
                        {/* Glow on hover */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 rounded-2xl opacity-0 group-hover:opacity-100 blur-lg transition duration-500"></div>

                        {/* Card Container */}
                        <div 
                            className="relative bg-white rounded-2xl shadow-2xl aspect-[210/297] transform transition-all duration-300 ease-out group-hover:scale-[1.02] group-hover:-translate-y-1.5 z-10 cursor-pointer overflow-hidden border border-slate-700/40"
                            onClick={() => onSelect(t.id)}
                        >
                            {/* The Real Visual Content */}
                            <div className="absolute inset-0 pointer-events-none">
                                {t.component}
                            </div>
                            
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-slate-950/85 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase text-white bg-gradient-to-r ${t.tagColor} mb-2`}>
                                    {t.tag}
                                </span>
                                <h3 className="text-xl font-bold text-white mb-2">{t.name}</h3>
                                <p className="text-xs text-slate-300 mb-6 leading-relaxed">{t.desc}</p>
                                <button className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/40 flex items-center gap-2 transform group-hover:scale-105 transition-transform">
                                    <SparklesIcon className="w-4 h-4 text-blue-200" />
                                    <span>Usar este Modelo</span>
                                </button>
                            </div>
                        </div>

                        {/* Floating Pill Tag */}
                        <div className="absolute top-3 right-3 z-20">
                            <span className={`bg-gradient-to-r ${t.tagColor} text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-xl border border-white/20 uppercase tracking-wider`}>
                                {t.tag}
                            </span>
                        </div>

                        {/* Footer Card Info */}
                        <div className="mt-3 flex items-center justify-between px-1">
                            <div>
                                <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{t.name}</h4>
                                <p className="text-[11px] text-slate-400">100% Otimizado para ATS</p>
                            </div>
                            <button 
                                onClick={() => onSelect(t.id)}
                                className="text-xs font-bold text-blue-400 group-hover:text-white flex items-center gap-1 transition-colors"
                            >
                                <span>Escolher</span>
                                <span>→</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Status Line */}
            <div className="mt-4 text-center">
                <p className="text-xs sm:text-sm text-slate-400">
                    💡 <span className="text-slate-300 font-semibold">Dica de Recrutador:</span> Todos os modelos são formatados semanticamente para passar nos robôs da <span className="text-white font-bold">Gupy, Workday, Kenoby e Taleo</span> sem distorção.
                </p>
            </div>
        </div>
    );
};

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
             <div className="mt-10 text-center">
                <button 
                    onClick={handleConfirm} 
                    className="group px-10 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-extrabold text-base rounded-2xl shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 transition-all duration-200 transform hover:-translate-y-0.5 active:scale-95 inline-flex items-center justify-center gap-2.5"
                >
                    <SparklesIcon className="w-5 h-5 text-blue-200" />
                    <span>Usar Este Modelo no Editor</span>
                    <span className="text-blue-200 group-hover:translate-x-1 transition-transform">→</span>
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
    const [showModeModal, setShowModeModal] = useState(false);

    const handleAction = (template?: TemplateOption) => {
        if (template && onApplyTemplate) {
            onApplyTemplate(template);
        } else {
            setShowModeModal(true);
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

    const testimonials = [
        {
            name: "Juliana Silveira",
            role: "Senior Product Designer",
            company: "Contratada no Nubank",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
            quote: "Depois de meses enviando currículos feitos no Word sem resposta, refiz o meu no CurriculumPro. Em 12 dias recebi 3 convites de entrevista e fui contratada como Senior.",
            stars: 5,
        },
        {
            name: "Ricardo Mendonça",
            role: "Tech Lead & Full Stack",
            company: "Aprovado na Stone",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            quote: "O modelo 'Dev & Dark Mode' é simplesmente impecável. Ele destaca o stack de tecnologias e métricas sem poluição visual. Passou direto na triagem da Gupy.",
            stars: 5,
        },
        {
            name: "Fernanda Lemos",
            role: "Gerente de Operações",
            company: "Contratada no Mercado Livre",
            avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
            quote: "A facilidade de omitir campos vazios automaticamente e arrastar seções é genial. O PDF final gerado é de qualidade de agência de design.",
            stars: 5,
        }
    ];

    const topCompanies = [
        "Nubank", "Google", "Itaú", "Mercado Livre", "Amazon", "Embraer", "Stone", "Accenture"
    ];

    return (
        <div className="flex flex-col items-center w-full min-h-screen overflow-x-hidden bg-[#090d16] text-slate-100 selection:bg-blue-600 selection:text-white relative">
            {/* Ambient Background Lights on Dark Base */}
            <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden bg-[#090d16]">
                <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-blue-600/20 via-indigo-600/15 to-transparent blur-[140px] rounded-full"></div>
                <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-purple-600/15 blur-[130px] rounded-full"></div>
                <div className="absolute top-[70%] left-[-10%] w-[600px] h-[600px] bg-cyan-600/15 blur-[140px] rounded-full"></div>
            </div>

            {/* ==================== HERO SECTION ==================== */}
            <section className="w-full flex flex-col items-center justify-center pt-16 sm:pt-24 pb-20 px-4 text-center relative z-10">
                <div className="max-w-5xl mx-auto flex flex-col items-center">
                    {/* Announcement Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/95 border border-blue-500/40 text-blue-300 text-xs sm:text-sm font-semibold mb-8 shadow-xl shadow-blue-500/10 backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-500 hover:border-blue-400 transition-colors">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        <span>Motor ATS 2025: 100% Otimizado para Gupy, Workday & Taleo</span>
                        <span className="text-blue-400 font-bold ml-1">→</span>
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tight text-white leading-[1.08] max-w-4xl drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-bottom-5 duration-700">
                        O currículo que te coloca na{' '}
                        <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(59,130,246,0.35)]">
                            frente de 98% dos candidatos.
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="mt-6 text-base sm:text-xl md:text-2xl text-slate-200 max-w-3xl leading-relaxed font-normal animate-in fade-in slide-in-from-bottom-6 duration-800 drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
                        Crie em minutos um currículo executivo e moderno. Formatação automática validada por recrutadores, prévia visual em tempo real e exportação em PDF vetorial impecável.
                    </p>

                    {/* CTAs */}
                    <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-7 duration-900">
                        <button 
                            onClick={() => setCurrentView?.('wizard')} 
                            className="group relative w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-4.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-extrabold text-base sm:text-lg rounded-2xl shadow-2xl shadow-blue-600/50 hover:shadow-blue-600/70 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
                        >
                            <SparklesIcon className="w-5 h-5 text-blue-200 animate-pulse" />
                            <span>Criar com Assistente Guiado</span>
                            <span className="text-blue-200 group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                        
                        <button
                            onClick={() => handleAction()}
                            className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-base sm:text-lg rounded-2xl transition-all duration-300 border border-slate-600 hover:border-slate-500 shadow-lg flex items-center justify-center gap-2"
                        >
                            <span>Ver Opções & Modelos</span>
                        </button>
                    </div>

                    {/* Trust Indicators */}
                    <div className="mt-6 flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-xs text-slate-300 font-medium">
                        <span className="flex items-center gap-1.5"><CheckIcon className="w-4 h-4 text-emerald-400" /> Sem cadastro prévio</span>
                        <span className="flex items-center gap-1.5"><CheckIcon className="w-4 h-4 text-emerald-400" /> 100% Grátis para criar</span>
                        <span className="flex items-center gap-1.5"><CheckIcon className="w-4 h-4 text-emerald-400" /> Dados seguros no seu navegador</span>
                    </div>

                    {/* ==================== HERO SHOWCASE MOCKUP (THE PRODUCT IN ACTION) ==================== */}
                    <div className="mt-14 sm:mt-18 w-full max-w-4xl mx-auto relative group">
                        {/* Dramatic Glow behind window */}
                        <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/30 via-indigo-600/25 to-cyan-500/30 rounded-3xl blur-2xl opacity-60 group-hover:opacity-90 transition duration-700"></div>

                        {/* Simulated App Window */}
                        <div className="relative rounded-2xl sm:rounded-3xl border border-slate-700/80 bg-slate-950/90 shadow-2xl shadow-black/80 overflow-hidden backdrop-blur-xl">
                            {/* Window Header */}
                            <div className="h-10 sm:h-12 bg-slate-900/90 border-b border-slate-800 px-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                                    <span className="ml-3 text-[11px] font-mono text-slate-400 hidden sm:inline">
                                        curriculo_executivo_2025.pdf
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                        ● ATS MATCH 99%
                                    </span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 hidden sm:inline">
                                        A4 • 300 DPI
                                    </span>
                                </div>
                            </div>

                            {/* Window Canvas: The Real Executive Resume Mockup */}
                            <div className="p-4 sm:p-10 bg-slate-900/50 flex justify-center relative overflow-hidden">
                                <div className="w-full max-w-2xl bg-white text-slate-900 rounded-xl shadow-2xl p-6 sm:p-10 text-left font-sans border border-slate-200 select-none">
                                    {/* Document Header */}
                                    <div className="border-b border-slate-200 pb-5 mb-5 flex flex-col sm:flex-row justify-between items-start gap-4">
                                        <div>
                                            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                                                Lucas M. Mendonça
                                            </h2>
                                            <p className="text-xs sm:text-sm font-bold text-blue-600 tracking-wide uppercase mt-0.5">
                                                Tech Lead & Engenheiro de Software Sênior
                                            </p>
                                        </div>
                                        <div className="text-[11px] sm:text-xs text-slate-500 space-y-1 sm:text-right">
                                            <div>📍 São Paulo - SP</div>
                                            <div>✉️ lucas.mendonca@email.com</div>
                                            <div>🔗 linkedin.com/in/lucas-tech</div>
                                        </div>
                                    </div>

                                    {/* Document Summary */}
                                    <div className="mb-5">
                                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded bg-blue-600 inline-block"></span>
                                            Resumo Profissional
                                        </h3>
                                        <p className="text-xs text-slate-600 leading-relaxed">
                                            Profissional de tecnologia com 8+ anos liderando desenvolvimento de plataformas distribuídas de alta escala. Especialista em microsserviços na nuvem, liderança de equipes ágeis e arquitetura de software de alta resiliência.
                                        </p>
                                    </div>

                                    {/* Document Experience */}
                                    <div className="mb-5">
                                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded bg-blue-600 inline-block"></span>
                                            Experiência Relevante
                                        </h3>
                                        <div className="space-y-3.5 pl-3 border-l-2 border-blue-500/40">
                                            <div>
                                                <div className="flex justify-between items-baseline">
                                                    <span className="text-xs sm:text-sm font-bold text-slate-900">Tech Lead • FinTech Global</span>
                                                    <span className="text-[11px] font-bold text-blue-600">2022 - Presente</span>
                                                </div>
                                                <ul className="text-xs text-slate-600 mt-1 space-y-1 list-disc list-inside">
                                                    <li>Liderou esquadrão de 14 engenheiros mantendo 99.99% de disponibilidade em 6M+ requisições/dia.</li>
                                                    <li>Otimizou infraestrutura AWS reduzindo custos operacionais em 34% em 6 meses.</li>
                                                </ul>
                                            </div>
                                            <div>
                                                <div className="flex justify-between items-baseline">
                                                    <span className="text-xs sm:text-sm font-bold text-slate-900">Engenheiro Sênior • E-commerce Líder</span>
                                                    <span className="text-[11px] font-bold text-slate-500">2019 - 2022</span>
                                                </div>
                                                <ul className="text-xs text-slate-600 mt-1 space-y-1 list-disc list-inside">
                                                    <li>Redesenhou pipeline de checkout mobile aumentando taxa de conversão final em +18%.</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Document Skills */}
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded bg-blue-600 inline-block"></span>
                                            Habilidades & Tecnologias
                                        </h3>
                                        <div className="flex flex-wrap gap-1.5">
                                            {['React', 'TypeScript', 'Node.js', 'Go', 'AWS Cloud', 'Kubernetes', 'Docker', 'PostgreSQL', 'Microservices', 'Scrum / Kanban'].map(s => (
                                                <span key={s} className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-semibold border border-slate-200">
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Glass Badge 1 - ATS Match */}
                                <div className="absolute top-6 right-4 sm:right-12 glass p-3 sm:p-4 rounded-2xl border border-emerald-500/40 bg-slate-950/90 shadow-2xl backdrop-blur-2xl flex items-center gap-3 animate-bounce duration-1000">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-sm">
                                        99%
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs font-black text-white">ATS Compatível</div>
                                        <div className="text-[10px] text-emerald-400 font-medium">Aprovado na Gupy & Workday</div>
                                    </div>
                                </div>

                                {/* Floating Glass Badge 2 - PDF Vetorial */}
                                <div className="absolute bottom-6 left-4 sm:left-12 glass p-3 sm:p-4 rounded-2xl border border-blue-500/40 bg-slate-950/90 shadow-2xl backdrop-blur-2xl flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                                        <DownloadIcon className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs font-black text-white">PDF Vetorial HD</div>
                                        <div className="text-[10px] text-slate-400">Links clicáveis e textos nítidos</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ==================== TRUST / COMPANIES BAR ==================== */}
            <section className="w-full py-12 border-y border-slate-800/80 bg-slate-950/60 section-fade-in">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-500 mb-6">
                        Candidatos que usam o CurriculumPro já foram contratados em:
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 opacity-75">
                        {topCompanies.map((company) => (
                            <span key={company} className="text-base sm:text-xl font-bold tracking-tight text-slate-400 hover:text-white transition-colors duration-200">
                                {company}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ==================== TEMPLATES SHOWCASE ==================== */}
            <section className="w-full py-20 sm:py-28 relative section-fade-in">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
                        <span className="text-xs font-extrabold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                            Coleção Executiva 2025
                        </span>
                        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-3">
                            Modelos desenhados para <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">impressionar</span>
                        </h2>
                        <p className="text-slate-400 mt-4 text-base sm:text-lg">
                            Cada modelo foi estruturado milimetricamente para destacar seus diferenciais e passar sem atrito pelos robôs de triagem.
                        </p>
                    </div>

                    <TemplateShowcaseCarousel onSelect={handleAction} />
                </div>
            </section>

            {/* ==================== BENTO GRID FEATURES ==================== */}
            <section className="w-full py-20 sm:py-28 bg-slate-950/60 border-y border-slate-800/80 section-fade-in relative">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                            Por que somos superiores
                        </span>
                        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-3">
                            Tecnologia que coloca sua carreira em outro nível
                        </h2>
                        <p className="text-slate-400 mt-4 text-base sm:text-lg">
                            Tudo foi pensado para que você passe mais tempo treinando para entrevistas e zero tempo brigando com formatação.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Bento Card 1 - ATS Focus (Large 2 Columns) */}
                        <div className="md:col-span-2 rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-blue-500/50 transition-all duration-300 relative overflow-hidden group shadow-xl">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-all"></div>
                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-6">
                                    <ShieldCheckIcon className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                                    Arquitetura Semântica Anti-Descarte ATS
                                </h3>
                                <p className="text-slate-400 leading-relaxed max-w-xl text-sm sm:text-base">
                                    Mais de 75% dos currículos são rejeitados por robôs de triagem (Gupy, Workday, Taleo) antes mesmo de serem lidos por uma pessoa. Nossa tecnologia estrutura cabeçalhos, tags e fontes para leitura robótica 100% perfeita.
                                </p>
                                <div className="mt-8 flex flex-wrap gap-2 text-xs font-bold text-blue-300">
                                    <span className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20">Gupy Ready</span>
                                    <span className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20">Workday Compliant</span>
                                    <span className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20">Taleo Parser</span>
                                </div>
                            </div>
                        </div>

                        {/* Bento Card 2 - Visual Live Editor */}
                        <div className="rounded-3xl p-8 bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 relative overflow-hidden group shadow-xl">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-6">
                                <PencilIcon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
                                Edição Visual em Tempo Real
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Esqueça adivinhações. Cada letra digitada ou cor alterada reflete instantaneamente no layout final com paginação precisa.
                            </p>
                        </div>

                        {/* Bento Card 3 - Privacy Local */}
                        <div className="rounded-3xl p-8 bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 transition-all duration-300 relative overflow-hidden group shadow-xl">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6">
                                <span className="text-xl">🔒</span>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
                                100% Privado no Seu Navegador
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Seus dados pessoais pertencem apenas a você. Tudo é armazenado no seu navegador via LocalStorage seguro. Zero venda de dados.
                            </p>
                        </div>

                        {/* Bento Card 4 - Smart Section Omission */}
                        <div className="rounded-3xl p-8 bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 transition-all duration-300 relative overflow-hidden group shadow-xl">
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-6">
                                <SparklesIcon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
                                Omissão Inteligente de Seções
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Campos ou seções que você não quiser preencher simplesmente desaparecem no PDF final sem deixar espaços vazios desagradáveis.
                            </p>
                        </div>

                        {/* Bento Card 5 - High Quality PDF */}
                        <div className="rounded-3xl p-8 bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 relative overflow-hidden group shadow-xl">
                            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-6">
                                <DownloadIcon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
                                PDF Vetorial com Links Vivos
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Documentos em padrão A4 de alta definição com links clicáveis para seu LinkedIn, GitHub e Portfólio, prontos para envio.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ==================== ANTES VS DEPOIS ==================== */}
            <section className="w-full py-20 sm:py-28 section-fade-in">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                            A Diferença Real
                        </span>
                        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-3">
                            A diferença entre ser descartado ou chamado
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                        {/* O Currículo Comum */}
                        <div className="rounded-3xl p-8 bg-red-950/20 border border-red-500/30 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-2 text-red-400 font-bold mb-4">
                                    <span className="text-lg">❌</span>
                                    <span>Currículo Comum (Feito no Word)</span>
                                </div>
                                <ul className="space-y-3.5 text-sm text-slate-300">
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-400 font-bold">•</span>
                                        <span>Descartado pelos robôs ATS da Gupy por causa de formatação inadequada.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-400 font-bold">•</span>
                                        <span>Blocos densos de texto que recrutadores não leem em 6 segundos.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-400 font-bold">•</span>
                                        <span>Campos vazios aparentes que transmitem falta de experiência.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-400 font-bold">•</span>
                                        <span>Sem links clicáveis ou métricas destacadas.</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="mt-8 pt-4 border-t border-red-500/20 text-xs text-red-400 font-bold">
                                Taxa de resposta média: menos de 5%
                            </div>
                        </div>

                        {/* O Currículo CurriculumPro */}
                        <div className="rounded-3xl p-8 bg-gradient-to-br from-emerald-950/30 to-blue-950/30 border-2 border-emerald-500/50 shadow-2xl shadow-emerald-500/10 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-2 text-emerald-400 font-bold mb-4">
                                    <span className="text-lg">✅</span>
                                    <span>Currículo CurriculumPro Studio</span>
                                </div>
                                <ul className="space-y-3.5 text-sm text-slate-200">
                                    <li className="flex items-start gap-2">
                                        <span className="text-emerald-400 font-bold">✓</span>
                                        <span>Hierarquia semântica 100% interpretada por robôs de recrutamento.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-emerald-400 font-bold">✓</span>
                                        <span>Destaque imediato para métricas de impacto e competências-chave.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-emerald-400 font-bold">✓</span>
                                        <span>Omissão automática de campos não preenchidos sem espaços mortos.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-emerald-400 font-bold">✓</span>
                                        <span>Exportação vetorial em PDF A4 pronta para impressão e envio direto.</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="mt-8 pt-4 border-t border-emerald-500/20 text-xs text-emerald-400 font-bold flex items-center justify-between">
                                <span>Taxa de resposta comprovada: 3x maior</span>
                                <span className="bg-emerald-500/20 px-2.5 py-0.5 rounded-full">Aprovado</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ==================== TESTIMONIALS ==================== */}
            <section className="w-full py-20 sm:py-28 bg-slate-950/60 border-y border-slate-800/80 section-fade-in">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-xs font-extrabold uppercase tracking-widest text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                            Casos de Sucesso
                        </span>
                        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-3">
                            Quem usou, foi contratado
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((t, i) => (
                            <div key={i} className="rounded-3xl p-8 bg-slate-900/80 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all duration-300 shadow-xl">
                                <div>
                                    <div className="flex gap-1 text-amber-400 mb-4">
                                        {[...Array(t.stars)].map((_, j) => (
                                            <StarIcon key={j} className="w-4 h-4 fill-amber-400" />
                                        ))}
                                    </div>
                                    <p className="text-slate-300 text-sm sm:text-base leading-relaxed italic">
                                        "{t.quote}"
                                    </p>
                                </div>
                                <div className="mt-6 pt-6 border-t border-slate-800 flex items-center gap-3">
                                    <img src={t.avatar} alt={t.name} className="w-11 h-11 rounded-full object-cover border border-slate-700" />
                                    <div>
                                        <div className="font-bold text-white text-sm">{t.name}</div>
                                        <div className="text-xs text-slate-400">{t.role}</div>
                                        <div className="text-[11px] font-bold text-emerald-400">{t.company}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ==================== FINAL HIGH-IMPACT CTA ==================== */}
            <section className="w-full py-24 sm:py-32 relative section-fade-in text-center px-4">
                <div className="max-w-4xl mx-auto relative rounded-3xl p-10 sm:p-16 border border-blue-500/30 bg-gradient-to-b from-blue-950/40 via-slate-900 to-slate-950 shadow-2xl overflow-hidden">
                    {/* Glowing background inside card */}
                    <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="relative z-10">
                        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                            Pronto para conquistar sua próxima vaga?
                        </h2>
                        <p className="text-slate-300 mt-4 text-base sm:text-lg max-w-xl mx-auto">
                            Leva menos de 10 minutos para criar um currículo que chama a atenção dos melhores recrutadores do Brasil.
                        </p>

                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button 
                                onClick={() => handleAction()} 
                                className="group w-full sm:w-auto px-10 py-4.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-extrabold text-lg rounded-2xl shadow-xl shadow-blue-600/40 hover:shadow-blue-600/60 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
                            >
                                <SparklesIcon className="w-5 h-5 text-blue-200 animate-pulse" />
                                <span>Criar Meu Currículo Agora</span>
                                <span className="text-blue-200 group-hover:translate-x-1 transition-transform">→</span>
                            </button>
                        </div>

                        <p className="mt-4 text-xs text-slate-500">
                            100% Gratuito • Sem necessidade de dados de cartão
                        </p>
                    </div>
                </div>
            </section>

            {/* ==================== MODAL DE ESCOLHA: ASSISTENTE VS EDITOR ==================== */}
            {showModeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl shadow-blue-500/10 space-y-6 relative animate-in zoom-in-95 duration-200">
                        {/* Close button */}
                        <button
                            onClick={() => setShowModeModal(false)}
                            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>

                        <div className="space-y-2 text-left">
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                                Iniciar Criação
                            </span>
                            <h3 className="text-2xl font-black text-white tracking-tight">
                                Como você prefere criar seu currículo?
                            </h3>
                            <p className="text-sm text-slate-400">
                                Escolha a experiência ideal para você. Você poderá alternar e personalizar tudo depois.
                            </p>
                        </div>

                        <div className="space-y-3.5">
                            {/* Option 1: Assistente Passo a Passo (Recomendado) */}
                            <button
                                onClick={() => {
                                    setShowModeModal(false);
                                    setCurrentView?.('wizard');
                                }}
                                className="w-full text-left p-5 rounded-2xl bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-slate-900 border-2 border-blue-500/70 hover:border-blue-400 transition-all duration-200 group shadow-lg shadow-blue-500/15 relative overflow-hidden"
                            >
                                <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-extrabold uppercase tracking-wide">
                                    ✨ Recomendado
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                                        <SparklesIcon className="w-6 h-6 animate-pulse" />
                                    </div>
                                    <div className="space-y-1 pr-16">
                                        <h4 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                                            Assistente Passo a Passo (Entrevista Guiada)
                                        </h4>
                                        <p className="text-xs text-slate-300 leading-relaxed">
                                            Responda perguntas simples (cargo, contato, conquistas sugeridas e habilidades) e deixe o assistente gerar o currículo pronto.
                                        </p>
                                    </div>
                                </div>
                            </button>

                            {/* Option 2: Editor Direto */}
                            <button
                                onClick={() => {
                                    setShowModeModal(false);
                                    setCurrentView?.('builder');
                                }}
                                className="w-full text-left p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-all duration-200 group"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0 group-hover:text-white">
                                        <DocumentTextIcon className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-base font-bold text-white group-hover:text-slate-200 transition-colors">
                                            Editor Completo em Tela Cheia
                                        </h4>
                                        <p className="text-xs text-slate-400 leading-relaxed">
                                            Acesse diretamente a folha A4 com todos os blocos livres para preenchimento manual, drag & drop e controle total.
                                        </p>
                                    </div>
                                </div>
                            </button>
                        </div>

                        <div className="pt-2 text-center text-xs text-slate-500">
                            🔒 100% Gratuito • Sem necessidade de cadastro para testar
                        </div>
                    </div>
                </div>
            )}
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