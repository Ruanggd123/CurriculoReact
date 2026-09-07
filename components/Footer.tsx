import React from 'react';
import type { View } from '../types';
import { SparklesIcon } from './icons';

interface FooterProps {
    setCurrentView: (view: View) => void;
}

const FooterLink: React.FC<{ view: View; setCurrentView: (view: View) => void; children: React.ReactNode }> = ({ view, setCurrentView, children }) => (
    <li>
        <button 
            onClick={() => setCurrentView(view)} 
            className="text-slate-400 hover:text-white transition-colors duration-200 text-sm text-left flex items-center gap-1.5 group"
        >
            <span className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">›</span>
            <span>{children}</span>
        </button>
    </li>
);

export const Footer: React.FC<FooterProps> = ({ setCurrentView }) => {
    return (
        <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 flex-shrink-0 relative overflow-hidden">
            {/* Subtle glow background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-blue-600/5 blur-3xl pointer-events-none"></div>

            <div className="max-w-7xl mx-auto py-14 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-10 lg:gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center gap-2.5">
                            <div className="bg-gradient-to-br from-blue-500 via-indigo-600 to-violet-600 p-2 rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center">
                                <SparklesIcon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl font-black tracking-tight text-white">Curriculum</span>
                                <span className="text-xl font-black tracking-tight bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Pro</span>
                            </div>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
                            A plataforma de alta performance para criação de currículos executivos e profissionais, 100% otimizada para ser aprovada nos sistemas ATS (Gupy, Workday e Taleo).
                        </p>
                        <div className="flex flex-wrap gap-2 pt-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                Sistema 100% Operacional
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300">
                                🔒 Dados Privados (LocalStorage)
                            </span>
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-200 tracking-wider uppercase mb-4">Navegação</h3>
                        <ul className="space-y-2.5">
                            <FooterLink view="criar-curriculo" setCurrentView={setCurrentView}>Criar Currículo</FooterLink>
                            <FooterLink view="templates" setCurrentView={setCurrentView}>Galeria de Modelos</FooterLink>
                            <FooterLink view="meus-curriculos" setCurrentView={setCurrentView}>Meus Documentos</FooterLink>
                            <FooterLink view="planos" setCurrentView={setCurrentView}>Planos & Recursos</FooterLink>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold text-slate-200 tracking-wider uppercase mb-4">Institucional</h3>
                        <ul className="space-y-2.5">
                            <FooterLink view="sobre" setCurrentView={setCurrentView}>Sobre a Plataforma</FooterLink>
                            <FooterLink view="faq" setCurrentView={setCurrentView}>Perguntas Frequentes</FooterLink>
                            <FooterLink view="blog" setCurrentView={setCurrentView}>Dicas de Carreira</FooterLink>
                            <FooterLink view="contato" setCurrentView={setCurrentView}>Fale Conosco</FooterLink>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold text-slate-200 tracking-wider uppercase mb-4">Segurança & Legal</h3>
                        <ul className="space-y-2.5">
                            <FooterLink view="termos" setCurrentView={setCurrentView}>Termos de Uso</FooterLink>
                            <FooterLink view="privacidade" setCurrentView={setCurrentView}>Política de Privacidade</FooterLink>
                            <FooterLink view="dados-lgpd" setCurrentView={setCurrentView}>Conformidade LGPD</FooterLink>
                            <FooterLink view="cookies" setCurrentView={setCurrentView}>Uso de Cookies</FooterLink>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800/80 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-slate-500 text-center sm:text-left">
                        &copy; {new Date().getFullYear()} CurriculumPro Studio. Desenvolvido para impulsionar carreiras extraordinárias.
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                        <span>Formatado conforme os padrões internacionais ATS</span>
                        <span>•</span>
                        <span className="text-slate-400">PDF Vetorial A4</span>
                    </p>
                </div>
            </div>
        </footer>
    );
};

