/**
 * Application theme and styling constants
 */

export const COLORS = {
  primary: '#2E7D32', // Green for profit
  primaryLight: '#66BB6A',
  primaryDark: '#1B5E20',

  secondary: '#F57C00', // Orange
  secondaryLight: '#FFB74D',
  secondaryDark: '#E65100',

  success: '#4CAF50', // Green
  error: '#F44336', // Red
  warning: '#FFC107', // Amber
  info: '#2196F3', // Blue

  darkText: '#212121',
  mediumText: '#757575',
  lightText: '#BDBDBD',
  hintText: '#9E9E9E',

  lightBg: '#FFFFFF',
  cardBg: '#F5F5F5',
  dividerColor: '#EEEEEE',

  income: '#4CAF50', // Green
  expense: '#F44336', // Red
  profit: '#2E7D32', // Dark Green
  loss: '#F44336', // Red
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const TYPOGRAPHY = {
  fontSize: {
    h1: 28,
    h2: 24,
    h3: 20,
    h4: 18,
    body: 14,
    caption: 12,
  },
  fontWeight: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    bold: '700' as const,
  },
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 999,
};

export const SHADOWS = {
  sm: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1,
  },
  md: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
  },
  lg: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
  },
};
