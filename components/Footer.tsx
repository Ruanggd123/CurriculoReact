
import React from 'react';
import type { View } from '../types';

interface FooterProps {
    setCurrentView: (view: View) => void;
}

const FooterLink: React.FC<{ view: View; setCurrentView: (view: View) => void; children: React.ReactNode }> = ({ view, setCurrentView, children }) => (
    <li>
        <button onClick={() => setCurrentView(view)} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200 text-sm text-left">
            {children}
        </button>
    </li>
);

export const Footer: React.FC<FooterProps> = ({ setCurrentView }) => {
    return (
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 tracking-wider uppercase">Institucional</h3>
                        <ul className="mt-4 space-y-3">
                            <FooterLink view="sobre" setCurrentView={setCurrentView}>Sobre nós</FooterLink>
                            <FooterLink view="contato" setCurrentView={setCurrentView}>Contato</FooterLink>
                            <FooterLink view="blog" setCurrentView={setCurrentView}>Blog</FooterLink>
                            <FooterLink view="trabalhe-conosco" setCurrentView={setCurrentView}>Trabalhe Conosco</FooterLink>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 tracking-wider uppercase">Produto</h3>
                        <ul className="mt-4 space-y-3">
                            <FooterLink view="criar-curriculo" setCurrentView={setCurrentView}>Criar Currículo</FooterLink>
                            <FooterLink view="templates" setCurrentView={setCurrentView}>Modelos</FooterLink>
                            <FooterLink view="importar-linkedin" setCurrentView={setCurrentView}>Importar LinkedIn</FooterLink>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 tracking-wider uppercase">Suporte</h3>
                        <ul className="mt-4 space-y-3">
                            <FooterLink view="faq" setCurrentView={setCurrentView}>FAQ</FooterLink>
                            <FooterLink view="central-ajuda" setCurrentView={setCurrentView}>Central de Ajuda</FooterLink>
                            <FooterLink view="suporte-email" setCurrentView={setCurrentView}>Suporte por E-mail</FooterLink>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 tracking-wider uppercase">Legal</h3>
                        <ul className="mt-4 space-y-3">
                            <FooterLink view="termos" setCurrentView={setCurrentView}>Termos de Uso</FooterLink>
                            <FooterLink view="privacidade" setCurrentView={setCurrentView}>Política de Privacidade</FooterLink>
                            <FooterLink view="cookies" setCurrentView={setCurrentView}>Política de Cookies</FooterLink>
                            <FooterLink view="dados-lgpd" setCurrentView={setCurrentView}>Solicitação de Dados (LGPD)</FooterLink>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                        &copy; 2025 — CurriculumPro. Todos os direitos reservados.
                    </p>
                </div>
            </div>
        </footer>
    );
};
