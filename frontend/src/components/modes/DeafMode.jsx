import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, X, ArrowRight, Volume2, Mic, MicOff, AlertCircle } from 'lucide-react';
import { useHandSignRecognition } from '../../hooks/useHandSignRecognition';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { reconstructSentence } from '../../services/TranslationService';

const DeafMode = () => {
    // Refs
    const webcamRef = useRef(null);

    // Hooks
    const { tokens, addToken, clearTokens, isModelLoading, startDetection } = useHandSignRecognition(webcamRef);
    const { transcript, isListening, startListening, stopListening, hasSupport: hasSTT } = useSpeechRecognition();

    // State
    const [predictedSentence, setPredictedSentence] = useState("");
    const [isTranslating, setIsTranslating] = useState(false);
    const [translationError, setTranslationError] = useState(null);
    const [inputMode, setInputMode] = useState('VOICE'); // 'VOICE' or 'TEXT'
    const [textInput, setTextInput] = useState("");
    const [signOutput, setSignOutput] = useState([]);

    const handleTextToSign = () => {
        if (!textInput.trim()) return;
        const words = textInput.trim().split(/\s+/);
        setSignOutput(words);
        setTextInput("");
    };

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
                <Link
                    to="/"
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition"
                >
                    <ArrowLeft size={24} />
                    <span>Back</span>
                </Link>
                <div className="text-center">
                    <h1 className="text-xl lg:text-2xl font-bold text-blue-400">Deaf-Mute Translation</h1>
                    <span className="text-xs text-blue-500/60 uppercase tracking-widest">Two-Way Communication</span>
                </div>
                <div className="flex gap-2">
                    <Link
                        to="/deaf/learn"
                        className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2"
                    >
                        <span>🎓 Learn Signs</span>
                    </Link>
                </div>
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
                                onUserMedia={() => startDetection()}
                            />
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                {isModelLoading ? (
                                    <div className="bg-yellow-900/80 px-3 py-1 rounded text-yellow-300 text-xs font-mono flex items-center gap-2 border border-yellow-700">
                                        <RefreshCw className="animate-spin" size={12} />
                                        LOADING MODEL...
                                    </div>
                                ) : (
                                    <div className="bg-green-900/80 px-3 py-1 rounded text-green-300 text-xs font-mono flex items-center gap-2 border border-green-700">
                                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                        VISION ACTIVE
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 2. Hearing Reply Section */}
                    <div className="bg-gradient-to-br from-indigo-900/40 to-gray-800 rounded-2xl p-6 border border-indigo-500/30 flex-1 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold flex items-center gap-2 text-indigo-300">
                                <Volume2 size={24} />
                                Hearing Person Says:
                            </h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setInputMode(m => m === 'VOICE' ? 'TEXT' : 'VOICE')}
                                    className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-full transition"
                                >
                                    {inputMode === 'VOICE' ? 'Switch to Keyboard ⌨️' : 'Switch to Voice 🎤'}
                                </button>
                                {inputMode === 'VOICE' && hasSTT && (
                                    <button
                                        onClick={isListening ? stopListening : startListening}
                                        className={`flex items-center gap-2 px-4 py-1 rounded-full font-bold transition-all text-sm ${isListening ? 'bg-red-500 hover:bg-red-600 animate-pulse text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
                                    >
                                        {isListening ? <><MicOff size={14} /> STOP</> : <><Mic size={14} /> LISTEN</>}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 bg-black/40 rounded-xl p-6 border-2 border-indigo-500/20 overflow-y-auto min-h-[150px] flex flex-col justify-center">
                            {inputMode === 'VOICE' ? (
                                <div className="text-center">
                                    {isListening && !transcript ? (
                                        <span className="text-indigo-400 animate-pulse text-xl">Listening...</span>
                                    ) : transcript ? (
                                        <p className="text-3xl font-bold text-white leading-snug">{transcript}</p>
                                    ) : (
                                        <p className="text-gray-500 text-lg">Tap "Listen" to capture speech.</p>
                                    )}
                                </div>
                            ) : (
                                <div className="w-full h-full flex flex-col gap-4">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={textInput}
                                            onChange={(e) => setTextInput(e.target.value)}
                                            placeholder="Type message..."
                                            className="flex-1 bg-gray-700 border-gray-600 text-white rounded-lg px-4 py-2 outline-none"
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleTextToSign(); }}
                                        />
                                        <button onClick={handleTextToSign} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold">Translate</button>
                                    </div>
                                    {signOutput.length > 0 && (
                                        <div className="flex-1 bg-indigo-900/30 rounded-lg p-2 border border-indigo-500/30 overflow-x-auto whitespace-nowrap">
                                            <div className="flex gap-2 pb-2">
                                                {signOutput.map((word, i) => (
                                                    <div key={i} className="flex flex-col items-center">
                                                        <div className="w-24 h-24 bg-gradient-to-t from-gray-200 to-gray-100 rounded-lg border-2 border-indigo-400 flex items-center justify-center shadow-lg relative overflow-hidden group">
                                                            <span className="text-4xl select-none group-hover:scale-110 transition">👋</span>
                                                            <div className="absolute bottom-0 w-full bg-indigo-600 text-white text-[10px] text-center py-1">SIGNS "{word.toUpperCase()}"</div>
                                                        </div>
                                                        <span className="text-xs mt-1 text-gray-300 font-mono">{word}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 3. Simulation Palette */}
                    <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
                        <div className="flex justify-between items-center mb-3">
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Sign Simulation Palette</p>
                            <button onClick={clearTokens} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"><RefreshCw size={12} /> RESET</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {SIMULATED_SIGNS.map((sign) => (
                                <button key={sign} onClick={() => addToken(sign)} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white transition active:scale-95">{sign}</button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: TRANSLATION OUTPUT --- */}
                <div className="bg-gray-800 rounded-2xl p-6 flex flex-col border border-gray-700 relative h-full">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2"><span className="w-1 h-6 bg-blue-500 rounded-full"></span> My Output (Voice)</h2>
                    <div className="mb-4 flex-1 max-h-[40%] overflow-hidden flex flex-col">
                        <div className="bg-black/30 w-full rounded-xl p-4 border border-gray-700 overflow-y-auto flex-1 flex flex-wrap content-start gap-4">
                            {tokens.length === 0 && <span className="text-gray-600 italic">Start signing...</span>}
                            {tokens.map((t, index) => (
                                <div key={index} className="relative group">
                                    <div className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 shadow flex flex-col items-center">
                                        <span className="font-bold text-lg">{t.token}</span>
                                        <div className="w-full h-1 bg-black/40 mt-1 rounded-full">
                                            <div className={`h-full ${t.confidence > 0.8 ? 'bg-green-400' : 'bg-yellow-500'}`} style={{ width: `${t.confidence * 100}%` }} />
                                        </div>
                                    </div>
                                    {index < tokens.length - 1 && <ArrowRight className="absolute -right-5 top-1/2 -translate-y-1/2 text-gray-600" size={16} />}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-center my-2"><ArrowRight className="rotate-90 text-gray-600" /></div>
                    <div className="flex-1 bg-blue-900/20 rounded-2xl p-6 border border-blue-500/30 flex flex-col items-center justify-center text-center relative">
                        {isTranslating && <div className="absolute top-4 right-4 text-blue-400 animate-spin"><RefreshCw size={18} /></div>}
                        {translationError ? (
                            <div className="flex flex-col items-center text-yellow-400 animate-pulse">
                                <AlertCircle size={48} className="mb-2" />
                                <p className="text-xl font-medium">{translationError}</p>
                            </div>
                        ) : (
                            <>
                                <p className="text-sm text-blue-400 uppercase tracking-widest mb-4">Speaking to Hearing Person</p>
                                <p className={`text-4xl lg:text-5xl font-bold leading-tight ${predictedSentence ? 'text-white' : 'text-gray-600'}`}>{predictedSentence || "..."}</p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeafMode;
