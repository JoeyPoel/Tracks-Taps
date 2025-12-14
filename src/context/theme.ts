export const lightTheme = {
  primary: "#FF375D",
  primaryHover: "#E63254",
  primaryText: "#FFFFFF",
  secondary: "#2AC3FF",
  secondaryHover: "#25B0E6",
  secondaryText: "#FFFFFF",
  accent: "#FFC107",
  accentText: "#78350F",

  danger: "#DC2626", // Red-600
  dangerHover: "#B91C1C", // Red-700
  success: "#059669", // Emerald-600
  successText: "#064E3B", // Emerald-900
  warning: "#D97706", // Amber-600
  warningText: "#78350F", // Amber-900
  info: "#2563EB", // Blue-600
  infoText: "#1E3A8A", // Blue-900

  // Backgrounds - Adjusted for distinct surfaces
  bgPrimary: "#F1F5F9",  // Slate-100 (Main Background)
  bgSecondary: "#e4e6e9ff", // White (Cards/Surfaces)
  bgTertiary: "#E2E8F0", // Slate-200 (Secondary areas)
  bgInput: "#FFFFFF",
  bgDisabled: "#F1F5F9",
  bgSuccess: "#A7F3D0", // Emerald-200
  bgInfo: "#BFDBFE", // Blue-200

  // Text - Higher contrast
  textPrimary: "#0F172A", // Slate-900
  textSecondary: "#334155", // Slate-700 (Darkened)
  textTertiary: "#64748B", // Slate-500
  textDisabled: "#94A3B8", // Slate-400
  textLink: "#FF375D",
  textOnPrimary: "#FFFFFF",
  textOnSecondary: "#FFFFFF",
  textOnSuccess: "#064E3B",
  textOnInfo: "#1E3A8A",

  // Borders - More visible
  borderPrimary: "#CBD5E1", // Slate-300
  borderSecondary: "#E2E8F0", // Slate-200
  borderInput: "#94A3B8", // Slate-400 (Stronger input border)
  borderFocus: "#FF375D",
  borderSuccess: "#34D399", // Emerald-400

  // Icons
  iconPrimary: "#FF375D",
  iconSecondary: "#0EA5E9", // Sky-500
  iconMuted: "#64748B", // Slate-500

  shadowColor: "rgba(15, 23, 42, 0.1)", // Slightly stronger shadow
  overlay: "rgba(15, 23, 42, 0.6)",

  fixedWhite: "#FFFFFF",
  fixedBlack: "#000000",
  fixedTrophyGold: "#D97706", // Amber-600
  fixedGradientFrom: "#2AC3FF",
  fixedGradientTo: "#FF375D",
  fixedGradientFromLevel: "#FBBF24",
  fixedGradientToLevel: "#F87171",

  starColor: "#F59E0B", // Amber-500 (Brighter)
  pubgolfColor: "#F59E0B",
  gold: "#EAB308", // Yellow-500 (Brighter)
  orange: "#F97316", // Orange-500 (Brighter)
  pink: "#EC4899", // Pink-500 (Brighter)

  challengeFailedBackground: '#FECACA', // Red-200
  challengeFailedBorder: '#EF4444', // Red-500

  challengeCorrectBackground: '#A7F3D0', // Emerald-200
  challengeCorrectBorder: '#10B981', // Emerald-500

  // PubGolf: [Text/Border/GradStart (600), GradEnd (500), Background (200)]
  pubGolf: {
    holeInOne: ['#D97706', '#F59E0B', '#FDE68A'], // Amber-600/500/200
    albatross: ['#7E22CE', '#A855F7', '#E9D5FF'], // Purple-600/500/200
    eagle: ['#C026D3', '#D946EF', '#F5D0FE'], // Fuchsia-600/500/200
    birdie: ['#16A34A', '#22C55E', '#BBF7D0'], // Green-600/500/200
    par: ['#2563EB', '#3B82F6', '#BFDBFE'], // Blue-600/500/200
    bogey: ['#EA580C', '#F97316', '#FED7AA'], // Orange-600/500/200
    doubleBogey: ['#DC2626', '#EF4444', '#FECACA'], // Red-600/500/200
    tripleBogey: ['#4B5563', '#6B7280', '#E5E7EB'], // Gray-600/500/200
  },

  bgPrimaryColor: '#F1F5F9',
  bgSecondaryColor: '#FFFFFF',
  bgAccentColor: '#FEF3C7', // Amber-100

  pubGolfInput: '#94A3B8', // Slate-400 (Swapped from Dark Mode)
};

