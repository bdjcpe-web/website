import Link from 'next/link';

export const metadata = {
  title: 'Cotisation — BDJ CPE Lyon',
  description: 'Découvre tous les avantages de la cotisation BDJ et rejoins la communauté gaming de CPE Lyon.',
};

const benefits = [
  {
    icon: 'ph-trophy',
    color: '#ff1a3c',
    title: 'Pôle Esport',
    desc: 'Rejoins nos équipes officielles et représente les couleurs de CPE Lyon dans les compétitions, ligues étudiantes et en LANs !',
  },
  {
    icon: 'ph-armchair',
    color: '#8B5E3C',
    title: 'Le Local',
    desc: 'Réservation prioritaire du local. Même si un non-membre a déjà réservé, tu peux prendre la place jusqu\'à la veille du créneau.',
  },
  {
    icon: 'ph-dice-five',
    color: '#6D4C8E',
    title: 'JDR & Campagnes',
    desc: 'Accès aux campagnes de jeux de rôle annuelles organisées chaque semaine au local (tous les lundis et mardis soirs).',
  },
  {
    icon: 'ph-spade',
    color: '#4ea7fb',
    title: 'Poker',
    desc: 'Accès aux soirées poker organisées régulièrement au local. Boissons et chips offertes.',
  },
  {
    icon: 'ph-confetti',
    color: '#E1306C',
    title: 'Événements',
    desc: 'Tarifs réduits sur tous nos événements et shotgun exclusif : les membres peuvent s\'inscrire avant l\'ouverture au grand public.',
  },
  {
    icon: 'ph-seal-percent',
    color: '#f82edd',
    title: 'Réductions partenaires',
    desc: 'Profite de réductions exclusives chez nos partenaires : bars à jeux, bowling, escape games, boutiques spécialisées et plus encore.',
  },
  {
    icon: 'ph-cards',
    color: '#2D7D9A',
    title: 'Location de Jeux',
    desc: 'Emprunte tous les jeux de société de la collection du BDJ pour tes soirées et weekends.',
  },
  {
    icon: 'ph-sword',
    color: '#5D9941',
    title: 'Serveur Minecraft',
    desc: 'Accès 24/7 au serveur Survie privé du BDJ — explorations, constructions et events communautaires.',
  },
];

export default function CotisationPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff', paddingTop: '140px', paddingBottom: '100px', position: 'relative', overflow: 'hidden' }}>

      {/* Background accents */}
      <div style={{ position: 'fixed', top: '5%', right: '-15%', width: '700px', height: '700px', background: 'var(--c-bordeaux)', opacity: 0.03, filter: 'blur(120px)', borderRadius: '50%' }} />
      <div style={{ position: 'fixed', bottom: '5%', left: '-15%', width: '600px', height: '600px', background: 'var(--c-gold)', opacity: 0.04, filter: 'blur(100px)', borderRadius: '50%' }} />

      <div className="container animate-fade-in" style={{ position: 'relative', zIndex: 10 }}>

        {/* ── HERO ── */}
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--c-bordeaux)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '16px' }}>Adhésion 2026–2027</p>
          <h1 className="section-title">Deviens Membre BDJ</h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--c-grey-medium)', maxWidth: '600px', margin: '20px auto 0', fontWeight: 500, lineHeight: 1.6 }}>
            Pour 10€, soutiens ton bureau des jeux et débloque l'accès à tous les avantages exclusifs de la communauté.
          </p>
          <div style={{ width: '80px', height: '4px', background: 'var(--c-bordeaux)', margin: '36px auto 0', borderRadius: '2px' }} />
        </div>

        {/* ── MAIN LAYOUT: benefits left + CTA right ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '40px', alignItems: 'start' }}>

          {/* LEFT: 6 benefit cards, 2 per row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {benefits.map((b) => (
              <div key={b.title} style={{ background: '#fff', border: `1.5px solid ${b.color}40`, borderRadius: '24px', padding: '28px', boxShadow: `0 4px 20px ${b.color}10`, display: 'flex', gap: '18px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${b.color}14`, border: `1.5px solid ${b.color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className={`ph ${b.icon}`} style={{ fontSize: '1.5rem', color: b.color }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#000', margin: '0 0 6px 0' }}>{b.title}</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--c-grey-medium)', margin: 0, lineHeight: 1.6 }}>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: sticky pricing CTA */}
          <div style={{ position: 'sticky', top: '100px', background: 'var(--c-bordeaux)', borderRadius: '32px', padding: '40px', color: '#fff' }}>
            <h2 style={{ fontSize: '1.7rem', fontWeight: 900, margin: '0 0 12px 0', lineHeight: 1.2 }}>Prêt à rejoindre l'aventure ?</h2>
            <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '32px', lineHeight: 1.6 }}>
              La cotisation est valable pour toute l'année universitaire.<br />Paiement sécurisé via HelloAsso.
            </p>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '28px', textAlign: 'center' }}>
              <p style={{ fontSize: '0.8rem', opacity: 0.7, margin: '0 0 4px' }}>Cotisation annuelle</p>
              <p style={{ fontSize: '4rem', fontWeight: 900, margin: '0 0 24px', lineHeight: 1 }}>10€</p>
              <iframe id="haWidgetButton" src="https://www.helloasso.com/associations/bureau-des-jeux-cpe-lyon/adhesions/adhesion-bdj-cpe-lyon-26-27/widget-bouton" style={{ width: '100%', height: '70px', border: 'none' }}></iframe>
              <p style={{ fontSize: '0.65rem', opacity: 0.5, marginTop: '12px', marginBottom: 0 }}>CB · Apple/Google Pay · PayPal</p>
            </div>
          </div>

        </div>

        {/* Back link */}
        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <Link href="/profil" className="nav-link" style={{ fontSize: '0.9rem' }}>← Retour au profil</Link>
        </div>

      </div>
    </div>
  );
}
