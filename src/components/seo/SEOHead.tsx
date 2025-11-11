import React from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  structuredData?: object;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = "mycareerbuild Jobs - Find Your Dream Career | Job Portal India",
  description = "Discover 50,000+ jobs at mycareerbuild. Connect with top employers, build your career. Free job alerts, resume builder & career guidance.",
  keywords = "jobs, careers, employment, job portal, job search, recruitment, hiring, software engineer jobs, data scientist jobs, marketing jobs, hr jobs, remote jobs, work from home, India jobs, career opportunities, job alerts, resume builder",
  canonical,
  ogTitle,
  ogDescription,
  ogImage = "/logo.png",
  ogUrl,
  twitterCard = "summary_large_image",
  twitterTitle,
  twitterDescription,
  twitterImage = "/logo.png",
  structuredData
}) => {
  // Optimize title length (50-60 characters for best SEO)
  const fullTitle = title.length > 60 ? title.substring(0, 57) + "..." : title;
  
  // Optimize description length (150-160 characters for best SEO)
  const fullDescription = description.length > 160 ? description.substring(0, 157) + "..." : description;
  
  // Generate canonical URL safely
  const canonicalUrl = canonical || (typeof window !== 'undefined' ? window.location.href : 'https://mycareerbuild.com');
  
  // Generate Open Graph URL safely
  const ogUrlFinal = ogUrl || (typeof window !== 'undefined' ? window.location.href : 'https://mycareerbuild.com');

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow" />
      <meta name="author" content="mycareerbuild - MyCareerBuild" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />
      
      {/* Language and Geo targeting */}
      <meta name="language" content="English" />
      <meta name="geo.region" content="IN" />
      <meta name="geo.country" content="India" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={ogTitle || fullTitle} />
      <meta property="og:description" content={ogDescription || fullDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={ogUrlFinal} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="mycareerbuild - MyCareerBuild" />
      <meta property="og:locale" content="en_IN" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={twitterTitle || fullTitle} />
      <meta name="twitter:description" content={twitterDescription || fullDescription} />
      <meta name="twitter:image" content={twitterImage} />
      <meta name="twitter:site" content="@mycareerbuildjobs" />
      <meta name="twitter:creator" content="@mycareerbuildjobs" />
      
      {/* Additional SEO Meta Tags */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="mycareerbuild Jobs" />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
