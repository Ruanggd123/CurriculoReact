const { generateLatex } = require('./latexGenerator');
const fs = require('fs');

const sampleData = {
    personalInfo: {
        name: "João Silva",
        role: "Desenvolvedor Full Stack",
        email: "joao.silva@email.com",
        phone: "(11) 99999-9999",
        location: "São Paulo, SP"
    },
    summary: "Desenvolvedor apaixonado por criar soluções escaláveis e eficientes.",
    experience: [
        {
            company: "Tech Solutions",
            role: "Engenheiro de Software Sênior",
            period: "2020 - Presente",
            description: "Liderança técnica de projetos web utilizando React e Node.js."
        },
        {
            company: "Web Corp",
            role: "Desenvolvedor Front-end",
            period: "2018 - 2020",
            description: "Desenvolvimento de interfaces responsivas e acessíveis."
        }
    ],
    education: [
        {
            institution: "Universidade de Tecnologia",
            degree: "Bacharelado em Ciência da Computação",
            period: "2014 - 2018"
        }
    ],
    skills: ["JavaScript", "TypeScript", "React", "Node.js", "Docker"],
    languages: ["Português (Nativo)", "Inglês (Avançado)"],
    metadata: {
        template: "classic",
        primaryColor: "#0055AA"
    }
};

console.log("--- Testing Classic Layout ---");
const classicLatex = generateLatex(sampleData);
console.log(classicLatex.substring(0, 500) + "..."); // Log first 500 chars
fs.writeFileSync('output_classic.tex', classicLatex);
console.log("Saved output_classic.tex");

console.log("\n--- Testing Modern Layout ---");
sampleData.metadata.template = "modern";
const modernLatex = generateLatex(sampleData);
console.log(modernLatex.substring(0, 500) + "..."); // Log first 500 chars
fs.writeFileSync('output_modern.tex', modernLatex);
console.log("Saved output_modern.tex");
