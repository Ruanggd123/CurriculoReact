/**
 * latexGenerator.js - VERSÃO FINAL COM PAGE BREAKS
 * Generates LaTeX code based on user data and selected template.
 * Supports 'classic' (linear) and 'modern' (two-column with paracol) layouts.
 * FIX: Full bleed + Safe margins to prevent content cutting between pages
 */

/**
 * Escapes special LaTeX characters to prevent compilation errors.
 */
function sanitize(text) {
    if (!text) return "";
    return String(text)
        .replace(/\\/g, "\\textbackslash{}")
        .replace(/([&%$#_{}])/g, "\\$1")
        .replace(/~/g, "\\textasciitilde{}")
        .replace(/\^/g, "\\textasciicircum{}");
}

/**
 * Generates the LaTeX preamble including necessary packages and color definitions.
 */
function generatePreamble(data) {
    const primaryColor = data.metadata?.primaryColor || "#000000";
    // Remove '#' if present for xcolor
    const colorHex = primaryColor.replace("#", "");
    return `
\\documentclass[a4paper,10pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage[brazil]{babel}
\\usepackage[paper=a4paper, margin=0cm]{geometry} % FULL BLEED - 0 margins
\\usepackage{xcolor}
\\usepackage{paracol} % For multi-column layouts
\\usepackage{enumitem} % For cleaner lists
\\usepackage{titlesec} % For section formatting
\\usepackage{hyperref} % For clickable links
\\usepackage{fontawesome5} % For icons
\\usepackage{lmodern} % Better fonts
\\usepackage{scrextend} % For addmargin

% Define custom colors
\\definecolor{primary}{HTML}{${colorHex}}
\\definecolor{darktext}{HTML}{1A1A1A}
\\definecolor{lighttext}{HTML}{FFFFFF}

% Hyperref setup
\\hypersetup{
  colorlinks=true,
  linkcolor=primary,
  filecolor=primary,
  urlcolor=primary,
}

% Remove page numbers
\\pagestyle{empty}

% ====== CRITICAL: Safe margins for multi-page documents ======
% Internal document margins to prevent content cutting
\\setlength{\\hoffset}{-1in}
\\setlength{\\voffset}{-1in}
\\setlength{\\topmargin}{0cm}
\\setlength{\\headheight}{0cm}
\\setlength{\\headsep}{0cm}
\\setlength{\\footskip}{0cm}

% Safe page area (with 0.5cm buffer on all sides to avoid cutting)
% A4: 21cm x 29.7cm, but we use 20cm x 28.7cm for safety
\\setlength{\\textwidth}{20cm}
\\setlength{\\textheight}{28.7cm}

% Position at top-left with 0.5cm safety margin
\\setlength{\\oddsidemargin}{0.5cm}
\\setlength{\\topmargin}{0.5cm}

\\setlength{\\parskip}{0pt}
\\setlength{\\parsep}{0pt}

% Remove spacing before/after sections
\\titlespacing*{\\section}{0pt}{0pt}{0pt}
\\titlespacing*{\\subsection}{0pt}{0pt}{0pt}

% Prevent orphaned lines
\\clubpenalty=10000
\\widowpenalty=10000

% Custom commands
\\newcommand{\\header}[3]{
  \\begin{center}
    {\\Huge \\textbf{#1}} \\\\[0.2cm]
    {\\Large #2} \\\\[0.2cm]
    \\small #3
  \\end{center}
}

`;
}

/**
 * Generates content for the "Classic" layout (Linear).
 */
function generateClassic(data) {
    const { personalInfo, summary, experience, education, skills, languages } = data;
    let latex = `
\\begin{document}

\\newgeometry{top=1.5cm, bottom=1.5cm, left=1.5cm, right=1.5cm}

% Header
\\header{${sanitize(personalInfo.name)}}{${sanitize(personalInfo.role)}}{
  \\faEnvelope\\ ${sanitize(personalInfo.email)} \\quad \\faPhone\\ ${sanitize(personalInfo.phone)} \\\\
  \\faMapMarker*\\ ${sanitize(personalInfo.location)}
}

\\vspace{0.5cm}
`;

    // Summary
    if (summary) {
        latex += `
\\section*{Resumo}
${sanitize(summary)}

\\vspace{0.3cm}
`;
    }

    // Experience
    if (experience && experience.length > 0) {
        latex += `\\section*{Experiência Profissional}\n`;
        experience.forEach(exp => {
            latex += `
\\noindent \\textbf{${sanitize(exp.company)}} \\hfill ${sanitize(exp.period)} \\\\
\\textit{${sanitize(exp.role)}} \\\\
${sanitize(exp.description)}

\\vspace{0.3cm}
`;
        });
    }

    // Education
    if (education && education.length > 0) {
        latex += `\\section*{Formação Acadêmica}\n`;
        education.forEach(edu => {
            latex += `
\\noindent \\textbf{${sanitize(edu.institution)}} \\hfill ${sanitize(edu.period)} \\\\
${sanitize(edu.degree)}

\\vspace{0.2cm}
`;
        });
    }

    // Skills
    if (skills && skills.length > 0) {
        latex += `\\section*{Habilidades}\n\\begin{itemize}[leftmargin=*]\n`;
        skills.forEach(skill => {
            latex += `\\item ${sanitize(skill)}\n`;
        });
        latex += `\\end{itemize}\n`;
    }

    // Languages
    if (languages && languages.length > 0) {
        latex += `\\section*{Idiomas}\n\\begin{itemize}[leftmargin=*]\n`;
        languages.forEach(lang => {
            latex += `\\item ${sanitize(lang)}\n`;
        });
        latex += `\\end{itemize}\n`;
    }

    latex += `\\end{document}`;
    return latex;
}

/**
 * Generates content for the "Modern" layout (Sidebar on Right).
 * FINAL VERSION: Full bleed + Safe margins between pages
 */
function generateModern(data) {
    const { personalInfo, summary, experience, education, skills, languages } = data;
    let latex = `
\\begin{document}

% ====== FULL BLEED CONFIGURATION WITH PAGE SAFETY ======

% Force paracol to respect margins
\\setlength{\\parindent}{0pt}
\\columnratio{0.65}
\\setlength{\\columnsep}{0pt}

% Set explicit column widths accounting for safe margins
% Safe area: 20cm width (0.5cm margins on each side)
\\setcolumnwidth{\\dimexpr.65 * 20cm\\relax, \\dimexpr.35 * 20cm\\relax}

% Background colors with large coverage but respecting page boundaries
\\backgroundcolor{C[0](10000pt, 10000pt)}{white}
\\backgroundcolor{C[1](10000pt, 10000pt)}{primary}

\\begin{paracol}{2}

% ========== LEFT COLUMN (Main Content) ==========
\\begin{leftcolumn}

\\noindent
\\begin{addmargin}[0.8cm]{0.6cm}

{\\Huge \\textbf{\\color{darktext} ${sanitize(personalInfo.name)}}} \\\\[0.1cm]
{\\Large \\color{darktext} ${sanitize(personalInfo.role)}}

\\vspace{0.3cm}

${summary ? `
\\section*{Resumo}
\\color{darktext}
\\small
${sanitize(summary)}

\\vspace{0.3cm}
` : ''}

${experience && experience.length > 0 ? `
\\section*{Experiência}
\\color{darktext}
\\small

${experience.map(exp => `
\\noindent \\textbf{${sanitize(exp.company)}} \\hfill ${sanitize(exp.period)} \\\\
\\textit{${sanitize(exp.role)}} \\\\
${sanitize(exp.description)}

\\vspace{0.25cm}
`).join('\n')}
` : ''}

\\end{addmargin}

\\vspace*{\\fill}

\\end{leftcolumn}

% ========== RIGHT COLUMN (Sidebar) ==========
\\begin{rightcolumn}

\\noindent
\\begin{addmargin}[0.6cm]{0.6cm}

\\color{lighttext}
\\small

% Contact section
\\section*{\\color{lighttext} \\normalsize Contato}
\\vspace{-0.2cm}

\\faEnvelope\\ ${sanitize(personalInfo.email)} \\\\
\\faPhone\\ ${sanitize(personalInfo.phone)} \\\\
\\faMapMarker*\\ ${sanitize(personalInfo.location)}

\\vspace{0.3cm}

${skills && skills.length > 0 ? `
\\section*{\\color{lighttext} \\normalsize Habilidades}
\\vspace{-0.2cm}
\\begin{itemize}[leftmargin=*,itemsep=0.5pt]
${skills.map(s => `\\item \\small ${sanitize(s)}`).join('\n')}
\\end{itemize}

\\vspace{0.25cm}
` : ''}

${languages && languages.length > 0 ? `
\\section*{\\color{lighttext} \\normalsize Idiomas}
\\vspace{-0.2cm}
\\begin{itemize}[leftmargin=*,itemsep=0.5pt]
${languages.map(l => `\\item \\small ${sanitize(l)}`).join('\n')}
\\end{itemize}

\\vspace{0.25cm}
` : ''}

${education && education.length > 0 ? `
\\section*{\\color{lighttext} \\normalsize Formação}
\\vspace{-0.2cm}

${education.map(edu => `
\\textbf{\\small ${sanitize(edu.institution)}} \\\\
{\\tiny ${sanitize(edu.degree)}} \\\\
{\\tiny ${sanitize(edu.period)}}

\\vspace{0.15cm}
`).join('\n')}
` : ''}

\\end{addmargin}

\\vspace*{\\fill}

\\end{rightcolumn}

\\end{paracol}

\\end{document}
`;
    return latex;
}

/**
 * Main function to generate LaTeX code.
 * @param {Object} data - The user resume data.
 * @returns {string} The generated LaTeX code.
 */
function generateLatex(data) {
    const preamble = generatePreamble(data);
    const template = data.metadata?.template || 'classic';
    let content = '';

    if (template === 'modern' || template === 'infographic') {
        content = generateModern(data);
    } else {
        content = generateClassic(data);
    }

    return preamble + content;
}

module.exports = { generateLatex };
