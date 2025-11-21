import React, { useRef, useState, useEffect } from 'react';
import type { ResumeData, SectionType } from '../types';
import {
    UserIcon, BriefcaseIcon, AcademicCapIcon, CodeBracketIcon, SparklesIcon,
    LanguageIcon as LanguageIconComponent, DocumentTextIcon, PlusIcon, PaintBrushIcon, GripVerticalIcon
} from './icons';
import { generateId } from '../utils';

interface LeftSidebarProps {
    activeSection: string | null;
    setActiveSection: (sectionId: string | null) => void;
    resumeData: ResumeData;
    setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
    scrollToSection: (sectionId: string) => void;
    isMobile?: boolean;
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
    { type: 'summary', label: 'Resumo', icon: <DocumentTextIcon className="w-5 h-5 mr-3 text-blue-400" /> },
    { type: 'experience', label: 'Experiência', icon: <BriefcaseIcon className="w-5 h-5 mr-3 text-purple-400" /> },
    { type: 'education', label: 'Formação', icon: <AcademicCapIcon className="w-5 h-5 mr-3 text-green-400" /> },
    { type: 'projects', label: 'Projetos', icon: <CodeBracketIcon className="w-5 h-5 mr-3 text-orange-400" /> },
    { type: 'skills', label: 'Habilidades', icon: <SparklesIcon className="w-5 h-5 mr-3 text-yellow-400" /> },
    { type: 'languages', label: 'Idiomas', icon: <LanguageIconComponent className="w-5 h-5 mr-3 text-pink-400" /> },
];


