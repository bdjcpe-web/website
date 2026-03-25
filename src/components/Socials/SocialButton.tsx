/**
 * @file src/components/Socials/SocialButton.tsx
 * @author Loann Cordel - Président du BDJ
 * @date 26/03/2026
 * @architecture Client Component
 * @description Bouton de réseau social générique et flexible.
 * Gère dynamiquement la plateforme, l'affichage (texte+icône ou icône seule) et la forme (arrondi ou rond).
 */

// styles imports
import styles from './SocialButton.module.css';

// Définition des types pour les plateformes supportées
type SocialPlatform = 'discord' | 'whatsapp';

// Configuration statique des plateformes pour éviter les "Magic Strings" dans le JSX
const PLATFORM_CONFIG = {
    discord: {
        url: 'https://discord.gg/dK3rNUujHS',
        icon: 'ph ph-discord-logo',
        label: 'Discord',
        styleClass: styles.discord,
    },
    whatsapp: {
        url: 'https://chat.whatsapp.com/HMXaBVAq9UMH6wBJjos23C',
        icon: 'ph ph-whatsapp-logo',
        label: 'WhatsApp',
        styleClass: styles.whatsapp,
    },
};

interface SocialButtonProps {
    platform: SocialPlatform;
    className?: string; // Pour le pilotage du layout par le parent
    labelClassName?: string; // Pour le <span> du texte
}

export default function SocialButton({ platform, className, labelClassName }: SocialButtonProps) {
    // Récupération sécurisée de la configuration de la plateforme
    const config = PLATFORM_CONFIG[platform];

    if (!config) {
        console.error(`SocialButton: Plateforme '${platform}' non supportée.`);
        return null; // Sécurité pour éviter le crash si une mauvaise plateforme est passée
    }

    // Construction dynamique des classes CSS
    const buttonClasses = [
        'btn',                             // Classe globale
        styles.socialBtn,                  // Style de base du module
        config.styleClass,                 // Couleur spécifique (discord/whatsapp)
        className || '',                   // Classe de layout injectée par le parent
    ].join(' ').trim();

    return (
        <a
            href={config.url}
            target="_blank"
            rel="noopener noreferrer"
            // Le parent pilorera la forme (arrondi -> rond) via className
            className={`btn ${styles.socialBtn} ${config.styleClass} ${className || ''}`}
        >
            <i className={`${config.icon} ${styles.icon}`} />

            {/* On applique la classe utilitaire injectée par le parent sur le texte */}
            <span className={`${styles.label} ${labelClassName || ''}`}>
                {config.label}
            </span>
        </a>
    );
}