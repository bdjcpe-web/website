import Link from 'next/link';
import CalendarBooking from '@/components/CalendarBooking';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

const equipment = [
  {
    icon: 'ph-television',
    title: 'TV & Console',
    items: ['Écran 56"', 'Chromecast', 'Mario Kart 8', 'Rocket League', 'et d\'autres...'],
    bg: '/activities/local-TV.jpg'
  },
  {
    icon: 'ph-dice-five',
    title: 'Jeux de société',
    items: ['Poker', 'Loup Garou', 'Catan', 'Courtisans', 'et d\'autres...'],
    bg: '/activities/local-jeu.jpg'
  },
  {
    icon: 'ph-fork-knife',
    title: 'Restauration',
    items: ['Micro-ondes', 'Frigo', 'Sodas', 'Snacks', 'Fruits'],
    bg: '/activities/local-microwave.jpg'
  },
  {
    icon: 'ph-wifi-high',
    title: 'Ambiance',
    items: ['Wifi', 'Canapés', 'Poufs', 'Enceinte', 'Intimité', '6 personnes max'],
    bg: '/activities/local-ambiance.jpg'
  },
];

export default async function LocalPage() {
  const session = await getServerSession(authOptions);

  const adminEmails = (process.env.ADMIN_EMAILS || "").split(',').map(e => e.trim().toLowerCase());
  const isAdmin = session?.user?.email && adminEmails.includes(session.user.email.toLowerCase());

  let bookings: any[] = [];
  if (isAdmin) {
    bookings = await prisma.booking.findMany({
      include: {
        user: { select: { firstName: true, lastName: true, email: true } }
      },
      orderBy: { date: 'asc' }
    });
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--c-white)' }}>

      {/* ── HIGH-FIDELITY HERO ── */}
      <div style={{
        position: 'relative',
        paddingTop: '160px',
        paddingBottom: '80px',
        background: 'url("/activities/local.jpg") center/cover no-repeat',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'var(--c-local)', opacity: 0.5, mixBlendMode: 'multiply' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent, rgba(0,0,0,0.3))' }} />

        <div className="container animate-fade-in" style={{ position: 'relative', zIndex: 10 }}>
          <Link href="/" className="btn" style={{ color: '#fff', marginBottom: '2rem', padding: '8px 20px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.8rem' }}>
            <i className="ph ph-arrow-left" style={{ marginRight: '8px' }} /> Retour à l'accueil
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <i className="ph ph-armchair" style={{ fontSize: '4rem', color: 'var(--c-local)', filter: 'drop-shadow(0 0 12px rgba(230,213,184,0.8))' }} />
            <div>
              <h1 className="title-hero" style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', color: '#fff', margin: 0, fontFamily: 'var(--font-heading)' }}>LE LOCAL</h1>
              <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--c-gold)', letterSpacing: '0.05em' }}>BATIMENT D - SALLE D016</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
        {/* Booking Component */}
        <CalendarBooking />
      </div>

      {/* ── EQUIPMENT ACCORDION ── */}
      <div style={{ width: '100%', overflowX: 'hidden', background: '#000', borderTop: '4px solid var(--c-local)', borderBottom: '4px solid var(--c-local)' }}>
        <style>{`
          .eq-panel {
            flex: 1;
            position: relative;
            height: 450px;
            overflow: hidden;
            transition: all 0.7s cubic-bezier(0.23, 1, 0.32, 1);
            cursor: pointer;
          }
          .eq-panel:hover { flex: 2; }
          .eq-bg {
            position: absolute;
            inset: 0;
            background-size: cover;
            background-position: center;
            filter: grayscale(0.6) brightness(0.4);
            transition: all 0.7s cubic-bezier(0.23, 1, 0.32, 1);
          }
          .eq-panel:hover .eq-bg { filter: grayscale(0) brightness(0.7); transform: scale(1.05); }
          .eq-info {
            position: absolute;
            inset: 0;
            padding: 40px;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            z-index: 10;
            background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
          }
        `}</style>

        <div style={{ display: 'flex', gap: '0' }}>
          {equipment.map((eq, idx) => (
            <div key={eq.title} className="eq-panel" style={{ borderRight: idx < equipment.length - 1 ? '3px solid var(--c-local)' : 'none' }}>
              <div className="eq-bg" style={{ backgroundImage: `url(${eq.bg})` }} />
              <div className="eq-info">
                <i className={`ph ${eq.icon}`} style={{ fontSize: '2.5rem', color: 'var(--c-gold)', marginBottom: '15px' }} />
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', textTransform: 'uppercase' }}>{eq.title}</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '15px' }}>
                  {eq.items.map(item => (
                    <span key={item} style={{ padding: '5px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: '100px', fontSize: '0.7rem', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
