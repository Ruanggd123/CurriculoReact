
import React, { useState, useRef, useEffect } from 'react';
import type { ResumeData, UiConfig, ResumeSection, Experience, Education, Skill, Project, Language } from '../types';
import { EmailIcon, PhoneIcon, LocationIcon, LinkedinIcon, GithubIcon, WebsiteIcon, LinkIcon } from './icons';

interface ResumePreviewProps {
  resumeData: ResumeData;
  uiConfig: UiConfig;
}

// Helper to format dates
const formatDate = (dateString: string) => {
    if (!dateString) return '';
    if (dateString.toLowerCase() === 'presente' || dateString.toLowerCase() === 'cursando') return dateString;
    try {
        const [year, month] = dateString.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    } catch (e) {
        return dateString;
    }
}

// Helper to handle multiline descriptions
const Description: React.FC<{ text: string, style?: React.CSSProperties }> = ({ text, style }) => (
    <div className="prose prose-sm max-w-none text-gray-600" style={style}>
        {text.split('\n').map((line, index) => (
            <p key={index} className="mb-1 leading-relaxed">{line}</p>
        ))}
    </div>
);

// Photo component
const ProfilePhoto: React.FC<{ config: UiConfig['photo'] }> = ({ config }) => {
    if (!config.show || !config.src) return null;
    const [imageStyle, setImageStyle] = useState<React.CSSProperties>({});
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Debounce or wait for layout to ensure correct measurements
        const timer = setTimeout(() => {
            if (!config.src || !containerRef.current) return;
            
            const container = containerRef.current;
            // Use clientWidth for more reliable measurement after render
            const { clientWidth: containerWidth, clientHeight: containerHeight } = container;

            if (containerWidth === 0) return; // Avoid running if not rendered yet

            const img = new Image();
            img.src = config.src;
            img.onload = () => {
                const { naturalWidth, naturalHeight } = img;
                
                // This logic is identical to the PhotoEditorModal's getBoundaries function
                const imgAspectRatio = naturalWidth / naturalHeight;
                const containerAspectRatio = containerWidth / containerHeight;
                
                let coveredImgWidth, coveredImgHeight;
                if (imgAspectRatio > containerAspectRatio) {
                    coveredImgHeight = containerHeight;
                    coveredImgWidth = coveredImgHeight * imgAspectRatio;
                } else {
                    coveredImgWidth = containerWidth;
                    coveredImgHeight = coveredImgWidth / imgAspectRatio;
                }
                
                const zoomedWidth = coveredImgWidth * (config.zoom / 100);
                const zoomedHeight = coveredImgHeight * (config.zoom / 100);

                const minX = containerWidth - zoomedWidth;
                const minY = containerHeight - zoomedHeight;
                
                const [xPercentStr, yPercentStr] = config.position.split(' ');
                const xPercent = parseFloat(xPercentStr) / 100;
                const yPercent = parseFloat(yPercentStr) / 100;
                
                const finalX = !isNaN(xPercent) ? minX * xPercent : minX / 2;
                const finalY = !isNaN(yPercent) ? minY * yPercent : minY / 2;

                setImageStyle({
                    position: 'absolute',
                    width: `${zoomedWidth}px`,
                    height: `${zoomedHeight}px`,
                    left: `${finalX}px`,
                    top: `${finalY}px`,
                    maxWidth: 'none',
                });
            };
        }, 100); // Small delay to allow for render

        return () => clearTimeout(timer);
        
    }, [config.src, config.zoom, config.position, config.style]);

    return (
        <div 
            ref={containerRef}
            className={`relative w-32 h-32 overflow-hidden ${config.style}`}
        >
            {config.src && (
                 <img 
                    src={config.src} 
                    alt="Foto de Perfil" 
                    style={imageStyle}
                    // Prevent image from being dragged
                    draggable="false" 
                />
            )}
        </div>
    );
};


// ==================== SECTION COMPONENTS ====================

const ExperienceSection: React.FC<{ items: Experience[], uiConfig: UiConfig }> = ({ items, uiConfig }) => (
    <div className="space-y-4">
        {items.map(exp => (
            <div key={exp.id}>
                <div className="flex justify-between items-baseline">
                    <h4 className="text-lg font-semibold">{exp.role}</h4>
                    <p className="text-sm font-medium text-gray-500">{formatDate(exp.startDate)} - {formatDate(exp.endDate)}</p>
                </div>
                <p className="text-md font-medium text-gray-600">{exp.company}</p>
                <Description text={exp.description} style={{ fontSize: `${uiConfig.sectionSizes.experience}px`, marginTop: '0.5rem' }} />
            </div>
        ))}
    </div>
);

