const fs = require('fs');

async function testPDF() {
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Teste PDF</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        h1 { color: #2c3e50; }
        .section { margin-bottom: 20px; padding: 10px; border: 1px solid #ddd; }
        .long-content { background: #f9f9f9; padding: 10px; }
      </style>
    </head>
    <body>
      <h1>Currículo Teste</h1>
      <div class="section">
        <h2>Dados Pessoais</h2>
        <p>Nome: João da Silva</p>
        <p>Email: joao@example.com</p>
      </div>
      
      <div class="section">
        <h2>Experiência Profissional</h2>
        ${Array(5).fill(`
          <div class="job">
            <h3>Empresa Exemplo</h3>
            <p>Cargo: Desenvolvedor</p>
            <p>Descrição: Trabalhei em diversos projetos importantes, desenvolvendo soluções escaláveis e robustas.</p>
          </div>
        `).join('')}
      </div>

      <div class="section">
        <h2>Educação</h2>
        <p>Universidade Exemplo - Ciência da Computação</p>
      </div>
      
      <div class="section">
        <h2>Conteúdo Longo para Teste de Quebra</h2>
        <div class="long-content">
          ${Array(20).fill('<p>Este é um parágrafo de teste para verificar como o PDF lida com quebras de página em conteúdos longos.</p>').join('')}
        </div>
      </div>
    </body>
    </html>
  `;

    try {
        console.log('Enviando requisição para gerar PDF...');
        const response = await fetch('http://localhost:8080/gerarPDF', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                html: htmlContent,
                email: 'teste@example.com'
            })
        });

        const data = await response.json();

        if (data.sucesso) {
            console.log('✅ PDF gerado com sucesso:', data.url);
            console.log('Por favor, verifique a URL acima para confirmar a formatação.');
        } else {
            console.error('❌ Erro ao gerar PDF:', data.erro);
        }
    } catch (error) {
        console.error('❌ Erro na requisição:', error.message);
        console.log('Certifique-se de que o servidor está rodando na porta 8080 (npm start).');
    }
}

testPDF();
