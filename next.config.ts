import type { NextConfig } from "next";

let withBundleAnalyzer = (config: NextConfig) => config;

if (process.env.ANALYZE === 'true') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const bundleAnalyzer = require('@next/bundle-analyzer')({
      enabled: true,
    });
    withBundleAnalyzer = bundleAnalyzer;
  } catch {
    console.warn('@next/bundle-analyzer not found, skipping bundle analysis');
  }
}

const nextConfig: NextConfig = {
  // Configuração Turbopack vazia para permitir uso de webpack customizado
  turbopack: {},
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Otimizar chunking para separar vendors
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk para bibliotecas grandes
            framework: {
              name: 'framework',
              chunks: 'all',
              test: /(?<!node_modules.*[\\/])(node_modules[\\/])(react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              priority: 40,
              enforce: true,
            },
            lib: {
              test(module: { resource?: string }) {
                return (
                  module.resource &&
                  /node_modules/.test(module.resource) &&
                  !/node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)/.test(
                    module.resource
                  )
                );
              },
              name(module: { resource?: string }) {
                const packageName = module.resource?.match(/node_modules[\\/](.*?)([\\/]|$)/)?.[1];
                return `npm.${packageName?.replace('@', '')}`;
              },
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
            commons: {
              name: 'commons',
              minChunks: 2,
              priority: 20,
            },
            shared: {
              name(module: { resource?: string }, chunks: { name?: string }[]) {
                return chunks.some((chunk) => chunk.name === 'framework')
                  ? undefined
                  : 'shared';
              },
              priority: 10,
              minChunks: 2,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    return config;
  },
};

export default withBundleAnalyzer(nextConfig);
