import React, { useState, useRef, useEffect } from 'react';
import type { ResumeData, UiConfig, Experience, Education, Skill, ResumeSection, Project, Language, SectionType, PhotoConfig, SummaryItem } from '../types';
import { ChevronDownIcon, ChevronUpIcon, TrashIcon, XMarkIcon, GripVerticalIcon, PencilIcon, ArrowLeftIcon } from './icons';
import { TemplateThumbnails } from './TemplateThumbnails';
import { useToast } from './Toast';
import { PhotoEditorModal } from './PhotoEditorModal';
import { generateId } from '../utils';

interface FormPanelProps {
    activeSection: string;
    resumeData: ResumeData;
    setResumeData: (value: ResumeData | ((prevState: ResumeData) => ResumeData), skipHistory?: boolean) => void;
    uiConfig: UiConfig;
    setUiConfig: (value: UiConfig | ((prevState: UiConfig) => UiConfig), skipHistory?: boolean) => void;
    onClose: () => void;
    isMobile?: boolean;
    onNavigateSection?: (sectionId: string) => void;
    nextSection?: { id: string; label: string } | null;
    prevSection?: { id: string; label: string } | null;
}

// Re-usable form components
const InputField: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; type?: string; }> = ({ label, name, value, onChange, placeholder, type = 'text' }) => (
    <div className="mb-4">
        <label htmlFor={name} className="block text-sm font-medium mb-1.5 text-gray-300">{label}</label>
        <input type={type} id={name} name={name} value={value} onChange={onChange} placeholder={placeholder} className="w-full px-3 py-2 border border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-sm bg-gray-700/50 text-gray-100 transition-all duration-200" />
    </div>
);

const TextAreaField: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; placeholder?: string; rows?: number; }> = ({ label, name, value, onChange, placeholder, rows = 4 }) => (
    <div className="mb-4">
        <label htmlFor={name} className="block text-sm font-medium mb-1.5 text-gray-300">{label}</label>
        <textarea id={name} name={name} value={value} onChange={onChange} placeholder={placeholder} rows={rows} className="w-full px-3 py-2 border border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-sm resize-y bg-gray-700/50 text-gray-100 transition-all duration-200" />
    </div>
);

const RangeSlider: React.FC<{ label: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; min?: number; max?: number; step?: number; }> = ({ label, value, onChange, min = 10, max = 20, step = 1 }) => (
    <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-300">{label}</label>
            <span className="text-sm font-semibold text-blue-300 bg-blue-900/50 px-2 py-0.5 rounded-full">{value}px</span>
        </div>
        <input
            type="range"
            value={value}
            onChange={onChange}
            min={min}
            max={max}
            step={step}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
    </div>
);

