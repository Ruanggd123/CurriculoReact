
import React, { useState, useRef } from 'react';
import type { ResumeData, UiConfig, Experience, Education, Skill, ResumeSection, Project, Language, SectionType, PhotoConfig } from '../types';
import { ChevronDownIcon, ChevronUpIcon, TrashIcon, SparklesIcon, PlusIcon, XMarkIcon, GripVerticalIcon, PencilIcon } from './icons';
import { TemplateThumbnails } from './TemplateThumbnails';
import { GoogleGenAI, Type } from "@google/genai";
import { useToast } from './Toast';
import { PhotoEditorModal } from './PhotoEditorModal';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface FormPanelProps {
  activeSection: string;
  resumeData: ResumeData;
  setResumeData: (value: ResumeData | ((prevState: ResumeData) => ResumeData), skipHistory?: boolean) => void;
  uiConfig: UiConfig;
  setUiConfig: (value: UiConfig | ((prevState: UiConfig) => UiConfig), skipHistory?: boolean) => void;
  onClose: () => void;
}

// Re-usable form components
const InputField: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; type?: string;}> = ({ label, name, value, onChange, placeholder, type = 'text' }) => (
  <div className="mb-4">
    <label htmlFor={name} className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">{label}</label>
    <input type={type} id={name} name={name} value={value} onChange={onChange} placeholder={placeholder} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100" />
  </div>
);

const TextAreaField: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; placeholder?: string; rows?: number; }> = ({ label, name, value, onChange, placeholder, rows = 4 }) => (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">{label}</label>
      <textarea id={name} name={name} value={value} onChange={onChange} placeholder={placeholder} rows={rows} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-y bg-white dark:bg-gray-700/50 text-gray-900 dark:text-gray-100" />
    </div>
);

