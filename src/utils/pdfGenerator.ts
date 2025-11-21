
import type { ResumeData, UiConfig } from '../types';
import { checkPremiumStatus } from '../services/api';

// ✅ URL Oficial do Cloud Run
const CLOUD_RUN_URL = 'https://curriculum-pdf-781855708546-781855708546.us-central1.run.app/gerarPDF';

function wrapCapturedHtml(html: string, demo: boolean): string {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300&family=Roboto+Mono:wght@400;500;700&family=Lato:wght@300;400;700;900&family=Montserrat:wght@300;400;500;600;700;800;900&family=Open+Sans:wght@300;400;600;700;800&family=Raleway:wght@300;400;600;700;900&family=Oswald:wght@400;500;700&family=Cormorant+Garamond:wght@400;600;700&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
        theme: {
            extend: {
                fontFamily: {
                    sans: ['Inter', 'sans-serif'],
                    serif: ['Merriweather', 'serif'],
                    display: ['Playfair Display', 'serif'],
                    mono: ['Roboto Mono', 'monospace'],
                    modern: ['Montserrat', 'sans-serif'],
                    body: ['Open Sans', 'sans-serif'],
                    clean: ['Lato', 'sans-serif'],
                    artistic: ['Raleway', 'sans-serif'],
                    condensed: ['Oswald', 'sans-serif'],
                    elegant: ['Cormorant Garamond', 'serif'],
                }
            }
        }
    }
  </script>
  <style>
    /* Global Reset to ensure PDF sizing matches preview */
    * { box-sizing: border-box; }
    
    html { 
        -webkit-font-smoothing: antialiased; 
        zoom: 0.96; 
        height: auto;
    }

    @page { 
        size: A4; 
        margin: 0mm; 
    }
    
    body { 
        margin: 0; 
        padding: 0; 
        -webkit-print-color-adjust: exact; 
        print-color-adjust: exact; 
        background: white;
        width: 210mm;
        height: auto;
        min-height: 0;
    }
    
    #resume-preview-container {
        margin: 0 !important;
        box-shadow: none !important;
        width: 210mm !important;
        height: auto !important;
        min-height: 297mm !important; /* Mínimo de 1 página A4 */
        padding: 0 !important;
        display: flex !important;
        flex-direction: column !important;
        background-color: white;
        position: relative;
        overflow: visible !important;
    }

    /* Apenas para layouts de sidebar, força o container a esticar para preencher a página */
    #resume-preview-container.is-sidebar-layout > div {
        flex: 1 1 auto !important;
        display: flex !important;
        min-height: 297mm; /* Garante que o flexbox tenha uma altura para trabalhar */
    }
    
    [data-pdf-hide='true'] { display: none !important; }
    .no-print-export { display: none !important; }
    
    p, h1, h2, h3, h4, h5, h6, span, div {
        overflow-wrap: break-word;
    }
    
    .resume-item {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    
    h3.resume-section-title, 
    .resume-section-title {
      page-break-after: avoid !important;
      break-after: avoid !important;
    }
    
    .py-16 {
      padding-top: 2rem !important;
      padding-bottom: 2rem !important;
    }
    
    .mb-8 { margin-bottom: 1.2rem !important; }
    .mb-10 { margin-bottom: 1.5rem !important; }

    #resume-preview-container > div > div:last-child,
    section:last-of-type,
    .resume-section:last-of-type,
    .resume-item:last-of-type {
        margin-bottom: 0 !important;
        padding-bottom: 0 !important;
    }

    .watermark-layer {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        z-index: 9999;
        pointer-events: none;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border: 8px solid rgba(0, 0, 0, 0.1);
        padding: 40px 60px;
        border-radius: 30px;
        opacity: 0.6;
    }
    
    .watermark-text {
        font-size: 60px;
        font-weight: 900;
        color: rgba(0, 0, 0, 0.15);
        text-transform: uppercase;
        font-family: sans-serif;
        letter-spacing: 5px;
        white-space: nowrap;
    }

    .watermark-sub {
        font-size: 24px;
        font-weight: 700;
        color: rgba(0, 0, 0, 0.15);
        margin-top: 10px;
        font-family: sans-serif;
        letter-spacing: 2px;
    }
  </style>
</head>
<body>
  ${demo ? `
    <div class="watermark-layer">
        <div class="watermark-text">VERSÃO GRATUITA</div>
        <div class="watermark-sub">CRIADO COM CURRICULUM PRO</div>
    </div>
  ` : ''}
  ${html}
</body>
</html>
    `;
}

export async function verificarPremium(email: string): Promise<{ premium: boolean }> {
  if (!email) return { premium: false };
  const premium = await checkPremiumStatus(email);
  return { premium };
}

// Função auxiliar para retry com delay
const fetchWithRetry = async (url: string, options: any, retries = 1, delay = 3000): Promise<Response> => {
  try {
    const response = await fetch(url, options);
    if (!response.ok && (response.status === 503 || response.status === 504)) {
        throw new Error(`Status ${response.status}`);
    }
    return response;
  } catch (err) {
    if (retries > 0) {
      console.log(`🔄 Retentativa de conexão (${retries} restantes)...`);
      await new Promise(res => setTimeout(res, delay));
      return fetchWithRetry(url, options, retries - 1, delay);
    }
    throw err;
  }
};

async function gerarPDFCloud(
  resumeData: ResumeData,
  uiConfig: UiConfig,
  demo: boolean,
  capturedHtml?: string
): Promise<{ sucesso: boolean; pdfUrl?: string; erro?: string; pdfBase64?: string }> {
  try {
    console.log(`📤 Iniciando geração de PDF (Demo: ${demo})...`);
    
    if (!capturedHtml) {
      throw new Error('HTML não capturado.');
    }

    const htmlCompleto = wrapCapturedHtml(capturedHtml, demo);
    
    // Tenta fazer a requisição com 1 retry automático para lidar com Cold Start
    const response = await fetchWithRetry(CLOUD_RUN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        html: htmlCompleto,
        modelo: uiConfig.template,
        email: resumeData.personal.email,
        demo: demo
      })
    }, 1, 4000); // 1 retry após 4 segundos
    
    if (!response.ok) {
       // Tenta ler erro do JSON
      let msgErro = `Erro HTTP ${response.status}`;
      try {
        const erro = await response.json();
        msgErro = erro.erro || msgErro;
      } catch (e) {}
      throw new Error(msgErro);
    }
    
    const contentType = response.headers.get("content-type");
    
    if (contentType && contentType.includes("application/pdf")) {
        // 🆓 STREAM (Blob)
        const blob = await response.blob();
        const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                // Garante que retorna apenas a parte base64 pura, removendo qualquer prefixo data URI
                const rawBase64 = result.replace(/^data:.+;base64,/, '');
                resolve(rawBase64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

        return { sucesso: true, pdfBase64: base64 };
    } else {
        // 💎 PREMIUM (JSON)
        const resultado = await response.json();
        if (resultado.sucesso) {
          return {
            sucesso: true,
            pdfUrl: resultado.pdfUrl || resultado.url, // Support both properties (legacy/new)
            pdfBase64: resultado.pdfBase64
          };
        } else {
          throw new Error('Resposta inválida do servidor');
        }
    }
    
  } catch (erro: any) {
    console.error('❌ Erro PDF:', erro);
    // Mensagem amigável para timeout
    if (erro.message && (erro.message.includes('503') || erro.message.includes('504') || erro.message.includes('fetch'))) {
        return { sucesso: false, erro: "O servidor está acordando. Por favor, tente novamente em 10 segundos." };
    }
    return { sucesso: false, erro: erro.message || "Erro desconhecido" };
  }
}

export async function gerarPDFDemo(
  resumeData: ResumeData,
  uiConfig: UiConfig,
  capturedHtml?: string
): Promise<{ sucesso: boolean; pdfUrl?: string; erro?: string; pdfBase64?: string; premium: boolean; }> {
  const result = await gerarPDFCloud(resumeData, uiConfig, true, capturedHtml);
  return { ...result, premium: false };
}

export async function gerarPDFPremium(
  resumeData: ResumeData,
  uiConfig: UiConfig,
  capturedHtml?: string
): Promise<{ sucesso: boolean; pdfUrl?: string; erro?: string; premium: boolean; pdfBase64?: string }> {
  
  const premiumCheck = await verificarPremium(resumeData.personal.email);
  if (!premiumCheck.premium) {
    return { sucesso: false, premium: false, erro: 'Acesso premium necessário' };
  }
  
  const cloudResult = await gerarPDFCloud(resumeData, uiConfig, false, capturedHtml);
  return { ...cloudResult, premium: cloudResult.sucesso };
}
