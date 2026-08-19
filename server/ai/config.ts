export interface AiModelConfig {
  textModel: string;
  fallbackTextModel: string;
  textModelsCascade: string[];
  imageModel: string;
  fallbackImageModel: string;
  videoModel: string;
  videoLiteModel: string;
  audioModel: string;
}

export const AI_CONFIG: AiModelConfig = {
  // Primary multimodal conversational & search grounding models (with resilient fallback cascade)
  textModel: process.env.GEMINI_TEXT_MODEL || "gemini-2.5-flash",
  fallbackTextModel: "gemini-3.1-flash-lite",
  textModelsCascade: [
    process.env.GEMINI_TEXT_MODEL || "gemini-2.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-2.5-flash",
    "gemini-3.7-flash"
  ],

  // High quality 4K / 2K / 1K image generation model
  imageModel: process.env.GEMINI_IMAGE_MODEL || "gemini-3.1-flash-image",
  fallbackImageModel: "gemini-3.1-flash-lite-image",

  // Veo video generation models
  videoModel: process.env.GEMINI_VIDEO_MODEL || "veo-3.1-generate-preview",
  videoLiteModel: process.env.GEMINI_VIDEO_LITE_MODEL || "veo-3.1-lite-generate-preview",

  // Speech & universal audio intelligence model
  audioModel: "gemini-2.5-flash",
};

export const SUPPORTED_ASPECT_RATIOS = ["1:1", "16:9", "9:16", "4:3", "3:4"] as const;
export const SUPPORTED_IMAGE_SIZES = ["512px", "1K", "2K", "4K"] as const;
export const SUPPORTED_VIDEO_RESOLUTIONS = ["720p", "1080p", "4k"] as const;

