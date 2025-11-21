
export interface PersonalData {
  name: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
}

export interface SummaryItem {
    id: string;
    text: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  name: string;
  link: string;
  description: string;
}

export interface Language {
    id: string;
    language: string;
    proficiency: string;
}

export type SectionType = 'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'languages';

export type SectionItem = SummaryItem | Experience | Education | Skill | Project | Language;

export interface ResumeSection {
  id: string;
  type: SectionType;
  title: string;
  items: SectionItem[];
}

export interface ResumeData {
  personal: PersonalData;
  sections: ResumeSection[];
}

export interface PhotoConfig {
  src: string;
  show: boolean;
  style: 'rounded-full' | 'rounded-lg' | 'rounded-none';
  position: string; 
  zoom: number;
}

export type TemplateOption = 
  | 'classic' 
  | 'modern' 
  | 'compact' 
  | 'executive' 
  | 'creative'
  | 'modern-minimalist'
  | 'modern-colorful'
  | 'creative-icons'
  | 'creative-sidebar'
  | 'portfolio-visual'
  | 'modern-timeline'
  | 'infographic'
  | 'minimalist-bw'
  | 'blogger'
  | 'tech'
  | 'designer'
  | 'academic'
  | 'admin-manager'
  | 'finance'
  | 'sales'
  | 'hr'
  | 'marketing'
  | 'logistics'
  | 'health'
  | 'engineering'
  | 'educator'
  | 'journalist'
  | 'artist'
  | 'director'
  | 'photographer'
  | 'architect'
  | 'consultant'
  | 'pmo'
  | 'scientist'
  | 'sustainability'
  | 'therapist'
  | 'operations';

export interface UiConfig {
  template: TemplateOption;
  backgroundColor: string;
  accentColor: string;
  photo: PhotoConfig;
  sectionSizes: {
    name: number;
    jobTitle: number;
    sectionTitle: number;
    summary: number;
    experience: number;
    education: number;
    skills: number;
  };
}

export interface Resume {
  id: string;
  title: string;
  lastModified: string;
  data: ResumeData;
  ui: UiConfig;
}

export type View = 
  | 'home'
  | 'auth'
  | 'builder'
  | 'meus-curriculos'
  | 'templates'
  | 'planos'
  | 'sobre'
  | 'contato'
  | 'blog'
  | 'trabalhe-conosco'
  | 'criar-curriculo'
  | 'ia-descricao'
  | 'importar-linkedin'
  | 'faq'
  | 'central-ajuda'
  | 'suporte-email'
  | 'termos'
  | 'privacidade'
  | 'cookies'
  | 'dados-lgpd'
  | 'perfil'
  | 'assinatura';

export interface User {
  id: string;
  email: string;
  subscriptionStatus: 'free' | 'pro';
}