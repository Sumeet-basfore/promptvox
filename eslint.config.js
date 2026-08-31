import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.wxt/**',
      '**/.output/**',
      '**/src-tauri/target/**',
      'apps/desktop/src/**/*.js',
      'apps/desktop/src/**/*.map',
      'apps/desktop/src/**/*.d.ts',
      'packages/**/dist/**',
    ],
  },
);
