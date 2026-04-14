import React, { useEffect, useState, useRef } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ value, duration = 800, prefix = '', suffix = '' }) => {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number>(0);
  const prevRef = useRef(0);

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    let start: number | null = null;
    const from = prevRef.current;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const e = 1 - Math.pow(2, -10 * p);
      setDisplay(Math.round(from + (value - from) * e));
      if (p < 1) rafRef.current = requestAnimationFrame(step);
      else prevRef.current = value;
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  return <span>{prefix}{display.toLocaleString()}{suffix}</span>;
};

export default AnimatedNumber;