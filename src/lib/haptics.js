/**
 * PLAYER ONE Haptics Engine
 * Provides subtle vibration feedback for mobile users.
 */

export const haptics = {
  // Light tap for toggle or button click
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },
  
  // Medium bump for quest completion or save
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  },
  
  // Strong pulse for level up or boss damage
  heavy: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 30, 50]);
    }
  },
  
  // Error vibration
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  },
  
  // Success pattern
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([20, 50, 20]);
    }
  }
};
