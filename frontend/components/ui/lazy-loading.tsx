import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";

// Lazy loading wrapper component
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  minLoadTime?: number;
}

const defaultFallback = (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="flex flex-col items-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);

export const LazyWrapper: React.FC<LazyWrapperProps> = ({
  children,
  fallback = defaultFallback,
  minLoadTime = 0,
}) => {
  return <Suspense fallback={fallback}>{children}</Suspense>;
};

// Enhanced loading component for different contexts
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  text = "Loading...",
  className = "",
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center space-y-2 ${className}`}
    >
      <Loader2
        className={`animate-spin text-purple-600 ${sizeClasses[size]}`}
      />
      {text && (
        <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>
      )}
    </div>
  );
};

// Skeleton loader for cards
export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
            <div className="flex justify-between items-center">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

// Table skeleton loader
export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 4,
}) => {
  return (
    <div className="animate-pulse">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: cols }).map((_, index) => (
              <div
                key={index}
                className="h-4 bg-gray-200 dark:bg-gray-700 rounded"
              ></div>
            ))}
          </div>
        </div>

        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="border-b border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: cols }).map((_, colIndex) => (
                <div
                  key={colIndex}
                  className="h-3 bg-gray-200 dark:bg-gray-700 rounded"
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Form skeleton loader
export const FormSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
      <div className="flex justify-end space-x-3">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
      </div>
    </div>
  );
};

export default LazyWrapper;
