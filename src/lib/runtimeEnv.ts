type Env = Partial<Record<string, string>>;

function readRuntime(key: string) {
  if (typeof window !== "undefined" && (window as any).__ENV) {
    return (window as any).__ENV[key];
  }
  return undefined;
}

/** Ambil dari runtime-env.js; fallback ke process.env untuk SSR */
export function getEnv(key: string, fallback = ""): string {
  return readRuntime(key) ?? (process.env as Env)[key] ?? fallback;
}

// Contoh wrapper nyaman:
export const RUNTIME = {
  apiUrl: getEnv("NEXT_PUBLIC_API_URL", ""),
  frontendUrl: getEnv("NEXT_PUBLIC_FRONTEND_URL", ""),
  primeAuthUrl: getEnv("NEXT_PUBLIC_PRIMEAUTH_AUTH_SERVICE_URL", ""),
  realmId: getEnv("NEXT_PUBLIC_PRIMEAUTH_REALM_ID", ""),
  clientId: getEnv("NEXT_PUBLIC_PRIMEAUTH_CLIENT_ID", ""),
  redirectUri: getEnv("NEXT_PUBLIC_PRIMEAUTH_REDIRECT_URI", ""),
  tokenUrl: getEnv("NEXT_PUBLIC_PRIMEAUTH_TOKEN_URL", ""),
  minioPublicBase: getEnv("NEXT_PUBLIC_MINIO_PUBLIC_BASE", ""),
  minioAllowedPrefix: getEnv("NEXT_PUBLIC_MINIO_ALLOWED_PREFIX", ""),
};
