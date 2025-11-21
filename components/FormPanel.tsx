import React, { useState, useRef } from 'react';
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
}

// Re-usable form components
const InputField: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; type?: string;}> = ({ label, name, value, onChange, placeholder, type = 'text' }) => (
  <div className="mb-4">
    <label htmlFor={name} className="block text-sm font-medium mb-1.5 text-gray-300">{label}</label>
    <input type={type} id={name} name={name} value={value} onChange={onChange} placeholder={placeholder} className="w-full px-3 py-2 border border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-700/50 text-gray-100 transition-all duration-200" />
  </div>
);

const TextAreaField: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; placeholder?: string; rows?: number; }> = ({ label, name, value, onChange, placeholder, rows = 4 }) => (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium mb-1.5 text-gray-300">{label}</label>
      <textarea id={name} name={name} value={value} onChange={onChange} placeholder={placeholder} rows={rows} className="w-full px-3 py-2 border border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-y bg-gray-700/50 text-gray-100 transition-all duration-200" />
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
                        <input type="color" value={uiConfig.backgroundColor} onChange={e => handleUiChange('backgroundColor', e.target.value)} className="w-full h-10 p-1 border border-gray-600 rounded-lg cursor-pointer bg-gray-700" />
                        <span className="absolute top-1/2 left-3 -translate-y-1/2 uppercase text-xs font-mono text-gray-400 pointer-events-none">{uiConfig.backgroundColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-300">Cor de Destaque</label>
                    <div className="relative">
                        <input type="color" value={uiConfig.accentColor} onChange={e => handleUiChange('accentColor', e.target.value)} className="w-full h-10 p-1 border border-gray-600 rounded-lg cursor-pointer bg-gray-700" />
                        <span className="absolute top-1/2 left-3 -translate-y-1/2 uppercase text-xs font-mono text-gray-400 pointer-events-none">{uiConfig.accentColor}</span>
                    </div>
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
                                    <PencilIcon className="w-4 h-4 inline-block mr-1.5"/>
                                    Ajustar Posição e Zoom
                                </button>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center mt-4">
                        <input type="checkbox" id="showPhoto" checked={uiConfig.photo.show} onChange={e => handlePhotoChange('show', e.target.checked)} className="h-4 w-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-600"/>
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
}

const SectionForm: React.FC<SectionFormProps> = ({ section, resumeData, setResumeData }) => {
    const [collapsedItems, setCollapsedItems] = useState<Record<string, boolean>>({});
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    const toggleCollapse = (itemId: string) => {
        setCollapsedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
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
                        <InputField label="Data de Fim" name="endDate" value={item.endDate} onChange={e => handleItemChange(item.id, e)} placeholder="Presente"/>
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
                        <InputField label="Data de Fim" name="endDate" value={item.endDate} onChange={e => handleItemChange(item.id, e)} placeholder="Cursando"/>
                    </div>
                    <TextAreaField label="Descrição (Opcional)" name="description" value={item.description} onChange={e => handleItemChange(item.id, e)} rows={2}/>
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
             {section.type === 'skills' ? (
                <>
                    <div className="grid grid-cols-2 gap-2">
                        {(section.items as Skill[]).map(skill => (
                            <div key={skill.id} className="flex items-center bg-gray-700/80 p-1 border border-gray-600 rounded-md">
                                <input type="text" value={skill.name} onChange={e => handleItemChange(skill.id, e)} className="w-full bg-transparent focus:outline-none text-sm p-1" name="name" />
                                <button onClick={() => removeItem(skill.id)} className="p-1 text-red-400 hover:text-red-500" aria-label="Remover habilidade"><TrashIcon className="w-4 h-4"/></button>
                            </div>
                        ))}
                    </div>
                </>
            ) : section.type === 'summary' ? (
                 <div>{renderItemContent(section.items[0])}</div>
            ) : (
                <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
                    {section.items.map((item: any, index) => (
                        <div 
                            key={item.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragEnter={(e) => handleDragEnter(e, index)}
                            className="p-4 border border-gray-700 rounded-xl mb-4 bg-gray-800/30 relative group"
                        >
                             <div className="absolute top-2 right-2 flex items-center gap-1">
                                <button onClick={() => removeItem(item.id)} className="p-1 text-red-500 hover:text-red-600 hover:bg-red-900/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Remover"><TrashIcon className="w-5 h-5"/></button>
                                <div className="cursor-grab p-1 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Reordenar"><GripVerticalIcon className="w-5 h-5"/></div>
                             </div>
                            <button onClick={() => toggleCollapse(item.id)} className="w-full flex justify-between items-center text-left font-semibold text-gray-200 p-2 -m-2 rounded-lg hover:bg-gray-700/50 transition-colors">
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

export const FormPanel: React.FC<FormPanelProps> = ({ activeSection, resumeData, setResumeData, uiConfig, setUiConfig, onClose, isMobile }) => {

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
            />;
        }
        
        return null;
    };

    return (
        <div className="h-full flex flex-col bg-[#1e293b] border-r border-gray-700 shadow-xl relative" data-tour="form-panel">
            <div className="flex justify-between items-center px-6 pt-6 pb-2 flex-shrink-0 z-10">
                 {isMobile ? (
                     <button onClick={onClose} className="flex items-center gap-2 p-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors">
                         <ArrowLeftIcon className="w-5 h-5" />
                         <span className="font-bold">Voltar</span>
                     </button>
                 ) : (
                    <div></div> // Placeholder to keep the X button on the right
                 )}
                 <button 
                    onClick={onClose} 
                    className={`p-2 rounded-full text-gray-400 hover:bg-gray-700 transition-colors ${isMobile ? 'hidden' : 'block'}`}
                    aria-label="Fechar painel"
                 >
                    <XMarkIcon className="w-6 h-6" />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-24 md:pb-6 custom-scrollbar w-full">
                {renderContent()}
            </div>
        </div>
    );
};