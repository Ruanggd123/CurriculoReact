import React, { useState, useEffect, useRef } from 'react';
import { 
    MicrophoneIcon, MicrophoneSlashIcon, SpeakerWaveIcon, SpeakerXMarkIcon,
    SparklesIcon, XMarkIcon
} from './icons';

interface VoiceAssistantModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ChatMessage {
    id: string;
    sender: 'ai' | 'user';
    text: string;
    timestamp: string;
}

// Respostas inteligentes contextualizadas para currículo e recrutamento
const generateAiResponse = (userText: string): string => {
    const text = userText.toLowerCase().trim();

    if (text.includes('ats') || text.includes('gupy') || text.includes('robo') || text.includes('robô') || text.includes('triagem')) {
        return "Os sistemas ATS (como a Gupy e Workday) escaneiam palavras-chave e a estrutura do seu currículo. Todos os nossos mais de 35 modelos foram desenvolvidos com código semântico limpo, garantindo mais de 98% de taxa de aprovação na leitura automatizada dos recrutadores!";
    }

    if (text.includes('resumo') || text.includes('perfil') || text.includes('apresentação') || text.includes('apresentacao')) {
        return "O resumo ideal deve ter entre 3 e 4 linhas. Ele deve conter: seu cargo principal, anos de experiência ou foco de estudo, uma grande conquista ou diferencial e suas competências mais fortes. No nosso Assistente Guiado, você pode gerar um resumo pronto com apenas 1 clique!";
    }

    if (text.includes('primeiro emprego') || text.includes('sem experiência') || text.includes('estagio') || text.includes('estágio') || text.includes('iniciante') || text.includes('trainee')) {
        return "Para quem está no primeiro emprego ou estágio, o foco deve ser na sua formação acadêmica, cursos extracurriculares, projetos acadêmicos ou voluntariado e suas habilidades interpessoais. O nosso modelo 'Clássico Tradicional' ou 'Moderno Clean' é ideal para destacar seu potencial!";
    }

    if (text.includes('modelo') || text.includes('template') || text.includes('qual escolher') || text.includes('design')) {
        return "A escolha do modelo depende da sua área! Para Tecnologia e Devs, use o modelo 'Tech Dark Mode'. Para Finanças e Gestão, escolha o 'Executivo Luxo'. Para Marketing e Design, o 'Criativo Studio'. E para qualquer área geral, o 'Moderno Padrão' passa com louvor em qualquer processo seletivo!";
    }

    if (text.includes('experiencia') || text.includes('experiência') || text.includes('trabalho') || text.includes('atividades')) {
        return "A dica de ouro é: em vez de apenas listar o que você fazia no dia a dia, destaque CONQUISTAS e RESULTADOS com números! Por exemplo: em vez de 'atendimento a clientes', escreva 'Atendimento a mais de 40 clientes diários com 98% de índice de satisfação'.";
    }

    if (text.includes('habilidade') || text.includes('skill') || text.includes('competencia') || text.includes('competência')) {
        return "Equilibre Hard Skills (ferramentas como Excel, Python, Figma, CRM) com Soft Skills (como resolução de problemas, liderança e comunicação ágil). Use os termos exatos que constam no anúncio da vaga que você deseja!";
    }

    if (text.includes('idioma') || text.includes('ingles') || text.includes('inglês') || text.includes('espanhol')) {
        return "Idiomas são grandes diferenciais competitivos! Se tiver inglês ou espanhol, inclua o nível realista (Básico, Intermediário, Avançado ou Fluente). No passo 6 do nosso Assistente, você pode adicionar idiomas em poucos segundos.";
    }

    if (text.includes('olá') || text.includes('ola') || text.includes('oi') || text.includes('bom dia') || text.includes('boa tarde') || text.includes('boa noite') || text.includes('teste')) {
        return "Olá! Sou a Sofia, sua recrutadora e especialista de carreira virtual. Estou aqui ao vivo para tirar suas dúvidas, sugerir melhorias para o seu currículo e te ajudar a conquistar a vaga dos seus sonhos. Pode me perguntar qualquer coisa sobre seu currículo!";
    }

    if (text.includes('obrigado') || text.includes('obrigada') || text.includes('valeu')) {
        return "Por nada! Fico muito feliz em ajudar. Se quiser tirar mais alguma dúvida ou treinar respostas para a entrevista, é só falar comigo!";
    }

    // Resposta padrão analítica e prestativa
    return `Entendi perfeitamente sua pergunta sobre "${userText}". No mercado de trabalho atual, clareza e dados objetivos são essenciais. Você pode usar nosso Assistente Guiado Passo a Passo para estruturar cada seção, ou me perguntar sobre resumo, palavras-chave e escolha de modelos!`;
};

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({ isOpen, onClose }) => {
    // Estado Liga/Desliga do Modo de Voz (solicitado pelo usuário)
    const [isVoiceActive, setIsVoiceActive] = useState<boolean>(() => {
        const saved = localStorage.getItem('voice_mode_active');
        return saved !== null ? saved === 'true' : true;
    });

    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [isListening, setIsListening] = useState<boolean>(false);
    const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
    const [transcript, setTranscript] = useState<string>('');
    const [inputText, setInputText] = useState<string>('');
    const [recognitionSupported, setRecognitionSupported] = useState<boolean>(true);
    const [speechError, setSpeechError] = useState<string | null>(null);

    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'welcome',
            sender: 'ai',
            text: 'Olá! Sou a Sofia, sua especialista de carreira e recrutadora virtual. O chat de voz ao vivo está ativo para testes! Fale comigo pelo microfone ou digite sua dúvida.',
            timestamp: 'Agora'
        }
    ]);

    const recognitionRef = useRef<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Salva preferência do modo voz
    useEffect(() => {
        localStorage.setItem('voice_mode_active', isVoiceActive ? 'true' : 'false');
    }, [isVoiceActive]);

    // Rola para a mensagem mais recente
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Inicializa Web Speech API Recognition
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setRecognitionSupported(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onstart = () => {
            setIsListening(true);
            setSpeechError(null);
        };

        recognition.onresult = (event: any) => {
            let current = '';
            for (let i = 0; i < event.results.length; i++) {
                current += event.results[i][0].transcript;
            }
            setTranscript(current);

            // Se for resultado final
            if (event.results[0]?.isFinal) {
                handleUserMessage(current);
                setTranscript('');
            }
        };

        recognition.onerror = (event: any) => {
            console.warn('Speech Recognition error:', event.error);
            setIsListening(false);
            if (event.error === 'not-allowed') {
                setSpeechError('Permissão de microfone negada no navegador. Permita o microfone para falar.');
            } else if (event.error === 'no-speech') {
                // Silêncio, tudo bem
            } else {
                setSpeechError(`Aviso de voz: ${event.error}`);
            }
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.abort();
                } catch (e) {
                    // ignore
                }
            }
        };
    }, []);

    // Fala o texto via SpeechSynthesis em português
    const speakText = (text: string) => {
        if (!isVoiceActive || isMuted || typeof window === 'undefined' || !window.speechSynthesis) {
            return;
        }

        try {
            window.speechSynthesis.cancel(); // Para falas anteriores

            const cleanText = text.replace(/[*_~`#]/g, '');
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.lang = 'pt-BR';
            utterance.rate = 1.05; // Levemente mais dinâmico
            utterance.pitch = 1.0;

            // Busca voz em português do Brasil
            const voices = window.speechSynthesis.getVoices();
            const ptVoice = voices.find(v => v.lang === 'pt-BR' || v.lang === 'pt_BR') || 
                            voices.find(v => v.lang.startsWith('pt')) || null;
            if (ptVoice) {
                utterance.voice = ptVoice;
            }

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);

            window.speechSynthesis.speak(utterance);
        } catch (e) {
            console.warn('Speech synthesis error:', e);
            setIsSpeaking(false);
        }
    };

    // Alternar gravação de voz do usuário
    const toggleListening = () => {
        if (!isVoiceActive) {
            setSpeechError('Ative o Modo Voz na chave acima para começar a falar.');
            return;
        }

        if (!recognitionRef.current) {
            setSpeechError('Seu navegador não possui suporte ao reconhecimento de voz.');
            return;
        }

        if (isListening) {
            try {
                recognitionRef.current.stop();
            } catch (e) {
                // ignore
            }
        } else {
            try {
                // Para áudio que a IA estiver falando para não dar eco
                if (window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                    setIsSpeaking(false);
                }
                setSpeechError(null);
                recognitionRef.current.start();
            } catch (e) {
                console.warn('Error starting speech recognition:', e);
            }
        }
    };

    // Processa mensagem enviada pelo usuário
    const handleUserMessage = (userText: string) => {
        const clean = userText.trim();
        if (!clean) return;

        const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        const userMsg: ChatMessage = {
            id: `user-${Date.now()}`,
            sender: 'user',
            text: clean,
            timestamp: timeStr
        };

        const aiResponseText = generateAiResponse(clean);

        const aiMsg: ChatMessage = {
            id: `ai-${Date.now() + 1}`,
            sender: 'ai',
            text: aiResponseText,
            timestamp: timeStr
        };

        setMessages(prev => [...prev, userMsg, aiMsg]);
        setInputText('');
        setTranscript('');

        // Responde com voz se o modo de voz estiver ativo
        speakText(aiResponseText);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleUserMessage(inputText);
    };

    // Parar fala ao fechar o modal
    const handleClose = () => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        if (recognitionRef.current && isListening) {
            try {
                recognitionRef.current.stop();
            } catch (e) {
                // ignore
            }
        }
        setIsSpeaking(false);
        setIsListening(false);
        onClose();
    };

    // Se o modal não estiver aberto, não renderiza nada
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-2xl h-[90vh] max-h-[720px] flex flex-col shadow-2xl shadow-blue-950/50 overflow-hidden relative">
                
                {/* Ambient Top Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-blue-600/20 via-indigo-600/10 to-transparent blur-2xl pointer-events-none -z-10"></div>

                {/* ==================== HEADER COM CHAVE LIGA/DESLIGA ==================== */}
                <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-600/30">
                                <SparklesIcon className="w-5 h-5 text-white" />
                            </div>
                            {isVoiceActive && (
                                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950 animate-pulse"></span>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-black text-white tracking-tight">
                                    Sofia • Recrutadora IA
                                </h3>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                    Voz ao Vivo (BETA)
                                </span>
                            </div>
                            <p className="text-xs text-slate-400">
                                {isSpeaking ? '🗣️ Sofia está falando...' : isListening ? '👂 Ouvindo sua voz...' : 'Tire dúvidas e treine para sua entrevista'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* TOGGLE ON / OFF (ATIVAR / DESATIVAR MODO VOZ) */}
                        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-2xl shadow-inner">
                            <span className="text-[11px] font-bold text-slate-400 hidden sm:inline">
                                Modo Voz:
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    const next = !isVoiceActive;
                                    setIsVoiceActive(next);
                                    if (!next) {
                                        if (window.speechSynthesis) window.speechSynthesis.cancel();
                                        if (recognitionRef.current) {
                                            try { recognitionRef.current.stop(); } catch(e) {}
                                        }
                                        setIsSpeaking(false);
                                        setIsListening(false);
                                    } else {
                                        speakText("Modo de voz ativado! Pode falar comigo.");
                                    }
                                }}
                                className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                                    isVoiceActive 
                                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30' 
                                        : 'bg-slate-800 text-slate-400 hover:text-white'
                                }`}
                                title="Ativar ou desativar o chat de voz"
                            >
                                <span className={`w-2 h-2 rounded-full ${isVoiceActive ? 'bg-slate-950' : 'bg-slate-600'}`}></span>
                                <span>{isVoiceActive ? 'ON' : 'OFF'}</span>
                            </button>
                        </div>

                        {/* Mute Speaker Button */}
                        <button
                            type="button"
                            onClick={() => {
                                setIsMuted(!isMuted);
                                if (!isMuted && window.speechSynthesis) {
                                    window.speechSynthesis.cancel();
                                    setIsSpeaking(false);
                                }
                            }}
                            className={`p-2 rounded-xl border transition-all ${
                                isMuted 
                                    ? 'border-amber-500/50 text-amber-400 bg-amber-950/30' 
                                    : 'border-slate-700/80 text-slate-300 hover:text-white bg-slate-800/60'
                            }`}
                            title={isMuted ? 'Desmutar voz da IA' : 'Mutar voz da IA'}
                        >
                            {isMuted ? <SpeakerXMarkIcon className="w-4 h-4" /> : <SpeakerWaveIcon className="w-4 h-4" />}
                        </button>

                        {/* Close button */}
                        <button
                            type="button"
                            onClick={handleClose}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors"
                            title="Fechar assistente de voz"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* ==================== ACTIVE VOICE PULSE VISUALIZER ==================== */}
                {isVoiceActive && (
                    <div className="bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900 border-b border-slate-800/60 px-5 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {/* Animated Audio Waveform */}
                            <div className="flex items-center gap-1 h-5">
                                {[40, 70, 100, 60, 90, 50, 80].map((h, i) => (
                                    <span
                                        key={i}
                                        className={`w-1 rounded-full transition-all duration-200 ${
                                            isSpeaking 
                                                ? 'bg-gradient-to-t from-blue-500 to-cyan-400 animate-pulse' 
                                                : isListening 
                                                    ? 'bg-gradient-to-t from-emerald-500 to-teal-400 animate-bounce' 
                                                    : 'bg-slate-700 h-2'
                                        }`}
                                        style={{
                                            height: (isSpeaking || isListening) ? `${Math.max(6, (h * ((i % 2 === 0 ? 1 : 0.7))))}px` : '4px',
                                            animationDelay: `${i * 100}ms`
                                        }}
                                    ></span>
                                ))}
                            </div>

                            <span className="text-xs font-semibold text-slate-300">
                                {isSpeaking ? (
                                    <span className="text-cyan-400">Sofia respondendo em áudio...</span>
                                ) : isListening ? (
                                    <span className="text-emerald-400 animate-pulse">Ouvindo você... Fale agora!</span>
                                ) : (
                                    <span className="text-slate-400">Modo de Voz pronto. Clique no microfone para falar.</span>
                                )}
                            </span>
                        </div>

                        <span className="text-[10px] font-mono text-slate-500">
                            Web Speech AI • pt-BR
                        </span>
                    </div>
                )}

                {/* Error Banner if any */}
                {speechError && (
                    <div className="bg-amber-950/60 border-b border-amber-800/50 px-4 py-2 text-xs text-amber-200 flex items-center justify-between">
                        <span>⚠️ {speechError}</span>
                        <button onClick={() => setSpeechError(null)} className="text-amber-300 hover:text-white font-bold ml-2">✕</button>
                    </div>
                )}

                {/* ==================== CHAT MESSAGES STREAM ==================== */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar bg-slate-950/50">
                    {messages.map(msg => (
                        <div
                            key={msg.id}
                            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1`}
                        >
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium px-1">
                                <span>{msg.sender === 'user' ? 'Você' : 'Sofia (IA)'}</span>
                                <span>•</span>
                                <span>{msg.timestamp}</span>
                            </div>

                            <div className={`max-w-[85%] sm:max-w-[78%] p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                                msg.sender === 'user'
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-lg shadow-blue-600/20'
                                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}

                    {/* Live Transcript Bubble while speaking */}
                    {transcript && (
                        <div className="flex flex-col items-end space-y-1 animate-in fade-in duration-150">
                            <span className="text-[10px] text-emerald-400 font-bold px-1 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Transcrevendo sua fala...
                            </span>
                            <div className="max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm bg-emerald-950/40 border border-emerald-500/50 text-emerald-200 italic rounded-tr-none">
                                "{transcript}"
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* ==================== SUGGESTION CHIPS ==================== */}
                <div className="px-4 py-2 border-t border-slate-900 bg-slate-950/80 flex overflow-x-auto no-scrollbar gap-2">
                    {[
                        'Como passar no robô da Gupy?',
                        'O que colocar no resumo?',
                        'Dicas para primeiro emprego',
                        'Qual modelo escolher?'
                    ].map((suggestion, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => handleUserMessage(suggestion)}
                            className="px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white whitespace-nowrap transition-colors shrink-0"
                        >
                            💡 {suggestion}
                        </button>
                    ))}
                </div>

                {/* ==================== INPUT CONTROLS & MICROPHONE ==================== */}
                <div className="p-3 sm:p-4 border-t border-slate-800/80 bg-slate-900/90 backdrop-blur-xl">
                    <form onSubmit={handleFormSubmit} className="flex items-center gap-2 sm:gap-3">
                        {/* Big Voice Button */}
                        <button
                            type="button"
                            onClick={toggleListening}
                            disabled={!recognitionSupported || !isVoiceActive}
                            className={`p-3 sm:p-3.5 rounded-2xl font-bold flex items-center justify-center transition-all duration-200 shrink-0 ${
                                !isVoiceActive 
                                    ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60' 
                                    : isListening 
                                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/40 animate-pulse scale-105' 
                                        : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-lg shadow-blue-600/30 active:scale-95'
                            }`}
                            title={!isVoiceActive ? 'Ative o Modo Voz na chave acima' : isListening ? 'Clique para pausar gravação' : 'Clique para falar por voz'}
                        >
                            {isListening ? (
                                <MicrophoneIcon className="w-5 h-5 animate-pulse" />
                            ) : (
                                <MicrophoneIcon className="w-5 h-5" />
                            )}
                        </button>

                        {/* Text input fallback */}
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder={isVoiceActive ? "Fale pelo microfone ou digite aqui..." : "Modo voz desligado. Digite sua pergunta..."}
                            className="flex-1 px-4 py-3 bg-slate-950 border border-slate-700/80 rounded-2xl text-white text-xs sm:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder-slate-500"
                        />

                        {/* Send Button */}
                        <button
                            type="submit"
                            disabled={!inputText.trim()}
                            className="px-4 sm:px-5 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg transition-all active:scale-95 shrink-0"
                        >
                            Enviar
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
