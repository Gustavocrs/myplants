import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: 'swap',
});

const outfit = Outfit({ 
  subsets: ["latin"], 
  variable: "--font-outfit",
  display: 'swap',
});

export const metadata = {
  title: {
    default: "MyPlants | Inteligência Artificial para seu Jardim",
    template: "%s | MyPlants",
  },
  description: "O sistema gerencia, avalia saúde com IA e lembra sobre regas das plantas! Cultive o futuro com a inteligência MyPlants.",
  keywords: ["plantas", "jardim", "inteligência artificial", "cuidado de plantas", "rega", "myplants", "botânica"],
  authors: [{ name: "MyPlants Team" }],
  creator: "MyPlants",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://myplants.app",
    siteName: "MyPlants",
    title: "MyPlants | Inteligência Artificial para seu Jardim",
    description: "Cuidado inteligente para o seu jardim urbano. Diagnóstico por IA e lembretes automáticos.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MyPlants Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MyPlants",
    description: "O sistema gerencia e avalia saúde das suas plantas com IA.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  themeColor: "#166534",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${outfit.variable}`}>
      <body className="antialiased font-body">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