// Specific Form Components for each section type
const AppearanceForm: React.FC<Pick<FormPanelProps, 'uiConfig' | 'setUiConfig'>> = ({ uiConfig, setUiConfig }) => {
    const [isPhotoEditorOpen, setIsPhotoEditorOpen] = useState(false);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setUiConfig(prev => ({ ...prev, photo: { ...prev.photo, src: event.target?.result as string, zoom: 100, position: '50% 50%' } }));
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const [localBgColor, setLocalBgColor] = useState(uiConfig.backgroundColor);
    const [localAccentColor, setLocalAccentColor] = useState(uiConfig.accentColor);
    const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Atualiza estados locais se uiConfig mudar externamente
    useEffect(() => {
        setLocalBgColor(uiConfig.backgroundColor);
    }, [uiConfig.backgroundColor]);

    useEffect(() => {
        setLocalAccentColor(uiConfig.accentColor);
    }, [uiConfig.accentColor]);

    const handleUiChangeDebounced = (key: keyof UiConfig, value: any) => {
        if (key === 'backgroundColor') setLocalBgColor(value);
        if (key === 'accentColor') setLocalAccentColor(value);

        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        debounceTimeoutRef.current = setTimeout(() => {
            setUiConfig(prev => ({ ...prev, [key]: value }), true);
        }, 80); // Pequeno debounce de 80ms para evitar re-renderizações e layout shift pesados do Preview
    };

    const handleUiChange = (key: keyof UiConfig, value: any) => {
        setUiConfig(prev => ({ ...prev, [key]: value }), true);
    };

    const handlePhotoChange = (key: keyof PhotoConfig, value: any) => {
        setUiConfig(prev => ({ ...prev, photo: { ...prev.photo, [key]: value } }));
    };

    const handleSavePhotoConfig = (newConfig: PhotoConfig) => {
        setUiConfig(prev => ({ ...prev, photo: newConfig }));
        setIsPhotoEditorOpen(false);
    };

    const handleSectionSizeChange = (section: keyof UiConfig['sectionSizes'], value: string) => {
        setUiConfig(prev => ({
            ...prev,
            sectionSizes: {
                ...prev.sectionSizes,
                [section]: parseInt(value, 10)
            }
        }));
    };

    return (
        <>
            {uiConfig.photo.src && (
                <PhotoEditorModal
                    isOpen={isPhotoEditorOpen}
                    onClose={() => setIsPhotoEditorOpen(false)}
                    onSave={handleSavePhotoConfig}
                    photoConfig={uiConfig.photo}
                />
            )}
            <div className="space-y-8">
                <div>
                    <h3 className="text-lg font-semibold text-gray-100 mb-4">Aparência e Modelo</h3>
                    <TemplateThumbnails
                        currentTemplate={uiConfig.template}
                        onSelectTemplate={(template) => handleUiChange('template', template)}
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-300">Cor de Fundo</label>
                        <div className="relative">
                            <input 
                                type="color" 
                                value={localBgColor} 
                                onChange={e => handleUiChangeDebounced('backgroundColor', e.target.value)} 
                                className="w-full h-10 p-0 border border-gray-600 rounded-lg cursor-pointer bg-gray-700 overflow-hidden" 
                            />
                            <span className="absolute top-1/2 left-3 -translate-y-1/2 uppercase text-xs font-mono text-gray-400 pointer-events-none mix-blend-difference">{localBgColor}</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-300">Cor de Destaque</label>
                        <div className="relative">
                            <input 
                                type="color" 
                                value={localAccentColor} 
                                onChange={e => handleUiChangeDebounced('accentColor', e.target.value)} 
                                className="w-full h-10 p-0 border border-gray-600 rounded-lg cursor-pointer bg-gray-700 overflow-hidden" 
                            />
                            <span className="absolute top-1/2 left-3 -translate-y-1/2 uppercase text-xs font-mono text-gray-400 pointer-events-none mix-blend-difference">{localAccentColor}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800/40 p-3 rounded-xl border border-gray-700/60">
                    <span className="block text-xs font-bold text-gray-300 mb-2 uppercase tracking-wider">Paletas Rápidas</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                            { name: 'Navy Executivo', bg: '#ffffff', accent: '#1e3a8a' },
                            { name: 'Cyber Green', bg: '#ffffff', accent: '#10b981' },
                            { name: 'Modern Indigo', bg: '#ffffff', accent: '#6366f1' },
                            { name: 'Vinho Nobre', bg: '#ffffff', accent: '#881337' },
                            { name: 'Slate Minimal', bg: '#ffffff', accent: '#475569' },
                            { name: 'Sunset Âmbar', bg: '#ffffff', accent: '#d97706' },
                        ].map(preset => (
                            <button
                                key={preset.name}
                                type="button"
                                onClick={() => {
                                    handleUiChangeDebounced('accentColor', preset.accent);
                                    handleUiChangeDebounced('backgroundColor', preset.bg);
                                }}
                                className="flex items-center gap-2 p-2 bg-gray-700/50 hover:bg-gray-700 active:bg-gray-600 border border-gray-600 rounded-lg text-xs font-medium text-gray-200 transition-all hover:border-blue-500"
                            >
                                <span className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm flex-shrink-0" style={{ backgroundColor: preset.accent }} />
                                <span className="truncate">{preset.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-100 mb-4">Foto de Perfil</h3>
                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-300">Carregar Foto</label>
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-900/50 file:text-blue-300 hover:file:bg-blue-900" />
                    </div>
                    {uiConfig.photo.src && (
                        <div className="flex items-center gap-4 mt-4 p-2 bg-gray-700/50 rounded-lg border border-gray-600">
                            <div className={`relative w-16 h-16 overflow-hidden ${uiConfig.photo.style}`}>
                                <img
                                    src={uiConfig.photo.src}
                                    alt="Prévia da foto"
                                    className="absolute w-full h-full object-cover"
                                    style={{
                                        objectPosition: uiConfig.photo.position,
                                        transform: `scale(${uiConfig.photo.zoom / 100})`,
                                    }}
                                />
                            </div>
                            <div className="flex-1">
                                <button
                                    onClick={() => setIsPhotoEditorOpen(true)}
                                    className="flex items-center text-sm font-semibold text-blue-400 hover:text-blue-300"
                                >
                                    <PencilIcon className="w-4 h-4 inline-block mr-1.5" />
                                    Ajustar Posição e Zoom
                                </button>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center mt-4">
                        <input type="checkbox" id="showPhoto" checked={uiConfig.photo.show} onChange={e => handlePhotoChange('show', e.target.checked)} className="h-4 w-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-600" />
                        <label htmlFor="showPhoto" className="ml-2 block text-sm text-gray-300">Mostrar foto no currículo</label>
                    </div>
                    <div className="mt-4">
                        <label htmlFor="photoStyle" className="block text-sm font-medium mb-1.5 text-gray-300">Estilo da Foto</label>
                        <select id="photoStyle" value={uiConfig.photo.style} onChange={e => handlePhotoChange('style', e.target.value as PhotoConfig['style'])} className="w-full px-3 py-2 border border-gray-600 rounded-lg shadow-sm bg-gray-700/50 text-gray-100 focus:ring-blue-500 focus:border-blue-500">
                            <option value="rounded-full">Redonda</option>
                            <option value="rounded-lg">Quadrada (Bordas arredondadas)</option>
                            <option value="rounded-none">Quadrada</option>
                        </select>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-100 mb-4">Tamanhos de Fonte</h3>
                    <RangeSlider label="Nome" value={uiConfig.sectionSizes.name} onChange={e => handleSectionSizeChange('name', e.target.value)} min={24} max={48} />
                    <RangeSlider label="Cargo" value={uiConfig.sectionSizes.jobTitle} onChange={e => handleSectionSizeChange('jobTitle', e.target.value)} min={16} max={32} />
                    <RangeSlider label="Título da Seção" value={uiConfig.sectionSizes.sectionTitle} onChange={e => handleSectionSizeChange('sectionTitle', e.target.value)} min={18} max={36} />
                </div>
            </div>
        </>
    );
};

const PersonalInfoForm: React.FC<Pick<FormPanelProps, 'resumeData' | 'setResumeData'>> = ({ resumeData, setResumeData }) => {

    const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setResumeData(prev => ({ ...prev, personal: { ...prev.personal, [name]: value } }));
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-100">Dados Pessoais</h3>
            <InputField label="Nome Completo" name="name" value={resumeData.personal.name} onChange={handlePersonalChange} />
            <InputField label="Cargo" name="jobTitle" value={resumeData.personal.jobTitle} onChange={handlePersonalChange} placeholder="Ex: Desenvolvedor Front-end" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Email" name="email" value={resumeData.personal.email} onChange={handlePersonalChange} type="email" />
                <InputField label="Telefone" name="phone" value={resumeData.personal.phone} onChange={handlePersonalChange} />
            </div>
            <InputField label="Localização" name="location" value={resumeData.personal.location} onChange={handlePersonalChange} placeholder="Ex: São Paulo, SP" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="LinkedIn" name="linkedin" value={resumeData.personal.linkedin} onChange={handlePersonalChange} placeholder="linkedin.com/in/seu-usuario" />
                <InputField label="GitHub" name="github" value={resumeData.personal.github} onChange={handlePersonalChange} placeholder="github.com/seu-usuario" />
            </div>
            <InputField label="Website/Portfólio" name="website" value={resumeData.personal.website} onChange={handlePersonalChange} />
        </div>
    );
};

interface SectionFormProps extends Pick<FormPanelProps, 'resumeData' | 'setResumeData'> {
    section: ResumeSection;
    onDeleteSection: () => void;
    isMobile?: boolean;
}

const SectionForm: React.FC<SectionFormProps> = ({ section, resumeData, setResumeData, onDeleteSection, isMobile }) => {
    const [collapsedItems, setCollapsedItems] = useState<Record<string, boolean>>({});
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    const toggleCollapse = (itemId: string) => {
        setCollapsedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
    };

    const moveItem = (index: number, direction: 'up' | 'down') => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= section.items.length) return;
        const newItems = [...section.items];
        const temp = newItems[index];
        newItems[index] = newItems[targetIndex];
        newItems[targetIndex] = temp;
        setResumeData(prev => ({
            ...prev,
            sections: prev.sections.map(s => s.id === section.id ? { ...s, items: newItems } : s)
        }));
    };

    // Generic Handlers
    const handleItemChange = (itemId: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setResumeData(prev => ({
            ...prev,
            sections: prev.sections.map(s => s.id === section.id
                ? { ...s, items: s.items.map((item: any) => item.id === itemId ? { ...item, [name]: value } : item) as any }
                : s
            )
        }));
    };

    const addItem = () => {
        let newItem;
        const id = generateId();
        const baseItems = {
            summary: { id, text: '' },
            experience: { id, company: '', role: '', startDate: '', endDate: '', description: '' },
            education: { id, institution: '', degree: '', startDate: '', endDate: '', description: '' },
            skills: { id, name: '' },
            projects: { id, name: '', link: '', description: '' },
            languages: { id, language: '', proficiency: '' },
        };
        newItem = baseItems[section.type];
        if (!newItem) return;

        setResumeData(prev => ({
            ...prev,
            sections: prev.sections.map(s => s.id === section.id ? { ...s, items: [...s.items, newItem] } : s)
        }));
        setCollapsedItems(prev => ({ ...prev, [id]: false })); // Open new item by default
    };

    const removeItem = (itemId: string) => {
        setResumeData(prev => ({
            ...prev,
            sections: prev.sections.map(s => s.id === section.id
                ? { ...s, items: s.items.filter((item: any) => item.id !== itemId) as any }
                : s
            )
        }));
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setResumeData(prev => ({
            ...prev,
            sections: prev.sections.map(s => s.id === section.id ? { ...s, title: e.target.value } : s)
        }));
    };

    // Drag and Drop for items
    const handleDragStart = (e: React.DragEvent, position: number) => { dragItem.current = position; };
    const handleDragEnter = (e: React.DragEvent, position: number) => { dragOverItem.current = position; };
    const handleDrop = (e: React.DragEvent) => {
        if (dragItem.current === null || dragOverItem.current === null) return;
        const newItems = [...section.items];
        const dragItemContent = newItems.splice(dragItem.current, 1)[0];
        newItems.splice(dragOverItem.current, 0, dragItemContent);
        dragItem.current = null;
        dragOverItem.current = null;
        setResumeData(prev => ({
            ...prev,
            sections: prev.sections.map(s => s.id === section.id ? { ...s, items: newItems } : s)
        }));
    };

    const renderItemContent = (item: any) => {
        switch (section.type) {
            case 'summary': return (
                <TextAreaField
                    label="Resumo Profissional"
                    name="text"
                    value={item.text}
                    onChange={e => handleItemChange(item.id, e)}
                    rows={8}
                />
            );
            case 'experience': return (
                <>
                    <InputField label="Empresa" name="company" value={item.company} onChange={e => handleItemChange(item.id, e)} />
                    <InputField label="Cargo" name="role" value={item.role} onChange={e => handleItemChange(item.id, e)} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField label="Data de Início" name="startDate" type="month" value={item.startDate} onChange={e => handleItemChange(item.id, e)} />
                        <InputField label="Data de Fim" name="endDate" value={item.endDate} onChange={e => handleItemChange(item.id, e)} placeholder="Presente" />
                    </div>
                    <TextAreaField
                        label="Descrição"
                        name="description"
                        value={item.description}
                        onChange={e => handleItemChange(item.id, e)}
                    />
                </>
            );
            case 'education': return (
                <>
                    <InputField label="Instituição" name="institution" value={item.institution} onChange={e => handleItemChange(item.id, e)} />
                    <InputField label="Grau / Curso" name="degree" value={item.degree} onChange={e => handleItemChange(item.id, e)} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField label="Data de Início" name="startDate" type="month" value={item.startDate} onChange={e => handleItemChange(item.id, e)} />
                        <InputField label="Data de Fim" name="endDate" value={item.endDate} onChange={e => handleItemChange(item.id, e)} placeholder="Cursando" />
                    </div>
                    <TextAreaField label="Descrição (Opcional)" name="description" value={item.description} onChange={e => handleItemChange(item.id, e)} rows={2} />
                </>
            );
            case 'projects': return (
                <>
                    <InputField label="Nome do Projeto" name="name" value={item.name} onChange={e => handleItemChange(item.id, e)} />
                    <InputField label="Link" name="link" value={item.link} onChange={e => handleItemChange(item.id, e)} placeholder="https://github.com/..." />
                    <TextAreaField
                        label="Descrição"
                        name="description"
                        value={item.description}
                        onChange={e => handleItemChange(item.id, e)}
                    />
                </>
            );
            case 'languages': return (
                <div className="flex gap-4">
                    <InputField label="Idioma" name="language" value={item.language} onChange={e => handleItemChange(item.id, e)} />
                    <InputField label="Proficiência" name="proficiency" value={item.proficiency} onChange={e => handleItemChange(item.id, e)} />
                </div>
            );
            default: return null;
        }
    };

    const getItemTitle = (item: any) => {
        switch (section.type) {
            case 'summary': return 'Resumo';
            case 'experience': return item.role || 'Nova Experiência';
            case 'education': return item.degree || 'Nova Formação';
            case 'projects': return item.name || 'Novo Projeto';
            case 'languages': return item.language || 'Novo Idioma';
            default: return 'Item';
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <input
                    type="text"
                    value={section.title}
                    onChange={handleTitleChange}
                    className="text-xl font-semibold bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md px-2 py-1 w-full"
                />
                <div className="flex items-center gap-2">
                    <button
                        onClick={onDeleteSection}
                        className="p-2 text-red-400 hover:text-red-500 hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Excluir Seção"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                    {section.type !== 'summary' && (
                        <button
                            onClick={addItem}
                            className="flex items-center text-sm font-semibold text-blue-400 hover:text-blue-300 ml-2 whitespace-nowrap"
                        >
                            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            Adicionar
                        </button>
                    )}
                </div>
            </div>
            {section.type === 'skills' ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(section.items as Skill[]).map(skill => (
                            <div key={skill.id} className="flex items-center bg-gray-700/80 p-1.5 border border-gray-600 rounded-md focus-within:border-blue-500 transition-colors">
                                <input
                                    type="text"
                                    value={skill.name}
                                    onChange={e => handleItemChange(skill.id, e)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addItem();
                                        }
                                    }}
                                    placeholder="Ex: React, Python..."
                                    className="w-full bg-transparent focus:outline-none text-sm px-1.5 py-0.5 placeholder-gray-500"
                                    name="name"
                                />
                                <button onClick={() => removeItem(skill.id)} className="p-1 text-red-400 hover:text-red-500 hover:bg-red-900/20 rounded transition-colors" aria-label="Remover habilidade"><TrashIcon className="w-4 h-4" /></button>
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={addItem}
                        className="mt-3 w-full py-2.5 border-2 border-dashed border-gray-600 hover:border-blue-500 hover:bg-blue-500/5 rounded-lg text-sm text-gray-400 hover:text-blue-400 transition-colors flex items-center justify-center gap-1.5 font-medium"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        Adicionar Habilidade
                    </button>
                </>
            ) : section.type === 'summary' ? (
                <div>{renderItemContent(section.items[0])}</div>
            ) : (
                <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
                    {section.items.map((item: any, index) => (
                        <div
                            key={item.id}
                            draggable={!isMobile}
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragEnter={(e) => handleDragEnter(e, index)}
                            className="p-3.5 border border-gray-700 rounded-xl mb-4 bg-gray-800/40 relative group transition-all"
                        >
                            <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-gray-700/50">
                                <button
                                    type="button"
                                    onClick={() => toggleCollapse(item.id)}
                                    className="flex-1 flex items-center justify-between text-left font-semibold text-gray-200 py-1 rounded-lg hover:text-blue-400 transition-colors min-w-0"
                                >
                                    <span className="truncate pr-2">{getItemTitle(item)}</span>
                                    {collapsedItems[item.id] ? <ChevronDownIcon className="w-5 h-5 flex-shrink-0 text-gray-400" /> : <ChevronUpIcon className="w-5 h-5 flex-shrink-0 text-gray-400" />}
                                </button>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => moveItem(index, 'up')}
                                        disabled={index === 0}
                                        className="p-1.5 text-gray-400 hover:text-white disabled:opacity-20 rounded-lg hover:bg-gray-700/60 active:bg-gray-600 transition-colors"
                                        title="Mover para cima"
                                        aria-label="Mover para cima"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                                        </svg>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => moveItem(index, 'down')}
                                        disabled={index === section.items.length - 1}
                                        className="p-1.5 text-gray-400 hover:text-white disabled:opacity-20 rounded-lg hover:bg-gray-700/60 active:bg-gray-600 transition-colors"
                                        title="Mover para baixo"
                                        aria-label="Mover para baixo"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => removeItem(item.id)}
                                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/40 rounded-lg transition-colors"
                                        aria-label="Remover item"
                                        title="Remover item"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                    {!isMobile && (
                                        <div className="cursor-grab p-1 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Reordenar">
                                            <GripVerticalIcon className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            {!collapsedItems[item.id] && <div className="mt-2">{renderItemContent(item)}</div>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export const FormPanel: React.FC<FormPanelProps> = ({
    activeSection,
    resumeData,
    setResumeData,
    uiConfig,
    setUiConfig,
    onClose,
    isMobile,
    onNavigateSection,
    nextSection,
    prevSection
}) => {

    const handleDeleteSection = (sectionId: string) => {
        if (confirm('Tem certeza que deseja excluir esta seção inteira?')) {
            setResumeData(prev => ({
                ...prev,
                sections: prev.sections.filter(s => s.id !== sectionId)
            }));
            onClose();
        }
    };

    const renderContent = () => {
        if (activeSection === 'appearance') {
            return <AppearanceForm uiConfig={uiConfig} setUiConfig={setUiConfig} />;
        }
        if (activeSection === 'personal') {
            return <PersonalInfoForm
                resumeData={resumeData}
                setResumeData={setResumeData}
            />;
        }

        const sectionData = resumeData.sections.find(s => s.id === activeSection);
        if (sectionData) {
            return <SectionForm
                section={sectionData}
                resumeData={resumeData}
                setResumeData={setResumeData}
                onDeleteSection={() => handleDeleteSection(activeSection)}
                isMobile={isMobile}
            />;
        }

        return null;
    };

    return (
        <div className="h-full flex flex-col bg-[#1e293b] border-r border-gray-700 shadow-xl relative" data-tour="form-panel">
            {!isMobile && (
                <div className="flex justify-between items-center px-6 pt-6 pb-2 flex-shrink-0 z-10">
                    <div></div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full text-gray-400 hover:bg-gray-700 transition-colors"
                        aria-label="Fechar painel"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
            )}
            <div className={`flex-1 overflow-y-auto px-4 sm:px-6 custom-scrollbar w-full ${isMobile ? 'pt-4 pb-28' : 'pb-6'}`}>
                {renderContent()}

                {isMobile && onNavigateSection && (
                    <div className="mt-8 pt-4 pb-4 border-t border-gray-700/60 flex items-center justify-between gap-3">
                        {prevSection ? (
                            <button
                                type="button"
                                onClick={() => onNavigateSection(prevSection.id)}
                                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-gray-300 rounded-xl text-xs font-semibold transition-colors shadow-sm"
                            >
                                <span>←</span>
                                <span className="truncate max-w-[110px]">{prevSection.label}</span>
                            </button>
                        ) : <div />}

                        {nextSection && (
                            <button
                                type="button"
                                onClick={() => onNavigateSection(nextSection.id)}
                                className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-900/40 transition-all active:scale-95 ml-auto"
                            >
                                <span className="truncate max-w-[140px]">Avançar: {nextSection.label}</span>
                                <span>→</span>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};