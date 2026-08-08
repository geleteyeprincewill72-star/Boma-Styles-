import React from 'react';
import { GoogleAdSenseAd } from './GoogleAdSenseAd';

interface AdMobAdProps {
  type?: 'banner' | 'native';
  isPremium?: boolean;
  theme?: 'dark' | 'light';
  onDismiss?: () => void;
  network?: 'admob' | 'adsense' | 'auto';
}

export default function AdMobAdComponent({
  type = 'banner',
  isPremium = false,
  theme = 'dark'
}: AdMobAdProps) {
  if (isPremium) return null;

  return (
    <GoogleAdSenseAd 
      format={type === 'banner' ? 'horizontal' : 'rectangle'} 
      theme={theme}
      responsive={true}
    />
  );
}
