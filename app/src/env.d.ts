/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
interface ImportMetaEnv {
  readonly PUBLIC_GOATCOUNTER_URL?: string;
  readonly PUBLIC_GOATCOUNTER_SCRIPT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}