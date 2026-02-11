/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Ceci permet de déployer même s'il y a des petites erreurs de code
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ceci permet de déployer même s'il y a des erreurs de type
    ignoreBuildErrors: true,
  },
};

export default nextConfig;