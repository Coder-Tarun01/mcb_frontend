import React from 'react';

interface JobPostingSchemaProps {
  jobTitle: string;
  jobDescription: string;
  companyName: string;
  companyLogo?: string;
  companyUrl?: string;
  jobLocation: {
    streetAddress?: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  baseSalary?: {
    currency: string;
    minValue: number;
    maxValue: number;
  };
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACTOR' | 'TEMPORARY' | 'INTERN' | 'VOLUNTEER' | 'PER_DIEM' | 'OTHER';
  datePosted: string;
  validThrough?: string;
  qualifications?: string;
  responsibilities?: string;
  skills?: string;
  workHours?: string;
  benefits?: string;
}

const JobPostingSchema: React.FC<JobPostingSchemaProps> = ({
  jobTitle,
  jobDescription,
  companyName,
  companyLogo,
  companyUrl,
  jobLocation,
  baseSalary,
  employmentType,
  datePosted,
  validThrough,
  qualifications,
  responsibilities,
  skills,
  workHours,
  benefits
}) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": jobTitle,
    "description": jobDescription,
    "datePosted": datePosted,
    "validThrough": validThrough,
    "employmentType": employmentType,
    "hiringOrganization": {
      "@type": "Organization",
      "name": companyName,
      "sameAs": companyUrl,
      "logo": companyLogo
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": jobLocation.streetAddress,
        "addressLocality": jobLocation.addressLocality,
        "addressRegion": jobLocation.addressRegion,
        "postalCode": jobLocation.postalCode,
        "addressCountry": jobLocation.addressCountry
      }
    },
    ...(baseSalary && {
      "baseSalary": {
        "@type": "MonetaryAmount",
        "currency": baseSalary.currency,
        "value": {
          "@type": "QuantitativeValue",
          "minValue": baseSalary.minValue,
          "maxValue": baseSalary.maxValue,
          "unitText": "YEAR"
        }
      }
    }),
    ...(qualifications && { "qualifications": qualifications }),
    ...(responsibilities && { "responsibilities": responsibilities }),
    ...(skills && { "skills": skills }),
    ...(workHours && { "workHours": workHours }),
    ...(benefits && { "benefits": benefits })
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

export default JobPostingSchema;
