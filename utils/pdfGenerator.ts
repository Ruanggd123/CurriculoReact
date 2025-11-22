import type { ResumeData, UiConfig } from '../types';
import { checkPremiumStatus } from '../services/api';

// ✅ URL Oficial do Cloud Run (aponta para o serviço, o caminho /gerarPDF é adicionado na chamada)
const CLOUD_RUN_URL = 'https://curriculum-pdf-781855708546-781855708546.us-central1.run.app';

function wrapCapturedHtml(html: string, uiConfig: UiConfig, demo: boolean): string {
    const isDark = document.documentElement.classList.contains('dark') || uiConfig.template === 'tech';

    // Define a cor da marca d'água com base no tema
    const watermarkColor = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)';
    const watermarkBorderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';

    const printStyles = `
    <style>
        * { box-sizing: border-box; }
        html { -webkit-font-smoothing: antialiased; zoom: 1; }
        @page { size: A4; margin: 0; }
        
        body { 
            margin: 0; padding: 0; 
            -webkit-print-color-adjust: exact; print-color-adjust: exact; 
            background: white; width: 210mm;
            font-family: 'Inter', sans-serif; /* Fallback font */
        }

        #resume-preview-container {
            margin: 0 !important;
            box-shadow: none !important;
            width: 210mm !important;
            height: auto !important;
            min-height: 297mm !important;
            padding: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            position: relative;
            overflow: visible !important;
        }

        /* Garante que layouts com sidebar preencham a página inteira */
        #resume-preview-container.is-sidebar-layout > div {
            flex: 1 1 auto !important;
            display: flex !important;
            min-height: 297mm;
        }
        
        /* Oculta elementos do editor */
        [data-pdf-hide='true'], .no-print-export { display: none !important; }

        /* Regras para evitar quebras de página */
        .resume-section, .resume-item { 
            page-break-inside: avoid !important; 
            break-inside: avoid-page !important; 
        }
        h2, h3, .resume-section-title { 
            page-break-after: avoid !important; 
            break-after: avoid-page !important; 
        }

        /* Ajustes de espaçamento para PDF */
        .py-16 { padding-top: 1.5rem !important; padding-bottom: 1.5rem !important; }
        .px-10 { padding-left: 1.5rem !important; padding-right: 1.5rem !important; }
        .mb-8 { margin-bottom: 1.25rem !important; }
        .mb-10 { margin-bottom: 1.5rem !important; }
        
        /* Remove margem do último elemento para evitar overflow */
        section:last-of-type, .resume-section:last-of-type, .resume-item:last-of-type {
            margin-bottom: 0 !important;
        }

        /* Estilos da Marca d'água */
        .watermark-layer {
            position: fixed; top: 50%; left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            z-index: 9999; pointer-events: none; display: flex;
            flex-direction: column; align-items: center; justify-content: center;
            border: 8px solid ${watermarkBorderColor};
            padding: 40px 60px; border-radius: 30px; opacity: 1;
        }
        .watermark-text, .watermark-sub {
            color: ${watermarkColor};
            font-family: 'Inter', sans-serif;
            text-transform: uppercase;
            white-space: nowrap;
        }
        .watermark-text { font-size: 60px; font-weight: 900; letter-spacing: 5px; }
        .watermark-sub { font-size: 24px; font-weight: 700; margin-top: 10px; letter-spacing: 2px; }
        
        /* Força a remoção da marca d'água de canto no modo premium */
        body.premium-pdf::after {
            content: none !important;
            display: none !important;
        }
    </style>
    `;

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
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
  ${printStyles}
</head>
<body class="${!demo ? 'premium-pdf' : ''}">
  ${demo ? `
    <div class="watermark-layer">
        <div class="watermark-text">VERSÃO GRATUITA</div>
        <div class="watermark-sub">CRIADO COM CURRICULUM PRO</div>
    </div>
  ` : ''}
  <div class="resume-page">${html}</div>
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

    const htmlCompleto = wrapCapturedHtml(capturedHtml, uiConfig, demo);
    
    const response = await fetchWithRetry(`${CLOUD_RUN_URL}/gerarPDF`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        html: htmlCompleto,
        modelo: uiConfig.template,
        email: resumeData.personal.email,
        demo: demo
      })
    }, 1, 4000);
    
    if (!response.ok) {
      let msgErro = `Erro HTTP ${response.status}`;
      try { const erro = await response.json(); msgErro = erro.erro || msgErro; } catch (e) {}
      throw new Error(msgErro);
    }
    
    const contentType = response.headers.get("content-type");
    
    if (contentType && contentType.includes("application/pdf")) {
        const blob = await response.blob();
        const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                const rawBase64 = result.replace(/^data:.+;base64,/, '');
                resolve(rawBase64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

        return { sucesso: true, pdfBase64: base64 };
    } else {
        const resultado = await response.json();
        if (resultado.sucesso) {
          return {
            sucesso: true,
            pdfUrl: resultado.pdfUrl || resultado.url,
            pdfBase64: resultado.pdfBase64
          };
        } else {
          throw new Error('Resposta inválida do servidor');
        }
    }
    
  } catch (erro: any) {
    console.error('❌ Erro PDF:', erro);
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