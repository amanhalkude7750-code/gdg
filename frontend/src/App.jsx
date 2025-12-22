import React from 'react';
import { useMode } from './context/ModeContext';
import { MODES } from './constants/modes';
import HomeMode from './components/modes/HomeMode';
import DeafMode from './components/modes/DeafMode';
import BlindMode from './components/modes/BlindMode';
import MotorMode from './components/modes/MotorMode';

function App() {
  const { activeMode } = useMode();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {activeMode === MODES.HOME && <HomeMode />}
      {activeMode === MODES.DEAF && <DeafMode />}
      {activeMode === MODES.BLIND && <BlindMode />}
      {activeMode === MODES.MOTOR && <MotorMode />}
    </div>
  );
}

export default App;
