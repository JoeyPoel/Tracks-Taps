export const lightTheme = {
  primary: "#E91E63",
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
  error: "#DC2626", // Red-600
  errorText: "#991B1B", // Red-900

  // Backgrounds - Premium Pro Feel
  // Using a very subtle off-white for the main background to let the white cards pop
  bgPrimary: "#F8FAFC",  // Slate-50
  bgSecondary: "#FFFFFF", // Pure White (Cards/Surfaces) - CRITICAL CHANGE
  bgTertiary: "#F1F5F9", // Slate-100 (Secondary areas)
  bgInput: "#FFFFFF",
  bgDisabled: "#F1F5F9",
  bgSuccess: "#ECFDF5", // Emerald-50 (Subtle)
  bgInfo: "#EFF6FF", // Blue-50 (Subtle)

  // Text - High Contrast & Sharp
  textPrimary: "#1E293B", // Slate-800 (Softer than pure black but very sharp)
  textSecondary: "#475569", // Slate-600
  textTertiary: "#94A3B8", // Slate-400
  textDisabled: "#CBD5E1", // Slate-300
  textLink: "#E91E63",
  textOnPrimary: "#FFFFFF",
  textOnSecondary: "#FFFFFF",
  textOnSuccess: "#064E3B",
  textOnInfo: "#1E3A8A",

  // Borders - Subtle but defined
  borderPrimary: "#E2E8F0", // Slate-200
  borderSecondary: "#F1F5F9", // Slate-100
  borderInput: "#CBD5E1", // Slate-300
  borderFocus: "#E91E63",
  borderSuccess: "#34D399", // Emerald-400

  // Icons
  iconPrimary: "#E91E63",
  iconSecondary: "#0EA5E9", // Sky-500
  iconMuted: "#94A3B8", // Slate-400

  shadowColor: "rgba(0, 0, 0, 0.08)", // Softer, more diffuse shadow
  overlay: "rgba(15, 23, 42, 0.4)", // Lighter overlay

  fixedWhite: "#FFFFFF",
  fixedBlack: "#000000",
  fixedTrophyGold: "#D97706", // Amber-600
  fixedGradientFrom: "#2AC3FF",
  fixedGradientTo: "#E91E63",
  fixedGradientFromLevel: "#FBBF24",
  fixedGradientToLevel: "#F87171",

  starColor: "#F59E0B", // Amber-500
  pubgolfColor: "#F59E0B",
  gold: "#EAB308", // Yellow-500
  orange: "#F97316", // Orange-500
  pink: "#EC4899", // Pink-500

  // Challenge Palette (Centralized)
  challenges: {
    trivia: '#F59E0B',    // Amber
    trueFalse: '#10B981', // Emerald
    picture: '#3B82F6',   // Blue
    riddle: '#8B5CF6',    // Purple
    location: '#EF4444',  // Red
    checkIn: '#EC4899',   // Pink
    dare: '#F97316',      // Orange
    default: '#6B7280',   // Gray
  },

  // Challenge Status Colors - Subtle Tints (No more heavy filters)
  challengeFailedBackground: '#FEF2F2', // Red-50 (Very subtle)
  challengeFailedBorder: '#FCA5A5', // Red-300 (Softer border)

  challengeCorrectBackground: '#F0FDF4', // Emerald-50 (Very subtle)
  challengeCorrectBorder: '#86EFAC', // Emerald-300 (Softer border)

  // PubGolf: [Text/Border/GradStart (600), GradEnd (500), Background (200)]
  pubGolf: {
    holeInOne: ['#D97706', '#F59E0B', '#FFFBEB'], // Amber-600/500/Amber-50
    albatross: ['#7E22CE', '#A855F7', '#FAF5FF'], // Purple-600/500/Purple-50
    eagle: ['#C026D3', '#D946EF', '#FDF4FF'], // Fuchsia-600/500/Fuchsia-50
    birdie: ['#16A34A', '#22C55E', '#F0FDF4'], // Green-600/500/Green-50
    par: ['#2563EB', '#3B82F6', '#EFF6FF'], // Blue-600/500/Blue-50
    bogey: ['#EA580C', '#F97316', '#FFF7ED'], // Orange-600/500/Orange-50
    doubleBogey: ['#DC2626', '#EF4444', '#FEF2F2'], // Red-600/500/Red-50
    tripleBogey: ['#4B5563', '#6B7280', '#F9FAFB'], // Gray-600/500/Gray-50
  },

  bgPrimaryColor: '#F8FAFC',
  bgSecondaryColor: '#FFFFFF',
  bgAccentColor: '#FFFBEB', // Amber-50

  navBarBackground: 'rgba(240, 249, 255, 0.6)', // Slight blue tint (AliceBlue-ish)
  navBarBorder: 'rgba(255,255,255,0.5)',

  pubGolfInput: '#CBD5E1', // Slate-300
};

export const darkTheme = {
  primary: "#E91E63",
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
  error: "#DC2626",
  errorText: "#991B1B",

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

  iconPrimary: "#E91E63",
  iconSecondary: "#2AC3FF",
  iconMuted: "#64748B",

  shadowColor: "rgba(0,0,0,0.4)",
  overlay: "rgba(0,0,0,0.75)",

  fixedWhite: "#FFFFFF",
  fixedBlack: "#000000",
  fixedTrophyGold: "#FFC107",
  fixedGradientFrom: "#2AC3FF",
  fixedGradientTo: "#E91E63",
  fixedGradientFromLevel: "#FBBF24",
  fixedGradientToLevel: "#F87171",

  starColor: "#FFC107",
  pubgolfColor: "#FFC107",
  gold: "#FFD700",
  orange: "#FF5722",
  pink: "#E91E63",

  challenges: {
    trivia: '#FBBF24',    // Amber-400 (Lighter for dark mode)
    trueFalse: '#34D399', // Emerald-400
    picture: '#60A5FA',   // Blue-400
    riddle: '#A78BFA',    // Violet-400
    location: '#F87171',  // Red-400
    checkIn: '#F472B6',   // Pink-400
    dare: '#FB923C',      // Orange-400
    default: '#9CA3AF',   // Gray-400
  },

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

  navBarBackground: 'rgba(15, 23, 42, 0.7)', // Matches bgPrimary (Slate-900)
  navBarBorder: 'rgba(30, 41, 59, 0.5)', // Slate-800 border

  pubGolfInput: '#334155', // Slate-700 (Swapped from Light Mode)
};