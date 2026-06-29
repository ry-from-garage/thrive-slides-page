/**
 * Shared pattern registry.
 * Imported by both index.js (to read) and pattern modules (to register).
 * Must be a separate module so it is initialised before any pattern file runs.
 */
export const registry = {};
export function definePattern(name, fn) { registry[name] = fn; }
