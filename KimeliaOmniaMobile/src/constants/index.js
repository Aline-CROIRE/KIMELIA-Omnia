export const API_BASE_URL = 'https://kimelia-omnia.onrender.com/api/v1';

export const COLORS = {
  chocolateBrown: '#5D3A1A', // Logo, main icons, headers - Stability, reliability, sophistication
  deepCoffee: '#3B2F2F',    // Text, secondary icons - Premium, strong, readable
  lightCocoa: '#D2B48C',    // Backgrounds, UI panels - Warmth, approachability, minimalism
  softCream: '#FFF8F0',     // Backgrounds, overlays - Clean, bright, versatile
  copper: '#A9746E',        // Logo highlights, buttons, subtle gradients - Luxury, elegance, warmth
  tan: '#C8A27D',           // UI accents, subtle borders - Friendly, natural, calm
  gold: '#D4AF37',          // New: A rich gold for accents and gradients
  white: '#FFFFFF',
  black: '#000000',
  errorRed: '#FF6347',
  successGreen: '#4CAF50',
};

// Define common gradients using the COLORS palette
export const GRADIENTS = {
  primaryButton: [COLORS.chocolateBrown, COLORS.copper],
  secondaryButton: [COLORS.tan, COLORS.lightCocoa],
  background: [COLORS.softCream, COLORS.lightCocoa], // For subtle background gradients
  goldAccent: [COLORS.gold, COLORS.copper],
};

export const FONTS = {
    primary: 'System', // Placeholder for Poppins or Nunito Sans
    secondary: 'System', // Placeholder for Lato or Inter
    logo: 'System', // Placeholder for a bold, sans-serif font
};