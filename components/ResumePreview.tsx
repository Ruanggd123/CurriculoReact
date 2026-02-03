import React, { useEffect, useState } from 'react';
import type { ResumeData, UiConfig, ResumeSection, TemplateOption } from '../types';
import {
    EmailIcon, PhoneIcon, LocationIcon, LinkedinIcon, WebsiteIcon, LinkIcon,
    StarIcon, TerminalIcon, ChartBarIcon, GlobeAmericasIcon, AcademicCapIcon, BriefcaseIcon,
    UserIcon, LightBulbIcon, PaletteIcon, CameraIcon, HeartIcon, LeafIcon
} from './icons';
import { useSmartPagination } from '../hooks/useSmartPagination';

interface ResumePreviewProps {
    resumeData: ResumeData;
    uiConfig: UiConfig;
    showWatermark?: boolean;
    isPrinting?: boolean; // Controla estilos de impressão e visibilidade da linha de corte
}

// --- Utilities ---
const formatDate = (dateString: string) => {
    if (!dateString) return '';
    if (dateString.toLowerCase() === 'presente' || dateString.toLowerCase() === 'cursando' || dateString.toLowerCase() === 'atual') return dateString;
    try {
        const [year, month] = dateString.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    } catch (e) {
        return dateString;
    }
}