const RangeSlider: React.FC<{ label: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; min?: number; max?: number; step?: number; }> = ({ label, value, onChange, min = 10, max = 20, step = 1 }) => (
    <div className="mb-2">
      <div className="flex justify-between items-center mb-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <span className="text-sm font-semibold text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded-full">{value}px</span>
      </div>
      <input 
        type="range" 
        value={value} 
        onChange={onChange} 
        min={min} 
        max={max} 
        step={step} 
        className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500" 
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
            setUiConfig(prev => ({ ...prev, photo: { ...prev.photo, src: event.target?.result as string, zoom: 100, position: '50% 50%' }}));
          };
          reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const handleUiChange = (key: keyof UiConfig, value: any) => {
      setUiConfig(prev => ({ ...prev, [key]: value }));
    };

    const handlePhotoChange = (key: keyof PhotoConfig, value: any) => {
        setUiConfig(prev => ({...prev, photo: {...prev.photo, [key]: value}}));
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
            <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Aparência e Modelo</h3>
                <TemplateThumbnails 
                  currentTemplate={uiConfig.template} 
                  onSelectTemplate={(template) => handleUiChange('template', template)} 
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Cor de Fundo</label>
                    <input type="color" value={uiConfig.backgroundColor} onChange={e => handleUiChange('backgroundColor', e.target.value)} className="w-full h-10 px-1 py-1 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Cor de Destaque</label>
                    <input type="color" value={uiConfig.accentColor} onChange={e => handleUiChange('accentColor', e.target.value)} className="w-full h-10 px-1 py-1 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm" />
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Foto de Perfil</h3>
                <div>
                    <label className="block text-sm font-medium mb-1.5">Carregar Foto</label>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/50 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900" />
                </div>
                {uiConfig.photo.src && (
                    <div className="flex items-center gap-4 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
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
                                className="flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                <PencilIcon className="w-4 h-4 inline-block mr-1.5"/>
                                Ajustar Posição e Zoom
                            </button>
                        </div>
                    </div>
                )}
                <div className="flex items-center">
                    <input type="checkbox" id="showPhoto" checked={uiConfig.photo.show} onChange={e => handlePhotoChange('show', e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
                    <label htmlFor="showPhoto" className="ml-2 block text-sm">Mostrar foto no currículo</label>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1.5">Estilo da Foto</label>
                    <select value={uiConfig.photo.style} onChange={e => handlePhotoChange('style', e.target.value as PhotoConfig['style'])} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700/50">
                        <option value="rounded-full">Redonda</option>
                        <option value="rounded-lg">Quadrada (Bordas arredondadas)</option>
                        <option value="rounded-none">Quadrada</option>
                    </select>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Tamanhos de Fonte</h3>
                <RangeSlider label="Nome" value={uiConfig.sectionSizes.name} onChange={e => handleSectionSizeChange('name', e.target.value)} min={24} max={48} />
                <RangeSlider label="Cargo" value={uiConfig.sectionSizes.jobTitle} onChange={e => handleSectionSizeChange('jobTitle', e.target.value)} min={16} max={32} />
                <RangeSlider label="Título da Seção" value={uiConfig.sectionSizes.sectionTitle} onChange={e => handleSectionSizeChange('sectionTitle', e.target.value)} min={18} max={36} />
                <div className="w-full border-t border-gray-200 dark:border-gray-600 my-4"></div>
                <RangeSlider label="Resumo (Corpo)" value={uiConfig.sectionSizes.summary} onChange={e => handleSectionSizeChange('summary', e.target.value)} min={12} max={18} />
                <RangeSlider label="Experiência (Corpo)" value={uiConfig.sectionSizes.experience} onChange={e => handleSectionSizeChange('experience', e.target.value)} min={12} max={18} />
                <RangeSlider label="Educação (Corpo)" value={uiConfig.sectionSizes.education} onChange={e => handleSectionSizeChange('education', e.target.value)} min={12} max={18} />
                <RangeSlider label="Habilidades (Tags)" value={uiConfig.sectionSizes.skills} onChange={e => handleSectionSizeChange('skills', e.target.value)} min={12} max={18} />
            </div>
        </>
    );
};

const PersonalInfoForm: React.FC<Pick<FormPanelProps, 'resumeData' | 'setResumeData'>> = ({ resumeData, setResumeData }) => {
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const { addToast } = useToast();

    const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setResumeData(prev => ({ ...prev, personal: { ...prev.personal, [name]: value } }));
    };

    const handleGenerateSummary = async () => {
        setIsGeneratingSummary(true);
        try {
            const experienceText = resumeData.sections
                .filter(s => s.type === 'experience')
                .flatMap(s => (s.items as Experience[]).map(i => `${i.role} at ${i.company}: ${i.description}`))
                .join('\n');
            const skillsText = resumeData.sections
                .filter(s => s.type === 'skills')
                .flatMap(s => (s.items as Skill[]).map(i => i.name))
                .join(', ');
    
            const prompt = `Com base na seguinte experiência profissional e habilidades, escreva um resumo profissional conciso e impactante para um currículo. Job Title: ${resumeData.personal.jobTitle}.\n\nExperiência:\n${experienceText}\n\nHabilidades: ${skillsText}`;
            
            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
            });
    
            setResumeData(prev => ({...prev, personal: {...prev.personal, summary: response.text }}));
        } catch(error) {
            console.error("Error generating summary:", error);
            addToast("Ocorreu um erro ao gerar o resumo.", 'error');
        } finally {
            setIsGeneratingSummary(false);
        }
    };
    
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Informações Pessoais</h3>
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
            <div className="relative">
                <TextAreaField label="Resumo Profissional" name="summary" value={resumeData.personal.summary} onChange={handlePersonalChange} />
                <button
                    onClick={handleGenerateSummary}
                    disabled={isGeneratingSummary}
                    className="absolute top-0 right-0 mt-1 flex items-center text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:hover:bg-purple-900 font-semibold py-1 px-2 rounded-full disabled:opacity-50 disabled:cursor-wait"
                >
                    <SparklesIcon className="w-4 h-4 mr-1"/>
                    {isGeneratingSummary ? 'Gerando...' : 'Gerar com IA'}
                </button>
            </div>
        </div>
    );
};

