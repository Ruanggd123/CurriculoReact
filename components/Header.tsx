
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BellIcon, UserIcon, LogoutIcon, SparklesIcon } from './icons';
import { useToast } from './Toast';
import type { View } from '../types';

interface HeaderProps {
    setCurrentView: (view: View) => void;
    currentView: View;
}

export const Header: React.FC<HeaderProps> = ({ setCurrentView, currentView }) => {
    const { user, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { addToast } = useToast();

    const handleNotImplemented = (featureName: string) => {
        addToast(`${featureName} ainda não foi implementado.`, 'info');
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const NavLink: React.FC<{ view: View, children: React.ReactNode }> = ({ view, children }) => (
        <button 
            onClick={() => setCurrentView(view)} 
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${currentView === view ? 'text-white bg-white/10 shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
            {children}
        </button>
    );

    const PublicNavLinks: React.FC = () => (
         <div className="flex items-center gap-2 text-sm font-medium">
            <NavLink view='home'>Início</NavLink>
            <NavLink view='templates'>Modelos</NavLink>
            {/* <NavLink view='planos'>Planos</NavLink> -- Ocultado conforme solicitação */}
        </div>
    );

     const LoggedInNavLinks: React.FC = () => (
         <div className="flex items-center gap-2 text-sm font-medium">
            <NavLink view='meus-curriculos'>Meus Currículos</NavLink>
            {/* <NavLink view='planos'>Planos</NavLink> */}
        </div>
    );
    
    const isPro = user?.subscriptionStatus === 'pro';

    return (
        <header className="sticky top-0 z-40 w-full border-b border-white/10 glass">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-8">
                        <button onClick={() => setCurrentView('home')} className="flex items-center gap-2 group">
                            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-1.5 rounded-lg shadow-lg group-hover:shadow-blue-500/20 transition-shadow">
                                <SparklesIcon className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white">CurriculumPro</span>
                        </button>
                        <div className="hidden md:flex">
                             <PublicNavLinks />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* ÁREA DE LOGIN/USUÁRIO OCULTADA
                        {user ? (
                            <>
                                <button onClick={() => handleNotImplemented('Notificações')} className="p-2 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors" title="Notificações">
                                    <BellIcon className="w-5 h-5"/>
                                </button>
                                <div className="relative" ref={dropdownRef}>
                                    <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-9 h-9 bg-gradient-to-br from-gray-700 to-gray-600 rounded-full flex items-center justify-center text-white ring-2 ring-offset-2 ring-offset-[#0B1120] ring-transparent focus:ring-blue-500 transition-all shadow-md">
                                        <UserIcon className="w-5 h-5" />
                                    </button>
                                    {isDropdownOpen && (
                                        <div className="absolute right-0 mt-3 w-60 glass rounded-xl shadow-2xl py-2 ring-1 ring-black ring-opacity-5 focus:outline-none transform origin-top-right transition-all">
                                            <div className="px-4 py-3 border-b border-white/10">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Conta</p>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isPro ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-gray-600/20 text-gray-300 border-gray-500/30'}`}>
                                                        {isPro ? 'PRO ATIVO' : 'GRÁTIS'}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-medium text-white truncate">{user.email}</p>
                                            </div>
                                            <div className="py-1">
                                                <button onClick={() => { setCurrentView('perfil'); setIsDropdownOpen(false); }} className="w-full text-left block px-4 py-2 text-sm text-gray-300 hover:bg-blue-600/20 hover:text-blue-300 transition-colors">Meu Perfil</button>
                                                <button onClick={() => { setCurrentView('assinatura'); setIsDropdownOpen(false); }} className="w-full text-left block px-4 py-2 text-sm text-gray-300 hover:bg-blue-600/20 hover:text-blue-300 transition-colors">Assinatura</button>
                                            </div>
                                            <div className="border-t border-white/10 my-1 pt-1">
                                                <button onClick={() => { logout(); setCurrentView('home'); }} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                                                    <LogoutIcon className="w-4 h-4" />
                                                    Sair
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                             <div className="hidden sm:flex items-center gap-3">
                                 <button onClick={() => setCurrentView('auth')} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">Login</button>
                                 <button onClick={() => setCurrentView('auth')} className="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40">
                                    Começar Agora
                                 </button>
                             </div>
                        )}
                        */}
                        
                        <button onClick={() => setCurrentView('builder')} className="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40">
                            Criar Currículo
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};
