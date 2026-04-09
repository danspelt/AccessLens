import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/** @type {import('eslint').Linter.Config[]} */
const nextCoreWebVitals = require('eslint-config-next/core-web-vitals');

const eslintConfig = [
  {
    ignores: ['.next/**', 'node_modules/**', 'out/**', 'build/**', 'coverage/**'],
  },
  ...nextCoreWebVitals,
];

export default eslintConfig;
