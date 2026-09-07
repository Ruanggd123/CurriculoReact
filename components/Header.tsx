import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SparklesIcon } from './icons';
import { useToast } from './Toast';
import type { View } from '../types';

interface HeaderProps {
    setCurrentView: (view: View) => void;
    currentView: View;
}

export const Header: React.FC<HeaderProps> = ({ setCurrentView, currentView }) => {
    const { user } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { addToast } = useToast();

    const NavLink: React.FC<{ view: View; children: React.ReactNode; onClickExtra?: () => void }> = ({ view, children, onClickExtra }) => {
        const isActive = currentView === view;
        return (
            <button 
                onClick={() => {
                    setCurrentView(view);
                    if (onClickExtra) onClickExtra();
                }} 
                className={`relative px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    isActive 
                        ? 'text-white bg-white/10 shadow-sm border border-white/15' 
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
            >
                {children}
            </button>
        );
    };

    const PublicNavLinks: React.FC<{ onSelect?: () => void }> = ({ onSelect }) => (
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-1.5 md:gap-2 text-sm font-medium w-full md:w-auto">
            <NavLink view='home' onClickExtra={onSelect}>Início</NavLink>
            <NavLink view='wizard' onClickExtra={onSelect}>
                <span className="inline-flex items-center gap-1 text-blue-300 font-bold">
                    <span>🪄</span> Assistente Guiado
                </span>
            </NavLink>
            <NavLink view='templates' onClickExtra={onSelect}>Modelos</NavLink>
            <NavLink view='meus-curriculos' onClickExtra={onSelect}>Meus CVs</NavLink>
            <NavLink view='faq' onClickExtra={onSelect}>Dúvidas</NavLink>
        </div>
    );

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-2xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 sm:h-18">
                    {/* Brand */}
                    <div className="flex items-center gap-6 lg:gap-8">
                        <button 
                            onClick={() => { setCurrentView('home'); setIsMobileMenuOpen(false); }} 
                            className="flex items-center gap-2.5 group transition-transform active:scale-95"
                        >
                            <div className="relative">
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-40 group-hover:opacity-80 transition duration-300"></div>
                                <div className="relative bg-gradient-to-br from-blue-500 via-indigo-600 to-violet-600 p-2 rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center">
                                    <SparklesIcon className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-lg sm:text-xl font-black tracking-tight text-white">Curriculum</span>
                                <span className="text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Pro</span>
                                <span className="hidden sm:inline-block ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                    ATS 2025
                                </span>
                            </div>
                        </button>
                        
                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center">
                            <PublicNavLinks />
                        </div>
                    </div>

                    {/* Right CTAs */}
                    <div className="flex items-center gap-2.5 sm:gap-3">
                        <button 
                            onClick={() => { setCurrentView('templates'); setIsMobileMenuOpen(false); }} 
                            className="hidden sm:inline-flex px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl hover:bg-slate-800/80 transition-all border border-transparent hover:border-slate-700"
                        >
                            Ver Modelos
                        </button>

                        <button 
                            onClick={() => { setCurrentView('wizard'); setIsMobileMenuOpen(false); }} 
                            className="group relative inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all duration-200 transform hover:-translate-y-0.5 active:scale-95"
                        >
                            <SparklesIcon className="w-4 h-4 text-blue-200 animate-pulse" />
                            <span>Criar Currículo</span>
                            <span className="hidden sm:inline-block text-blue-200 group-hover:translate-x-0.5 transition-transform">→</span>
                        </button>

                        {/* Mobile Menu Button */}
                        <button 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors border border-transparent hover:border-slate-800"
                            aria-label="Menu"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-2xl px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
                    <PublicNavLinks onSelect={() => setIsMobileMenuOpen(false)} />
                    <div className="pt-2 border-t border-slate-800/80">
                        <button 
                            onClick={() => { setCurrentView('builder'); setIsMobileMenuOpen(false); }}
                            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-600/30"
                        >
                            <SparklesIcon className="w-4 h-4" />
                            <span>Começar Agora (Grátis)</span>
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
};

