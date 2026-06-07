import type { Metadata } from 'next';
import {
  ContentBlock,
  ContentCTA,
  ContentHero,
  ContentSubNav,
  PillarsBlock,
  StatsStrip,
  TeamBlock,
  TimelineBlock,
} from '@/components/marketplace/Editorial';

export const metadata: Metadata = {
  title: 'About Computicket Nigeria',
  description:
    "Built in Lagos. For everywhere you'd rather be. Computicket Nigeria is the country's premium digital ecosystem for entertainment, travel and experiences.",
};

export default function AboutPage() {
  return (
    <div className="page-enter">
      <ContentSubNav group="company" active="about" />

      <ContentHero
        eyebrow="About Computicket NG"
        title={<>Built in Lagos. For everywhere you&apos;d rather be.</>}
        lede="We are Nigeria's premium digital ecosystem for entertainment, travel and experiences — designed to make every booking feel as good as the moment it unlocks."
      />

      <StatsStrip
        stats={[
          { n: '1.2M+', l: 'Tickets sold this year' },
          { n: '2,400+', l: 'Events on-platform' },
          { n: '38', l: 'Airlines & operators' },
          { n: '99.97%', l: 'Booking success rate' },
        ]}
      />

      <ContentBlock
        eyebrow="Our story"
        title="The Apple, Airbnb and Ticketmaster of Africa — built by Nigerians for the world."
        image="ph-1"
        imageCaption="Lagos, May 2026 · Headquarters at Adeola Odeku"
        body={
          <>
            <p>
              Computicket NG started in a Yaba co-working space in 2021 with a stubborn belief:
              Nigerians deserve a booking experience that doesn&apos;t just <em>work</em> — it
              should feel like a luxury.
            </p>
            <p className="mt-4">
              Five years later, we power ticketing for the country&apos;s biggest concerts, the
              largest organizer hubs in West Africa, and a flight-and-stay marketplace that 1.2
              million Nigerians trust every year.
            </p>
            <p className="mt-4">We are still a Lagos company — and still stubborn.</p>
          </>
        }
      />

      <PillarsBlock
        eyebrow="What we stand for"
        title="Four principles that shape every product decision."
        pillars={[
          {
            icon: 'shield',
            title: 'Trust by default',
            body:
              'Every transaction is insured, every QR is verified, every refund is processed in 48 hours. Trust is not a feature.',
            color: 'oklch(0.62 0.18 152)',
          },
          {
            icon: 'sparkle',
            title: 'Intelligent, not noisy',
            body:
              "Compass AI personalises without surveilling. Suggestions you'd actually take — never spam, never sold.",
            color: 'oklch(0.60 0.16 230)',
          },
          {
            icon: 'bolt',
            title: 'Naija-fast',
            body:
              'Optimised for 2G. Cached offline. USSD-friendly. Built for real Nigerian network realities — not Silicon Valley fiber.',
            color: 'oklch(0.65 0.20 25)',
          },
          {
            icon: 'heart',
            title: 'Built with culture',
            body:
              "From Afrobeats to Owambe to Detty December — we are not just a platform for Nigerian life; we're built inside it.",
            color: 'oklch(0.55 0.18 305)',
          },
        ]}
      />

      <ContentBlock
        eyebrow="The team"
        title="A small group of Nigerians obsessed with how this country has fun."
        imagePosition="left"
        image="ph-5"
        imageCaption="Engineering offsite · Lekki Conservation Centre"
        body={
          <>
            <p>
              We are 84 people across Lagos, Abuja, Port Harcourt and Cape Town. About a third of
              us were customers first.
            </p>
            <p className="mt-4">
              Our investors include Africa-focused venture funds like Future Africa and TLcom,
              plus a handful of operators from Paystack, Flutterwave, and Spotify.
            </p>
            <p className="mt-4">
              We are hiring — engineers, designers, organizer success, and a few very specific
              roles in fraud and AI safety.
            </p>
          </>
        }
      />

      <TimelineBlock
        eyebrow="Milestones"
        title="Five years, one country, a few rooftops."
        items={[
          {
            year: '2021',
            title: 'Founded in a co-working space',
            body:
              'Three founders, two laptops, one stubborn thesis. Sold 47 tickets in our first month — to a comedy show at Terra Kulture.',
          },
          {
            year: '2022',
            title: '₦1B GMV. First Lagos sell-out.',
            body:
              "Powered the entire ticketing for Asake's debut Lagos show. Crashed our servers twice. Learned a lot.",
          },
          {
            year: '2023',
            title: 'Compass AI · early access',
            body:
              'Quietly launched our personalisation engine. Conversion went up 38%. The team realised we had built something rare.',
          },
          {
            year: '2024',
            title: 'Flights, stays and Detty December',
            body:
              'Expanded into travel. Powered 22% of Detty December bookings in Lagos. Hit 1M downloads on Android.',
          },
          {
            year: '2026',
            title: 'The premium booking layer of Africa',
            body:
              'Now operating across 6 Nigerian states. Pilots launching in Accra, Nairobi and Johannesburg by Q4.',
          },
        ]}
      />

      <TeamBlock
        eyebrow="Leadership"
        title="The team behind the platform."
        people={[
          { name: 'Adaeze Okafor', role: 'Co-founder, CEO',  from: 'Paystack',      ph: 'ph-2' },
          { name: 'Tobi Adesanya', role: 'Co-founder, CTO',  from: 'Flutterwave',   ph: 'ph-7' },
          { name: 'Chika Nwankwo', role: 'VP Product',        from: 'Spotify',       ph: 'ph-3' },
          { name: 'Emeka Balogun', role: 'Head of Trust & Safety', from: 'Interpol Cyber', ph: 'ph-4' },
        ]}
      />

      <ContentCTA
        eyebrow="Join us"
        title="We're hiring — across product, engineering and creative."
        sub="84 people. 12 open roles. One mission to make Nigerian booking feel like Apple, Airbnb and Ticketmaster combined."
        primary={{ label: 'See open roles', href: '/careers' }}
        secondary={{ label: 'Read engineering blog', href: '/press' }}
      />
    </div>
  );
}
