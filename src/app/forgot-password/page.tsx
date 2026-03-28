/**
 * @file page.tsx
 * @author Loann CORDEL
 * @date 28/03/2026
 * @description Page Forgot Password pour réinitialiser son mot de passe
 */

'use client';
import { useState } from 'react';
import AuthLayout from '@/components/Auth/AuthLayout';
import styles from '@/components/Auth/AuthLayout.module.css';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus({ type: 'loading', message: 'Envoi en cours...' });

        try {
            // ⚠️ À remplacer par ton vrai endpoint API plus tard
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (res.ok) {
                // Message générique pour des raisons de sécurité (ne pas dévoiler si l'email existe ou non)
                setStatus({ type: 'success', message: 'Si cet email correspond à un compte, un lien de réinitialisation a été envoyé. Vérifie tes spams !' });
                setEmail('');
            } else {
                setStatus({ type: 'error', message: data.error || 'Erreur inconnue.' });
            }
        } catch (err) {
            setStatus({ type: 'error', message: 'Erreur réseau.' });
        }
    };

    return (
        <AuthLayout
            theme="bordeaux"
            title="MOT DE PASSE OUBLIÉ"
            subtitle="Saisis ton email CPE pour recevoir un lien de réinitialisation."
            icon="ph-key"
            footerText="Tu te souviens de ton mot de passe ?"
            footerLinkText="Se connecter"
            footerLinkHref="/login"
        >
            <form onSubmit={handleSubmit} className={styles.form}>

                <div className={styles.inputGroup}>
                    <i className={`ph ph-envelope-simple ${styles.inputIcon}`} aria-hidden="true" />
                    <input
                        type="email" required placeholder="prenom.nom@cpe.fr"
                        value={email} onChange={e => setEmail(e.target.value)}
                        className={`${styles.input} ${styles.inputWithIcon}`}
                        disabled={status.type === 'success'}
                    />
                </div>

                {status.type !== 'idle' && (
                    <p className={status.type === 'error' ? styles.statusError : styles.statusSuccess}>
                        {status.message}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={status.type === 'loading' || status.type === 'success'}
                    className={`btn btn-premium ${styles.submitBtn}`}
                >
                    {status.type === 'loading' ? 'ENVOI...' : 'ENVOYER LE LIEN'}
                </button>

            </form>
        </AuthLayout>
    );
}