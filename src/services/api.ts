import { API_URL } from '../../config';

const DEFAULT_CONFIG = {
  preco: 9.90,
  titulo: 'Download Premium',
  descricao: 'Sem marca d\'água'
};

export const createPayment = async (email: string, method: 'pix' | 'card' = 'pix') => {
  try {
    console.log(`🚀 Criando pagamento (${method}) para:`, email);
    
    const cleanEmail = email.trim();

    // Adiciona timestamp para evitar cache e redirect: follow para seguir o 302 do Google
    const response = await fetch(`${API_URL}?path=criar-pagamento&t=${Date.now()}`, {
      method: 'POST',
      credentials: 'omit', 
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({ 
          email: cleanEmail, 
          method,
          origin: typeof window !== 'undefined' ? window.location.origin : '' // Add origin to support redirect back
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.erro) {
      throw new Error(data.erro);
    }

    return data;

  } catch (error) {
    console.error('Erro pagamento:', error);
    throw error;
  }
};

export const checkPremiumStatus = async (email: string): Promise<boolean> => {
  try {
    const response = await fetch(
      `${API_URL}?path=status-premium&email=${encodeURIComponent(email.trim())}&t=${Date.now()}`,
      { 
        method: 'GET',
        credentials: 'omit',
        redirect: 'follow'
      }
    );
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    return data.premium || false;

  } catch (error) {
    // Falha silenciosa para evitar logs excessivos em caso de erro de rede
    return false;
  }
};

export const getConfig = async () => {
  try {
    const response = await fetch(`${API_URL}?path=config&t=${Date.now()}`, {
        method: 'GET',
        credentials: 'omit',
        redirect: 'follow'
    });
    
    if (!response.ok) {
      return DEFAULT_CONFIG;
    }
    
    const data = await response.json();
    return { ...DEFAULT_CONFIG, ...data };

  } catch (error) {
    // Silently return default config on error to prevent app breakage
    return DEFAULT_CONFIG;
  }
};

export const consumeUsage = async (email: string) => {
  try {
    console.log(`💸 Consumindo uso para: ${email}`);
    const response = await fetch(`${API_URL}?path=consumir-uso&t=${Date.now()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ email: email.trim() }),
        credentials: 'omit',
        redirect: 'follow'
    });

    if (!response.ok) {
      console.warn('Falha ao consumir uso, resposta não-OK');
      return false;
    }

    const data = await response.json();
    console.log('✅ Resposta do consumo:', data);
    return data.sucesso === true;

  } catch (error) {
    console.error('Erro ao consumir uso:', error);
    return false;
  }
};
