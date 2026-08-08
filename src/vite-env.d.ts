/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PAYSTACK_PUBLIC_KEY: string;
  readonly VITE_ADSENSE_PUBLISHER_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
