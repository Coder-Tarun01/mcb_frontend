# Job Portal - Shine.com Style

A modern, responsive job portal built with React, TypeScript, and CSS. This application provides a complete job search and application experience with a clean, professional UI.

## 🚀 Features

### Core Functionality
- **Job Search & Filtering**: Advanced search with filters for location, salary, experience, job type, and company
- **Job Listings**: Grid and list view with detailed job cards
- **Job Details**: Comprehensive job information with company details and application options
- **User Authentication**: Login and signup with context-based state management
- **User Dashboard**: Profile management, resume upload, and application tracking
- **Application System**: Easy job application with resume upload and form submission

### UI/UX Features
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional design with blue and white color scheme
- **Smooth Animations**: Framer Motion animations for enhanced user experience
- **Interactive Components**: Hover effects, transitions, and micro-interactions
- **Professional Icons**: Lucide React icons throughout the interface

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **Routing**: React Router v6
- **Styling**: Custom CSS with modern design principles
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **State Management**: React Context API
- **HTTP Client**: Axios (for future backend integration)

## 📁 Project Structure

```
src/
├── components/
│   ├── common/           # Reusable components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── Pagination.tsx
│   ├── jobs/             # Job-related components
│   │   ├── JobCard.tsx
│   │   ├── JobFilter.tsx
│   │   └── JobSearchBar.tsx
│   ├── auth/             # Authentication components
│   │   ├── LoginForm.tsx
│   │   └── SignupForm.tsx
│   └── dashboard/        # Dashboard components
│       ├── ProfileSidebar.tsx
│       └── ResumeUploader.tsx
├── pages/                # Page components
│   ├── Home.tsx
│   ├── Jobs.tsx
│   ├── JobDetails.tsx
│   ├── Apply.tsx
│   ├── Auth.tsx
│   └── Dashboard.tsx
├── context/              # Context providers
│   └── AuthContext.tsx
├── services/             # API services
│   └── api.ts
├── types/                # TypeScript definitions
│   ├── job.d.ts
│   └── user.d.ts
└── App.tsx
```

## 🎨 Design System

### Color Palette
- **Primary Blue**: #2563eb
- **Secondary Blue**: #3b82f6
- **Light Blue**: #60a5fa
- **White**: #ffffff
- **Gray Scale**: Various shades from #f8fafc to #1f2937

### Typography
- **Font Family**: System fonts (SF Pro, Segoe UI, Roboto, etc.)
- **Font Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Components
- **Cards**: Rounded corners (8px-16px), subtle shadows, clean borders
- **Buttons**: Multiple variants (primary, secondary, outline)
- **Forms**: Consistent input styling with focus states
- **Navigation**: Sticky header with smooth transitions

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mycareerbuild-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App

## 📱 Pages & Routes

- `/` - Homepage with hero section and featured jobs
- `/jobs` - Job listings with search and filters
- `/jobs/:id` - Individual job details page
- `/apply/:id` - Job application form
- `/login` - User login page
- `/signup` - User registration page
- `/dashboard` - User dashboard with profile management

## 🔧 Configuration

### Mock Data
The application uses mock data stored in the `public/` directory:
- `jobs.json` - Sample job listings
- `users.json` - Sample user data for authentication

### Environment Variables
Currently, no environment variables are required. The app uses mock data and localStorage for state persistence.

## 🎯 Key Features Implementation

### Authentication
- Context-based state management
- Local storage persistence
- Mock authentication with user validation
- Protected routes and redirects

### Job Search
- Real-time search functionality
- Advanced filtering options
- Pagination for large result sets
- URL-based search state management

### Responsive Design
- Mobile-first approach
- Flexible grid layouts
- Touch-friendly interactions
- Optimized for all screen sizes

### Performance
- Lazy loading for images
- Optimized animations
- Efficient state updates
- Minimal re-renders

## 🔮 Future Enhancements

- Backend API integration
- Real-time notifications
- Advanced search algorithms
- Company profiles and reviews
- Job recommendation system
- Email notifications
- Social login integration
- Advanced analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Design inspiration from Shine.com
- Icons provided by Lucide React
- Animations powered by Framer Motion
- Built with Create React App

---

**Note**: This is a frontend-only implementation. Backend integration would be required for production use.