import { useState, useEffect, useCallback } from 'react';

export const useSpeechRecognition = () => {
    const [transcript, setTranscript] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState(null);
    const [recognition, setRecognition] = useState(null);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setError("Browser does not support Speech Recognition.");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognitionInstance = new SpeechRecognition();

        recognitionInstance.continuous = false; // Stop after one sentence for clearer turn-taking
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'en-US';

        recognitionInstance.onstart = () => setIsListening(true);
        recognitionInstance.onend = () => setIsListening(false);

        recognitionInstance.onresult = (event) => {
            const currentTranscript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');
            setTranscript(currentTranscript);
        };

        recognitionInstance.onerror = (event) => {
            console.error("Speech Recognition Error:", event.error);
            setError(`Error: ${event.error}`);
            setIsListening(false);
        };

        setRecognition(recognitionInstance);

        return () => {
            recognitionInstance.stop();
        };
    }, []);

    const startListening = useCallback(() => {
        setTranscript('');
        setError(null);
        if (recognition) {
            try {
                recognition.start();
            } catch (e) {
                console.error("Started too fast", e);
            }
        }
    }, [recognition]);

    const stopListening = useCallback(() => {
        if (recognition) recognition.stop();
    }, [recognition]);

    return {
        transcript,
        isListening,
        error,
        startListening,
        stopListening,
        hasSupport: !!recognition
    };
};
