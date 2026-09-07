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
        <label htmlFor={name} className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-slate-300">{label}</label>
        <input 
            type={type} 
            id={name} 
            name={name} 
            value={value} 
            onChange={onChange} 
            placeholder={placeholder} 
            className="w-full px-3.5 py-2.5 border border-slate-700/70 hover:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-sm bg-slate-800/60 text-slate-100 placeholder-slate-500 transition-all duration-200 shadow-inner" 
        />
    </div>
);

const TextAreaField: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; placeholder?: string; rows?: number; }> = ({ label, name, value, onChange, placeholder, rows = 4 }) => (
    <div className="mb-4">
        <label htmlFor={name} className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-slate-300">{label}</label>
        <textarea 
            id={name} 
            name={name} 
            value={value} 
            onChange={onChange} 
            placeholder={placeholder} 
            rows={rows} 
            className="w-full px-3.5 py-2.5 border border-slate-700/70 hover:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-sm resize-y bg-slate-800/60 text-slate-100 placeholder-slate-500 transition-all duration-200 leading-relaxed shadow-inner" 
        />
    </div>
);

const RangeSlider: React.FC<{ label: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; min?: number; max?: number; step?: number; }> = ({ label, value, onChange, min = 10, max = 20, step = 1 }) => (
    <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">{label}</label>
            <span className="text-xs font-mono font-bold text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">{value}px</span>
        </div>
        <input
            type="range"
            value={value}
            onChange={onChange}
            min={min}
            max={max}
            step={step}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
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
            <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Dados Pessoais</h3>
                <p className="text-xs text-slate-400 mt-1">Todos os campos são opcionais. Campos em branco não aparecem no currículo.</p>
            </div>
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
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-700/60 gap-2">
                <input
                    type="text"
                    value={section.title}
                    onChange={handleTitleChange}
                    className="text-xl font-bold bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 rounded-lg px-2 py-1 flex-1 tracking-tight"
                />
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                        type="button"
                        onClick={onDeleteSection}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 active:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-all"
                        title="Excluir Seção Inteira"
                    >
                        <TrashIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Excluir Seção</span>
                    </button>
                    {section.type !== 'summary' && (
                        <button
                            type="button"
                            onClick={addItem}
                            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-900/30 transition-all active:scale-95 whitespace-nowrap"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            <span>Adicionar</span>
                        </button>
                    )}
                </div>
            </div>
            {section.type === 'summary' ? (
                <div className="space-y-3">
                    {renderItemContent(section.items[0] || { id: 'summary-1', text: '' })}
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-950/30 border border-blue-800/40 text-blue-200 text-xs leading-relaxed">
                        <span className="text-base flex-shrink-0">💡</span>
                        <p>Dica: O resumo é totalmente opcional. Se não quiser incluí-lo, basta deixar o texto em branco ou clicar em <strong>Excluir Seção</strong> acima para removê-lo completamente do currículo.</p>
                    </div>
                </div>
            ) : section.type === 'skills' ? (
                <>
                    {section.items.length === 0 ? (
                        <div className="text-center py-8 px-4 border-2 border-dashed border-slate-700/60 rounded-2xl bg-slate-800/20 my-4">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400 border border-slate-700">
                                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-sm font-semibold text-slate-200">Nenhuma habilidade adicionada</p>
                            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                                Seções vazias não aparecem no currículo nem no PDF gerado.
                            </p>
                            <button
                                type="button"
                                onClick={addItem}
                                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-900/30 transition-all active:scale-95"
                            >
                                + Adicionar Primeira Habilidade
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {(section.items as Skill[]).map(skill => (
                                <div key={skill.id} className="flex items-center bg-slate-800/80 p-2 border border-slate-700/70 hover:border-slate-600 rounded-xl focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all shadow-sm">
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
                                        className="w-full bg-transparent focus:outline-none text-sm px-2 py-0.5 text-slate-100 placeholder-slate-500"
                                        name="name"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeItem(skill.id)}
                                        className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                        aria-label="Remover habilidade"
                                        title="Remover habilidade"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={addItem}
                        className="mt-3 w-full py-2.5 border-2 border-dashed border-slate-700/80 hover:border-blue-500 hover:bg-blue-500/5 rounded-xl text-xs text-slate-400 hover:text-blue-400 transition-all flex items-center justify-center gap-1.5 font-bold"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        Adicionar Habilidade
                    </button>
                </>
            ) : (
                <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
                    {section.items.length === 0 ? (
                        <div className="text-center py-8 px-4 border-2 border-dashed border-slate-700/60 rounded-2xl bg-slate-800/20 my-4">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400 border border-slate-700">
                                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-sm font-semibold text-slate-200">Nenhum item nesta seção</p>
                            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                                Seções sem itens não aparecem no currículo nem no PDF gerado.
                            </p>
                            <button
                                type="button"
                                onClick={addItem}
                                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-900/30 transition-all active:scale-95"
                            >
                                + Adicionar Primeiro Item
                            </button>
                        </div>
                    ) : (
                        section.items.map((item: any, index) => (
                            <div
                                key={item.id}
                                draggable={!isMobile}
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragEnter={(e) => handleDragEnter(e, index)}
                                className="p-4 border border-slate-700/60 rounded-2xl mb-4 bg-gradient-to-b from-slate-800/60 to-slate-800/30 backdrop-blur-sm shadow-md hover:border-slate-600/80 relative group transition-all"
                            >
                                <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-700/50">
                                    <button
                                        type="button"
                                        onClick={() => toggleCollapse(item.id)}
                                        className="flex-1 flex items-center justify-between text-left font-semibold text-slate-100 py-1 rounded-lg hover:text-blue-400 transition-colors min-w-0"
                                    >
                                        <span className="truncate pr-2 text-sm">{getItemTitle(item)}</span>
                                        {collapsedItems[item.id] ? <ChevronDownIcon className="w-4 h-4 flex-shrink-0 text-slate-400" /> : <ChevronUpIcon className="w-4 h-4 flex-shrink-0 text-slate-400" />}
                                    </button>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => moveItem(index, 'up')}
                                            disabled={index === 0}
                                            className="p-1.5 text-slate-400 hover:text-white disabled:opacity-20 rounded-lg hover:bg-slate-700/60 active:bg-slate-600 transition-colors"
                                            title="Mover para cima"
                                            aria-label="Mover para cima"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                                            </svg>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => moveItem(index, 'down')}
                                            disabled={index === section.items.length - 1}
                                            className="p-1.5 text-slate-400 hover:text-white disabled:opacity-20 rounded-lg hover:bg-slate-700/60 active:bg-slate-600 transition-colors"
                                            title="Mover para baixo"
                                            aria-label="Mover para baixo"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(item.id)}
                                            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                                            aria-label="Remover item"
                                            title="Remover item"
                                        >
                                            <TrashIcon className="w-3.5 h-3.5" />
                                        </button>
                                        {!isMobile && (
                                            <div className="cursor-grab p-1 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Reordenar">
                                                <GripVerticalIcon className="w-4 h-4" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {!collapsedItems[item.id] && <div className="mt-2">{renderItemContent(item)}</div>}
                            </div>
                        ))
                    )}
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
        <div className="h-full flex flex-col bg-slate-900/95 backdrop-blur-xl border-r border-slate-800/80 shadow-2xl relative" data-tour="form-panel">
            {!isMobile && (
                <div className="flex justify-between items-center px-6 pt-6 pb-2 flex-shrink-0 z-10">
                    <div></div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        aria-label="Fechar painel"
                    >
                        <XMarkIcon className="w-5 h-5" />
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