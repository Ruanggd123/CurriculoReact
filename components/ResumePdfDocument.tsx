import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Link } from '@react-pdf/renderer';
import type { ResumeData, UiConfig, ResumeSection, TemplateOption } from '../types';

// --- Utilities ---
const formatDate = (dateString: string) => {
    if (!dateString) return '';
    if (['presente', 'cursando', 'atual'].includes(dateString.toLowerCase())) return dateString;
    try {
        const [year, month] = dateString.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    } catch (e) {
        return dateString;
    }
};

// --- Configuration Engine (Espelhando ResumePreview.tsx) ---
interface PdfTemplateConfig {
    layout: 'classic' | 'sidebar-left' | 'sidebar-right' | 'compact';
    headerStyle: 'centered' | 'left' | 'banner' | 'minimal' | 'split';
    headerBg: boolean;
    useAccentBg: boolean; // Para sidebar ou fundos
    sidebarBg?: string; // Cor específica ou undefined para usar accent/padrão
    uppercaseTitle: boolean;
    photoShape: 'circle' | 'square' | 'rounded' | 'hidden';
    sectionTitleStyle: 'simple' | 'underlined' | 'boxed' | 'sidebar' | 'terminal' | 'minimal';
    isDarkTheme: boolean;
}

const getTemplateConfig = (id: TemplateOption, accentColor: string): PdfTemplateConfig => {
    const base: PdfTemplateConfig = {
        layout: 'classic',
        headerStyle: 'left',
        headerBg: false,
        useAccentBg: false,
        uppercaseTitle: false,
        photoShape: 'circle',
        sectionTitleStyle: 'underlined',
        isDarkTheme: false,
    };

    switch (id) {
        // --- CLÁSSICOS & BÁSICOS ---
        case 'classic': return { ...base, photoShape: 'hidden' };
        case 'compact': return { ...base, layout: 'compact', headerStyle: 'minimal', sectionTitleStyle: 'simple', photoShape: 'hidden' };
        case 'minimalist-bw': return { ...base, headerStyle: 'left', uppercaseTitle: true, photoShape: 'hidden', sectionTitleStyle: 'simple' };
        
        // --- MODERNOS ---
        case 'modern': return { ...base, headerStyle: 'left', sectionTitleStyle: 'simple', photoShape: 'circle' };
        case 'modern-minimalist': return { ...base, headerStyle: 'left', sectionTitleStyle: 'simple', photoShape: 'hidden' };
        case 'modern-colorful': return { ...base, headerStyle: 'banner', headerBg: true, sectionTitleStyle: 'simple' };
        case 'modern-timeline': return { ...base, headerStyle: 'left', uppercaseTitle: true, photoShape: 'circle' }; // Timeline visual simulada no layout classic
        case 'infographic': return { ...base, layout: 'sidebar-left', headerStyle: 'left', useAccentBg: false, sidebarBg: '#1e293b', isDarkTheme: false }; // Sidebar escura
        
        // --- CRIATIVOS ---
        case 'creative': return { ...base, headerStyle: 'banner', headerBg: true, sectionTitleStyle: 'boxed', photoShape: 'circle' };
        case 'creative-icons': return { ...base, headerStyle: 'centered', sectionTitleStyle: 'simple', photoShape: 'rounded' };
        case 'creative-sidebar': return { ...base, layout: 'sidebar-left', useAccentBg: true, photoShape: 'circle' };
        case 'portfolio-visual': return { ...base, headerStyle: 'split', sectionTitleStyle: 'simple', photoShape: 'square' };
        case 'blogger': return { ...base, headerStyle: 'centered', uppercaseTitle: true, photoShape: 'circle' };
        case 'designer': return { ...base, headerStyle: 'banner', headerBg: true, sectionTitleStyle: 'simple', photoShape: 'square' };
        case 'artist': return { ...base, headerStyle: 'centered', sectionTitleStyle: 'simple', photoShape: 'circle' };
        case 'photographer': return { ...base, headerStyle: 'centered', sectionTitleStyle: 'minimal', photoShape: 'square' };
        case 'director': return { ...base, layout: 'sidebar-right', headerStyle: 'left', sectionTitleStyle: 'sidebar', photoShape: 'square' };
        
        // --- EXECUTIVOS ---
        case 'executive': return { ...base, headerStyle: 'centered', sectionTitleStyle: 'simple', photoShape: 'circle', uppercaseTitle: true };
        case 'admin-manager': return { ...base, layout: 'sidebar-right', useAccentBg: true, sectionTitleStyle: 'sidebar' };
        case 'consultant': return { ...base, headerStyle: 'left', sectionTitleStyle: 'underlined' };
        case 'pmo': return { ...base, layout: 'sidebar-left', useAccentBg: true, sectionTitleStyle: 'sidebar' };
        case 'operations': return { ...base, headerStyle: 'left', sectionTitleStyle: 'simple' };
        
        // --- TÉCNICOS ---
        case 'tech': return { ...base, headerStyle: 'left', sectionTitleStyle: 'terminal', photoShape: 'square', isDarkTheme: true, sidebarBg: '#111827' };
        case 'engineering': return { ...base, headerStyle: 'banner', headerBg: true, sectionTitleStyle: 'simple' };
        case 'architect': return { ...base, headerStyle: 'minimal', uppercaseTitle: true, photoShape: 'square' };
        case 'academic': return { ...base, headerStyle: 'centered', sectionTitleStyle: 'underlined', photoShape: 'hidden' };
        case 'scientist': return { ...base, headerStyle: 'left', sectionTitleStyle: 'underlined', photoShape: 'hidden' };
        
        // --- ÁREAS ESPECÍFICAS ---
        case 'finance': return { ...base, headerStyle: 'left', sectionTitleStyle: 'underlined' };
        case 'sales': return { ...base, headerStyle: 'centered', sectionTitleStyle: 'boxed', headerBg: true };
        case 'marketing': return { ...base, headerStyle: 'banner', headerBg: true, sectionTitleStyle: 'simple' };
        case 'hr': return { ...base, layout: 'sidebar-left', useAccentBg: true, sectionTitleStyle: 'sidebar' };
        case 'logistics': return { ...base, headerStyle: 'left', sectionTitleStyle: 'simple' };
        case 'health': return { ...base, headerStyle: 'centered', sectionTitleStyle: 'simple' };
        case 'therapist': return { ...base, headerStyle: 'centered', sectionTitleStyle: 'simple' };
        case 'educator': return { ...base, headerStyle: 'banner', headerBg: true, sectionTitleStyle: 'simple' };
        case 'journalist': return { ...base, headerStyle: 'left', sectionTitleStyle: 'underlined', photoShape: 'circle' };
        case 'sustainability': return { ...base, headerStyle: 'minimal', sectionTitleStyle: 'simple' };

        default: return base;
    }
};

