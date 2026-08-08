import React from 'react';
import { GoogleAdSenseAd } from './GoogleAdSenseAd';

interface AdMobAdProps {
  type?: 'banner' | 'native' | 'interstitial' | 'rewarded';
  theme?: 'dark' | 'light';
  onRewardedComplete?: (rewardAmount: number) => void;
  onClose?: () => void;
}

export default function AdMobAd({
  type = 'banner',
  theme = 'dark'
}: AdMobAdProps) {
  return (
    <GoogleAdSenseAd 
      format={type === 'banner' ? 'horizontal' : 'rectangle'} 
      theme={theme}
      responsive={true}
    />
  );
}
