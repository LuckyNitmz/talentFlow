import React from 'react';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-6 md:mb-8">
          <AlertTriangle className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground mx-auto mb-3 md:mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold mb-2">404</h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-4 md:mb-6">Oops! Page not found</p>
          <p className="text-sm md:text-base text-muted-foreground mb-6 md:mb-8 px-2">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <Button asChild className="bg-gradient-primary w-full md:w-auto">
          <a href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Home
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
