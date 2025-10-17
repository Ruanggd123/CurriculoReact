
import React, { useRef, useState, useEffect } from 'react';
import type { ResumeData, SectionType } from '../types';
import {
    UserIcon, BriefcaseIcon, AcademicCapIcon, CodeBracketIcon, SparklesIcon,
    LanguageIcon as LanguageIconComponent, DocumentTextIcon, PlusIcon, PaintBrushIcon, GripVerticalIcon
} from './icons';

interface LeftSidebarProps {
    activeSection: string | null;
    setActiveSection: (sectionId: string | null) => void;
    resumeData: ResumeData;
    setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
    scrollToSection: (sectionId: string) => void;
}

const sectionIcons: Record<string, React.ReactNode> = {
    'appearance': <PaintBrushIcon className="w-6 h-6" />,
    'personal': <UserIcon className="w-6 h-6" />,
    'summary': <DocumentTextIcon className="w-6 h-6" />,
    'experience': <BriefcaseIcon className="w-6 h-6" />,
    'education': <AcademicCapIcon className="w-6 h-6" />,
    'skills': <SparklesIcon className="w-6 h-6" />,
    'projects': <CodeBracketIcon className="w-6 h-6" />,
    'languages': <LanguageIconComponent className="w-6 h-6" />,
};

const getSectionIcon = (type: SectionType) => sectionIcons[type] || <DocumentTextIcon className="w-6 h-6" />;

const availableSections: { type: SectionType; label: string; icon: React.ReactNode; }[] = [
    { type: 'experience', label: 'Experiência', icon: <BriefcaseIcon className="w-5 h-5 mr-3" /> },
    { type: 'education', label: 'Formação', icon: <AcademicCapIcon className="w-5 h-5 mr-3" /> },
    { type: 'projects', label: 'Projetos', icon: <CodeBracketIcon className="w-5 h-5 mr-3" /> },
    { type: 'skills', label: 'Habilidades', icon: <SparklesIcon className="w-5 h-5 mr-3" /> },
    { type: 'languages', label: 'Idiomas', icon: <LanguageIconComponent className="w-5 h-5 mr-3" /> },
];


export const LeftSidebar: React.FC<LeftSidebarProps> = ({ activeSection, setActiveSection, resumeData, setResumeData, scrollToSection }) => {
    const dragItem = useRef<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
    const addMenuRef = useRef<HTMLDivElement>(null);

    const handleSectionClick = (sectionId: string) => {
        setActiveSection(sectionId);
        // When editing appearance, scroll to the top of the resume (personal section)
        // to provide immediate visual feedback on the most affected areas like the photo and header.
        if (sectionId === 'appearance') {
            scrollToSection('personal');
        } else {
            scrollToSection(sectionId);
        }
    };

    const handleDragStart = (e: React.DragEvent, position: number) => {
        dragItem.current = position;
        e.dataTransfer.effectAllowed = 'move';
    };
    
    const handleDragEnter = (e: React.DragEvent, position: number) => {
        e.preventDefault();
        setDragOverIndex(position);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        const relatedTarget = e.relatedTarget as Node;
        if (relatedTarget && e.currentTarget.contains(relatedTarget)) {
            return;
        }
        setDragOverIndex(null);
    };
    
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (dragItem.current !== null && dragOverIndex !== null) {
            const newSections = [...resumeData.sections];
            const dragItemContent = newSections.splice(dragItem.current, 1)[0];
            newSections.splice(dragOverIndex, 0, dragItemContent);
            setResumeData(prev => ({ ...prev, sections: newSections }));
        }
        dragItem.current = null;
        setDragOverIndex(null);
    };

    const handleAddSection = (type: SectionType) => {
        const defaultTitles: Record<SectionType, string> = {
            experience: 'Experiência Profissional',
            education: 'Formação Acadêmica',
            skills: 'Habilidades',
            projects: 'Projetos',
            languages: 'Idiomas',
        };
        const newSection = {
            id: crypto.randomUUID(),
            type: type,
            title: defaultTitles[type],
            items: [],
        };
        setResumeData(prev => ({
            ...prev,
            sections: [...prev.sections, newSection]
        }));
        handleSectionClick(newSection.id);
        setIsAddMenuOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
                setIsAddMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <nav className="w-20 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center py-4 space-y-2">
            <button
                onClick={() => handleSectionClick('appearance')}
                className={`p-3 rounded-xl transition-colors duration-200 ${activeSection === 'appearance' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                aria-label="Aparência"
                title="Aparência"
            >
                {sectionIcons['appearance']}
            </button>
             <button
                onClick={() => handleSectionClick('personal')}
                className={`p-3 rounded-xl transition-colors duration-200 ${activeSection === 'personal' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                aria-label="Informações Pessoais"
                title="Informações Pessoais"
            >
                {sectionIcons['personal']}
            </button>

            <div className="w-full border-t border-gray-200 dark:border-gray-600 my-2"></div>

            <div 
                className="flex-1 flex flex-col items-center space-y-2 w-full" 
                onDrop={handleDrop} 
                onDragOver={(e) => e.preventDefault()}
                onDragLeave={handleDragLeave}
            >
                {resumeData.sections.map((section, index) => (
                    <React.Fragment key={section.id}>
                        {dragOverIndex === index && <div className="h-1 w-12 bg-blue-500 rounded-full transition-all" />}
                        <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragEnter={(e) => handleDragEnter(e, index)}
                            className="flex items-center w-full justify-center group"
                        >
                            <button
                                onClick={() => handleSectionClick(section.id)}
                                className={`p-3 rounded-xl transition-colors duration-200 ${activeSection === section.id ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                aria-label={section.title}
                                title={section.title}
                            >
                                {getSectionIcon(section.type)}
                            </button>
                            <div className="cursor-grab text-gray-300 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <GripVerticalIcon className="w-5 h-5" />
                            </div>
                        </div>
                    </React.Fragment>
                ))}
                 {dragOverIndex === resumeData.sections.length && <div className="h-1 w-12 bg-blue-500 rounded-full transition-all" />}
            </div>

            <div className="w-full border-t border-gray-200 dark:border-gray-600 my-2"></div>
            
            <div className="relative" ref={addMenuRef}>
                 {isAddMenuOpen && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 bg-white dark:bg-gray-700 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 p-2 z-30">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 pb-1">ADICIONAR SEÇÃO</p>
                        {availableSections.map(section => (
                            <button
                                key={section.type}
                                onClick={() => handleAddSection(section.type)}
                                className="w-full flex items-center text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors"
                            >
                                {section.icon}
                                {section.label}
                            </button>
                        ))}
                    </div>
                )}
                <button
                    onClick={() => setIsAddMenuOpen(prev => !prev)}
                    className="p-3 rounded-xl transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    aria-label="Adicionar Seção"
                    title="Adicionar Seção"
                >
                    <PlusIcon className="w-6 h-6" />
                </button>
            </div>
        </nav>
    );
};
