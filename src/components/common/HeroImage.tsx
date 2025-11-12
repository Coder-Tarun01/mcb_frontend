import React from 'react';
import { CheckCircle } from 'lucide-react';
import './HeroImage.css';

const HeroImage: React.FC = () => {

  return (
    <div className="hero-image-container">
      {/* Main Image Area */}
      <div className="main-image-area">
        <div className="image-background">
          <div className="gradient-overlay"></div>
          <div className="geometric-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
        </div>
        
        
        {/* Success Indicators */}
        <div className="success-indicators">
          <div className="indicator">
            <CheckCircle className="check-icon" />
            <span>Verified Companies</span>
          </div>
          <div className="indicator">
            <CheckCircle className="check-icon" />
            <span>Instant Apply</span>
          </div>
        </div>
      </div>


      {/* Professional Video Background */}
      <div className="video-background">
        <iframe 
          width="560" 
          height="315" 
          src="https://www.youtube.com/embed/Imv_Of5TV2g?si=uIlx7bJz09jsoomx" 
          title="YouTube video player" 
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          referrerPolicy="strict-origin-when-cross-origin" 
          allowFullScreen
          className="video-iframe"
        ></iframe>
      </div>
    </div>
  );
};

export default HeroImage;
