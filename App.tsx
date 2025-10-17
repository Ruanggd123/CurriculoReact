
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ResumePreview } from './components/ResumePreview';
import type { ResumeData, UiConfig } from './types';
import { DownloadIcon, RefreshIcon, MoonIcon, SunIcon, UndoIcon, RedoIcon } from './components/icons';
import { LeftSidebar } from './components/LeftSidebar';
import { FormPanel } from './components/FormPanel';
import { useHistoryState } from './hooks/useHistoryState';
import { ToastProvider, useToast } from './components/Toast';

// Declaration to inform TypeScript about the global html2pdf variable from the CDN script
declare const html2pdf: any;

const initialResumeData: ResumeData = {
  personal: {
    name: 'Francisco Ruan Gomes Damasceno',
    jobTitle: 'Estudante de Engenharia de Computação | Desenvolvedor',
    email: 'ruangmes159@gmail.com',
    phone: '88 98188-5499',
    location: 'Sobral, Ceará',
    linkedin: 'linkedin.com/in/franciscoruan',
    github: 'github.com/Ruanggd123',
    website: '',
    summary: 'Estudante de Engenharia de Computação na Universidade Federal do Ceará (UFC) com foco em desenvolvimento de software. Tenho experiência prática em front-end com React, JavaScript, HTML e CSS, e em back-end com Java, Spring Boot e Python. Busco uma oportunidade para aplicar e expandir minhas habilidades, contribuindo em projetos desafiadores e crescendo profissionalmente na área de tecnologia.',
  },
  sections: [
    {
      id: "experience_section",
      type: 'experience',
      title: 'Experiência Profissional',
      items: [
        {
          id: crypto.randomUUID(),
          company: 'FitBank | Sobral, Ceará (Remoto)',
          role: 'Desenvolvedor Front-End (Estágio)',
          startDate: '2024-11',
          endDate: '2025-04',
          description: '• Participei de um programa de formação focado em desenvolvimento front-end.\n• Desenvolvi pequenos projetos internos para praticar e aprimorar boas práticas de UI/UX.',
        },
        {
          id: crypto.randomUUID(),
          company: 'Projeto Entrando no Jogo | Meruoca, Ceará',
          role: 'Tutor de Lógica de Programação',
          startDate: '2023-01',
          endDate: '2023-06',
          description: '• Ministrei aulas de lógica de programação para jovens do município.',
        },
      ]
    },
    {
      id: "education_section",
      type: 'education',
      title: 'Formação Acadêmica',
      items: [
        {
          id: crypto.randomUUID(),
          institution: 'Universidade Federal do Ceará (UFC)',
          degree: 'Engenharia de Computação',
          startDate: '',
          endDate: 'Cursando',
          description: '',
        },
      ]
    },
    {
      id: "projects_section",
      type: 'projects',
      title: 'Projetos',
      items: [
        {
          id: crypto.randomUUID(),
          name: 'Sistema de Gerenciamento de Caixa',
          link: 'https://github.com/Ruanggd123/Caixa',
          description: 'Sistema de caixa em JS, HTML e CSS para simular registro de vendas.',
        },
        {
          id: crypto.randomUUID(),
          name: 'Plataforma Universitária UniMove',
          link: 'https://github.com/Ruanggd123/UniMove',
          description: 'Plataforma web para universitários com formulários e futura integração de rastreamento de ônibus.',
        }
      ]
    },
    {
      id: "skills_section",
      type: 'skills',
      title: 'Habilidades',
      items: [
        { id: crypto.randomUUID(), name: 'JavaScript' },
        { id: crypto.randomUUID(), name: 'React' },
        { id: crypto.randomUUID(), name: 'HTML5 & CSS3' },
        { id: crypto.randomUUID(), name: 'Java' },
        { id: crypto.randomUUID(), name: 'Spring Boot' },
        { id: crypto.randomUUID(), name: 'Python' },
        { id: crypto.randomUUID(), name: 'API REST' },
        { id: crypto.randomUUID(), name: 'Git & GitHub' },
      ]
    },
    {
        id: "languages_section",
        type: 'languages',
        title: 'Idiomas',
        items: [
            { id: crypto.randomUUID(), language: 'Português', proficiency: 'Nativo' },
            { id: crypto.randomUUID(), language: 'Inglês', proficiency: 'Intermediário' },
        ]
    }
  ]
};


