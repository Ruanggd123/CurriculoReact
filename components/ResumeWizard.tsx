import React, { useState } from 'react';
import type { ResumeData, UiConfig, TemplateOption, Experience, Education, Skill, ResumeSection, Language } from '../types';
import { 
    SparklesIcon, UserIcon, BriefcaseIcon, AcademicCapIcon, 
    CheckIcon, PlusIcon, TrashIcon, ArrowLeftIcon, XMarkIcon,
    EmailIcon, PhoneIcon, LocationIcon, LinkedinIcon, GithubIcon
} from './icons';
import { generateId } from '../utils';
import { TemplateThumbnails } from './TemplateThumbnails';

interface ResumeWizardProps {
    onComplete: (data: ResumeData, ui: UiConfig) => void;
    onCancel: () => void;
    initialData?: ResumeData;
    initialUi?: UiConfig;
}

// Áreas profissionais para sugestões inteligentes
const CAREER_AREAS = [
    { 
        id: 'tech', 
        label: '💻 Tecnologia & Dev', 
        defaultJob: 'Desenvolvedor Full Stack', 
        skills: ['React', 'TypeScript', 'Node.js', 'Git', 'SQL', 'APIs REST', 'Docker', 'Metodologias Ágeis', 'Resolução de Problemas', 'Clean Code'],
        achievements: [
            'Desenvolvi e mantive aplicações web escaláveis em React e TypeScript, atendendo mais de 50.000 usuários ativos.',
            'Otimizei a performance e reduzi o tempo de carregamento de páginas em 38% com refatoração e lazy loading.',
            'Implementei pipeline de testes automatizados, reduzindo bugs em produção em 45%.',
            'Colaborei com Product Managers e Designers na entrega de 12 features estratégicas dentro do prazo.',
        ]
    },
    { 
        id: 'adm', 
        label: '📑 Administrativo & Financeiro', 
        defaultJob: 'Assistente Administrativo', 
        skills: ['Excel Avançado', 'Contas a Pagar e Receber', 'Conciliação Bancária', 'Gestão de Documentos', 'Atendimento Corporativo', 'Organização', 'Comunicação Clara', 'Sistemas ERP'],
        achievements: [
            'Gerenciei rotinas de contas a pagar e receber com 100% de conciliação bancária e zero atrasos de faturas.',
            'Desenvolvi planilhas automatizadas e dashboards em Excel que reduziram em 4 horas semanais o fechamento contábil.',
            'Reestruturei o arquivo físico e digital da empresa, acelerando a busca de contratos e notas fiscais em 50%.',
            'Atendimento a clientes e fornecedores com índice de resolução de pendências de 98% no primeiro contato.',
        ]
    },
    { 
        id: 'sales', 
        label: '💼 Comercial & Vendas', 
        defaultJob: 'Executivo de Vendas', 
        skills: ['Prospecção Ativa B2B', 'Negociação Comercial', 'CRM (HubSpot/Salesforce)', 'Fechamento de Contratos', 'Gestão de Carteira', 'Comunicação Persuasiva', 'Foco em Metas', 'Pós-Venda'],
        achievements: [
            'Superei as metas mensais de vendas consecutivamente em +120%, gerando mais de R$ 450 mil em novo faturamento.',
            'Prospecção ativa qualificada que aumentou em 35% o volume de oportunidades no funil de vendas.',
            'Negociação e fechamento de contratos corporativos de longo prazo com retenção de clientes acima de 90%.',
            'Implementei cadência de follow-up no CRM que diminuiu o ciclo médio de fechamento de 30 para 18 dias.',
        ]
    },
    { 
        id: 'marketing', 
        label: '📣 Marketing & Mídias', 
        defaultJob: 'Analista de Marketing Digital', 
        skills: ['Tráfego Pago (Meta/Google Ads)', 'Copywriting', 'SEO & Analytics', 'Canva / Photoshop', 'Gestão de Redes Sociais', 'Inbound Marketing', 'E-mail Marketing', 'Criatividade Estratégica'],
        achievements: [
            'Gerenciei orçamento de campanhas de tráfego pago (Meta/Google Ads) mantendo ROAS médio de 4.2x.',
            'Crescimento orgânico de +150% nas redes sociais da marca em 6 meses com calendário editorial estratégico.',
            'Otimizei landing pages e copies resultando em um aumento de 28% na taxa de conversão de leads.',
            'Estruturei fluxos automatizados de nutrição de e-mail marketing com taxa de abertura média de 32%.',
        ]
    },
    { 
        id: 'design', 
        label: '🎨 Design & UX/UI', 
        defaultJob: 'UI/UX Designer', 
        skills: ['Figma', 'Design System', 'UX Research', 'Prototipagem Interativa', 'Adobe Creative Suite', 'Arquitetura de Informação', 'Testes de Usabilidade', 'Atenção aos Detalhes'],
        achievements: [
            'Desenvolvi o design de ponta a ponta de novo produto digital, validado através de 20+ testes de usabilidade.',
            'Criei e documentei o Design System da empresa no Figma, acelerando as entregas de design em 40%.',
            'Redesenhei o fluxo de checkout mobile aumentando a taxa de conversão em 18%.',
            'Alinhamento contínuo com squads de tecnologia garantindo fidelidade de 100% na implementação de interfaces.',
        ]
    },
    { 
        id: 'support', 
        label: '🤝 Atendimento & Suporte', 
        defaultJob: 'Analista de Customer Success', 
        skills: ['Atendimento Multicanal', 'Zendesk / Freshdesk', 'Empatia & Escuta Ativa', 'Resolução de Conflitos', 'Fidelização de Clientes', 'Comunicação Assertiva', 'Gestão de Crises', 'CSAT / NPS'],
        achievements: [
            'Mantive índice de satisfação do cliente (CSAT) superior a 96% em mais de 1.200 chamados atendidos.',
            'Reduzi o tempo médio de primeira resposta (FRT) de 15 para 4 minutos com criação de scripts e base de conhecimento.',
            'Identifiquei gargalos recorrentes reportados por usuários e liderei reuniões de melhoria contínua com a equipe de produto.',
            'Aumento de 15% nas renovações de planos através de relacionamento proativo no pós-venda.',
        ]
    },
    { 
        id: 'health', 
        label: '🏥 Saúde & Cuidados', 
        defaultJob: 'Técnico de Enfermagem', 
        skills: ['Assistência ao Paciente', 'Administração de Medicamentos', 'Prontuário Eletrônico', 'Normas de Biossegurança', 'Trabalho sob Pressão', 'Ética Profissional', 'Humanização no Acolhimento'],
        achievements: [
            'Prestei assistência humanizada a pacientes em clínica e enfermaria com rigoroso cumprimento das normas COFEN/COREN.',
            'Administração segura de medicações e controle preciso de sinais vitais sem ocorrência de incidentes.',
            'Registro detalhado e imediato de prontuários eletrônicos garantindo continuidade impecável do cuidado multiprofissional.',
            'Participação ativa em treinamentos de emergência, suporte básico de vida e prevenção de infecções hospitalares.',
        ]
    },
    { 
        id: 'logistics', 
        label: '📦 Logística & Operações', 
        defaultJob: 'Assistente de Logística', 
        skills: ['Controle de Estoque', 'Conferência de Carga e Descarga', 'Sistemas WMS/ERP', 'Inventário Cíclico', 'Roteirização de Entregas', 'Agilidade Operacional', 'Organização de Armazém'],
        achievements: [
            'Controle diário de movimentação de estoque com acuracidade de inventário mantida acima de 99.2%.',
            'Otimizei a rotina de separação de pedidos (picking/packing) reduzindo o tempo de expedição em 25%.',
            'Conferência rigorosa de notas fiscais e mercadorias eliminando devoluções por divergência de itens.',
            'Negociação com transportadoras parceiras que reduziu custos de frete fracionado em 12%.',
        ]
    },
    { 
        id: 'first_job', 
        label: '🌱 Primeiro Emprego / Estágio', 
        defaultJob: 'Estagiário / Jovem Aprendiz', 
        skills: ['Vontade de Aprender', 'Pontualidade & Compromisso', 'Boa Comunicação', 'Pacote Office Básico', 'Organização Pessoal', 'Trabalho em Equipe', 'Proatividade', 'Adaptabilidade'],
        achievements: [
            'Dedicação ao aprendizado rápido de novas ferramentas e processos internos da organização.',
            'Apoio eficiente em rotinas administrativas, atendimento telefônico e organização de arquivos.',
            'Participação colaborativa em projetos em equipe com entregas pontuais e alto comprometimento.',
            'Foco em desenvolver habilidades técnicas e comportamentais para agregar valor imediato à empresa.',
        ]
    },
];


