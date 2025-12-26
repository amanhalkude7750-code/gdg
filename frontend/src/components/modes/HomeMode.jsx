import React from 'react';
import { useMode } from '../../context/ModeContext';
import { MODES } from '../../constants/modes';
import { Ear, Eye, Activity, ArrowRight, Zap, Shield, Heart } from 'lucide-react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

const HomeMode = () => {
    const { switchMode } = useMode();
    const { transcript, isListening, startListening, stopListening, hasSupport } = useSpeechRecognition();

    // AUDIO & KEYBOARD & VOICE ENTRY LOGIC
    React.useEffect(() => {
        const welcomeMessage = "Hello. I am Access AI. Tell me what you need, or press Space for Blind Mode.";

        const speak = (text) => {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.rate = 1.0;
                window.speechSynthesis.speak(utterance);
            }
        };

        // Speak intro and start "Alexa" mode (continuous listening)
        speak(welcomeMessage);
        startListening(true); // Continuous = true

        const handleInteraction = () => {
            // Ensure AudioContext is unlocked for both Mic and TTS
            if (!isListening) startListening(true);
        };

        const handleKeyDown = (e) => {
            handleInteraction();
            // Global Shortcuts
            switch (e.key) {
                case ' ': // Spacebar
                case 'Enter':
                    e.preventDefault();
                    speak("Starting Blind Mode.");
                    switchMode(MODES.BLIND);
                    break;
                case '1':
                case 'd': // Fallback shorthand
                case 'D':
                    speak("Starting Sign Language Mode.");
                    switchMode(MODES.DEAF);
                    break;
                case '2':
                case 'm':
                case 'M':
                    speak("Starting Motor Control.");
                    switchMode(MODES.MOTOR);
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('click', handleInteraction);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('click', handleInteraction);
            stopListening(); // Important: Stop the continuous loop on unmount
        };
    }, [switchMode, startListening, stopListening]);

    // VOICE COMMAND PARSER (ALEXA STYLE)
    React.useEffect(() => {
        if (!transcript) return;

        // Simple logic: If pause is detected or specific keywords found, execute.
        const cmd = transcript.toLowerCase();

        // We only act if the command is "complete" enough or contains "mode"
        // In a real Alexa app, we'd wait for silence, but here we scan stream.

        const speakAndSwitch = (msg, mode) => {
            stopListening(); // Stop listening so we don't hear ourself
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(msg);
                utterance.onend = () => switchMode(mode);
                window.speechSynthesis.speak(utterance);
            } else {
                switchMode(mode);
            }
        };

        if (cmd.includes("blind mode") || (cmd.includes("activate") && cmd.includes("blind"))) {
            console.log("Command Recognized: BLIND");
            speakAndSwitch("Okay, activating Blind Mode.", MODES.BLIND);
        }
        else if (cmd.includes("sign mode") || cmd.includes("deaf mode")) {
            console.log("Command Recognized: DEAF");
            speakAndSwitch("Understood. Opening Sign Language Translation.", MODES.DEAF);
        }
        else if (cmd.includes("motor mode") || cmd.includes("pilot mode") || cmd.includes("head tracking")) {
            console.log("Command Recognized: MOTOR");
            speakAndSwitch("Sure. Initializing Head Tracking Interface.", MODES.MOTOR);
        }
    }, [transcript, switchMode, stopListening]);

    const ModeCard = ({ mode, title, subtitle, icon: Icon, colorClass, delay }) => (
        <button
            onClick={() => switchMode(mode)}
            className={`
                group relative overflow-hidden rounded-3xl p-8 text-left transition-all duration-500 hover:scale-105
                bg-white/5 backdrop-blur-lg border border-white/10 hover:border-white/20 hover:shadow-2xl
                flex flex-col justify-between h-[320px] w-full
                animate-in fade-in slide-in-from-bottom-8 fill-mode-backwards
            `}
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Background Gradient Blob */}
            <div className={`absolute -right-20 -top-20 w-64 h-64 rounded-full opacity-20 blur-3xl transition-opacity group-hover:opacity-40 ${colorClass}`}></div>

            <div className="relative z-10">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-500`}>
                    <Icon size={32} className="text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2 tracking-tight group-hover:translate-x-1 transition-transform">{title}</h2>
                <p className="text-gray-400 font-medium leading-relaxed">{subtitle}</p>
            </div>

            <div className="relative z-10 flex items-center justify-between mt-8 pt-6 border-t border-white/5">
                <span className="text-sm font-bold tracking-widest text-gray-500 uppercase group-hover:text-white transition-colors">Launch Mode</span>
                <span className="p-3 rounded-full bg-white/5 group-hover:bg-white text-white group-hover:text-black transition-all duration-300">
                    <ArrowRight size={20} />
                </span>
            </div>
        </button>
    );

    return (
        <div className="min-h-screen bg-[#050505] relative overflow-hidden font-sans selection:bg-blue-500/30">
            {/* Ambient Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="relative z-10 container mx-auto px-6 py-12 flex flex-col min-h-screen justify-center">
                {/* Header */}
                <div className="text-center mb-20 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-in fade-in zoom-in duration-700">
                        <Zap size={16} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-bold text-gray-300 tracking-wide">ACCESS AI · HACKATHON BUILD</span>
                        {isListening && (
                            <span className="flex items-center gap-2 ml-4 text-red-400 animate-pulse border-l border-white/10 pl-4">
                                🔴 Listening for commands...
                            </span>
                        )}
                    </div>
                    <h1 className="text-6xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
                        Bridge the gap.<br />
                        <span className="text-white">Empower everyone.</span>
                    </h1>
                    <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto">
                        An adaptive AI interface designed to break communication barriers.
                        Select your preferred mode to experience accessibility reimagined.
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto w-full px-4">
                    <ModeCard
                        mode={MODES.DEAF}
                        title="Sign Translate"
                        subtitle="Real-time two-way communication using AI hand tracking and gesture recognition."
                        icon={Ear}
                        colorClass="bg-blue-500"
                        delay={100}
                    />
                    <ModeCard
                        mode={MODES.BLIND}
                        title="Voice Navigator"
                        subtitle="Complete auditory interface with neuro-voice feedback and sonic spatial awareness."
                        icon={Eye}
                        colorClass="bg-green-500"
                        delay={200}
                    />
                    <ModeCard
                        mode={MODES.MOTOR}
                        title="Pilot Control"
                        subtitle="Hands-free navigation via head tracking and gaze interaction."
                        icon={Activity}
                        colorClass="bg-rose-500"
                        delay={300}
                    />
                </div>

                {/* Footer */}
                <footer className="mt-24 text-center border-t border-white/5 pt-8">
                    <p className="text-gray-600 flex items-center justify-center gap-2 text-sm font-medium">
                        Built with <Heart size={16} className="text-red-500 fill-red-500 animate-pulse" /> for a More Inclusive World
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default HomeMode;
