import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useMode } from '../../context/ModeContext';
import { MODES } from '../../constants/modes';
import { ArrowLeft, Mic, MicOff, Volume2, SkipForward, SkipBack } from 'lucide-react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

// Mock Lesson Data
const LESSON_CONTENT = [
    { title: "Introduction", text: "Welcome to Access AI. This is the Blind Mode. Navigation is voice-controlled." },
    { title: "Chapter 1", text: "To navigate, say Next to go forward, or Back to go to the previous section." },
    { title: "Chapter 2", text: "You can say Read to repeat the current section, or Stop to silence the audio." },
    { title: "Conclusion", text: "You have reached the end of the lesson. Good job." }
];

const BlindMode = () => {
    const { switchMode } = useMode();
    // TASK 5B.1: Voice Input Engine
    const { transcript, isListening, startListening, stopListening, hasSupport } = useSpeechRecognition();

    // Content State
    const [currentSection, setCurrentSection] = useState(0);
    const [lastCommand, setLastCommand] = useState("");
    const [isPlaying, setIsPlaying] = useState(false);

    // Audio Engine Ref
    const synth = useRef(window.speechSynthesis);
    const speechUtterance = useRef(null);

    const stopSpeaking = useCallback(() => {
        if (synth.current.speaking) {
            synth.current.cancel();
        }
        setIsPlaying(false);
    }, []);

    const speak = useCallback((text) => {
        if (synth.current.speaking) {
            synth.current.cancel();
        }
        setIsPlaying(true);

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9; // Calm, medium speed
        utterance.pitch = 1.0;

        utterance.onend = () => setIsPlaying(false);

        speechUtterance.current = utterance;
        synth.current.speak(utterance);
    }, []);

    // TASK 5B.0: Mode Isolation - Ensure clean start
    useEffect(() => {
        console.log("Blind Mode Activated");

        // Auto-read title (Task 5B.3 & 5B.5)
        // Delay slightly to ensure load
        const timer = setTimeout(() => {
            speak("Blind mode activated. Say Read to begin. " + LESSON_CONTENT[0].text);
        }, 500);

        return () => {
            console.log("Blind Mode Deactivated: Cleanup");
            stopSpeaking();
            stopListening(); // Ensure specific listener is off
            clearTimeout(timer);
        };
    }, [speak, stopSpeaking, stopListening]);


    // TASK 5B.2: Command Parser (Deterministic)
    useEffect(() => {
        if (!transcript) return;

        const commandParts = transcript.trim().toUpperCase().split(" ");
        const command = commandParts[commandParts.length - 1]; // Take last word

        console.log("Parsed Command:", command);

        // Simple State Machine
        switch (command) {
            case "READ":
            case "REPEAT":
            case "AGAIN":
                setLastCommand("READ");
                speak("Reading current section. " + LESSON_CONTENT[currentSection].text);
                break;
            case "NEXT":
            case "FORWARD":
                setLastCommand("NEXT");
                if (currentSection < LESSON_CONTENT.length - 1) {
                    setCurrentSection(prev => {
                        const next = prev + 1;
                        speak("Moving to next section. " + LESSON_CONTENT[next].text);
                        return next;
                    });
                } else {
                    speak("No more sections. You are at the end of the lesson.");
                }
                break;
            case "BACK":
            case "PREVIOUS":
                setLastCommand("BACK");
                if (currentSection > 0) {
                    setCurrentSection(prev => {
                        const next = prev - 1;
                        speak("Moving back. " + LESSON_CONTENT[next].text);
                        return next;
                    });
                } else {
                    speak("Boundary reached. You are at the start of the lesson.");
                }
                break;
            case "STOP":
            case "QUIET":
            case "SILENCE":
                setLastCommand("STOP");
                stopSpeaking();
                break;
            default:
                break;
        }
    }, [transcript, currentSection, speak, stopSpeaking]);


    return (
        <div className="min-h-screen bg-black text-yellow-400 p-8 flex flex-col font-mono">
            {/* Header - High Contrast */}
            <header className="flex items-center justify-between mb-8 border-b-2 border-yellow-600 pb-4">
                <button
                    onClick={() => switchMode(MODES.HOME)}
                    className="flex items-center gap-2 text-yellow-400 hover:text-white transition uppercase font-bold tracking-widest"
                >
                    <ArrowLeft size={32} />
                    Back
                </button>
                <h1 className="text-3xl font-black uppercase tracking-tighter">Voice Navigator</h1>
                <div className="w-10"></div>
            </header>

            {/* Main Content Area - Large Typography */}
            <main className="flex-1 flex flex-col justify-center items-center text-center gap-12">

                {/* Audio Status Visualizer */}
                <div className={`
                    w-48 h-48 rounded-full border-4 flex items-center justify-center transition-all duration-500
                    ${isListening ? 'border-red-500 shadow-red-900/50 shadow-2xl animate-pulse' : 'border-yellow-600'}
                    ${isPlaying ? 'scale-110' : 'scale-100'}
                `}>
                    {isPlaying ? <Volume2 size={80} className="animate-bounce" /> : <Mic size={80} className={isListening ? "text-red-500" : "text-gray-600"} />}
                </div>

                {/* Text Display (for sighted assistants/debug) */}
                <div className="max-w-2xl">
                    <h2 className="text-xl text-gray-500 mb-4 uppercase">Current Section ({currentSection + 1}/{LESSON_CONTENT.length})</h2>
                    <p className="text-4xl md:text-5xl font-bold text-white leading-relaxed">
                        {LESSON_CONTENT[currentSection].text}
                    </p>
                </div>

                {/* Feedback Log */}
                <div className="h-16 flex items-center justify-center">
                    {lastCommand && (
                        <span className="px-4 py-2 bg-yellow-900/30 border border-yellow-600 text-yellow-400 rounded text-xl font-bold animate-in fade-in slide-in-from-bottom-4">
                            COMMAND RECOGNIZED: "{lastCommand}"
                        </span>
                    )}
                </div>
            </main>

            {/* Footer Controls (Large Touch Targets for Mouse Backup) */}
            <footer className="grid grid-cols-4 gap-4 mt-8">
                <button
                    onClick={() => {
                        const prev = Math.max(0, currentSection - 1);
                        setLastCommand("BACK");
                        setCurrentSection(prev);
                        speak(LESSON_CONTENT[prev].text);
                    }}
                    className="h-24 bg-gray-800 rounded-xl flex flex-col items-center justify-center hover:bg-gray-700 active:bg-yellow-600 transition"
                    aria-label="Previous Section"
                >
                    <SkipBack size={32} />
                    <span className="mt-2 font-bold">BACK</span>
                </button>

                <button
                    onClick={isListening ? stopListening : startListening}
                    className={`col-span-2 h-24 rounded-xl flex flex-col items-center justify-center transition border-4 ${isListening ? 'bg-red-900 border-red-500' : 'bg-blue-900 border-blue-500'}`}
                    aria-label={isListening ? "Stop Listening" : "Start Voice Control"}
                >
                    {isListening ? <MicOff size={32} /> : <Mic size={32} />}
                    <span className="mt-2 font-bold text-xl">{isListening ? "STOP LISTENING" : "START VOICE CONTROL"}</span>
                </button>

                <button
                    onClick={() => {
                        const next = Math.min(LESSON_CONTENT.length - 1, currentSection + 1);
                        setLastCommand("NEXT");
                        setCurrentSection(next);
                        speak(LESSON_CONTENT[next].text);
                    }}
                    className="h-24 bg-gray-800 rounded-xl flex flex-col items-center justify-center hover:bg-gray-700 active:bg-yellow-600 transition"
                    aria-label="Next Section"
                >
                    <SkipForward size={32} />
                    <span className="mt-2 font-bold">NEXT</span>
                </button>
            </footer>
        </div>
    );
};

export default BlindMode;
