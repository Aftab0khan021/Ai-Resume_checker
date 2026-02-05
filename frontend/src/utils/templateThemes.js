export const colorThemes = [
    { id: "slate", name: "Slate Professional", primary: "#0f172a", secondary: "#334155", accent: "#3b82f6", text: "#1e293b", bg: "#ffffff" },
    { id: "emerald", name: "Emerald Green", primary: "#064e3b", secondary: "#065f46", accent: "#10b981", text: "#064e3b", bg: "#ecfdf5" },
    { id: "blue", name: "Corporate Blue", primary: "#1e3a8a", secondary: "#1d4ed8", accent: "#60a5fa", text: "#172554", bg: "#eff6ff" },
    { id: "crimson", name: "Crimson Red", primary: "#881337", secondary: "#9f1239", accent: "#f43f5e", text: "#4c0519", bg: "#fff1f2" },
    { id: "violet", name: "Creative Violet", primary: "#4c1d95", secondary: "#6d28d9", accent: "#8b5cf6", text: "#2e1065", bg: "#f5f3ff" },
    { id: "orange", name: "Modern Orange", primary: "#ea580c", secondary: "#c2410c", accent: "#f97316", text: "#431407", bg: "#fff7ed" },
    { id: "teal", name: "Teal Teal", primary: "#115e59", secondary: "#0d9488", accent: "#2dd4bf", text: "#134e4a", bg: "#f0fdfa" },
    { id: "monochrome", name: "Strict Monochrome", primary: "#000000", secondary: "#333333", accent: "#666666", text: "#000000", bg: "#ffffff" },
    { id: "chocolate", name: "Warm Chocolate", primary: "#3f2c22", secondary: "#713f12", accent: "#a16207", text: "#451a03", bg: "#fffbeb" },
    { id: "pink", name: "Vibrant Pink", primary: "#be185d", secondary: "#db2777", accent: "#f472b6", text: "#831843", bg: "#fdf2f8" },
    { id: "indigo", name: "Indigo Tech", primary: "#312e81", secondary: "#4338ca", accent: "#6366f1", text: "#1e1b4b", bg: "#eef2ff" },
    { id: "cyan", name: "Cyan Future", primary: "#164e63", secondary: "#0891b2", accent: "#22d3ee", text: "#155e75", bg: "#ecfeff" },
    { id: "lime", name: "Lime Fresh", primary: "#365314", secondary: "#4d7c0f", accent: "#84cc16", text: "#1a2e05", bg: "#f7fee7" },
    { id: "fuchsia", name: "Fuchsia Bold", primary: "#701a75", secondary: "#a21caf", accent: "#d946ef", text: "#4a044e", bg: "#fdf4ff" },
    { id: "rose", name: "Rose Elegant", primary: "#881337", secondary: "#be123c", accent: "#fb7185", text: "#881337", bg: "#fff1f2" },
    { id: "amber", name: "Amber Warmth", primary: "#78350f", secondary: "#b45309", accent: "#f59e0b", text: "#451a03", bg: "#fffbeb" },
    { id: "sky", name: "Sky Airy", primary: "#0c4a6e", secondary: "#0369a1", accent: "#38bdf8", text: "#075985", bg: "#f0f9ff" },
    { id: "gold", name: "Golden Luxury", primary: "#854d0e", secondary: "#a16207", accent: "#eab308", text: "#422006", bg: "#fefce8" },
    { id: "purple", name: "Purple Haze", primary: "#581c87", secondary: "#7e22ce", accent: "#c084fc", text: "#3b0764", bg: "#faf5ff" },
    { id: "charcoal", name: "Charcoal Modern", primary: "#18181b", secondary: "#27272a", accent: "#52525b", text: "#09090b", bg: "#f4f4f5" },
];

export const fontThemes = [
    { id: "sans", name: "Clean Sans", heading: "font-sans", body: "font-sans" },
    { id: "serif", name: "Classic Serif", heading: "font-serif", body: "font-serif" },
    { id: "mono", name: "Tech Mono", heading: "font-mono", body: "font-mono" },
    { id: "mix1", name: "Modern Mix", heading: "font-sans", body: "font-serif" },
    { id: "mix2", name: "Editorial", heading: "font-serif", body: "font-sans" },
];

export const getThemeStyle = (themeId) => colorThemes.find(t => t.id === themeId) || colorThemes[0];
export const getFontStyle = (fontId) => fontThemes.find(f => f.id === fontId) || fontThemes[0];
