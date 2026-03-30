/**
 * @file src/app/events/[slug]/page.tsx
 * @author Loann Cordel
 * @date 27/03/2026
 * @description Page pour afficher dynamiquement les détails d'un événement HelloAsso
 * @architecture Client Component
 * @requires @/lib/helloasso
 * @requires @/lib/auth
 * @requires @/lib/prisma
 * @requires @/lib/calendar
 * @requires @/app/events/[slug]/actions
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getEventDetails } from '@/lib/helloasso';
import { getAllParsedEvents } from '@/lib/calendar';
import { generatePaymentLink } from './actions';
import { activites } from '@/data/activites';
import styles from './EventPage.module.css';

interface EventPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function HelloAssoEventPage({ params }: EventPageProps) {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    // 1. REQUÊTES EN PARALLÈLE
    const [eventData, calendarEvents] = await Promise.all([
        getEventDetails(slug),
        getAllParsedEvents()
    ]);

    const calendarEvent = calendarEvents.find((e: any) => e.helloAssoSlug === slug);

    if (!eventData) {
        notFound();
    }

    // 2. LOGIQUE UTILISATEUR
    const session = await getServerSession(authOptions);
    let isMember = false;
    let userEmail = '';

    if (session?.user?.email) {
        userEmail = session.user.email;
        const dbUser = await prisma.user.findUnique({
            where: { email: userEmail },
            select: { isMember: true }
        });
        isMember = dbUser?.isMember || false;
    }

    // 3. LOGIQUE DES TARIFS
    const tiers = eventData.tiers || [];
    let selectedTier = tiers[0];

    if (tiers.length > 1) {
        if (isMember) {
            const memberTier = tiers.find((t: any) => (t.label || '').toLowerCase().includes('membre'));
            if (memberTier) selectedTier = memberTier;
        } else {
            const normalTier = tiers.find((t: any) => !(t.label || '').toLowerCase().includes('membre'));
            if (normalTier) selectedTier = normalTier;
        }
    }

    // 4. LE MIX DES DONNÉES
    const title = calendarEvent?.title || eventData.title || 'Événement BDJ';
    const priceInEuros = selectedTier ? (selectedTier.price / 100).toFixed(2) : '0.00';

    const rawDescription = calendarEvent?.desc || eventData.description || 'Rejoins-nous pour ce super événement !';

    let maxPlaces = 50; // Valeur par défaut si on oublie de mettre la balise
    const maxMatch = rawDescription.match(/\[MAX:(\d+)\]/i);

    if (maxMatch && maxMatch[1]) {
        maxPlaces = parseInt(maxMatch[1], 10);
    }

    const cleanDescription = rawDescription.replace(/\[MAX:\d+\]/gi, '').trim();

    // 5. GESTION DYNAMIQUE DU THÈME VIA TON FICHIER DATA
    const eventColor = calendarEvent?.color || 'var(--c-bordeaux)';

    const soldPlaces = await prisma.ticket.count({
        where: {
            eventSlug: slug,
            // On compte les payés et les gratuits, pour être sûr
            paymentStatus: { in: ['PAID', 'FREE'] }
        }
    });
    const remainingPlaces = maxPlaces - soldPlaces;
    // Calcul du pourcentage pour la jauge visuelle
    const fillPercentage = Math.min(100, Math.max(0, (soldPlaces / maxPlaces) * 100));
    // Si on dépasse 80% de remplissage, la jauge devient rouge/bordeaux pour alerter !
    const gaugeColor = fillPercentage > 80 ? 'var(--c-bordeaux)' : eventColor;

    return (
        <div className={`section-padding ${styles.pageWrapper}`}>

            <div className={`container ${styles.contentContainer}`}>

                <Link href="/" className={`nav-link ${styles.backLink}`}>
                    <i className="ph ph-arrow-left" /> Retour
                </Link>

                <h1 className={`section-title ${styles.eventTitle}`}>
                    {title}
                </h1>

                <div className={styles.lineDivider} style={{ backgroundColor: eventColor }} />

                <div
                    className={styles.description}
                    dangerouslySetInnerHTML={{ __html: cleanDescription }}
                />

                <div className={styles.lineDivider} style={{ backgroundColor: eventColor }} />

                {/* ── NOUVEAU LAYOUT : 2 COLONNES (Infos à gauche, Paiement à droite) ── */}
                <div className={styles.contentSplit}>

                    {/* COLONNE GAUCHE : Infos Calendrier */}
                    <div className={styles.leftColumn}>
                        {calendarEvent && (
                            <div className={styles.infoGrid}>
                                <div className={styles.infoCard} style={{ border: `1px solid ${eventColor}` }}>
                                    <i className="ph ph-calendar-blank" style={{ color: eventColor, fontSize: '2rem' }} />
                                    <div className={styles.infoText}>
                                        <span className={styles.infoLabel}>Date</span>
                                        <span className={styles.infoValue}>{calendarEvent.day} {calendarEvent.month}</span>
                                    </div>
                                </div>

                                {calendarEvent.time && (
                                    <div className={styles.infoCard} style={{ border: `1px solid ${eventColor}` }}>
                                        <i className="ph ph-clock" style={{ color: eventColor, fontSize: '2rem' }} />
                                        <div className={styles.infoText}>
                                            <span className={styles.infoLabel}>Heure</span>
                                            <span className={styles.infoValue}>{calendarEvent.time}</span>
                                        </div>
                                    </div>
                                )}

                                <div className={styles.infoCard} style={{ border: `1px solid ${eventColor}` }}>
                                    <i className="ph ph-map-pin" style={{ color: eventColor, fontSize: '2rem' }} />
                                    <div className={styles.infoText}>
                                        <span className={styles.infoLabel}>Lieu</span>
                                        <span className={styles.infoValue}>{calendarEvent.location}</span>
                                    </div>
                                </div>

                                <div className={styles.infoCard} style={{ border: `1px solid ${eventColor}` }}>
                                    <i className="ph ph-ticket" style={{ color: eventColor, fontSize: '2rem' }} />
                                    <div className={styles.infoText}>
                                        <span className={styles.infoLabel}>Places restantes</span>
                                        <span className={styles.infoValue}>{remainingPlaces} / {maxPlaces}</span>
                                        <div className={styles.gaugeBar} style={{ border: `1px solid ${gaugeColor}` }}>
                                            <div style={{
                                                width: `${fillPercentage}%`,
                                                height: '100%',
                                                backgroundColor: gaugeColor,
                                                borderRadius: '100px',
                                                transition: 'width 1s ease-out'
                                            }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* COLONNE DROITE : Zone de Paiement */}
                    <div className={`${styles.paymentBox} text-center`}>

                        {/* Les tags sont maintenant intégrés en haut de la zone de paiement */}
                        <div className={styles.metaTags}>
                            <span className={styles.tag}>
                                <i className="ph ph-tag" style={{ color: eventColor }} /> Billetterie Officielle
                            </span>
                            {isMember && (
                                <span className={`${styles.tag} ${styles.tagGold}`}>
                                    <i className="ph ph-crown" /> Tarif Membre
                                </span>
                            )}
                        </div>

                        {!session ? (
                            <div className="stack">
                                <i className="ph ph-shield-check" style={{ color: "var(--c-bordeaux)", fontSize: '4rem' }} />
                                <h3>Connexion requise</h3>
                                <p className={styles.helperText}>Tu dois être connecté à ton compte BDJ pour prendre ta place.</p>
                                <div>
                                    <Link href="/login" className="btn btn-premium">
                                        Se connecter
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="stack">
                                <h3>{selectedTier?.label || 'Place'}</h3>

                                <div className={styles.priceDisplay}>
                                    {priceInEuros} €
                                </div>

                                <form action={generatePaymentLink}>
                                    {/* On passe silencieusement les données à notre serveur */}
                                    <input type="hidden" name="eventSlug" value={slug} />
                                    <input type="hidden" name="itemName" value={`Place - ${title} (${selectedTier?.label || 'Standard'})`} />
                                    <input type="hidden" name="amount" value={selectedTier?.price || 0} />

                                    <button type="submit" className={`btn btn-premium ${styles.submitButton}`}>
                                        Prendre ma place sur HelloAsso
                                    </button>
                                </form>

                                <p className={styles.helperText}>
                                    Paiement sécurisé via HelloAsso. Billet lié à <strong>{userEmail}</strong>.
                                </p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}