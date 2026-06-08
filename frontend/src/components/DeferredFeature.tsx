import React, { type ReactNode } from 'react';
import { useAWSaaSContext } from '../context/AWSaaSContext';

interface Props {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export const DeferredFeature: React.FC<Props> = ({ feature, children, fallback }) => {
  const { strategy } = useAWSaaSContext();

  if (!strategy) return null;

  const isDeferred = strategy.deferredFeatures.includes(feature);

  if (isDeferred) {
    return <>{fallback || null}</>;
  }

  return <>{children}</>;
};
