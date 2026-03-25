/**
 * @file src/components/Hero/HomeHero/HomeHero.tsx
 * @author Loann Cordel - Président du BDJ
 * @date 25/03/2026
 * @architecture Server Component
 * @description Composant Hero réutilisable pour les pages du site.
 * @dependencies
 * - '@/components/Hero/HomeHero/Hero.module.css' : Styles isolés du composant.
 * @dependencies
 * - 'next/link' : Pour la navigation entre les pages.
 */

// external imports
import Link from 'next/link';

// styles imports
import styles from './Hero.module.css';

interface HeroProps {
    title: string;
    subtitle: string;
    imageUrl: string;
    ctaText: string;
    ctaLink: string;
    className?: string;       // Utile pour ajuster la taille (ex: Esport)
    overlayStyle?: React.CSSProperties; // Utile pour changer la couleur du fond (ex: Esport)
}

export default function Hero({
    title, subtitle, imageUrl, ctaText, ctaLink, className = "", overlayStyle
}: HeroProps) {
    return (
        <section className={`${styles.heroSection} ${className}`.trim()}>

            {/* Background - L'image est maintenant gérée par une balise img */}
            <img src={imageUrl} alt="" className={styles.heroBg} />

            {/* Le filtre/gradient par-dessus */}
            <div className={styles.heroGradient} style={overlayStyle} />

            <div className={`container ${styles.heroContent}`}>
                <h1 className={styles.heroTitle}>{title}</h1>

                <div className={styles.heroDivider} />

                <p className={styles.heroSubtitle}>{subtitle}</p>

                {/* On fixe le bouton en 'btn-gold' par défaut pour tout le site */}
                <Link href={ctaLink} className="btn btn-gold">
                    {ctaText}
                </Link>
            </div>
        </section>
    );
}