import { Link } from 'react-router-dom';
// other imports
// ...

const BlindMode = () => {
    // const { switchMode } = useMode(); // Removed
    // ...

    return (
        <div className="min-h-screen bg-black text-yellow-400 p-8 flex flex-col font-mono">
            {/* Header - High Contrast */}
            <header className="flex items-center justify-between mb-8 border-b-2 border-yellow-600 pb-4">
                <Link
                    to="/"
                    className="flex items-center gap-2 text-yellow-400 hover:text-white transition uppercase font-bold tracking-widest"
                >
                    <ArrowLeft size={32} />
                    Back
                </Link>
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
