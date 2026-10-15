import { defineConfig, type Plugin } from 'vitest/config'
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

/**
 * OGP 用の公開 URL（末尾スラッシュ付き）。og:image などは絶対 URL が必要なため。
 *  - SITE_URL 環境変数があれば最優先（独自ドメインなど）
 *  - GitHub Actions 上では https://<owner>.github.io + base
 *  - ローカルは既定のリポジトリの公開 URL
 */
export function resolveSiteUrl(env: Record<string, string | undefined>, base: string): string {
  if (env.SITE_URL) return env.SITE_URL.endsWith('/') ? env.SITE_URL : `${env.SITE_URL}/`
  const owner = env.GITHUB_REPOSITORY_OWNER ?? env.GITHUB_REPOSITORY?.split('/')[0] ?? '238sakurai'
  return `https://${owner.toLowerCase()}.github.io${base}`
}

const base = resolveBasePath(process.env)
const siteUrl = resolveSiteUrl(process.env, base)

/** index.html の %SITE_URL% を公開 URL に置き換える */
function siteUrlPlugin(url: string): Plugin {
  return {
    name: 'site-url',
    transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', url),
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), siteUrlPlugin(siteUrl)],
  base,
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
