export const ICP_HOST = window.location.hostname.includes("app.github.dev")
  ? `https://${window.location.hostname.replace(/-\d+\.app\.github\.dev/, "-4943.app.github.dev")}`
  : "http://localhost:4943";
