import { MarketplaceSearchPage } from '@/components/marketplace/MarketplaceSearchPage';

export const metadata = {
  title: 'Events in Nigeria — concerts, comedy, theatre',
  description:
    "Browse every live event on Computicket Nigeria — concerts, comedy, theatre, festivals. Filter by city, date, genre and price.",
};

export default function EventsPage() {
  return <MarketplaceSearchPage />;
}
