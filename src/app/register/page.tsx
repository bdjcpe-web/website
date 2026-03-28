/**
 * @file src/app/rejoindre/page.tsx
 * @author Loann Cordel - Président du BDJ
 * @date 28/03/2026
 * @architecture Client Component
 * @description Page d'inscription au site du BDJ CPE Lyon.
 * @requires
 * - '@/components/Auth/AuthLayout.tsx' : Layout pour les pages d'authentification.
 * - '@/components/Auth/AuthLayout.module.css' : Styles isolés du composant.
 * - 'next-auth/react' : Pour la connexion.
 * - 'next/navigation' : Pour la navigation.
 */

'use client';
import { useState } from 'react';
import AuthLayout from '@/components/Auth/AuthLayout';
import styles from '@/components/Auth/AuthLayout.module.css';

// Fonction utilitaire pour le formatage des noms
const formatName = (str: string) => {
  return str
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('-');
};

export default function RegisterPage() {
  const [formData, setFormData] = useState({ email: '', password: '', filiere: '', registeredYear: '' });
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });

  // ── NOUVEL ÉTAT : VISIBILITÉ DU MOT DE PASSE ──
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Création du compte...' });

    // Extraction et formatage du nom/prénom depuis l'email (votre UX géniale !)
    const localPart = formData.email.split('@')[0];
    const nameParts = localPart.split('.');
    let firstName = '';
    let lastName = '';
    if (nameParts.length >= 2) {
      firstName = formatName(nameParts[0]);
      lastName = nameParts.slice(1).map(formatName).join(' ').toUpperCase();
    } else {
      firstName = formatName(localPart);
      lastName = '';
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, firstName, lastName })
      });
      const data = await res.json();

      if (res.ok) {
        setStatus({ type: 'success', message: data.message + " (Vérifie tes spams !)" });
        setFormData({ email: '', password: '', filiere: '', registeredYear: '' });
      } else {
        setStatus({ type: 'error', message: data.error || 'Erreur inconnue.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Erreur technique lors de la requête.' });
    }
  };

  return (
    <AuthLayout
      theme="gold"
      title="REJOINDRE LE BDJ"
      subtitle="Crée ton compte et accède à tous nos services."
      icon="ph-fill ph-user-plus"
      footerText="Déjà membre ?"
      footerLinkText="Se connecter"
      footerLinkHref="/login"
    >
      <form onSubmit={handleSubmit} className={styles.form}>

        {/* EMAIL */}
        <div className={styles.inputGroup}>
          <i className={`ph ph-envelope-simple ${styles.inputIcon}`} aria-hidden="true" />
          <input
            name="email" type="email" required placeholder="prenom.nom@cpe.fr"
            value={formData.email} onChange={handleChange}
            className={`${styles.input} ${styles.inputWithIcon}`}
          />
        </div>

        {/* ── MOT DE PASSE : VERSION MODIFIÉE AVEC OEIL ── */}
        <div className={styles.inputGroup}>
          <i className={`ph ph-lock ${styles.inputIcon}`} aria-hidden="true" />

          <input
            name="password" required placeholder="Mot de passe"
            value={formData.password} onChange={handleChange}

            // LA MAGIE EST ICI : Le 'type' change dynamiquement selon l'état
            type={showPassword ? 'text' : 'password'}

            // On ajoute la nouvelle classe CSS pour le padding à droite
            className={`${styles.input} ${styles.inputWithIcon} ${styles.passwordInput}`}
          />

          {/* LE BOUTON OEIL (togglable) */}
          <button
            type="button" // Important pour ne pas soumettre le form
            onClick={() => setShowPassword(!showPassword)} // Alterne l'état (true/false)
            className={styles.passwordToggle}
            title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            {/* Icône qui change (ph-eye-slash quand affiché, ph-eye quand masqué) */}
            <i className={showPassword ? 'ph ph-eye-slash' : 'ph ph-eye'} aria-hidden="true" />
          </button>
        </div>

        {/* FILIÈRE ET ANNÉE */}
        <div className={styles.row}>
          <div className={styles.inputGroup}>
            <i className={`ph ph-graduation-cap ${styles.inputIcon}`} aria-hidden="true" />
            <select
              name="filiere" required value={formData.filiere} onChange={handleChange}
              className={`${styles.input} ${styles.inputWithIcon} ${styles.select}`}
              style={{ color: formData.filiere ? '#111' : '#9ca3af' }}
            >
              <option value="" disabled>Filière</option>
              <option value="CGP">CGP</option>
              <option value="ETI">ETI</option>
              <option value="ICS">ICS</option>
              <option value="IRC">IRC</option>
            </select>
          </div>
          <div className={styles.inputGroup}>
            <i className={`ph ph-calendar ${styles.inputIcon}`} aria-hidden="true" />
            <select
              name="registeredYear" required value={formData.registeredYear} onChange={handleChange}
              className={`${styles.input} ${styles.inputWithIcon} ${styles.select}`}
              style={{ color: formData.registeredYear ? '#111' : '#9ca3af' }}
            >
              <option value="" disabled>Année</option>
              <option value="3">3A</option>
              <option value="4">4A</option>
              <option value="5">5A</option>
            </select>
          </div>
        </div>

        {status.type !== 'idle' && (
          <p className={status.type === 'error' ? styles.statusError : styles.statusSuccess}>
            {status.message}
          </p>
        )}

        <button type="submit" disabled={status.type === 'loading'} className={`btn btn-gold ${styles.submitBtn}`}>
          {status.type === 'loading' ? 'CREATION...' : 'CRÉER MON COMPTE'}
        </button>

      </form>
    </AuthLayout>
  );
}