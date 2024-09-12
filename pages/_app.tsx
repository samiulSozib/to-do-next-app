// pages/_app.tsx
import "../styles/globals.css";
import type { AppProps } from 'next/app';
import { NhostProvider } from "@nhost/nextjs";
import { nhost } from '../utils/nhost'
import Navbar from "@/component/Navbar";

// Initialize the Nhost client with proper configuration
// const nhost = new NhostClient({
//   subdomain: 'smqxodfehrdqywjbwsit',
//   region: 'ap-south-1',
// });

// // Define the MyApp component with type annotations
function App({ Component, pageProps }: AppProps) {
  return (
    
      <NhostProvider nhost={nhost}>
        <Navbar/>
        <Component {...pageProps} />
      </NhostProvider>
    
  );
}

export default App;

