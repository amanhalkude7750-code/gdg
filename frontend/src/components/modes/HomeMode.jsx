import React from 'react';
import { useMode } from '../../context/ModeContext';
import { MODES } from '../../constants/modes';

const HomeMode = () => {
    const { switchMode } = useMode();
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
            <h1 className="text-4xl font-bold mb-8 text-blue-400">ACCESS-AI Interface</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                <button
                    onClick={() => switchMode(MODES.DEAF)}
                    className="p-8 bg-gray-800 rounded-xl hover:bg-gray-700 transition border-2 border-transparent hover:border-blue-500"
                >
                    <h2 className="text-2xl font-bold mb-2">Deaf-Mute Mode</h2>
                    <p className="text-gray-400">Sign Language Translation</p>
                </button>

                <button
                    onClick={() => switchMode(MODES.BLIND)}
                    className="p-8 bg-gray-800 rounded-xl hover:bg-gray-700 transition border-2 border-transparent hover:border-green-500"
                >
                    <h2 className="text-2xl font-bold mb-2">Blind Mode</h2>
                    <p className="text-gray-400">Voice-First Navigation</p>
                </button>

                <button
                    onClick={() => switchMode(MODES.MOTOR)}
                    className="p-8 bg-gray-800 rounded-xl hover:bg-gray-700 transition border-2 border-transparent hover:border-purple-500"
                >
                    <h2 className="text-2xl font-bold mb-2">Motor Mode</h2>
                    <p className="text-gray-400">Head Gesture Control</p>
                </button>
            </div>
        </div>
    );
};

export default HomeMode;
