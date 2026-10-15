import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * GitHub Pages のサブディレクトリ配信に対応した base パスを決める。
 *  - BASE_PATH 環境変数があれば最優先（例: BASE_PATH=/ でルート公開）
 *  - GitHub Actions 上では GITHUB_REPOSITORY からリポジトリ名を取り、
 *    `<user>.github.io` リポジトリならルート、それ以外は `/<repo>/`
 *  - それ以外（ローカル）は既定値
 */
export function resolveBasePath(env: Record<string, string | undefined>): string {
  if (env.BASE_PATH) return env.BASE_PATH.endsWith('/') ? env.BASE_PATH : `${env.BASE_PATH}/`
  const repo = env.GITHUB_REPOSITORY?.split('/')[1]
  if (repo) return repo.endsWith('.github.io') ? '/' : `/${repo}/`
  return '/japan_ci-va_map/'
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: resolveBasePath(process.env),
  build: {
    target: 'es2020',
    sourcemap: false,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.ts',
    include: ['tests/unit/**/*.test.ts'],
    exclude: ['tests/e2e/**', 'legacy/**', 'node_modules/**'],
  },
})