const EducationSection: React.FC<{ items: Education[], uiConfig: UiConfig }> = ({ items, uiConfig }) => (
    <div className="space-y-4">
        {items.map(edu => (
            <div key={edu.id}>
                 <div className="flex justify-between items-baseline">
                    <h4 className="text-lg font-semibold">{edu.degree}</h4>
                    <p className="text-sm font-medium text-gray-500">{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</p>
                </div>
                <p className="text-md font-medium text-gray-600">{edu.institution}</p>
                {edu.description && <Description text={edu.description} style={{ fontSize: `${uiConfig.sectionSizes.education}px`, marginTop: '0.5rem' }} />}
            </div>
        ))}
    </div>
);

const SkillsSection: React.FC<{ items: Skill[], uiConfig: UiConfig }> = ({ items, uiConfig }) => (
    <div className="flex flex-wrap gap-2">
        {items.map(skill => (
            <span key={skill.id} className="bg-gray-200 text-gray-800 text-sm font-medium px-3 py-1 rounded-full" style={{ fontSize: `${uiConfig.sectionSizes.skills}px` }}>
                {skill.name}
            </span>
        ))}
    </div>
);

const ProjectsSection: React.FC<{ items: Project[], uiConfig: UiConfig, accentColor: string }> = ({ items, uiConfig, accentColor }) => (
    <div className="space-y-4">
        {items.map(proj => (
            <div key={proj.id}>
                <div className="flex items-center gap-2">
                    <h4 className="text-lg font-semibold">{proj.name}</h4>
                    {proj.link && (
                        <a href={proj.link} target="_blank" rel="noopener noreferrer" style={{color: accentColor}}>
                            <LinkIcon width="16" height="16" />
                        </a>
                    )}
                </div>
                <Description text={proj.description} style={{ fontSize: `${uiConfig.sectionSizes.experience}px`, marginTop: '0.25rem' }} />
            </div>
        ))}
    </div>
);

const LanguagesSection: React.FC<{ items: Language[] }> = ({ items }) => (
    <div className="space-y-2">
        {items.map(lang => (
            <p key={lang.id} className="text-md">
                <span className="font-semibold">{lang.language}:</span> {lang.proficiency}
            </p>
        ))}
    </div>
);


// ==================== TEMPLATES ====================

const ClassicTemplate: React.FC<ResumePreviewProps> = ({ resumeData, uiConfig }) => {
    const { personal, sections } = resumeData;
    const { accentColor, photo, sectionSizes } = uiConfig;

    const renderSection = (section: ResumeSection) => {
        if (!section.items || (Array.isArray(section.items) && section.items.length === 0)) return null;

        let content;
        switch(section.type) {
            case 'experience': content = <ExperienceSection items={section.items as Experience[]} uiConfig={uiConfig} />; break;
            case 'education': content = <EducationSection items={section.items as Education[]} uiConfig={uiConfig} />; break;
            case 'skills': content = <SkillsSection items={section.items as Skill[]} uiConfig={uiConfig} />; break;
            case 'projects': content = <ProjectsSection items={section.items as Project[]} uiConfig={uiConfig} accentColor={accentColor} />; break;
            case 'languages': content = <LanguagesSection items={section.items as Language[]} />; break;
            default: return null;
        }
        return (
            <section key={section.id} id={section.id}>
                <h3 className="font-bold border-b-2 pb-1 mb-3" style={{ borderColor: accentColor, color: accentColor, fontSize: `${sectionSizes.sectionTitle}px` }}>{section.title}</h3>
                {content}
            </section>
        )
    }

    return (
        <div className="p-8 font-sans text-gray-800 space-y-6 bg-white">
            <header className="text-center" id="personal">
                {photo.show && (
                    <div className="flex justify-center mb-4">
                        <ProfilePhoto config={photo} />
                    </div>
                )}
                <h1 className="font-bold" style={{ color: accentColor, fontSize: `${sectionSizes.name}px` }}>{personal.name}</h1>
                <h2 className="font-semibold text-gray-600 mt-1" style={{ fontSize: `${sectionSizes.jobTitle}px` }}>{personal.jobTitle}</h2>
                <div className="flex justify-center items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mt-3">
                    {personal.email && <span className="flex items-center gap-1.5"><EmailIcon /> {personal.email}</span>}
                    {personal.phone && <span className="flex items-center gap-1.5"><PhoneIcon /> {personal.phone}</span>}
                    {personal.location && <span className="flex items-center gap-1.5"><LocationIcon /> {personal.location}</span>}
                </div>
                <div className="flex justify-center items-center flex-wrap gap-x-4 gap-y-1 text-sm mt-2">
                    {personal.linkedin && <a href={`https://${personal.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:underline" style={{ color: accentColor }}><LinkedinIcon /> {personal.linkedin}</a>}
                    {personal.github && <a href={`https://${personal.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:underline" style={{ color: accentColor }}><GithubIcon /> {personal.github}</a>}
                    {personal.website && <a href={`https://${personal.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:underline" style={{ color: accentColor }}><WebsiteIcon /> {personal.website}</a>}
                </div>
            </header>

            {personal.summary && (
              <section id="summary">
                  <h3 className="font-bold border-b-2 pb-1 mb-3" style={{ borderColor: accentColor, color: accentColor, fontSize: `${sectionSizes.sectionTitle}px` }}>Resumo</h3>
                  <p className="text-gray-700" style={{ fontSize: `${sectionSizes.summary}px` }}>{personal.summary}</p>
              </section>
            )}

            {sections.map(renderSection)}

        </div>
    );
};

const ModernTemplate: React.FC<ResumePreviewProps> = ({ resumeData, uiConfig }) => {
    const { personal, sections } = resumeData;
    const { accentColor, photo, sectionSizes } = uiConfig;
    
    const sidebarSections = sections.filter(s => s.type === 'skills' || s.type === 'languages');
    const mainSections = sections.filter(s => s.type === 'experience' || s.type === 'education' || s.type === 'projects');

    const renderSidebarSection = (section: ResumeSection) => {
         if (!section.items || (Array.isArray(section.items) && section.items.length === 0)) return null;
         let content;
         switch(section.type) {
            case 'skills':
                 content = <div className="flex flex-wrap gap-2">
                    {(section.items as Skill[]).map(skill => (
                        <span key={skill.id} className="bg-white/30 text-white text-sm font-medium px-3 py-1 rounded-full" style={{ fontSize: `${sectionSizes.skills}px` }}>
                            {skill.name}
                        </span>
                    ))}
                </div>;
                break;
            case 'languages':
                content = <div className="space-y-1 text-sm">
                    {(section.items as Language[]).map(lang => (
                         <p key={lang.id}>{lang.language}: {lang.proficiency}</p>
                    ))}
                </div>;
                break;
            default: return null;
         }
         return (
            <div key={section.id} id={section.id}>
                <h2 className="font-bold mt-8 mb-4 border-b-2 border-white pb-2" style={{ fontSize: `${sectionSizes.sectionTitle}px` }}>{section.title}</h2>
                {content}
            </div>
         );
    }

    return (
        <div className="flex min-h-[297mm] bg-white">
            <aside className="w-1/3 p-6 text-white" style={{ backgroundColor: accentColor }}>
                <div className="sticky top-6">
                    {photo.show && (
                        <div className="flex justify-center mb-6">
                            <ProfilePhoto config={photo} />
                        </div>
                    )}
                    <h2 className="font-bold mb-4 border-b-2 border-white pb-2" style={{ fontSize: `${sectionSizes.sectionTitle}px` }}>Contato</h2>
                    <div className="space-y-2 text-sm">
                        {personal.email && <p className="flex items-center gap-2"><EmailIcon /> {personal.email}</p>}
                        {personal.phone && <p className="flex items-center gap-2"><PhoneIcon /> {personal.phone}</p>}
                        {personal.location && <p className="flex items-center gap-2"><LocationIcon /> {personal.location}</p>}
                        {personal.linkedin && <a href={`https://${personal.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline"><LinkedinIcon /> LinkedIn</a>}
                        {personal.github && <a href={`https://${personal.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline"><GithubIcon /> GitHub</a>}
                        {personal.website && <a href={`https://${personal.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline"><WebsiteIcon /> Website</a>}
                    </div>

                    {sidebarSections.map(renderSidebarSection)}
                </div>
            </aside>
            <main className="w-2/3 p-8 font-sans text-gray-800">
                <header className="mb-8" id="personal">
                    <h1 className="font-extrabold" style={{ color: accentColor, fontSize: `${sectionSizes.name}px` }}>{personal.name}</h1>
                    <h2 className="font-semibold text-gray-600 mt-1" style={{ fontSize: `${sectionSizes.jobTitle}px` }}>{personal.jobTitle}</h2>
                </header>

                {personal.summary && (
                  <section className="mb-6" id="summary">
                      <h3 className="font-bold border-b-2 pb-1 mb-3" style={{ borderColor: accentColor, color: accentColor, fontSize: `${sectionSizes.sectionTitle}px` }}>Resumo</h3>
                      <p className="text-gray-700" style={{ fontSize: `${sectionSizes.summary}px` }}>{personal.summary}</p>
                  </section>
                )}
                
                <div className="space-y-6">
                    {mainSections.map(section => {
                        if (!section.items || (Array.isArray(section.items) && section.items.length === 0)) return null;
                        
                        let content;
                        if(section.type === 'experience') content = <ExperienceSection items={section.items as Experience[]} uiConfig={uiConfig} />;
                        else if (section.type === 'education') content = <EducationSection items={section.items as Education[]} uiConfig={uiConfig} />;
                        else if (section.type === 'projects') content = <ProjectsSection items={section.items as Project[]} uiConfig={uiConfig} accentColor={accentColor} />;
                        else return null;

                        return (
                            <section key={section.id} id={section.id}>
                                <h3 className="font-bold border-b-2 pb-1 mb-3" style={{ borderColor: accentColor, color: accentColor, fontSize: `${sectionSizes.sectionTitle}px` }}>{section.title}</h3>
                                {content}
                            </section>
                        )
                    })}
                </div>
            </main>
        </div>
    );
};

const CompactTemplate: React.FC<ResumePreviewProps> = ({ resumeData, uiConfig }) => {
    const { personal, sections } = resumeData;
    const { accentColor, photo, sectionSizes } = uiConfig;
    
    const sidebarSections = sections.filter(s => s.type === 'skills' || s.type === 'languages' || s.type === 'projects');
    const mainSections = sections.filter(s => !sidebarSections.some(ss => ss.id === s.id));

    return (
        <div className="p-6 font-sans text-gray-800 bg-white">
             <header className="flex justify-between items-start mb-6" id="personal">
                <div>
                    <h1 className="font-bold" style={{ color: accentColor, fontSize: `${sectionSizes.name}px` }}>{personal.name}</h1>
                    <h2 className="font-semibold text-gray-600" style={{ fontSize: `${sectionSizes.jobTitle}px` }}>{personal.jobTitle}</h2>
                </div>
                {photo.show && <ProfilePhoto config={{...photo, style: 'rounded-lg', src: photo.src || ''}} />}
            </header>

            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2">
                    {personal.summary && (
                        <section className="mb-4" id="summary">
                            <p className="text-gray-700" style={{ fontSize: `${sectionSizes.summary}px` }}>{personal.summary}</p>
                        </section>
                    )}
                    
                    {mainSections.map(section => {
                       if (!section.items || (Array.isArray(section.items) && section.items.length === 0)) return null;
                        
                        let content;
                        if(section.type === 'experience') {
                            content = (
                                <div className="space-y-3">
                                    {(section.items as Experience[]).map(exp => (
                                        <div key={exp.id}>
                                            <h4 className="font-semibold">{exp.role} at {exp.company}</h4>
                                            <p className="text-xs text-gray-500">{formatDate(exp.startDate)} - {formatDate(exp.endDate)}</p>
                                            <Description text={exp.description} style={{ fontSize: `${sectionSizes.experience}px`}} />
                                        </div>
                                    ))}
                                </div>
                            );
                        } else if (section.type === 'education') {
                            content = (
                                <div className="space-y-3">
                                     {(section.items as Education[]).map(edu => (
                                        <div key={edu.id}>
                                            <h4 className="font-semibold">{edu.degree}</h4>
                                            <p className="text-xs text-gray-500">{edu.institution} | {formatDate(edu.startDate)} - {formatDate(edu.endDate)}</p>
                                        </div>
                                    ))}
                                </div>
                            )
                        } else return null;

                        return (
                            <section className="mb-4" key={section.id} id={section.id}>
                                <h3 className="font-bold border-b-2 pb-1 mb-2" style={{ borderColor: accentColor, color: accentColor, fontSize: `${sectionSizes.sectionTitle}px` }}>{section.title}</h3>
                                {content}
                            </section>
                        )
                    })}
                </div>

                <aside className="col-span-1">
                    <section className="mb-4">
                        <h3 className="font-bold" style={{ color: accentColor, fontSize: `${sectionSizes.sectionTitle}px` }}>Contato</h3>
                        <div className="text-sm space-y-1 mt-2">
                            {personal.email && <p className="flex items-center gap-2 text-xs break-all"><EmailIcon /> {personal.email}</p>}
                            {personal.phone && <p className="flex items-center gap-2 text-xs"><PhoneIcon /> {personal.phone}</p>}
                            {personal.location && <p className="flex items-center gap-2 text-xs"><LocationIcon /> {personal.location}</p>}
                            {personal.linkedin && <a href={`https://${personal.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline text-blue-600 text-xs"><LinkedinIcon /> LinkedIn</a>}
                            {personal.github && <a href={`https://${personal.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline text-blue-600 text-xs"><GithubIcon /> GitHub</a>}
                        </div>
                    </section>
                    {sidebarSections.map(section => {
                         if (!section.items || (Array.isArray(section.items) && section.items.length === 0)) return null;
                         let content;
                         switch(section.type) {
                             case 'skills':
                                 content = <div className="flex flex-wrap gap-2 mt-2">
                                     {(section.items as Skill[]).map(skill => (
                                         <span key={skill.id} className="bg-gray-200 text-gray-800 text-xs font-medium px-2 py-1 rounded" style={{ fontSize: `${sectionSizes.skills}px` }}>
                                             {skill.name}
                                         </span>
                                     ))}
                                 </div>;
                                 break;
                             case 'languages':
                                content = <div className="text-sm space-y-1 mt-2">
                                    {(section.items as Language[]).map(lang => (
                                        <p key={lang.id} className="text-xs">{lang.language}: {lang.proficiency}</p>
                                    ))}
                                </div>;
                                break;
                            case 'projects':
                                content = <div className="text-sm space-y-2 mt-2">
                                     {(section.items as Project[]).map(proj => (
                                         <div key={proj.id}>
                                             <a href={proj.link} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline text-xs">{proj.name}</a>
                                         </div>
                                     ))}
                                </div>
                         }
                         return (
                            <section className="mb-4" key={section.id} id={section.id}>
                                <h3 className="font-bold" style={{ color: accentColor, fontSize: `${sectionSizes.sectionTitle}px` }}>{section.title}</h3>
                                {content}
                            </section>
                         )
                    })}
                </aside>
            </div>
        </div>
    );
}

const ExecutiveTemplate: React.FC<ResumePreviewProps> = ({ resumeData, uiConfig }) => {
    const { personal, sections } = resumeData;
    const { accentColor, photo, sectionSizes } = uiConfig;
    
    const sidebarSections = sections.filter(s => s.type === 'skills' || s.type === 'education' || s.type === 'languages');
    const mainSections = sections.filter(s => s.type === 'experience' || s.type === 'projects');

    return (
        <div className="flex min-h-[297mm] bg-white">
            <main className="w-2/3 p-8 font-sans text-gray-800">
                <header className="mb-8 text-center" id="personal">
                    <h1 className="font-extrabold tracking-tight" style={{ fontSize: `${sectionSizes.name}px` }}>{personal.name}</h1>
                    <h2 className="font-semibold mt-1" style={{ color: accentColor, fontSize: `${sectionSizes.jobTitle}px` }}>{personal.jobTitle}</h2>
                </header>

                {personal.summary && (
                    <section className="mb-6" id="summary">
                        <h3 className="font-bold uppercase tracking-widest border-b pb-1 mb-3" style={{ borderColor: accentColor, color: accentColor, fontSize: `${sectionSizes.sectionTitle}px` }}>Perfil</h3>
                        <p className="text-gray-700" style={{ fontSize: `${sectionSizes.summary}px` }}>{personal.summary}</p>
                    </section>
                )}
                
                {mainSections.map(section => {
                    if (!section.items || (Array.isArray(section.items) && section.items.length === 0)) return null;
                    let content;
                    if(section.type === 'experience') content = <ExperienceSection items={section.items as Experience[]} uiConfig={uiConfig} />;
                    else if(section.type === 'projects') content = <ProjectsSection items={section.items as Project[]} uiConfig={uiConfig} accentColor={accentColor} />;
                    else return null;
                    
                    return (
                        <section className="mb-6" key={section.id} id={section.id}>
                             <h3 className="font-bold uppercase tracking-widest border-b pb-1 mb-3" style={{ borderColor: accentColor, color: accentColor, fontSize: `${sectionSizes.sectionTitle}px` }}>{section.title}</h3>
                             {content}
                        </section>
                    )
                })}
            </main>
            <aside className="w-1/3 p-6 bg-gray-100 text-gray-800">
                <div className="sticky top-6">
                    {photo.show && (
                        <div className="flex justify-center mb-6">
                            <ProfilePhoto config={photo} />
                        </div>
                    )}
                    <section className="mb-6">
                         <h3 className="font-bold uppercase tracking-widest border-b pb-1 mb-3" style={{ borderColor: accentColor, color: accentColor, fontSize: `${sectionSizes.sectionTitle}px` }}>Contato</h3>
                        <div className="space-y-2 text-sm">
                            {personal.email && <p className="flex items-start gap-2"><EmailIcon /> <span>{personal.email}</span></p>}
                            {personal.phone && <p className="flex items-start gap-2"><PhoneIcon /> <span>{personal.phone}</span></p>}
                            {personal.location && <p className="flex items-start gap-2"><LocationIcon /> <span>{personal.location}</span></p>}
                        </div>
                    </section>
                     <section className="mb-6">
                        <h3 className="font-bold uppercase tracking-widest border-b pb-1 mb-3" style={{ borderColor: accentColor, color: accentColor, fontSize: `${sectionSizes.sectionTitle}px` }}>Online</h3>
                        <div className="space-y-2 text-sm">
                            {personal.linkedin && <a href={`https://${personal.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline"><LinkedinIcon /> {personal.linkedin}</a>}
                            {personal.github && <a href={`https://${personal.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline"><GithubIcon /> {personal.github}</a>}
                            {personal.website && <a href={`https://${personal.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline"><WebsiteIcon /> {personal.website}</a>}
                        </div>
                    </section>
                    
                    {sidebarSections.map(section => {
                        if (!section.items || (Array.isArray(section.items) && section.items.length === 0)) return null;
                        let content;
                        switch(section.type) {
                            case 'skills':
                                content = <ul className="list-disc list-inside text-sm">
                                    {(section.items as Skill[]).map(skill => (
                                        <li key={skill.id} style={{ fontSize: `${sectionSizes.skills}px` }}>{skill.name}</li>
                                    ))}
                                    </ul>;
                                break;
                            case 'education':
                                content = <div className="space-y-3">
                                    {(section.items as Education[]).map(edu => (
                                        <div key={edu.id}>
                                            <h4 className="font-semibold text-sm">{edu.degree}</h4>
                                            <p className="text-xs text-gray-600">{edu.institution}</p>
                                            <p className="text-xs text-gray-500">{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</p>
                                        </div>
                                    ))}
                                </div>;
                                break;
                            case 'languages':
                                content = <div className="space-y-1 text-sm">
                                     {(section.items as Language[]).map(lang => (
                                        <p key={lang.id}>{lang.language} ({lang.proficiency})</p>
                                    ))}
                                </div>;
                                break;
                            default: return null;
                        }
                        return (
                             <section className="mb-6" key={section.id} id={section.id}>
                                <h3 className="font-bold uppercase tracking-widest border-b pb-1 mb-3" style={{ borderColor: accentColor, color: accentColor, fontSize: `${sectionSizes.sectionTitle}px` }}>{section.title}</h3>
                                {content}
                            </section>
                        )
                    })}
                </div>
            </aside>
        </div>
    );
};


const templates = {
    classic: ClassicTemplate,
    modern: ModernTemplate,
    compact: CompactTemplate,
    executive: ExecutiveTemplate,
}

export const ResumePreview = React.forwardRef<HTMLDivElement, ResumePreviewProps>(({ resumeData, uiConfig }, ref) => {
    const { backgroundColor, template } = uiConfig;
    const TemplateComponent = templates[template] || ClassicTemplate;
    
    // This check ensures that resumeData and sections exist before rendering.
    if (!resumeData || !resumeData.sections) {
        return <div ref={ref}>Loading...</div>;
    }
    
    return (
        <div ref={ref} className="w-[210mm] min-h-[297mm] mx-auto shadow-2xl overflow-hidden" style={{ backgroundColor }}>
            <TemplateComponent resumeData={resumeData} uiConfig={uiConfig} />
        </div>
    );
});