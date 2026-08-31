import { defineConfig } from 'wxt';
import react from '@vitejs/plugin-react';

export default defineConfig({
  vite: () => ({
    plugins: [react()],
  }),
  manifest: {
    name: 'PromptVox',
    description: 'Voice-to-prompt developer tool',
    permissions: ['storage', 'activeTab'],
  },
});
