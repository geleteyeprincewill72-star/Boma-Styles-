var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
var getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new import_genai.GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
};
var ai = getGeminiClient();
app.get("/api/download-project-zip", (req, res) => {
  const zipPath = import_path.default.join(process.cwd(), "omnisphere-project.zip");
  res.setHeader("Content-Disposition", "attachment; filename=omnisphere-project.zip");
  res.setHeader("Content-Type", "application/zip");
  res.sendFile(zipPath, (err) => {
    if (err) {
      console.error("Error sending project ZIP file:", err);
      if (!res.headersSent) {
        res.status(500).send("ZIP file is being generated or is not yet available. Please wait and refresh.");
      }
    }
  });
});
app.post("/api/generate-post", async (req, res) => {
  try {
    if (!ai) {
      console.warn("GEMINI_API_KEY is not configured. Falling back to local synthesis.");
      return res.json({
        success: true,
        fallback: true,
        post: getLocalFallbackPost()
      });
    }
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "Generate a realistic, sweet, decentralized social network post. It should feel privacy-focused, technical, or creative.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          required: ["authorName", "authorAvatar", "type", "content", "likes"],
          properties: {
            authorName: { type: import_genai.Type.STRING, description: "A creative peer pseudonym (e.g. PixelPioneer, SolarCrypt, CipherMuse)." },
            authorAvatar: { type: import_genai.Type.STRING, description: "A high-quality Unsplash avatar URL." },
            type: { type: import_genai.Type.STRING, description: "One of: 'micro' (X/Twitter text-only), 'media' (Instagram image post), 'play' (YouTube video)." },
            content: { type: import_genai.Type.STRING, description: "The message body. Can include hashtags or comments on data sovereignty, privacy, art, or gossip swarms." },
            title: { type: import_genai.Type.STRING, description: "Title of the video. Required only if type is 'play'." },
            mediaUrl: { type: import_genai.Type.STRING, description: "An Unsplash image URL if type is 'media', or a high-quality stock video/hologram URL if type is 'play'." },
            likes: { type: import_genai.Type.INTEGER, description: "A random seed number of likes (e.g. 10 to 500)." }
          }
        }
      }
    });
    const resultText = response.text?.trim() || "";
    const parsedPost = JSON.parse(resultText);
    if (parsedPost.type === "media" && !parsedPost.mediaUrl) {
      parsedPost.mediaUrl = "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=60";
    } else if (parsedPost.type === "play") {
      parsedPost.mediaUrl = "https://assets.mixkit.co/videos/preview/mixkit-matrix-style-computer-code-running-34208-large.mp4";
      if (!parsedPost.title) parsedPost.title = "Decentralized Swarm Network Broadcast";
    }
    if (!parsedPost.authorAvatar || !parsedPost.authorAvatar.startsWith("http")) {
      parsedPost.authorAvatar = `https://images.unsplash.com/photo-${15e11 + Math.floor(Math.random() * 5e5)}?w=150&auto=format&fit=crop&q=60`;
    }
    return res.json({
      success: true,
      post: {
        id: `ai_post_${Date.now()}_${Math.floor(Math.random() * 1e3)}`,
        authorName: parsedPost.authorName,
        authorPublicKey: `30820122300d06092a864886f70d01010105000382010f003082010a0282010100` + Math.floor(Math.random() * 9e4 + 1e4),
        authorAvatar: parsedPost.authorAvatar,
        type: parsedPost.type || "micro",
        timestamp: Date.now(),
        content: parsedPost.content,
        signature: `sig_ai_signed_v2_${Math.random().toString(36).substring(2, 15)}`,
        mediaUrl: parsedPost.mediaUrl,
        mediaThumbnail: parsedPost.mediaUrl,
        aspectRatio: parsedPost.type === "play" ? "16:9" : "1:1",
        title: parsedPost.title,
        likes: parsedPost.likes || Math.floor(Math.random() * 300) + 15,
        commentsCount: 0,
        comments: []
      }
    });
  } catch (error) {
    console.error("Error generating post through Gemini:", error);
    return res.json({
      success: true,
      fallback: true,
      post: getLocalFallbackPost()
    });
  }
});
function getLocalFallbackPost() {
  const authorNames = ["QuantumScribe", "AuraWeaver", "VectorNomad", "EchoSeer", "NodeSpecter"];
  const avatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=60"
  ];
  const postTypes = ["micro", "media", "play"];
  const contents = [
    "The Solas network is growing rapidly. Each node acts as an independent gossip agent, relaying signed mesh packets without center trackers. Under 50k peers active, AI synthesizer on duty.",
    "Decentralized streams are beautiful because they bypass algorithmic curation entirely. Creators retain 100% of tips, direct payments, and signatures.",
    "Just integrated cryptographic wallet payouts. Your identity is your private key, and compensation goes straight from peer to peer.",
    "Status updates at the top of Solas are ephemeral. No centralized disk saves them, just a transient mesh of peers keeping stories warm."
  ];
  const images = [
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=60"
  ];
  const type = postTypes[Math.floor(Math.random() * postTypes.length)];
  const authorName = authorNames[Math.floor(Math.random() * authorNames.length)];
  const authorAvatar = avatars[Math.floor(Math.random() * avatars.length)];
  const content = contents[Math.floor(Math.random() * contents.length)];
  const post = {
    id: `ai_fallback_${Date.now()}_${Math.floor(Math.random() * 1e3)}`,
    authorName,
    authorPublicKey: `30820122300d06092a864886f70d01010105000382010f003082010a0282010100` + Math.floor(Math.random() * 9e4 + 1e4),
    authorAvatar,
    type,
    timestamp: Date.now(),
    content,
    signature: `sig_fallback_${Math.random().toString(36).substring(2, 10)}`,
    likes: Math.floor(Math.random() * 200) + 12,
    commentsCount: 0,
    comments: []
  };
  if (type === "media") {
    post.mediaUrl = images[Math.floor(Math.random() * images.length)];
    post.mediaThumbnail = post.mediaUrl;
    post.aspectRatio = "1:1";
  } else if (type === "play") {
    post.mediaUrl = "https://assets.mixkit.co/videos/preview/mixkit-matrix-style-computer-code-running-34208-large.mp4";
    post.mediaThumbnail = images[0];
    post.title = "Sovereign Streaming: Peer-to-Peer Visual Replication";
    post.aspectRatio = "16:9";
    post.views = Math.floor(Math.random() * 300) + 5;
  }
  return post;
}
var startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
};
startServer();
//# sourceMappingURL=server.cjs.map
