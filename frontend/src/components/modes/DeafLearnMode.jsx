import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, HelpCircle, Trophy, Sparkles } from 'lucide-react';
import { useHandSignRecognition } from '../../hooks/useHandSignRecognition';

const CURRICULUM = [
    {
        id: 'basics',
        title: 'Basic Communication',
        description: 'Learn essential daily gestures.',
        lessons: [
            { id: 'l1', target: 'HELLO', label: 'Hello / Open Palm', hint: "Show an open palm to the camera." },
            { id: 'l2', target: 'YES', label: 'Yes / Thumbs Up', hint: "Give a thumbs up!" },
            { id: 'l3', target: 'NO', label: 'No / Thumbs Down', hint: "Give a thumbs down." },
            { id: 'l4', target: 'I LOVE YOU', label: 'I Love You', hint: "Raise thumb, index, and pinky fingers." },
            { id: 'l5', target: 'PEACE', label: 'Peace / Victory', hint: "Show the peace sign (V)." },
            { id: 'l6', target: 'STOP', label: 'Stop / Fist', hint: "Show a closed fist." },
        ]
    }
];

const DeafLearnMode = () => {
    const webcamRef = useRef(null);
    const { tokens, isModelLoading, startDetection } = useHandSignRecognition(webcamRef);

    const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
    const [isLessonComplete, setIsLessonComplete] = useState(false);
    const [feedback, setFeedback] = useState("Waiting for gesture...");
    const [score, setScore] = useState(0);

    const currentLesson = CURRICULUM[0].lessons[currentLessonIndex];
    const isFinished = currentLessonIndex >= CURRICULUM[0].lessons.length;

    useEffect(() => {
        if (!isLessonComplete && !isFinished && tokens.length > 0) {
            const lastToken = tokens[tokens.length - 1];
            // Check if the recognized token matches the target
            if (lastToken.token === currentLesson.target) {
                handleSuccess();
            }
        }
    }, [tokens, isLessonComplete, isFinished, currentLesson]);

    const handleSuccess = () => {
        setIsLessonComplete(true);
        setScore(s => s + 100);
        setFeedback("Perfect! Existing...");
        const audio = new Audio('/success-chime.mp3'); // Fallback if missing?
        // audio.play().catch(e => console.log("No audio")); 

        setTimeout(() => {
            if (currentLessonIndex < CURRICULUM[0].lessons.length - 1) {
                setCurrentLessonIndex(prev => prev + 1);
                setIsLessonComplete(false);
                setFeedback("Waiting for gesture...");
            } else {
                setCurrentLessonIndex(prev => prev + 1); // Triggers finished state
            }
        }, 2000);
    };

    const restart = () => {
        setCurrentLessonIndex(0);
        setIsLessonComplete(false);
        setScore(0);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 font-sans flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between mb-6">
                <Link
                    to="/deaf"
                    className="p-2 hover:bg-gray-800 rounded-full transition"
                >
                    <ArrowLeft className="text-gray-400" />
                </Link>
                <div className="flex flex-col items-center">
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                        Sign School
                    </h1>
                    <span className="text-xs text-gray-500">Interactive Lessons</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
                    <Trophy size={14} className="text-yellow-400" />
                    <span className="text-sm font-bold text-yellow-100">{score} xp</span>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center max-w-md mx-auto w-full">

                {isFinished ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center animate-fadeIn">
                        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.5)]">
                            <Trophy size={48} className="text-white" />
                        </div>
                        <h2 className="text-3xl font-bold mb-2">Detailed Complete!</h2>
                        <p className="text-gray-400 mb-8">You've mastered the basics.</p>
                        <button
                            onClick={restart}
                            className="bg-white text-gray-900 px-8 py-3 rounded-full font-bold hover:scale-105 transition"
                        >
                            Start Again
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Target Card */}
                        <div className="w-full bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-6 rounded-3xl border border-white/10 mb-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                                <Sparkles size={100} />
                            </div>

                            <div className="text-center relative z-10">
                                <p className="text-sm text-purple-300 uppercase tracking-widest mb-2">Perform this sign</p>
                                <h2 className="text-4xl font-black text-white mb-2 tracking-tight">
                                    {currentLesson.target}
                                </h2>
                                <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
                                    <HelpCircle size={14} />
                                    {currentLesson.hint}
                                </p>
                            </div>
                        </div>

                        {/* Camera Area */}
                        <div className="relative w-full aspect-[4/3] bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-800">
                            <Webcam
                                ref={webcamRef}
                                className={`w-full h-full object-cover transition-opacity duration-500 ${isLessonComplete ? 'opacity-50 blur-sm' : 'opacity-100'}`}
                                mirrored={true}
                                onUserMedia={() => startDetection()}
                            />

                            {/* Overlay Feedback */}
                            {isLessonComplete && (
                                <div className="absolute inset-0 flex items-center justify-center z-20">
                                    <div className="bg-green-500 text-white rounded-full p-6 shadow-lg animate-bounce">
                                        <CheckCircle size={64} />
                                    </div>
                                </div>
                            )}

                            {/* Loading State */}
                            {isModelLoading && (
                                <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-30">
                                    <p className="text-white animate-pulse">Loading AI Teacher...</p>
                                </div>
                            )}
                        </div>

                        {/* Instruction Footer */}
                        <div className="mt-6 text-center">
                            <p className={`text-lg transition-colors duration-300 ${isLessonComplete ? 'text-green-400 font-bold' : 'text-gray-500'}`}>
                                {isLessonComplete ? "Excellent!" : "Camera is watching..."}
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DeafLearnMode;