const SectionForm: React.FC<Pick<FormPanelProps, 'resumeData' | 'setResumeData'> & { section: ResumeSection }> = ({ section, resumeData, setResumeData }) => {
    const [collapsedItems, setCollapsedItems] = useState<Record<string, boolean>>({});
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);
    const [generatingDescId, setGeneratingDescId] = useState<string | null>(null);
    const [isGeneratingSkills, setIsGeneratingSkills] = useState(false);
    const { addToast } = useToast();

    const toggleCollapse = (itemId: string) => {
        setCollapsedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
    };

    // Generic Handlers
    const handleItemChange = (itemId: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setResumeData(prev => ({
            ...prev,
            sections: prev.sections.map(s => s.id === section.id
                // FIX: Cast the result of map to `any` to resolve TypeScript error.
                // This is a workaround for a known TS limitation with operations on arrays of union types.
                ? { ...s, items: s.items.map((item: any) => item.id === itemId ? { ...item, [name]: value } : item) as any }
                : s
            )
        }));
    };

    const addItem = () => {
        let newItem;
        const id = crypto.randomUUID();
        const baseItems = {
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
                // FIX: Cast the result of filter to `any` to resolve TypeScript error.
                // This is a workaround for a known TS limitation with operations on arrays of union types.
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

    // AI Handlers
    const handleEnhanceDescription = async (itemId: string, currentDescription: string, itemType: 'experience' | 'project') => {
        setGeneratingDescId(itemId);
        try {
            const promptType = itemType === 'experience' ? 'experiência profissional' : 'projeto';
            const prompt = `Reescreva a seguinte descrição de ${promptType} para um currículo, tornando-a mais profissional e focada em resultados. Use bullet points (iniciando com '• ') se apropriado:\n\n"${currentDescription}"`;
            
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            
            const fakeEvent = { target: { name: 'description', value: response.text } } as React.ChangeEvent<HTMLTextAreaElement>;
            handleItemChange(itemId, fakeEvent);
        } catch(error) {
            console.error("Error enhancing description:", error);
            addToast("Ocorreu um erro ao melhorar a descrição.", 'error');
        } finally {
            setGeneratingDescId(null);
        }
    };

    const handleGenerateSkills = async () => {
        setIsGeneratingSkills(true);
        try {
            const context = `Job Title: ${resumeData.personal.jobTitle}. Summary: ${resumeData.personal.summary}. Experience: ${resumeData.sections.filter(s => s.type === 'experience').map(s => (s.items as Experience[]).map(i => `${i.role} at ${i.company}: ${i.description}`).join('; ')).join('\n')}`;
            const prompt = `Baseado no seguinte contexto de um currículo, gere uma lista de 10 habilidades (skills) essenciais. Forneça apenas a lista de habilidades.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `${prompt}\n\nContexto: ${context}`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            skills: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            }
                        }
                    }
                }
            });

            const result = JSON.parse(response.text);
            const generatedSkills: Skill[] = (result.skills as string[]).map((skill: string) => ({ id: crypto.randomUUID(), name: skill }));

            if (generatedSkills.length > 0) {
                 setResumeData(prev => ({
                    ...prev,
                    sections: prev.sections.map(s => s.id === section.id ? { ...s, items: generatedSkills } : s)
                }));
                 addToast('Habilidades geradas com sucesso!', 'success');
            } else {
                addToast("Não foi possível gerar as habilidades.", 'info');
            }

        } catch(error) {
            console.error("Error generating skills:", error);
            addToast("Ocorreu um erro ao gerar habilidades.", 'error');
        } finally {
            setIsGeneratingSkills(false);
        }
    }

    const renderItemContent = (item: any) => {
        switch (section.type) {
            case 'experience': return (
                <>
                    <InputField label="Empresa" name="company" value={item.company} onChange={e => handleItemChange(item.id, e)} />
                    <InputField label="Cargo" name="role" value={item.role} onChange={e => handleItemChange(item.id, e)} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField label="Data de Início" name="startDate" type="month" value={item.startDate} onChange={e => handleItemChange(item.id, e)} />
                        <InputField label="Data de Fim" name="endDate" value={item.endDate} onChange={e => handleItemChange(item.id, e)} placeholder="Presente"/>
                    </div>
                    <div className="relative">
                        <TextAreaField label="Descrição" name="description" value={item.description} onChange={e => handleItemChange(item.id, e)} />
                        <button onClick={() => handleEnhanceDescription(item.id, item.description, 'experience')} disabled={generatingDescId === item.id} className="absolute top-0 right-0 mt-1 flex items-center text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:hover:bg-purple-900 font-semibold py-1 px-2 rounded-full disabled:opacity-50 disabled:cursor-wait">
                            <SparklesIcon className="w-4 h-4 mr-1" /> {generatingDescId === item.id ? 'Melhorando...' : 'Melhorar com IA'}
                        </button>
                    </div>
                </>
            );
            case 'education': return (
                <>
                    <InputField label="Instituição" name="institution" value={item.institution} onChange={e => handleItemChange(item.id, e)} />
                    <InputField label="Grau / Curso" name="degree" value={item.degree} onChange={e => handleItemChange(item.id, e)} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField label="Data de Início" name="startDate" type="month" value={item.startDate} onChange={e => handleItemChange(item.id, e)} />
                        <InputField label="Data de Fim" name="endDate" value={item.endDate} onChange={e => handleItemChange(item.id, e)} placeholder="Cursando"/>
                    </div>
                    <TextAreaField label="Descrição (Opcional)" name="description" value={item.description} onChange={e => handleItemChange(item.id, e)} rows={2}/>
                </>
            );
            case 'projects': return (
                 <>
                    <InputField label="Nome do Projeto" name="name" value={item.name} onChange={e => handleItemChange(item.id, e)} />
                    <InputField label="Link" name="link" value={item.link} onChange={e => handleItemChange(item.id, e)} placeholder="https://github.com/..." />
                    <div className="relative">
                        <TextAreaField label="Descrição" name="description" value={item.description} onChange={e => handleItemChange(item.id, e)} />
                         <button onClick={() => handleEnhanceDescription(item.id, item.description, 'project')} disabled={generatingDescId === item.id} className="absolute top-0 right-0 mt-1 flex items-center text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:hover:bg-purple-900 font-semibold py-1 px-2 rounded-full disabled:opacity-50 disabled:cursor-wait">
                            <SparklesIcon className="w-4 h-4 mr-1" /> {generatingDescId === item.id ? 'Melhorando...' : 'Melhorar com IA'}
                        </button>
                    </div>
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
            case 'experience': return item.role || 'Nova Experiência';
            case 'education': return item.degree || 'Nova Formação';
            case 'projects': return item.name || 'Novo Projeto';
            case 'languages': return item.language || 'Novo Idioma';
            default: return 'Item';
        }
    }
    
    return (
        <div>
            <input type="text" value={section.title} onChange={handleTitleChange} className="text-xl font-semibold bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 rounded-md px-2 py-1 w-full mb-4 -ml-2" />
             {section.type === 'skills' ? (
                <>
                    <button onClick={handleGenerateSkills} disabled={isGeneratingSkills} className="w-full flex justify-center items-center gap-2 mb-4 text-purple-600 dark:text-purple-400 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:bg-purple-50 dark:hover:bg-purple-900/50 hover:border-purple-500 dark:hover:border-purple-400 font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50">
                        <SparklesIcon className="w-4 h-4" /> {isGeneratingSkills ? 'Gerando...' : 'Gerar Habilidades com IA'}
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                        {(section.items as Skill[]).map(skill => (
                            <div key={skill.id} className="flex items-center bg-gray-50 dark:bg-gray-700/80 p-1 border dark:border-gray-600 rounded-md">
                                <input type="text" value={skill.name} onChange={e => handleItemChange(skill.id, e)} className="w-full bg-transparent focus:outline-none text-sm p-1" name="name" />
                                <button onClick={() => removeItem(skill.id)} className="p-1 text-red-400 hover:text-red-600" aria-label="Remover habilidade"><TrashIcon className="w-4 h-4"/></button>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
                    {section.items.map((item: any, index) => (
                        <div 
                            key={item.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragEnter={(e) => handleDragEnter(e, index)}
                            className="p-4 border dark:border-gray-700 rounded-xl mb-4 bg-gray-50 dark:bg-gray-800/30 relative group"
                        >
                             <div className="absolute top-2 right-2 flex items-center gap-1">
                                <button onClick={() => removeItem(item.id)} className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Remover"><TrashIcon className="w-5 h-5"/></button>
                                <div className="cursor-grab p-1 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Reordenar"><GripVerticalIcon className="w-5 h-5"/></div>
                             </div>
                            <button onClick={() => toggleCollapse(item.id)} className="w-full flex justify-between items-center text-left font-semibold text-gray-800 dark:text-gray-200">
                                {getItemTitle(item)}
                                {collapsedItems[item.id] ? <ChevronDownIcon className="w-5 h-5"/> : <ChevronUpIcon className="w-5 h-5"/>}
                            </button>
                            {!collapsedItems[item.id] && <div className="mt-4">{renderItemContent(item)}</div>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export const FormPanel: React.FC<FormPanelProps> = ({ activeSection, resumeData, setResumeData, uiConfig, setUiConfig, onClose }) => {
    
    const renderContent = () => {
        if (activeSection === 'appearance') {
            return <AppearanceForm uiConfig={uiConfig} setUiConfig={setUiConfig} />;
        }
        if (activeSection === 'personal') {
            return <PersonalInfoForm resumeData={resumeData} setResumeData={setResumeData} />;
        }
        
        const sectionData = resumeData.sections.find(s => s.id === activeSection);
        if (sectionData) {
            return <SectionForm section={sectionData} resumeData={resumeData} setResumeData={setResumeData} />;
        }
        
        return null;
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-end items-center mb-4 flex-shrink-0 -mr-2">
                 <button 
                    onClick={onClose} 
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Fechar painel"
                 >
                    <XMarkIcon className="w-6 h-6" />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-2">
                {renderContent()}
            </div>
        </div>
    );
};