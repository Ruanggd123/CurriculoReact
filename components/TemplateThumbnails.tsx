
import React from 'react';
import type { TemplateOption } from '../types';
import { CheckIcon } from './icons';

interface TemplateThumbnailsProps {
  currentTemplate: TemplateOption;
  onSelectTemplate: (template: TemplateOption) => void;
}

type TemplateTag = 'Novo' | 'Popular' | 'Pro' | 'Clássico';

interface TemplateMeta {
  id: TemplateOption;
  name: string;
  category: string;
  tag?: TemplateTag;
  description: string;
}

const templates: TemplateMeta[] = [
  // Clássicos e Básicos
  { id: 'classic', name: 'Clássico Tradicional', category: 'Básico', tag: 'Clássico', description: 'Padrão com linhas simples.' },
  { id: 'compact', name: 'Compacto (1 Pág)', category: 'Básico', description: 'Para currículos curtos.' },
  { id: 'minimalist-bw', name: 'Minimalista B&W', category: 'Básico', description: 'Limpo e sem distrações.' },

  // Modernos
  { id: 'modern', name: 'Moderno Padrão', category: 'Moderno', tag: 'Popular', description: 'Ícones circulares.' },
  { id: 'modern-minimalist', name: 'Moderno Clean', category: 'Moderno', description: 'Fonte moderna, sutil.' },
  { id: 'modern-colorful', name: 'Moderno Colorido', category: 'Moderno', description: 'Cabeçalho vibrante.' },
  { id: 'modern-timeline', name: 'Timeline Visual', category: 'Moderno', tag: 'Novo', description: 'Linha do tempo conectada.' },
  { id: 'infographic', name: 'Infográfico', category: 'Moderno', description: 'Barra lateral escura.' },

  // Criativos
  { id: 'creative', name: 'Criativo Padrão', category: 'Criativo', tag: 'Pro', description: 'Cabeçalho grande.' },
  { id: 'creative-icons', name: 'Ícones & Estilo', category: 'Criativo', description: 'Ícones coloridos.' },
  { id: 'creative-sidebar', name: 'Barra Colorida', category: 'Criativo', description: 'Barra lateral vibrante.' },
  { id: 'portfolio-visual', name: 'Portfólio', category: 'Criativo', description: 'Ideal para imagens.' },
  { id: 'blogger', name: 'Blogger', category: 'Criativo', description: 'Estilo editorial.' },
  { id: 'designer', name: 'Designer Pro', category: 'Criativo', tag: 'Pro', description: 'Foco visual.' },
  { id: 'artist', name: 'Artista', category: 'Criativo', description: 'Fontes artísticas.' },
  { id: 'photographer', name: 'Fotógrafo', category: 'Criativo', description: 'Minimalista visual.' },
  { id: 'director', name: 'Diretor', category: 'Criativo', description: 'Barra direita.' },

  // Executivos
  { id: 'executive', name: 'Executivo Luxo', category: 'Executivo', tag: 'Pro', description: 'Serifa elegante.' },
  { id: 'admin-manager', name: 'Administração', category: 'Executivo', description: 'Barra direita sóbria.' },
  { id: 'consultant', name: 'Consultoria', category: 'Executivo', description: 'Foco em resultados.' },
  { id: 'pmo', name: 'Gestão de Projetos', category: 'Executivo', description: 'Estrutura clara.' },
  { id: 'operations', name: 'Operações', category: 'Executivo', description: 'Eficiência visual.' },

  // Técnicos
  { id: 'tech', name: 'Tech / Dev', category: 'Técnico', tag: 'Popular', description: 'Estilo Dark Mode.' },
  { id: 'engineering', name: 'Engenharia', category: 'Técnico', description: 'Preciso e técnico.' },
  { id: 'architect', name: 'Arquiteto', category: 'Técnico', description: 'Minimalismo estrutural.' },
  { id: 'academic', name: 'Acadêmico', category: 'Acadêmico', description: 'Para CV Lattes.' },
  { id: 'scientist', name: 'Cientista', category: 'Acadêmico', description: 'Foco em pesquisa.' },
  
  // Áreas Específicas
  { id: 'finance', name: 'Financeiro', category: 'Negócios', description: 'Sóbrio e numérico.' },
  { id: 'sales', name: 'Vendas', category: 'Negócios', description: 'Foco em metas.' },
  { id: 'marketing', name: 'Marketing', category: 'Negócios', description: 'Visual persuasivo.' },
  { id: 'hr', name: 'RH / Recrutador', category: 'Negócios', description: 'Focado em pessoas.' },
  { id: 'logistics', name: 'Logística', category: 'Negócios', description: 'Organizado.' },
  { id: 'health', name: 'Saúde', category: 'Saúde', description: 'Limpo e clínico.' },
  { id: 'therapist', name: 'Terapeuta', category: 'Saúde', description: 'Zen e acolhedor.' },
  { id: 'educator', name: 'Educador', category: 'Outros', description: 'Claro e didático.' },
  { id: 'journalist', name: 'Jornalista', category: 'Outros', description: 'Texto em destaque.' },
  { id: 'sustainability', name: 'Sustentável', category: 'Outros', description: 'Toques naturais.' },
];

