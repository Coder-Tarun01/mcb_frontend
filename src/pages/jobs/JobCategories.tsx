import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Code, 
  Briefcase, 
  Heart, 
  DollarSign,
  Users,
  Truck,
  GraduationCap,
  Palette,
  Search,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { jobsAPI } from '../../services/api';
import { Job } from '../../types/job';

const JobCategories: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryStats, setCategoryStats] = useState<{[key: string]: number}>({});

  useEffect(() => {
    loadJobsAndCalculateStats();
  }, []);

  const loadJobsAndCalculateStats = async () => {
    try {
      setLoading(true);
      const response = await jobsAPI.fetchJobs();
      const jobsData = response.jobs || response || [];
      const jobsArray = Array.isArray(jobsData) ? jobsData : [];
      
      setJobs(jobsArray);
      
      // Calculate job counts by category
      const stats: {[key: string]: number} = {};
      jobsArray.forEach(job => {
        if (job.category) {
          stats[job.category] = (stats[job.category] || 0) + 1;
        }
      });
      setCategoryStats(stats);
    } catch (error) {
      console.error('Error loading jobs for categories:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    {
      id: 'technology',
      name: 'Technology',
      icon: Code,
      jobCount: categoryStats['Technology'] || categoryStats['technology'] || 0,
      color: '#3b82f6',
      subcategories: ['Software Development', 'Data Science', 'DevOps', 'Cybersecurity']
    },
    {
      id: 'business',
      name: 'Business & Management',
      icon: Briefcase,
      jobCount: categoryStats['Business'] || categoryStats['business'] || 0,
      color: '#059669',
      subcategories: ['Project Management', 'Business Analysis', 'Operations', 'Strategy']
    },
    {
      id: 'healthcare',
      name: 'Healthcare',
      icon: Heart,
      jobCount: categoryStats['Healthcare'] || categoryStats['healthcare'] || 0,
      color: '#dc2626',
      subcategories: ['Nursing', 'Medical', 'Healthcare Admin', 'Pharmacy']
    },
    {
      id: 'finance',
      name: 'Finance & Accounting',
      icon: DollarSign,
      jobCount: categoryStats['Finance'] || categoryStats['finance'] || 0,
      color: '#7c3aed',
      subcategories: ['Accounting', 'Financial Analysis', 'Banking', 'Investment']
    },
    {
      id: 'marketing',
      name: 'Marketing & Sales',
      icon: Users,
      jobCount: categoryStats['Marketing'] || categoryStats['marketing'] || 0,
      color: '#ea580c',
      subcategories: ['Digital Marketing', 'Sales', 'Content Marketing', 'Brand Management']
    },
    {
      id: 'logistics',
      name: 'Logistics & Supply Chain',
      icon: Truck,
      jobCount: categoryStats['Logistics'] || categoryStats['logistics'] || 0,
      color: '#0891b2',
      subcategories: ['Supply Chain', 'Logistics', 'Procurement', 'Transportation']
    },
    {
      id: 'education',
      name: 'Education',
      icon: GraduationCap,
      jobCount: categoryStats['Education'] || categoryStats['education'] || 0,
      color: '#65a30d',
      subcategories: ['Teaching', 'Training', 'Curriculum Development', 'Educational Technology']
    },
    {
      id: 'design',
      name: 'Design & Creative',
      icon: Palette,
      jobCount: categoryStats['Design'] || categoryStats['design'] || 0,
      color: '#c026d3',
      subcategories: ['UI/UX Design', 'Graphic Design', 'Creative Direction', 'Web Design']
    }
  ];

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.subcategories.some(sub => sub.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCategoryClick = (categoryId: string, categoryName: string) => {
    // Navigate to jobs page with category filter
    navigate(`/jobs?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="pt-4 pb-5 px-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-5xl font-bold text-gray-800 m-0 mb-3 bg-gradient-to-br from-blue-500 to-blue-700 bg-clip-text text-transparent scroll-mt-20 py-4">
              Job Categories
            </h1>
          <p className="text-lg text-gray-500 m-0 font-medium text-center block w-full">
            Explore job opportunities by industry and specialization
          </p>
        </div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 flex justify-center"
        >
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-3.5 px-4 pl-12 border-2 border-gray-200 rounded-xl text-base bg-white transition-all duration-300 outline-none shadow-sm shadow-black/5 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/10"
            />
          </div>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center items-center py-20"
          >
            <div className="flex flex-col items-center gap-4 text-gray-500">
              <Loader2 className="w-10 h-10 animate-spin" />
              <p>Loading job categories...</p>
            </div>
          </motion.div>
        ) : (
          /* Categories Grid */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 mb-12"
          >
          {filteredCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ 
                y: -8,
                transition: { duration: 0.3 }
              }}
              className="bg-white rounded-2xl p-6 shadow-md shadow-black/5 border border-gray-200 cursor-pointer transition-all duration-300 flex items-start gap-5 relative overflow-hidden hover:-translate-y-1 hover:shadow-lg hover:shadow-black/10 hover:border-blue-500 group"
              onClick={() => handleCategoryClick(category.id, category.name)}
            >
              {/* Top border effect */}
              <div className="absolute top-0 left-0 right-0 h-0.75 bg-gradient-to-r from-blue-500 to-blue-700 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></div>
              
              <div 
                className="w-15 h-15 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${category.color}20` }}
              >
                <category.icon 
                  className="w-7 h-7" 
                  style={{ color: category.color }}
                />
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 m-0 mb-2">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500 m-0 mb-4 font-medium">
                  {category.jobCount} jobs available
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {category.subcategories.map((sub, subIndex) => (
                    <span key={subIndex} className="bg-slate-100 text-slate-600 py-1 px-3 rounded-2xl text-xs font-medium border border-slate-200">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              <div className="self-center opacity-50 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1">
                <ArrowRight className="w-5 h-5 text-gray-500" />
              </div>
            </motion.div>
          ))}
            {filteredCategories.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 px-6 text-gray-500 col-span-full"
              >
                <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-700 m-0 mb-2">
                  No categories found
                </h3>
                <p className="text-sm m-0">
                  Try adjusting your search terms to find relevant categories.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-md shadow-black/5 border border-gray-200"
        >
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-8">
            <div className="text-center">
              <h3 className="text-4xl font-bold text-gray-800 m-0 mb-2 bg-gradient-to-br from-blue-500 to-blue-700 bg-clip-text text-transparent">
                {jobs.length.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-500 m-0 font-medium uppercase tracking-wider">
                Total Jobs
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-4xl font-bold text-gray-800 m-0 mb-2 bg-gradient-to-br from-blue-500 to-blue-700 bg-clip-text text-transparent">
                {categories.length}
              </h3>
              <p className="text-sm text-gray-500 m-0 font-medium uppercase tracking-wider">
                Categories
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-4xl font-bold text-gray-800 m-0 mb-2 bg-gradient-to-br from-blue-500 to-blue-700 bg-clip-text text-transparent">
                {new Set(jobs.map(job => job.company)).size}
              </h3>
              <p className="text-sm text-gray-500 m-0 font-medium uppercase tracking-wider">
                Companies
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-4xl font-bold text-gray-800 m-0 mb-2 bg-gradient-to-br from-blue-500 to-blue-700 bg-clip-text text-transparent">
                {new Set(jobs.map(job => job.location).filter(Boolean)).size}
              </h3>
              <p className="text-sm text-gray-500 m-0 font-medium uppercase tracking-wider">
                Locations
              </p>
            </div>
          </div>
        </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default JobCategories;
