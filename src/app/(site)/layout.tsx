import { SiteChrome } from "@/components/site/SiteChrome";

/** Public pages: new header and footer around each page's own <main>. */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteChrome>{children}</SiteChrome>;
}
