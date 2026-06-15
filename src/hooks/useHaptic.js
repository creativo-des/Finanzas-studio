export const useHaptic = () => ({
  light:   () => navigator.vibrate?.(5),
  medium:  () => navigator.vibrate?.(10),
  heavy:   () => navigator.vibrate?.(20),
  success: () => navigator.vibrate?.([5, 30, 5]),
  warning: () => navigator.vibrate?.([10, 50, 10]),
})
