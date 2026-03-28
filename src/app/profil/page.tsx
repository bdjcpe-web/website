/**
 * @file src/app/profil/page.tsx
 * @author Loann Cordel
 * @date 27/03/2026
 * @description Page de profil de l'utilisateur
 * - Affichage des informations de l'utilisateur
 * - Affichage des réservations de l'utilisateur
 * - Affichage de la carte de membre
 * - Affichage des réservations des utilisateurs (admin)
 * - Affichage des membres (admin)
 * - Synchronisation des membres (admin)
 * @requires prisma
 * @requires next-auth
 * @requires @prisma/client
 * @requires next/navigation
 * @requires next/link
 * @requires @/lib/auth
 * @requires @/lib/prisma
 * @requires @/components/MemberCard
 * @requires @/components/Admin/Dashboard/AdminDashboard
 * @requires @/components/CancelBookingButton
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import MemberCard from '@/components/MemberCard/MemberCard';
import AdminDashboard from '@/components/Admin/Dashboard/AdminDashboard';
import styles from './Profil.module.css';
import CancelBookingButton from '@/components/CancelBookingButton';

export default async function ProfilPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: { bookings: { orderBy: { date: 'asc' } } }
  });

  if (!user) redirect('/login');

  const adminEmails = (process.env.ADMIN_EMAILS || "").split(',').map(e => e.trim().toLowerCase());
  const isAdmin = session?.user?.email && adminEmails.includes(session.user.email.toLowerCase());

  let bookings: any[] = [];
  if (isAdmin) {
    bookings = await prisma.booking.findMany({
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { date: 'asc' }
    });
  }

  // Calcul de l'année (ex: 3A, 4A)
  const calculateYear = () => {
    if (!(user as any).registeredYear) return null;
    const reg = new Date(user.createdAt);
    const now = new Date();
    let septs = 0;
    for (let y = reg.getFullYear(); y <= now.getFullYear(); y++) {
      const sept = new Date(y, 8, 1);
      if (sept > reg && sept <= now) septs++;
    }
    return Math.min(5, (user as any).registeredYear + septs);
  };
  const currentYear = calculateYear();

  return (
    <div className={styles.pageContainer}>
      <div className={styles.bgBordeaux} aria-hidden="true" />
      <div className={styles.bgGold} aria-hidden="true" />

      <div className={`container animate-fade-in ${styles.contentWrapper}`}>

        {/* ── HEADER ── */}
        <header className={styles.header}>
          <h1 className="section-title">Mon Profil</h1>
          <p className={styles.welcomeText}>Bienvenue dans ton espace personnel {user.firstName}.</p>
        </header>

        {/* ── MAIN LAYOUT ── */}
        <main className={styles.mainLayout}>

          {/* ── LEFT COLUMN ── */}
          <div className={styles.leftCol}>

            {/* INFOS */}
            <section className={`${styles.box} ${styles.infoLayout}`}>
              <div className={styles.avatarBox} aria-hidden="true">
                <i className={`ph ph-user ${styles.avatarIcon}`} />
              </div>
              <div>
                <h2 className={styles.userName}>{user.firstName} {user.lastName}</h2>
                <p className={styles.userEmail}>{user.email}</p>
                <div className={styles.tagsWrapper}>
                  <span className={`${styles.tag} ${styles.tagStandard}`}>
                    Membre depuis {new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </span>
                  {(user as any).filiere && (
                    <span className={`${styles.tag} ${styles.tagFiliere}`}>{(user as any).filiere}</span>
                  )}
                  {currentYear && (
                    <span className={`${styles.tag} ${styles.tagYear}`}>{currentYear}A</span>
                  )}
                </div>
              </div>
            </section>

            {/* COTISATION STATUS */}
            <section className={`${styles.box} ${styles.cotizLayout}`} data-member={user.isMember}>
              <div className={styles.cotizIconBox} data-member={user.isMember} aria-hidden="true">
                <i className={`ph ${user.isMember ? 'ph-crown' : 'ph-shield-warning'} ${styles.cotizIcon}`} data-member={user.isMember} />
              </div>
              <div>
                <h3 className={styles.cotizTitle} data-member={user.isMember}>
                  {user.isMember ? 'MEMBRE VIP' : 'NON COTISANT'}
                </h3>
                <p className={styles.cotizDesc}>
                  {user.isMember
                    ? <>Accès à tous les <Link href="/cotisation" style={{ color: 'var(--c-gold)', fontWeight: 700 }}>avantages</Link> de la cotiz !</>
                    : 'Rejoins le BDJ pour accéder à tous les avantages'
                  }
                </p>
              </div>
            </section>

            {/* RESERVATIONS */}
            <section className={styles.box}>
              <header className={styles.resHeader}>
                <i className={`ph ph-calendar-check ${styles.resHeaderIcon}`} aria-hidden="true" />
                <h2 className={styles.resTitle}>MES RÉSERVATIONS</h2>
              </header>

              {user.bookings.length === 0 ? (
                <div className={styles.resEmpty}>
                  <p style={{ color: 'var(--c-grey-medium)', margin: '0 0 16px' }}>Tu n'as aucune réservation pour le moment.</p>
                  <Link href="/le-local" className="btn btn-premium">Réserver le local</Link>
                </div>
              ) : (
                <div className={styles.resGrid}>
                  {user.bookings.map(booking => (
                    <article key={booking.id} className={styles.resCard}>
                      <div className={styles.resCardTop}>
                        <div>
                          <p className={styles.resDate}>{new Date(booking.date).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })}</p>
                          <p className={styles.resTime}>{booking.startTime} - {booking.endTime}</p>
                        </div>
                        <div className={styles.resIconBox} aria-hidden="true">
                          <i className="ph ph-armchair" style={{ fontSize: '1.3rem' }} />
                        </div>
                      </div>
                      <footer className={styles.resCardBottom}>
                        <CancelBookingButton bookingId={booking.id} />
                      </footer>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <aside className={styles.rightCol}>
            {user.isMember ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--c-bordeaux)', letterSpacing: '0.2em', textTransform: 'uppercase', margin: 0 }}>
                  Carte de membre
                </p>
                <MemberCard
                  firstName={user.firstName}
                  lastName={user.lastName}
                  filiere={(user as any).filiere}
                  registeredYear={(user as any).registeredYear}
                  memberSince={user.createdAt.toISOString()}
                />
              </div>
            ) : (
              <div className={styles.ctaBox}>
                <h2 className={styles.ctaTitle}>DEVIENS MEMBRE</h2>
                <p className={styles.ctaDesc}>Soutiens ton bureau des jeux et profite d'avantages exclusifs toute l'année.</p>

                <div className={styles.ctaList}>
                  {[
                    { icon: 'ph-trophy', t: 'Pôle Esport', d: 'Accès aux compétitions' },
                    { icon: 'ph-armchair', t: 'Le Local', d: 'Réservations prioritaires' },
                    { icon: 'ph-confetti', t: 'Événements', d: 'Tarifs réduits' },
                    { icon: 'ph-arrow-right', t: 'Et bien plus encore…', d: 'Clique pour voir tous les avantages' }
                  ].map(item => (
                    <div key={item.t} className={styles.ctaItem}>
                      <div className={styles.ctaIconBox} aria-hidden="true">
                        <i className={`ph ${item.icon}`} style={{ fontSize: '1.3rem' }} />
                      </div>
                      <div>
                        <p className={styles.ctaItemTitle}>{item.t}</p>
                        <p className={styles.ctaItemDesc}>{item.d}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.ctaPriceBlock}>
                  <p className={styles.ctaPrice}>10€</p>
                  <p style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '20px' }}>Cotisation annuelle</p>
                  <Link href="/cotisation" className="btn btn-gold" style={{ width: '100%' }}>EN SAVOIR PLUS</Link>
                </div>
              </div>
            )}
          </aside>
        </main>

        {/* ── ADMIN SECTION ── */}
        {isAdmin && (
          <AdminDashboard bookings={bookings} />
        )}

      </div>
    </div>
  );
}