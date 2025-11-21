
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
                const savedResumes = localStorage.getItem(`resumes_${userId}`);
                if (savedResumes) {
                    setResumes(JSON.parse(savedResumes));
                } else {
                    const defaultResume: Resume = {
                        id: generateId(),
                        title: 'Meu Currículo',
                        lastModified: new Date().toISOString(),
                        data: { ...initialResumeData, personal: { ...initialResumeData.personal, name: 'Seu Nome' }},
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
                localStorage.setItem(`resumes_${userId}`, JSON.stringify(resumes));
            } catch (error) {
                console.error("Failed to save resumes to localStorage", error);
            }
        }
    }, [resumes, user]);

    // Initialize theme
    useEffect(() => {
        try {
            const storedTheme = localStorage.getItem('theme');
            if (storedTheme === 'light') {
                document.documentElement.classList.remove('dark');
            } else {
                document.documentElement.classList.add('dark');
            }
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

    const handleApplyTemplate = (template: TemplateOption) => {
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
                data: { ...initialResumeData, personal: { ...initialResumeData.personal, name: 'Seu Nome' }},
                ui: { ...initialUiConfig, template }
            };
            setResumes([newResume, ...resumes]);
            setActiveResumeId(newResume.id);
        }
        
        setCurrentView('builder');
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
        switch(currentView) {
            case 'home': return <CreateResumePage setCurrentView={setCurrentView} onApplyTemplate={handleApplyTemplate} />;
            case 'auth': return <Auth />;
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
            default: return <CreateResumePage setCurrentView={setCurrentView} onApplyTemplate={handleApplyTemplate} />;
        }
    };
    
    const isBuilder = currentView === 'builder'; 
    const isAuth = currentView === 'auth'; 

    if (isAuth) {
         return (
             <div className="flex flex-col h-[100dvh] text-slate-900 dark:text-white transition-colors duration-300">
                 <div className="fixed inset-0 -z-10 bg-gray-100 dark:bg-[#0f172a] transition-colors duration-300">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/10 via-transparent to-transparent dark:from-blue-500/20"></div>
                </div>
                <Header setCurrentView={setCurrentView} currentView={currentView}/>
                <main className="flex-1 flex items-center justify-center overflow-auto">
                    <Auth />
                </main>
             </div>
         )
    }

    return (
        <div className="flex flex-col h-[100dvh] text-slate-900 dark:text-white transition-colors duration-300 overflow-hidden">
             {!isBuilder && <Header setCurrentView={setCurrentView} currentView={currentView}/>}
             
             <main className={`flex-1 ${isBuilder ? 'overflow-hidden' : 'overflow-y-auto overflow-x-hidden'} relative w-full`}>
                <div className="fixed inset-0 -z-10 bg-gray-100 dark:bg-[#0f172a] transition-colors duration-300">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/10 via-transparent to-transparent dark:from-blue-500/20"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-400/10 via-transparent to-transparent dark:from-indigo-500/20"></div>
                </div>
                {renderPage()}
                {!isBuilder && <Footer setCurrentView={setCurrentView} />}
             </main>
        </div>
    )
}

const App: React.FC = () => (
    <ToastProvider>
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    </ToastProvider>
);

export default App;
