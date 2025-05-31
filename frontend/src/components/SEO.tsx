import { Helmet } from "react-helmet-async"

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  ogTitle?: string
  ogDescription?: string
  ogType?: string
  twitterCard?: string
  twitterTitle?: string
  twitterDescription?: string
  canonical?: string
}

export default function SEO({
  title = "ScholarLog - Academic Progress Tracker",
  description = "Track your academic progress, manage courses, assignments, and calculate your GPA with ScholarLog - the ultimate student companion.",
  keywords = "academic tracker, GPA calculator, course management, assignment tracker, student tools",
  ogTitle,
  ogDescription,
  ogType = "website",
  twitterCard = "summary_large_image",
  twitterTitle,
  twitterDescription,
  canonical = "https://scholarlog.com",
}: SEOProps) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta property="og:title" content={ogTitle || title} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:type" content={ogType} />
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={twitterTitle || title} />
      <meta name="twitter:description" content={twitterDescription || description} />
      <link rel="canonical" href={canonical} />
    </Helmet>
  )
} 