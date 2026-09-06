import type { Metadata } from 'next';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-700.css';
import './globals.css';
export const metadata: Metadata = {
  title: 'Bill Huang | Molecular Science & Biotech Intelligence',
  description:
    'Bill Huang’s work in enzyme engineering, antimicrobial research and biotechnology assessment, with experimental data and interactive molecular structures.',
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
            <a className="brand" href="/">
              Bill<span className="brand-dot">.</span>
              <span className="brand-caption">Molecular Science</span>
            </a>
            <nav aria-label="Main navigation">
              <a href="/projects">Research</a>
              <a href="/intelligence">Biotech intelligence</a>
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
                  Research opportunities
                  <br />
                  and biotechnology discussions.
                </h2>
              </div>
              <div>
                <p>Research · Biotech R&D · Strategy</p>
                <p className="small">For research opportunities and biotechnology conversations.</p>
                <div className="contact-links">
                  <a href="mailto:zh392@cam.ac.uk">zh392@cam.ac.uk ↗</a>
                  <a href="https://www.linkedin.com/in/bill-huang-bb0160302/" target="_blank" rel="noreferrer">LinkedIn ↗</a>
                  <a href="/downloads/Bill-Huang-CV.pdf" download>Download CV ↓</a>
                </div>
              </div>
            </div>
            <div className="footer-bottom">
              <span>
                <b>Bill.</b> Molecular Science & Biotech Intelligence
              </span>
              <span>© 2026 Bill Huang · Independent portfolio</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
