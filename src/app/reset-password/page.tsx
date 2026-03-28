/**
 * @file src/app/reset-password/page.tsx
 * @author Loann Cordel - Président du BDJ
 * @date 28/03/2026
 * @architecture Client Component
 * @description Page de réinitialisation du mot de passe du site du BDJ CPE Lyon.
 * @requires
 * - '@/components/Auth/AuthLayout.tsx' : Layout pour les pages d'authentification.
 * - '@/components/Auth/AuthLayout.module.css' : Styles isolés du composant.
 * - 'next/navigation' : Pour la navigation.
 */

'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AuthLayout from '@/components/Auth/AuthLayout';
import styles from '@/components/Auth/AuthLayout.module.css';

// On sépare le formulaire dans un composant qui utilise "useSearchParams"
function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const router = useRouter();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) {
            setStatus({ type: 'error', message: 'Lien invalide ou expiré.' });
            return;
        }
        if (password !== confirmPassword) {
            setStatus({ type: 'error', message: 'Les mots de passe ne correspondent pas.' });
            return;
        }

        setStatus({ type: 'loading', message: 'Réinitialisation...' });

        try {
            // ⚠️ À remplacer par ton vrai endpoint API plus tard
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });

            const data = await res.json();

            if (res.ok) {
                setStatus({ type: 'success', message: 'Mot de passe modifié avec succès !' });
                setTimeout(() => router.push('/login'), 2000); // Redirection après 2s
            } else {
                setStatus({ type: 'error', message: data.error || 'Erreur lors de la réinitialisation.' });
            }
        } catch (err) {
            setStatus({ type: 'error', message: 'Erreur réseau.' });
        }
    };

    if (!token) {
        return <p className={styles.statusError} style={{ textAlign: 'center' }}>Aucun jeton de sécurité fourni dans l'URL.</p>;
    }

    return (
        <form onSubmit={handleSubmit} className={styles.form}>

            <div className={styles.inputGroup}>
                <i className={`ph ph-lock ${styles.inputIcon}`} aria-hidden="true" />
                <input
                    required placeholder="Nouveau mot de passe"
                    value={password} onChange={e => setPassword(e.target.value)}
                    type={showPassword ? 'text' : 'password'}
                    className={`${styles.input} ${styles.inputWithIcon} ${styles.passwordInput}`}
                />
                <button
                    type="button" onClick={() => setShowPassword(!showPassword)}
                    className={styles.passwordToggle} title="Afficher/Masquer"
                >
                    <i className={showPassword ? 'ph ph-eye-slash' : 'ph ph-eye'} aria-hidden="true" />
                </button>
            </div>

            <div className={styles.inputGroup}>
                <i className={`ph ph-lock-key ${styles.inputIcon}`} aria-hidden="true" />
                <input
                    required placeholder="Confirmer le mot de passe"
                    value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    type={showPassword ? 'text' : 'password'}
                    className={`${styles.input} ${styles.inputWithIcon}`}
                />
            </div>

            {status.type !== 'idle' && (
                <p className={status.type === 'error' ? styles.statusError : styles.statusSuccess}>
                    {status.message}
                </p>
            )}

            <button type="submit" disabled={status.type === 'loading' || status.type === 'success'} className={`btn btn-premium ${styles.submitBtn}`}>
                {status.type === 'loading' ? 'CHARGEMENT...' : 'RÉINITIALISER'}
            </button>

        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <AuthLayout
            theme="bordeaux"
            title="Nouveau MDP"
            subtitle="Choisis un nouveau mot de passe."
            icon="ph-password"
            footerText="Retourner à la page de"
            footerLinkText="connexion"
            footerLinkHref="/login"
        >
            {/* Suspense est obligatoire dans Next.js quand on utilise useSearchParams() */}
            <Suspense fallback={<p style={{ textAlign: 'center' }}>Chargement...</p>}>
                <ResetPasswordForm />
            </Suspense>
        </AuthLayout>
    );
}