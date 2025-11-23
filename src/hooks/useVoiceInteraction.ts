import { useState, useEffect, useCallback, useRef } from 'react';

interface UseVoiceInteractionProps {
    onTranscript?: (text: string) => void;
    language?: string;
}

export const useVoiceInteraction = ({ onTranscript, language = 'pt-BR' }: UseVoiceInteractionProps = {}) => {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState('');
    
    const recognitionRef = useRef<unknown>(null);
    const synthesisRef = useRef<SpeechSynthesis>(window.speechSynthesis);

    // Inicializa SpeechRecognition
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            
            if (SpeechRecognition) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                recognitionRef.current = new SpeechRecognition();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (recognitionRef.current as any).continuous = false;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (recognitionRef.current as any).interimResults = false; 
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (recognitionRef.current as any).lang = language;

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (recognitionRef.current as any).onresult = (event: any) => {
                    const text = event.results[0][0].transcript;
                    setTranscript(text);
                    if (onTranscript) {
                        onTranscript(text);
                    }
                    setIsListening(false);
                };

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (recognitionRef.current as any).onerror = (event: any) => {
                    console.error('Speech recognition error', event.error);
                    setIsListening(false);
                };

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (recognitionRef.current as any).onend = () => {
                    setIsListening(false);
                };
            }
        }
    }, [language, onTranscript]);

    const startListening = useCallback(() => {
        if (recognitionRef.current) {
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (recognitionRef.current as any).start();
                setIsListening(true);
                setTranscript('');
            } catch (error) {
                console.error('Error starting recognition:', error);
            }
        } else {
            console.warn('Speech Recognition not supported in this browser.');
        }
    }, []);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (recognitionRef.current as any).stop();
            setIsListening(false);
        }
    }, []);

    const speak = useCallback((text: string) => {
        if (!synthesisRef.current) return;

        // Cancela fala anterior
        synthesisRef.current.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        utterance.rate = 1.0; // Velocidade normal
        utterance.pitch = 1.0; // Tom normal

        // Tenta encontrar uma voz feminina/suave em Português
        const voices = synthesisRef.current.getVoices();
        const ptVoice = voices.find(v => v.lang.includes('pt') && (v.name.includes('Google') || v.name.includes('Luciana')));
        if (ptVoice) utterance.voice = ptVoice;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        synthesisRef.current.speak(utterance);
    }, [language]);

    const cancelSpeech = useCallback(() => {
        if (synthesisRef.current) {
            synthesisRef.current.cancel();
            setIsSpeaking(false);
        }
    }, []);

    return {
        isListening,
        isSpeaking,
        transcript,
        startListening,
        stopListening,
        speak,
        cancelSpeech
    };
};