const createStyles = (uiConfig: UiConfig, templateConfig: PdfTemplateConfig) => {
    const { accentColor, backgroundColor, sectionSizes } = uiConfig;
    
    // Cores Globais
    const isDark = templateConfig.isDarkTheme;
    const pageBg = isDark ? '#111827' : (backgroundColor || '#ffffff');
    const mainText = isDark ? '#e2e8f0' : '#334155';
    const titleText = isDark ? '#ffffff' : '#0f172a';
    const secondaryText = isDark ? '#94a3b8' : '#64748b';
    
    // Cores Sidebar
    const isSidebarLayout = templateConfig.layout.includes('sidebar');
    const sidebarBgColor = templateConfig.useAccentBg 
        ? accentColor 
        : (templateConfig.sidebarBg ? templateConfig.sidebarBg : (isDark ? '#1f2937' : '#f8fafc'));
    
    // Se a sidebar usa cor de destaque (ex: azul forte), o texto deve ser branco
    const isSidebarAccent = templateConfig.useAccentBg || templateConfig.sidebarBg === '#1e293b';
    const sidebarTextColor = isSidebarAccent ? '#ffffff' : mainText;
    const sidebarTitleColor = isSidebarAccent ? '#ffffff' : titleText;
    const sidebarMutedColor = isSidebarAccent ? 'rgba(255,255,255,0.8)' : secondaryText;

    return StyleSheet.create({
        page: {
            flexDirection: isSidebarLayout ? 'row' : 'column',
            backgroundColor: pageBg,
            fontFamily: 'Helvetica', // Padrão seguro para PDF
            fontSize: 10,
            lineHeight: 1.5,
            padding: isSidebarLayout ? 0 : 30,
        },
        // --- LAYOUT COLUMNS ---
        leftColumn: {
            width: '32%',
            height: '100%',
            paddingTop: 30,
            paddingBottom: 20,
            paddingLeft: 15,
            paddingRight: 15,
            backgroundColor: sidebarBgColor,
            color: sidebarTextColor,
        },
        rightColumn: {
            flex: 1,
            height: '100%',
            paddingTop: 30,
            paddingBottom: 25,
            paddingLeft: 25,
            paddingRight: 25,
            backgroundColor: pageBg,
            color: mainText,
        },
        mainContainer: {
            flex: 1,
        },
        
        // --- HEADER ---
        header: {
            marginBottom: 20,
            paddingTop: templateConfig.headerStyle === 'banner' ? 25 : 0,
            paddingBottom: templateConfig.headerStyle === 'banner' ? 25 : 10,
            paddingLeft: templateConfig.headerStyle === 'banner' ? 30 : (templateConfig.headerStyle === 'centered' ? 0 : 0),
            paddingRight: templateConfig.headerStyle === 'banner' ? 30 : 0,
            backgroundColor: templateConfig.headerBg ? accentColor : 'transparent',
            color: templateConfig.headerBg ? '#ffffff' : titleText,
            textAlign: templateConfig.headerStyle === 'centered' ? 'center' : 'left',
            borderBottomWidth: templateConfig.headerStyle === 'minimal' ? 2 : 0,
            borderBottomColor: accentColor,
            borderBottomStyle: 'solid',
            display: 'flex',
            flexDirection: templateConfig.headerStyle === 'split' ? 'row' : 'column',
            alignItems: templateConfig.headerStyle === 'centered' ? 'center' : 'flex-start',
            justifyContent: templateConfig.headerStyle === 'split' ? 'space-between' : 'flex-start',
        },
        headerName: {
            fontSize: sectionSizes.name || 24,
            fontWeight: 'bold',
            textTransform: 'uppercase',
            color: templateConfig.headerBg ? '#ffffff' : (templateConfig.layout === 'compact' ? titleText : accentColor),
            marginBottom: 4,
        },
        headerJob: {
            fontSize: sectionSizes.jobTitle || 14,
            fontWeight: 'medium',
            opacity: 0.9,
            marginBottom: 8,
            color: templateConfig.headerBg ? 'rgba(255,255,255,0.9)' : (templateConfig.layout === 'compact' ? secondaryText : titleText),
            textTransform: 'uppercase',
            letterSpacing: 1,
        },
        contactLine: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: templateConfig.headerStyle === 'centered' ? 'center' : 'flex-start',
            fontSize: 9,
            opacity: 0.9,
            marginTop: 4,
            color: templateConfig.headerBg ? '#ffffff' : secondaryText,
        },
        contactItem: {
            marginRight: 12,
            marginBottom: 2,
        },
        
        // --- SECTIONS ---
        section: {
            marginBottom: templateConfig.layout === 'compact' ? 10 : 15,
        },
        sectionTitle: {
            fontSize: templateConfig.sectionTitleStyle === 'minimal' ? 10 : (sectionSizes.sectionTitle || 14) * 0.85,
            fontWeight: 'bold',
            marginBottom: 8,
            color: templateConfig.isDarkTheme && templateConfig.sectionTitleStyle === 'terminal' ? '#4ade80' : (templateConfig.sectionTitleStyle === 'boxed' ? '#ffffff' : accentColor),
            backgroundColor: templateConfig.sectionTitleStyle === 'boxed' ? accentColor : 'transparent',
            paddingVertical: templateConfig.sectionTitleStyle === 'boxed' ? 3 : 0,
            paddingHorizontal: templateConfig.sectionTitleStyle === 'boxed' ? 8 : 0,
            borderRadius: templateConfig.sectionTitleStyle === 'boxed' ? 4 : 0,
            borderBottomWidth: templateConfig.sectionTitleStyle === 'underlined' ? 1 : 0,
            borderBottomColor: accentColor,
            borderBottomStyle: 'solid',
            textTransform: templateConfig.uppercaseTitle || templateConfig.sectionTitleStyle === 'minimal' ? 'uppercase' : 'none',
            letterSpacing: templateConfig.sectionTitleStyle === 'minimal' ? 2 : 0,
            alignSelf: 'flex-start',
        },
        sectionTitleSidebar: {
            fontSize: 11,
            fontWeight: 'bold',
            marginBottom: 8,
            color: sidebarTitleColor,
            borderBottomWidth: 1,
            borderBottomColor: isSidebarAccent ? 'rgba(255,255,255,0.3)' : '#cbd5e1',
            borderBottomStyle: 'solid',
            paddingBottom: 2,
            textTransform: 'uppercase',
            letterSpacing: 1,
        },
        
        // --- ITEMS ---
        item: {
            marginBottom: 8,
        },
        itemHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: 2,
        },
        itemTitle: {
            fontSize: 10,
            fontWeight: 'bold',
            color: titleText,
            marginRight: 10,
        },
        itemSubtitle: {
            fontSize: 9,
            fontWeight: 'bold',
            color: isDark ? '#ffffff' : accentColor,
        },
        itemDate: {
            fontSize: 9,
            color: secondaryText,
            fontFamily: 'Helvetica-Oblique',
        },
        itemText: {
            fontSize: 9,
            textAlign: 'justify',
            color: mainText,
            marginTop: 2,
            lineHeight: 1.4,
        },
        // Sidebar Items overrides
        sidebarText: {
            fontSize: 9,
            color: sidebarTextColor,
            marginTop: 2,
        },
        sidebarMuted: {
            fontSize: 9,
            color: sidebarMutedColor,
        },

        // --- SKILLS ---
        skillContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 5,
        },
        skillTag: {
            paddingVertical: 3,
            paddingHorizontal: 8,
            backgroundColor: isDark ? '#374151' : '#f1f5f9',
            borderRadius: 4,
            fontSize: 9,
            color: titleText,
            marginRight: 5,
            marginBottom: 5,
        },
        skillTagSidebar: {
            paddingVertical: 3,
            paddingHorizontal: 8,
            backgroundColor: isSidebarAccent ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
            borderRadius: 4,
            fontSize: 9,
            color: sidebarTextColor,
            marginRight: 5,
            marginBottom: 5,
        },

        // --- PHOTO ---
        photoContainer: {
            width: 80,
            height: 80,
            marginBottom: 10,
            alignSelf: templateConfig.headerStyle === 'centered' ? 'center' : 'flex-start',
            borderRadius: templateConfig.photoShape === 'circle' ? 40 : (templateConfig.photoShape === 'rounded' ? 10 : 0),
            overflow: 'hidden',
            borderWidth: 2,
            borderColor: accentColor,
        },
        photo: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
        },

        // --- EXTRAS ---
        link: {
            color: isDark ? '#60a5fa' : accentColor,
            textDecoration: 'none',
        },
        watermarkContainer: {
            position: 'absolute',
            top: '40%',
            left: 0,
            right: 0,
            justifyContent: 'center',
            alignItems: 'center',
            opacity: 0.1,
            transform: 'rotate(-45deg)',
            zIndex: 100,
        },
        watermarkText: {
            fontSize: 60,
            fontWeight: 'bold',
            color: '#000000',
            textTransform: 'uppercase',
        },
        pageNumber: {
            position: 'absolute',
            bottom: 15,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontSize: 8,
            color: secondaryText,
        }
    });
};

