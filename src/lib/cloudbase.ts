import cloudbase from '@cloudbase/js-sdk';

export const ENV_ID = import.meta.env.VITE_CLOUDBASE_ENV_ID || 'jieyou-3gr01mvob9ad92de';
export const REGION = import.meta.env.VITE_CLOUDBASE_REGION || 'ap-shanghai';

export const app = cloudbase.init({
  env: ENV_ID,
  region: REGION,
  timeout: 300000
});

export const auth = app.auth({
  persistence: 'local'
});

export const db = app.database();
