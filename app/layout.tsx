import type { Metadata } from 'next';
import Link from 'next/link';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-700.css';
import './globals.css';
export const metadata: Metadata = {
  title: 'Bill | Molecular Science & Biotech Intelligence',
  description:
    'From molecular mechanisms to decision-ready evidence. An evidence-led portfolio in biochemistry, enzyme engineering and biotechnology intelligence.',
  icons: { icon: '/favicon.svg' },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <header className="site-header">
          <div className="wrap header-inner">
            <Link className="brand" href="/">
              Bill<span className="brand-dot">.</span>
              <span className="brand-caption">Molecular Science</span>
            </Link>
            <nav aria-label="Main navigation">
              <a href="/#projects">Projects</a>
              <a href="/#approach">Approach</a>
              <a href="/#about">About</a>
              <a href="#contact" className="nav-contact">
                Contact <span aria-hidden="true">↗</span>
              </a>
            </nav>
          </div>
        </header>
        <div id="main-content">{children}</div>
        <footer id="contact">
          <div className="wrap">
            <div className="contact-row">
              <div>
                <p className="eyebrow">Let’s connect</p>
                <h2>
                  Good science starts
                  <br />
                  with a good question.
                </h2>
              </div>
              <div>
                <p>Research · Biotech R&D · Strategy</p>
                <p className="small">Contact details are being prepared.</p>
                <div className="contact-links">
                  <span>Email — to be added</span>
                  <span>LinkedIn — to be added</span>
                  <span>Code portfolio — to be added</span>
                </div>
              </div>
            </div>
            <div className="footer-bottom">
              <span>
                <b>Bill.</b> Molecular Science & Biotech Intelligence
              </span>
              <span>Designed as an evidence-led scientific portfolio.</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
