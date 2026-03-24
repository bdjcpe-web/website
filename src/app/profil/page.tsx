import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import CancelBookingButton from '../le-local/CancelBookingButton';
import MemberCard from '@/components/MemberCard';
import AddMemberForm from '@/components/AddMemberForm';
import SyncMembersButton from '@/components/SyncMembersButton';

export default async function ProfilPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      bookings: {
        orderBy: { date: 'asc' }
      }
    }
  });

  if (!user) {
    redirect('/login');
  }

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
    <div style={{ minHeight: '100vh', backgroundColor: '#fff', paddingTop: '160px', paddingBottom: '100px', position: 'relative', overflow: 'hidden' }}>

      {/* ── BACKGROUND ACCENTS ── */}
      <div style={{ position: 'fixed', top: '10%', right: '-10%', width: '600px', height: '600px', background: 'var(--c-bordeaux)', opacity: 0.03, filter: 'blur(100px)', borderRadius: '50%' }} />
      <div style={{ position: 'fixed', bottom: '10%', left: '-10%', width: '500px', height: '500px', background: 'var(--c-gold)', opacity: 0.05, filter: 'blur(80px)', borderRadius: '50%' }} />

      <div className="container animate-fade-in" style={{ position: 'relative', zIndex: 10 }}>

        {/* ── HEADER ── */}
        <div style={{ marginBottom: '60px' }}>
          <h1 className="section-title" style={{ textAlign: 'left' }}>Mon Profil</h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--c-grey-medium)', fontWeight: 500, marginTop: '10px' }}>
            Bienvenue dans ton espace personnel, {user.firstName}.
          </p>
        </div>
        {/* ── 2-COLUMN LAYOUT ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', alignItems: 'start' }}>

          {/* ── LEFT COLUMN ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* BOX 1: INFOS */}
            <div style={{ background: '#fff', borderRadius: '32px', padding: '36px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 8px 24px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '32px' }}>
              <div style={{ width: '100px', height: '100px', background: 'var(--c-grey-light)', borderRadius: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className="ph ph-user" style={{ fontSize: '3.5rem', color: 'var(--c-grey-dark)' }} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.7rem', fontWeight: 900, color: '#000', margin: 0, textTransform: 'uppercase' }}>{user.firstName} {user.lastName}</h2>
                <p style={{ fontSize: '1rem', color: 'var(--c-grey-medium)', margin: '4px 0 14px' }}>{user.email}</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ padding: '6px 14px', background: 'var(--c-grey-light)', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--c-grey-dark)' }}>
                    Membre depuis {new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </span>
                  {(user as any).filiere && (
                    <span style={{ padding: '6px 14px', background: 'rgba(109,12,36,0.07)', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--c-bordeaux)' }}>
                      {(user as any).filiere}
                    </span>
                  )}
                  {(user as any).registeredYear && (() => {
                    const reg = new Date(user.createdAt);
                    const now = new Date();
                    let septs = 0;
                    for (let y = reg.getFullYear(); y <= now.getFullYear(); y++) {
                      const sept = new Date(y, 8, 1); // Sept 1
                      if (sept > reg && sept <= now) septs++;
                    }
                    const currentYear = Math.min(5, (user as any).registeredYear + septs);
                    return (
                      <span style={{ padding: '6px 14px', background: 'rgba(225,184,47,0.12)', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700, color: '#8a6a00' }}>
                        {currentYear}A
                      </span>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* BOX 2: COTISATION */}
            <div style={{ background: user.isMember ? 'linear-gradient(135deg, #fff 0%, #fff9e6 100%)' : '#fff', borderRadius: '32px', padding: '32px', border: user.isMember ? '2px solid var(--c-gold)' : '1px solid rgba(0,0,0,0.05)', boxShadow: user.isMember ? '0 8px 24px rgba(225,184,47,0.12)' : '0 8px 24px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ width: '64px', height: '64px', background: user.isMember ? 'var(--c-gold)' : 'var(--c-grey-light)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: user.isMember ? '0 8px 16px rgba(225,184,47,0.3)' : 'none' }}>
                <i className={`ph ${user.isMember ? 'ph-crown' : 'ph-shield-warning'}`} style={{ fontSize: '2rem', color: user.isMember ? '#fff' : 'var(--c-grey-dark)' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: user.isMember ? 'var(--c-gold)' : '#000', margin: 0 }}>{user.isMember ? 'MEMBRE VIP' : 'NON COTISANT'}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--c-grey-medium)', margin: '4px 0 0' }}>{user.isMember ? (<>Accès à tous les <Link href="/cotisation" style={{ color: 'var(--c-gold)', fontWeight: 700, textDecoration: 'underline' }}>avantages</Link> de la cotiz !</>) : 'Rejoins le BDJ pour accéder à tous les avantages'}</p>
              </div>
            </div>

            {/* BOX 3: RESERVATIONS */}
            <div style={{ background: '#fff', borderRadius: '32px', padding: '36px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
                <i className="ph ph-calendar-check" style={{ fontSize: '1.8rem', color: 'var(--c-bordeaux)' }} />
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#000', margin: 0 }}>MES RÉSERVATIONS</h2>
              </div>
              {user.bookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px', background: '#f9f9f9', borderRadius: '20px' }}>
                  <p style={{ color: 'var(--c-grey-medium)', margin: '0 0 16px' }}>Tu n'as aucune réservation pour le moment.</p>
                  <Link href="/le-local" className="btn btn-premium" style={{ display: 'inline-block', textDecoration: 'none' }}>Réserver le local</Link>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                  {user.bookings.map(booking => (
                    <div key={booking.id} style={{ background: '#fcfcfc', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '20px', padding: '22px', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <p style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>{new Date(booking.date).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })}</p>
                          <p style={{ fontSize: '0.85rem', color: 'var(--c-bordeaux)', fontWeight: 700, marginTop: '4px' }}>{booking.startTime} - {booking.endTime}</p>
                        </div>
                        <div style={{ padding: '7px', background: 'rgba(109,12,36,0.05)', borderRadius: '10px', color: 'var(--c-bordeaux)' }}>
                          <i className="ph ph-armchair" style={{ fontSize: '1.3rem' }} />
                        </div>
                      </div>
                      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(0,0,0,0.04)', textAlign: 'right' }}>
                        <CancelBookingButton bookingId={booking.id} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div> {/* <-- FIN DE LA COLONNE DE GAUCHE */}


          {/* ── RIGHT COLUMN (STICKY) ── */}
          <div style={{ position: 'sticky', top: '100px' }}>

            {/* MEMBER CARD (Si cotisant) */}
            {user.isMember ? (
              <div style={{ display: 'flex', top: '100px', flexDirection: 'column', gap: '14px' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--c-bordeaux)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0' }}>Carte de membre</p>
                <MemberCard
                  firstName={user.firstName}
                  lastName={user.lastName}
                  filiere={(user as any).filiere}
                  registeredYear={(user as any).registeredYear}
                  memberSince={user.createdAt.toISOString()}
                />
              </div>
            ) : (
              <div id="cotisation-info" style={{ background: 'var(--c-bordeaux)', borderRadius: '32px', padding: '40px', color: '#fff' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '0 0 12px 0', lineHeight: 1.2 }}>DEVIENS MEMBRE</h2>
                <p style={{ fontSize: '0.95rem', opacity: 0.8, marginBottom: '28px', lineHeight: 1.6 }}>
                  Soutiens ton bureau des jeux et profite d'avantages exclusifs toute l'année.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
                  {[
                    { icon: 'ph-trophy', t: 'Pôle Esport', d: 'Accès aux compétitions' },
                    { icon: 'ph-armchair', t: 'Le Local', d: 'Réservations prioritaires' },
                    { icon: 'ph-confetti', t: 'Événements', d: 'Tarifs réduits' },
                    { icon: 'ph-arrow-right', t: 'Et bien plus encore…', d: 'Clique pour voir tous les avantages' }
                  ].map(item => (
                    <div key={item.t} style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <i className={`ph ${item.icon}`} style={{ fontSize: '1.3rem' }} />
                      </div>
                      <div>
                        <p style={{ fontWeight: 800, margin: 0, fontSize: '0.9rem' }}>{item.t}</p>
                        <p style={{ fontSize: '0.75rem', opacity: 0.7, margin: 0 }}>{item.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '24px', textAlign: 'center' }}>
                  <p style={{ fontSize: '3rem', fontWeight: 900, margin: '0 0 4px' }}>10€</p>
                  <p style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '20px' }}>Cotisation annuelle</p>
                  <Link href="/cotisation" className="btn btn-gold" style={{ width: '100%', display: 'inline-block', textDecoration: 'none', textAlign: 'center' }}>EN SAVOIR PLUS</Link>
                </div>
              </div>
            )}

          </div> {/* <-- FIN DE LA COLONNE DE DROITE */}

        </div>

        {/* Admin Section */}
        {isAdmin && (
          <div style={{ marginTop: '100px', background: '#fff', borderRadius: '40px', padding: '30px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 30px 60px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
              <div style={{ padding: '15px', background: 'var(--c-bordeaux)', borderRadius: '15px' }}>
                <i className="ph ph-lock-key" style={{ fontSize: '2rem', color: '#fff' }} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--c-bordeaux)', margin: 0 }}>Dashboard Admin</h2>
                <p style={{ color: 'var(--c-grey-medium)', margin: 0 }}>Gestion des réservations du Local</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '10px', marginBottom: '40px' }}>
              <AddMemberForm />
              <div className="admin-form-container">
                <h3 className="admin-form-title">Synchronisation Automatique</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--c-grey-medium)', lineHeight: 1.5, marginBottom: '20px' }}>
                  Récupérez instantanément la liste des cotisants depuis HelloAsso pour mettre à jour les droits d'accès.
                </p>
                <SyncMembersButton />
              </div>
            </div>

            {bookings.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', background: '#f9f9f9', borderRadius: '24px', color: 'var(--c-grey-medium)' }}>
                Aucune réservation active.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px' }}>
                  <thead>
                    <tr style={{ color: 'var(--c-grey-medium)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      <th style={{ padding: '15px', textAlign: 'left' }}>Date & Heure</th>
                      <th style={{ padding: '15px', textAlign: 'left' }}>Étudiant</th>
                      <th style={{ padding: '15px', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b.id} style={{ background: '#fcfcfc', border: '1px solid rgba(0,0,0,0.03)' }}>
                        <td style={{ padding: '20px', borderRadius: '15px 0 0 15px' }}>
                          <span style={{ fontWeight: 800 }}>{b.date.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' })}</span>
                          <span style={{ marginLeft: '10px', padding: '4px 10px', background: 'var(--c-bordeaux)', color: '#fff', borderRadius: '8px', fontSize: '0.8rem' }}>{b.startTime} - {b.endTime}</span>
                        </td>
                        <td style={{ padding: '20px' }}>
                          <p style={{ fontWeight: 700, margin: 0 }}>{b.user.firstName} {b.user.lastName}</p>
                          <p style={{ fontSize: '0.8rem', color: 'var(--c-grey-medium)', margin: 0 }}>{b.user.email}</p>
                        </td>
                        <td style={{ padding: '20px', textAlign: 'right', borderRadius: '0 15px 15px 0' }}>
                          <CancelBookingButton bookingId={b.id} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <style>{`
        @media (max-width: 900px) {
          .container { padding: 0 20px; }
          div[style*="grid-template-columns: repeat(3, 1fr)"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="grid-column: span 2"], 
          div[style*="grid-column: span 3"] {
            grid-column: span 1 !important;
          }
          div[style*="flex-direction: column"] {
            flex-direction: column !important;
            padding: 30px !important;
          }
           div[style*="gap: 60px"] {
            flex-direction: column !important;
            gap: 40px !important;
            padding: 40px 20px !important;
          }
          div[style*="width: 300px"] {
            width: 100% !important;
          }
        }
      `}</style>
      </div>
    </div>
  );
}
