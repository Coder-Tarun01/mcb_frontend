import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Calendar, 
  User, 
  Clock, 
  ArrowRight, 
  Tag, 
  TrendingUp,
  BookOpen,
  Star,
  Share2,
  Heart,
  Filter,
  Grid3X3,
  List,
  Mail,
  Twitter,
  Linkedin,
  Facebook,
  ChevronRight,
  Award,
  Target,
  Zap
} from 'lucide-react';

type Blog = {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  authorAvatar?: string;
  date: string;
  readMinutes: number;
  cover: string;
  tags: string[];
  excerpt: string;
  category: string;
  featured: boolean;
  trending: boolean;
  likes: number;
  views: number;
};

const sampleBlogs: Blog[] = [
  {
    id: 'ai-resume-optimization-2024',
    title: 'The Future of Resume Optimization: AI-Powered Career Success',
    subtitle: 'How artificial intelligence is revolutionizing job applications',
    author: 'Sarah Chen',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    date: '2024-01-15',
    readMinutes: 8,
    cover: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop',
    tags: ['AI', 'Resume', 'Career Tips', 'Technology'],
    category: 'Career Development',
    featured: true,
    trending: true,
    likes: 1247,
    views: 15600,
    excerpt: 'Discover how AI tools are transforming resume writing, from keyword optimization to ATS compatibility, and learn the strategies that top performers use to land their dream jobs in 2024.'
  },
  {
    id: 'remote-work-productivity',
    title: 'Mastering Remote Work: Productivity Hacks for the Modern Professional',
    subtitle: 'Essential strategies for thriving in distributed teams',
    author: 'Marcus Rodriguez',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    date: '2024-01-12',
    readMinutes: 6,
    cover: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=600&fit=crop',
    tags: ['Remote Work', 'Productivity', 'Work-Life Balance'],
    category: 'Workplace',
    featured: false,
    trending: true,
    likes: 892,
    views: 12300,
    excerpt: 'Learn proven techniques to maximize your productivity while working remotely, including time management, communication strategies, and maintaining work-life boundaries.'
  },
  {
    id: 'interview-psychology',
    title: 'The Psychology of Successful Interviews: What Hiring Managers Really Think',
    subtitle: 'Insider insights from 100+ hiring managers',
    author: 'Dr. Emily Watson',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    date: '2024-01-10',
    readMinutes: 7,
    cover: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=600&fit=crop',
    tags: ['Interviews', 'Psychology', 'Hiring'],
    category: 'Career Development',
    featured: false,
    trending: false,
    likes: 654,
    views: 8900,
    excerpt: 'Uncover the psychological factors that influence hiring decisions and learn how to present yourself as the ideal candidate through strategic communication and body language.'
  },
  {
    id: 'salary-negotiation-guide',
    title: 'The Complete Guide to Salary Negotiation in 2024',
    subtitle: 'Maximize your earning potential with data-driven strategies',
    author: 'James Thompson',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    date: '2024-01-08',
    readMinutes: 9,
    cover: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop',
    tags: ['Salary', 'Negotiation', 'Career Growth'],
    category: 'Career Development',
    featured: false,
    trending: true,
    likes: 1156,
    views: 14200,
    excerpt: 'Master the art of salary negotiation with proven frameworks, market research techniques, and communication strategies that can increase your compensation by 15-30%.'
  },
  {
    id: 'startup-career-path',
    title: 'Building Your Career in Startups: Opportunities and Challenges',
    subtitle: 'Navigate the fast-paced world of startup employment',
    author: 'Alex Kim',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    date: '2024-01-05',
    readMinutes: 5,
    cover: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=600&fit=crop',
    tags: ['Startups', 'Career Path', 'Entrepreneurship'],
    category: 'Industry Insights',
    featured: false,
    trending: false,
    likes: 423,
    views: 6700,
    excerpt: 'Explore the unique opportunities and challenges of building a career in startups, from equity considerations to rapid skill development and networking strategies.'
  },
  {
    id: 'leadership-skills',
    title: 'Developing Leadership Skills: From Individual Contributor to Team Leader',
    subtitle: 'Essential leadership competencies for career advancement',
    author: 'Maria Garcia',
    authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    date: '2024-01-03',
    readMinutes: 6,
    cover: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop',
    tags: ['Leadership', 'Management', 'Career Growth'],
    category: 'Career Development',
    featured: false,
    trending: false,
    likes: 789,
    views: 9800,
    excerpt: 'Learn the key leadership skills that separate good managers from great leaders, including emotional intelligence, decision-making, and team motivation techniques.'
  }
];

