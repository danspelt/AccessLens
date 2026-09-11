import { SiteFooter } from '@/components/layout/SiteFooter';
import { PublicFooterSlot } from '@/components/layout/PublicFooterSlot';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">{children}</div>
      <PublicFooterSlot>
        <SiteFooter />
      </PublicFooterSlot>
    </div>
  );
}
