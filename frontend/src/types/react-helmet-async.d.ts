declare module 'react-helmet-async' {
  import { FC, ReactNode } from 'react';

  interface HelmetProps {
    children?: ReactNode;
    [key: string]: any;
  }

  interface ProviderProps {
    context?: Record<string, any>;
    children?: ReactNode;
  }

  export const Helmet: FC<HelmetProps>;
  export const HelmetProvider: FC<ProviderProps>;
} 