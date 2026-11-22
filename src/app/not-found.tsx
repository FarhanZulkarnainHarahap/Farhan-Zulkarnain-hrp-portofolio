import LegacyNotFound from "@/components/legacy/LegacyNotFound";
import { SiteChrome } from "@/components/site/SiteChrome";

// Rendered by the root layout (outside the (site) group), so it adds the site frame itself.
export default function NotFound() {
  return (
    <SiteChrome>
      <LegacyNotFound />
    </SiteChrome>
  );
}
