import React from 'react';

const ChevronDownIcon: React.FC = () => {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 16 16" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="w-3 h-3 text-gray-600"
    >
      <path 
        d="M4 6L8 10L12 6" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
};

const FolkLogo: React.FC = () => {
  return (
    <svg width="60" height="24" viewBox="0 0 74 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="12" fill="#1A1A1A"/>
      <circle cx="12" cy="12" r="4" fill="#F9F7F4"/>
      <path d="M30.68 23.5V0.5H36.32V9.82H43.4V0.5H49.04V23.5H43.4V14.5H36.32V23.5H30.68Z" fill="#1A1A1A"/>
      <path d="M57.6533 24C52.6133 24 48.7733 20.08 48.7733 15.16V8.84C48.7733 3.92 52.6133 0 57.6533 0C62.6933 0 66.5333 3.92 66.5333 8.84V15.16C66.5333 20.08 62.6933 24 57.6533 24ZM57.6533 19.32C59.9733 19.32 60.9333 17.52 60.9333 15.04V8.96C60.9333 6.48 59.9733 4.68 57.6533 4.68C55.3333 4.68 54.3733 6.48 54.3733 8.96V15.04C54.3733 17.52 55.3333 19.32 57.6533 19.32Z" fill="#1A1A1A"/>
      <path d="M68.5293 23.5V0.5H74.0093V23.5H68.5293Z" fill="#1A1A1A"/>
      <path d="M72.2695 23.5V0.5H72.2695" fill="#1A1A1A"/>
    </svg>
  );
};

const NavLink: React.FC<{ children: React.ReactNode; hasDropdown?: boolean }> = ({ children, hasDropdown = false }) => (
  <a href="#" className="flex items-center space-x-1 text-gray-800 hover:text-black transition-colors duration-200">
    <span>{children}</span>
    {hasDropdown && <ChevronDownIcon />}
  </a>
);

const Header: React.FC = () => {
  return (
    <header className="absolute top-0 left-0 right-0 z-10 py-6">
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Left and Center Navigation */}
        <div className="flex items-center space-x-8">
          <FolkLogo />
          <nav className="hidden md:flex items-center space-x-6">
            <NavLink hasDropdown>Products</NavLink>
            <NavLink hasDropdown>Solutions</NavLink>
            <NavLink hasDropdown>Resources</NavLink>
            <NavLink>Pricing</NavLink>
          </nav>
        </div>
        
        {/* Right Actions */}
        <div className="flex items-center space-x-4">
          <a href="#" className="text-sm font-medium text-gray-800 hover:text-black transition-colors duration-200">Get a demo</a>
          <a href="#" className="text-sm font-medium text-gray-800 hover:text-black transition-colors duration-200">Login</a>
          <a href="#" className="px-5 py-2.5 text-sm font-medium text-white bg-brand-dark rounded-full hover:bg-black transition-colors duration-200 shadow-sm">
            Try for free
          </a>
        </div>
      </div>
    </header>
  );
};

const HeroContent: React.FC = () => {
  return (
    <div className="text-center px-4">
      <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-brand-dark leading-tight max-w-4xl mx-auto">
        Like the <span className="font-serif italic font-normal">sales assistant</span>
        <br />
        your team <span className="font-serif italic font-normal">never had</span>
      </h1>
      <p className="max-w-md mx-auto mt-6 text-gray-600">
        folk CRM does the busy work for you, so you can focus on growing your business.
      </p>
      <div className="mt-8 flex justify-center items-center space-x-4">
        <a 
          href="#" 
          className="px-6 py-3 text-base font-medium text-white bg-brand-dark rounded-full hover:bg-black transition-colors duration-200 shadow-md"
        >
          Try for free
        </a>
        <a 
          href="#" 
          className="px-6 py-3 text-base font-medium text-brand-dark bg-transparent border border-gray-400 rounded-full hover:border-black transition-colors duration-200"
        >
          Get a demo
        </a>
      </div>
    </div>
  );
};

const HeroImage: React.FC = () => {
  return (
    <div className="relative mt-16 md:mt-24 w-full flex justify-center">
       <div className="max-w-screen-lg w-full px-4">
            <img 
              src="https://raw.githubusercontent.com/michaels-google/tool-tutor-assets/main/folk-hero-image-bg.png"
              alt="Hands holding a tablet displaying a sales pipeline dashboard" 
              className="w-full h-auto"
            />
       </div>
    </div>
  );
};

const BottomLeftLogo: React.FC = () => {
  return (
    <div className="w-10 h-10 bg-brand-dark rounded-full flex items-center justify-center">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 12H19" stroke="#F9F7F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 5L19 12L12 19" stroke="#F9F7F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10.1572 6.84229L8.74292 5.42807" stroke="#F9F7F4" strokeWidth="2" strokeLinecap="round"/>
        <path d="M15.4287 18.5713L16.8429 17.1571" stroke="#F9F7F4" strokeWidth="2" strokeLinecap="round" transform="rotate(180 16.1358 17.8642)"/>
      </svg>
    </div>
  );
};

const LandingPage: React.FC = () => {
  return (
    <div className="bg-brand-background min-h-screen text-brand-dark font-sans relative overflow-x-hidden">
      <Header />
      <main className="w-full pt-32 md:pt-40">
        <HeroContent />
        <HeroImage />
      </main>
      <div className="absolute bottom-8 left-8">
        <BottomLeftLogo />
      </div>
    </div>
  );
};

export default LandingPage;