const categories = ['All', 'Career Development', 'Workplace', 'Industry Insights', 'Technology'];
const trendingTopics = ['AI in Hiring', 'Remote Work', 'Salary Trends', 'Career Pivots', 'Leadership'];

const Blogs: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const filteredBlogs = useMemo(() => {
    return sampleBlogs.filter(blog => {
      const matchesSearch = searchQuery === '' || 
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'All' || blog.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const featuredBlog = sampleBlogs.find(blog => blog.featured);
  const trendingBlogs = sampleBlogs.filter(blog => blog.trending).slice(0, 3);
  const regularBlogs = filteredBlogs.filter(blog => !blog.featured);

  const handleLike = (blogId: string) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(blogId)) {
        newSet.delete(blogId);
      } else {
        newSet.add(blogId);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden py-12 sm:py-16">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-800 via-blue-500 via-blue-400 to-blue-200 z-10">
          <div className="absolute inset-0 opacity-30" style={{backgroundImage: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"grid\" width=\"10\" height=\"10\" patternUnits=\"userSpaceOnUse\"><path d=\"M 10 0 L 0 0 0 10\" fill=\"none\" stroke=\"rgba(255,255,255,0.1)\" stroke-width=\"0.5\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23grid)\"/></svg>')"}}></div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30 z-20"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-30">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white max-w-4xl mx-auto px-2 sm:px-4"
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 text-white py-2 px-4 rounded-full text-sm font-semibold mb-6 uppercase tracking-wider">
              <TrendingUp className="text-white" />
              <span className="text-white">Latest Insights</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black m-0 mb-3 leading-tight bg-gradient-to-br from-white to-blue-100 bg-clip-text text-transparent">
              Career Intelligence Hub
            </h1>
            <p className="text-lg m-0 mb-8 opacity-90 leading-relaxed max-w-2xl mx-auto text-white">
              Stay ahead with expert insights, industry trends, and actionable career advice from leading professionals and thought leaders.
            </p>
            
            {/* Search Bar */}
            <div className="mb-8 px-2 sm:px-4 md:px-0">
              <div className="relative max-w-2xl mx-auto flex flex-col sm:flex-row items-center bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-full p-2 shadow-2xl shadow-black/10 gap-2">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 z-10 hidden sm:block" />
                <input
                  type="text"
                  placeholder="Search articles, topics, or authors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 w-full py-4 px-5 sm:pl-12 border-none bg-transparent text-base outline-none text-gray-800 placeholder:text-gray-400"
                />
                <button className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-700 text-white border-none rounded-xl sm:rounded-full py-3 px-5 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/40">
                  <Search size={20} />
                </button>
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map(category => (
                <button
                  key={category}
                  className={`bg-white/15 backdrop-blur-md border border-white/30 text-white py-2.5 px-5 rounded-full font-semibold cursor-pointer transition-all duration-300 uppercase tracking-wider text-sm hover:bg-white/25 hover:-translate-y-0.5 ${selectedCategory === category ? 'bg-white text-blue-800 shadow-lg shadow-white/30' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Article */}
      {featuredBlog && (
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gradient-to-br from-slate-50 to-slate-200 rounded-3xl overflow-hidden shadow-2xl shadow-black/10 border border-blue-500/10"
            >
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 px-4 rounded-2xl text-sm font-semibold m-8 mt-8 uppercase tracking-wider">
                <Star className="text-white" />
                <span className="text-white">Featured Article</span>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[500px]">
                <div className="p-6 sm:p-8 flex flex-col justify-center order-2 lg:order-1">
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {featuredBlog.tags.map(tag => (
                      <span key={tag} className="bg-blue-500/10 text-blue-700 py-1.5 px-3 rounded-2xl text-xs font-semibold uppercase tracking-wider">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 m-0 mb-3 leading-tight">
                    {featuredBlog.title}
                  </h2>
                  {featuredBlog.subtitle && (
                    <p className="text-lg text-slate-500 m-0 mb-5 font-medium">
                      {featuredBlog.subtitle}
                    </p>
                  )}
                  <p className="text-base text-slate-600 leading-relaxed m-0 mb-8">
                    {featuredBlog.excerpt}
                  </p>
                  
                  <div className="flex justify-between items-center mb-6 py-5 border-t border-b border-blue-500/10">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white overflow-hidden">
                        {featuredBlog.authorAvatar ? (
                          <img src={featuredBlog.authorAvatar} alt={featuredBlog.author} className="w-full h-full object-cover" />
                        ) : (
                          <User size={20} />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-800 text-sm">
                          {featuredBlog.author}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(featuredBlog.date).toLocaleDateString('en-US', { 
                            month: 'long', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock size={16} />
                        {featuredBlog.readMinutes} min read
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen size={16} />
                        {featuredBlog.views.toLocaleString()} views
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <button className="bg-gradient-to-r from-blue-500 to-blue-700 text-white border-none py-3.5 px-6 rounded-xl font-semibold cursor-pointer transition-all duration-300 flex items-center gap-2 text-base hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/40">
                      Read Full Article
                      <ArrowRight size={18} />
                    </button>
                    <div className="flex gap-3">
                      <button 
                        className={`bg-white border border-gray-200 text-gray-500 py-2.5 px-3 rounded-xl cursor-pointer transition-all duration-300 flex items-center gap-1.5 text-sm hover:bg-slate-50 hover:border-blue-500 hover:text-blue-500 ${likedPosts.has(featuredBlog.id) ? 'bg-red-50 border-red-300 text-red-600' : ''}`}
                        onClick={() => handleLike(featuredBlog.id)}
                      >
                        <Heart size={18} />
                        {featuredBlog.likes + (likedPosts.has(featuredBlog.id) ? 1 : 0)}
                      </button>
                      <button className="bg-white border border-gray-200 text-gray-500 py-2.5 px-3 rounded-xl cursor-pointer transition-all duration-300 flex items-center gap-1.5 text-sm hover:bg-slate-50 hover:border-blue-500 hover:text-blue-500">
                        <Share2 size={18} />
                        Share
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="relative overflow-hidden min-h-[240px] sm:min-h-[320px] lg:min-h-[400px] max-h-[500px] bg-slate-50 flex items-center justify-center order-1 lg:order-2">
                  <img src={featuredBlog.cover} alt={featuredBlog.title} className="w-full h-full object-cover object-center" />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-700/20"></div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Trending Topics */}
      <section className="py-20 bg-gradient-to-r from-blue-800 to-blue-500">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="trending-content"
          >
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 px-4 rounded-2xl text-sm font-semibold mb-4 uppercase tracking-wider">
                <TrendingUp className="text-white" />
                <span className="text-white">Trending Topics</span>
              </div>
              <h2 className="text-4xl font-extrabold text-white m-0">
                What's Hot Right Now
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
              {trendingTopics.map((topic, index) => (
                <motion.div
                  key={topic}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  className="bg-white/10 border border-white/20 rounded-2xl p-6 md:p-7 cursor-pointer transition-all duration-300 flex items-center gap-4 shadow-lg shadow-black/10 backdrop-blur-md hover:-translate-y-1 hover:shadow-xl hover:shadow-white/20 hover:border-white/40 hover:bg-white/15"
                >
                  <div className="w-10 h-10 bg-white/20 border border-white/30 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                    <Zap size={20} className="text-white" />
                  </div>
                  <span className="flex-1 font-semibold text-white text-base">
                    {topic}
                  </span>
                  <ChevronRight size={16} className="text-white transition-all duration-300 group-hover:text-blue-100 group-hover:translate-x-1" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-10">
            <div>
              <h2 className="text-4xl font-extrabold text-slate-900 m-0">
                Latest Articles
              </h2>
              <p className="text-gray-500 m-2 mt-0 text-base">
                {regularBlogs.length} article{regularBlogs.length !== 1 ? 's' : ''} found
              </p>
            </div>
            
            <div className="flex bg-slate-100 rounded-xl p-1 self-start md:self-auto">
              <button
                className={`bg-transparent border-none py-2 px-3 rounded-lg cursor-pointer transition-all duration-300 text-gray-500 ${viewMode === 'grid' ? 'bg-white text-blue-500 shadow-sm shadow-black/10' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 size={18} />
              </button>
              <button
                className={`bg-transparent border-none py-2 px-3 rounded-lg cursor-pointer transition-all duration-300 text-gray-500 ${viewMode === 'list' ? 'bg-white text-blue-500 shadow-sm shadow-black/10' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <List size={18} />
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}
            >
              {regularBlogs.map((blog, index) => (
                <motion.article
                  key={blog.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-200 transition-all duration-300 shadow-sm shadow-black/5 hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-500/15 hover:border-blue-500"
                >
                  <div className="relative h-48 sm:h-55 overflow-hidden">
                    <img src={blog.cover} alt={blog.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    {blog.trending && (
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-1.5 px-3 rounded-2xl text-xs font-semibold flex items-center gap-1 uppercase tracking-wider">
                        <TrendingUp size={14} />
                        <span>Trending</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <button className="bg-white border-none rounded-full w-12 h-12 flex items-center justify-center cursor-pointer transition-all duration-300 text-blue-500 hover:scale-110 hover:shadow-lg hover:shadow-black/20">
                        <BookOpen size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex gap-2 mb-4 flex-wrap">
                      {blog.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="bg-blue-500/10 text-blue-700 py-1 px-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <h3 className="text-2xl font-extrabold text-slate-900 m-0 mb-2 leading-tight">
                      {blog.title}
                    </h3>
                    {blog.subtitle && (
                      <p className="text-base text-slate-500 m-0 mb-3 font-medium">
                        {blog.subtitle}
                      </p>
                    )}
                    <p className="text-sm text-slate-600 leading-relaxed m-0 mb-5">
                      {blog.excerpt}
                    </p>
                    
                    <div className="flex justify-between items-center mb-5 py-4 border-t border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white overflow-hidden">
                          {blog.authorAvatar ? (
                            <img src={blog.authorAvatar} alt={blog.author} className="w-full h-full object-cover" />
                          ) : (
                            <User size={16} />
                          )}
                        </div>
                        <span className="font-semibold text-gray-800 text-sm">
                          {blog.author}
                        </span>
                      </div>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {blog.readMinutes}m
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen size={14} />
                          {blog.views.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <button className="bg-gradient-to-r from-blue-500 to-blue-700 text-white border-none py-2.5 px-4 rounded-xl font-semibold cursor-pointer transition-all duration-300 flex items-center gap-1.5 text-sm hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30">
                        Read More
                        <ArrowRight size={16} />
                      </button>
                      <div className="flex gap-2">
                        <button 
                          className={`bg-slate-50 border border-gray-200 text-gray-500 py-2 px-2.5 rounded-lg cursor-pointer transition-all duration-300 flex items-center gap-1 text-xs hover:bg-slate-100 hover:border-blue-500 hover:text-blue-500 ${likedPosts.has(blog.id) ? 'bg-red-50 border-red-300 text-red-600' : ''}`}
                          onClick={() => handleLike(blog.id)}
                        >
                          <Heart size={16} />
                          {blog.likes + (likedPosts.has(blog.id) ? 1 : 0)}
                        </button>
                        <button className="bg-slate-50 border border-gray-200 text-gray-500 py-2 px-2.5 rounded-lg cursor-pointer transition-all duration-300 flex items-center gap-1 text-xs hover:bg-slate-100 hover:border-blue-500 hover:text-blue-500">
                          <Share2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 bg-gradient-to-r from-blue-800 to-blue-500 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 text-white py-2 px-4 rounded-2xl text-sm font-semibold mb-6 uppercase tracking-wider">
              <Mail className="text-white" />
              <span className="text-white">Stay Updated</span>
            </div>
            <h2 className="text-4xl font-extrabold m-0 mb-4 leading-tight text-white">
              Never Miss Career Insights
            </h2>
            <p className="text-lg m-0 mb-10 opacity-90 leading-relaxed text-white">
              Get weekly career tips, industry trends, and exclusive content delivered to your inbox.
            </p>
            
            <div className="flex gap-3 mb-8 max-w-lg mx-auto">
              <div className="flex-1 relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full py-4 px-4 pl-12 border-none rounded-xl text-base outline-none bg-white text-gray-800 placeholder:text-gray-400"
                />
              </div>
              <button className="bg-white text-blue-800 border-none py-4 px-6 rounded-xl font-semibold cursor-pointer transition-all duration-300 flex items-center gap-2 whitespace-nowrap hover:-translate-y-0.5 hover:shadow-lg hover:shadow-white/30">
                Subscribe
                <ArrowRight size={18} />
              </button>
            </div>
            
            <div className="flex items-center justify-center gap-4">
              <span className="font-semibold opacity-90 text-white">
                Follow us:
              </span>
              <div className="flex gap-3">
                <button className="bg-white/20 border border-white/30 text-white w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-white hover:text-blue-800 hover:-translate-y-0.5">
                  <Twitter size={18} />
                </button>
                <button className="bg-white/20 border border-white/30 text-white w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-white hover:text-blue-800 hover:-translate-y-0.5">
                  <Linkedin size={18} />
                </button>
                <button className="bg-white/20 border border-white/30 text-white w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-white hover:text-blue-800 hover:-translate-y-0.5">
                  <Facebook size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Blogs;