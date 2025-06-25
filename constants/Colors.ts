/**
 * ShelfSpot Color Palette - Modern and minimalist design
 * Colors are defined for light and dark modes with soft blue/gray/white tones
 */

const primaryBlue = '#4F7CAC';
const secondaryBlue = '#6699CC';
const lightGray = '#F5F7FA';
const darkGray = '#2D3748';

export const Colors = {
  light: {
    text: '#2D3748',
    textSecondary: '#718096',
    background: '#FFFFFF',
    backgroundSecondary: '#F7FAFC',
    surface: '#FFFFFF',
    border: '#E2E8F0',
    tint: primaryBlue,
    primary: primaryBlue,
    secondary: secondaryBlue,
    success: '#48BB78',
    warning: '#ED8936',
    error: '#F56565',
    info: '#4299E1',
    icon: '#A0AEC0',
    tabIconDefault: '#A0AEC0',
    tabIconSelected: primaryBlue,
    card: '#FFFFFF',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  dark: {
    text: '#F7FAFC',
    textSecondary: '#A0AEC0',
    background: '#1A202C',
    backgroundSecondary: '#2D3748',
    surface: '#2D3748',
    border: '#4A5568',
    tint: '#90CDF4',
    primary: '#90CDF4',
    secondary: '#63B3ED',
    success: '#68D391',
    warning: '#F6AD55',
    error: '#FC8181',
    info: '#63B3ED',
    icon: '#718096',
    tabIconDefault: '#718096',
    tabIconSelected: '#90CDF4',
    card: '#2D3748',
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
};

export const StatusColors = {
  available: '#48BB78',
  running_low: '#ED8936',
  out_of_stock: '#F56565',
  expired: '#805AD5',
};

export const TagColors = [
  '#E53E3E', '#D69E2E', '#38A169', '#3182CE', 
  '#805AD5', '#D53F8C', '#00B5D8', '#319795'
];
