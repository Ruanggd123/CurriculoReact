import React, { useState } from 'react';
import type { ResumeData, UiConfig, TemplateOption, Experience, Education, Skill, ResumeSection } from '../types';
import { 
    SparklesIcon, UserIcon, BriefcaseIcon, AcademicCapIcon, 
    CheckIcon, PlusIcon, TrashIcon, ArrowLeftIcon,
    EmailIcon, PhoneIcon, LocationIcon, LinkedinIcon, GithubIcon
} from './icons';
import { generateId } from '../utils';

interface ResumeWizardProps {
    onComplete: (data: ResumeData, ui: UiConfig) => void;
    onCancel: () => void;
    initialData?: ResumeData;
    initialUi?: UiConfig;
}

// Exemplos de áreas para acelerar o preenchimento
const CAREER_AREAS = [
    { id: 'tech', label: '💻 Tecnologia & Programação', defaultJob: 'Desenvolvedor Full Stack', skills: ['React', 'TypeScript', 'Node.js', 'Git', 'SQL', 'APIs REST', 'Docker', 'Metodologias Ágeis / Scrum', 'Resolução de Problemas', 'Trabalho em Equipe'] },
    { id: 'adm', label: '📑 Administrativo & Financeiro', defaultJob: 'Assistente Administrativo', skills: ['Excel Avançado', 'Contas a Pagar e Receber', 'Conciliação Bancária', 'Gestão de Documentos', 'Atendimento Corporativo', 'Organização', 'Comunicação Clara', 'ERP / Sistemas de Gestão'] },
    { id: 'sales', label: '💼 Vendas & Comercial', defaultJob: 'Executivo de Vendas / Comercial', skills: ['Prospecção Ativa', 'Negociação', 'CRM (Salesforce / HubSpot)', 'Fechamento de Contratos', 'Gestão de Carteira', 'Relacionamento B2B/B2C', 'Comunicação Persuasiva', 'Foco em Metas'] },
    { id: 'marketing', label: '📣 Marketing & Mídias Sociais', defaultJob: 'Analista de Marketing Digital', skills: ['Gestão de Tráfego Pago', 'Copywriting', 'SEO', 'Google Analytics', 'Canva / Photoshop', 'Gestão de Redes Sociais', 'Inbound Marketing', 'Criatividade'] },
    { id: 'design', label: '🎨 Design & UX/UI', defaultJob: 'Designer Gráfico / UX Designer', skills: ['Figma', 'UI Design', 'UX Research', 'Adobe Photoshop', 'Adobe Illustrator', 'Prototipagem', 'Design System', 'Atenção aos Detalhes'] },
    { id: 'support', label: '🤝 Atendimento ao Cliente', defaultJob: 'Analista de Atendimento / Suporte', skills: ['Atendimento Multicanal', 'Zendesk / Freshdesk', 'Empatia', 'Comunicação Assertiva', 'Resolução de Conflitos', 'Fidelização de Clientes', 'Paciência', 'Digitação Ágil'] },
    { id: 'health', label: '🏥 Saúde & Enfermagem', defaultJob: 'Técnico de Enfermagem', skills: ['Cuidados ao Paciente', 'Administração de Medicamentos', 'Prontuário Eletrônico', 'Normas de Biossegurança', 'Trabalho sob Pressão', 'Ética Profissional', 'Acolhimento'] },
    { id: 'logistics', label: '📦 Logística & Operações', defaultJob: 'Assistente de Logística', skills: ['Controle de Estoque', 'Conferência de Carga', 'WMS / ERP', 'Inventário', 'Rastreamento de Entregas', 'Agilidade Operacional', 'Organização'] },
    { id: 'first_job', label: '🌱 Primeiro Emprego / Estágio', defaultJob: 'Estagiário / Jovem Aprendiz', skills: ['Vontade de Aprender', 'Pontualidade', 'Boa Comunicação', 'Pacote Office Básico', 'Organização', 'Trabalho em Equipe', 'Proatividade', 'Adaptabilidade'] },
];

