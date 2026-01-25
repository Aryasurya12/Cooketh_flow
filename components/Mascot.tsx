import React from 'react';

type MascotPose = 'wave' | 'peek' | 'point-right' | 'point-left' | 'holding' | 'idle' | 'logo' | 'artist' | 'chef' | 'thinking' | 'love' | 'guard' | 'sleep' | 'celebrate' | 'balloon';

interface MascotProps {
  pose?: MascotPose;
  size?: number;
  className?: string;
  animate?: boolean;
}

const Mascot: React.FC<MascotProps> = ({ pose = 'idle', size = 120, className = '', animate = true }) => {
  
  // Official Brand Colors
  const colors = {
    bodyBase: "#F59E0B", // Amber-500
    bodyShadow: "#D97706", // Amber-600
    beret: "#7F1D1D",    // Red-900 (Maroon)
    beretStem: "#451a03", 
    face: "#451a03",     // Dark Brown
    blush: "#FCA5A5",    // Red-300
    highlight: "#FDE68A" // Amber-200
  };

  const animationClass = animate && pose !== 'logo' && pose !== 'sleep' && pose !== 'peek' && pose !== 'balloon' ? 'animate-float' : '';

  const renderArms = () => {
    switch (pose) {
      case 'wave':
        return (
          <>
            <path d="M 28 65 Q 15 60 10 45" stroke={colors.face} strokeWidth="4" strokeLinecap="round" fill="none" className="origin-bottom-right animate-[wave_2s_ease-in-out_infinite]" />
            <path d="M 72 65 Q 85 70 90 60" stroke={colors.face} strokeWidth="4" strokeLinecap="round" fill="none" />
            <circle cx="10" cy="45" r="4" fill={colors.bodyShadow} />
            <circle cx="90" cy="60" r="4" fill={colors.bodyShadow} />
          </>
        );
      case 'celebrate':
        return (
          <>
            <path d="M 28 65 Q 10 50 15 35" stroke={colors.face} strokeWidth="4" strokeLinecap="round" fill="none" className="animate-wiggle" />
            <path d="M 72 65 Q 90 50 85 35" stroke={colors.face} strokeWidth="4" strokeLinecap="round" fill="none" className="animate-wiggle" />
            <circle cx="15" cy="35" r="4" fill={colors.bodyShadow} />
            <circle cx="85" cy="35" r="4" fill={colors.bodyShadow} />
            
            {/* Confetti specs */}
            <circle cx="10" cy="20" r="2" fill="#3B82F6" className="animate-ping" />
            <circle cx="90" cy="20" r="2" fill="#EF4444" className="animate-ping delay-100" />
          </>
        );
      case 'point-right':
        return (
          <>
            <path d="M 28 65 Q 15 70 20 80" stroke={colors.face} strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M 72 65 Q 100 55 110 45" stroke={colors.face} strokeWidth="4" strokeLinecap="round" fill="none" />
            <circle cx="20" cy="80" r="4" fill={colors.bodyShadow} />
            <circle cx="110" cy="45" r="4" fill={colors.bodyShadow} />
          </>
        );
      case 'point-left':
        return (
          <>
            <path d="M 28 65 Q 0 55 -10 45" stroke={colors.face} strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M 72 65 Q 85 70 80 80" stroke={colors.face} strokeWidth="4" strokeLinecap="round" fill="none" />
            <circle cx="-10" cy="45" r="4" fill={colors.bodyShadow} />
            <circle cx="80" cy="80" r="4" fill={colors.bodyShadow} />
          </>
        );
      case 'thinking':
         return (
             <>
                <path d="M 28 65 Q 15 70 20 80" stroke={colors.face} strokeWidth="4" strokeLinecap="round" fill="none" />
                <path d="M 72 65 Q 85 40 75 35" stroke={colors.face} strokeWidth="4" strokeLinecap="round" fill="none" />
                <circle cx="20" cy="80" r="4" fill={colors.bodyShadow} />
                <circle cx="75" cy="35" r="4" fill={colors.bodyShadow} />
                {/* Question mark bubble */}
                <text x="85" y="30" fontSize="16" fill="#64748b" className="animate-bounce">?</text>
             </>
         );
       case 'love':
         return (
            <>
              {/* Arms holding heart */}
              <path d="M 28 65 Q 40 60 45 55" stroke={colors.face} strokeWidth="4" strokeLinecap="round" fill="none" />
              <path d="M 72 65 Q 60 60 55 55" stroke={colors.face} strokeWidth="4" strokeLinecap="round" fill="none" />
              {/* Heart */}
              <path d="M 50 58 C 50 58, 45 50, 40 55 C 35 60, 45 70, 50 75 C 55 70, 65 60, 60 55 C 55 50, 50 58, 50 58 Z" fill="#EF4444" stroke={colors.face} strokeWidth="2" />
            </>
         );
       case 'guard':
         return (
            <>
              {/* Arms shielding/holding lock */}
              <path d="M 28 65 Q 40 65 42 60" stroke={colors.face} strokeWidth="4" strokeLinecap="round" fill="none" />
              <path d="M 72 65 Q 60 65 58 60" stroke={colors.face} strokeWidth="4" strokeLinecap="round" fill="none" />
              
              {/* Padlock Icon */}
              <g transform="translate(42, 52)">
                 <rect x="0" y="6" width="16" height="12" rx="2" fill="#334155" />
                 <path d="M 3 6 V 3 A 5 5 0 0 1 13 3 V 6" stroke="#334155" strokeWidth="2" fill="none" />
                 <circle cx="8" cy="12" r="2" fill="white" />
              </g>
            </>
         );
       case 'sleep':
         return (
            <>
               {/* Arms resting */}
               <path d="M 28 65 Q 25 75 35 80" stroke={colors.face} strokeWidth="4" strokeLinecap="round" fill="none" />
               <path d="M 72 65 Q 75 75 65 80" stroke={colors.face} strokeWidth="4" strokeLinecap="round" fill="none" />
               {/* Zzz Animation handled in CSS ideally, but here static for SVG simplicity */}
               <text x="75" y="40" fontFamily="sans-serif" fontSize="14" fill="#94a3b8" className="animate-pulse">z</text>
               <text x="85" y="30" fontFamily="sans-serif" fontSize="10" fill="#cbd5e1" className="animate-pulse delay-100">z</text>
            </>
         );
       case 'chef':
         return (
            <>
                <path d="M 28 65 Q 15 60 10 45" stroke={colors.face} strokeWidth="4" strokeLinecap="round" fill="none" />
                {/* Spoon */}
                <line x1="10" y1="45" x2="10" y2="20" stroke="#94a3b8" strokeWidth="3" />
                <ellipse cx="10" cy="18" rx="6" ry="8" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
                
                <path d="M 72 65 Q 85 70 90 60" stroke={colors.face} strokeWidth="4" strokeLinecap="round" fill="none" />
                <circle cx="90" cy="60" r="4" fill={colors.bodyShadow} />
            </>
         );
      case 'artist':
        return (
          <>
            {/* Left Arm holding Palette */}
            <path d="M 28 65 Q 15 60 10 55" stroke={colors.face} strokeWidth="4" strokeLinecap="round" fill="none" />
            {/* Palette */}
            <g transform="translate(-15, 45) rotate(-10)">
              <path d="M 0 10 C 0 0, 25 0, 25 10 C 25 15, 20 20, 10 20 C 0 20, 0 15, 0 10 Z" fill="#D4B483" stroke={colors.face} strokeWidth="1.5"/>
              <circle cx="5" cy="8" r="3" fill="#EF4444" />
              <circle cx="12" cy="12" r="3" fill="#3B82F6" />
              <circle cx="19" cy="8" r="3" fill="#F59E0B" />
            </g>

            {/* Right Arm holding Brush */}
            <path d="M 72 65 Q 85 70 95 60" stroke={colors.face} strokeWidth="4" strokeLinecap="round" fill="none" />
            {/* Brush */}
            <g transform="translate(95, 45) rotate(30)">
               <rect x="-2" y="0" width="4" height="25" fill="#A16207" rx="1" />
               <rect x="-2" y="-5" width="4" height="5" fill="#333" />
               <path d="M -2 -5 L -3 -12 L 3 -12 L 2 -5 Z" fill="#3B82F6" />
            </g>
          </>
        );
      case 'balloon':
        return (
          <>
            <path d="M 28 65 Q 15 70 20 80" stroke={colors.face} strokeWidth="4" strokeLinecap="round" fill="none" />
            
            {/* Holding balloon */}
            <path d="M 72 65 Q 85 60 85 50" stroke={colors.face} strokeWidth="4" strokeLinecap="round" fill="none" />
            <line x1="85" y1="50" x2="85" y2="10" stroke="black" strokeWidth="1" />
            {/* Balloon */}
            <path d="M 85 10 C 70 10, 65 -10, 85 -20 C 105 -10, 100 10, 85 10 Z" fill="#F43F5E" stroke="black" strokeWidth="1" />
            <polygon points="85,10 82,14 88,14" fill="#F43F5E" />
          </>
        );
       case 'logo':
       case 'peek':
        // No arms for logo usually, or tucked in
        return null; 
      default: // Idle/Holding
        return (
          <>
             <ellipse cx="28" cy="75" rx="6" ry="12" fill={colors.bodyShadow} transform="rotate(20 28 75)" />
             <ellipse cx="72" cy="75" rx="6" ry="12" fill={colors.bodyShadow} transform="rotate(-20 72 75)" />
          </>
        );
    }
  };

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`${animationClass} ${className}`}
      style={{ overflow: 'visible' }}
    >
      {/* Shadow */}
      {pose !== 'logo' && pose !== 'peek' && pose !== 'balloon' && (
        <ellipse cx="50" cy="92" rx="35" ry="6" fill="black" fillOpacity="0.15" />
      )}

      {/* Body - Pear Shape / Blob */}
      <path 
        d="M 50 25 
           C 75 25, 90 45, 90 65 
           C 90 85, 75 90, 50 90 
           C 25 90, 10 85, 10 65 
           C 10 45, 25 25, 50 25 Z" 
        fill={colors.bodyBase}
        stroke={colors.face}
        strokeWidth="3"
      />
      
      {/* Body Highlight (Shininess) */}
      <ellipse cx="35" cy="40" rx="6" ry="4" fill={colors.highlight} transform="rotate(-20 35 40)" opacity="0.8" />

      {/* Beret (Maroon Cap) */}
      <g transform="translate(0, -2)">
        <path 
          d="M 20 35 
             C 15 25, 30 15, 50 15 
             C 70 15, 95 20, 90 40 
             C 85 45, 25 45, 20 35 Z" 
          fill={colors.beret} 
          stroke={colors.face}
          strokeWidth="3"
        />
        {/* Beret Stem */}
        <path d="M 50 15 Q 55 10 60 5" stroke={colors.beretStem} strokeWidth="4" strokeLinecap="round" />
      </g>

      {/* Face Group */}
      <g transform={`translate(${pose === 'peek' ? '0, -5' : '0, 0'})`}>
          {/* Eyes */}
          {pose === 'sleep' ? (
             <>
               {/* Closed Eyes */}
               <path d="M 35 55 Q 38 58 41 55" stroke={colors.face} strokeWidth="2" fill="none" strokeLinecap="round" />
               <path d="M 59 55 Q 62 58 65 55" stroke={colors.face} strokeWidth="2" fill="none" strokeLinecap="round" />
             </>
          ) : pose === 'guard' ? (
             <>
               {/* Determined Eyes */}
               <path d="M 35 52 L 41 55" stroke={colors.face} strokeWidth="2" strokeLinecap="round" />
               <path d="M 65 52 L 59 55" stroke={colors.face} strokeWidth="2" strokeLinecap="round" />
               <ellipse cx="38" cy="58" rx="3" ry="4" fill={colors.face} />
               <ellipse cx="62" cy="58" rx="3" ry="4" fill={colors.face} />
             </>
          ) : (
             <>
               <ellipse cx="38" cy="55" rx="3" ry="4" fill={colors.face} />
               <ellipse cx="62" cy="55" rx="3" ry="4" fill={colors.face} />
             </>
          )}
          
          {/* Mouth */}
          {pose === 'thinking' ? (
             <path d="M 46 62 Q 50 60 54 62" stroke={colors.face} strokeWidth="2" strokeLinecap="round" />
          ) : pose === 'sleep' ? (
             <circle cx="50" cy="65" r="2" fill={colors.face} />
          ) : pose === 'celebrate' || pose === 'balloon' ? (
             <path d="M 45 62 Q 50 68 55 62 Z" fill="#7f1d1d" /> 
          ) : (
             <path d="M 47 62 Q 50 65 53 62" stroke={colors.face} strokeWidth="2" strokeLinecap="round" />
          )}

          {/* Blush Cheeks */}
          <ellipse cx="28" cy="60" rx="5" ry="3" fill={colors.blush} opacity={pose === 'sleep' ? 0.6 : 1} />
          <ellipse cx="72" cy="60" rx="5" ry="3" fill={colors.blush} opacity={pose === 'sleep' ? 0.6 : 1} />
      </g>

      {/* Arms / Feet Rendered on top */}
      {renderArms()}
    </svg>
  );
};

export default Mascot;