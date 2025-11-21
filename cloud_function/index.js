
const path = require('path');
const functions = require('@google-cloud/functions-framework');
const puppeteer = require('puppeteer');
const { Storage } = require('@google-cloud/storage');

const storage = new Storage();
// Use environment variable for bucket name or fallback
const BUCKET_NAME = process.env.BUCKET_NAME || 'curriculum-pdf-storage-478722';

functions.http('gerarPDF', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  try {
    const { html, modelo, email, demo, filename } = req.body;

    if (!html) {
      return res.status(400).json({ erro: 'HTML não fornecido' });
    }

    // Logic: If demo=true (Free), isPremium=false. If demo=false (or undefined), treat as potentially premium request.
    // However, the calling service should handle verification.
    const isPremium = demo === false; 

    console.log(`🚀 Gerando PDF (Premium: ${isPremium})...`);
    
    // Configuração otimizada para Cloud Run
    const browser = await puppeteer.launch({
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage', // CRUCIAL para evitar crashes de memória
        '--disable-gpu',
        '--font-render-hinting=none',
        '--disable-extensions'
      ],
      headless: 'new',
      protocolTimeout: 60000 // 60s timeout
    });

    const page = await browser.newPage();
    
    // Viewport A4 aproximado
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });

    await page.setContent(html, { 
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 45000 // Aumentado para conexões lentas
    });

    // Aguarda fontes carregarem
    try {
        await page.evaluateHandle('document.fonts.ready');
    } catch (e) {
        console.warn('Timeout aguardando fontes, prosseguindo...');
    }

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' }, 
      preferCSSPageSize: true
    });

    await browser.close();

    const safeFilename = (filename || `curriculo_${email ? email.split('@')[0] : 'user'}_${Date.now()}.pdf`).replace(/[^a-zA-Z0-9_.-]/g, '_');

    if (isPremium) {
        // 💎 PREMIUM: Upload para Cloud Storage
        console.log('💎 Salvando no Storage...');
        
        const file = storage.bucket(BUCKET_NAME).file(safeFilename);
        await file.save(pdfBuffer, {
          metadata: {
            contentType: 'application/pdf',
            contentDisposition: `attachment; filename="${safeFilename}"`,
            metadata: { email, modelo, premium: 'true' }
          }
        });
        
        await file.makePublic();
        const publicUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${safeFilename}`;
    
        res.json({
          sucesso: true,
          premium: true,
          pdfUrl: publicUrl,
          nomeArquivo: safeFilename,
          tamanho: pdfBuffer.length
        });
    } else {
        // 🆓 FREE: Stream direto (blob)
        console.log('🆓 Enviando Stream...');
        
        res.set('Content-Type', 'application/pdf');
        res.set('Content-Disposition', `attachment; filename="${safeFilename}"`);
        res.set('Content-Length', pdfBuffer.length);
        res.send(pdfBuffer);
    }

  } catch (erro) {
    console.error('❌ Erro:', erro);
    if (!res.headersSent) {
        res.status(500).json({ erro: erro.message, stack: erro.stack });
    }
  }
});
