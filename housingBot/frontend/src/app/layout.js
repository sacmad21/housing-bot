import {
  Inter,
  Poppins,
  DM_Sans,
  Outfit,
  Plus_Jakarta_Sans,
  Montserrat,
} from "next/font/google";
import "../styles/globals.css";
import { DarkModeProvider } from "@/context/DarkModeContext"; // Import Dark Mode Context

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata = {
  title: "Chat",
  description: "Modern chat interface for legal assistance",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`bg-gray-100 ${inter.variable} ${poppins.variable} ${dmSans.variable} ${outfit.variable} ${plusJakarta.variable} ${montserrat.variable}`}
      >
        <DarkModeProvider>{children}</DarkModeProvider>
      </body>
    </html>
  );
}
