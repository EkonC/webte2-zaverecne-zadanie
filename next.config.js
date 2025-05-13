/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tvoje existujúce rewrites, ak ich potrebuješ
  rewrites: async () => {
    return [
      {
        source: "/api/:path*",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/api/:path*"
            : "/api/", // Alebo tvoja produkčná API cesta, ak je iná
      },
      {
        source: "/docs",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/docs"
            : "/api/docs", // Alebo tvoja produkčná API cesta, ak je iná
      },
      {
        source: "/openapi.json",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/openapi.json"
            : "/api/openapi.json", // Alebo tvoja produkčná API cesta, ak je iná
      },
    ];
  },

  // added webpack config
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.optimization.moduleIds = "named";
    config.optimization.chunkIds = "named";

    // change hash function to xxhash64
    config.output.hashFunction = "xxhash64";

    return config;
  },
};

module.exports = nextConfig;
