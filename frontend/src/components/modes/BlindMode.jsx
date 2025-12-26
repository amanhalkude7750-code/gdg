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
    const { transcript, resetTranscript, isListening, startListening, stopListening, hasSupport } = useSpeechRecognition();

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
        // If we stop manually, ensure we are listening
        startListening(true);
    }, [startListening]);

    // AUDIO ENGINE REFACTOR: Turn-Taking Architecture
    // 1. System Speaks (Mic OFF)
    // 2. System Finishes Speaking (Mic ON)
    // 3. User Speaks (Mic Active)
    // 4. System Processes (Mic OFF)

    const speak = useCallback((text) => {
        // Stop listening while speaking to prevent self-hearing and browser conflicts
        stopListening();
        setIsPlaying(true);

        // Cancel any current speech
        if (synth.current.speaking) {
            synth.current.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onend = () => {
            setIsPlaying(false);
            // TURN MIC BACK ON
            console.log("Speech finished, listening for command...");
            startListening(true);
        };

        speechUtterance.current = utterance;
        synth.current.speak(utterance);
    }, [stopListening, startListening]);

    // TASK 5B.0: Mode Isolation - Ensure clean start
    useEffect(() => {
        console.log("Blind Mode Activated");

        // Start the cycle with the intro
        // "Speak" will auto-trigger "Listen" when done.
        const timer = setTimeout(() => {
            speak("Blind mode activated. I am listening. Say Next, Back, or Read.");
        }, 500);

        return () => {
            console.log("Blind Mode Deactivated: Cleanup");
            if (synth.current) synth.current.cancel();
            stopListening();
            clearTimeout(timer);
        };
    }, []); // Empty dependency array to run once on mount


    // TASK 5B.2: Command Parser (Deterministic)
    useEffect(() => {
        if (!transcript) return;

        const cmd = transcript.trim().toUpperCase();
        console.log("Transcript Received:", cmd);

        // We look for keywords anywhere in the string to be more robust
        let commandAction = null;

        if (cmd.includes("NEXT") || cmd.includes("FORWARD") || cmd.includes("GO")) commandAction = "NEXT";
        else if (cmd.includes("BACK") || cmd.includes("PREVIOUS")) commandAction = "BACK";
        else if (cmd.includes("READ") || cmd.includes("REPEAT") || cmd.includes("AGAIN")) commandAction = "READ";
        else if (cmd.includes("STOP") || cmd.includes("QUIET")) commandAction = "STOP";

        if (commandAction) {
            console.log("Parsed Command:", commandAction);
            // RESET TRANSCRIPT IMMEDIATELY so we can detect the same command again
            transcript.includes(commandAction) && resetTranscript();

            // Simple State Machine
            switch (commandAction) {
                case "READ":
                    setLastCommand("READ");
                    speak("Reading current section. " + LESSON_CONTENT[currentSection].text);
                    break;
                case "NEXT":
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
                    setLastCommand("STOP");
                    stopSpeaking();
                    break;
                default:
                    break;
            }
        }
    }, [transcript, currentSection, speak, stopSpeaking, resetTranscript]);


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
            <footer className="grid grid-cols-2 gap-4 mt-8">
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
