'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', filiere: '', registeredYear: '' });
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Création du compte...' });

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok) {
        setStatus({ type: 'success', message: data.message + " (Pense à vérifier tes courriers indésirables / spams !)" });
        setFormData({ firstName: '', lastName: '', email: '', password: '', filiere: '', registeredYear: '' });
      } else {
        setStatus({ type: 'error', message: data.error || 'Erreur inconnue.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Erreur technique lors de la requête.' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '140px 20px 60px', backgroundColor: '#fff', position: 'relative', overflow: 'hidden' }}>
      
      {/* ── BACKGROUND DECORATION ── */}
      <div style={{ position: 'fixed', top: '10%', right: '-10%', width: '600px', height: '600px', background: 'var(--c-bordeaux)', opacity: 0.03, filter: 'blur(100px)', borderRadius: '50%' }} />
      <div style={{ position: 'fixed', bottom: '10%', left: '-10%', width: '500px', height: '500px', background: 'var(--c-gold)', opacity: 0.05, filter: 'blur(80px)', borderRadius: '50%' }} />

      {/* ── REGISTER CARD ── */}
      <div className="animate-fade-in" style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '440px' }}>
        <div style={{ background: '#fff', borderRadius: '40px', padding: '50px', border: '1.5px solid var(--c-gold)', boxShadow: '0 30px 60px rgba(0,0,0,0.10)' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ width: '80px', height: '80px', background: 'var(--c-gold)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px', boxShadow: '0 10px 30px rgba(225, 184, 47, 0.2)' }}>
              <i className="ph-fill ph-user-plus" style={{ fontSize: '2.5rem', color: '#fff' }} />
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#000', margin: 0, fontFamily: 'var(--font-heading)' }}>REJOINDRE LE BDJ</h1>
            <p style={{ color: 'var(--c-grey-medium)', fontSize: '0.95rem', marginTop: '10px' }}>Crée ton compte et accède à tous nos services.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                id="firstName" name="firstName" type="text" required placeholder="Prénom" value={formData.firstName} onChange={handleChange}
                style={{ width: '50%', padding: '16px 20px', background: '#f9f9f9', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '18px', fontSize: '0.95rem', outline: 'none' }}
                className="input-focus"
              />
              <input
                id="lastName" name="lastName" type="text" required placeholder="Nom" value={formData.lastName} onChange={handleChange}
                style={{ width: '50%', padding: '16px 20px', background: '#f9f9f9', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '18px', fontSize: '0.95rem', outline: 'none' }}
                className="input-focus"
              />
            </div>

            <div style={{ position: 'relative' }}>
              <i className="ph ph-envelope-simple" style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-grey-medium)', fontSize: '1.2rem' }} />
              <input
                id="email" name="email" type="email" required placeholder="prenom.nom@cpe.fr" value={formData.email} onChange={handleChange}
                style={{ width: '100%', padding: '16px 20px 16px 55px', background: '#f9f9f9', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '18px', fontSize: '0.95rem', outline: 'none' }}
                className="input-focus"
              />
            </div>

            <div style={{ position: 'relative' }}>
              <i className="ph ph-lock" style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-grey-medium)', fontSize: '1.2rem' }} />
              <input
                id="password" name="password" type="password" required placeholder="Mot de passe" value={formData.password} onChange={handleChange}
                style={{ width: '100%', padding: '16px 20px 16px 55px', background: '#f9f9f9', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '18px', fontSize: '0.95rem', outline: 'none' }}
                className="input-focus"
              />
            </div>

            {/* Filière + Année */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ position: 'relative', width: '50%' }}>
                <i className="ph ph-graduation-cap" style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-grey-medium)', fontSize: '1.2rem', pointerEvents: 'none', zIndex: 1 }} />
                <select name="filiere" required value={formData.filiere} onChange={handleChange}
                  style={{ width: '100%', padding: '16px 20px 16px 55px', background: '#f9f9f9', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '18px', fontSize: '0.95rem', outline: 'none', color: formData.filiere ? '#111' : '#9ca3af', appearance: 'none', cursor: 'pointer' }}
                  className="input-focus">
                  <option value="" disabled>Filière</option>
                  <option value="CGP">CGP</option>
                  <option value="ETI">ETI</option>
                  <option value="ICS">ICS</option>
                  <option value="IRC">IRC</option>
                </select>
              </div>
              <div style={{ position: 'relative', width: '50%' }}>
                <i className="ph ph-calendar" style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-grey-medium)', fontSize: '1.2rem', pointerEvents: 'none', zIndex: 1 }} />
                <select name="registeredYear" required value={formData.registeredYear} onChange={handleChange}
                  style={{ width: '100%', padding: '16px 20px 16px 55px', background: '#f9f9f9', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '18px', fontSize: '0.95rem', outline: 'none', color: formData.registeredYear ? '#111' : '#9ca3af', appearance: 'none', cursor: 'pointer' }}
                  className="input-focus">
                  <option value="" disabled>Année</option>
                  <option value="3">3A</option>
                  <option value="4">4A</option>
                  <option value="5">5A</option>
                </select>
              </div>
            </div>

            {status.type !== 'idle' && (
              <p style={{ 
                color: status.type === 'error' ? '#ff1a3c' : 'var(--c-gold)', 
                fontSize: '0.85rem', fontWeight: 600, margin: '5px 0' 
              }}>
                {status.message}
              </p>
            )}

            <button type="submit" disabled={status.type === 'loading'} className="btn btn-gold" style={{ marginTop: '10px', width: '100%' }}>
              {status.type === 'loading' ? 'CREATION...' : 'CRÉER MON COMPTE'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--c-grey-medium)' }}>
              Déjà membre ? <Link href="/login" className="nav-link" style={{ fontSize: '0.9rem', marginLeft: '5px' }}>Se connecter</Link>
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <Link href="/" className="nav-link" style={{ fontSize: '0.85rem', color: 'var(--c-grey-medium)' }}>
            <i className="ph ph-arrow-left" style={{ marginRight: '8px' }} /> Retour au site
          </Link>
        </div>
      </div>

      <style>{`
        .input-focus:focus {
          background: #fff !important;
          border-color: var(--c-gold) !important;
          box-shadow: 0 0 0 4px rgba(225, 184, 47, 0.05);
        }
      `}</style>
    </div>
  );
}
