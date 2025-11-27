import React from 'react';

interface OrganizationSchemaProps {
  name?: string;
  description?: string;
  url?: string;
  logo?: string;
  contactPoint?: {
    telephone?: string;
    email?: string;
    contactType?: string;
  };
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  sameAs?: string[];
}

const OrganizationSchema: React.FC<OrganizationSchemaProps> = ({
  name = "mycareerbuild - MyCareerBuild",
  description = "India's leading job portal connecting talented professionals with amazing career opportunities. Find your dream job or hire the best talent.",
  url = "http://localhost:3000",
  logo = "http://localhost:3000/logo.png",
  contactPoint = {
    telephone: "+1 (555) 123-4567",
    email: "support@mycareerbuild.com",
    contactType: "customer service"
  },
  address = {
    streetAddress: "123 Business St",
    addressLocality: "City",
    addressRegion: "State",
    postalCode: "12345",
    addressCountry: "IN"
  },
  sameAs = [
    "https://linkedin.com/company/mycareerbuild",
    "https://twitter.com/mycareerbuild_jobs",
    "https://facebook.com/mycareerbuildjobs"
  ]
}) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": name,
    "description": description,
    "url": url,
    "logo": logo,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": contactPoint.telephone,
      "email": contactPoint.email,
      "contactType": contactPoint.contactType
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": address.streetAddress,
      "addressLocality": address.addressLocality,
      "addressRegion": address.addressRegion,
      "postalCode": address.postalCode,
      "addressCountry": address.addressCountry
    },
    "sameAs": sameAs
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

export default OrganizationSchema;
