

import React, { useState, useEffect, useCallback } from 'react';
import type { View, Resume, ResumeData, UiConfig, TemplateOption } from './types';
import { ToastProvider, useToast } from './components/Toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import { Header } from './components/Header';
import { ResumeBuilder } from './components/ResumeBuilder';
import { initialResumeData, initialUiConfig } from './initialData';
import { generateId } from './utils';

import {
    AboutPage, BlogPage, ContactPage, CookiePolicyPage, CreateResumePage, DataRequestPage,
    FaqPage, HelpCenterPage, ImportLinkedInPage, MyResumesPage, PlansPage, PrivacyPolicyPage,
    SupportPage, TemplatesPage, TermsPage, WorkWithUsPage
} from './pages/ContentPages';
import { ProfilePage } from './pages/ProfilePage';
import { SubscriptionPage } from './pages/SubscriptionPage';
import { Footer } from './components/Footer';
import PageManager from './components/PageManager';
import { ResumeWizard } from './components/ResumeWizard';

const AppContent: React.FC = () => {
    const { user, loading } = useAuth();
    const [currentView, setCurrentView] = useState<View>('home');
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [activeResumeId, setActiveResumeId] = useState<string | null>(null);
    const { addToast } = useToast();

    // Load resumes from local storage
    useEffect(() => {
        if (!loading) {
            try {
                const userId = user?.id || 'guest';
                const savedResumes = localStorage.getItem(`resumes_v4_${userId}`); // Bumped version to v4
                if (savedResumes) {
                    setResumes(JSON.parse(savedResumes));
                } else {
                    const defaultResume: Resume = {
                        id: generateId(),
                        title: 'Meu Currículo',
                        lastModified: new Date().toISOString(),
                        data: initialResumeData,
                        ui: initialUiConfig
                    };
                    setResumes([defaultResume]);
                }
            } catch (error) {
                console.error("Failed to load resumes from localStorage", error);
            }
        }
    }, [user, loading]);

    // Save resumes to local storage
    useEffect(() => {
        if (resumes.length > 0) {
            try {
                const userId = user?.id || 'guest';
                localStorage.setItem(`resumes_v4_${userId}`, JSON.stringify(resumes)); // Bumped version to v4
            } catch (error) {
                console.error("Failed to save resumes to localStorage", error);
            }
        }
    }, [resumes, user]);

    // Initialize theme
    useEffect(() => {
        try {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } catch (e) {
            document.documentElement.classList.add('dark');
        }
    }, []);

    // FIXED: Wrapped in useCallback to prevent infinite loop in ResumeBuilder
    const handleSaveResume = useCallback((id: string, newData: ResumeData, newUi: UiConfig) => {
        setResumes(prevResumes => {
            const index = prevResumes.findIndex(r => r.id === id);
            if (index === -1) return prevResumes;

            const currentResume = prevResumes[index];

            // Check if actual changes occurred to prevent unnecessary updates
            if (JSON.stringify(currentResume.data) === JSON.stringify(newData) &&
                JSON.stringify(currentResume.ui) === JSON.stringify(newUi)) {
                return prevResumes;
            }

            const updatedResume = {
                ...currentResume,
                data: newData,
                ui: newUi,
                title: newData.personal.name || 'Currículo sem título',
                lastModified: new Date().toISOString()
            };

            const newResumes = [...prevResumes];
            newResumes[index] = updatedResume;
            return newResumes;
        });
    }, []);

    const handleApplyTemplate = (template: TemplateOption, targetView: View = 'builder') => {
        const targetId = activeResumeId || resumes[0]?.id;

        if (targetId) {
            setResumes(prevResumes =>
                prevResumes.map(r =>
                    r.id === targetId
                        ? { ...r, ui: { ...r.ui, template } }
                        : r
                )
            );
            if (!activeResumeId) {
                setActiveResumeId(targetId);
            }
            addToast(`Modelo ${template} aplicado!`, 'success');
        } else {
            const newResume: Resume = {
                id: generateId(),
                title: 'Meu Currículo',
                lastModified: new Date().toISOString(),
                data: initialResumeData,
                ui: { ...initialUiConfig, template }
            };
            setResumes([newResume, ...resumes]);
            setActiveResumeId(newResume.id);
        }

        setCurrentView(targetView);
    };

    const handleWizardComplete = (data: ResumeData, ui: UiConfig) => {
        const newResume: Resume = {
            id: generateId(),
            title: data.personal.name ? `Currículo - ${data.personal.name}` : 'Meu Currículo',
            lastModified: new Date().toISOString(),
            data,
            ui
        };
        setResumes(prev => [newResume, ...prev]);
        setActiveResumeId(newResume.id);
        setCurrentView('builder');
        addToast('🎉 Currículo gerado com sucesso! Agora você pode personalizar cada detalhe no editor.', 'success');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[100dvh] bg-[#0f172a] text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-medium text-gray-400 animate-pulse">Carregando...</p>
                </div>
            </div>
        );
    }

    const activeResume = resumes.find(r => r.id === activeResumeId) || resumes[0];

    const renderPage = () => {
        switch (currentView) {
            case 'home': return <CreateResumePage setCurrentView={setCurrentView} onApplyTemplate={handleApplyTemplate} />;
            case 'auth': return <Auth />;
            case 'wizard': return (
                <ResumeWizard 
                    key={activeResumeId || 'new-wizard'} 
                    onComplete={handleWizardComplete} 
                    onCancel={() => setCurrentView('home')} 
                    initialData={activeResume?.data}
                    initialUi={activeResume?.ui}
                />
            );
            case 'builder': return <ResumeBuilder key={activeResume?.id || 'new'} initialResume={activeResume} saveResume={handleSaveResume} setCurrentView={setCurrentView} />;
            case 'meus-curriculos': return <MyResumesPage setCurrentView={setCurrentView} resumes={resumes} setResumes={setResumes} setActiveResumeId={setActiveResumeId} />;
            case 'perfil': return <ProfilePage setCurrentView={setCurrentView} />;
            case 'assinatura': return <SubscriptionPage />;
            case 'planos': return <PlansPage setCurrentView={setCurrentView} />;
            case 'sobre': return <AboutPage setCurrentView={setCurrentView} />;
            case 'contato': return <ContactPage setCurrentView={setCurrentView} />;
            case 'blog': return <BlogPage setCurrentView={setCurrentView} />;
            case 'trabalhe-conosco': return <WorkWithUsPage setCurrentView={setCurrentView} />;
            case 'criar-curriculo': return <CreateResumePage setCurrentView={setCurrentView} onApplyTemplate={handleApplyTemplate} />;
            case 'templates': return <TemplatesPage setCurrentView={setCurrentView} onApplyTemplate={handleApplyTemplate} />;
            case 'importar-linkedin': return <ImportLinkedInPage setCurrentView={setCurrentView} />;
            case 'faq': return <FaqPage setCurrentView={setCurrentView} />;
            case 'central-ajuda': return <HelpCenterPage setCurrentView={setCurrentView} />;
            case 'suporte-email': return <SupportPage setCurrentView={setCurrentView} />;
            case 'termos': return <TermsPage setCurrentView={setCurrentView} />;
            case 'privacidade': return <PrivacyPolicyPage setCurrentView={setCurrentView} />;
            case 'cookies': return <CookiePolicyPage setCurrentView={setCurrentView} />;
            case 'dados-lgpd': return <DataRequestPage setCurrentView={setCurrentView} />;
            case 'a4-editor': return <PageManager />;
            default: return <CreateResumePage setCurrentView={setCurrentView} onApplyTemplate={handleApplyTemplate} />;
        }
    };

    const isBuilder = currentView === 'builder';
    const hideGlobalNav = currentView === 'builder' || currentView === 'wizard';
    const isAuth = currentView === 'auth';

    if (isAuth) {
        return (
            <div className="flex flex-col h-[100dvh] text-white bg-[#090d16]">
                <div className="fixed inset-0 -z-10 pointer-events-none bg-[#090d16]">
                    <div className="absolute inset-0 gradient-overlay-tr opacity-70 pointer-events-none"></div>
                </div>
                <Header setCurrentView={setCurrentView} currentView={currentView} />
                <main className="flex-1 flex items-center justify-center overflow-auto">
                    <Auth />
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[100dvh] text-white bg-[#090d16] overflow-hidden">
            {!hideGlobalNav && <Header setCurrentView={setCurrentView} currentView={currentView} />}

            <main className={`flex-1 ${isBuilder ? 'overflow-hidden' : 'overflow-y-auto overflow-x-hidden scroll-smooth'} relative w-full bg-[#090d16]`}>
                <div className="fixed inset-0 -z-10 pointer-events-none bg-[#090d16]">
                    <div className="absolute inset-0 gradient-overlay-tr opacity-70 pointer-events-none"></div>
                    <div className="absolute inset-0 gradient-overlay-bl opacity-70 pointer-events-none"></div>
                </div>
                {renderPage()}
                {!hideGlobalNav && <Footer setCurrentView={setCurrentView} />}
            </main>
        </div>
    );
}

const App: React.FC = () => (
    <ToastProvider>
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    </ToastProvider>
);

export default App;