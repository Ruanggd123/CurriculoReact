import React from 'react';
import type { TemplateOption } from '../types';

interface TemplateThumbnailsProps {
  currentTemplate: TemplateOption;
  onSelectTemplate: (template: TemplateOption) => void;
}

const templates: { id: TemplateOption; name: string; thumbnail: React.ReactNode }[] = [
  {
    id: 'classic',
    name: 'Clássico',
    thumbnail: (
      <div className="w-full h-full bg-white border border-gray-300 p-1.5 space-y-1">
        <div className="h-2 bg-gray-300 rounded-sm"></div>
        <div className="h-1 bg-blue-200 rounded-sm w-3/4 mx-auto"></div>
        <div className="h-1 bg-gray-200 rounded-sm"></div>
        <div className="h-3 bg-gray-300 rounded-sm w-1/3"></div>
        <div className="h-1 bg-gray-200 rounded-sm w-5/6"></div>
        <div className="h-1 bg-gray-200 rounded-sm w-full"></div>
        <div className="h-3 bg-gray-300 rounded-sm w-1/3 mt-2"></div>
        <div className="h-1 bg-gray-200 rounded-sm w-5/6"></div>
      </div>
    ),
  },
  {
    id: 'modern',
    name: 'Moderno',
    thumbnail: (
      <div className="w-full h-full bg-white border border-gray-300 flex">
        <div className="w-1/3 h-full bg-gray-700 p-1 space-y-1">
          <div className="h-3 w-3 bg-gray-400 rounded-full mx-auto"></div>
          <div className="h-1 bg-gray-500 rounded-sm"></div>
          <div className="h-1 bg-blue-300 rounded-sm w-2/3"></div>
        </div>
        <div className="w-2/3 h-full p-1 space-y-1">
          <div className="h-2 bg-gray-300 rounded-sm w-1/2"></div>
          <div className="h-1 bg-gray-200 rounded-sm"></div>
          <div className="h-1 bg-gray-200 rounded-sm w-5/6"></div>
        </div>
      </div>
    ),
  },
  {
    id: 'compact',
    name: 'Compacto',
    thumbnail: (
        <div className="w-full h-full bg-white border border-gray-300 p-1.5 space-y-1">
            <div className="flex justify-between items-start">
                <div>
                    <div className="h-2 bg-gray-300 rounded-sm w-10"></div>
                    <div className="h-1 bg-blue-200 rounded-sm w-8 mt-0.5"></div>
                </div>
                <div className="h-3 w-3 bg-gray-400 rounded-sm"></div>
            </div>
            <div className="flex space-x-2">
                <div className="h-4 bg-gray-200 rounded-sm w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded-sm w-1/2"></div>
            </div>
             <div className="flex space-x-2 pt-1">
                <div className="w-2/3 space-y-1">
                    <div className="h-2 w-1/3 bg-blue-300 rounded-sm"></div>
                    <div className="h-1 w-full bg-gray-200 rounded-sm"></div>
                    <div className="h-1 w-5/6 bg-gray-200 rounded-sm"></div>
                </div>
                <div className="w-1/3 border-l border-gray-200 pl-1 space-y-1">
                    <div className="h-2 w-full bg-blue-300 rounded-sm"></div>
                    <div className="h-1 w-2/3 bg-gray-200 rounded-sm"></div>
                </div>
            </div>
        </div>
    ),
  },
  {
    id: 'executive',
    name: 'Executivo',
    thumbnail: (
        <div className="w-full h-full bg-white border border-gray-300 flex">
            <div className="w-2/3 h-full p-1.5 space-y-1">
              <div className="h-3 bg-gray-400 rounded-sm w-3/4"></div>
              <div className="h-2 bg-blue-300 rounded-sm w-1/2"></div>
              <div className="h-1 bg-gray-200 rounded-sm"></div>
              <div className="h-1 bg-gray-200 rounded-sm w-5/6"></div>
            </div>
            <div className="w-1/3 h-full bg-gray-100 p-1.5 space-y-2">
              <div className="h-4 w-4 bg-gray-400 rounded-full mx-auto"></div>
              <div className="h-2 bg-blue-300 rounded-sm"></div>
              <div className="h-1 bg-gray-300 rounded-sm w-2/3"></div>
            </div>
        </div>
    ),
  },
];

export const TemplateThumbnails: React.FC<TemplateThumbnailsProps> = ({ currentTemplate, onSelectTemplate }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {templates.map(template => (
        <button
          key={template.id}
          onClick={() => onSelectTemplate(template.id)}
          className={`relative block border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            currentTemplate === template.id ? 'border-blue-500 shadow-md' : 'border-gray-300 hover:border-blue-400'
          }`}
        >
          <div className="aspect-[3/4] w-full p-1">{template.thumbnail}</div>
          <span className="block text-center text-xs font-semibold text-gray-700 py-1 bg-gray-50 rounded-b-md">
            {template.name}
          </span>
          {currentTemplate === template.id && (
            <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center border-2 border-white">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
          )}
        </button>
      ))}
    </div>
  );
};
