import { NotFoundContent } from "@/components/site/NotFoundContent";
import { SiteChrome } from "@/components/site/SiteChrome";

// Rendered by the root layout (outside the (site) group), so it adds the site frame itself.
export default function NotFound() {
  return (
    <SiteChrome>
      <NotFoundContent />
    </SiteChrome>
  );
}
