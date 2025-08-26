// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "axoriablogeducationn.b-cdn.net",
//         pathname: "/**",
//       },
//     ],
//   },
// };

// export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "axoriablogeducationn.b-cdn.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "storage.bunnycdn.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
