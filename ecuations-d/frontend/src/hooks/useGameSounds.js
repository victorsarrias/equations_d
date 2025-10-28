import { useEffect, useRef, useCallback } from 'react';

export const useGameSounds = () => {
  const audioContextRef = useRef(null);
  const soundsRef = useRef({});

  // Inicializar AudioContext una sola vez
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Función optimizada para crear sonidos
  const createSound = useCallback((frequency, duration, type = 'sine') => {
    if (!audioContextRef.current) return;
    
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.2, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration);
    
    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + duration);
  }, []);

  // Crear sonidos una sola vez
  useEffect(() => {
    soundsRef.current = {
      jump: () => createSound(800, 0.1, 'sine'),
      collect: () => createSound(1200, 0.2, 'triangle'),
      coin: () => createSound(1500, 0.15, 'square'),
      life: () => createSound(600, 0.3, 'sine'),
      damage: () => createSound(200, 0.5, 'sawtooth'),
      enemy: () => createSound(300, 0.4, 'square'),
      step: () => createSound(400, 0.05, 'sine'),
      complete: () => {
        createSound(523, 0.2, 'sine');
        setTimeout(() => createSound(659, 0.2, 'sine'), 100);
        setTimeout(() => createSound(784, 0.3, 'sine'), 200);
      },
      powerUp: () => {
        createSound(400, 0.1, 'sine');
        setTimeout(() => createSound(500, 0.1, 'sine'), 50);
        setTimeout(() => createSound(600, 0.1, 'sine'), 100);
        setTimeout(() => createSound(700, 0.2, 'sine'), 150);
      },
      shoot: () => createSound(1000, 0.1, 'square')
    };
  }, [createSound]);

  return soundsRef.current;
};
