import { ResumeData, UiConfig } from './types';
import { generateId } from './utils';

export const initialResumeData: ResumeData = {
  personal: {
    name: 'Ana Carolina Mendes',
    jobTitle: 'Desenvolvedora Full Stack & UX Designer',
    email: 'ana.mendes@dev.com.br',
    phone: '(11) 98765-4321',
    location: 'São Paulo, SP — Brasil',
    linkedin: 'linkedin.com/in/ana-carolina-mendes',
    github: 'github.com/anacarolmendes',
    website: 'anacarol.dev',
  },
  sections: [
    {
      id: "summary_section",
      type: 'summary',
      title: 'Resumo Profissional',
      items: [
        {
          id: generateId(),
          text: 'Desenvolvedora Full Stack com 6 anos de experiência na criação de produtos digitais que unem código de qualidade com design centrado no usuário. Especialista em React, Node.js e Cloud AWS. Apaixonada por acessibilidade, performance e por transformar ideias complexas em experiências simples e bonitas. Contribuidora ativa em projetos open source e palestrante em meetups de tecnologia.'
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
          company: 'Nubank',
          role: 'Desenvolvedora Full Stack Sênior',
          startDate: '2022-03',
          endDate: 'Presente',
          description: 'Desenvolvimento de features de alto impacto para o app de crédito utilizado por +90 milhões de clientes.\n\n• Liderei a migração de componentes legados React Native para a nova design system proprietária, reduzindo o tempo de carregamento de telas em 40%.\n• Arquitetei e implementei uma API GraphQL em Node.js para o módulo de fatura, melhorando o DX do time de frontend.\n• Mentoria técnica de 4 desenvolvedoras júnior, conduzindo code reviews e sessões semanais de pair programming.'
        },
        {
          id: generateId(),
          company: 'Hotmart',
          role: 'Engenheira de Software Plena',
          startDate: '2019-08',
          endDate: '2022-02',
          description: 'Desenvolvimento de plataformas SaaS de ensino digital com foco em performance e escalabilidade.\n\n• Implementei sistema de notificações em tempo real com WebSockets e Redis Pub/Sub, atendendo picos de 50k usuários simultâneos.\n• Refatorei o pipeline de CI/CD no GitLab, reduzindo o tempo de deploy de 45 para 12 minutos.\n• Colaborei diretamente com Product Design para criar e documentar os componentes da nova biblioteca UI compartilhada.'
        },
        {
          id: generateId(),
          company: 'Agência Digital Criativa',
          role: 'Desenvolvedora Frontend & UI Designer',
          startDate: '2018-01',
          endDate: '2019-07',
          description: 'Criação de sites e landing pages de alto nível de conversão para clientes nos segmentos de saúde, educação e varejo.\n\n• Desenvolvi mais de 30 projetos usando Vue.js, garantindo entrega dentro do prazo em 100% dos casos.\n• Conduzi testes de usabilidade com usuários reais, aplicando melhorias que aumentaram a taxa de conversão média em 25%.'
        }
      ]
    },
    {
      id: "projects_section",
      type: 'projects',
      title: 'Projetos em Destaque',
      items: [
        {
          id: generateId(),
          name: 'CodeFlow — Plataforma de Ensino de Programação',
          link: 'github.com/anacarolmendes/codeflow',
          description: 'Plataforma open source de aprendizado de código com editor online, execução em sandbox isolado (Docker) e trilhas de aprendizado gamificadas. +800 estrelas no GitHub.'
        },
        {
          id: generateId(),
          name: 'A11y Scanner — Ferramenta de Acessibilidade Web',
          link: 'a11y-scanner.vercel.app',
          description: 'Extensão de navegador que audita páginas em tempo real segundo as diretrizes WCAG 2.1, gerando relatórios com sugestões de correção. Apresentada na JSConf Brasil 2023.'
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
          institution: 'Universidade de São Paulo (USP)',
          degree: 'Bacharelado em Ciência da Computação',
          startDate: '2014-02',
          endDate: '2018-12',
          description: 'Monitora de Estruturas de Dados e Algoritmos. Participação na equipe da Maratona de Programação ACM-ICPC. TCC focado em acessibilidade em aplicações web.'
        },
        {
          id: generateId(),
          institution: 'Interaction Design Foundation',
          degree: 'Certificação em UX Design & User Research',
          startDate: '2020-03',
          endDate: '2020-09',
          description: 'Curso intensivo cobrindo toda a metodologia de Design Centrado no Usuário: pesquisa qualitativa, prototipagem e testes de usabilidade.'
        }
      ]
    },
    {
      id: "skills_section",
      type: 'skills',
      title: 'Habilidades Técnicas',
      items: [
        { id: generateId(), name: 'React / Next.js' },
        { id: generateId(), name: 'TypeScript' },
        { id: generateId(), name: 'Node.js / Express' },
        { id: generateId(), name: 'GraphQL' },
        { id: generateId(), name: 'AWS (Lambda, S3, RDS)' },
        { id: generateId(), name: 'Docker & Kubernetes' },
        { id: generateId(), name: 'PostgreSQL / MongoDB' },
        { id: generateId(), name: 'Figma & Design Systems' },
        { id: generateId(), name: 'Acessibilidade (WCAG)' },
        { id: generateId(), name: 'CI/CD (GitLab, GitHub Actions)' },
        { id: generateId(), name: 'Testes (Jest, Cypress, RTL)' },
        { id: generateId(), name: 'Python (automações)' },
      ]
    },
    {
      id: "languages_section",
      type: 'languages',
      title: 'Idiomas',
      items: [
        { id: generateId(), language: 'Português', proficiency: 'Nativo' },
        { id: generateId(), language: 'Inglês', proficiency: 'Avançado (C1)' },
        { id: generateId(), language: 'Espanhol', proficiency: 'Básico (A2)' }
      ]
    }
  ]
};

export const initialUiConfig: UiConfig = {
  template: 'modern',
  backgroundColor: '#ffffff',
  accentColor: '#6366f1',
  photo: {
    src: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    show: true,
    style: 'rounded-full',
    position: '50% 20%',
    zoom: 110,
  },
  sectionSizes: {
    name: 32,
    jobTitle: 17,
    sectionTitle: 18,
    summary: 14,
    experience: 14,
    education: 14,
    skills: 13,
  }
};