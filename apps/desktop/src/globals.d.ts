declare module "*.md" {
  const text: string;
  export default text;
}

// Set by build.mjs. Empty unless built with --dev.
declare const __DEV_URL__: string;