// Helper to determine if a hex color is dark
const isColorDark = (color: string) => {
    if (!color || color === 'transparent') return false;
    const hex = color.replace('#', '');
    const fullHex = hex.length === 3 ? hex.split('').map(x => x + x).join('') : hex;
    const r = parseInt(fullHex.substring(0, 2), 16);
    const g = parseInt(fullHex.substring(2, 4), 16);
    const b = parseInt(fullHex.substring(4, 6), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return yiq < 128;
};

// --- Engine Configuration Types ---
interface TemplateStyleConfig {
    id: TemplateOption;
    layout: 'classic' | 'sidebar-left' | 'sidebar-right' | 'two-column' | 'timeline' | 'compact';
    fontFamily: string;
    headerStyle: 'centered' | 'left' | 'banner' | 'minimal' | 'boxed' | 'split';
    headerBg?: boolean;
    photoShape: 'circle' | 'square' | 'rounded' | 'hidden';
    sectionTitleStyle: 'simple' | 'uppercase' | 'underlined' | 'boxed' | 'sidebar-header' | 'with-icon' | 'bracket' | 'terminal' | 'minimal' | 'bubble';
    sectionGap: string;
    bgClass: string;
    sidebarBgClass?: string;
    textClass: string;
    showIcons?: boolean;
    iconStyle?: 'solid' | 'outline' | 'circle-bg';
    bgPattern?: 'none' | 'dots' | 'paper' | 'noise';
    useAccentForName?: boolean;
    useAccentForHeaders?: boolean;
    useAccentBackground?: boolean;
}

// --- Template Configuration Factory ---
const getTemplateConfig = (id: TemplateOption): TemplateStyleConfig => {
    const base: TemplateStyleConfig = {
        id,
        layout: 'classic',
        fontFamily: 'font-sans',
        headerStyle: 'left',
        photoShape: 'circle',
        sectionTitleStyle: 'underlined',
        sectionGap: 'mb-12',
        bgClass: 'bg-white',
        textClass: 'text-slate-900',
        useAccentForHeaders: true,
        showIcons: false,
        bgPattern: 'none'
    };

    switch (id) {
        case 'classic': return { ...base, fontFamily: 'font-serif', headerStyle: 'left', sectionTitleStyle: 'underlined', photoShape: 'hidden' };
        case 'compact': return { ...base, layout: 'compact', fontFamily: 'font-serif', headerStyle: 'minimal', sectionTitleStyle: 'simple', photoShape: 'hidden', sectionGap: 'mb-3' };
        case 'minimalist-bw': return { ...base, fontFamily: 'font-sans', headerStyle: 'left', sectionTitleStyle: 'uppercase', useAccentForHeaders: false, photoShape: 'hidden' };
        case 'modern': return { ...base, fontFamily: 'font-modern', headerStyle: 'left', sectionTitleStyle: 'with-icon', showIcons: true, photoShape: 'circle', iconStyle: 'circle-bg' };
        case 'modern-minimalist': return { ...base, fontFamily: 'font-modern', headerStyle: 'left', sectionTitleStyle: 'simple', photoShape: 'hidden', bgClass: 'bg-slate-50' };
        case 'modern-colorful': return { ...base, fontFamily: 'font-modern', headerStyle: 'banner', headerBg: true, sectionTitleStyle: 'with-icon', showIcons: true, photoShape: 'circle' };
        case 'modern-timeline': return { ...base, layout: 'timeline', fontFamily: 'font-sans', headerStyle: 'left', sectionTitleStyle: 'uppercase', photoShape: 'circle', showIcons: true };
        case 'infographic': return { ...base, layout: 'sidebar-left', fontFamily: 'font-modern', headerStyle: 'left', useAccentBackground: true, sectionTitleStyle: 'sidebar-header', showIcons: true, iconStyle: 'solid' };
        case 'creative': return { ...base, fontFamily: 'font-modern', headerStyle: 'banner', headerBg: true, sectionTitleStyle: 'boxed', photoShape: 'circle', showIcons: true };
        case 'creative-icons': return { ...base, fontFamily: 'font-body', headerStyle: 'centered', sectionTitleStyle: 'with-icon', showIcons: true, photoShape: 'rounded', iconStyle: 'circle-bg' };
        case 'creative-sidebar': return { ...base, layout: 'sidebar-left', fontFamily: 'font-modern', useAccentBackground: true, sectionTitleStyle: 'sidebar-header', photoShape: 'circle', showIcons: true };
        case 'portfolio-visual': return { ...base, fontFamily: 'font-sans', headerStyle: 'split', sectionTitleStyle: 'bracket', photoShape: 'square', showIcons: true };
        case 'blogger': return { ...base, fontFamily: 'font-serif', headerStyle: 'centered', sectionTitleStyle: 'uppercase', photoShape: 'circle', bgPattern: 'dots' };
        case 'designer': return { ...base, fontFamily: 'font-modern', headerStyle: 'banner', headerBg: true, sectionTitleStyle: 'simple', photoShape: 'square' };
        case 'artist': return { ...base, fontFamily: 'font-artistic', headerStyle: 'centered', sectionTitleStyle: 'simple', photoShape: 'circle', showIcons: true, iconStyle: 'outline', bgPattern: 'paper' };
        case 'photographer': return { ...base, fontFamily: 'font-clean', headerStyle: 'centered', sectionTitleStyle: 'minimal', photoShape: 'square' };
        case 'director': return { ...base, layout: 'sidebar-right', fontFamily: 'font-sans', headerStyle: 'left', sectionTitleStyle: 'sidebar-header', photoShape: 'square', showIcons: true };
        case 'executive': return { ...base, fontFamily: 'font-display', headerStyle: 'centered', sectionTitleStyle: 'simple', photoShape: 'circle', useAccentForName: true };
        case 'admin-manager': return { ...base, layout: 'sidebar-right', fontFamily: 'font-sans', useAccentBackground: true, sectionTitleStyle: 'sidebar-header', showIcons: true };
        case 'consultant': return { ...base, fontFamily: 'font-elegant', headerStyle: 'left', sectionTitleStyle: 'with-icon', showIcons: true };
        case 'pmo': return { ...base, layout: 'sidebar-left', fontFamily: 'font-sans', useAccentBackground: true, sectionTitleStyle: 'sidebar-header', showIcons: true };
        case 'operations': return { ...base, fontFamily: 'font-sans', headerStyle: 'left', sectionTitleStyle: 'with-icon', showIcons: true };
        case 'tech': return { ...base, fontFamily: 'font-mono', headerStyle: 'left', sectionTitleStyle: 'terminal', photoShape: 'square', bgClass: 'bg-[#111827]', textClass: 'text-green-400', sectionGap: 'mb-12', showIcons: true };
        case 'engineering': return { ...base, fontFamily: 'font-clean', headerStyle: 'banner', headerBg: true, sectionTitleStyle: 'with-icon', showIcons: true };
        case 'architect': return { ...base, fontFamily: 'font-modern', headerStyle: 'minimal', sectionTitleStyle: 'uppercase', photoShape: 'square' };
        case 'academic': return { ...base, fontFamily: 'font-serif', headerStyle: 'centered', sectionTitleStyle: 'underlined', photoShape: 'hidden' };
        case 'scientist': return { ...base, fontFamily: 'font-sans', headerStyle: 'left', sectionTitleStyle: 'underlined', photoShape: 'hidden', showIcons: true };
        case 'finance': return { ...base, fontFamily: 'font-elegant', headerStyle: 'left', sectionTitleStyle: 'underlined', showIcons: true };
        case 'sales': return { ...base, fontFamily: 'font-condensed', headerStyle: 'centered', sectionTitleStyle: 'boxed', headerBg: true, showIcons: true };
        case 'marketing': return { ...base, fontFamily: 'font-modern', headerStyle: 'banner', headerBg: true, sectionTitleStyle: 'simple', showIcons: true };
        case 'hr': return { ...base, layout: 'sidebar-left', fontFamily: 'font-sans', useAccentBackground: true, sectionTitleStyle: 'sidebar-header', showIcons: true };
        case 'logistics': return { ...base, fontFamily: 'font-sans', headerStyle: 'left', sectionTitleStyle: 'with-icon', showIcons: true };
        case 'health': return { ...base, fontFamily: 'font-clean', headerStyle: 'centered', sectionTitleStyle: 'simple', showIcons: true, iconStyle: 'circle-bg' };
        case 'therapist': return { ...base, fontFamily: 'font-body', headerStyle: 'centered', sectionTitleStyle: 'with-icon', showIcons: true, bgPattern: 'noise', textClass: 'text-slate-800' };
        case 'educator': return { ...base, fontFamily: 'font-serif', headerStyle: 'banner', headerBg: true, sectionTitleStyle: 'with-icon', showIcons: true };
        case 'journalist': return { ...base, fontFamily: 'font-display', headerStyle: 'left', sectionTitleStyle: 'underlined', photoShape: 'circle' };
        case 'sustainability': return { ...base, fontFamily: 'font-body', headerStyle: 'minimal', sectionTitleStyle: 'with-icon', showIcons: true, iconStyle: 'outline' };
        default: return base;
    }
};

// --- Icons Mapping ---
const getSectionIcon = (type: string, templateId: TemplateOption, className: string = "", strokeWidth: number = 2) => {
    const props = { className, strokeWidth };

    if (templateId === 'artist' || templateId === 'designer') { if (type === 'skills') return <PaletteIcon {...props} />; }
    if (templateId === 'photographer' || templateId === 'director') { if (type === 'projects') return <CameraIcon {...props} />; }
    if (templateId === 'therapist' || templateId === 'health') { if (type === 'summary') return <HeartIcon {...props} />; }
    if (templateId === 'sustainability') { return <LeafIcon {...props} />; }
    if (templateId === 'tech') { if (type === 'projects') return <TerminalIcon {...props} />; }

    switch (type) {
        case 'summary': return <UserIcon {...props} />;
        case 'experience': return <BriefcaseIcon {...props} />;
        case 'education': return <AcademicCapIcon {...props} />;
        case 'skills': return <StarIcon {...props} />;
        case 'projects': return <ChartBarIcon {...props} />;
        case 'languages': return <GlobeAmericasIcon {...props} />;
        default: return <LightBulbIcon {...props} />;
    }
};

// --- Sub-Components ---
const ContactItem: React.FC<{ icon: React.ReactNode, text: string, link?: string, darkTheme?: boolean, accentColor: string, isPrinting?: boolean }> = ({ icon, text, link, darkTheme, accentColor, isPrinting }) => (
    <div className={`flex items-center gap-1.5 text-sm ${darkTheme ? 'text-white/90' : 'text-slate-700'} ${isPrinting ? 'leading-normal py-0.5' : ''}`}>
        <span className={`flex-shrink-0 flex items-center justify-center ${darkTheme ? 'text-white/70' : 'text-slate-500'}`} style={{ color: !darkTheme ? accentColor : undefined }}>
            {icon}
        </span>
        {link ? (
            <a
                href={link}
                className="truncate block max-w-[200px] align-middle transition-colors duration-200 hover:underline"
                style={{ textDecoration: 'none', color: darkTheme ? '#a5b4fc' : accentColor }}
            >
                {text}
            </a>
        ) : (
            <span className="truncate block max-w-[200px] align-middle">{text}</span>
        )}
    </div>
);

const Description: React.FC<{ text: string, className?: string }> = ({ text, className }) => (
    <div className={className || "text-sm leading-relaxed whitespace-pre-line"}>{text}</div>
);

// Page Break Line Component (Keep for legacy, or remove if unused - avoiding removal of previous visual helps)
const PageBreakIndicator: React.FC<{ pageNumber: number }> = ({ pageNumber }) => (
    <div
        data-pdf-hide="true"
        className="absolute left-0 w-full pointer-events-none z-50 no-print-export flex items-center"
        style={{ top: `${297 * pageNumber}mm` }}
    >
        <div className="w-full h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent relative">
            <div className="absolute right-0 -top-3 bg-slate-800/50 text-red-300/80 text-[10px] font-mono px-2 py-0.5 rounded-bl-md border border-slate-700/50 backdrop-blur-sm">
                Página {pageNumber}
            </div>
        </div>
    </div>
);

// --- Renderers ---

export const ResumePreview = React.forwardRef<HTMLDivElement, ResumePreviewProps>(({ resumeData, uiConfig, showWatermark = false, isPrinting = false }, ref) => {
    // Internal ref for pagination logic
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Merge refs if necessary (optional, but good practice if parent needs ref)
    React.useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

    // Enable smart pagination ALWAYS (Editor and Print) to ensure WYSIWYG
    // This forces the margins calculated in JS to be present in the final Print,
    // guaranteeing that what you see is what you get.
    useSmartPagination(containerRef, true);

    const { personal, sections } = resumeData;
    const config = getTemplateConfig(uiConfig.template);
    const { accentColor, backgroundColor } = uiConfig;

    // Cor de fundo principal efetiva
    const activeBgColor = backgroundColor !== '#ffffff' ? backgroundColor : (config.bgClass.includes('bg-[#111827]') ? '#111827' : '#ffffff');
    const isDarkBg = isColorDark(activeBgColor);

    const mainTextColor = isDarkBg ? 'text-white' : 'text-slate-900';
    const subTextColor = isDarkBg ? 'text-white/80' : 'text-slate-600';

    const patternClass =
        config.bgPattern === 'dots' ? 'bg-texture-dots' :
            config.bgPattern === 'paper' ? 'bg-texture-paper' :
                config.bgPattern === 'noise' ? 'bg-texture-noise' : '';

    const mainSections = sections.filter(s => ['summary', 'experience', 'projects'].includes(s.type));
    const sideSections = sections.filter(s => ['skills', 'languages', 'education'].includes(s.type));
    const effectiveMainSections = config.layout.includes('sidebar') ? mainSections : sections;
    const effectiveSideSections = config.layout.includes('sidebar') ? sideSections : [];

    // Configurações de Ícone para Impressão: Mais espessos para melhor definição
    const contactIconProps = { width: "14", height: "14", strokeWidth: 2 };
    const sectionIconStrokeWidth = 2;

    const renderHeader = (inSidebar: boolean = false) => {
        const photo = uiConfig.photo.show && uiConfig.photo.src && config.photoShape !== 'hidden' ? (
            <div
                className={`relative overflow-hidden border-2 ${isDarkBg ? 'border-white/20' : 'border-gray-200'} ${!isPrinting && 'shadow-md'} flex-shrink-0
                    ${config.photoShape === 'circle' ? 'rounded-full' : config.photoShape === 'rounded' ? 'rounded-xl' : 'rounded-none'}
                `}
                style={{ width: '120px', height: '120px', borderColor: accentColor }}
            >
                <img src={uiConfig.photo.src} className="w-full h-full object-cover" style={{ transform: `scale(${uiConfig.photo.zoom / 100})`, objectPosition: uiConfig.photo.position }} />
            </div>
        ) : null;

        const isHeaderBg = config.headerBg && !inSidebar;
        const headerTextColor = isHeaderBg ? 'text-white' : mainTextColor;
        const headerSubTextColor = isHeaderBg ? 'text-white/90' : subTextColor;
        const headerStyle = isHeaderBg ? { backgroundColor: accentColor, color: 'white' } : { borderColor: config.headerStyle === 'minimal' ? accentColor : undefined };
        const nameColor = (config.useAccentForName || config.headerStyle === 'minimal') && !isHeaderBg && !inSidebar ? accentColor : 'inherit';
        const techCursor = config.id === 'tech' ? <span className="animate-pulse">_</span> : null;

        return (
            <header
                className={`resume-header overflow-visible
                    ${isHeaderBg ? 'p-8 -mx-8 -mt-8 mb-8' : 'mb-8'}
                    ${config.headerStyle === 'centered' ? 'text-center flex-col items-center' : ''}
                    ${config.headerStyle === 'banner' ? 'flex items-center justify-between' : ''}
                    ${config.headerStyle === 'left' ? 'flex items-start justify-between' : ''}
                    ${config.headerStyle === 'minimal' ? 'border-b-2 pb-4' : ''}
                    ${!isHeaderBg && !isDarkBg ? 'border-gray-200' : 'border-gray-700'}
                    ${config.headerStyle === 'split' ? 'grid grid-cols-2 gap-8 items-center' : ''}
                    ${headerTextColor}
                `}
                style={headerStyle}
            >
                {config.headerStyle === 'centered' && photo && <div className="mb-6">{photo}</div>}
                <div className={`flex-1 ${config.headerStyle === 'centered' ? 'w-full' : ''}`}>
                    <h1
                        className={`font-extrabold leading-tight mb-2 uppercase tracking-tight`}
                        style={{ fontSize: `${uiConfig.sectionSizes.name}px`, color: nameColor }}
                    >
                        {config.id === 'tech' ? '> ' : ''}{personal.name}{techCursor}
                    </h1>
                    <p className={`text-xl font-medium opacity-90 tracking-wide ${config.headerStyle === 'centered' ? 'mb-4' : ''} ${headerSubTextColor}`}>{personal.jobTitle}</p>

                    <div className={`flex flex-wrap gap-x-5 gap-y-2 mt-4 text-sm overflow-visible ${config.headerStyle === 'centered' ? 'justify-center' : ''} ${isPrinting ? 'pb-1' : ''}`}>
                        {personal.email && <ContactItem icon={<EmailIcon {...contactIconProps} />} text={personal.email} darkTheme={isHeaderBg || isDarkBg} accentColor={accentColor} isPrinting={isPrinting} />}
                        {personal.phone && <ContactItem icon={<PhoneIcon {...contactIconProps} />} text={personal.phone} darkTheme={isHeaderBg || isDarkBg} accentColor={accentColor} isPrinting={isPrinting} />}
                        {personal.location && <ContactItem icon={<LocationIcon {...contactIconProps} />} text={personal.location} darkTheme={isHeaderBg || isDarkBg} accentColor={accentColor} isPrinting={isPrinting} />}
                        {personal.linkedin && <ContactItem icon={<LinkedinIcon {...contactIconProps} />} text="LinkedIn" link={personal.linkedin} darkTheme={isHeaderBg || isDarkBg} accentColor={accentColor} isPrinting={isPrinting} />}
                        {personal.website && <ContactItem icon={<WebsiteIcon {...contactIconProps} />} text="Portfólio" link={personal.website} darkTheme={isHeaderBg || isDarkBg} accentColor={accentColor} isPrinting={isPrinting} />}
                    </div>
                </div>
                {photo && config.headerStyle !== 'centered' && <div className="ml-6">{photo}</div>}
            </header>
        );
    };

    const renderSectionTitle = (title: string, type: string, isSidebar: boolean = false) => {
        const style = config.sectionTitleStyle;
        const isBoxed = style === 'boxed';

        // 1. Identificar a cor de fundo do contexto onde o título está
        let contextBgColor = activeBgColor;
        if (isSidebar) {
            if (config.useAccentBackground) {
                contextBgColor = accentColor;
            } else {
                // Sidebar padrão é cinza claro ou escuro dependendo do tema
                contextBgColor = isDarkBg ? '#1e293b' : '#f1f5f9';
            }
        }

        const isContextDark = isColorDark(contextBgColor);

        // 2. Definir cor do texto baseada no contraste
        let titleColor = isContextDark ? '#ffffff' : '#0f172a';

        // 3. Aplicar cor de destaque se permitido e legível
        if (config.useAccentForHeaders && !isBoxed && !isContextDark) {
            titleColor = accentColor;
        }
        if (config.id === 'tech') titleColor = '#4ade80';

        // Ícone da seção
        let iconColor = titleColor;
        if (isBoxed) iconColor = '#ffffff';

        const iconBgStyle = config.iconStyle === 'circle-bg' ? { backgroundColor: isContextDark ? 'rgba(255,255,255,0.2)' : `${accentColor}20` } : {};
        const iconClass = `w-6 h-6 mr-3 ${config.iconStyle === 'circle-bg' ? 'p-1 rounded-full' : ''}`;
        const iconElement = config.showIcons ? (
            <span style={{ color: iconColor, ...iconBgStyle }} className="inline-block flex-shrink-0">
                {getSectionIcon(type, config.id, iconClass, sectionIconStrokeWidth)}
            </span>
        ) : null;

        // Formatar conteúdo
        let content = <span className="flex items-center">{iconElement}{title}</span>;
        if (style === 'uppercase') content = <span className="flex items-center">{iconElement}{title.toUpperCase()}</span>;
        if (style === 'bracket') content = <span className="flex items-center text-slate-400 mx-1"><span className="text-slate-300">[</span> <span style={{ color: titleColor }} className="mx-2">{title}</span> <span className="text-slate-300">]</span></span>;
        if (style === 'terminal') content = <span className="flex items-center text-green-500 mr-2">// {title}</span>;

        const baseClass = "resume-section-title font-bold mb-4 text-lg flex items-center overflow-visible";

        if (style === 'boxed') return <h3 className={`${baseClass} px-3 py-1.5 rounded-md inline-flex ${!isPrinting && 'shadow-sm'} break-inside-avoid break-after-avoid`} style={{ backgroundColor: accentColor, color: 'white' }}>{content}</h3>;
        if (style === 'underlined') return <h3 className={`${baseClass} border-b-2 pb-1 w-full break-inside-avoid break-after-avoid`} style={{ color: titleColor, borderColor: accentColor }}>{content}</h3>;
        if (style === 'sidebar-header') return <h3 className={`${baseClass} border-b border-white/20 pb-1 mb-3 uppercase tracking-wider text-sm break-inside-avoid break-after-avoid`} style={{ color: titleColor, borderColor: isContextDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1' }}>{content}</h3>;
        if (style === 'minimal') return <h3 className={`${baseClass} uppercase tracking-widest text-sm break-inside-avoid break-after-avoid`} style={{ color: titleColor }}>{content}</h3>;

        return <h3 className={`${baseClass} break-inside-avoid break-after-avoid`} style={{ color: titleColor }}>{content}</h3>;
    };

    const renderItems = (section: ResumeSection, isSidebar: boolean = false) => {
        // Lógica de contexto para cor de texto dos itens
        let contextBgColor = activeBgColor;
        if (isSidebar) {
            if (config.useAccentBackground) contextBgColor = accentColor;
            else contextBgColor = isDarkBg ? '#1e293b' : '#f1f5f9';
        }
        const isContextDark = isColorDark(contextBgColor);

        const primaryTextColor = isContextDark ? 'text-white' : 'text-slate-950';
        const secondaryTextColor = isContextDark ? 'text-white/70' : 'text-slate-600';
        const dateColor = isContextDark ? 'text-white/50' : 'text-slate-500';
        const companyColor = isSidebar ? 'inherit' : (isContextDark ? '#fff' : accentColor);

        return (
            <div className="">
                {section.items.map((item: any) => (
                    <div key={item.id} className={`resume-item mb-8 ${config.layout === 'timeline' ? 'relative pl-6 border-l-2' : ''} break-inside-avoid`} style={{ borderColor: config.layout === 'timeline' ? '#e5e7eb' : undefined }}>
                        {config.layout === 'timeline' && (
                            <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full border-2 border-white" style={{ backgroundColor: accentColor }}></div>
                        )}
                        <div className="flex justify-between items-baseline flex-wrap gap-2">
                            <h4 className={`font-bold leading-snug ${isSidebar ? 'text-sm' : 'text-base'} ${primaryTextColor}`}>
                                {item.role || item.degree || item.name}
                            </h4>
                            {item.startDate && (
                                <span className={`text-xs font-mono whitespace-nowrap ${dateColor}`}>
                                    {formatDate(item.startDate)} - {formatDate(item.endDate)}
                                </span>
                            )}
                        </div>
                        {(item.company || item.institution) && (
                            <div className={`text-sm font-semibold mb-1 ${isSidebar ? 'opacity-90' : ''}`} style={{ color: companyColor }}>
                                {item.company || item.institution}
                            </div>
                        )}
                        {section.type === 'skills' && (
                            <div className={`${config.id === 'tech' ? 'font-mono text-xs' : 'text-sm'} flex flex-wrap gap-2`}>
                                {config.id === 'tech'
                                    ? <span className="text-green-300/80">{`<${item.name} />`}</span>
                                    : <span className={`inline-block px-2 py-1 rounded ${isContextDark ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>{item.name}</span>
                                }
                            </div>
                        )}
                        {section.type === 'languages' && (
                            <div className="flex justify-between text-sm">
                                <span className={primaryTextColor}>{item.language}</span>
                                <span className={secondaryTextColor}>{item.proficiency}</span>
                            </div>
                        )}
                        {item.description && section.type !== 'skills' && section.type !== 'languages' && !isSidebar && (
                            <Description text={item.description} className={`text-sm mt-1.5 text-justify ${secondaryTextColor}`} />
                        )}
                        {item.text && <Description text={item.text} className={`text-sm leading-relaxed text-justify ${secondaryTextColor}`} />}
                        {item.link && (
                            <a href={item.link} target="_blank" rel="noreferrer" className="text-xs hover:underline flex items-center gap-1 mt-1" style={{ textDecoration: 'none', color: isContextDark ? '#a5b4fc' : accentColor }}>
                                <LinkIcon className="w-3 h-3" /> {item.link}
                            </a>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const renderStandardLayout = () => (
        <div className={`px-10 py-16 ${config.fontFamily} ${patternClass} flex-1`}>
            {renderHeader()}
            {effectiveMainSections.map(s => (
                <section key={s.id} className={`${config.sectionGap} resume-section`}>
                    {renderSectionTitle(s.title, s.type)}
                    {s.type === 'skills' ? (
                        <div className="flex flex-wrap gap-2 break-inside-avoid">
                            {s.items.map((item: any) => (
                                <span key={item.id} className={`px-2.5 py-1 text-sm rounded-md font-medium ${config.id === 'tech' ? 'bg-gray-800 border border-green-900 font-mono text-xs text-green-400' : 'bg-slate-100 text-slate-700'}`}>
                                    {item.name}
                                </span>
                            ))}
                        </div>
                    ) : renderItems(s)}
                </section>
            ))}
            {effectiveSideSections.map(s => (
                <section key={s.id} className={`${config.sectionGap} resume-section`}>
                    {renderSectionTitle(s.title, s.type)}
                    {renderItems(s)}
                </section>
            ))}
        </div>
    );

    const renderSidebarLayout = (side: 'left' | 'right') => {
        const sidebarBgStyle = config.useAccentBackground
            ? { backgroundColor: accentColor, color: 'white' }
            : { backgroundColor: isDarkBg ? '#1e293b' : '#f1f5f9', color: isDarkBg ? '#fff' : '#334155' };
        if (config.sidebarBgClass) sidebarBgStyle.backgroundColor = '';

        const containerClass = `flex items-stretch ${config.fontFamily} ${patternClass} ${side === 'right' ? 'flex-row' : 'flex-row-reverse'} flex-1 min-h-full`;

        return (
            <div className={containerClass} style={{ backgroundColor: activeBgColor }}>
                <div className="flex-1 px-8 py-16">
                    {config.headerStyle !== 'banner' && (
                        <div className={`resume-header mb-10 border-b-2 ${isDarkBg ? 'border-white/20' : 'border-gray-100'} pb-6 overflow-visible`}>
                            <h1 className={`text-4xl font-black uppercase leading-none tracking-tight ${mainTextColor}`} style={{ color: config.useAccentForName ? accentColor : undefined }}>{personal.name}</h1>
                            <p className={`text-lg mt-2 font-medium tracking-widest uppercase ${subTextColor}`}>{personal.jobTitle}</p>
                        </div>
                    )}
                    {effectiveMainSections.map(s => (
                        <section key={s.id} className="mb-8 resume-section">
                            {renderSectionTitle(s.title, s.type)}
                            {renderItems(s)}
                        </section>
                    ))}
                </div>
                <div className={`w-[32%] px-6 py-16 ${config.sidebarBgClass || ''}`} style={!config.sidebarBgClass ? sidebarBgStyle : {}}>
                    <div className="flex flex-col items-center text-center mb-10">
                        {uiConfig.photo.show && uiConfig.photo.src && (
                            <div className={`w-32 h-32 overflow-hidden border-4 border-white/20 mb-6 ${!isPrinting && 'shadow-lg'} ${config.photoShape === 'circle' ? 'rounded-full' : 'rounded-lg'}`}>
                                <img src={uiConfig.photo.src} className="w-full h-full object-cover" style={{ transform: `scale(${uiConfig.photo.zoom / 100})`, objectPosition: uiConfig.photo.position }} />
                            </div>
                        )}
                        {config.layout.includes('sidebar') && side === 'left' && config.headerStyle === 'banner' && (
                            <div className="resume-header overflow-visible">
                                <h2 className="font-bold text-xl leading-tight mb-1">{personal.name}</h2>
                                <p className="text-xs opacity-80 uppercase tracking-widest">{personal.jobTitle}</p>
                            </div>
                        )}
                    </div>
                    <div className="space-y-3 mb-10 text-sm overflow-visible">
                        <div className="border-b border-white/20 pb-1 mb-3 font-bold uppercase tracking-wider opacity-90">Contato</div>
                        {personal.email && <ContactItem icon={<EmailIcon {...contactIconProps} />} text={personal.email} darkTheme={config.useAccentBackground} accentColor={accentColor} isPrinting={isPrinting} />}
                        {personal.phone && <ContactItem icon={<PhoneIcon {...contactIconProps} />} text={personal.phone} darkTheme={config.useAccentBackground} accentColor={accentColor} isPrinting={isPrinting} />}
                        {personal.location && <ContactItem icon={<LocationIcon {...contactIconProps} />} text={personal.location} darkTheme={config.useAccentBackground} accentColor={accentColor} isPrinting={isPrinting} />}
                        {personal.linkedin && <ContactItem icon={<LinkedinIcon {...contactIconProps} />} text="LinkedIn" link={personal.linkedin} darkTheme={config.useAccentBackground} accentColor={accentColor} isPrinting={isPrinting} />}
                        {personal.website && <ContactItem icon={<WebsiteIcon {...contactIconProps} />} text="Portfólio" link={personal.website} darkTheme={config.useAccentBackground} accentColor={accentColor} isPrinting={isPrinting} />}
                    </div>
                    {effectiveSideSections.map(s => (
                        <section key={s.id} className="mb-8 resume-section break-inside-avoid">
                            {renderSectionTitle(s.title, s.type, true)}
                            {s.type === 'skills' ? (
                                <div className="flex flex-wrap gap-2 break-inside-avoid">
                                    {s.items.map((item: any) => (
                                        <span key={item.id} className={`text-xs px-2 py-1 rounded font-semibold ${config.useAccentBackground ? 'bg-white/20 text-white' : 'bg-white border border-gray-200 text-slate-600'}`}>
                                            {item.name}
                                        </span>
                                    ))}
                                </div>
                            ) : renderItems(s, true)}
                        </section>
                    ))}
                </div>
            </div>
        );
    };

    const isSidebarLayout = config.layout.includes('sidebar');
    const containerClasses = [
        isPrinting
            ? `w-[210mm] min-h-[297mm] mx-auto relative overflow-visible ${config.bgClass} break-words whitespace-pre-wrap flex flex-col`
            : `w-[210mm] min-h-[297mm] mx-auto relative overflow-hidden ${config.bgClass} shadow-2xl transition-all duration-300 ease-in-out break-words whitespace-pre-wrap flex flex-col`
    ].join(' ');

    const [totalPages, setTotalPages] = React.useState(1);
    React.useEffect(() => {
        // Run page count calculation always for consistency
        const checkHeight = () => {
            if (containerRef.current) {
                const heightPx = containerRef.current.scrollHeight;
                const pageHeight = 1123;
                const pages = Math.ceil(heightPx / pageHeight);
                setTotalPages(Math.max(pages, 1));
            }
        };
        const observer = new ResizeObserver(checkHeight);
        if (containerRef.current) observer.observe(containerRef.current);
        checkHeight();
        const interval = setInterval(checkHeight, 1000);
        return () => { observer.disconnect(); clearInterval(interval); };
    }, [resumeData, isPrinting]);

    return (
        <div
            id="resume-preview-container"
            ref={containerRef}
            className={containerClasses}
            style={{ backgroundColor: activeBgColor, boxSizing: 'border-box' }}
        >
            {/* Page Separators - Rendered ALWAYS but hidden in print via print:hidden */}
            {Array.from({ length: totalPages }).map((_, i) => {
                if (i === 0) return null;
                return (
                    <div
                        key={i}
                        className="absolute w-full left-0 z-50 bg-[#0f172a] flex items-center justify-center opacity-100 shadow-inner print:hidden" // Added print:hidden
                        style={{
                            top: `calc(${i} * 297mm - 10px)`,
                            height: '24px',
                            borderTop: '1px solid #334155',
                            borderBottom: '1px solid #334155'
                        }}
                    >
                        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest bg-[#0f172a] px-2 rounded-full">
                            Fim da Página {i}
                        </span>
                    </div>
                );
            })}

            {/* Watermark moved logic */}
            {showWatermark && (
                <div className={`absolute bottom-8 right-8 opacity-50 z-10 pointer-events-none ${isDarkBg ? 'text-white' : 'text-slate-400'}`}>
                    <div className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase">
                        <span>CurriculumPro Studio</span>
                    </div>
                </div>
            )}

            {isSidebarLayout ? renderSidebarLayout(config.layout === 'sidebar-left' ? 'left' : 'right') : renderStandardLayout()}
        </div>
    );
});