const categories = ['Todos', ...Array.from(new Set(templates.map(t => t.category)))];

const SkeletonLine = ({ width = "100%", className = "" }) => (
    <div className={`h-1 bg-current opacity-20 rounded ${className}`} style={{ width }}></div>
);

const ThumbnailVisual: React.FC<{ id: TemplateOption }> = ({ id }) => {
    // Layout Styles
    const sidebarLeft = "grid grid-cols-[1fr_2fr] h-full";
    const sidebarRight = "grid grid-cols-[2fr_1fr] h-full";
    const bannerHeader = "flex flex-col h-full";
    const classic = "flex flex-col h-full p-2 gap-1";
    
    // Common Visual Elements
    const CirclePhoto = () => <div className="w-6 h-6 rounded-full bg-current opacity-30 mx-auto mb-1"></div>;
    const SquarePhoto = () => <div className="w-6 h-6 bg-current opacity-30 mx-auto mb-1"></div>;
    const HeaderLines = () => <><SkeletonLine /><SkeletonLine width="70%" /></>;

    // Specific Renderers
    switch (id) {
        case 'tech':
            return (
                <div className="bg-[#111827] h-full w-full p-2 text-[3px] font-mono text-green-400 flex flex-col gap-1">
                    <div className="text-green-300 font-bold mb-1">{`>_ Dev`}</div>
                    <div className="border-l border-green-800 pl-1 flex flex-col gap-1 opacity-70">
                        <SkeletonLine />
                        <SkeletonLine width="80%" />
                    </div>
                    <div className="mt-2 border-l border-green-800 pl-1 flex flex-col gap-1 opacity-70">
                         <SkeletonLine width="40%" />
                         <SkeletonLine width="90%" />
                    </div>
                </div>
            );

        case 'modern-timeline':
            return (
                <div className="bg-white h-full w-full p-1 text-[3px] relative">
                    <div className="absolute left-2 top-4 bottom-2 w-0.5 bg-gray-200"></div>
                    <div className="ml-4 mt-4 flex flex-col gap-2">
                        <div className="relative"><div className="absolute -left-[9px] w-1.5 h-1.5 rounded-full bg-blue-500"></div><SkeletonLine width="60%" className="bg-gray-800" /></div>
                        <div className="relative"><div className="absolute -left-[9px] w-1.5 h-1.5 rounded-full bg-blue-500"></div><SkeletonLine width="50%" className="bg-gray-800" /></div>
                        <div className="relative"><div className="absolute -left-[9px] w-1.5 h-1.5 rounded-full bg-blue-500"></div><SkeletonLine width="70%" className="bg-gray-800" /></div>
                    </div>
                </div>
            );
        
        case 'infographic':
        case 'creative-sidebar':
        case 'hr':
        case 'pmo':
            return (
                <div className={sidebarLeft}>
                    <div className="bg-blue-900/90 p-1 flex flex-col gap-1 text-white/80 items-center pt-2">
                        <CirclePhoto />
                        <SkeletonLine width="80%" />
                        <SkeletonLine width="60%" />
                    </div>
                    <div className="p-1 bg-white flex flex-col gap-1 pt-2">
                        <div className="h-1 w-3/4 bg-blue-900/50 mb-1 rounded"></div>
                        <SkeletonLine />
                        <SkeletonLine />
                    </div>
                </div>
            );

        case 'director':
        case 'admin-manager':
            return (
                <div className={sidebarRight}>
                    <div className="p-1 bg-white flex flex-col gap-1 pt-2">
                         <div className="h-1 w-1/2 bg-slate-800/50 mb-1 rounded"></div>
                         <SkeletonLine />
                         <SkeletonLine />
                    </div>
                    <div className="bg-slate-800 p-1 flex flex-col gap-1 text-white/70 items-center pt-2">
                         <SquarePhoto />
                         <SkeletonLine width="80%" />
                    </div>
                </div>
            );

        case 'creative':
        case 'modern-colorful':
        case 'marketing':
        case 'engineering':
        case 'educator':
        case 'designer':
            return (
                <div className={bannerHeader}>
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-1/4 w-full flex items-end p-1">
                        <div className="w-5 h-5 rounded-full bg-white/30 mr-1"></div>
                        <div className="bg-white/80 h-1 w-1/2 rounded"></div>
                    </div>
                    <div className="p-1 flex flex-col gap-1 bg-white flex-1">
                        <SkeletonLine />
                        <SkeletonLine width="90%" />
                        <div className="mt-1 w-full h-px bg-gray-200"></div>
                        <SkeletonLine width="70%" />
                    </div>
                </div>
            );

        case 'therapist':
        case 'artist':
            return (
                <div className="bg-[#fdfbf7] h-full w-full p-2 flex flex-col items-center text-[3px] text-gray-600">
                    <CirclePhoto />
                    <SkeletonLine width="60%" className="bg-gray-800 mb-1" />
                    <div className="flex gap-1 justify-center w-full mb-2"><div className="w-1 h-1 rounded-full bg-pink-300"></div><div className="w-1 h-1 rounded-full bg-pink-300"></div></div>
                    <div className="w-full flex flex-col gap-1 items-center text-center">
                        <SkeletonLine width="90%" />
                        <SkeletonLine width="80%" />
                    </div>
                </div>
            );
            
        case 'executive':
        case 'finance':
        case 'consultant':
            return (
                 <div className="bg-white h-full w-full p-2 flex flex-col items-center text-[3px] text-gray-900">
                     <div className="mb-2 text-center w-full border-b border-gray-300 pb-1">
                        <div className="h-1.5 bg-gray-900 w-1/2 mx-auto mb-0.5 font-serif"></div>
                        <SkeletonLine width="30%" className="mx-auto"/>
                     </div>
                     <div className="w-full flex flex-col gap-1 text-left">
                         <div className="h-0.5 w-full bg-gray-200 mb-0.5"></div>
                         <SkeletonLine />
                         <SkeletonLine width="90%" />
                     </div>
                 </div>
            );

        default: // Classic
             return (
                <div className={classic}>
                     <div className="text-left border-b border-gray-800 pb-1 mb-1">
                        <div className="h-1.5 bg-gray-900 w-1/2 mb-0.5"></div>
                        <SkeletonLine width="40%" />
                     </div>
                     <SkeletonLine />
                     <SkeletonLine width="95%" />
                     <div className="mt-2">
                        <div className="h-0.5 bg-gray-800 w-1/4 mb-0.5"></div>
                        <SkeletonLine />
                     </div>
                </div>
            );
    }
}

