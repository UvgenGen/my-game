import '../styles/globals.css';
import Head from "next/head";
import { Space_Grotesk, Inter } from "next/font/google";
import Header from '../components/header';

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500","700"], variable: "--font-display" });
const sans = Inter({ subsets: ["latin"], weight: ["400","500","600"], variable: "--font-sans" });

function MyApp({ Component, pageProps }) {
  return (
    <div className={`${display.variable} ${sans.variable} min-h-screen bg-night`}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Header />
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
