/**
 * Feature flags. Flip to true to restore.
 *
 * Optional override via env: VITE_GAMES_ENABLED / VITE_BESTIARY_ENABLED ("true" | "false").
 * Defaults below win when the env var is undefined.
 */

const flag = (envVal: string | undefined, fallback: boolean): boolean => {
  if (envVal === "true") return true;
  if (envVal === "false") return false;
  return fallback;
};

export const GAMES_ENABLED = flag(import.meta.env.VITE_GAMES_ENABLED, false);
export const BESTIARY_ENABLED = flag(import.meta.env.VITE_BESTIARY_ENABLED, false);
