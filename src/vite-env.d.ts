/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLOUDBASE_ENV_ID?: string;
  readonly VITE_CLOUDBASE_REGION?: string;
  readonly VITE_DEFAULT_LOGIN_EMAIL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
