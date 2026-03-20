import { notFound } from 'next/navigation'
import { query } from '@/lib/db'

async function getSchool(subdomain: string) {
  const result = await query(
    'SELECT * FROM schools WHERE subdomain = $1 AND status = $2',
    [subdomain, 'active']
  )
  return result.rows[0] || null
}

export default async function SchoolLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { subdomain: string }
}) {
  const school = await getSchool(params.subdomain)

  if (!school) notFound()

  return (
    <html lang="en">
      <head>
        <title>{school.name}</title>
        <style>{`
          :root {
            --school-primary: ${school.primary_color || '#4f46e5'};
            --school-secondary: ${school.secondary_color || '#6366f1'};
          }
        `}</style>
      </head>
      <body>
        {/* Inject school context for client components */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__SCHOOL__ = ${JSON.stringify({
              id: school.id,
              name: school.name,
              subdomain: school.subdomain,
              plan: school.plan,
              logo_url: school.logo_url,
              primary_color: school.primary_color,
              secondary_color: school.secondary_color,
            })}`
          }}
        />
        {children}
      </body>
    </html>
  )
}