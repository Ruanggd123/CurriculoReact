import { ResumeData, UiConfig } from './types';
import { generateId } from './utils';

export const initialResumeData: ResumeData = {
  personal: {
    name: 'João Silva',
    jobTitle: 'Engenheiro de Software Sênior | Tech Lead',
    email: 'joao.silva@techmail.com',
    phone: '(11) 99876-5432',
    location: 'São Paulo, SP, Brasil',
    linkedin: 'linkedin.com/in/joaosilva-dev',
    github: 'github.com/joaosilva',
    website: 'joaosilva.dev',
  },
  sections: [
    {
      id: "summary_section",
      type: 'summary',
      title: 'Resumo Profissional',
      items: [
        {
          id: generateId(),
          text: 'Engenheiro de Software altamente qualificado com mais de 8 anos de experiência no ciclo completo de desenvolvimento de software, desde a arquitetura até a implantação. Especialista em sistemas distribuídos de alta escala, arquiteturas de microsserviços e soluções em nuvem (AWS/Azure). Atualmente liderando uma equipe de 10 desenvolvedores na modernização de uma plataforma legada para uma arquitetura baseada em eventos, resultando em uma melhoria de 300% na performance e redução de 40% nos custos operacionais. Apaixonado por código limpo, práticas de DevOps e mentoria técnica.'
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
          company: 'TechFin Solutions',
          role: 'Tech Lead',
          startDate: '2021-03',
          endDate: 'Presente',
          description: 'Liderança técnica de squads multidisciplinares focados em produtos financeiros. Responsável por decisões arquiteturais críticas, revisão de código e padronização de práticas de engenharia.\n\n• Arquitetei e liderei a migração de um monólito Java legado para microsserviços em Node.js e Go, reduzindo o tempo de deploy de 2 horas para 10 minutos.\n• Implementei pipelines de CI/CD automatizados usando GitHub Actions e Terraform, garantindo entregas contínuas e seguras.\n• Mentoria de desenvolvedores júnior e pleno, estruturando planos de carreira técnica que resultaram na promoção de 3 membros da equipe em 12 meses.'
        },
        {
          id: generateId(),
          company: 'E-Commerce Giant',
          role: 'Desenvolvedor Backend Sênior',
          startDate: '2018-01',
          endDate: '2021-02',
          description: 'Desenvolvimento e manutenção de APIs RESTful de alto tráfego atendendo milhões de requisições diárias.\n\n• Otimizei consultas complexas em PostgreSQL e implementei estratégias de cache com Redis, melhorando o tempo de resposta da API de Busca em 50%.\n• Desenvolvi integração com gateways de pagamento (Stripe, PayPal, PIX) garantindo transações seguras e resilientes.\n• Liderei a iniciativa de observabilidade, implementando ELK Stack e Prometheus para monitoramento em tempo real.'
        },
        {
          id: generateId(),
          company: 'Innovation Labs',
          role: 'Desenvolvedor Full Stack Pleno',
          startDate: '2016-06',
          endDate: '2017-12',
          description: 'Atuação no desenvolvimento de MVPs para startups incubadas, utilizando React no frontend e Node.js no backend.\n\n• Criei interfaces de usuário responsivas e acessíveis seguindo princípios de Mobile-First.\n• Implementei APIs GraphQL para flexibilizar o consumo de dados pelo frontend.\n• Participei ativamente de rituais ágeis (Scrum), contribuindo para a melhoria contínua dos processos de desenvolvimento.'
        },
        {
          id: generateId(),
          company: 'Web Agency 360',
          role: 'Desenvolvedor Júnior',
          startDate: '2014-06',
          endDate: '2016-05',
          description: 'Desenvolvimento de sites institucionais e e-commerces utilizando Wordpress e PHP puro. Colaboração direta com designers para implementação fiel de layouts.\n\n• Manutenção de bases de dados MySQL e otimização de performance de sites.\n• Implementação de temas e plugins customizados para atender requisitos específicos dos clientes.'
        }
      ]
    },
    {
      id: "projects_section",
      type: 'projects',
      title: 'Projetos Relevantes',
      items: [
        {
          id: generateId(),
          name: 'Plataforma de Pagamentos Real-Time',
          description: 'Sistema de processamento de pagamentos capaz de lidar com 10k transações por segundo. Desenvolvido em Go, Kafka e Cassandra. Responsável por desenhar a arquitetura de tolerância a falhas.'
        },
        {
          id: generateId(),
          name: 'Dashboard de Analytics IoT',
          description: 'Aplicação Web para visualização de dados de sensores industriais em tempo real. Stack: React, D3.js, WebSockets e AWS IoT Core. Reduziu o tempo de detecção de falhas em maquinário em 85%.'
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
          degree: 'Mestrado em Ciência da Computação',
          startDate: '2018-02',
          endDate: '2020-12',
          description: 'Foco em Inteligência Artificial e Sistemas Distribuídos. Dissertação sobre Otimização de Alocação de Recursos em Nuvem.'
        },
        {
          id: generateId(),
          institution: 'Universidade Federal de Minas Gerais (UFMG)',
          degree: 'Bacharelado em Engenharia de Sistemas',
          startDate: '2013-02',
          endDate: '2017-12',
          description: 'Participação ativa em projetos de Iniciação Científica e Maratona de Programação. Ênfase em Algoritmos e Estruturas de Dados.'
        }
      ]
    },
    {
      id: "skills_section",
      type: 'skills',
      title: 'Competências Técnicas',
      items: [
        { id: generateId(), name: 'JavaScript / TypeScript' },
        { id: generateId(), name: 'React.js / Next.js' },
        { id: generateId(), name: 'Node.js' },
        { id: generateId(), name: 'Go (Golang)' },
        { id: generateId(), name: 'Docker & Kubernetes' },
        { id: generateId(), name: 'AWS & Azure' },
        { id: generateId(), name: 'SQL (PostgreSQL)' },
        { id: generateId(), name: 'NoSQL (MongoDB, Redis)' },
        { id: generateId(), name: 'CI/CD (GitHub Actions)' },
        { id: generateId(), name: 'Microservices' },
        { id: generateId(), name: 'System Design' },
        { id: generateId(), name: 'Clean Architecture' },
      ]
    },
    {
      id: "languages_section",
      type: 'languages',
      title: 'Idiomas',
      items: [
        { id: generateId(), language: 'Português', proficiency: 'Nativo' },
        { id: generateId(), language: 'Inglês', proficiency: 'Fluente (C1)' },
        { id: generateId(), language: 'Espanhol', proficiency: 'Intermediário (B1)' }
      ]
    }
  ]
};

export const initialUiConfig: UiConfig = {
  template: 'tech', // Changed to tech to match the profile vibe
  backgroundColor: '#111827', // Dark bg for tech theme
  accentColor: '#4ade80', // Green accent
  photo: {
    src: 'https://images.unsplash.com/photo-1556157382-97eda2d622ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    show: true,
    style: 'square',
    position: '50% 20%',
    zoom: 100,
  },
  sectionSizes: {
    name: 36,
    jobTitle: 18,
    sectionTitle: 24,
    summary: 14,
    experience: 14,
    education: 14,
    skills: 13,
  }
};