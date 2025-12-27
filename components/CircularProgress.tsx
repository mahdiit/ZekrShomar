import React from 'react';

interface CircularProgressProps {
  count: number;
  target: number;
  radius?: number;
  stroke?: number;
  progressColor?: string;
  trackColor?: string;
  textColor?: string;
}

const toPersianDigits = (n: number | string) => {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return n
    .toString()
    .replace(/\d/g, (x) => farsiDigits[parseInt(x)]);
};

const CircularProgress: React.FC<CircularProgressProps> = ({ 
  count, 
  target, 
  radius = 120, 
  stroke = 15,
  progressColor = "#f59e0b", // Default gold
  trackColor = "#334155", // Default slate-700
  textColor = "text-amber-500"
}) => {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progress = Math.min(count / target, 1);
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90 transition-all duration-500 ease-out"
      >
        <circle
          stroke={trackColor}
          strokeWidth={stroke}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={progressColor}
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className={`absolute flex flex-col items-center justify-center ${textColor}`}>
        <span className="text-6xl font-bold tabular-nums tracking-tighter">
          {toPersianDigits(count)}
        </span>
        <span className="text-sm opacity-80 mt-2 font-medium">
          هدف: {toPersianDigits(target)}
        </span>
      </div>
    </div>
  );
};

export default CircularProgress;