const initialUiConfig: UiConfig = {
    template: 'classic',
    backgroundColor: '#ffffff',
    accentColor: '#1d4ed8', // Cor de destaque (azul)
    photo: {
        src: '',
        show: true,
        style: 'rounded-full',
        position: 'center center',
        zoom: 100,
    },
    sectionSizes: {
        name: 36,
        jobTitle: 20,
        sectionTitle: 24,
        summary: 14,
        experience: 14,
        education: 14,
        skills: 14,
    }
}

const MainApp: React.FC = () => {
  // FIX: The useHistoryState hook returns 7 values, but 8 were being destructured.
  // The extra variables were unused and have been removed to resolve the error.
  const [resumeData, setResumeData, undoResume, redoResume, canUndoResume, canRedoResume, resetResumeData] = useHistoryState<ResumeData>(initialResumeData);
  const [uiConfig, setUiConfig, undoUi, redoUi, canUndoUi, canRedoUi, resetUiConfig] = useHistoryState<UiConfig>(initialUiConfig);

  const [activeSection, setActiveSection] = useState<string | null>('appearance');
  const resumePreviewRef = useRef<HTMLDivElement>(null);
  const mainPanelRef = useRef<HTMLElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage once on mount
  useEffect(() => {
    try {
        const savedData = localStorage.getItem('resumeData');
        const savedConfig = localStorage.getItem('uiConfig');
        if (savedData) resetResumeData(JSON.parse(savedData));
        if (savedConfig) resetUiConfig(JSON.parse(savedConfig));
    } catch (error) {
        console.error("Failed to parse data from localStorage", error);
        resetResumeData(initialResumeData);
        resetUiConfig(initialUiConfig);
    }
    setIsLoaded(true);
  }, []);

  // --- AUTOSAVE LOGIC ---
  const { addToast } = useToast();
  const debounceTimeout = useRef<number | null>(null);
 
  useEffect(() => {
    if (!isLoaded) return; // Don't save on initial load
    
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    
    debounceTimeout.current = window.setTimeout(() => {
        try {
            localStorage.setItem('resumeData', JSON.stringify(resumeData));
            localStorage.setItem('uiConfig', JSON.stringify(uiConfig));
        } catch (error) {
            console.error("Autosave failed:", error);
            addToast('Falha ao salvar.', 'error');
        }
    }, 1500); // Save 1.5s after user stops typing
    
    return () => {
        if(debounceTimeout.current) clearTimeout(debounceTimeout.current);
    }
  }, [resumeData, uiConfig, isLoaded, addToast]);
  // --- END AUTOSAVE LOGIC ---

  useEffect(() => {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark:bg-gray-900');
        document.body.classList.remove('bg-gray-100');
    } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.add('bg-gray-100');
        document.body.classList.remove('dark:bg-gray-900');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleGeneratePdf = () => {
    const element = resumePreviewRef.current;
    if (!element) return;
    setIsGeneratingPdf(true);

    const opt = {
      margin: 0,
      filename: `${resumeData.personal.name.replace(/\s+/g, '_')}_curriculo.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { scale: 4, useCORS: true, letterRendering: true, scrollY: 0 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    html2pdf().from(element).set(opt).save().then(() => {
        setIsGeneratingPdf(false);
    });
  };

  const handleReset = () => {
    if (window.confirm("Tem certeza que deseja restaurar os dados para o padrão? Todo o seu progresso atual será perdido.")) {
        localStorage.removeItem('resumeData');
        localStorage.removeItem('uiConfig');
        resetResumeData(initialResumeData);
        resetUiConfig(initialUiConfig);
        addToast('Restaurado para o padrão.', 'info');
    }
  };
  
  const handleUndo = () => {
    undoResume();
    undoUi();
  };
  
  const handleRedo = () => {
    redoResume();
    redoUi();
  };

  const scrollToSection = useCallback((sectionId: string) => {
    const sectionElement = document.getElementById(sectionId);
    const mainPanel = mainPanelRef.current;
    
    if (sectionElement && mainPanel) {
        // Calculate position relative to the scroll container for accuracy
        const containerRect = mainPanel.getBoundingClientRect();
        const elementRect = sectionElement.getBoundingClientRect();
        const relativeTop = elementRect.top - containerRect.top + mainPanel.scrollTop;

        mainPanel.scrollTo({
            top: relativeTop - 20, // 20px offset from the top
            behavior: 'smooth'
        });
    }
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col font-sans text-gray-800 dark:text-gray-200 overflow-hidden">
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm px-4 py-2 flex justify-between items-center z-20 border-b border-gray-200 dark:border-gray-700/80 flex-shrink-0">
            <h1 className="text-xl font-bold tracking-tight text-gray-800 dark:text-gray-100">AI Resume Studio</h1>
            <div className="flex items-center gap-4">
                 <div className="flex items-center gap-1">
                    <button
                        onClick={handleUndo}
                        disabled={!canUndoResume && !canUndoUi}
                        className="p-2 rounded-lg transition-colors duration-200 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Desfazer"
                        title="Desfazer (Ctrl+Z)"
                    >
                        <UndoIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleRedo}
                        disabled={!canRedoResume && !canRedoUi}
                        className="p-2 rounded-lg transition-colors duration-200 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Refazer"
                        title="Refazer (Ctrl+Y)"
                    >
                        <RedoIcon className="w-5 h-5" />
                    </button>
                </div>
                 <div className="w-px h-6 bg-gray-200 dark:bg-gray-600"></div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg transition-colors duration-200 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                        aria-label="Toggle dark mode"
                    >
                        {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={handleReset}
                        className="p-2 rounded-lg transition-colors duration-200 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                        aria-label="Resetar"
                    >
                        <RefreshIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleGeneratePdf}
                        disabled={isGeneratingPdf}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-wait text-white font-bold py-2 px-4 rounded-lg flex items-center transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                        {isGeneratingPdf ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Gerando...
                            </>
                        ) : (
                            <>
                                <DownloadIcon className="w-5 h-5 mr-2" />
                                Baixar PDF
                            </>
                        )}
                    </button>
                </div>
            </div>
        </header>
        <div className="flex-1 flex overflow-hidden">
            <LeftSidebar 
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                resumeData={resumeData}
                setResumeData={setResumeData}
                scrollToSection={scrollToSection}
            />
            <main ref={mainPanelRef} className="flex-1 bg-gray-100 dark:bg-gray-900 overflow-y-auto p-4 sm:p-6 lg:p-8">
                <div className="max-w-[210mm] mx-auto">
                     <div className="transform origin-top scale-[0.8] sm:scale-[0.9] lg:scale-[1] transition-transform duration-300">
                        <ResumePreview ref={resumePreviewRef} resumeData={resumeData} uiConfig={uiConfig} />
                    </div>
                </div>
            </main>
            <aside className={`transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-hidden ${activeSection ? 'w-[420px]' : 'w-0'}`}>
                {activeSection && (
                     <div className="p-6 h-full overflow-y-auto w-[420px]">
                        <FormPanel 
                            activeSection={activeSection}
                            resumeData={resumeData}
                            setResumeData={setResumeData}
                            uiConfig={uiConfig}
                            setUiConfig={setUiConfig}
                            onClose={() => setActiveSection(null)}
                        />
                    </div>
                )}
            </aside>
        </div>
    </div>
  );
};

const App: React.FC = () => (
    <ToastProvider>
        <MainApp />
    </ToastProvider>
);

export default App;