export const LeftSidebar: React.FC<LeftSidebarProps> = ({ activeSection, setActiveSection, resumeData, setResumeData, scrollToSection, isMobile }) => {
    const dragItem = useRef<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
    const addMenuRef = useRef<HTMLDivElement>(null);

    const handleSectionClick = (sectionId: string) => {
        setActiveSection(sectionId);
        if (!isMobile) {
            if (sectionId === 'appearance' || sectionId === 'personal') {
                scrollToSection('personal');
            } else {
                scrollToSection(sectionId);
            }
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
        if (relatedTarget && e.currentTarget.contains(relatedTarget)) return;
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
            summary: 'Resumo', experience: 'Experiência Profissional', education: 'Formação Acadêmica',
            skills: 'Habilidades', projects: 'Projetos', languages: 'Idiomas',
        };
        const newSection = { id: generateId(), type, title: defaultTitles[type], items: type === 'summary' ? [{ id: generateId(), text: ''}] : [] };
        setResumeData(prev => ({ ...prev, sections: [...prev.sections, newSection] }));
        handleSectionClick(newSection.id);
        setIsAddMenuOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) setIsAddMenuOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const navClasses = isMobile 
        ? "w-full h-full flex flex-col items-center py-6 space-y-2 bg-[#1e293b]"
        : "w-20 md:w-24 bg-gray-900/95 backdrop-blur-md border-r border-gray-700 flex flex-col items-center py-6 pb-56 md:pb-12 space-y-4 relative z-30 shadow-xl";
    
    const buttonClasses = (id: string) => isMobile 
        ? `w-full flex items-center justify-start text-left p-4 rounded-lg transition-all duration-200 text-lg gap-4 ${activeSection === id ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`
        : `p-3 w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-2xl transition-all duration-300 group ${activeSection === id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 scale-105' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`;
    
    const dragWrapperClasses = isMobile ? "flex flex-col w-full" : "flex items-center w-full justify-center group relative";

    return (
        <nav className={navClasses}>
            <div data-tour="sidebar-nav" className={`flex flex-col items-center w-full ${isMobile ? 'space-y-2 px-4' : 'space-y-4'}`}>
                <button onClick={() => handleSectionClick('appearance')} className={buttonClasses('appearance')} aria-label="Aparência" title="Aparência">
                    {sectionIcons['appearance']}
                    <span className={`font-medium ${isMobile ? 'block' : 'text-[9px] hidden md:block opacity-80'}`}>Design</span>
                </button>
                 <button onClick={() => handleSectionClick('personal')} className={buttonClasses('personal')} aria-label="Dados Pessoais" title="Dados Pessoais">
                    {sectionIcons['personal']}
                    <span className={`font-medium ${isMobile ? 'block' : 'text-[9px] hidden md:block opacity-80'}`}>Dados</span>
                </button>
            </div>
            
            <div className={`w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent my-2 ${isMobile ? 'px-4' : 'w-12'}`}></div>

            <div className={`flex-1 flex flex-col items-center w-full overflow-y-auto no-scrollbar ${isMobile ? 'space-y-2 px-4' : 'space-y-3'}`} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} onDragLeave={handleDragLeave}>
                {resumeData.sections.map((section, index) => (
                    <React.Fragment key={section.id}>
                        {dragOverIndex === index && <div className={`h-1 bg-blue-500 rounded-full transition-all animate-pulse ${isMobile ? 'w-full' : 'w-12'}`} />}
                        <div draggable onDragStart={(e) => handleDragStart(e, index)} onDragEnter={(e) => handleDragEnter(e, index)} className={dragWrapperClasses}>
                             <button onClick={() => handleSectionClick(section.id)} className={buttonClasses(section.id)} aria-label={section.title} title={section.title}>
                                {getSectionIcon(section.type)}
                                {isMobile && <span className="font-medium">{section.title}</span>}
                            </button>
                            <div className={`cursor-grab text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-gray-300 ${isMobile ? 'ml-auto' : 'absolute -left-2 top-1/2 -translate-y-1/2'}`}>
                                <GripVerticalIcon className="w-5 h-5"/>
                            </div>
                        </div>
                    </React.Fragment>
                ))}
                 {dragOverIndex === resumeData.sections.length && <div className={`h-1 bg-blue-500 rounded-full transition-all animate-pulse ${isMobile ? 'w-full' : 'w-12'}`} />}
            </div>

            <div className={`relative mt-auto ${isMobile ? 'w-full px-4' : ''}`} ref={addMenuRef} data-tour="sidebar-add">
                 {isAddMenuOpen && (
                    <div className={`absolute w-64 bg-[#1e293b] glass-hover backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-600/50 p-3 z-50 animate-in fade-in duration-200 ${isMobile ? 'bottom-full mb-4 left-0' : 'left-full bottom-0 ml-4 slide-in-from-left-5'}`}>
                        <p className="text-xs font-bold text-gray-400 px-3 pb-3 pt-1 border-b border-gray-700/50 mb-2 tracking-wider uppercase">Adicionar Seção</p>
                        <div className="grid grid-cols-1 gap-1">
                            {availableSections.map(s => (
                                <button key={s.type} onClick={() => handleAddSection(s.type)} className="flex items-center text-left px-3 py-2.5 text-sm text-gray-300 hover:bg-blue-600 hover:text-white rounded-xl transition-all duration-200 group">
                                    <span className="group-hover:scale-110 transition-transform duration-200">{s.icon}</span>
                                    <span className="font-medium">{s.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                <button onClick={() => setIsAddMenuOpen(prev => !prev)} className={`flex items-center justify-center rounded-2xl transition-all duration-200 border-2 border-dashed ${isAddMenuOpen ? 'border-blue-500 bg-blue-500/10 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'border-gray-600 text-gray-400 hover:border-blue-500 hover:text-blue-400'} ${isMobile ? 'w-full h-16 text-lg gap-4' : 'p-3 w-14 h-14 md:w-16 md:h-16'}`} aria-label="Adicionar Seção" title="Adicionar Seção">
                    <PlusIcon className={`w-6 h-6 transition-transform duration-300 ${isAddMenuOpen ? 'rotate-45' : ''}`} />
                    {isMobile && <span className="font-bold">Adicionar Seção</span>}
                </button>
            </div>
        </nav>
    );
};