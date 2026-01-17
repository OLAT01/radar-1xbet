/** @type {import('next').NextConfig} */
const nextConfig = {
  // Option pour autoriser ton téléphone sur Next.js 16
  devIndicators: {
    appIsrStatus: false,
  },
  // Nouvelle façon d'autoriser les connexions externes
  serverExternalPackages: [],
  // On enlève experimental car ta version le gère différemment
};

export default nextConfig;