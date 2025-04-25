// app.config.js
import "dotenv/config";

export default {
  expo: {
    name: "quoteapp",
    slug: "quoteapp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    extra: {
      zenApiUrl: process.env.ZEN_API_URL,
      pexelsApiUrl: process.env.PEXELS_API_URL,
      pexelsApiKey: process.env.PEXELS_API_KEY,
    },
    ios: { supportsTablet: true },
    android: {
      permissions: ["NOTIFICATIONS"],
      adaptiveIcon: { foregroundImage: "", backgroundColor: "#ffffff" },
    },
    web: { bundler: "metro", output: "static", favicon: "" },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
    ],
    experiments: { typedRoutes: true },
  },
};
