/**
 * Storage utilities for NeuraGlow
 * Ensures all pre-seeded legacy topics (e.g. quantum-entanglement, french-revolution, react-hooks)
 * are thoroughly purged from client-side localStorage, keeping the study canvas truly blank.
 */

export const OLD_PRESEEDED_SLUGS = [
  'quantum-entanglement',
  'french-revolution',
  'react-hooks',
  'krebs-cycle',
  'kinematics',
  'recursion',
];

export function getCleanSavedLibrary(): any[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('neuraglow_saved_library');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Filter out old pre-seeded mock items (keep user-generated packages with fullPackage)
    const cleaned = parsed.filter(
      (item: any) => item && item.slug && (!OLD_PRESEEDED_SLUGS.includes(item.slug.toLowerCase().trim()) || item.fullPackage)
    );

    // Save cleaned list back to localStorage so stale items don't linger
    if (cleaned.length !== parsed.length) {
      localStorage.setItem('neuraglow_saved_library', JSON.stringify(cleaned));
    }
    return cleaned;
  } catch (e) {
    console.warn('Error reading saved library:', e);
    return [];
  }
}

export function clearAllSavedLibrary(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('neuraglow_saved_library');
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.warn('Error clearing saved library:', e);
  }
}
