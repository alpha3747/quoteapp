import React from 'react';
import Svg, { Path } from 'react-native-svg';

import { colors } from '../constants/theme';

/** Stroke paths on a 24×24 grid (Lucide-style, ISC licensed shapes). */
const PATHS = {
  heart: [
    'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z',
  ],
  share: [
    'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8',
    'M16 6l-4-4-4 4',
    'M12 2v13',
  ],
  shuffle: [
    'M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22',
    'm18 2 4 4-4 4',
    'M2 6h1.9c1.5 0 2.9.9 3.6 2.2',
    'M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8',
    'm18 14 4 4-4 4',
  ],
  bookmark: ['m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z'],
  bell: [
    'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9',
    'M10.3 21a1.94 1.94 0 0 0 3.4 0',
  ],
  bellOff: [
    'M8.7 3A6 6 0 0 1 18 8a21.3 21.3 0 0 0 .6 5',
    'M17 17H3s3-2 3-9a4.67 4.67 0 0 1 .3-1.7',
    'M10.3 21a1.94 1.94 0 0 0 3.4 0',
    'm2 2 20 20',
  ],
  chevronLeft: ['m15 18-6-6 6-6'],
  trash: [
    'M3 6h18',
    'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6',
    'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2',
  ],
  wifiOff: [
    'M12 20h.01',
    'M8.5 16.43a5 5 0 0 1 7 0',
    'M2 8.82a15 15 0 0 1 4.17-2.65',
    'M10.66 5c4.01-.36 8.14.9 11.34 3.76',
    'M16.85 11.25a10 10 0 0 1 2.22 1.68',
    'M5 13a10 10 0 0 1 5.24-2.76',
    'm2 2 20 20',
  ],
} as const;

export type IconName = keyof typeof PATHS;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  filled?: boolean;
  strokeWidth?: number;
}

export function Icon({
  name,
  size = 24,
  color = colors.text,
  filled = false,
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {PATHS[name].map(d => (
        <Path
          key={d}
          d={d}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={filled ? color : 'none'}
        />
      ))}
    </Svg>
  );
}
