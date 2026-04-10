import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://myplants.vercel.app"),
  title: {
    default: "MyPlants | Inteligência Artificial para seu Jardim",
    template: "%s | MyPlants",
  },
  description:
    "Gerenciamento inteligente de plantas com IA. Identificação, diagnóstico de saúde e lembretes de rega automáticos.",
  keywords: [
    "plantas",
    "jardim",
    "inteligência artificial",
    "cuidado de plantas",
    "rega",
    "myplants",
    "botânica",
  ],
  authors: [{ name: "MyPlants Team" }],
  creator: "MyPlants",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://myplants.app",
    siteName: "MyPlants",
    title: "MyPlants | Inteligência Artificial para seu Jardim",
    description:
      "Cuidado inteligente para o seu jardim urbano. Diagnóstico por IA e lembretes automáticos.",
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
  themeColor: "#10B981",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${outfit.variable}`}>
      <body className="antialiased font-body">
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>{children}</AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
