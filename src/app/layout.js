import './globals.css';
import Disclaimer from '@/components/Disclaimer';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Ask Pakistan — Government Services Q&A Assistant',
  description: 'Free, independent assistant for Pakistani government services (CNIC, Passport, NTN, BISP, PTA). Answers retrieved strictly from official .gov.pk sources.',
  keywords: 'Ask Pakistan, NADRA CNIC renewal, Pakistani passport fee, NTN filer status, BISP 8171, PTA DIRBS tax, Pakistani government services'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
        <div>
          <Disclaimer />
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
