// Vite environment variable types
// Standalone declarations so tsc works without vite installed

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly MODE: string;
  readonly BASE_URL: string;
  readonly PROD: boolean;
  readonly DEV: boolean;
  readonly SSR: boolean;
  [key: string]: string | boolean | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
