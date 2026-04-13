export const SVGs = {

/*  B E A V E R  */
B_R: `
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="beaver-fur" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#9a6b4b"/>
      <stop offset="100%" stop-color="#5a3015"/>
    </radialGradient>
  </defs>
  <g class="beaver-tail" style="transform-origin: 25% 65%;">
    <path d="M 60,140 Q 20,130 15,100 Q 15,80 50,70 Q 70,80 80,110 Q 70,140 60,140 Z" fill="#402511" stroke="#251306" stroke-width="3"/>
    <path d="M 35,110 L 45,90 M 50,120 L 60,100 M 40,85 L 50,75" stroke="#251306" stroke-width="2" stroke-linecap="round"/>
  </g>
  <ellipse cx="100" cy="110" rx="53" ry="48" fill="url(#beaver-fur)" stroke="#251306" stroke-width="3"/>
  <path d="M 120,110 Q 130,135 150,140" fill="none" stroke="#5a3015" stroke-width="12" stroke-linecap="round"/>
  <ellipse cx="100" cy="155" rx="15" ry="10" fill="#251306"/>
  <g class="beaver-head" style="transform-origin: 70% 40%;">
    <circle cx="130" cy="75" r="34" fill="url(#beaver-fur)" stroke="#251306" stroke-width="3"/>
    <circle cx="120" cy="45" r="10" fill="#693d22" stroke="#251306" stroke-width="3"/>
    <circle cx="140" cy="65" r="4" fill="#111"/>
    <ellipse cx="155" cy="85" rx="18" ry="12" fill="#dda98b" stroke="#251306" stroke-width="3"/>
    <circle cx="165" cy="80" r="5" fill="#111"/>
    <path class="beaver-teeth" d="M 148,97 L 148,114 L 160,114 L 160,94 Z" fill="#fff" stroke="#111" stroke-width="2" stroke-linejoin="round"/>
    <line x1="154" y1="96" x2="154" y2="114" stroke="#111" stroke-width="2"/>
  </g>
</svg>
`,
B_F: `
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="b-f" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#9a6b4b"/><stop offset="100%" stop-color="#5a3015"/></radialGradient></defs>
  <path d="M 40,140 Q 100,180 160,140 C 180,130 190,105 100,105 C 10,105 20,130 40,140 Z" fill="#402511" stroke="#251306" stroke-width="3"/>
  <ellipse cx="100" cy="120" rx="58" ry="53" fill="url(#b-f)" stroke="#251306" stroke-width="3"/>
  <ellipse cx="100" cy="130" rx="35" ry="40" fill="#dda98b" opacity="0.8"/>
  <rect x="75" y="165" width="20" height="10" rx="5" fill="#251306"/>
  <rect x="105" y="165" width="20" height="10" rx="5" fill="#251306"/>
  <g class="beaver-head" style="transform-origin: 50% 40%;">
    <circle cx="65" cy="65" r="14" fill="#693d22" stroke="#251306" stroke-width="3"/>
    <circle cx="135" cy="65" r="14" fill="#693d22" stroke="#251306" stroke-width="3"/>
    <circle cx="100" cy="85" r="40" fill="url(#b-f)" stroke="#251306" stroke-width="3"/>
    <circle cx="85" cy="80" r="5" fill="#111"/>
    <circle cx="115" cy="80" r="5" fill="#111"/>
    <ellipse cx="100" cy="100" rx="22" ry="14" fill="#dda98b" stroke="#251306" stroke-width="3"/>
    <circle cx="100" cy="95" r="7" fill="#111"/>
    <path class="beaver-teeth" d="M 90,114 L 90,128 L 110,128 L 110,114 Z" fill="#fff" stroke="#111" stroke-width="2" stroke-linejoin="round"/>
    <line x1="100" y1="114" x2="100" y2="128" stroke="#111" stroke-width="2"/>
  </g>
</svg>
`,
B_B: `
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="b-b" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#8c5836"/><stop offset="100%" stop-color="#46240f"/></radialGradient></defs>
  <circle cx="70" cy="55" r="14" fill="#5a3015" stroke="#251306" stroke-width="3"/>
  <circle cx="130" cy="55" r="14" fill="#5a3015" stroke="#251306" stroke-width="3"/>
  <ellipse cx="100" cy="110" rx="58" ry="53" fill="url(#b-b)" stroke="#251306" stroke-width="3"/>
  <circle cx="100" cy="75" r="38" fill="url(#b-b)" stroke="#251306" stroke-width="3"/>
  <g class="beaver-tail" style="transform-origin: 50% 75%;">
    <path d="M 70,145 Q 100,210 130,145 C 145,115 120,70 100,70 C 80,70 55,115 70,145 Z" fill="#402511" stroke="#251306" stroke-width="3"/>
    <path d="M 85,120 L 115,100 M 85,150 L 115,130" stroke="#251306" stroke-width="2" stroke-linecap="round"/>
  </g>
</svg>
`,

/*  F O X  */
F_R: `
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="fox-fur" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#e25822"/><stop offset="100%" stop-color="#b13b10"/></radialGradient></defs>
  <path d="M 80,130 C 30,150 10,120 10,95 C 10,50 60,60 70,95 Z" fill="url(#fox-fur)" stroke="#3d1200" stroke-width="3"/>
  <ellipse cx="100" cy="115" rx="48" ry="38" fill="url(#fox-fur)" stroke="#3d1200" stroke-width="3"/>
  <!-- Front leg -->
  <path d="M 125,120 L 125,170" stroke="#111" stroke-width="14" stroke-linecap="round"/>
  <path d="M 115,170 L 135,170" stroke="#111" stroke-width="8" stroke-linecap="round"/>
  <!-- Back leg -->
  <path d="M 75,130 L 75,170" stroke="#111" stroke-width="14" stroke-linecap="round"/>
  <path d="M 65,170 L 85,170" stroke="#111" stroke-width="8" stroke-linecap="round"/>
  <g class="fox-head" style="transform-origin: 65% 45%;">
    <!-- Ears -->
    <path d="M 110,80 L 100,45 L 125,65 Z" fill="#b13b10" stroke="#3d1200" stroke-width="3" stroke-linejoin="round"/>
    <path d="M 130,80 L 125,40 L 145,65 Z" fill="url(#fox-fur)" stroke="#3d1200" stroke-width="3" stroke-linejoin="round"/>
    <!-- Head Base -->
    <path d="M 105,95 Q 105,60 140,65 Q 160,70 185,85 C 180,95 160,95 140,95 Q 120,95 105,95 Z" fill="url(#fox-fur)" stroke="#3d1200" stroke-width="3" stroke-linejoin="round"/>
    <path d="M 130,95 Q 150,90 185,85 C 175,95 155,100 130,100 Z" fill="#Fdfbf7" stroke="#3d1200" stroke-width="1"/>
    <circle cx="145" cy="78" r="4" fill="#111"/>
    <circle cx="185" cy="85" r="5" fill="#111"/>
    <!-- Jaw (This rotates during gnash) -->
    <path class="fox-jaw" d="M 125,95 C 150,105 180,100 180,100 C 170,110 140,110 120,100 Z" fill="#Fdfbf7" stroke="#3d1200" stroke-width="3" stroke-linejoin="round" style="transform-origin: 120px 95px;"/>
  </g>
</svg>
`,
F_F: `
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="f-f" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#e25822"/><stop offset="100%" stop-color="#b13b10"/></radialGradient></defs>
  <ellipse cx="100" cy="120" rx="42" ry="48" fill="url(#f-f)" stroke="#3d1200" stroke-width="3"/>
  <path d="M 85,120 Q 100,165 115,120 Z" fill="#Fdfbf7" opacity="0.9"/>
  <!-- Limbs -->
  <path d="M 80,160 L 80,180 M 120,160 L 120,180" stroke="#111" stroke-width="12" stroke-linecap="round"/>
  <!-- Tail curve to side -->
  <path d="M 135,130 C 180,140 180,90 160,80 C 140,70 145,105 130,115 Z" fill="url(#f-f)" stroke="#3d1200" stroke-width="3"/>
  <ellipse cx="160" cy="80" rx="8" ry="12" fill="#Fdfbf7" transform="rotate(20 160 80)"/>
  <!-- Head -->
  <g class="fox-head" style="transform-origin: 50% 45%;">
    <path d="M 75,70 L 60,30 L 90,55 Z" fill="url(#f-f)" stroke="#3d1200" stroke-width="3" stroke-linejoin="round"/>
    <path d="M 125,70 L 140,30 L 110,55 Z" fill="url(#f-f)" stroke="#3d1200" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="100" cy="80" r="35" fill="url(#f-f)" stroke="#3d1200" stroke-width="3"/>
    <path d="M 65,80 Q 100,100 135,80 L 100,115 Z" fill="#Fdfbf7" stroke="#3d1200" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="85" cy="75" r="4" fill="#111"/>
    <circle cx="115" cy="75" r="4" fill="#111"/>
    <circle cx="100" cy="115" r="6" fill="#111"/>
    <!-- Animated Jaw Face -->
    <path class="fox-jaw-f" d="M 85,100 Q 100,125 115,100 L 100,110 Z" fill="#Fdfbf7" stroke="#3d1200" stroke-width="2" style="opacity: 0; transform-origin: 100px 95px;"/>
  </g>
</svg>
`,
F_B: `
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="f-b" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#cc4a19"/><stop offset="100%" stop-color="#932c06"/></radialGradient></defs>
  <ellipse cx="100" cy="115" rx="44" ry="50" fill="url(#f-b)" stroke="#3d1200" stroke-width="3"/>
  <path d="M 80,60 L 65,25 L 95,45 Z" fill="#b13b10" stroke="#3d1200" stroke-width="3" stroke-linejoin="round"/>
  <path d="M 120,60 L 135,25 L 105,45 Z" fill="#b13b10" stroke="#3d1200" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="100" cy="75" r="36" fill="url(#f-b)" stroke="#3d1200" stroke-width="3"/>
  <path d="M 100,105 C 50,140 50,195 100,195 C 150,195 150,140 100,105 Z" fill="url(#fox-fur)" stroke="#3d1200" stroke-width="3" stroke-linejoin="round"/>
  <path d="M 90,180 C 95,195 105,195 110,180 Z" fill="#Fdfbf7"/>
</svg>
`,

/*  P O R C U P I N E  */
P_R: `
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="p-fur" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#654321"/><stop offset="100%" stop-color="#3d2814"/></radialGradient></defs>
  <g class="porcupine-quills" style="transform-origin: 45% 65%;">
    <path d="M 10,135 Q 10,60 110,60 C 130,60 140,80 130,135 Z" fill="url(#p-fur)" stroke="#221105" stroke-width="3"/>
    <!-- Detailed Quills -->
    <path d="M 20,110 L 5,90 M 40,90 L 25,60 M 70,70 L 60,40 M 100,70 L 95,35 M 120,85 L 125,50" stroke="#e0cdb8" stroke-width="4" stroke-linecap="square"/>
    <path d="M 30,120 L 15,105 M 50,100 L 40,70 M 80,80 L 75,50 M 110,90 L 115,60" stroke="#c0a080" stroke-width="3" stroke-linecap="square"/>
  </g>
  <path d="M 110,135 Q 110,95 155,100 C 165,105 175,120 160,135 Z" fill="#8B7355" stroke="#221105" stroke-width="3"/>
  <circle cx="150" cy="115" r="4" fill="#111"/>
  <circle cx="165" cy="120" r="6" fill="#111"/>
  <circle cx="120" cy="135" r="10" fill="#3d2814"/>
  <circle cx="140" cy="135" r="10" fill="#3d2814"/>
</svg>
`,
P_F: `
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="p-f" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#654321"/><stop offset="100%" stop-color="#3d2814"/></radialGradient></defs>
  <g class="porcupine-quills" style="transform-origin: 50% 50%;">
    <ellipse cx="100" cy="115" rx="75" ry="65" fill="url(#p-f)" stroke="#221105" stroke-width="3"/>
    <path d="M 25,115 L 5,105 M 35,80 L 15,60 M 60,60 L 40,30 M 100,50 L 100,20 M 140,60 L 160,30 M 165,80 L 185,60 M 175,115 L 195,105" stroke="#e0cdb8" stroke-width="4" stroke-linecap="square"/>
  </g>
  <ellipse cx="100" cy="125" rx="35" ry="30" fill="#8B7355" stroke="#221105" stroke-width="3"/>
  <circle cx="85" cy="115" r="4" fill="#111"/>
  <circle cx="115" cy="115" r="4" fill="#111"/>
  <circle cx="100" cy="128" r="7" fill="#111"/>
</svg>
`,
P_B: `
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="p-b" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#543719"/><stop offset="100%" stop-color="#2c1d0e"/></radialGradient></defs>
  <g class="porcupine-quills" style="transform-origin: 50% 50%;">
    <ellipse cx="100" cy="110" rx="80" ry="70" fill="url(#p-b)" stroke="#221105" stroke-width="3"/>
    <path d="M 20,110 L 5,110 M 30,70 L 10,60 M 55,45 L 35,25 M 100,40 L 100,10 M 145,45 L 165,25 M 170,70 L 190,60 M 180,110 L 195,110" stroke="#c0a080" stroke-width="4" stroke-linecap="square"/>
    <path d="M 70,60 L 60,30 M 130,60 L 140,30 M 100,70 L 100,40 M 50,90 L 30,75 M 150,90 L 170,75" stroke="#e0cdb8" stroke-width="5" stroke-linecap="square"/>
  </g>
</svg>
`,

/*  O T H E R   A N I M A L S  (Symmetrical/Single view mostly) */
R: `
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <g class="bunny" style="transform-origin: 50% 50%;">
    <!-- Hind Leg -->
    <ellipse cx="65" cy="145" rx="20" ry="15" fill="#Fdfbf7" stroke="#333" stroke-width="3"/>
    <!-- Body -->
    <path d="M 50,95 Q 40,155 80,160 C 130,165 145,120 145,95 C 145,60 70,60 50,95 Z" fill="#Fdfbf7" stroke="#333" stroke-width="3" stroke-linejoin="round"/>
    <!-- Tail -->
    <circle cx="45" cy="140" r="14" fill="#FFF" stroke="#aaa" stroke-width="2"/>
    <!-- Ears -->
    <path d="M 125,70 Q 110,20 135,15 Q 145,40 140,75 Z" fill="#Fdfbf7" stroke="#333" stroke-width="3" stroke-linejoin="round"/>
    <path d="M 125,70 Q 110,20 135,15 Q 140,30 135,60 Z" fill="#ECA1A6" stroke-width="0"/>
    <path d="M 140,75 Q 135,25 155,20 Q 165,45 150,85 Z" fill="#Fdfbf7" stroke="#333" stroke-width="3" stroke-linejoin="round"/>
    <!-- Head Curve -->
    <circle cx="130" cy="85" r="4" fill="#111"/>
    <circle cx="155" cy="98" r="5" fill="#ECA1A6"/>
  </g>
</svg>
`,

M: `
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="100" cy="130" rx="65" ry="55" fill="#6b4c3a" stroke="#251306" stroke-width="3"/>
  <ellipse cx="100" cy="140" rx="40" ry="45" fill="#52392b" opacity="0.8"/>
  <circle cx="65" cy="45" r="16" fill="#6b4c3a" stroke="#251306" stroke-width="3"/>
  <circle cx="135" cy="45" r="16" fill="#6b4c3a" stroke="#251306" stroke-width="3"/>
  <circle cx="100" cy="85" r="45" fill="#6b4c3a" stroke="#251306" stroke-width="3"/>
  <circle cx="85" cy="75" r="5" fill="#111"/>
  <circle cx="115" cy="75" r="5" fill="#111"/>
  <ellipse cx="100" cy="100" rx="22" ry="15" fill="#deb887" stroke="#251306" stroke-width="3"/>
  <circle cx="100" cy="95" r="8" fill="#111"/>
  <path d="M 100,103 L 100,111 M 95,111 L 105,111" stroke="#111" stroke-width="3" stroke-linecap="round"/>
</svg>
`,

U: `
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <path d="M 60,160 L 60,180 M 80,165 L 80,180" stroke="#8FBC8F" stroke-width="15" stroke-linecap="round"/>
  <path d="M 110,165 L 110,180 M 130,160 L 130,180" stroke="#8FBC8F" stroke-width="15" stroke-linecap="round"/>
  <ellipse cx="100" cy="120" rx="65" ry="45" fill="#2E8B57" stroke="#003300" stroke-width="4"/>
  <path d="M 40,120 Q 100,80 160,120 M 60,100 L 60,140 M 100,85 L 100,145 M 140,100 L 140,140" stroke="#004400" stroke-width="4" stroke-linecap="round"/>
  <ellipse cx="170" cy="135" rx="18" ry="12" fill="#8FBC8F" stroke="#003300" stroke-width="3"/>
  <circle cx="175" cy="132" r="3" fill="#111"/>
</svg>
`,

/*  E N V I R O N M E N T  */
T: `
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <path d="M 85,180 L 85,100 L 115,100 L 115,180 Z" fill="#5A3A1B" stroke="#2A1B0B" stroke-width="4"/>
  <path d="M 90,180 L 95,100" stroke="#3A2511" stroke-width="3"/>
  <path d="M 40,120 Q 100,20 160,120 Z" fill="#4B6E2C" stroke="#253E12" stroke-width="4" stroke-linejoin="round"/>
  <path d="M 60,80 Q 100,0 140,80 Z" fill="#588533" stroke="#253E12" stroke-width="4" stroke-linejoin="round"/>
  <path d="M 80,45 Q 100,-10 120,45 Z" fill="#6B9E3F" stroke="#253E12" stroke-width="4" stroke-linejoin="round"/>
</svg>
`,
L: `
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <path d="M 40,80 L 160,80 A 20,20 0 0 1 160,120 L 40,120 A 20,20 0 0 1 40,80 Z" fill="#8B5A2B" stroke="#3d1200" stroke-width="4"/>
  <ellipse cx="40" cy="100" rx="10" ry="20" fill="#CD853F" stroke="#3d1200" stroke-width="3"/>
  <path d="M 60,90 L 140,90 M 70,110 L 150,110 M 80,100 L 120,100" stroke="#5c381a" stroke-width="3" stroke-linecap="round"/>
</svg>
`,
W: `
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="100" cy="120" rx="75" ry="35" fill="#2A1B12" stroke="#1a110b" stroke-width="5"/>
  <path d="M 30,120 C 50,50 150,50 170,120" fill="none" stroke="#654321" stroke-width="10" stroke-dasharray="15 10" stroke-linecap="round"/>
</svg>
`,
E: `
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="60" y="40" width="80" height="120" rx="5" fill="#aa6c39" stroke="#3d1200" stroke-width="5"/>
  <line x1="60" y1="70" x2="140" y2="70" stroke="#3d1200" stroke-width="3"/>
  <line x1="60" y1="100" x2="140" y2="100" stroke="#3d1200" stroke-width="3"/>
  <line x1="60" y1="130" x2="140" y2="130" stroke="#3d1200" stroke-width="3"/>
  <circle cx="120" cy="100" r="6" fill="#ffd700" stroke="#b8860b" stroke-width="2"/>
  <!-- Elegant arch -->
  <path d="M 50,40 Q 100,0 150,40" fill="none" stroke="#3d1200" stroke-width="8" stroke-linecap="round"/>
</svg>
`,
X: `
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="90" r="40" fill="#Fdfbf7" stroke="#333" stroke-width="4"/>
  <circle cx="85" cy="85" r="9" fill="#333"/>
  <circle cx="115" cy="85" r="9" fill="#333"/>
  <path d="M 100,105 L 95,115 L 105,115 Z" fill="#333"/>
  <path d="M 80,120 L 120,120 M 90,110 L 90,130 M 100,110 L 100,130 M 110,110 L 110,130" stroke="#333" stroke-width="4" stroke-linecap="round"/>
</svg>
`,
C: `
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="50" fill="#90EE90" stroke="#228B22" stroke-width="4"/>
  <path d="M 60,100 C 100,60 140,100 140,100 M 80,140 C 100,100 120,140 120,140 M 60,80 C 100,120 140,80 140,80" fill="none" stroke="#228B22" stroke-width="5" stroke-linecap="round"/>
</svg>
`,
N: `
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <path d="M 40,120 C 100,180 160,120 160,120 Z" fill="#C19A6B" stroke="#654321" stroke-width="5" stroke-linejoin="round"/>
  <path d="M 50,120 Q 100,150 150,120 M 70,120 Q 100,170 130,120" fill="none" stroke="#8B7355" stroke-width="4" stroke-linecap="round"/>
  <ellipse cx="100" cy="105" rx="20" ry="25" fill="#Fdfbf7" stroke="#333" stroke-width="3"/>
  <!-- overlapping nest front lip -->
  <path d="M 45,120 Q 100,135 155,120" fill="none" stroke="#654321" stroke-width="5" stroke-linecap="round"/>
</svg>
`,
EGG: `
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="100" cy="100" rx="30" ry="40" fill="#FDFBF7" stroke="#333" stroke-width="3"/>
  <ellipse cx="90" cy="85" rx="5" ry="10" fill="#fff" opacity="0.6" transform="rotate(-20 90 85)"/>
</svg>
`
};