interface ResumePdfProps {
    resumeData: ResumeData;
    uiConfig: UiConfig;
    showWatermark?: boolean;
}

export const ResumePdfDocument: React.FC<ResumePdfProps> = ({ resumeData, uiConfig, showWatermark }) => {
    const { personal, sections } = resumeData;
    const templateConfig = getTemplateConfig(uiConfig.template, uiConfig.accentColor);
    const styles = createStyles(uiConfig, templateConfig);
    
    // Componente de Seção Reutilizável
    const RenderSection: React.FC<{ section: ResumeSection; isSidebar?: boolean }> = ({ section, isSidebar = false }) => {
        if (!section.items || section.items.length === 0) return null;
        
        const titleStyle = isSidebar ? styles.sectionTitleSidebar : styles.sectionTitle;
        const textStyle = isSidebar ? styles.sidebarText : styles.itemText;
        const mutedStyle = isSidebar ? styles.sidebarMuted : styles.itemDate;
        const titleItemStyle = [styles.itemTitle, isSidebar && { color: styles.sidebarText.color }];
        const subtitleStyle = [styles.itemSubtitle, isSidebar && { color: styles.sidebarMuted.color }];
        const skillTagStyle = isSidebar ? styles.skillTagSidebar : styles.skillTag;

        return (
            <View style={styles.section} wrap={false}>
                <Text style={titleStyle}>
                    {templateConfig.isDarkTheme && templateConfig.sectionTitleStyle === 'terminal' ? `> ${section.title}` : section.title}
                </Text>
                
                {section.type === 'skills' ? (
                    <View style={styles.skillContainer}>
                        {section.items.map((item: any) => (
                            <View key={item.id} style={skillTagStyle}>
                                <Text>{item.name}</Text>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View>
                        {section.items.map((item: any) => (
                            <View key={item.id} style={styles.item} wrap={false}>
                                <View style={styles.itemHeader}>
                                    <Text style={titleItemStyle}>
                                        {item.role || item.degree || item.name || item.language}
                                    </Text>
                                    {(item.startDate || item.proficiency) && (
                                        <Text style={mutedStyle}>
                                            {item.startDate ? `${formatDate(item.startDate)} - ${formatDate(item.endDate)}` : item.proficiency}
                                        </Text>
                                    )}
                                </View>
                                
                                {(item.company || item.institution) && (
                                    <Text style={subtitleStyle}>
                                        {item.company || item.institution}
                                    </Text>
                                )}
                                
                                {item.description && <Text style={textStyle}>{item.description}</Text>}
                                {item.text && <Text style={textStyle}>{item.text}</Text>}
                                {item.link && (
                                    <Link src={item.link} style={[styles.link, { fontSize: 9, marginTop: 2 }]}>
                                        {item.link}
                                    </Link>
                                )}
                            </View>
                        ))}
                    </View>
                )}
            </View>
        );
    };

    const HeaderContent = () => (
        <View style={styles.header}>
             {uiConfig.photo.show && uiConfig.photo.src && templateConfig.photoShape !== 'hidden' && templateConfig.headerStyle !== 'split' && (
                <View style={styles.photoContainer}>
                    <Image src={uiConfig.photo.src} style={styles.photo} />
                </View>
            )}
            
            <View style={{ flex: 1 }}>
                <Text style={styles.headerName}>{personal.name}</Text>
                <Text style={styles.headerJob}>{personal.jobTitle}</Text>
                
                <View style={styles.contactLine}>
                    {personal.email && <Text style={styles.contactItem}>{personal.email}</Text>}
                    {personal.phone && <Text style={styles.contactItem}>• {personal.phone}</Text>}
                    {personal.location && <Text style={styles.contactItem}>• {personal.location}</Text>}
                    {personal.linkedin && <Link src={personal.linkedin} style={[styles.link, { color: styles.contactLine.color, marginRight: 12 }]}>LinkedIn</Link>}
                    {personal.website && <Link src={personal.website} style={[styles.link, { color: styles.contactLine.color }]}>Portfólio</Link>}
                </View>
            </View>

            {uiConfig.photo.show && uiConfig.photo.src && templateConfig.photoShape !== 'hidden' && templateConfig.headerStyle === 'split' && (
                 <View style={[styles.photoContainer, { alignSelf: 'center', marginLeft: 20, marginBottom: 0 }]}>
                    <Image src={uiConfig.photo.src} style={styles.photo} />
                </View>
            )}
        </View>
    );

    const SidebarContact = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitleSidebar}>CONTATO</Text>
            <View style={{ marginBottom: 10 }}>
                    {personal.email && <Text style={[styles.sidebarText, { marginBottom: 3 }]}>{personal.email}</Text>}
                    {personal.phone && <Text style={[styles.sidebarText, { marginBottom: 3 }]}>{personal.phone}</Text>}
                    {personal.location && <Text style={[styles.sidebarText, { marginBottom: 3 }]}>{personal.location}</Text>}
                    {personal.linkedin && <Link src={personal.linkedin} style={[styles.sidebarText, { marginBottom: 3, textDecoration: 'none' }]}>LinkedIn</Link>}
                    {personal.website && <Link src={personal.website} style={[styles.sidebarText, { marginBottom: 3, textDecoration: 'none' }]}>Portfólio</Link>}
            </View>
        </View>
    );

    const SidebarContent = () => (
        <>
            {uiConfig.photo.show && uiConfig.photo.src && templateConfig.photoShape !== 'hidden' && (
                <View style={[styles.photoContainer, { alignSelf: 'center', borderColor: styles.sidebarText.color }]}>
                    <Image src={uiConfig.photo.src} style={styles.photo} />
                </View>
            )}
            
            <SidebarContact />
            
            {sections.filter(s => ['education', 'skills', 'languages'].includes(s.type)).map(s => (
                <RenderSection key={s.id} section={s} isSidebar={true} />
            ))}
        </>
    );

    const MainContent = () => (
        <>
            {sections.filter(s => ['summary', 'experience', 'projects'].includes(s.type)).map(s => (
                <RenderSection key={s.id} section={s} isSidebar={false} />
            ))}
        </>
    );

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {showWatermark && (
                    <View style={styles.watermarkContainer} fixed>
                        <Text style={styles.watermarkText}>DEMONSTRAÇÃO</Text>
                    </View>
                )}
                
                <Text style={styles.pageNumber} fixed render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />

                {templateConfig.layout === 'classic' || templateConfig.layout === 'compact' ? (
                    <View style={styles.mainContainer}>
                        <HeaderContent />
                        {sections.map(section => <RenderSection key={section.id} section={section} />)}
                    </View>
                ) : (
                    <>
                        {templateConfig.layout === 'sidebar-left' && (
                            <>
                                <View style={styles.leftColumn}><SidebarContent /></View>
                                <View style={styles.rightColumn}>
                                    {templateConfig.headerStyle === 'banner' ? <HeaderContent /> : (
                                        <View style={{ marginBottom: 20, paddingBottom: 10, borderBottomWidth: 2, borderBottomColor: uiConfig.accentColor }}>
                                            <Text style={[styles.headerName, { color: uiConfig.accentColor }]}>{personal.name}</Text>
                                            <Text style={[styles.headerJob, { color: '#64748b' }]}>{personal.jobTitle}</Text>
                                        </View>
                                    )}
                                    <MainContent />
                                </View>
                            </>
                        )}

                        {templateConfig.layout === 'sidebar-right' && (
                            <>
                                <View style={styles.rightColumn}>
                                    <View style={{ marginBottom: 20, paddingBottom: 10, borderBottomWidth: 2, borderBottomColor: uiConfig.accentColor }}>
                                        <Text style={[styles.headerName, { color: uiConfig.accentColor }]}>{personal.name}</Text>
                                        <Text style={[styles.headerJob, { color: '#64748b' }]}>{personal.jobTitle}</Text>
                                    </View>
                                    <MainContent />
                                </View>
                                <View style={styles.leftColumn}><SidebarContent /></View>
                            </>
                        )}
                    </>
                )}
            </Page>
        </Document>
    );
};

export default ResumePdfDocument;