const ACCENT_COLORS = [
    { label: 'Azul Real', value: '#2563eb' },
    { label: 'Índigo Profundo', value: '#4f46e5' },
    { label: 'Esmeralda Tech', value: '#059669' },
    { label: 'Roxo Criativo', value: '#7c3aed' },
    { label: 'Âmbar Executivo', value: '#d97706' },
    { label: 'Slate Neutro', value: '#475569' },
];

const SENIORITY_LEVELS = [
    'Estágio / Trainee',
    'Júnior',
    'Pleno',
    'Sênior',
    'Especialista',
    'Coordenação / Gestão'
];

const WORK_MODALITIES = [
    'Remoto (Home Office)',
    'Híbrido',
    'Presencial'
];

const COMMON_LANGUAGES = [
    { name: 'Inglês', defaultProficiency: 'Intermediário (B2)' },
    { name: 'Espanhol', defaultProficiency: 'Básico (A2)' },
    { name: 'Português', defaultProficiency: 'Nativo' },
    { name: 'Francês', defaultProficiency: 'Básico (A1)' },
    { name: 'Alemão', defaultProficiency: 'Básico (A1)' },
];

const PROFICIENCY_OPTIONS = [
    'Básico (A1/A2)',
    'Intermediário (B1/B2)',
    'Avançado (C1)',
    'Fluente / Nativo'
];

