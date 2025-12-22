import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { useMode } from '../../context/ModeContext';
import { MODES } from '../../constants/modes';
import { ArrowLeft, RefreshCw, X, ArrowRight, Volume2, Mic, MicOff, AlertCircle } from 'lucide-react';
import { useHandSignRecognition } from '../../hooks/useHandSignRecognition';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { reconstructSentence } from '../../services/TranslationService';

const DeafMode = () => {
    const { switchMode } = useMode();
    const { tokens, addToken, clearTokens } = useHandSignRecognition();
    const { transcript, isListening, startListening, stopListening, hasSupport: hasSTT } = useSpeechRecognition();

    const [predictedSentence, setPredictedSentence] = useState("");
    const [isTranslating, setIsTranslating] = useState(false);
    const [translationError, setTranslationError] = useState(null);
    const webcamRef = useRef(null);

    useEffect(() => {
        console.log("Deaf Mode Activated");
        return () => console.log("Deaf Mode Deactivated");
    }, []);

    const speakCheck = (text) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleTranslate = async () => {
        if (tokens.length === 0) return;
        setIsTranslating(true);
        setTranslationError(null);
        try {
            const result = await reconstructSentence(tokens);
            setPredictedSentence(result);
            // Auto-speak result (TTS)
            speakCheck(result);
        } catch (e) {
            if (e.message === "LOW_CONFIDENCE") {
                setTranslationError("Not sure. Please repeat signs clearly.");
            } else {
                setPredictedSentence("Error in translation.");
            }
        } finally {
            setIsTranslating(false);
        }
    };

    // Auto-translate debounce
    useEffect(() => {
        if (tokens.length > 0) {
            const timer = setTimeout(() => handleTranslate(), 1000);
            return () => clearTimeout(timer);
        } else {
            setPredictedSentence("");
            setTranslationError(null);
        }
    }, [tokens]);

    const SIMULATED_SIGNS = ["ME", "WATER", "WANT", "HELP", "PLEASE", "THANK YOU", "HELLO", "DEAF"];

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 lg:p-6 flex flex-col font-sans">
            {/* Header */}
            <header className="flex items-center justify-between mb-4 border-b border-gray-700 pb-4">
                <button
                    onClick={() => switchMode(MODES.HOME)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition"
                >
                    <ArrowLeft size={24} />
                    <span>Back</span>
                </button>
                <div className="text-center">
                    <h1 className="text-xl lg:text-2xl font-bold text-blue-400">Deaf-Mute Translation</h1>
                    <span className="text-xs text-blue-500/60 uppercase tracking-widest">Two-Way Communication</span>
                </div>
                <div className="w-20"></div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full flex-1">

                {/* --- LEFT COLUMN: INPUTS & HEARING RECEIVER --- */}
                <div className="flex flex-col gap-4">

                    {/* 1. Camera Input */}
                    <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700 shadow-xl relative overflow-hidden">
                        <div className="bg-black rounded-xl overflow-hidden relative flex items-center justify-center h-[280px]">
                            <Webcam
                                ref={webcamRef}
                                className="absolute inset-0 w-full h-full object-cover opacity-80"
                                mirrored={true}
                            />
                            <div className="absolute top-4 left-4 bg-green-900/80 px-3 py-1 rounded text-green-300 text-xs font-mono flex items-center gap-2 border border-green-700">
                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                CAMERA ACTIVE
                            </div>
                        </div>
                    </div>

                    {/* 2. Hearing Reply Section (TASK 5A.6) */}
                    <div className="bg-gradient-to-br from-indigo-900/40 to-gray-800 rounded-2xl p-6 border border-indigo-500/30 flex-1 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold flex items-center gap-2 text-indigo-300">
                                <Volume2 size={24} />
                                Hearing Person Says:
                            </h2>
                            {hasSTT ? (
                                <button
                                    onClick={isListening ? stopListening : startListening}
                                    className={`
                                        flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all
                                        ${isListening
                                            ? 'bg-red-500 hover:bg-red-600 animate-pulse text-white shadow-red-500/50 shadow-lg'
                                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg'}
                                    `}
                                >
                                    {isListening ? <><MicOff size={18} /> STOP LISTENING</> : <><Mic size={18} /> LISTEN TO REPLY</>}
                                </button>
                            ) : (
                                <span className="text-red-400 text-xs border border-red-500/50 px-2 py-1 rounded">STT Not Supported</span>
                            )}
                        </div>

                        <div className="flex-1 bg-black/40 rounded-xl p-6 border-2 border-indigo-500/20 overflow-y-auto min-h-[150px] flex items-center justify-center text-center">
                            {isListening && !transcript ? (
                                <span className="text-indigo-400 animate-pulse text-xl">Listening...</span>
                            ) : transcript ? (
                                <p className="text-3xl font-bold text-white leading-snug">{transcript}</p>
                            ) : (
                                <p className="text-gray-500 text-lg">Tap "Listen" to capture speech from hearing person.</p>
                            )}
                        </div>
                    </div>

                    {/* 3. Simulation Palette */}
                    <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
                        <div className="flex justify-between items-center mb-3">
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Sign Simulation Palette</p>
                            <button onClick={clearTokens} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                                <RefreshCw size={12} /> RESET
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {SIMULATED_SIGNS.map((sign) => (
                                <button
                                    key={sign}
                                    onClick={() => addToken(sign)}
                                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg hover:bg-blue-600 hover:border-blue-500 text-sm text-white transition active:scale-95"
                                >
                                    {sign}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>


                {/* --- RIGHT COLUMN: TRANSLATION OUTPUT --- */}
                <div className="bg-gray-800 rounded-2xl p-6 flex flex-col border border-gray-700 relative h-full">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                        My Output (Voice)
                    </h2>

                    {/* A. Token Buffer */}
                    <div className="mb-4 flex-1 max-h-[40%] overflow-hidden flex flex-col">
                        <h3 className="text-xs text-gray-400 mb-2 uppercase font-bold">Recognized Signs</h3>
                        <div className="bg-black/30 w-full rounded-xl p-4 border border-gray-700 overflow-y-auto flex-1 flex flex-wrap content-start gap-4">
                            {tokens.length === 0 && <span className="text-gray-600 italic">Start signing...</span>}
                            {tokens.map((t, index) => (
                                <div key={index} className="relative group">
                                    <div className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 shadow flex flex-col items-center">
                                        <span className="font-bold text-lg">{t.token}</span>
                                        {/* Confidence Bar */}
                                        <div className="w-full h-1 bg-black/40 mt-1 rounded-full">
                                            <div
                                                className={`h-full ${t.confidence > 0.8 ? 'bg-green-400' : 'bg-yellow-500'}`}
                                                style={{ width: `${t.confidence * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                    {index < tokens.length - 1 && (
                                        <ArrowRight className="absolute -right-5 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-center my-2">
                        <ArrowRight className="rotate-90 text-gray-600" />
                    </div>

                    {/* B. Final Sentence (TASK 5A.4) */}
                    <div className="flex-1 bg-blue-900/20 rounded-2xl p-6 border border-blue-500/30 flex flex-col items-center justify-center text-center relative">
                        {isTranslating && (
                            <div className="absolute top-4 right-4 text-blue-400 animate-spin">
                                <RefreshCw size={18} />
                            </div>
                        )}

                        {translationError ? (
                            // TASK 5A.7 Error UI
                            <div className="flex flex-col items-center text-yellow-400 animate-pulse">
                                <AlertCircle size={48} className="mb-2" />
                                <p className="text-xl font-medium">{translationError}</p>
                            </div>
                        ) : (
                            <>
                                <p className="text-sm text-blue-400 uppercase tracking-widest mb-4">Speaking to Hearing Person</p>
                                <p className={`text-4xl lg:text-5xl font-bold leading-tight ${predictedSentence ? 'text-white' : 'text-gray-600'}`}>
                                    {predictedSentence || "..."}
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeafMode;
