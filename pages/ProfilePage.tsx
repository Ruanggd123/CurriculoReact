import React, { useState } from 'react';
import { PageWrapper } from './ContentPages';
import { UserIcon, Cog6ToothIcon, ShieldCheckIcon, TrashIcon } from '../components/icons';
import { useAuth } from '../contexts/AuthContext';
import { View } from '../types';

interface ProfilePageProps {
    setCurrentView: (view: View) => void;
}

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-3 text-sm font-medium flex items-center gap-3 transition-colors rounded-lg ${
            active
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
        }`}
    >
        {children}
    </button>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input
        {...props}
        className="w-full px-3 py-2 border border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-700/50 text-gray-100"
    />
);

const Toggle: React.FC<{ label: string; enabled: boolean; setEnabled: (enabled: boolean) => void }> = ({ label, enabled, setEnabled }) => (
    <div className="flex items-center justify-between">
        <span className="text-gray-300">{label}</span>
        <button
            onClick={() => setEnabled(!enabled)}
            className={`${
                enabled ? 'bg-blue-600' : 'bg-gray-600'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
        >
            <span
                className={`${
                    enabled ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
        </button>
    </div>
);


export const ProfilePage: React.FC<ProfilePageProps> = ({ setCurrentView }) => {
    const [activeTab, setActiveTab] = useState('personal');

    const renderContent = () => {
        switch (activeTab) {
            case 'personal': return <PersonalInfoTab setCurrentView={setCurrentView} />;
            case 'preferences': return <PreferencesTab />;
            case 'security': return <SecurityTab />;
            case 'privacy': return <PrivacyTab />;
            default: return null;
        }
    };

    return (
        <PageWrapper>
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Meu Perfil</h1>
                <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-400">Gerencie suas informações, foto, preferências e segurança.</p>
            </div>

            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                <aside className="md:col-span-1">
                    <nav className="flex flex-col space-y-2">
                        <TabButton active={activeTab === 'personal'} onClick={() => setActiveTab('personal')}><UserIcon className="w-5 h-5"/> Informações Pessoais</TabButton>
                        <TabButton active={activeTab === 'preferences'} onClick={() => setActiveTab('preferences')}><Cog6ToothIcon className="w-5 h-5"/> Preferências</TabButton>
                        <TabButton active={activeTab === 'security'} onClick={() => setActiveTab('security')}><ShieldCheckIcon className="w-5 h-5"/> Segurança</TabButton>
                        <TabButton active={activeTab === 'privacy'} onClick={() => setActiveTab('privacy')}><TrashIcon className="w-5 h-5"/> Privacidade</TabButton>
                    </nav>
                </aside>
                <main className="md:col-span-3 bg-[#1A2233] rounded-xl p-8 border border-gray-700">
                    {renderContent()}
                </main>
            </div>
        </PageWrapper>
    );
};

const PersonalInfoTab: React.FC<{setCurrentView: (view: View) => void}> = ({ setCurrentView }) => {
    const { user } = useAuth();
    const isPro = user?.subscriptionStatus === 'pro';

    return (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Informações Pessoais</h2>
        <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gray-700 rounded-full flex-shrink-0 flex items-center justify-center">
                <UserIcon className="w-12 h-12 text-gray-500" />
            </div>
            <div>
                <button className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Carregar Foto</button>
                <p className="text-xs text-gray-400 mt-2">JPG, PNG ou WebP, max 5MB.</p>
            </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1.5 text-gray-300">Nome Completo</label><Input defaultValue="Francisco Ruan" /></div>
            <div><label className="block text-sm font-medium mb-1.5 text-gray-300">E-mail</label><Input type="email" defaultValue={user?.email} readOnly /></div>
        </div>
        
        <div className="space-y-4 pt-4 border-t border-gray-700">
            <h3 className="text-lg font-semibold text-gray-200">Plano Atual</h3>
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <div>
                    <p className="font-bold text-white">Você está no plano <span className={isPro ? 'text-green-400' : 'text-gray-300'}>{isPro ? 'Pro' : 'Grátis'}</span>.</p>
                    <p className="text-sm text-gray-400">{isPro ? 'Acesso a todos os recursos premium.' : 'Faça upgrade para downloads ilimitados sem marca d\'água.'}</p>
                </div>
                {!isPro && (
                    <button 
                        onClick={() => setCurrentView('planos')}
                        className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex-shrink-0"
                    >
                        Fazer Upgrade para o Pro
                    </button>
                )}
            </div>
        </div>
        
        <button className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 mt-4">Salvar Alterações</button>
    </div>
    );
};

const PreferencesTab = () => {
    const [prefs, setPrefs] = useState({ suggestions: true, atsAlerts: true, jobs: false, newsletter: true });
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Preferências</h2>
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-200">Preferências ATS</h3>
                <Toggle label="Ativar sugestões automáticas de IA" enabled={prefs.suggestions} setEnabled={val => setPrefs(p => ({...p, suggestions: val}))} />
                <Toggle label="Mostrar alertas de compatibilidade ATS" enabled={prefs.atsAlerts} setEnabled={val => setPrefs(p => ({...p, atsAlerts: val}))} />
            </div>
             <div className="space-y-4 pt-4 border-t border-gray-700">
                <h3 className="text-lg font-semibold text-gray-200">Comunicação</h3>
                <Toggle label="Receber avisos sobre vagas de emprego" enabled={prefs.jobs} setEnabled={val => setPrefs(p => ({...p, jobs: val}))} />
                <Toggle label="Receber newsletters" enabled={prefs.newsletter} setEnabled={val => setPrefs(p => ({...p, newsletter: val}))} />
            </div>
        </div>
    );
};

const SecurityTab = () => {
    const { user } = useAuth();
    const isPro = user?.subscriptionStatus === 'pro';

    return (
         <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Segurança</h2>
             <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-200">Alterar Senha</h3>
                <div><label className="block text-sm font-medium mb-1.5 text-gray-300">Senha Atual</label><Input type="password" /></div>
                <div><label className="block text-sm font-medium mb-1.5 text-gray-300">Nova Senha</label><Input type="password" /></div>
                <div><label className="block text-sm font-medium mb-1.5 text-gray-300">Confirmar Nova Senha</label><Input type="password" /></div>
                <button className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Atualizar Senha</button>
            </div>
            <div className="space-y-4 pt-4 border-t border-gray-700">
                <h3 className="text-lg font-semibold text-gray-200">Autenticação de Dois Fatores (2FA)</h3>
                <p className="text-sm text-gray-400">Proteja sua conta com uma camada extra de segurança.</p>
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <button className="w-full sm:w-auto px-5 py-2 text-sm font-semibold text-white border border-gray-500 rounded-lg hover:bg-gray-700">
                        Ativar via App (Authenticator)
                    </button>
                    <div className="relative">
                        <button
                            disabled={!isPro}
                            className="w-full sm:w-auto px-5 py-2 text-sm font-semibold text-white border border-gray-500 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Ativar via SMS
                            {!isPro && (
                                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">PRO</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const PrivacyTab = () => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Privacidade e Dados</h2>
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-200">Gerenciar seus Dados</h3>
            <p className="text-sm text-gray-400">Você tem o controle sobre suas informações.</p>
            <button className="px-5 py-2 text-sm font-semibold text-white border border-gray-500 rounded-lg hover:bg-gray-700">Baixar meus dados</button>
        </div>
        <div className="space-y-4 pt-4 border-t border-red-500/30">
            <h3 className="text-lg font-semibold text-red-400">Excluir Conta</h3>
            <p className="text-sm text-gray-400">Esta ação é permanente e não pode ser desfeita. Todos os seus currículos e dados serão excluídos.</p>
            <button className="px-5 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700">Excluir minha conta</button>
        </div>
    </div>
);