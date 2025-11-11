import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI, BACKEND_BASE_URL } from '../services/api';

export const useCompanyProfile = () => {
  const { user, isEmployer } = useAuth();
  const [companyProfile, setCompanyProfile] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCompanyProfile = async () => {
    if (!user || !isEmployer()) return;
    
    setIsLoadingProfile(true);
    setError(null);
    
    try {
      const userData = await usersAPI.fetchUserById(user.id);
      console.log('Company profile data loaded:', userData);
      
      // Ensure we have company name data - use stored company name if available
      if (!userData.companyName) {
        const storedCompanyName = localStorage.getItem('employerCompanyName');
        if (storedCompanyName) {
          userData.companyName = storedCompanyName;
          console.log('No companyName found, using stored company name:', storedCompanyName);
        } else {
          // Don't use username as company name - leave it empty for user to fill
          userData.companyName = '';
          console.log('No companyName found, leaving empty for user to fill');
        }
      }
      
      setCompanyProfile(userData);
    } catch (err) {
      console.error('Error loading company profile:', err);
      setError('Failed to load company profile');
      setCompanyProfile(null);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const refreshCompanyProfile = async () => {
    await loadCompanyProfile();
  };

  useEffect(() => {
    loadCompanyProfile();
  }, [user]);

  const getCompanyName = () => {
    if (isLoadingProfile) return 'Loading...';
    
    // Enhanced company name resolution with better fallbacks
    const storedCompanyName = localStorage.getItem('employerCompanyName');
    const name = companyProfile?.companyName || 
                 user?.companyName || 
                 storedCompanyName || // Use stored company name as strong fallback
                 'Company Name'; // Default placeholder instead of username
    
    console.log('Company name resolution (ENHANCED):', {
      companyProfileCompanyName: companyProfile?.companyName,
      userCompanyName: user?.companyName,
      storedCompanyName: storedCompanyName,
      finalName: name,
      note: 'Using company name sources only, not username'
    });
    
    return name;
  };

  const getCompanyLogo = () => {
    // Use dedicated companyLogo field and ensure absolute URL
    const logo = companyProfile?.companyLogo || null;
    if (!logo) return null;
    if (logo.startsWith('http://') || logo.startsWith('https://')) return logo;
    // ensure leading slash
    const path = logo.startsWith('/') ? logo : `/${logo}`;
    return `${BACKEND_BASE_URL}${path}`;
  };

  // Force refresh company profile
  const forceRefresh = async () => {
    console.log('Force refreshing company profile...');
    await loadCompanyProfile();
  };

  return {
    companyProfile,
    isLoadingProfile,
    error,
    loadCompanyProfile,
    refreshCompanyProfile,
    forceRefresh,
    getCompanyName,
    getCompanyLogo
  };
};