export const ResumeWizard: React.FC<ResumeWizardProps> = ({ onComplete, onCancel, initialData, initialUi }) => {
    // Current Wizard Step (1 to 8)
    const [step, setStep] = useState<number>(1);
    const totalSteps = 8;
    const progressPercent = Math.round((step / totalSteps) * 100);

    // Mobile Preview Drawer State
    const [showMobilePreview, setShowMobilePreview] = useState(false);

    // ==================== FORM STATES (COM LIBERDADE DE MARCAR/DESMARCAR) ====================

    // Step 1: Objetivo & Foco
    const [selectedAreaId, setSelectedAreaId] = useState<string>(''); // Vazio por padrão: liberdade total!
    const [jobTitle, setJobTitle] = useState(initialData?.personal.jobTitle || '');
    const [seniority, setSeniority] = useState<string>(''); // Vazio por padrão: liberdade de não informar!
    const [workModality, setWorkModality] = useState<string>(''); // Opcional

    // Step 2: Dados Pessoais & Contato
    const [name, setName] = useState(initialData?.personal.name || '');
    const [email, setEmail] = useState(initialData?.personal.email || '');
    const [phone, setPhone] = useState(initialData?.personal.phone || '');
    const [location, setLocation] = useState(initialData?.personal.location || '');
    const [linkedin, setLinkedin] = useState(initialData?.personal.linkedin || '');
    const [github, setGithub] = useState(initialData?.personal.github || '');

    // Step 3: Experiência
    const existingExp = initialData?.sections.find(s => s.type === 'experience')?.items as Experience[] | undefined;
    const [hasExperience, setHasExperience] = useState<boolean>(existingExp && existingExp.length > 0 ? true : true);
    const [experiences, setExperiences] = useState<Experience[]>(
        existingExp && existingExp.length > 0 ? existingExp : [
            {
                id: generateId(),
                company: '',
                role: '',
                startDate: '',
                endDate: 'Presente',
                description: ''
            }
        ]
    );
    const [editingExpIndex, setEditingExpIndex] = useState<number>(0);

    // Step 4: Formação
    const existingEdu = initialData?.sections.find(s => s.type === 'education')?.items as Education[] | undefined;
    const [educations, setEducations] = useState<Education[]>(
        existingEdu && existingEdu.length > 0 ? existingEdu : [
            {
                id: generateId(),
                institution: '',
                degree: '',
                startDate: '',
                endDate: '',
                description: ''
            }
        ]
    );

    // Step 5: Habilidades
    const existingSkills = initialData?.sections.find(s => s.type === 'skills')?.items as Skill[] | undefined;
    const [skills, setSkills] = useState<string[]>(
        existingSkills && existingSkills.length > 0 ? existingSkills.map(s => s.name) : []
    );
    const [newSkillInput, setNewSkillInput] = useState('');

    // Step 6: Idiomas (Novo e crucial para currículos vencedores)
    const existingLangs = initialData?.sections.find(s => s.type === 'languages')?.items as Language[] | undefined;
    const [includeLanguages, setIncludeLanguages] = useState<boolean>(existingLangs && existingLangs.length > 0 ? true : false);
    const [languages, setLanguages] = useState<Language[]>(
        existingLangs && existingLangs.length > 0 ? existingLangs : [
            { id: generateId(), language: 'Inglês', proficiency: 'Intermediário (B1/B2)' }
        ]
    );
    const [customLangName, setCustomLangName] = useState('');

    // Step 7: Resumo
    const existingSummary = initialData?.sections.find(s => s.type === 'summary')?.items[0] as { text: string } | undefined;
    const [includeSummary, setIncludeSummary] = useState<boolean>(true);
    const [summary, setSummary] = useState(existingSummary?.text || '');

    // Step 8: Modelo & Cores
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateOption>(initialUi?.template || 'modern');
    const [selectedColor, setSelectedColor] = useState(initialUi?.accentColor || '#2563eb');

    // ==================== TOGGLE & UNSELECT HANDLERS ====================

    // Toggle Senioridade (se clicar na que já está marcada, desmarca!)
    const handleToggleSeniority = (level: string) => {
        setSeniority(prev => prev === level ? '' : level);
    };

    // Toggle Modalidade de Trabalho
    const handleToggleModality = (mod: string) => {
        setWorkModality(prev => prev === mod ? '' : mod);
    };

    // Toggle Área de Atuação
    const handleToggleArea = (area: typeof CAREER_AREAS[0]) => {
        if (selectedAreaId === area.id) {
            setSelectedAreaId('');
        } else {
            setSelectedAreaId(area.id);
            if (!jobTitle) {
                setJobTitle(area.defaultJob);
            }
            // Adiciona algumas skills sugeridas sem duplicar
            const newSkills = Array.from(new Set([...skills, ...area.skills.slice(0, 3)]));
            setSkills(newSkills);
        }
    };

    // Toggle Habilidade
    const handleToggleSkill = (skillName: string) => {
        if (skills.includes(skillName)) {
            setSkills(skills.filter(s => s !== skillName));
        } else {
            setSkills([...skills, skillName]);
        }
    };

    const handleAddCustomSkill = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = newSkillInput.trim();
        if (!trimmed) return;
        if (!skills.includes(trimmed)) {
            setSkills([...skills, trimmed]);
        }
        setNewSkillInput('');
    };

    // Experience helpers
    const handleAddExperience = () => {
        const newExp: Experience = {
            id: generateId(),
            company: '',
            role: jobTitle || '',
            startDate: '',
            endDate: 'Presente',
            description: ''
        };
        setExperiences([...experiences, newExp]);
        setEditingExpIndex(experiences.length);
    };

    const handleRemoveExperience = (index: number) => {
        const updated = experiences.filter((_, i) => i !== index);
        setExperiences(updated);
        setEditingExpIndex(Math.max(0, index - 1));
    };

    const handleUpdateExperience = (field: keyof Experience, value: string) => {
        if (experiences.length === 0) return;
        const updated = [...experiences];
        updated[editingExpIndex] = { ...updated[editingExpIndex], [field]: value };
        setExperiences(updated);
    };

    // Education helpers
    const handleAddEducation = () => {
        const newEdu: Education = {
            id: generateId(),
            institution: '',
            degree: '',
            startDate: '',
            endDate: '',
            description: ''
        };
        setEducations([...educations, newEdu]);
    };

    const handleRemoveEducation = (index: number) => {
        setEducations(educations.filter((_, i) => i !== index));
    };

    const handleUpdateEducation = (index: number, field: keyof Education, value: string) => {
        const updated = [...educations];
        updated[index] = { ...updated[index], [field]: value };
        setEducations(updated);
    };

    // Languages helpers
    const handleAddLanguage = (langName: string, defaultProf: string = 'Intermediário (B1/B2)') => {
        if (languages.some(l => l.language.toLowerCase() === langName.toLowerCase())) return;
        setLanguages([...languages, { id: generateId(), language: langName, proficiency: defaultProf }]);
    };

    const handleRemoveLanguage = (id: string) => {
        setLanguages(languages.filter(l => l.id !== id));
    };

    const handleUpdateLanguageProficiency = (id: string, proficiency: string) => {
        setLanguages(languages.map(l => l.id === id ? { ...l, proficiency } : l));
    };

    // Smart Summary Generator (Fórmula de Impacto / Elevator Pitch)
    const handleGenerateSummary = () => {
        const titleStr = jobTitle ? (seniority ? `${jobTitle} (${seniority})` : jobTitle) : 'Profissional';
        const topSkills = skills.slice(0, 4).join(', ');
        const recentCompany = experiences.find(e => e.company.trim())?.company;
        const recentDegree = educations.find(e => e.degree.trim())?.degree;
        const modalityStr = workModality ? ` Disponibilidade para atuação em modelo ${workModality}.` : '';

        let generated = '';
        if (seniority === 'Estágio / Trainee' || !hasExperience) {
            generated = `Profissional motivado e com perfil colaborativo, com foco em atuação como ${titleStr}.${recentDegree ? ` Formação acadêmica em ${recentDegree}.` : ''} Habilidades sólidas em ${topSkills || 'aprendizado contínuo e resolução de problemas'}. Grande entusiasmo para agregar valor em equipes de alta performance e desenvolver projetos de impacto.${modalityStr}`;
        } else {
            generated = `${titleStr} com histórico comprovado de entregas consistentes${recentCompany ? ` em empresas como ${recentCompany}` : ''}. Domínio prático em ${topSkills || 'gestão de processos e tecnologias do setor'}. Foco orientado a resultados mensuráveis, melhoria contínua de rotinas e colaboração ágil com times multidisciplinares.${modalityStr}`;
        }

        setSummary(generated);
        setIncludeSummary(true);
    };

    // Finish Wizard & Output ResumeData + UiConfig
    const handleFinish = () => {
        const finalSections: ResumeSection[] = [];

        // 1. Resumo
        if (includeSummary && summary.trim()) {
            finalSections.push({
                id: 'summary_section',
                type: 'summary',
                title: 'Resumo Profissional',
                items: [{ id: generateId(), text: summary.trim() }]
            });
        }

        // 2. Experiência
        if (hasExperience) {
            const validExp = experiences.filter(e => e.company.trim() || e.role.trim());
            if (validExp.length > 0) {
                finalSections.push({
                    id: 'experience_section',
                    type: 'experience',
                    title: 'Experiência Profissional',
                    items: validExp
                });
            }
        }

        // 3. Formação
        const validEdu = educations.filter(e => e.institution.trim() || e.degree.trim());
        if (validEdu.length > 0) {
            finalSections.push({
                id: 'education_section',
                type: 'education',
                title: 'Formação Acadêmica',
                items: validEdu
            });
        }

        // 4. Habilidades
        if (skills.length > 0) {
            finalSections.push({
                id: 'skills_section',
                type: 'skills',
                title: 'Principais Habilidades & Competências',
                items: skills.map(name => ({ id: generateId(), name }))
            });
        }

        // 5. Idiomas
        if (includeLanguages && languages.length > 0) {
            finalSections.push({
                id: 'languages_section',
                type: 'languages',
                title: 'Idiomas',
                items: languages
            });
        }

        // Montar título final com senioridade se houver
        let displayJobTitle = jobTitle.trim();
        if (displayJobTitle && seniority && !displayJobTitle.toLowerCase().includes(seniority.toLowerCase())) {
            displayJobTitle = `${displayJobTitle} • ${seniority}`;
        }

        const compiledData: ResumeData = {
            personal: {
                name: name.trim() || 'Seu Nome Completo',
                jobTitle: displayJobTitle || 'Profissional',
                email: email.trim(),
                phone: phone.trim(),
                location: location.trim(),
                linkedin: linkedin.trim(),
                github: github.trim(),
                website: ''
            },
            sections: finalSections
        };

        const compiledUi: UiConfig = {
            template: selectedTemplate,
            backgroundColor: '#ffffff',
            accentColor: selectedColor,
            photo: initialUi?.photo || {
                src: '',
                show: false,
                style: 'rounded-full',
                position: 'top',
                zoom: 1
            },
            sectionSizes: initialUi?.sectionSizes || {
                name: 24,
                jobTitle: 14,
                sectionTitle: 13,
                summary: 10,
                experience: 10,
                education: 10,
                skills: 10
            }
        };

        onComplete(compiledData, compiledUi);
    };

    // Área atual selecionada para sugestões de skills
    const currentAreaObj = CAREER_AREAS.find(a => a.id === selectedAreaId);

    // ==================== LIVE MINI PREVIEW COMPONENT ====================
    const LiveMiniPreviewCard = () => (
        <div className="w-full bg-slate-950/95 border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-black/80 space-y-4 text-left font-sans select-none relative overflow-hidden backdrop-blur-xl">
            {/* Ambient indicator */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Prévia em Tempo Real
                    </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                    {selectedTemplate.toUpperCase()}
                </span>
            </div>

            {/* Document Header Preview */}
            <div className="space-y-1">
                <div className="text-lg font-black text-white tracking-tight truncate" style={{ color: selectedColor }}>
                    {name || 'Nome do Candidato'}
                </div>
                <div className="text-xs font-semibold text-slate-300 truncate">
                    {jobTitle || 'Cargo / Função Desejada'}
                    {seniority && <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-blue-300 border border-slate-700">{seniority}</span>}
                </div>
                {(email || phone || location) && (
                    <div className="flex flex-wrap gap-x-2 gap-y-1 text-[10px] text-slate-400 pt-1">
                        {location && <span>📍 {location}</span>}
                        {phone && <span>📱 {phone}</span>}
                        {email && <span>✉️ {email}</span>}
                    </div>
                )}
            </div>

            {/* Summary Preview */}
            {includeSummary && summary.trim() && (
                <div className="border-t border-slate-800/80 pt-2 space-y-1">
                    <div className="text-[10px] font-bold uppercase text-slate-400">Resumo</div>
                    <p className="text-[11px] text-slate-300 line-clamp-3 leading-relaxed">
                        {summary}
                    </p>
                </div>
            )}

            {/* Experiences Preview */}
            {hasExperience && experiences.some(e => e.company.trim() || e.role.trim()) && (
                <div className="border-t border-slate-800/80 pt-2 space-y-1.5">
                    <div className="text-[10px] font-bold uppercase text-slate-400">Experiências Recentes</div>
                    {experiences.filter(e => e.company.trim() || e.role.trim()).slice(0, 2).map((exp, i) => (
                        <div key={i} className="text-[11px] bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                            <div className="font-bold text-white flex justify-between">
                                <span>{exp.role || 'Cargo'}</span>
                                <span className="text-[9px] text-slate-400">{exp.startDate} - {exp.endDate}</span>
                            </div>
                            <div className="text-slate-400 text-[10px]">{exp.company || 'Empresa'}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Skills Preview */}
            {skills.length > 0 && (
                <div className="border-t border-slate-800/80 pt-2 space-y-1.5">
                    <div className="text-[10px] font-bold uppercase text-slate-400">Habilidades ({skills.length})</div>
                    <div className="flex flex-wrap gap-1">
                        {skills.slice(0, 6).map(s => (
                            <span key={s} className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-300 border border-blue-500/20 font-medium">
                                {s}
                            </span>
                        ))}
                        {skills.length > 6 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] text-slate-500 font-medium">
                                +{skills.length - 6}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Languages Preview */}
            {includeLanguages && languages.length > 0 && (
                <div className="border-t border-slate-800/80 pt-2 space-y-1">
                    <div className="text-[10px] font-bold uppercase text-slate-400">Idiomas</div>
                    <div className="flex flex-wrap gap-2 text-[10px] text-slate-300">
                        {languages.map((l, i) => (
                            <span key={i}>🌐 {l.language} ({l.proficiency})</span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-full bg-[#090d16] text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white relative">
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-[#090d16]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-[140px] rounded-full"></div>
                <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-purple-600/10 blur-[130px] rounded-full"></div>
            </div>

            {/* ==================== WIZARD TOP HEADER ==================== */}
            <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-2xl sticky top-0 z-40 px-3 sm:px-8 py-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <button 
                        onClick={onCancel}
                        className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors shrink-0"
                        title="Sair do Assistente"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent font-black text-xs sm:text-base tracking-tight truncate">
                                <span className="hidden sm:inline">Assistente do Currículo Vencedor</span>
                                <span className="sm:hidden">Assistente</span>
                            </span>
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30 hidden xs:inline-flex shrink-0">
                                ATS
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 hidden sm:block truncate">
                            Perguntas estratégicas com liberdade total de marcar, desmarcar ou pular.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {/* Direct Model Picker Button */}
                    <button
                        type="button"
                        onClick={() => setStep(8)}
                        className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 active:scale-95 shadow-sm border shrink-0 ${
                            step === 8 
                                ? 'bg-blue-600 text-white border-blue-400' 
                                : 'bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 border-blue-700/50'
                        }`}
                        title="Ver e escolher entre todos os 35+ modelos de currículo"
                    >
                        <span>🎨</span>
                        <span className="hidden sm:inline">Modelo:</span>
                        <span className="text-white capitalize truncate max-w-[60px] sm:max-w-none">{selectedTemplate}</span>
                    </button>

                    {/* Mobile Toggle Preview Button */}
                    <button
                        onClick={() => setShowMobilePreview(!showMobilePreview)}
                        className="lg:hidden px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 border border-slate-700 text-blue-300 flex items-center gap-1 shadow-sm shrink-0"
                    >
                        <span>👁️</span>
                        <span className="hidden sm:inline">{showMobilePreview ? 'Ocultar' : 'Ver Prévia'}</span>
                        <span className="sm:hidden">{showMobilePreview ? 'Fechar' : 'Prévia'}</span>
                    </button>

                    <button
                        onClick={handleFinish}
                        className="text-xs text-slate-300 hover:text-white transition-colors font-semibold px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-700/80 hover:border-slate-600 bg-slate-900/60 hover:bg-slate-800/60 whitespace-nowrap shrink-0"
                        title="Pular direto para o editor completo com o que foi preenchido"
                    >
                        <span className="hidden sm:inline">Abrir no Editor Completo →</span>
                        <span className="sm:hidden">Editor →</span>
                    </button>
                </div>
            </header>

            {/* ==================== PROGRESS BAR ==================== */}
            <div className="w-full bg-slate-900/90 border-b border-slate-800/80 px-3 sm:px-8 py-2.5 sm:py-3">
                <div className="max-w-6xl mx-auto flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-300 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold shadow-md shadow-blue-600/50">
                                {step}
                            </span>
                            Etapa {step} de {totalSteps}
                        </span>
                        <span className="text-blue-400 font-mono font-bold">{progressPercent}% Concluído</span>
                    </div>

                    <div className="w-full h-1.5 sm:h-2 bg-slate-800/80 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 transition-all duration-500 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.6)]"
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>

                    {/* Step Navigation Tabs (Clickable on all screen sizes with horizontal scroll) */}
                    <div className="flex items-center justify-start sm:justify-between pt-1 text-[11px] text-slate-400 overflow-x-auto no-scrollbar gap-1.5 pb-1">
                        {[
                            { s: 1, label: '1. Foco' },
                            { s: 2, label: '2. Contato' },
                            { s: 3, label: '3. Experiência' },
                            { s: 4, label: '4. Formação' },
                            { s: 5, label: '5. Habilidades' },
                            { s: 6, label: '6. Idiomas' },
                            { s: 7, label: '7. Resumo' },
                            { s: 8, label: '8. 🎨 Modelos' },
                        ].map(item => (
                            <button
                                key={item.s}
                                type="button"
                                onClick={() => setStep(item.s)}
                                className={`transition-all font-semibold py-1 px-2.5 rounded-lg whitespace-nowrap text-[11px] sm:text-xs shrink-0 ${
                                    step === item.s 
                                        ? 'text-white font-bold bg-blue-600 shadow-md shadow-blue-900/50 ring-1 ring-blue-400/40' 
                                        : step > item.s 
                                            ? 'text-blue-300 bg-blue-950/30 hover:text-white border border-blue-900/40' 
                                            : 'text-slate-400 hover:text-white bg-slate-800/40 border border-slate-700/40'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ==================== MAIN DUAL-PANE LAYOUT ==================== */}
            <div className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 pb-36 flex items-start gap-8">
                
                {/* LEFT PANE: QUESTIONS & CONTROLS */}
                <main className="flex-1 w-full space-y-6">

                    {/* STEP 1: OBJETIVO & CARGO ALVO */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="space-y-2 text-left">
                                <span className="inline-block text-xs font-bold uppercase tracking-wider text-blue-400">
                                    Passo 1 de 8 • Foco do Currículo Vencedor
                                </span>
                                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                    Qual vaga ou cargo você deseja conquistar?
                                </h2>
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    Recrutadores gastam em média 6 segundos na primeira triagem. Um cargo claro e bem definido no topo é o primeiro passo para o sim.
                                </p>
                            </div>

                            {/* Job Title Input */}
                            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-4 text-left shadow-lg">
                                <div>
                                    <div className="flex justify-between items-baseline mb-1.5">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                                            Título Exato do Cargo: *
                                        </label>
                                        <span className="text-[11px] text-slate-500">Ex: Desenvolvedor Full Stack, Assistente Administrativo...</span>
                                    </div>
                                    <input
                                        type="text"
                                        value={jobTitle}
                                        onChange={(e) => setJobTitle(e.target.value)}
                                        placeholder="Ex: Desenvolvedor Front-End, Gerente Comercial, Analista Financeiro..."
                                        className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder-slate-500 font-medium"
                                        autoFocus
                                    />
                                </div>

                                {/* Seniority Selector (WITH TOGGLE & UNSELECT FREEDOM!) */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                                            Nível de Experiência / Senioridade: <span className="text-slate-500 font-normal">(Opcional - clique para marcar ou desmarcar)</span>
                                        </label>
                                        {seniority && (
                                            <button
                                                type="button"
                                                onClick={() => setSeniority('')}
                                                className="text-[11px] text-blue-400 hover:text-white underline font-medium"
                                            >
                                                Desmarcar nível
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {SENIORITY_LEVELS.map(lvl => {
                                            const isSelected = seniority === lvl;
                                            return (
                                                <button
                                                    key={lvl}
                                                    type="button"
                                                    onClick={() => handleToggleSeniority(lvl)}
                                                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 flex items-center gap-1.5 ${
                                                        isSelected 
                                                            ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30 ring-2 ring-blue-500/40 font-bold' 
                                                            : 'bg-slate-950/80 text-slate-300 border-slate-700/80 hover:border-slate-600 hover:bg-slate-800/60'
                                                    }`}
                                                >
                                                    {isSelected && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                                                    <span>{lvl}</span>
                                                </button>
                                            );
                                        })}
                                        <button
                                            type="button"
                                            onClick={() => setSeniority('')}
                                            className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                                                seniority === '' 
                                                    ? 'bg-slate-800 text-slate-200 border-slate-600 font-bold' 
                                                    : 'bg-transparent text-slate-500 border-dashed border-slate-700 hover:text-slate-300'
                                            }`}
                                        >
                                            Sem nível / Não especificar
                                        </button>
                                    </div>
                                </div>

                                {/* Work Modality Selector (Optional) */}
                                <div className="pt-2 border-t border-slate-800/80">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                                            Modalidade de Trabalho Preferida: <span className="text-slate-500 font-normal">(Opcional)</span>
                                        </label>
                                        {workModality && (
                                            <button
                                                type="button"
                                                onClick={() => setWorkModality('')}
                                                className="text-[11px] text-blue-400 hover:text-white underline font-medium"
                                            >
                                                Desmarcar
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {WORK_MODALITIES.map(mod => {
                                            const isSelected = workModality === mod;
                                            return (
                                                <button
                                                    key={mod}
                                                    type="button"
                                                    onClick={() => handleToggleModality(mod)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                                        isSelected 
                                                            ? 'bg-emerald-600/30 text-emerald-200 border-emerald-500 ring-1 ring-emerald-500/50' 
                                                            : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:border-slate-700'
                                                    }`}
                                                >
                                                    {isSelected ? `✓ ${mod}` : mod}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Career Area Suggestion Badges (OPTIONAL TOGGLE) */}
                            <div className="text-left space-y-2.5">
                                <div className="flex justify-between items-center">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                                        Área Profissional para Sugestões: <span className="font-normal text-slate-500">(Opcional - clique para escolher ou desmarcar)</span>
                                    </label>
                                    {selectedAreaId && (
                                        <button
                                            type="button"
                                            onClick={() => setSelectedAreaId('')}
                                            className="text-[11px] text-blue-400 hover:text-white underline"
                                        >
                                            Limpar área
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                    {CAREER_AREAS.map(area => {
                                        const isSelected = selectedAreaId === area.id;
                                        return (
                                            <button
                                                key={area.id}
                                                type="button"
                                                onClick={() => handleToggleArea(area)}
                                                className={`p-3 rounded-xl border text-left text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-between ${
                                                    isSelected 
                                                        ? 'bg-blue-600/20 border-blue-500 text-blue-200 shadow-md shadow-blue-500/10 ring-1 ring-blue-500/50 font-bold' 
                                                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                                                }`}
                                            >
                                                <span className="truncate">{area.label}</span>
                                                {isSelected && <CheckIcon className="w-4 h-4 text-blue-400 shrink-0 ml-1" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: DADOS DE CONTATO PROFISSIONAIS */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in duration-300 text-left">
                            <div className="space-y-2">
                                <span className="inline-block text-xs font-bold uppercase tracking-wider text-blue-400">
                                    Passo 2 de 8 • Contato Estratégico
                                </span>
                                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                    Como os recrutadores devem entrar em contato?
                                </h2>
                                <p className="text-sm text-slate-300">
                                    Contatos claros e links profissionais facilitam que as empresas te chamem imediatamente para entrevista.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-lg">
                                {/* Nome Completo */}
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                                        <UserIcon className="w-4 h-4 text-blue-400" /> Nome Completo *
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Ex: Carlos Eduardo de Oliveira"
                                        className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder-slate-500 font-medium"
                                        autoFocus
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                                        <EmailIcon className="w-4 h-4 text-blue-400" /> E-mail de Contato *
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="carlos.oliveira@email.com"
                                        className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-blue-500 outline-none transition-all placeholder-slate-500"
                                    />
                                </div>

                                {/* Telefone / WhatsApp */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                                        <PhoneIcon className="w-4 h-4 text-blue-400" /> WhatsApp / Telefone com DDD *
                                    </label>
                                    <input
                                        type="text"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="(11) 98765-4321"
                                        className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-blue-500 outline-none transition-all placeholder-slate-500"
                                    />
                                </div>

                                {/* Localização */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                                        <LocationIcon className="w-4 h-4 text-blue-400" /> Cidade e Estado <span className="text-slate-500 font-normal">(Opcional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="Ex: São Paulo, SP — Brasil"
                                        className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-blue-500 outline-none transition-all placeholder-slate-500"
                                    />
                                </div>

                                {/* LinkedIn */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                                        <LinkedinIcon className="w-4 h-4 text-blue-400" /> LinkedIn <span className="text-slate-500 font-normal">(Opcional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={linkedin}
                                        onChange={(e) => setLinkedin(e.target.value)}
                                        placeholder="linkedin.com/in/seuperfil"
                                        className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-blue-500 outline-none transition-all placeholder-slate-500"
                                    />
                                </div>

                                {/* GitHub / Portfolio */}
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                                        <GithubIcon className="w-4 h-4 text-blue-400" /> Portfólio, GitHub ou Site <span className="text-slate-500 font-normal">(Opcional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={github}
                                        onChange={(e) => setGithub(e.target.value)}
                                        placeholder="github.com/seuperfil ou meusiite.com.br"
                                        className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-blue-500 outline-none transition-all placeholder-slate-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: EXPERIÊNCIAS PROFISSIONAIS COM FOCO EM RESULTADOS */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in duration-300 text-left">
                            <div className="space-y-2">
                                <span className="inline-block text-xs font-bold uppercase tracking-wider text-blue-400">
                                    Passo 3 de 8 • Histórico Profissional
                                </span>
                                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                    Quais foram suas principais experiências e resultados?
                                </h2>
                                <p className="text-sm text-slate-300">
                                    O segredo do currículo vencedor é mostrar <strong>resultados e conquistas</strong>, não apenas tarefas do dia a dia.
                                </p>
                            </div>

                            {/* Toggle Has Experience */}
                            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                                <button
                                    type="button"
                                    onClick={() => setHasExperience(true)}
                                    className={`flex-1 p-3 sm:p-3.5 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                                        hasExperience 
                                            ? 'bg-blue-600/20 border-blue-500 text-blue-300 ring-2 ring-blue-500/40 shadow-md' 
                                            : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                                    }`}
                                >
                                    <BriefcaseIcon className="w-4 h-4" />
                                    <span>Sim, quero adicionar experiências</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setHasExperience(false)}
                                    className={`flex-1 p-3 sm:p-3.5 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                                        !hasExperience 
                                            ? 'bg-blue-600/20 border-blue-500 text-blue-300 ring-2 ring-blue-500/40 shadow-md' 
                                            : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                                    }`}
                                >
                                    <span>🌱 Primeiro Emprego / Pular esta etapa</span>
                                </button>
                            </div>

                            {hasExperience ? (
                                <div className="space-y-4">
                                    {/* Experience Tabs */}
                                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                                        {experiences.map((exp, idx) => (
                                            <button
                                                key={exp.id}
                                                type="button"
                                                onClick={() => setEditingExpIndex(idx)}
                                                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                                                    editingExpIndex === idx 
                                                        ? 'bg-blue-600 text-white border-blue-500 shadow-md font-bold' 
                                                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                                                }`}
                                            >
                                                {exp.company || `Empresa ${idx + 1}`}
                                            </button>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={handleAddExperience}
                                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-blue-300 border border-slate-700 flex items-center gap-1 shrink-0"
                                        >
                                            <PlusIcon className="w-3.5 h-3.5" /> Adicionar Outra
                                        </button>
                                    </div>

                                    {/* Active Experience Editor */}
                                    {experiences[editingExpIndex] && (
                                        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-lg">
                                            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                                                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                                                    Editando Experiência #{editingExpIndex + 1}
                                                </span>
                                                {experiences.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveExperience(editingExpIndex)}
                                                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold"
                                                    >
                                                        <TrashIcon className="w-3.5 h-3.5" /> Remover
                                                    </button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-300 mb-1">Empresa / Organização *</label>
                                                    <input
                                                        type="text"
                                                        value={experiences[editingExpIndex].company}
                                                        onChange={(e) => handleUpdateExperience('company', e.target.value)}
                                                        placeholder="Ex: Nubank, Itaú, Loja ABC..."
                                                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-blue-500 outline-none"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-slate-300 mb-1">Cargo / Função *</label>
                                                    <input
                                                        type="text"
                                                        value={experiences[editingExpIndex].role}
                                                        onChange={(e) => handleUpdateExperience('role', e.target.value)}
                                                        placeholder="Ex: Desenvolvedor, Vendedor, Analista..."
                                                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-blue-500 outline-none"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-slate-300 mb-1">Período de Início</label>
                                                    <input
                                                        type="text"
                                                        value={experiences[editingExpIndex].startDate}
                                                        onChange={(e) => handleUpdateExperience('startDate', e.target.value)}
                                                        placeholder="Ex: Mar/2021 ou 2021"
                                                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-blue-500 outline-none"
                                                    />
                                                </div>

                                                <div>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <label className="block text-xs font-bold text-slate-300">Período de Término</label>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUpdateExperience('endDate', experiences[editingExpIndex].endDate === 'Presente' ? '' : 'Presente')}
                                                            className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-colors ${
                                                                experiences[editingExpIndex].endDate === 'Presente'
                                                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                                                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                                                            }`}
                                                        >
                                                            {experiences[editingExpIndex].endDate === 'Presente' ? '✓ Trabalho Atual' : 'Marcar como Atual'}
                                                        </button>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={experiences[editingExpIndex].endDate}
                                                        onChange={(e) => handleUpdateExperience('endDate', e.target.value)}
                                                        placeholder="Ex: Presente ou Dez/2023"
                                                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-blue-500 outline-none"
                                                    />
                                                </div>
                                            </div>

                                            {/* Description field */}
                                            <div>
                                                <div className="flex justify-between items-baseline mb-1.5">
                                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                                                        Descrição das Atividades / Conquistas: <span className="text-slate-500 font-normal">(Opcional)</span>
                                                    </label>
                                                    <span className="text-[11px] text-slate-500">Escreva em tópicos ou parágrafo livre</span>
                                                </div>
                                                <textarea
                                                    rows={4}
                                                    value={experiences[editingExpIndex].description}
                                                    onChange={(e) => handleUpdateExperience('description', e.target.value)}
                                                    placeholder="Descreva suas principais atividades, projetos realizados ou conquistas nesta empresa..."
                                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none leading-relaxed transition-all placeholder-slate-500 font-normal"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-blue-950/20 border border-blue-800/40 p-6 rounded-2xl text-center space-y-3">
                                    <div className="w-12 h-12 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto text-xl">
                                        🎓
                                    </div>
                                    <h3 className="text-base font-bold text-white">Excelente! Vamos focar na sua formação e competências</h3>
                                    <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                                        Para quem está ingressando no mercado ou mudando de área, o currículo vencedor dá ênfase máxima aos cursos, projetos e habilidades práticas.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 4: FORMAÇÃO ACADÊMICA */}
                    {step === 4 && (
                        <div className="space-y-6 animate-in fade-in duration-300 text-left">
                            <div className="space-y-2">
                                <span className="inline-block text-xs font-bold uppercase tracking-wider text-blue-400">
                                    Passo 4 de 8 • Formação Acadêmica & Cursos
                                </span>
                                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                    Qual é a sua trajetória acadêmica?
                                </h2>
                                <p className="text-sm text-slate-300">
                                    Adicione sua faculdade, curso técnico, ensino médio ou certificações relevantes.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {educations.map((edu, idx) => (
                                    <div key={edu.id} className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3 shadow-lg">
                                        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                                            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                                                Formação #{idx + 1}
                                            </span>
                                            {educations.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveEducation(idx)}
                                                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold"
                                                >
                                                    <TrashIcon className="w-3.5 h-3.5" /> Remover
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-300 mb-1">
                                                    Curso / Grau Acadêmico *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={edu.degree}
                                                    onChange={(e) => handleUpdateEducation(idx, 'degree', e.target.value)}
                                                    placeholder="Ex: Bacharelado em Ciência da Computação, Ensino Médio..."
                                                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-blue-500 outline-none"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-slate-300 mb-1">
                                                    Instituição de Ensino *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={edu.institution}
                                                    onChange={(e) => handleUpdateEducation(idx, 'institution', e.target.value)}
                                                    placeholder="Ex: USP, Senai, FGV, Anhanguera..."
                                                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-blue-500 outline-none"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-slate-300 mb-1">
                                                    Ano de Início
                                                </label>
                                                <input
                                                    type="text"
                                                    value={edu.startDate}
                                                    onChange={(e) => handleUpdateEducation(idx, 'startDate', e.target.value)}
                                                    placeholder="Ex: 2018"
                                                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-blue-500 outline-none"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-slate-300 mb-1">
                                                    Ano de Conclusão / Previsão
                                                </label>
                                                <input
                                                    type="text"
                                                    value={edu.endDate}
                                                    onChange={(e) => handleUpdateEducation(idx, 'endDate', e.target.value)}
                                                    placeholder="Ex: 2022 ou Cursando"
                                                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-blue-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={handleAddEducation}
                                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 border border-dashed border-slate-700 hover:border-slate-600 rounded-xl text-xs sm:text-sm font-bold text-blue-400 flex items-center justify-center gap-2 transition-all"
                                >
                                    <PlusIcon className="w-4 h-4" /> Adicionar Outra Formação / Curso
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 5: HABILIDADES & COMPETÊNCIAS */}
                    {step === 5 && (
                        <div className="space-y-6 animate-in fade-in duration-300 text-left">
                            <div className="space-y-2">
                                <span className="inline-block text-xs font-bold uppercase tracking-wider text-blue-400">
                                    Passo 5 de 8 • Habilidades & Palavras-Chave ATS
                                </span>
                                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                    Quais são suas principais ferramentas e habilidades?
                                </h2>
                                <p className="text-sm text-slate-300">
                                    Robôs de RH analisam a densidade de habilidades. Você tem total liberdade para clicar nas sugestões ou digitar as suas.
                                </p>
                            </div>

                            {/* Skills Selected Box */}
                            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3 shadow-lg">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                                        Habilidades Selecionadas ({skills.length}):
                                    </label>
                                    {skills.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setSkills([])}
                                            className="text-[11px] text-red-400 hover:text-red-300 underline font-medium"
                                        >
                                            Limpar todas
                                        </button>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-2 min-h-[48px] p-3 bg-slate-950 rounded-xl border border-slate-800">
                                    {skills.length === 0 ? (
                                        <span className="text-xs text-slate-500 italic flex items-center">
                                            Nenhuma habilidade marcada. Clique nas sugestões abaixo ou digite a sua!
                                        </span>
                                    ) : (
                                        skills.map(s => (
                                            <span 
                                                key={s} 
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600/25 text-blue-200 border border-blue-500/40 shadow-sm"
                                            >
                                                <span>{s}</span>
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleToggleSkill(s)} 
                                                    className="text-blue-400 hover:text-white"
                                                    title="Remover"
                                                >
                                                    ✕
                                                </button>
                                            </span>
                                        ))
                                    )}
                                </div>

                                {/* Custom Skill Input */}
                                <form onSubmit={handleAddCustomSkill} className="flex gap-2 pt-1">
                                    <input
                                        type="text"
                                        value={newSkillInput}
                                        onChange={(e) => setNewSkillInput(e.target.value)}
                                        placeholder="Digitar outra habilidade e teclar Enter..."
                                        className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-blue-500 outline-none placeholder-slate-500"
                                    />
                                    <button
                                        type="submit"
                                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1"
                                    >
                                        <PlusIcon className="w-4 h-4" /> Adicionar
                                    </button>
                                </form>
                            </div>

                            {/* Suggested Skills to Toggle */}
                            <div className="space-y-2.5">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Sugestões recomendadas (clique para marcar ou desmarcar):
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {(currentAreaObj?.skills || CAREER_AREAS[0].skills).map(sug => {
                                        const isIncluded = skills.includes(sug);
                                        return (
                                            <button
                                                key={sug}
                                                type="button"
                                                onClick={() => handleToggleSkill(sug)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                                    isIncluded 
                                                        ? 'bg-blue-600 text-white border-blue-500 shadow-md font-bold' 
                                                        : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                                                }`}
                                            >
                                                {isIncluded ? `✓ ${sug}` : `+ ${sug}`}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 6: IDIOMAS & DIFERENCIAIS COMPETITIVOS (NEW STEP!) */}
                    {step === 6 && (
                        <div className="space-y-6 animate-in fade-in duration-300 text-left">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="inline-block text-xs font-bold uppercase tracking-wider text-blue-400">
                                        Passo 6 de 8 • Idiomas & Diferenciais
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setStep(7)}
                                        className="text-xs text-blue-400 hover:text-white underline font-medium"
                                    >
                                        Pular esta etapa →
                                    </button>
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                    Possui conhecimento em outros idiomas?
                                </h2>
                                <p className="text-sm text-slate-300">
                                    Idiomas como Inglês e Espanhol são diferenciais decisivos para vagas corporativas e de tecnologia. Esta etapa é 100% opcional.
                                </p>
                            </div>

                            {/* Toggle Include Languages */}
                            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIncludeLanguages(true)}
                                    className={`flex-1 p-3 sm:p-3.5 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                                        includeLanguages 
                                            ? 'bg-blue-600/20 border-blue-500 text-blue-300 ring-2 ring-blue-500/40 shadow-md' 
                                            : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                                    }`}
                                >
                                    <span>🌐 Sim, quero incluir idiomas</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIncludeLanguages(false)}
                                    className={`flex-1 p-3 sm:p-3.5 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                                        !includeLanguages 
                                            ? 'bg-blue-600/20 border-blue-500 text-blue-300 ring-2 ring-blue-500/40 shadow-md' 
                                            : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                                    }`}
                                >
                                    <span>Não incluir idiomas agora</span>
                                </button>
                            </div>

                            {includeLanguages && (
                                <div className="space-y-4 bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-lg">
                                    {/* Quick Common Languages Buttons */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                            Idiomas comuns (clique para adicionar):
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {COMMON_LANGUAGES.map(lang => {
                                                const alreadyHas = languages.some(l => l.language.toLowerCase() === lang.name.toLowerCase());
                                                return (
                                                    <button
                                                        key={lang.name}
                                                        type="button"
                                                        onClick={() => alreadyHas ? setLanguages(languages.filter(l => l.language.toLowerCase() !== lang.name.toLowerCase())) : handleAddLanguage(lang.name, lang.defaultProficiency)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                                            alreadyHas 
                                                                ? 'bg-blue-600 text-white border-blue-500 font-bold' 
                                                                : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                                                        }`}
                                                    >
                                                        {alreadyHas ? `✓ ${lang.name}` : `+ ${lang.name}`}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* List of Added Languages */}
                                    <div className="space-y-2.5 pt-2">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                                            Nível de Proficiência:
                                        </label>
                                        {languages.length === 0 ? (
                                            <p className="text-xs text-slate-500 italic">Nenhum idioma adicionado. Clique acima para selecionar.</p>
                                        ) : (
                                            languages.map(lang => (
                                                <div key={lang.id} className="flex items-center justify-between gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl">
                                                    <span className="text-sm font-bold text-white min-w-[100px]">{lang.language}</span>
                                                    <select
                                                        value={lang.proficiency}
                                                        onChange={(e) => handleUpdateLanguageProficiency(lang.id, e.target.value)}
                                                        className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-medium text-slate-200 focus:border-blue-500 outline-none"
                                                    >
                                                        {PROFICIENCY_OPTIONS.map(p => (
                                                            <option key={p} value={p}>{p}</option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveLanguage(lang.id)}
                                                        className="p-1.5 text-slate-500 hover:text-red-400"
                                                        title="Remover"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 7: RESUMO PROFISSIONAL DE IMPACTO */}
                    {step === 7 && (
                        <div className="space-y-6 animate-in fade-in duration-300 text-left">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="inline-block text-xs font-bold uppercase tracking-wider text-blue-400">
                                        Passo 7 de 8 • Resumo de Alto Impacto
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => { setIncludeSummary(false); setStep(8); }}
                                        className="text-xs text-blue-400 hover:text-white underline font-medium"
                                    >
                                        Pular resumo →
                                    </button>
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                    Como você deseja se apresentar aos recrutadores?
                                </h2>
                                <p className="text-sm text-slate-300">
                                    O resumo é a sua carta de visitas. Use nosso gerador inteligente com 1 clique ou escreva suas próprias palavras.
                                </p>
                            </div>

                            {/* Choice to include summary or not */}
                            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIncludeSummary(true)}
                                    className={`flex-1 p-3 sm:p-3.5 rounded-xl border text-xs sm:text-sm font-bold transition-all ${
                                        includeSummary 
                                            ? 'bg-blue-600/20 border-blue-500 text-blue-300 ring-1 ring-blue-500/40 shadow-md' 
                                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                                    }`}
                                >
                                    ✓ Incluir Resumo Profissional
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIncludeSummary(false)}
                                    className={`flex-1 p-3 sm:p-3.5 rounded-xl border text-xs sm:text-sm font-bold transition-all ${
                                        !includeSummary 
                                            ? 'bg-blue-600/20 border-blue-500 text-blue-300 ring-1 ring-blue-500/40 shadow-md' 
                                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                                    }`}
                                >
                                    Não incluir resumo por enquanto
                                </button>
                            </div>

                            {includeSummary && (
                                <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-lg">
                                    {/* 1-Click Generator Bar */}
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-gradient-to-r from-blue-950/70 via-indigo-950/50 to-slate-900 p-4 rounded-xl border border-blue-800/50 shadow-inner">
                                        <div>
                                            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                                                <SparklesIcon className="w-4 h-4 text-blue-400 animate-pulse" />
                                                Gerador de Resumo Inteligente (1 Clique)
                                            </h4>
                                            <p className="text-xs text-slate-400">
                                                Junta seu cargo ({jobTitle || 'informado'}), formação e habilidades em um texto persuasivo.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleGenerateSummary}
                                            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95 whitespace-nowrap flex items-center justify-center gap-1.5"
                                        >
                                            <SparklesIcon className="w-3.5 h-3.5" />
                                            <span>Gerar Resumo</span>
                                        </button>
                                    </div>

                                    {/* Textarea */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                                            Texto do Resumo:
                                        </label>
                                        <textarea
                                            rows={5}
                                            value={summary}
                                            onChange={(e) => setSummary(e.target.value)}
                                            placeholder="Clique no botão acima para gerar automaticamente ou digite um breve resumo da sua carreira e diferenciais..."
                                            className="w-full p-4 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-blue-500 outline-none leading-relaxed placeholder-slate-500"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 8: DESIGN, MODELO & CONCLUSÃO */}
                    {step === 8 && (
                        <div className="space-y-6 animate-in fade-in duration-300 text-left">
                            <div className="space-y-2">
                                <span className="inline-block text-xs font-bold uppercase tracking-wider text-blue-400">
                                    Passo 8 de 8 • Design & Modelo Visual
                                </span>
                                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                    Escolha o visual que melhor representa sua carreira
                                </h2>
                                <p className="text-sm text-slate-300">
                                    Selecione o modelo e a cor. No editor completo você poderá ajustar fontes, fotos e cada detalhe!
                                </p>
                            </div>

                            {/* Template Thumbnails Gallery (All 35+ models with category filters and realistic visual previews) */}
                            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
                                    <div>
                                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                                            <SparklesIcon className="w-4 h-4 text-blue-400" />
                                            Galeria Completa de Modelos (35+ Modelos Otimizados)
                                        </h3>
                                        <p className="text-xs text-slate-400">
                                            Selecione por área (TI, Executivo, Criativo, Saúde, Negócios...) e veja o layout em miniatura.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 self-start sm:self-auto bg-blue-950/60 border border-blue-800/50 px-3.5 py-1.5 rounded-xl">
                                        <span className="text-xs text-slate-400 font-medium">Modelo atual:</span>
                                        <span className="text-xs font-black text-blue-300 capitalize">{selectedTemplate}</span>
                                    </div>
                                </div>

                                <TemplateThumbnails 
                                    currentTemplate={selectedTemplate} 
                                    onSelectTemplate={(tpl) => setSelectedTemplate(tpl)} 
                                />
                            </div>

                            {/* Color Accent Selector */}
                            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3 shadow-lg">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                                    Cor de Destaque das Linhas e Títulos:
                                </label>
                                <div className="flex flex-wrap items-center gap-3">
                                    {ACCENT_COLORS.map(c => (
                                        <button
                                            key={c.value}
                                            type="button"
                                            onClick={() => setSelectedColor(c.value)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                                                selectedColor === c.value 
                                                    ? 'bg-slate-800 border-white text-white shadow-md' 
                                                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                                            }`}
                                        >
                                            <span className="w-3.5 h-3.5 rounded-full shadow" style={{ backgroundColor: c.value }}></span>
                                            <span>{c.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Big CTA Banner */}
                            <div className="bg-gradient-to-r from-emerald-950/50 via-teal-950/40 to-slate-900 border border-emerald-800/50 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                                <div className="space-y-1 text-center sm:text-left">
                                    <h3 className="text-base font-black text-white flex items-center justify-center sm:justify-start gap-2">
                                        <span className="text-emerald-400">🎉</span> Currículo estruturado com sucesso!
                                    </h3>
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Todas as respostas foram organizadas no modelo escolhido. Ao clicar abaixo, você poderá fazer os ajustes finais no editor e baixar seu PDF.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleFinish}
                                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 via-teal-600 to-blue-600 hover:from-emerald-400 hover:to-blue-500 text-white font-black text-base rounded-2xl shadow-2xl shadow-emerald-500/30 transition-all duration-200 transform hover:-translate-y-0.5 active:scale-95 whitespace-nowrap flex items-center justify-center gap-2.5"
                                >
                                    <SparklesIcon className="w-5 h-5 text-emerald-200 animate-pulse" />
                                    <span>Abrir no Editor Completo</span>
                                    <span>→</span>
                                </button>
                            </div>
                        </div>
                    )}
                </main>

                {/* RIGHT PANE: DESKTOP LIVE MINI PREVIEW */}
                <aside className="hidden lg:block w-[360px] sticky top-24 shrink-0">
                    <LiveMiniPreviewCard />
                </aside>
            </div>

            {/* ==================== MOBILE PREVIEW DRAWER MODAL ==================== */}
            {showMobilePreview && (
                <div className="fixed inset-0 z-50 lg:hidden flex items-end justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-h-[85vh] overflow-y-auto p-5 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <span className="text-sm font-bold text-white flex items-center gap-1.5">
                                <span>👁️</span> Prévia do seu Currículo
                            </span>
                            <button
                                onClick={() => setShowMobilePreview(false)}
                                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-900"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <LiveMiniPreviewCard />
                        <button
                            onClick={() => setShowMobilePreview(false)}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg"
                        >
                            Continuar Respondendo Perguntas
                        </button>
                    </div>
                </div>
            )}

            {/* ==================== WIZARD FOOTER NAVIGATION ==================== */}
            <footer className="border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-xl px-3 sm:px-8 py-3.5 sm:py-4 sticky bottom-0 z-40">
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
                    {/* Back Button */}
                    <button
                        type="button"
                        onClick={() => setStep(Math.max(1, step - 1))}
                        disabled={step === 1}
                        className={`px-3.5 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all flex items-center gap-1.5 ${
                            step === 1 
                                ? 'opacity-30 border-transparent text-slate-600 cursor-not-allowed' 
                                : 'border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800'
                        }`}
                    >
                        <span>← Voltar</span>
                    </button>

                    {/* Step indicator */}
                    <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                        Passo {step} de {totalSteps}
                    </span>

                    {/* Next or Finish Button */}
                    <div className="flex items-center gap-2">
                        {step < totalSteps ? (
                            <button
                                type="button"
                                onClick={() => setStep(Math.min(totalSteps, step + 1))}
                                className="px-5 sm:px-8 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all duration-200 flex items-center gap-1.5 sm:gap-2 active:scale-95"
                            >
                                <span>Avançar</span>
                                <span>→</span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleFinish}
                                className="px-4 sm:px-8 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/30 transition-all duration-200 flex items-center gap-1.5 sm:gap-2 active:scale-95 whitespace-nowrap"
                            >
                                <span className="hidden sm:inline">Concluir & Abrir Editor</span>
                                <span className="sm:hidden">Concluir Editor</span>
                                <span>🚀</span>
                            </button>
                        )}
                    </div>
                </div>
            </footer>
        </div>
    );
};
