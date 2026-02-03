const fetch = require('node-fetch'); // Ensure node-fetch is available or use native fetch in Node 18+

async function testLatexAPI() {
    const sampleData = {
        personalInfo: {
            name: "Maria Souza",
            role: "Designer de Produto",
            email: "maria.souza@email.com",
            phone: "(21) 98888-8888",
            location: "Rio de Janeiro, RJ"
        },
        summary: "Designer com foco em experiência do usuário e interfaces intuitivas.",
        experience: [
            {
                company: "Creative Studio",
                role: "Senior UX Designer",
                period: "2019 - Presente",
                description: "Liderança de projetos de redesign e pesquisa com usuários."
            }
        ],
        education: [
            {
                institution: "PUC-RJ",
                degree: "Design Digital",
                period: "2015 - 2018"
            }
        ],
        skills: ["Figma", "Adobe XD", "Prototipagem", "CSS", "HTML"],
        languages: ["Português", "Inglês", "Espanhol"],
        metadata: {
            template: "modern", // Testing Modern layout
            primaryColor: "#E63946"
        }
    };

    try {
        console.log('Enviando requisição para gerar PDF via LaTeX...');
        // Note: This requires the server to be running locally on port 8080
        const response = await fetch('http://localhost:8080/gerarPDFLatex', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sampleData)
        });

        const data = await response.json();

        if (data.sucesso) {
            console.log('✅ PDF LaTeX gerado com sucesso:', data.url);
        } else {
            console.error('❌ Erro ao gerar PDF:', data.erro);
        }
    } catch (error) {
        console.error('❌ Erro na requisição:', error.message);
        console.log('Certifique-se de que o servidor está rodando (npm start).');
    }
}

testLatexAPI();
