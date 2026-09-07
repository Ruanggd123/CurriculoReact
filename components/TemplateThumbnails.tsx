
import React from 'react';
import type { TemplateOption } from '../types';
import { CheckIcon } from './icons';

interface TemplateThumbnailsProps {
  currentTemplate: TemplateOption;
  onSelectTemplate: (template: TemplateOption) => void;
  maxHeightClass?: string;
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

const SkeletonLine = ({ width = "100%", className = "bg-slate-300" }: { width?: string; className?: string }) => (
    <div className={`h-1 rounded ${className}`} style={{ width }}></div>
);

const ThumbnailVisual: React.FC<{ id: TemplateOption }> = ({ id }) => {
    switch (id) {
        case 'tech':
        case 'engineering':
        case 'architect':
        case 'scientist':
            return (
                <div className="bg-[#0b1120] h-full w-full p-2 text-[3px] font-mono text-emerald-400 flex flex-col gap-1 select-none">
                    <div className="flex justify-between items-center border-b border-emerald-500/30 pb-1 mb-0.5">
                        <span className="text-emerald-300 font-bold">{`>_ DEV`}</span>
                        <span className="text-[3px] text-emerald-400/80 bg-emerald-950/80 px-1 rounded border border-emerald-500/30">ATS 99%</span>
                    </div>
                    <div className="border-l-2 border-emerald-500/50 pl-1 flex flex-col gap-1">
                        <div className="h-1 bg-emerald-400/90 w-3/4 rounded"></div>
                        <SkeletonLine width="90%" className="bg-slate-700" />
                        <SkeletonLine width="80%" className="bg-slate-700" />
                    </div>
                    <div className="mt-auto flex flex-wrap gap-0.5 pt-1">
                        <span className="px-1 py-0.2 bg-slate-800 text-cyan-300 rounded text-[3px]">React</span>
                        <span className="px-1 py-0.2 bg-slate-800 text-cyan-300 rounded text-[3px]">TS</span>
                        <span className="px-1 py-0.2 bg-slate-800 text-cyan-300 rounded text-[3px]">Node</span>
                    </div>
                </div>
            );

        case 'modern':
        case 'modern-minimalist':
            return (
                <div className="grid grid-cols-[1fr_2fr] h-full w-full bg-white text-slate-800 select-none">
                    <div className="bg-slate-900 p-1.5 flex flex-col gap-1 text-white items-center pt-2">
                        <div className="w-5 h-5 rounded-full bg-blue-600 border border-blue-400/50 flex items-center justify-center text-[5px] font-bold text-white mb-0.5">JS</div>
                        <div className="h-1 bg-blue-400 w-3/4 rounded"></div>
                        <div className="h-0.5 bg-slate-500 w-1/2 rounded mb-1"></div>
                        <SkeletonLine width="80%" className="bg-slate-700" />
                        <SkeletonLine width="60%" className="bg-slate-700" />
                        <div className="mt-1 flex flex-wrap gap-0.5 justify-center w-full">
                            <span className="w-3 h-1 bg-slate-800 rounded"></span>
                            <span className="w-3 h-1 bg-slate-800 rounded"></span>
                        </div>
                    </div>
                    <div className="p-1.5 bg-white flex flex-col gap-1 pt-2">
                        <div className="h-1.5 w-3/4 bg-blue-600 mb-0.5 rounded"></div>
                        <div className="h-1 w-1/2 bg-slate-400 mb-1 rounded"></div>
                        <div className="h-0.5 w-1/3 bg-blue-500 mb-0.5 rounded"></div>
                        <SkeletonLine className="bg-slate-300" />
                        <SkeletonLine width="90%" className="bg-slate-300" />
                        <div className="h-0.5 w-1/3 bg-blue-500 mt-1 mb-0.5 rounded"></div>
                        <SkeletonLine className="bg-slate-300" />
                    </div>
                </div>
            );

        case 'modern-timeline':
            return (
                <div className="bg-white h-full w-full p-2 text-[3px] relative flex flex-col select-none">
                    <div className="border-b border-slate-200 pb-1 mb-1">
                        <div className="h-1.5 bg-blue-600 w-1/2 rounded mb-0.5"></div>
                        <div className="h-0.5 bg-slate-400 w-1/3 rounded"></div>
                    </div>
                    <div className="relative pl-3 flex-1 flex flex-col gap-2 pt-1">
                        <div className="absolute left-1 top-2 bottom-2 w-0.5 bg-blue-300"></div>
                        <div className="relative">
                            <div className="absolute -left-[10px] top-0.5 w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                            <div className="h-1 bg-slate-800 w-2/3 rounded mb-0.5"></div>
                            <SkeletonLine width="80%" className="bg-slate-300" />
                        </div>
                        <div className="relative">
                            <div className="absolute -left-[10px] top-0.5 w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                            <div className="h-1 bg-slate-800 w-1/2 rounded mb-0.5"></div>
                            <SkeletonLine width="70%" className="bg-slate-300" />
                        </div>
                    </div>
                </div>
            );

        case 'creative':
        case 'creative-icons':
        case 'creative-sidebar':
        case 'portfolio-visual':
        case 'blogger':
        case 'designer':
        case 'artist':
        case 'photographer':
        case 'modern-colorful':
            return (
                <div className="flex flex-col h-full w-full bg-white select-none">
                    <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 p-2 flex items-center gap-1.5 text-white">
                        <div className="w-5 h-5 rounded-full bg-white/30 border border-white/60 flex items-center justify-center text-[6px] font-black text-white shrink-0">
                            ★
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="h-1.5 bg-white w-3/4 rounded mb-0.5"></div>
                            <div className="h-0.5 bg-purple-200 w-1/2 rounded"></div>
                        </div>
                    </div>
                    <div className="p-2 flex-1 flex flex-col gap-1 bg-slate-50">
                        <div className="h-1 w-1/3 bg-purple-600 rounded mb-0.5"></div>
                        <SkeletonLine className="bg-slate-300" />
                        <SkeletonLine width="85%" className="bg-slate-300" />
                        <div className="mt-1 flex gap-1">
                            <span className="px-1 py-0.5 bg-purple-100 text-purple-700 rounded text-[3px] font-bold">Figma</span>
                            <span className="px-1 py-0.5 bg-purple-100 text-purple-700 rounded text-[3px] font-bold">Design</span>
                        </div>
                    </div>
                </div>
            );

        case 'executive':
        case 'finance':
        case 'consultant':
        case 'pmo':
        case 'operations':
            return (
                <div className="bg-white h-full w-full p-2 flex flex-col text-[3px] text-slate-900 select-none">
                    <div className="h-1 bg-gradient-to-r from-amber-600 via-slate-800 to-blue-900 w-full mb-1"></div>
                    <div className="mb-1 text-center w-full border-b border-slate-300 pb-1">
                        <div className="h-1.5 bg-slate-900 w-1/2 mx-auto mb-0.5 font-serif font-black rounded"></div>
                        <div className="h-0.5 bg-amber-600 w-1/3 mx-auto rounded"></div>
                    </div>
                    <div className="space-y-1 flex-1">
                        <div className="h-0.5 w-1/4 bg-slate-800 rounded"></div>
                        <SkeletonLine className="bg-slate-300" />
                        <SkeletonLine width="90%" className="bg-slate-300" />
                        <div className="h-0.5 w-1/4 bg-slate-800 mt-1 rounded"></div>
                        <SkeletonLine width="80%" className="bg-slate-300" />
                    </div>
                </div>
            );

        case 'director':
        case 'admin-manager':
            return (
                <div className="grid grid-cols-[2fr_1fr] h-full w-full bg-white select-none">
                    <div className="p-1.5 flex flex-col gap-1 pt-2">
                        <div className="h-1.5 w-3/4 bg-slate-900 rounded mb-0.5"></div>
                        <div className="h-0.5 w-1/2 bg-blue-600 rounded mb-1"></div>
                        <SkeletonLine className="bg-slate-300" />
                        <SkeletonLine width="90%" className="bg-slate-300" />
                    </div>
                    <div className="bg-slate-800 p-1 flex flex-col gap-1 text-white/80 items-center pt-2">
                        <div className="w-5 h-5 rounded bg-slate-700 border border-slate-600 mx-auto mb-1 flex items-center justify-center text-[5px] text-slate-300">CV</div>
                        <SkeletonLine width="80%" className="bg-slate-600" />
                        <SkeletonLine width="60%" className="bg-slate-600" />
                    </div>
                </div>
            );

        case 'health':
        case 'therapist':
            return (
                <div className="bg-[#f0fdfa] h-full w-full p-2 flex flex-col text-[3px] text-slate-900 select-none">
                    <div className="flex items-center gap-1 border-b border-teal-200 pb-1 mb-1">
                        <div className="w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-[6px]">✚</div>
                        <div>
                            <div className="h-1.5 bg-teal-900 w-12 rounded"></div>
                            <div className="h-0.5 bg-teal-600 w-8 rounded mt-0.5"></div>
                        </div>
                    </div>
                    <div className="space-y-1 flex-1">
                        <div className="h-0.5 w-1/3 bg-teal-700 rounded"></div>
                        <SkeletonLine className="bg-teal-200" />
                        <SkeletonLine width="85%" className="bg-teal-200" />
                    </div>
                </div>
            );

        default: // Classic & Compact
            return (
                <div className="flex flex-col h-full w-full p-2 gap-1 bg-white text-slate-800 select-none">
                    <div className="text-center border-b border-slate-700 pb-1 mb-1">
                        <div className="h-1.5 bg-slate-900 w-1/2 mx-auto mb-0.5 rounded font-bold"></div>
                        <div className="h-0.5 bg-slate-500 w-1/3 mx-auto rounded"></div>
                    </div>
                    <div className="h-0.5 w-1/4 bg-slate-800 rounded mb-0.5"></div>
                    <SkeletonLine className="bg-slate-300" />
                    <SkeletonLine width="92%" className="bg-slate-300" />
                    <div className="h-0.5 w-1/4 bg-slate-800 rounded mt-1 mb-0.5"></div>
                    <SkeletonLine width="80%" className="bg-slate-300" />
                    <SkeletonLine width="65%" className="bg-slate-300" />
                </div>
            );
    }
};

export const TemplateThumbnails: React.FC<TemplateThumbnailsProps> = ({ 
  currentTemplate, 
  onSelectTemplate,
  maxHeightClass = "" 
}) => {
  const [activeCategory, setActiveCategory] = React.useState<string>('Todos');

  const filteredTemplates = activeCategory === 'Todos' 
    ? templates 
    : templates.filter(t => t.category === activeCategory);

  return (
    <div className="space-y-6">
        {/* Category Filter */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 pt-1 border-b border-gray-700/50 -mx-1 px-1">
            {categories.map(cat => (
                <button 
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
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
        <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 pr-2 custom-scrollbar pb-4 ${maxHeightClass}`}>
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
                            w-full aspect-[210/297] rounded-xl overflow-hidden shadow-xl border-2 transition-all duration-300 relative bg-white text-slate-800
                            ${isSelected 
                                ? 'border-blue-500 ring-4 ring-blue-500/30 shadow-blue-900/40 scale-[1.02]' 
                                : 'border-slate-700/80 group-hover:border-slate-500 group-hover:shadow-2xl'
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