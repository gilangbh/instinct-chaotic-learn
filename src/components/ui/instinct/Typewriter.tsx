import React, { useState, useEffect } from 'react';

interface TypewriterProps {
  text: string;
  speed?: number;
  delay?: number;
}

export const Typewriter = ({ text, speed = 30, delay = 0 }: TypewriterProps) => {
  const [displayText, setDisplayText] = useState('');
  
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (delay > 0) timeout = setTimeout(() => startTyping(), delay);
    else startTyping();

    function startTyping() {
      let i = 0;
      const timer = setInterval(() => {
        if (i < text.length) {
          setDisplayText(prev => prev + text.charAt(i));
          i++;
        } else {
          clearInterval(timer);
        }
      }, speed);
      return () => clearInterval(timer);
    }
    return () => clearTimeout(timeout);
  }, [text, speed, delay]);

  return <span>{displayText}</span>;
};

