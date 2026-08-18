/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Central Model Configuration for Google Gemini & Media Generation APIs
// Update model identifiers here when newer versions are released.

export const AI_MODELS = {
  // General & Grounded Text / Reasoning
  TEXT_REASONING: {
    id: 'gemini-3.7-flash',
    fallbackId: 'gemini-2.5-flash',
    name: 'Gemini 3.7 Flash',
    provider: 'Google AI',
    description: 'High-speed cognitive reasoning, complex logic, step-by-step math and coding.',
    supportsGrounding: true,
    supportsMultimodal: true
  },
  // Deep Reasoning / High Complexity
  PRO_REASONING: {
    id: 'gemini-3.1-pro-preview',
    fallbackId: 'gemini-3.7-flash',
    name: 'Gemini 3.1 Pro',
    provider: 'Google AI',
    description: 'Maximum depth reasoning for complex scientific, architectural, and literary synthesis.',
    supportsGrounding: true,
    supportsMultimodal: true
  },
  // Real-Time Google Search Grounding
  SEARCH_GROUNDING: {
    id: 'gemini-3.7-flash',
    fallbackId: 'gemini-2.5-flash',
    name: 'Gemini 3.7 Search-Grounded',
    provider: 'Google AI + Google Search',
    description: 'Live web grounding with verifiable citations, real-time facts, and source attribution.',
    supportsGrounding: true,
    supportsMultimodal: false
  },
  // Image Generation Models
  IMAGE_GENERATION: {
    id: 'gemini-3.1-flash-image',
    fallbackId: 'gemini-3.1-flash-lite-image',
    name: 'Nano Banana 2 (Gemini 3.1 Flash Image)',
    provider: 'Google DeepMind',
    description: 'Ultra high-fidelity visual synthesis supporting 1K/2K/4K resolutions, aspect ratios, and multimodal editing.',
    supportedAspectRatios: ['1:1', '16:9', '9:16', '4:3', '3:4', '1:4', '4:1'],
    supportedResolutions: ['512px', '1K', '2K', '4K'],
    supportsImageEditing: true
  },
  // Video Generation Models (Veo Engine)
  VIDEO_GENERATION: {
    id: 'veo-3.1-lite-generate-preview',
    proId: 'veo-3.1-generate-preview',
    name: 'Google Veo 3.1',
    provider: 'Google DeepMind',
    description: 'Cinematic text-to-video and image-to-video with temporal consistency and camera motion directives.',
    supportedAspectRatios: ['16:9', '9:16'],
    supportedResolutions: ['720p', '1080p', '4K'],
    supportsImageToVideo: true,
    supportsExtension: true
  },
  // Speech & Audio Models
  AUDIO_TRANSCRIBE: {
    id: 'gemini-3.7-flash',
    name: 'Gemini Multimodal Acoustic Core',
    provider: 'Google AI',
    description: 'E2EE Speech-to-text with diarization, multi-language detection, and structured summaries.'
  }
} as const;

export interface AiSourceCitation {
  title: string;
  uri: string;
  snippet?: string;
}

export interface AiGenerationJob {
  id: string;
  type: 'image' | 'video' | 'tool' | 'search';
  title: string;
  prompt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  resultUrl?: string;
  resultData?: any;
  error?: string;
  createdAt: number;
  completedAt?: number;
  modelUsed: string;
}
