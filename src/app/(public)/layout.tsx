import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#content" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-paper focus:px-4 focus:py-2 focus:text-sm focus:text-ink">
        Skip to content
      </a>
      <SiteHeader />
      <main id="content" className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
