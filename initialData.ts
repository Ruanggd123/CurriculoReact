
import { ResumeData, UiConfig } from './types';
import { generateId } from './utils';

export const initialResumeData: ResumeData = {
  personal: {
    name: 'Mariana Costa',
    jobTitle: 'Gerente de Marketing Digital',
    email: 'ola@seuemail.com',
    phone: '(11) 99999-9999',
    location: 'São Paulo, SP',
    linkedin: 'linkedin.com/in/mariana-costa',
    github: '',
    website: 'marianacosta.com.br',
  },
  sections: [
    {
      id: "summary_section",
      type: 'summary',
      title: 'Resumo Profissional',
      items: [
        { 
          id: generateId(), 
          text: 'Estrategista de Marketing com mais de 8 anos de experiência em impulsionar o crescimento de marcas no ambiente digital. Especialista em Inbound Marketing, Branding e Liderança de Equipes. Histórico comprovado de aumento de ROI em 150% através de campanhas baseadas em dados. Apaixonada por contar histórias que conectam marcas e pessoas.'
        }
      ]
    },
    {
        id: "experience_section",
        type: 'experience',
        title: 'Experiência Profissional',
        items: [
            {
                id: generateId(),
                company: 'TechGrowth Solutions',
                role: 'Head de Marketing',
                startDate: '2021-03',
                endDate: 'Presente',
                description: '• Liderança de uma equipe de 12 pessoas (Design, Copy, Performance).\n• Implementação de nova estratégia de CRM que aumentou a retenção de clientes em 25%.\n• Gestão de orçamento anual de R$ 2 milhões com foco em maximização de performance.',
            },
            {
                id: generateId(),
                company: 'Agência Criativa Pulse',
                role: 'Coordenadora de Mídia',
                startDate: '2018-06',
                endDate: '2021-02',
                description: '• Planejamento e execução de campanhas 360º para grandes varejistas.\n• Responsável pela reestruturação da área de Business Intelligence da agência.\n• Mentoria de analistas juniores e estagiários.',
            },
            {
                id: generateId(),
                company: 'StartUp Vision',
                role: 'Analista de Marketing Pleno',
                startDate: '2016-01',
                endDate: '2018-05',
                description: '• Gestão de redes sociais e criação de conteúdo viral.\n• Crescimento orgânico do Instagram de 10k para 150k seguidores em 18 meses.\n• Organização de eventos corporativos e lançamentos de produtos.',
            }
        ]
    },
    {
      id: "education_section",
      type: 'education',
      title: 'Formação Acadêmica',
      items: [
        {
          id: generateId(),
          institution: 'ESPM',
          degree: 'MBA em Marketing Digital e Data Science',
          startDate: '2019-01',
          endDate: '2020-12',
          description: 'Foco em análise preditiva e comportamento do consumidor.',
        },
        {
          id: generateId(),
          institution: 'USP - Universidade de São Paulo',
          degree: 'Bacharelado em Publicidade e Propaganda',
          startDate: '2012-01',
          endDate: '2015-12',
          description: 'Graduação com láurea acadêmica. TCC focado em Neuromarketing.',
        }
      ]
    },
    {
      id: "projects_section",
      type: 'projects',
      title: 'Projetos de Impacto',
      items: [
        {
          id: generateId(),
          name: 'Rebranding TechGrowth',
          link: 'behance.net/projeto1',
          description: 'Liderança completa do processo de reposicionamento da marca, resultando em 40% mais reconhecimento de mercado segundo pesquisa BrandLift.',
        },
        {
          id: generateId(),
          name: 'Podcast "Marketing do Futuro"',
          link: 'spotify.com/show/xyz',
          description: 'Criação e apresentação de podcast semanal sobre tendências, alcançando Top 10 na categoria Negócios.',
        }
      ]
    },
    {
      id: "skills_section",
      type: 'skills',
      title: 'Habilidades',
      items: [
        { id: generateId(), name: 'Planejamento Estratégico' },
        { id: generateId(), name: 'Google Ads & Analytics' },
        { id: generateId(), name: 'SEO / SEM' },
        { id: generateId(), name: 'Liderança Ágil' },
        { id: generateId(), name: 'Copywriting' },
        { id: generateId(), name: 'Gestão de Crise' },
        { id: generateId(), name: 'Adobe Creative Cloud' },
        { id: generateId(), name: 'HubSpot CRM' }
      ]
    },
    {
        id: "languages_section",
        type: 'languages',
        title: 'Idiomas',
        items: [
            { id: generateId(), language: 'Português', proficiency: 'Nativo' },
            { id: generateId(), language: 'Inglês', proficiency: 'Fluente (C1)' },
            { id: generateId(), language: 'Espanhol', proficiency: 'Avançado' },
        ]
    }
  ]
};

export const initialUiConfig: UiConfig = {
    template: 'infographic',
    backgroundColor: '#ffffff',
    accentColor: '#000000',
    photo: {
        src: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        show: true,
        style: 'rounded-full',
        position: '50% 30%', 
        zoom: 100,
    },
    sectionSizes: {
        name: 32,
        jobTitle: 16,
        sectionTitle: 20,
        summary: 12,
        experience: 12,
        education: 12,
        skills: 12,
    }
};
