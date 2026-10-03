import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir:'tests/e2e', timeout:120000, workers:1, use:{ baseURL:'http://127.0.0.1:3000', headless:true, launchOptions:{executablePath:process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}, viewport:{width:1500,height:1000}, screenshot:'only-on-failure' } });
