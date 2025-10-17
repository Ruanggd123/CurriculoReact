
export interface PersonalData {
  name: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
  summary: string;
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

export type SectionType = 'experience' | 'education' | 'skills' | 'projects' | 'languages';

export interface ResumeSection {
  id: string;
  type: SectionType;
  title: string;
  items: Experience[] | Education[] | Skill[] | Project[] | Language[];
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

export type TemplateOption = 'classic' | 'modern' | 'compact' | 'executive';

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