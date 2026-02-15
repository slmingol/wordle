import { version as pkgVersion } from "../package.json";

/**
 * Application version imported from package.json.
 * This is the single source of truth for the version number.
 */
export const version = pkgVersion;
