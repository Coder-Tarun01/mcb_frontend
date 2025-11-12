import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import SEOHead from '../components/seo/SEOHead';
import { companiesAPI, jobsAPI } from '../services/api';
import { Job } from '../types/job';
import { extractIdFromSlug, buildCompanySlug } from '../utils/slug';
import JobCard from '../components/jobs/JobCard';

const Company: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const companyId = extractIdFromSlug(slug || '');
  const [company, setCompany] = useState<any | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!companyId) return;
      setLoading(true);
      try {
        const comp = await companiesAPI.getCompany(companyId);
        setCompany(comp);
        const compJobs = await companiesAPI.getCompanyJobs(companyId);
        setJobs(compJobs);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [companyId]);

  const companySlug = company ? (company.slug || buildCompanySlug(company.name, company.id)) : slug;

  if (loading) {
    return <div className="min-h-screen bg-slate-50"><div className="max-w-6xl mx-auto p-6">Loading company…</div></div>;
  }

  if (!company) {
    return <div className="min-h-screen bg-slate-50"><div className="max-w-6xl mx-auto p-6">Company not found.</div></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <SEOHead
        title={`${company.name} | mycareerbuild`}
        description={`Explore jobs at ${company.name}.`}
        canonical={`https://mycareerbuild.com/companies/${companySlug}`}
        ogTitle={`${company.name}`}
        ogDescription={`Jobs and info for ${company.name}`}
        ogUrl={`https://mycareerbuild.com/companies/${companySlug}`}
      />

      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold m-0 mb-2">{company.name}</h1>
        {company.website && (
          <p className="m-0 mb-6"><a href={company.website} target="_blank" rel="noreferrer">{company.website}</a></p>
        )}
        <h2 className="text-xl font-semibold m-0 mb-4">Open roles</h2>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((j, i) => (
            <JobCard key={j.id} job={j} index={i} />
          ))}
        </div>
        {jobs.length === 0 && <p className="text-gray-500 m-0">No jobs listed.</p>}
      </div>
    </div>
  );
};

export default Company;


