import type { NextConfig } from 'next';
const config: NextConfig = { devIndicators:false, turbopack: {root: process.cwd()}, serverExternalPackages: ['ffmpeg-static', 'ffprobe-static', 'proper-lockfile'], experimental: { proxyClientMaxBodySize: '100mb' } };
export default config;
