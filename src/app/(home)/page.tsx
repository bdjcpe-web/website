/**
 * @file src/app/page.tsx
 * @author Loann Cordel - Président du BDJ
 * @date 24/03/2026
 * @architecture Server Component
 * @description Page d'accueil principale du site du Bureau des Jeux (BDJ).
 * Présente le Hero, les prochains événements, le bento des activités
 * et la section Esport.
 * @dependencies
 * - '@/lib/calendar' : Pour récupérer les événements à venir via `getUpcomingEvents()`.
 * - '@/data/activites' : Fournit les données statiques des pôles pour le bento grid.
 * - './Home.module.css' : Styles isolés et responsive de la page d'accueil.
 */

// external imports
import Link from 'next/link';

// internal imports
import { getUpcomingEvents } from '@/lib/calendar';
import { activites } from '@/data/activites';

// components
import Hero from '@/components/Hero/HomeHero/HomeHero';
import EventCard from '@/components/EventCard/EventCard';
import BentoGrid from '@/components/BentoGrid/BentoGrid';

// styles imports
import styles from './Home.module.css';

export default async function HomePage() {
  // Récupération des 3 prochains événements
  const nextThreeEvents = await getUpcomingEvents(3);

  return (
    <main>

      {/* ── SECTION 1: HERO ── */}
      <Hero
        title="BUREAU DES JEUX"
        subtitle="L'association étudiante pour tous les gamers et passionnés de jeux de CPE Lyon."
        imageUrl="/hero.avif"
        ctaText="Devenir membre"
        ctaLink="/cotisation"
      />

      {/* ── SECTION 2: ÉVÉNEMENTS ── */}
      <section id="events" className="section-padding">
        <div className="container">
          <h2 className="section-title">Événements</h2>
          <p className="section-subtitle">Les prochains rendez-vous à ne pas manquer.</p>

          {/* Conteneur de la liste d'événements */}
          <div className={`stack ${styles.eventsContainer}`}>
            {/* Boucle pour afficher les événements */}
            {nextThreeEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {/* Bloc d'action finale de la section */}
          <div className={`text-center ${styles.eventsFooter}`}>
            <Link href="/evenements" className="btn btn-premium">
              Voir tout le calendrier
            </Link>
          </div>
        </div>
      </section>

      {/* ── THIN BORDEAUX DIVIDER ── */}
      <div className={styles.lineDivider} />

      {/* ── SECTION 3: ACTIVITÉS (Bento Grid) ── */}
      <section id="activities" className="section-padding">
        <div className="container">
          <h2 className="section-title text-center">Nos Activités</h2>
          <p className="section-subtitle text-center">
            Chaque pôle a sa propre ambiance, choisis le tien.
          </p>

          {/* Le conteneur du Bento Grid gère l'espacement supérieur si besoin */}
          <div className={styles.bentoSection}>
            <BentoGrid activities={activites} />
          </div>
        </div>
      </section>

      {/* ── SECTION 4: ESPORT ── */}
      <section className={styles.esportSection}>
        {/* Image de fond avec son filtre spécifique */}
        <div className={styles.esportBg} />

        {/* Overlay sombre pour le contraste */}
        <div className={styles.esportOverlay} />

        <div className={`container ${styles.esportContent}`}>
          <h2 className={`neon-text-red ${styles.esportTitle}`}>ESPORT</h2>

          <p className={styles.esportDesc}>
            Découvre nos équipes esport et rejoins la compétition <br className="hide-on-mobile" />
            auprès de joueurs passionnés.
          </p>

          <Link href="/esport" className="btn btn-esport">
            En savoir plus
          </Link>
        </div>
      </section>
    </main>
  );
}
