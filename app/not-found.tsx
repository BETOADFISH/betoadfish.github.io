import { Copy, SiteLink } from '@/components/site-context';
export default function NotFound() {
    return (<main className="wrap section">
      <p className="eyebrow"><Copy>{"404 / Page not found"}</Copy></p>
      <h1><Copy>{"This path is"}</Copy><br /><Copy>{"still unexplored."}</Copy></h1>
      <p><Copy>{"The page may have moved, or the link may be incomplete."}</Copy></p>
      <SiteLink href="/" className="button primary"><Copy>{"Return to the portfolio \u2197"}</Copy></SiteLink>
    </main>);
}
