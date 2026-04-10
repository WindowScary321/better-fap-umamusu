import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
  runner: {
    binaries: {
      chrome: 'C:\\Users\\tusieumap\\scoop\\apps\\ungoogled-chromium\\current\\chrome.exe'
    }
  },
  modules: ['@wxt-dev/module-vue'],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    name: "FAP Beautifier Vue",
    version: "2.0.1",
    description: "Modern UI for FPT University Academic Portal",
    permissions: [
      "storage",
      "scripting",
      "identity"
    ],
    host_permissions: [
      "*://fap.fpt.edu.vn/*"
    ],
    web_accessible_resources: [
      {
        resources: ["*"],
        matches: ["*://fap.fpt.edu.vn/*"]
      }
    ]
  }
});
