/**
 * @file src/app/login/page.tsx
 * @author Loann Cordel - Président du BDJ
 * @date 28/03/2026
 * @architecture Client Component
 * @description Page de connexion au site du BDJ CPE Lyon.
 * @requires
 * - '@/components/Auth/AuthLayout.tsx' : Layout pour les pages d'authentification.
 * - '@/components/Auth/AuthLayout.module.css' : Styles isolés du composant.
 * - 'next-auth/react' : Pour la connexion.
 * - 'next/navigation' : Pour la navigation.
 */

'use client';
import Link from 'next/link';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/Auth/AuthLayout';
import styles from '@/components/Auth/AuthLayout.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'error', message: string }>({ type: 'idle', message: '' });
  const router = useRouter();

  // ── NOUVEL ÉTAT : VISIBILITÉ DU MOT DE PASSE ──
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Connexion en cours...' });
    const result = await signIn('credentials', { redirect: false, email, password });
    if (result?.error) {
      setStatus({ type: 'error', message: result.error });
    } else {
      router.push('/le-local');
      router.refresh();
    }
  };

  return (
    <AuthLayout
      theme="bordeaux"
      title="ACCÈS MEMBRE"
      subtitle="Utilise ton email @cpe.fr pour te connecter."
      icon="ph-user"
      footerText="Pas encore inscrit ?"
      footerLinkText="Créer un compte"
      footerLinkHref="/register"
    >
      <form onSubmit={handleSubmit} className={styles.form}>

        {/* EMAIL */}
        <div className={styles.inputGroup}>
          <i className={`ph ph-envelope-simple ${styles.inputIcon}`} aria-hidden="true" />
          <input
            type="email" required placeholder="prenom.nom@cpe.fr"
            value={email} onChange={e => setEmail(e.target.value)}
            className={`${styles.input} ${styles.inputWithIcon}`}
          />
        </div>

        {/* ── MOT DE PASSE : VERSION MODIFIÉE AVEC OEIL ── */}
        <div className={styles.inputGroup}>
          <i className={`ph ph-lock ${styles.inputIcon}`} aria-hidden="true" />
          <input
            required placeholder="Mot de passe"
            value={password} onChange={e => setPassword(e.target.value)}

            // Changement de 'type' dynamique
            type={showPassword ? 'text' : 'password'}

            // Classe CSS avec padding à droite
            className={`${styles.input} ${styles.inputWithIcon} ${styles.passwordInput}`}
          />

          {/* LE BOUTON OEIL (togglable) */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={styles.passwordToggle}
            title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            <i className={showPassword ? 'ph ph-eye-slash' : 'ph ph-eye'} aria-hidden="true" />
          </button>
        </div>

        {status.type === 'error' && (
          <p className={styles.statusError}>{status.message}</p>
        )}

        <button type="submit" disabled={status.type === 'loading'} className={`btn btn-premium ${styles.submitBtn}`}>
          {status.type === 'loading' ? 'Connexion...' : 'SE CONNECTER'}
        </button>

      </form>

      <div className={styles.forgotPassword}>
        <Link href="/forgot-password" className={styles.forgotPasswordLink}>
          Mot de passe oublié ?
        </Link>
      </div>
    </AuthLayout>
  );
}