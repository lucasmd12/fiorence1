// ARQUIVO: src/static/src/components/voice-command/hooks/useSpeechRecognition.js (VERSÃO 2 - MAIS ROBUSTA)

import { useState, useEffect, useRef, useCallback } from 'react';
import { initializeSpeechRecognition, startRecognition, stopRecognition } from '../services/SpeechRecognitionService';

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);
  const onResultCallbackRef = useRef(null);

  useEffect(() => {
    const handleResult = (event) => {
      const speechResult = event.results[0][0].transcript;
      setTranscript(speechResult);
      if (onResultCallbackRef.current) {
        onResultCallbackRef.current(speechResult);
      }
    };

    const handleError = (event) => {
      // Ignora o erro 'no-speech' que acontece quando o usuário não fala nada.
      if (event.error === 'no-speech') {
        console.warn('Nenhuma fala detectada.');
      } else {
        setError('Erro no reconhecimento de voz.');
      }
      setIsListening(false);
    };

    const handleStart = () => {
      setIsListening(true);
      setError('');
      setTranscript('');
    };

    const handleEnd = () => {
      setIsListening(false);
      onResultCallbackRef.current = null; // Limpa o callback no final.
    };

    try {
      recognitionRef.current = initializeSpeechRecognition(handleResult, handleError, handleStart, handleEnd);
    } catch (e) {
      setError('Reconhecimento de voz não suportado neste navegador.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []); // Sem dependências, executa apenas uma vez.

  const startListening = useCallback((onResultCallback) => {
    if (recognitionRef.current && !isListening) {
      onResultCallbackRef.current = onResultCallback;
      startRecognition(recognitionRef.current);
    } else if (!recognitionRef.current) {
      setError('Reconhecimento de voz não pode ser iniciado.');
    }
  }, [isListening]); // Depende de 'isListening' para não iniciar duas vezes.

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      stopRecognition(recognitionRef.current);
    }
  }, [isListening]);

  return { isListening, transcript, error, startListening, stopListening, setError, setTranscript };
};
