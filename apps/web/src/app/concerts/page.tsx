import { MarketplaceSearchPage } from '@/components/marketplace/MarketplaceSearchPage';

export const metadata = {
  title: 'Concerts in Nigeria',
  description:
    'Afrobeats arenas, gospel nights, hip-hop festivals — every concert worth booking in Lagos, Abuja, Port Harcourt and beyond.',
};

export default function ConcertsPage() {
  return (
    <MarketplaceSearchPage
      initialQuery="concerts"
      initialFacet="concerts"
      searchPlaceholder="Search concerts, artists, venues…"
      searchAriaLabel="Search concerts"
      entityLabel="concert"
    />
  );
}