export const TemplateThumbnails: React.FC<TemplateThumbnailsProps> = ({ currentTemplate, onSelectTemplate }) => {
  const [activeCategory, setActiveCategory] = React.useState<string>('Todos');

  const filteredTemplates = activeCategory === 'Todos' 
    ? templates 
    : templates.filter(t => t.category === activeCategory);

  return (
    <div className="space-y-6">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 pb-2 border-b border-gray-700/50">
            {categories.map(cat => (
                <button 
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                        activeCategory === cat 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 scale-105' 
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                >
                    {cat}
                </button>
            ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar pb-4">
            {filteredTemplates.map(template => {
                const isSelected = currentTemplate === template.id;
                
                return (
                    <button
                        key={template.id}
                        type="button"
                        onClick={() => onSelectTemplate(template.id)}
                        className={`group relative flex flex-col outline-none transition-all duration-300 ${isSelected ? 'scale-[1.02]' : 'hover:scale-[1.02]'}`}
                    >
                        {/* Badge */}
                        {template.tag && (
                            <div className={`absolute -top-2 -right-2 z-20 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider shadow-lg ${
                                template.tag === 'Pro' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' :
                                template.tag === 'Novo' ? 'bg-green-500 text-white' :
                                template.tag === 'Popular' ? 'bg-orange-500 text-white' :
                                'bg-slate-600 text-white'
                            }`}>
                                {template.tag}
                            </div>
                        )}

                        {/* Thumbnail Frame */}
                        <div className={`
                            w-full aspect-[210/297] rounded-xl overflow-hidden shadow-xl border-4 transition-all duration-300 relative bg-gray-50
                            ${isSelected 
                                ? 'border-blue-500 ring-4 ring-blue-500/20 shadow-blue-900/40' 
                                : 'border-gray-700 group-hover:border-gray-500 group-hover:shadow-2xl'
                            }
                        `}>
                            {/* The Actual Mini-Layout */}
                            <div className="w-full h-full transform transition-transform duration-500 group-hover:scale-105 origin-center">
                                <ThumbnailVisual id={template.id} />
                            </div>

                            {/* Selected Overlay */}
                            {isSelected && (
                                <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center backdrop-blur-[1px]">
                                    <div className="bg-blue-600 text-white rounded-full p-2 shadow-xl animate-in zoom-in duration-200">
                                        <CheckIcon className="w-6 h-6" />
                                    </div>
                                </div>
                            )}

                            {/* Hover Overlay for non-selected */}
                            {!isSelected && (
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                            )}
                        </div>

                        {/* Label */}
                        <div className="mt-3 text-center">
                            <h4 className={`text-sm font-bold truncate transition-colors ${isSelected ? 'text-blue-400' : 'text-gray-300 group-hover:text-white'}`}>
                                {template.name}
                            </h4>
                            <p className="text-[10px] text-gray-500 truncate">{template.description}</p>
                        </div>
                    </button>
                );
            })}
        </div>
    </div>
  );
};