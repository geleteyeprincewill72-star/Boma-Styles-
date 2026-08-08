/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import JSZip from 'jszip';

const FILES_TO_ZIP = [
  'package.json',
  'tsconfig.json',
  'vite.config.ts',
  'server.ts',
  'index.html',
  'metadata.json',
  'capacitor.config.json',
  '.env.example',
  '.gitignore',
  'android/build.gradle',
  'android/settings.gradle',
  'android/variables.gradle',
  'android/app/build.gradle',
  'android/app/src/main/AndroidManifest.xml',
  'android/app/src/main/java/com/geleteye/omnisphere/MainActivity.kt',
  'src/main.tsx',
  'src/index.css',
  'src/App.tsx',
  'src/types.ts',
  'src/utils/crypto.ts',
  'src/utils/firebase.ts',
  'src/utils/monetization.ts',
  'src/utils/security.ts',
  'src/utils/audioSynthesizer.ts',
  'src/utils/translations.ts',
  'src/utils/discoveryEngine.ts',
  'src/utils/zipExporter.ts',
  'src/components/AdminDashboardSection.tsx',
  'src/components/AuthScreen.tsx',
  'src/components/WelcomeConsentModal.tsx',
  'src/components/WelcomePrivacyModal.tsx',
  'src/components/CreatorMonetization.tsx',
  'src/components/BusinessAdsManager.tsx',
  'src/components/GoogleAdSenseAd.tsx',
  'src/components/AdMobAdComponent.tsx',
  'src/components/AdMobAd.tsx',
  'src/components/PhoneAdaptationBanner.tsx',
  'src/components/FeedSection.tsx',
  'src/components/StudioSection.tsx',
  'src/components/VideoHubSection.tsx',
  'src/components/VideoTheaterSection.tsx',
  'src/components/CinematicCanvasPlayer.tsx',
  'src/components/SettingsModal.tsx',
  'src/components/WalletSection.tsx',
  'src/components/ReviewsSection.tsx',
  'src/components/MessagingSection.tsx',
  'src/components/NotificationsSection.tsx',
  'src/components/SovereignDiscoverySection.tsx',
  'src/components/MonetizationSection.tsx',
  'src/components/DecentralizedIdentityModal.tsx',
  'src/components/DeviceSecurityModal.tsx',
  'src/components/ModerationCouncilModal.tsx',
  'src/components/PremiumFeaturesPanel.tsx',
  'src/components/PwaInstallModal.tsx',
  'src/components/OfflineTrialLockModal.tsx',
  'src/components/FirstTimePostPreferenceModal.tsx',
  'src/components/NetworkMap.tsx'
];

export async function exportRepositoryAsZip(
  currentAppTsxOverride?: string,
  onProgress?: (progress: number) => void
): Promise<void> {
  const zip = new JSZip();

  let completed = 0;
  onProgress?.(5);

  for (const filePath of FILES_TO_ZIP) {
    try {
      // If we have an in-memory override for App.tsx (unsaved changes or active state), use it
      if (filePath === 'src/App.tsx' && currentAppTsxOverride) {
        zip.file(filePath, currentAppTsxOverride);
        completed++;
        onProgress?.(Math.round((completed / FILES_TO_ZIP.length) * 90) + 5);
        continue;
      }

      // Fetch the file content from the local server
      const response = await fetch(`/${filePath}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${filePath}`);
      }
      const content = await response.text();
      zip.file(filePath, content);
    } catch (error) {
      console.warn(`Could not fetch file ${filePath} from server, generating fallback:`, error);
      const fallbackContent = getFallbackFileContent(filePath);
      zip.file(filePath, fallbackContent);
    }
    completed++;
    onProgress?.(Math.round((completed / FILES_TO_ZIP.length) * 90) + 5);
  }

  // Generate ZIP file and trigger browser download
  const contentBlob = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(contentBlob);
  const downloadLink = document.createElement('a');
  downloadLink.href = downloadUrl;
  downloadLink.download = 'aura-creator-source.zip';
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(downloadUrl);
  onProgress?.(100);
}

function getFallbackFileContent(filePath: string): string {
  switch (filePath) {
    case 'package.json':
      return JSON.stringify({
        name: "aether-protocol",
        version: "1.0.0",
        type: "module",
        scripts: {
          "dev": "vite",
          "build": "tsc && vite build",
          "preview": "vite preview"
        },
        dependencies: {
          "@google/genai": "^2.4.0",
          "jszip": "^3.10.1",
          "lucide-react": "^0.546.0",
          "motion": "^12.23.24",
          "react": "^19.0.1",
          "react-dom": "^19.0.1"
        },
        devDependencies: {
          "@types/react": "^19.0.0",
          "@types/react-dom": "^19.0.0",
          "@vitejs/plugin-react": "^5.0.4",
          "typescript": "~5.8.2",
          "vite": "^6.2.3"
        }
      }, null, 2);

    case '.env.example':
      return `GEMINI_API_KEY="MY_GEMINI_API_KEY"\nAPP_URL="MY_APP_URL"\n`;

    case '.gitignore':
      return `node_modules\ndist\n.env\n.DS_Store\n`;

    case 'capacitor.config.json':
      return JSON.stringify({
        appId: "com.geleteye.omnisphere",
        appName: "OmniSphere Native",
        webDir: "dist",
        bundledWebRuntime: false
      }, null, 2);

    case 'android/app/src/main/java/com/geleteye/omnisphere/MainActivity.kt':
      return `package com.geleteye.omnisphere

import android.os.Bundle
import com.getcapacitor.BridgeActivity
import com.google.android.gms.ads.MobileAds

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        try {
            MobileAds.initialize(this) { }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}`;

    case 'index.html':
      return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Aether Protocol - Decentralized Social Platform</title>
  </head>
  <body class="bg-slate-950 text-slate-100">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

    default:
      return `// Fallback file placeholder for ${filePath}`;
  }
}