// Sugestões de conquistas e descrições para experiências por área
const ACHIEVEMENT_SUGGESTIONS: Record<string, string[]> = {
    tech: [
        'Desenvolvi e mantive aplicações web escaláveis utilizando React, TypeScript e Node.js.',
        'Otimizei a performance e tempo de carregamento de páginas em 35% através de boas práticas e refatoração.',
        'Implementei testes automatizados aumentando a confiabilidade dos deploys em produção.',
        'Colaborei ativamente com Product Managers e Designers na definição de requisitos e entrega de features.',
    ],
    adm: [
        'Responsável pelo controle diário de fluxo de caixa, conciliação bancária e faturamento sem discrepâncias.',
        'Organização e arquivo digital de documentos corporativos, garantindo conformidade e fácil consulta.',
        'Elaboração de relatórios gerenciais e dashboards no Excel para suporte à tomada de decisões.',
        'Atendimento a fornecedores e clientes internos com agilidade e cordialidade.',
    ],
    sales: [
        'Superei as metas mensais de vendas consecutivamente em +115%, alcançando premiações de destaque.',
        'Prospecção ativa de novos clientes corporativos via telefone, LinkedIn e reuniões presenciais.',
        'Gestão de pipeline no CRM com follow-up estruturado e alta taxa de conversão.',
        'Negociação estratégica de condições comerciais e fechamento de contratos de longo prazo.',
    ],
    marketing: [
        'Planejamento e execução de campanhas de tráfego pago (Meta Ads e Google Ads) com ROI positivo.',
        'Crescimento orgânico de 40% nas redes sociais da marca com calendário editorial estratégico.',
        'Criação de copies e conteúdos que aumentaram a taxa de conversão das landing pages.',
        'Análise semanal de métricas e KPIs para otimização contínua de estratégias de captação.',
    ],
    default: [
        'Liderei entregas com alto padrão de qualidade e dentro dos prazos estabelecidos pela gerência.',
        'Aprimorei processos internos resultando em economia de tempo e maior eficiência operacional.',
        'Trabalho colaborativo com foco constante em resultados e satisfação dos clientes e parceiros.',
        'Resolução rápida de problemas e capacidade comprovada de adaptação a mudanças.',
    ]
};

const TEMPLATE_OPTIONS: { id: TemplateOption; name: string; tag: string; desc: string }[] = [
    { id: 'modern', name: 'Moderno Tech', tag: 'Mais Escolhido', desc: 'Barra lateral de destaque com contraste premium, ideal para Tech e Inovação.' },
    { id: 'executive', name: 'Executivo Luxo', tag: 'Alta Gestão', desc: 'Tipografia serifada imponente e layout clássico de liderança.' },
    { id: 'tech', name: 'Dev & Dark Mode', tag: 'ATS 99%', desc: 'Estilo terminal elegante para programadores, dados e engenharia.' },
    { id: 'creative', name: 'Criativo Studio', tag: 'Design & Criação', desc: 'Gradientes modernos e chips visuais para portfolios e marketing.' },
    { id: 'classic', name: 'Clássico Tradicional', tag: 'Universal RH', desc: 'Formatação padrão global que passa sem atrito em qualquer sistema de triagem.' },
];

const ACCENT_COLORS = [
    { label: 'Azul Real', value: '#2563eb' },
    { label: 'Índigo Profundo', value: '#4f46e5' },
    { label: 'Esmeralda Tech', value: '#059669' },
    { label: 'Roxo Criativo', value: '#7c3aed' },
    { label: 'Âmbar Executivo', value: '#d97706' },
    { label: 'Slate Neutro', value: '#475569' },
];

