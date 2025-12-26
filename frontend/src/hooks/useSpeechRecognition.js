import { useState, useEffect, useCallback } from 'react';

export const useSpeechRecognition = () => {
    const [transcript, setTranscript] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState(null);
    const [recognition, setRecognition] = useState(null);

    const [isContinuous, setIsContinuous] = useState(false);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setError("Browser does not support Speech Recognition.");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognitionInstance = new SpeechRecognition();

        recognitionInstance.continuous = false; // We handle continuity manually for better control
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'en-US';

        recognitionInstance.onstart = () => setIsListening(true);

        recognitionInstance.onend = () => {
            setIsListening(false);
            // Auto-restart if continuous mode is enabled
            if (isContinuous) {
                try {
                    recognitionInstance.start();
                } catch (e) {
                    // console.log("Restart debounce");
                }
            }
        };

        recognitionInstance.onresult = (event) => {
            const currentTranscript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');
            setTranscript(currentTranscript);
        };

        recognitionInstance.onerror = (event) => {
            console.error("Speech Recognition Error:", event.error);
            if (event.error === 'no-speech') {
                // Ignore no-speech errors in continuous mode
                return;
            }
            setError(`Error: ${event.error}`);
            setIsListening(false);
        };

        setRecognition(recognitionInstance);

        return () => {
            recognitionInstance.stop();
        };
    }, [isContinuous]);

    const startListening = useCallback((continuous = false) => {
        setTranscript('');
        setError(null);
        setIsContinuous(continuous);
        if (recognition) {
            try {
                recognition.start();
            } catch (e) {
                // console.error("Started too fast", e);
            }
        }
    }, [recognition]);

    const stopListening = useCallback(() => {
        setIsContinuous(false); // Kill the auto-restart loop
        if (recognition) recognition.stop();
    }, [recognition]);

    const resetTranscript = useCallback(() => {
        setTranscript('');
    }, []);

    return {
        transcript,
        resetTranscript,
        isListening,
        error,
        startListening,
        stopListening,
        hasSupport: !!recognition
    };
};
