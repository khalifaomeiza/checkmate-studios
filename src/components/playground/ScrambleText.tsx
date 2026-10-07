import { useEffect, useState } from 'react';

export const ScrambleText = ({ words }: { words: string[] }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState(words[0] ?? '');
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+';

  useEffect(() => {
    if (!words.length) return;

    let timeout: ReturnType<typeof setTimeout>;
    let frame: number;
    let iteration = 0;

    const scramble = () => {
      const targetWord = words[currentWordIndex] ?? words[0];
      const scrambled = targetWord
        .split('')
        .map((_, index) => {
          if (index < iteration) return targetWord[index];
          return characters[Math.floor(Math.random() * characters.length)];
        })
        .join('');

      setDisplayText(scrambled);

      if (iteration < targetWord.length) {
        iteration += 1 / 10;
        frame = requestAnimationFrame(scramble);
      } else {
        timeout = setTimeout(() => {
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
        }, 1500);
      }
    };

    frame = requestAnimationFrame(scramble);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timeout);
    };
  }, [currentWordIndex, words]);

  return <span>{displayText}.</span>;
};
