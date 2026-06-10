interface ArticleSummary {
  slug?: unknown
  updatedAt?: unknown
  publishedAt?: unknown
}

interface ArticlesPage {
  content?: ArticleSummary[]
  totalPages?: number
}

interface SitemapEntry {
  path: string
  lastModified?: string
}

const ARTICLE_PAGE_SIZE = 100

const staticEntries: SitemapEntry[] = [
  { path: '/' },
  { path: '/artigos' },
  { path: '/privacy-policy' },
  { path: '/terms-of-use' },
]

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function normalizeSiteUrl(value: string) {
  return value.replace(/\/+$/, '')
}

function normalizeLastModified(value: unknown) {
  if (value == null || value === '') {
    return undefined
  }

  const numericValue = typeof value === 'number' ? value : Number(value)
  const date = Number.isFinite(numericValue)
    ? new Date(numericValue > 9999999999 ? numericValue : numericValue * 1000)
    : new Date(String(value))

  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

async function fetchArticlesPage(backendUrl: string, page: number) {
  return await $fetch<ArticlesPage>('/api/articles/menu', {
    baseURL: backendUrl,
    query: {
      page,
      size: ARTICLE_PAGE_SIZE,
    },
  })
}

async function fetchArticleEntries(backendUrl: string) {
  try {
    const firstPage = await fetchArticlesPage(backendUrl, 0)
    const totalPages = Math.max(1, Number(firstPage.totalPages) || 1)
    const remainingPages = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) => fetchArticlesPage(backendUrl, index + 1)),
    )

    return [firstPage, ...remainingPages]
      .flatMap(page => page.content ?? [])
      .flatMap((article): SitemapEntry[] => {
        const slug = typeof article.slug === 'string' ? article.slug.trim() : ''

        if (!slug) {
          return []
        }

        return [{
          path: `/${encodeURIComponent(slug)}`,
          lastModified: normalizeLastModified(article.updatedAt ?? article.publishedAt),
        }]
      })
  } catch (error) {
    console.error('Could not load article URLs for the sitemap.', error)
    return []
  }
}

function renderSitemap(siteUrl: string, entries: SitemapEntry[]) {
  const urls = entries.map((entry) => {
    const lastModified = entry.lastModified
      ? `\n    <lastmod>${escapeXml(entry.lastModified)}</lastmod>`
      : ''

    return `  <url>\n    <loc>${escapeXml(`${siteUrl}${entry.path}`)}</loc>${lastModified}\n  </url>`
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const siteUrl = normalizeSiteUrl(config.public.siteUrl)
  const backendUrl = normalizeSiteUrl(config.public.backendInternalUrl)
  const articleEntries = await fetchArticleEntries(backendUrl)
  const entries = [...staticEntries, ...articleEntries]

  setHeader(event, 'content-type', 'application/xml; charset=UTF-8')

  return renderSitemap(siteUrl, entries)
})
