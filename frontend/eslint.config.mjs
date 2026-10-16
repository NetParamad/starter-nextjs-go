import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

const config = [
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    ignores: [
      ".next/**",
      "eslint.config.mjs",
      "next-env.d.ts",
      "node_modules/**",
      "public/sitemap*.xml",
      "public/robots.txt",
    ],
  },
];

export default config;
