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

    const NavLink: React.FC<{ view: View, children: React.ReactNode, onClickExtra?: () => void }> = ({ view, children, onClickExtra }) => (
        <button 
            onClick={() => {
                setCurrentView(view);
                if (onClickExtra) onClickExtra();
            }} 
            className={`w-full md:w-auto text-left px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${currentView === view ? 'text-white bg-white/10 shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
            {children}
        </button>
    );

    const PublicNavLinks: React.FC<{ onSelect?: () => void }> = ({ onSelect }) => (
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 text-sm font-medium w-full md:w-auto">
            <NavLink view='home' onClickExtra={onSelect}>Início</NavLink>
            <NavLink view='templates' onClickExtra={onSelect}>Modelos</NavLink>
        </div>
    );

    return (
        <header className="sticky top-0 z-40 w-full border-b border-white/10 glass">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-8">
                        <button onClick={() => { setCurrentView('home'); setIsMobileMenuOpen(false); }} className="flex items-center gap-2 group">
                            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-1.5 rounded-lg shadow-lg group-hover:shadow-blue-500/20 transition-shadow">
                                <SparklesIcon className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg sm:text-xl font-bold tracking-tight text-white">CurriculumPro</span>
                        </button>
                        <div className="hidden md:flex">
                             <PublicNavLinks />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={() => { setCurrentView('builder'); setIsMobileMenuOpen(false); }} className="px-3.5 sm:px-5 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40">
                            Criar Currículo
                        </button>

                        <button 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                            aria-label="Abrir Menu"
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
                <div className="md:hidden border-t border-white/10 bg-[#0f172a]/95 backdrop-blur-md px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                    <PublicNavLinks onSelect={() => setIsMobileMenuOpen(false)} />
                </div>
            )}
        </header>
    );
};
