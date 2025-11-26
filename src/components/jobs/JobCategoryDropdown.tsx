import React from 'react';
import { useNavigate } from 'react-router-dom';

interface JobCategoryDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const JobCategoryDropdown: React.FC<JobCategoryDropdownProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const dropdownItems = [
    { 
      title: 'Govt Jobs', 
      path: '/govt-jobs'
    },
    { 
      title: 'Internships', 
      path: '/internships'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 bg-white border border-gray-200 rounded-lg shadow-lg shadow-black/10 min-w-[200px] z-[1000] py-2">
      {dropdownItems.map((item) => (
        <button
          key={item.path}
          className="block w-full py-3 px-4 bg-none border-none text-left text-sm text-gray-700 cursor-pointer transition-all duration-200 ease-in-out hover:bg-slate-50 hover:text-blue-600"
          onClick={() => handleNavigation(item.path)}
        >
          {item.title}
        </button>
      ))}
    </div>
  );
};

export default JobCategoryDropdown;

