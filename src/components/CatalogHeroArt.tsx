export function CatalogHeroArt() {
  return (
    <div className="modules-launch-visual" aria-hidden="true">
      <svg className="modules-launch-art" viewBox="0 0 640 420" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="launchFlowPrimary" x1="68" y1="54" x2="576" y2="348" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0F6CBD" />
            <stop offset="0.48" stopColor="#3CA37A" />
            <stop offset="1" stopColor="#D48E38" />
          </linearGradient>
          <linearGradient id="launchFlowSoft" x1="108" y1="82" x2="566" y2="346" gradientUnits="userSpaceOnUse">
            <stop stopColor="#D9EBFB" />
            <stop offset="1" stopColor="#F8EAD6" />
          </linearGradient>
          <radialGradient id="launchGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(515 70) rotate(123.953) scale(238.751 231.203)">
            <stop stopColor="#F3B769" stopOpacity="0.42" />
            <stop offset="1" stopColor="#F3B769" stopOpacity="0" />
          </radialGradient>
          <filter id="launchShadow" x="34" y="28" width="572" height="348" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feOffset dy="18" />
            <feGaussianBlur stdDeviation="18" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.176471 0 0 0 0 0.270588 0 0 0 0 0.356863 0 0 0 0.12 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_hero" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_hero" result="shape" />
          </filter>
        </defs>

        <rect x="34" y="28" width="572" height="348" rx="34" fill="url(#launchFlowSoft)" />
        <rect x="34" y="28" width="572" height="348" rx="34" fill="url(#launchGlow)" />

        <g filter="url(#launchShadow)">
          <rect className="modules-art-panel modules-art-panel-array" x="58" y="184" width="176" height="148" rx="24" fill="rgba(255,255,255,0.84)" />
          <rect className="modules-art-panel modules-art-panel-tree" x="240" y="104" width="178" height="228" rx="28" fill="rgba(255,255,255,0.88)" />
          <rect className="modules-art-panel modules-art-panel-graph" x="428" y="64" width="146" height="128" rx="24" fill="rgba(255,255,255,0.84)" />
          <rect className="modules-art-panel modules-art-panel-matrix" x="436" y="216" width="138" height="116" rx="24" fill="rgba(255,255,255,0.9)" />
        </g>

        <path
          className="modules-art-flow modules-art-flow-primary"
          d="M112 116C151 104 203 112 233 138C275 174 275 251 335 254C400 258 409 155 469 142C501 135 534 144 556 160"
          stroke="url(#launchFlowPrimary)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          className="modules-art-flow modules-art-flow-secondary"
          d="M96 264C140 222 195 208 238 221C283 235 314 286 359 297C423 314 480 270 546 258"
          stroke="rgba(15,108,189,0.18)"
          strokeWidth="16"
          strokeLinecap="round"
        />

        <g className="modules-art-array-group">
          <path d="M84 308H208" stroke="rgba(104,120,114,0.24)" strokeLinecap="round" />
          <rect x="88" y="264" width="16" height="44" rx="8" fill="#78A8D5" />
          <rect x="112" y="236" width="16" height="72" rx="8" fill="#6FCA9C" />
          <rect x="136" y="214" width="16" height="94" rx="8" fill="#E4B45F" />
          <rect x="160" y="246" width="16" height="62" rx="8" fill="#78A8D5" />
          <rect x="184" y="196" width="16" height="112" rx="8" fill="#5D8BC8" />
        </g>

        <g className="modules-art-tree-group">
          <path d="M329 140V176" stroke="#BFD5E8" strokeWidth="8" strokeLinecap="round" />
          <path d="M329 176L286 216" stroke="#BFD5E8" strokeWidth="8" strokeLinecap="round" />
          <path d="M329 176L372 216" stroke="#BFD5E8" strokeWidth="8" strokeLinecap="round" />
          <path d="M286 216L264 262" stroke="#D3E2F0" strokeWidth="7" strokeLinecap="round" />
          <path d="M286 216L308 262" stroke="#D3E2F0" strokeWidth="7" strokeLinecap="round" />
          <path d="M372 216L350 262" stroke="#D3E2F0" strokeWidth="7" strokeLinecap="round" />
          <path d="M372 216L394 262" stroke="#D3E2F0" strokeWidth="7" strokeLinecap="round" />
          <circle cx="329" cy="134" r="22" fill="#153956" />
          <circle cx="286" cy="216" r="18" fill="#3CA37A" />
          <circle cx="372" cy="216" r="18" fill="#E4B45F" />
          <circle cx="264" cy="266" r="14" fill="#7BA0CF" />
          <circle cx="308" cy="266" r="14" fill="#BED5EA" />
          <circle cx="350" cy="266" r="14" fill="#BED5EA" />
          <circle cx="394" cy="266" r="14" fill="#7BA0CF" />
        </g>

        <g className="modules-art-graph-group" strokeLinecap="round" strokeLinejoin="round">
          <path d="M463 118L500 92" stroke="#BFD5E8" strokeWidth="7" />
          <path d="M463 118L499 158" stroke="#BFD5E8" strokeWidth="7" />
          <path d="M500 92L541 118" stroke="#D8E6F2" strokeWidth="7" />
          <path d="M499 158L541 118" stroke="#D8E6F2" strokeWidth="7" />
          <path d="M463 118L541 118" stroke="#DDEAF5" strokeWidth="6" />
          <circle cx="463" cy="118" r="15" fill="#3CA37A" />
          <circle cx="500" cy="92" r="13" fill="#153956" />
          <circle cx="499" cy="158" r="13" fill="#E4B45F" />
          <circle cx="541" cy="118" r="15" fill="#7BA0CF" />
        </g>

        <g className="modules-art-matrix-group">
          <rect x="458" y="238" width="26" height="26" rx="9" fill="#DCEAF6" />
          <rect x="492" y="238" width="26" height="26" rx="9" fill="#7BA0CF" />
          <rect x="526" y="238" width="26" height="26" rx="9" fill="#E4B45F" />
          <rect x="458" y="272" width="26" height="26" rx="9" fill="#69BE8E" />
          <rect x="492" y="272" width="26" height="26" rx="9" fill="#DCEAF6" />
          <rect x="526" y="272" width="26" height="26" rx="9" fill="#8AB1DA" />
          <rect x="458" y="306" width="26" height="26" rx="9" fill="#E4B45F" />
          <rect x="492" y="306" width="26" height="26" rx="9" fill="#69BE8E" />
          <rect x="526" y="306" width="26" height="26" rx="9" fill="#DCEAF6" />
        </g>

        <g className="modules-art-signals">
          <circle className="modules-art-signal modules-art-signal-1" cx="118" cy="108" r="8" fill="#3CA37A" />
          <circle className="modules-art-signal modules-art-signal-2" cx="230" cy="86" r="7" fill="#7BA0CF" />
          <circle className="modules-art-signal modules-art-signal-3" cx="411" cy="108" r="8" fill="#E4B45F" />
          <circle className="modules-art-signal modules-art-signal-4" cx="562" cy="212" r="7" fill="#3CA37A" />
          <circle className="modules-art-signal modules-art-signal-5" cx="210" cy="346" r="8" fill="#153956" />
        </g>
      </svg>
    </div>
  );
}