export const ResumeWizard: React.FC<ResumeWizardProps> = ({ onComplete, onCancel, initialData, initialUi }) => {
    // Current Wizard Step (1 to 7)
    const [step, setStep] = useState<number>(1);

    // Selected career area
    const [selectedAreaId, setSelectedAreaId] = useState<string>('tech');
    const [seniority, setSeniority] = useState<string>('Pleno');

    // Step 1: Objective
    const [jobTitle, setJobTitle] = useState(initialData?.personal.jobTitle || 'Desenvolvedor Full Stack');

    // Step 2: Personal Info
    const [name, setName] = useState(initialData?.personal.name || '');
    const [email, setEmail] = useState(initialData?.personal.email || '');
    const [phone, setPhone] = useState(initialData?.personal.phone || '');
    const [location, setLocation] = useState(initialData?.personal.location || '');
    const [linkedin, setLinkedin] = useState(initialData?.personal.linkedin || '');
    const [github, setGithub] = useState(initialData?.personal.github || '');

    // Step 3: Experience
    const existingExp = initialData?.sections.find(s => s.type === 'experience')?.items as Experience[] | undefined;
    const [hasExperience, setHasExperience] = useState<boolean>(existingExp && existingExp.length > 0 ? true : true);
    const [experiences, setExperiences] = useState<Experience[]>(existingExp && existingExp.length > 0 ? existingExp : [
        {
            id: generateId(),
            company: '',
            role: '',
            startDate: '',
            endDate: 'Presente',
            description: ''
        }
    ]);
    const [editingExpIndex, setEditingExpIndex] = useState<number>(0);

    // Step 4: Education
    const existingEdu = initialData?.sections.find(s => s.type === 'education')?.items as Education[] | undefined;
    const [educations, setEducations] = useState<Education[]>(existingEdu && existingEdu.length > 0 ? existingEdu : [
        {
            id: generateId(),
            institution: '',
            degree: '',
            startDate: '',
            endDate: '',
            description: ''
        }
    ]);

    // Step 5: Skills
    const existingSkills = initialData?.sections.find(s => s.type === 'skills')?.items as Skill[] | undefined;
    const [skills, setSkills] = useState<string[]>(
        existingSkills && existingSkills.length > 0 
            ? existingSkills.map(s => s.name) 
            : ['React', 'TypeScript', 'Node.js', 'Comunicação Assertiva', 'Metodologias Ágeis']
    );
    const [newSkillInput, setNewSkillInput] = useState('');

    // Step 6: Summary
    const existingSummary = initialData?.sections.find(s => s.type === 'summary')?.items[0] as { text: string } | undefined;
    const [summary, setSummary] = useState(existingSummary?.text || '');

    // Step 7: Template & Style
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateOption>(initialUi?.template || 'modern');
    const [selectedColor, setSelectedColor] = useState(initialUi?.accentColor || '#2563eb');

    // Total Steps
    const totalSteps = 7;
    const progressPercent = Math.round((step / totalSteps) * 100);

    // Area selection handler
    const handleSelectArea = (area: typeof CAREER_AREAS[0]) => {
        setSelectedAreaId(area.id);
        if (!jobTitle || jobTitle === 'Desenvolvedor Full Stack') {
            setJobTitle(area.defaultJob);
        }
        // Merge suggested skills
        const combined = Array.from(new Set([...skills, ...area.skills.slice(0, 4)]));
        setSkills(combined);
    };

    // Skill toggle handler
    const handleToggleSkill = (skillName: string) => {
        if (skills.includes(skillName)) {
            setSkills(skills.filter(s => s !== skillName));
        } else {
            setSkills([...skills, skillName]);
        }
    };

    const handleAddCustomSkill = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSkillInput.trim()) return;
        if (!skills.includes(newSkillInput.trim())) {
            setSkills([...skills, newSkillInput.trim()]);
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

    const handleInsertBulletPoint = (text: string) => {
        if (experiences.length === 0) return;
        const currentDesc = experiences[editingExpIndex]?.description || '';
        const bulletText = `• ${text}`;
        const newDesc = currentDesc ? `${currentDesc}\n${bulletText}` : bulletText;
        handleUpdateExperience('description', newDesc);
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

    // Auto-generate professional summary based on collected inputs
    const handleGenerateSummary = () => {
        const targetTitle = jobTitle || 'Profissional';
        const topSkills = skills.slice(0, 4).join(', ');
        const expCompany = experiences.find(e => e.company)?.company;
        const eduDegree = educations.find(e => e.degree)?.degree;

        let generated = '';
        if (seniority === 'Estágio / Trainee' || !hasExperience) {
            generated = `Profissional dedicado e com forte motivação, buscando oportunidade como ${targetTitle}. Possui formação sólida${eduDegree ? ` em ${eduDegree}` : ''} e grande entusiasmo para aplicar conhecimentos práticos em ${topSkills || 'projetos desafiadores'}. Rápido aprendizado, excelente comunicação interpessoal e foco em superar expectativas e contribuir com os resultados da equipe.`;
        } else {
            generated = `${targetTitle} com sólida trajetória em ambientes dinâmicos e de alta exigência. Experiência comprovada em atuação prática${expCompany ? `, com passagens por empresas de destaque como ${expCompany}` : ''}, com domínio em ${topSkills || 'gestão e execução de projetos'}. Foco em otimização de processos, entrega de resultados mensuráveis e trabalho colaborativo em equipe multidisciplinar.`;
        }

        setSummary(generated);
    };

    // Complete wizard & transform to ResumeData
    const handleFinish = () => {
        const finalSections: ResumeSection[] = [
            {
                id: 'summary_section',
                type: 'summary',
                title: 'Resumo Profissional',
                items: summary.trim() ? [{ id: generateId(), text: summary.trim() }] : []
            },
            {
                id: 'experience_section',
                type: 'experience',
                title: 'Experiência Profissional',
                items: hasExperience 
                    ? experiences.filter(e => e.company.trim() || e.role.trim()) 
                    : []
            },
            {
                id: 'education_section',
                type: 'education',
                title: 'Formação Acadêmica',
                items: educations.filter(e => e.institution.trim() || e.degree.trim())
            },
            {
                id: 'skills_section',
                type: 'skills',
                title: 'Principais Habilidades',
                items: skills.map(name => ({ id: generateId(), name }))
            }
        ];

        const compiledData: ResumeData = {
            personal: {
                name: name.trim() || 'Seu Nome Completo',
                jobTitle: jobTitle.trim() || 'Profissional',
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

    // Suggested achievements for current area
    const currentSuggestions = ACHIEVEMENT_SUGGESTIONS[selectedAreaId] || ACHIEVEMENT_SUGGESTIONS.default;

    return (
        <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white relative">
            {/* Ambient Background Glow */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-[#090d16]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-[140px] rounded-full"></div>
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[130px] rounded-full"></div>
            </div>

            {/* ==================== WIZARD TOP HEADER ==================== */}
            <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={onCancel}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors"
                        title="Sair do Assistente"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent font-black text-sm tracking-tight sm:text-base">
                                Assistente Passo a Passo
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                                Modo Guiado
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 hidden sm:block">
                            Responda as perguntas e crie seu currículo otimizado para vagas em minutos.
                        </p>
                    </div>
                </div>

                {/* Direct switch to full builder if user wants to skip everything */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleFinish}
                        className="text-xs text-slate-400 hover:text-blue-300 transition-colors font-medium px-3 py-1.5 rounded-lg border border-slate-700/60 hover:border-slate-600 hover:bg-slate-800/40"
                    >
                        Ir para o Editor Completo →
                    </button>
                </div>
            </header>

            {/* ==================== PROGRESS BAR ==================== */}
            <div className="w-full bg-slate-900/90 border-b border-slate-800/80 px-4 sm:px-8 py-3">
                <div className="max-w-4xl mx-auto flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-300 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold">
                                {step}
                            </span>
                            Etapa {step} de {totalSteps}
                        </span>
                        <span className="text-blue-400 font-mono">{progressPercent}% Concluído</span>
                    </div>

                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 transition-all duration-500 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.5)]"
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>

                    {/* Step Navigation Dots (Clickable for already reached steps) */}
                    <div className="hidden sm:flex items-center justify-between pt-1 text-[11px] text-slate-400">
                        {[
                            { s: 1, label: '1. Objetivo' },
                            { s: 2, label: '2. Contato' },
                            { s: 3, label: '3. Experiência' },
                            { s: 4, label: '4. Formação' },
                            { s: 5, label: '5. Skills' },
                            { s: 6, label: '6. Resumo' },
                            { s: 7, label: '7. Modelo' },
                        ].map(item => (
                            <button
                                key={item.s}
                                onClick={() => setStep(item.s)}
                                className={`transition-colors font-medium ${
                                    step === item.s 
                                        ? 'text-blue-400 font-bold border-b border-blue-400 pb-0.5' 
                                        : step > item.s 
                                            ? 'text-slate-300 hover:text-white' 
                                            : 'text-slate-600 cursor-default'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ==================== MAIN CONTENT BODY ==================== */}
            <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center">

                {/* STEP 1: OBJETIVO & ÁREA */}
                {step === 1 && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="space-y-2">
                            <span className="inline-block text-xs font-bold uppercase tracking-wider text-blue-400">
                                Passo 1 de 7 • Foco Profissional
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                Qual é o seu objetivo profissional ou vaga desejada?
                            </h2>
                            <p className="text-sm sm:text-base text-slate-300">
                                Selecione sua área abaixo ou digite diretamente o título do cargo. Nós adaptaremos as melhores sugestões para o seu perfil.
                            </p>
                        </div>

                        {/* Quick Career Area Badges */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                                Áreas mais procuradas (clique para escolher):
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                {CAREER_AREAS.map(area => {
                                    const isSelected = selectedAreaId === area.id;
                                    return (
                                        <button
                                            key={area.id}
                                            type="button"
                                            onClick={() => handleSelectArea(area)}
                                            className={`p-3 rounded-xl border text-left text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-between ${
                                                isSelected 
                                                    ? 'bg-blue-600/20 border-blue-500 text-blue-200 shadow-md shadow-blue-500/10 ring-1 ring-blue-500/50' 
                                                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                                            }`}
                                        >
                                            <span>{area.label}</span>
                                            {isSelected && <CheckIcon className="w-4 h-4 text-blue-400" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Job Title Input */}
                        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                                    Título exato do cargo no currículo:
                                </label>
                                <input
                                    type="text"
                                    value={jobTitle}
                                    onChange={(e) => setJobTitle(e.target.value)}
                                    placeholder="Ex: Desenvolvedor Front-End Pleno, Assistente Administrativo, Vendedor Externo..."
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder-slate-500"
                                    autoFocus
                                />
                            </div>

                            {/* Seniority Selector */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                                    Nível de experiência / Senioridade:
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {['Estágio / Trainee', 'Júnior', 'Pleno', 'Sênior', 'Especialista', 'Liderança / Gestão'].map(lvl => (
                                        <button
                                            key={lvl}
                                            type="button"
                                            onClick={() => setSeniority(lvl)}
                                            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                                seniority === lvl 
                                                    ? 'bg-blue-600 text-white border-blue-500 shadow-md' 
                                                    : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-700/60'
                                            }`}
                                        >
                                            {lvl}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: DADOS DE CONTATO */}
                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="space-y-2">
                            <span className="inline-block text-xs font-bold uppercase tracking-wider text-blue-400">
                                Passo 2 de 7 • Informações Pessoais
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                Como as empresas e recrutadores entram em contato com você?
                            </h2>
                            <p className="text-sm sm:text-base text-slate-300">
                                Insira seus dados essenciais. Seus dados ficam salvos com total segurança no seu próprio navegador.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
                            {/* Nome Completo */}
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                                    <UserIcon className="w-4 h-4 text-blue-400" /> Nome Completo *
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ex: João Silva de Souza"
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder-slate-500"
                                    autoFocus
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                                    <EmailIcon className="w-4 h-4 text-blue-400" /> E-mail Profissional *
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="exemplo@gmail.com"
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder-slate-500"
                                />
                            </div>

                            {/* Telefone / WhatsApp */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                                    <PhoneIcon className="w-4 h-4 text-blue-400" /> WhatsApp / Telefone *
                                </label>
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="(11) 99999-8888"
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder-slate-500"
                                />
                            </div>

                            {/* Localização */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                                    <LocationIcon className="w-4 h-4 text-blue-400" /> Cidade e Estado
                                </label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="São Paulo, SP"
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder-slate-500"
                                />
                            </div>

                            {/* LinkedIn */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                                    <LinkedinIcon className="w-4 h-4 text-blue-400" /> LinkedIn (opcional)
                                </label>
                                <input
                                    type="text"
                                    value={linkedin}
                                    onChange={(e) => setLinkedin(e.target.value)}
                                    placeholder="linkedin.com/in/seu-perfil"
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder-slate-500"
                                />
                            </div>

                            {/* GitHub / Portfolio */}
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                                    <GithubIcon className="w-4 h-4 text-blue-400" /> Portfólio, GitHub ou Site (opcional)
                                </label>
                                <input
                                    type="text"
                                    value={github}
                                    onChange={(e) => setGithub(e.target.value)}
                                    placeholder="github.com/seuperfil ou meusiite.com"
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder-slate-500"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3: EXPERIÊNCIAS PROFISSIONAIS COM SUGESTÕES */}
                {step === 3 && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="space-y-2">
                            <span className="inline-block text-xs font-bold uppercase tracking-wider text-blue-400">
                                Passo 3 de 7 • Experiência Profissional
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                Você já possui experiências profissionais anteriores?
                            </h2>
                            <p className="text-sm sm:text-base text-slate-300">
                                Adicione suas funções mais recentes. Utilize nossos bullet points prontos de conquistas para destacar seus resultados.
                            </p>
                        </div>

                        {/* Toggle Has Experience */}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setHasExperience(true)}
                                className={`flex-1 p-3.5 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                                    hasExperience 
                                        ? 'bg-blue-600/20 border-blue-500 text-blue-300 ring-1 ring-blue-500/50' 
                                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                                }`}
                            >
                                <BriefcaseIcon className="w-4 h-4" />
                                <span>Sim, tenho experiências para adicionar</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setHasExperience(false)}
                                className={`flex-1 p-3.5 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                                    !hasExperience 
                                        ? 'bg-blue-600/20 border-blue-500 text-blue-300 ring-1 ring-blue-500/50' 
                                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                                }`}
                            >
                                <span>🌱 Primeiro Emprego / Sem experiência</span>
                            </button>
                        </div>

                        {hasExperience ? (
                            <div className="space-y-4">
                                {/* Experience Tabs / Selector */}
                                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                                    {experiences.map((exp, idx) => (
                                        <button
                                            key={exp.id}
                                            type="button"
                                            onClick={() => setEditingExpIndex(idx)}
                                            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                                                editingExpIndex === idx 
                                                    ? 'bg-blue-600 text-white border-blue-500 shadow-md' 
                                                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                                            }`}
                                        >
                                            {exp.company || `Empresa ${idx + 1}`}
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={handleAddExperience}
                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-blue-300 border border-slate-700 flex items-center gap-1"
                                    >
                                        <PlusIcon className="w-3.5 h-3.5" /> Adicionar Outra
                                    </button>
                                </div>

                                {/* Active Experience Editor */}
                                {experiences[editingExpIndex] && (
                                    <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-4">
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
                                                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome da Empresa</label>
                                                <input
                                                    type="text"
                                                    value={experiences[editingExpIndex].company}
                                                    onChange={(e) => handleUpdateExperience('company', e.target.value)}
                                                    placeholder="Ex: Nubank, Mercado Livre, Loja XYZ..."
                                                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-blue-500 outline-none"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-slate-300 mb-1">Cargo / Função</label>
                                                <input
                                                    type="text"
                                                    value={experiences[editingExpIndex].role}
                                                    onChange={(e) => handleUpdateExperience('role', e.target.value)}
                                                    placeholder="Ex: Desenvolvedor, Assistente, Vendedor..."
                                                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-blue-500 outline-none"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-slate-300 mb-1">Período de Início</label>
                                                <input
                                                    type="text"
                                                    value={experiences[editingExpIndex].startDate}
                                                    onChange={(e) => handleUpdateExperience('startDate', e.target.value)}
                                                    placeholder="Ex: Jan/2022 ou 2022"
                                                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-blue-500 outline-none"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-slate-300 mb-1">Período de Fim</label>
                                                <input
                                                    type="text"
                                                    value={experiences[editingExpIndex].endDate}
                                                    onChange={(e) => handleUpdateExperience('endDate', e.target.value)}
                                                    placeholder="Ex: Presente ou Dez/2023"
                                                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-blue-500 outline-none"
                                                />
                                            </div>
                                        </div>

                                        {/* Smart Bullet Points Suggestions */}
                                        <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-xl space-y-2">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-300">
                                                <SparklesIcon className="w-4 h-4 text-blue-400" />
                                                <span>Sugestões de Conquistas (clique para adicionar na descrição):</span>
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                {currentSuggestions.map((sug, i) => (
                                                    <button
                                                        key={i}
                                                        type="button"
                                                        onClick={() => handleInsertBulletPoint(sug)}
                                                        className="text-left text-xs bg-slate-900 hover:bg-blue-600/20 border border-slate-800 hover:border-blue-500/50 p-2 rounded-lg text-slate-300 hover:text-white transition-all duration-150 flex items-start gap-2 group"
                                                    >
                                                        <span className="text-blue-400 font-bold group-hover:scale-125 transition-transform">+</span>
                                                        <span>{sug}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Description Field */}
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                                                Descrição das Atividades & Resultados:
                                            </label>
                                            <textarea
                                                rows={4}
                                                value={experiences[editingExpIndex].description}
                                                onChange={(e) => handleUpdateExperience('description', e.target.value)}
                                                placeholder="Descreva suas entregas, projetos ou clique nas sugestões acima..."
                                                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-blue-500 outline-none leading-relaxed"
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
                                <h3 className="text-lg font-bold text-white">Sem problemas! Seu currículo terá foco nas suas qualificações</h3>
                                <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
                                    Para primeiro emprego ou transição de carreira, os recrutadores valorizam muito sua formação acadêmica, cursos, projetos práticos e habilidades comportamentais. Vamos caprichar nos próximos passos!
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 4: FORMAÇÃO ACADÊMICA */}
                {step === 4 && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="space-y-2">
                            <span className="inline-block text-xs font-bold uppercase tracking-wider text-blue-400">
                                Passo 4 de 7 • Educação & Cursos
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                Qual é a sua formação acadêmica e escolaridade?
                            </h2>
                            <p className="text-sm sm:text-base text-slate-300">
                                Adicione sua graduação, curso técnico ou ensino médio. Você pode adicionar mais de uma formação.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {educations.map((edu, idx) => (
                                <div key={edu.id} className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3">
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
                                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                                                Curso / Titulação
                                            </label>
                                            <input
                                                type="text"
                                                value={edu.degree}
                                                onChange={(e) => handleUpdateEducation(idx, 'degree', e.target.value)}
                                                placeholder="Ex: Bacharelado em Administração, Ensino Médio..."
                                                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-blue-500 outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                                                Instituição de Ensino
                                            </label>
                                            <input
                                                type="text"
                                                value={edu.institution}
                                                onChange={(e) => handleUpdateEducation(idx, 'institution', e.target.value)}
                                                placeholder="Ex: USP, Anhanguera, Senai, Colégio XYZ..."
                                                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-blue-500 outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                                                Ano de Início
                                            </label>
                                            <input
                                                type="text"
                                                value={edu.startDate}
                                                onChange={(e) => handleUpdateEducation(idx, 'startDate', e.target.value)}
                                                placeholder="Ex: 2019"
                                                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-blue-500 outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                                                Ano de Conclusão / Previsão
                                            </label>
                                            <input
                                                type="text"
                                                value={edu.endDate}
                                                onChange={(e) => handleUpdateEducation(idx, 'endDate', e.target.value)}
                                                placeholder="Ex: 2023 ou Em andamento"
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
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="space-y-2">
                            <span className="inline-block text-xs font-bold uppercase tracking-wider text-blue-400">
                                Passo 5 de 7 • Habilidades & Ferramentas
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                Quais são suas principais competências e conhecimentos?
                            </h2>
                            <p className="text-sm sm:text-base text-slate-300">
                                Adicione as palavras-chave da sua área. Currículos com 5 a 10 habilidades têm 70% mais chances de avançar na triagem.
                            </p>
                        </div>

                        {/* Current selected skills preview */}
                        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                                    Habilidades Selecionadas ({skills.length}):
                                </label>
                                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                                    skills.length >= 5 
                                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' 
                                        : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                                }`}>
                                    {skills.length >= 5 ? '✓ Ótimo para robôs ATS' : 'Adicione pelo menos 5'}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-2 min-h-[44px] p-3 bg-slate-950 rounded-xl border border-slate-800">
                                {skills.length === 0 ? (
                                    <span className="text-xs text-slate-500 italic">Nenhuma habilidade adicionada ainda. Clique nas sugestões abaixo!</span>
                                ) : (
                                    skills.map(s => (
                                        <span 
                                            key={s} 
                                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-blue-600/30 text-blue-200 border border-blue-500/40 shadow-sm animate-in fade-in zoom-in-95 duration-150"
                                        >
                                            <span>{s}</span>
                                            <button 
                                                type="button" 
                                                onClick={() => handleToggleSkill(s)} 
                                                className="text-blue-400 hover:text-white"
                                            >
                                                ✕
                                            </button>
                                        </span>
                                    ))
                                )}
                            </div>

                            {/* Add custom skill input */}
                            <form onSubmit={handleAddCustomSkill} className="flex gap-2 pt-2">
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

                        {/* Suggested skills badges */}
                        <div className="space-y-2.5">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Sugestões recomendadas para sua área (clique para adicionar/remover):
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {(CAREER_AREAS.find(a => a.id === selectedAreaId)?.skills || CAREER_AREAS[0].skills).map(sug => {
                                    const isIncluded = skills.includes(sug);
                                    return (
                                        <button
                                            key={sug}
                                            type="button"
                                            onClick={() => handleToggleSkill(sug)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                                isIncluded 
                                                    ? 'bg-blue-600 text-white border-blue-500 shadow-md' 
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

                {/* STEP 6: RESUMO PROFISSIONAL DE IMPACTO */}
                {step === 6 && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="space-y-2">
                            <span className="inline-block text-xs font-bold uppercase tracking-wider text-blue-400">
                                Passo 6 de 7 • Perfil Profissional
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                Como você deseja se apresentar aos recrutadores?
                            </h2>
                            <p className="text-sm sm:text-base text-slate-300">
                                O resumo é o primeiro parágrafo lido pelos recrutadores. Use nosso gerador inteligente com 1 clique para criar um resumo profissional pronto.
                            </p>
                        </div>

                        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
                            {/* Magic One-Click Generator Button */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-slate-900 p-4 rounded-xl border border-blue-800/40">
                                <div>
                                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                                        <SparklesIcon className="w-4 h-4 text-blue-400 animate-pulse" />
                                        Gerador de Resumo com 1 Clique
                                    </h4>
                                    <p className="text-xs text-slate-400">
                                        Cria um texto profissional baseado no seu cargo ({jobTitle || 'informado'}) e suas habilidades.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleGenerateSummary}
                                    className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95 whitespace-nowrap flex items-center justify-center gap-1.5"
                                >
                                    <SparklesIcon className="w-3.5 h-3.5" />
                                    <span>Gerar Resumo Automático</span>
                                </button>
                            </div>

                            {/* Summary Textarea */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                                    Texto do Resumo Profissional:
                                </label>
                                <textarea
                                    rows={5}
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                    placeholder="Clique no botão acima para gerar automaticamente ou digite um breve resumo da sua carreira, principais conquistas e objetivos profissionais..."
                                    className="w-full p-4 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-blue-500 outline-none leading-relaxed placeholder-slate-500"
                                />
                            </div>

                            {summary.trim() && (
                                <div className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                                    <CheckIcon className="w-4 h-4" /> Resumo pronto e otimizado para o modelo visual.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* STEP 7: DESIGN, MODELO & FINALIZAÇÃO */}
                {step === 7 && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="space-y-2">
                            <span className="inline-block text-xs font-bold uppercase tracking-wider text-blue-400">
                                Passo 7 de 7 • Design & Finalização
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                Escolha o modelo visual que mais combina com seu perfil
                            </h2>
                            <p className="text-sm sm:text-base text-slate-300">
                                Selecione o design e a cor de destaque. No próximo passo você poderá ajustar qualquer texto, tamanho ou ordem no editor completo!
                            </p>
                        </div>

                        {/* Template Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                            {TEMPLATE_OPTIONS.map(tpl => {
                                const isSelected = selectedTemplate === tpl.id;
                                return (
                                    <button
                                        key={tpl.id}
                                        type="button"
                                        onClick={() => setSelectedTemplate(tpl.id)}
                                        className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                                            isSelected 
                                                ? 'bg-blue-600/20 border-blue-500 ring-2 ring-blue-500/50 shadow-xl' 
                                                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-bold text-white">{tpl.name}</span>
                                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                                    {tpl.tag}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 leading-relaxed">
                                                {tpl.desc}
                                            </p>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold">
                                            <span className={isSelected ? 'text-blue-400 font-bold' : 'text-slate-500'}>
                                                {isSelected ? '✓ Selecionado' : 'Selecionar'}
                                            </span>
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedColor }}></div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Color Accent Selector */}
                        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                                Cor de Destaque dos Títulos e Linhas:
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

                        {/* Ready Summary Banner */}
                        <div className="bg-gradient-to-r from-emerald-950/40 via-blue-950/30 to-slate-900 border border-emerald-800/40 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="space-y-1 text-center sm:text-left">
                                <h3 className="text-base font-extrabold text-white flex items-center justify-center sm:justify-start gap-2">
                                    <span className="text-emerald-400">🎉</span> Tudo pronto para gerar seu currículo!
                                </h3>
                                <p className="text-xs text-slate-300">
                                    Seu currículo foi estruturado com todas as respostas. Ao clicar abaixo, o editor completo será aberto com seu documento pronto para download ou novos ajustes livres.
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

            {/* ==================== WIZARD FOOTER NAVIGATION ==================== */}
            <footer className="border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-xl px-4 sm:px-8 py-4 sticky bottom-0 z-40">
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
                    {/* Back Button */}
                    <button
                        type="button"
                        onClick={() => setStep(Math.max(1, step - 1))}
                        disabled={step === 1}
                        className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all flex items-center gap-1.5 ${
                            step === 1 
                                ? 'opacity-30 border-transparent text-slate-600 cursor-not-allowed' 
                                : 'border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800'
                        }`}
                    >
                        <span>← Voltar</span>
                    </button>

                    {/* Quick indicator of step */}
                    <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                        Passo {step} de {totalSteps}
                    </span>

                    {/* Next or Finish Button */}
                    <div className="flex items-center gap-2">
                        {step < totalSteps ? (
                            <button
                                type="button"
                                onClick={() => setStep(Math.min(totalSteps, step + 1))}
                                className="px-6 sm:px-8 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all duration-200 flex items-center gap-2 active:scale-95"
                            >
                                <span>Avançar</span>
                                <span>→</span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleFinish}
                                className="px-6 sm:px-8 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/30 transition-all duration-200 flex items-center gap-2 active:scale-95"
                            >
                                <span>Concluir & Abrir Editor</span>
                                <span>🚀</span>
                            </button>
                        )}
                    </div>
                </div>
            </footer>
        </div>
    );
};
