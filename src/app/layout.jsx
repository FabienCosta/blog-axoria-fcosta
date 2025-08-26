// import "./globals.css";
// import Footer from "@/components/Footer";
// import Navbar from "@/components/Navbar";
// import { AuthProvider } from "./authContext";

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en" className="h-full" suppressHydrationWarning>
//       <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
//       <meta name="viewport" content="width=device-width, initial-scale=1.0" />

//       <body className="min-h-full flex flex-col">
//         <AuthProvider>
//           <Navbar />
//           <main className="grow relative">{children}</main>
//         </AuthProvider>
//         <Footer />
//       </body>
//     </html>
//   );
// }

import "./globals.css";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "./authContext";

// ✅ Ici tu définis ton SEO global
export const metadata = {
  title: "Axoria Blog",
  description:
    "Un blog tech où je partage mes astuces et projets autour de Next.js, React et le développement web.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className="h-full" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <Navbar />
          <main className="grow relative">{children}</main>
        </AuthProvider>
        <Footer />
      </body>
    </html>
  );
}
