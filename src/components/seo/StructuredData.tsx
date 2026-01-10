import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

export const StructuredData = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const baseUrl = window.location.origin;
  
  // Main website structured data
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": t('header.brand'),
    "url": baseUrl,
    "description": t('homepage.description'),
    "inLanguage": "en",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "mainEntity": {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`
    }
  };

  // Organization structured data
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${baseUrl}/#organization`,
    "name": t('header.brand'),
    "url": baseUrl,
    "description": t('homepage.description'),
    "foundingDate": "2024",
    "industry": "Financial Technology",
    "numberOfEmployees": "1-10",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "US"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "availableLanguage": ["English", "Spanish", "French", "Hebrew", "Arabic", "Russian"]
    },
    "sameAs": [
      baseUrl
    ]
  };

  // Breadcrumbs for SEO and sitelinks
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": t('nav.home'),
        "item": baseUrl
      },
      {
        "@type": "ListItem", 
        "position": 2,
        "name": t('nav.about'),
        "item": `${baseUrl}/about`
      },
      {
        "@type": "ListItem",
        "position": 3, 
        "name": t('nav.services'),
        "item": `${baseUrl}/services`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": t('nav.demo'),
        "item": `${baseUrl}/demo`
      },
      {
        "@type": "ListItem",
        "position": 5,
        "name": t('nav.liveChat'), 
        "item": `${baseUrl}/live-demo-mini`
      },
      {
        "@type": "ListItem",
        "position": 6,
        "name": t('nav.pricing'),
        "item": `${baseUrl}/pricing`
      },
      {
        "@type": "ListItem",
        "position": 7,
        "name": t('nav.contact'),
        "item": `${baseUrl}/contact`
      }
    ]
  };

  // Service schema for better understanding
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Trading Algorithm Development & Tool Rental",
    "description": t('homepage.description'),
    "provider": {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`
    },
    "areaServed": "Worldwide",
    "serviceType": "Financial Technology Software",
    "category": "Trading Tools",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Trading Tools Catalog",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "SoftwareApplication",
            "name": "Micro S&P 500 Tools",
            "category": "Trading Software"
          }
        },
        {
          "@type": "Offer", 
          "itemOffered": {
            "@type": "SoftwareApplication",
            "name": "Mini S&P 500 Tools",
            "category": "Trading Software"
          }
        }
      ]
    }
  };

  // Combine all schemas
  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [
      websiteSchema,
      organizationSchema,
      breadcrumbSchema,
      serviceSchema
    ]
  };

  return (
    <script 
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(combinedSchema, null, 2)
      }}
    />
  );
};