import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    minify: 'terser',
    sourcemap: true,
    rollupOptions: {
      output: {
        // 代码分割优化：按路由和依赖分割代码
        manualChunks: {
          // React 核心库
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI 组件库
          'ui-vendor': ['@headlessui/react'],
          // Markdown 渲染相关
          'markdown': [
            'react-markdown',
            'remark-gfm',
            'rehype-raw',
            'rehype-highlight',
          ],
          // 状态管理
          'state': ['zustand'],
          // 虚拟滚动
          'virtual': ['@tanstack/react-virtual'],
        },
      },
    },
    // 分块大小警告阈值
    chunkSizeWarningLimit: 1000,
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@headlessui/react',
      'react-markdown',
      'remark-gfm',
      'rehype-raw',
      'rehype-highlight',
      'zustand',
      '@tanstack/react-virtual',
    ],
  },
});
