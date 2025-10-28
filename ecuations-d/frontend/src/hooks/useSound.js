import { useRef, useCallback } from 'react';

export const useSound = () => {
  const audioRef = useRef(null);

  const playSound = useCallback((soundType) => {
    // Crear sonidos usando Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    let frequency, duration, type;
    
    switch (soundType) {
      case 'click':
        frequency = 800;
        duration = 0.1;
        type = 'sine';
        break;
      case 'success':
        frequency = 600;
        duration = 0.3;
        type = 'sine';
        break;
      case 'error':
        frequency = 300;
        duration = 0.5;
        type = 'sawtooth';
        break;
      case 'hover':
        frequency = 1000;
        duration = 0.05;
        type = 'sine';
        break;
      case 'levelComplete':
        // Sonido de victoria con múltiples tonos
        playVictorySound(audioContext);
        return;
      default:
        frequency = 500;
        duration = 0.2;
        type = 'sine';
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  }, []);

  const playVictorySound = (audioContext) => {
    // Melodía de victoria: Do-Mi-Sol-Do
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    notes.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + index * 0.2);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime + index * 0.2);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.2 + 0.3);
      
      oscillator.start(audioContext.currentTime + index * 0.2);
      oscillator.stop(audioContext.currentTime + index * 0.2 + 0.3);
    });
  };

  return { playSound };
};