export const darkTheme = {
  primary: "#FF375D",
  primaryHover: "#F05577",
  primaryText: "#FFFFFF",
  secondary: "#2AC3FF",
  secondaryHover: "#52D3FF",
  secondaryText: "#FFFFFF",
  accent: "#FFC107",
  accentText: "#FFFBE6",

  danger: "#F87171",
  dangerHover: "#FB923C",
  success: "#34D399",
  successText: "#E0FEF2",
  warning: "#FBBF24",
  warningText: "#FDE68A",
  info: "#60A5FA",
  infoText: "#DBEAFE",

  bgPrimary: "#0F172A",
  bgSecondary: "#1E293B",
  bgTertiary: "#334155",
  bgInput: "#1E293B",
  bgDisabled: "#475569",
  bgSuccess: "#064E3B",
  bgInfo: "#1E3A8A",

  textPrimary: "#F1F5F9",
  textSecondary: "#94A3B8",
  textTertiary: "#64748B",
  textDisabled: "#475569",
  textLink: "#2AC3FF",
  textOnPrimary: "#FFFFFF",
  textOnSecondary: "#FFFFFF",
  textOnSuccess: "#A7F3D0",
  textOnInfo: "#BFDBFE",

  borderPrimary: "#334155",
  borderSecondary: "#475569",
  borderInput: "#475569",
  borderFocus: "#2AC3FF",
  borderSuccess: "#10B981",

  iconPrimary: "#FF375D",
  iconSecondary: "#2AC3FF",
  iconMuted: "#64748B",

  shadowColor: "rgba(0,0,0,0.4)",
  overlay: "rgba(0,0,0,0.75)",

  fixedWhite: "#FFFFFF",
  fixedBlack: "#000000",
  fixedTrophyGold: "#FFC107",
  fixedGradientFrom: "#2AC3FF",
  fixedGradientTo: "#FF375D",
  fixedGradientFromLevel: "#FBBF24",
  fixedGradientToLevel: "#F87171",

  starColor: "#FFC107",
  pubgolfColor: "#FFC107",
  gold: "#FFD700",
  orange: "#FF5722",
  pink: "#E91E63",

  challengeFailedBackground: '#2b0e0e',
  challengeFailedBorder: '#F87171',

  challengeCorrectBackground: '#062115',
  challengeCorrectBorder: '#4ADE80',

  pubGolf: {
    holeInOne: ['#FFD700', '#F59E0B', '#291c06'],
    albatross: ['#A855F7', '#9333EA', '#1e1b4b'],
    eagle: ['#E879F9', '#D946EF', '#1f0f21'],
    birdie: ['#4ADE80', '#22C55E', '#062115'],
    par: ['#60A5FA', '#3B82F6', '#0f172a'],
    bogey: ['#FB923C', '#F97316', '#27150a'],
    doubleBogey: ['#F87171', '#EF4444', '#2b0e0e'],
    tripleBogey: ['#9CA3AF', '#6B7280', '#111827'],
  },

  bgPrimaryColor: '#2e1b2bff',
  bgSecondaryColor: '#1a2f42ff',
  bgAccentColor: '#4D4426',

  pubGolfInput: '#334155', // Slate-700 (Swapped from Light Mode)
};