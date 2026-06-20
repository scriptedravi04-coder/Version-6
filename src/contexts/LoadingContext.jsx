import React, { createContext, useContext, useState, useCallback } from 'react';

const LoadingContext = createContext();

export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setIsFinishing(false);
  }, []);

  const stopLoading = useCallback(() => {
    setIsFinishing(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsFinishing(false);
    }, 800); // Allow shimmer animation to finish
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading, isFinishing }}>
      {children}
    </LoadingContext.Provider>
  );
};
