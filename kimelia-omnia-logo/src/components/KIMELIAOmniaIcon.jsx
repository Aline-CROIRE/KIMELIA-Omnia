// src/components/KIMELIAOmniaIcon.jsx
import React, { useId } from 'react'; 
import styled, { keyframes } from 'styled-components'; 
import { colors } from '../theme';

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${(props) => props.size || '60px'};
  height: ${(props) => props.size || '60px'};

  svg {
    display: block;
    overflow: visible; /* Ensure gradients/filters/shadows aren't clipped */
  }
`;

// Define animation keyframes
const drawPath = keyframes`
  0% {
    stroke-dashoffset: 1000;
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  100% {
    stroke-dashoffset: 0;
    opacity: 1;
  }
`;

// Create styled components for the SVG paths to apply animations correctly
const AnimatedPath1 = styled.path`
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: ${drawPath} 3s ease-out forwards infinite alternate;
`;

const AnimatedPath2 = styled.path`
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: ${drawPath} 3s ease-out forwards infinite alternate 0.5s; /* Delayed animation */
`;

const AnimatedPath3 = styled.path`
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: ${drawPath} 3s ease-out forwards infinite alternate 1s; /* Further delayed */
`;

const KIMELIAOmniaIcon = ({ size }) => {
  // Generate a unique ID for this specific instance of the icon component
  const uniquePrefix = useId();

  const gradientPurpleTealId = `${uniquePrefix}-gradientPurpleTeal`;
  const gradientTealPurpleId = `${uniquePrefix}-gradientTealPurple`;
  const gradientBrightAccentId = `${uniquePrefix}-gradientBrightAccent`;
  const titleId = `${uniquePrefix}-kimeliaOmniaIconTitle`; 

  return (
    <IconWrapper size={size}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-labelledby={titleId} 
        role="img"
      >
        <title id={titleId}>KIMELIA Omnia Icon: The Evolving Flow</title>
        <defs>
          {/* Gradients using unique IDs */}
          <linearGradient id={gradientPurpleTealId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.primaryPurple} />
            <stop offset="100%" stopColor={colors.accentTeal} />
          </linearGradient>

          <linearGradient id={gradientTealPurpleId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.accentTeal} />
            <stop offset="100%" stopColor={colors.primaryPurple} />
          </linearGradient>

          <linearGradient id={gradientBrightAccentId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.brightAccent} />
            <stop offset="100%" stopColor={colors.softLavender} />
          </linearGradient>

        </defs>

        {/* Paths referencing unique gradient IDs */}
        <AnimatedPath1
          d="M 20 50 C 10 30, 30 10, 50 10 C 70 10, 90 30, 80 50 C 90 70, 70 90, 50 90 C 30 90, 10 70, 20 50 Z"
          stroke={`url(#${gradientPurpleTealId})`}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />

        <AnimatedPath2
          d="M 25 75 Q 50 25 75 75"
          stroke={`url(#${gradientTealPurpleId})`}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />

        <AnimatedPath3
          d="M 35 25 Q 50 75 65 25"
          stroke={`url(#${gradientPurpleTealId})`}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />

         <circle cx="50" cy="50" r="8" fill={colors.brightAccent} opacity="0.8" style={{ filter: `drop-shadow(0 0 5px ${colors.brightAccent})` }} />

      </svg>
    </IconWrapper>
  );
};

export default KIMELIAOmniaIcon;
