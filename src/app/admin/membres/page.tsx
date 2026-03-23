import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import SyncButton from './SyncButton';

const prisma = new PrismaClient();

export default async function AdminCotisationsPage() {
  const session = await getServerSession(authOptions);
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(',').map(e => e.trim().toLowerCase());
  
  if (!session?.user?.email || !adminEmails.includes(session.user.email.toLowerCase())) {
    redirect('/');
  }

  const allMembers = await prisma.user.findMany({
    where: { isMember: true },
    orderBy: { lastName: 'asc' }
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '100px 20px 5rem' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#111827', margin: 0 }}>Gestion des Cotisations</h1>
            <p style={{ color: '#6b7280', margin: '4px 0 0 0', fontSize: '1.1rem' }}>Espace sécurisé - Synchronisation Google Sheets</p>
          </div>
          <Link href="/" style={{ color: 'var(--c-bordeaux)', fontWeight: 700, textDecoration: 'none' }}>
            &larr; Retour à l'accueil
          </Link>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '24px', padding: '3rem', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                <i className="ph-fill ph-arrows-merge" style={{ fontSize: '2rem', color: 'var(--c-bordeaux)' }} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', margin: 0 }}>Importer depuis HelloAsso</h2>
              </div>
              <p style={{ color: '#4b5563', lineHeight: 1.6, marginBottom: '2rem' }}>
                Assurez-vous d'avoir inséré le lien public de votre tableau Google Sheets (au format CSV) dans le fichier <code>.env</code> sous <code>GOOGLE_SHEET_CSV_URL</code>. Le système lira <strong>absolument tous les e-mails</strong> présents sur la feuille, vérifiera s'ils ont un compte sur le site BDJ, et activera instantanément leurs privilèges membres. 
                <br/><br/>
                <em>Note : Tous les comptes non-présents dans le fichier CSV perdront leur statut membre.</em>
              </p>
              
              <SyncButton />
            </div>

            <div style={{ width: '250px', background: '#f9fafb', borderRadius: '16px', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e7eb' }}>
              <i className="ph-fill ph-users-three" style={{ fontSize: '3rem', color: 'var(--c-gold)', marginBottom: '1rem' }} />
              <div style={{ fontSize: '3.5rem', fontWeight: 900, color: '#111827', lineHeight: 1 }}>
                {allMembers.length}
              </div>
              <div style={{ textTransform: 'uppercase', color: '#6b7280', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.05em', marginTop: '8px' }}>
                Membres Actifs
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '24px', padding: '3rem', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: '1.5rem' }}>Tableau des Membres VIP ({allMembers.length})</h2>
          
          {allMembers.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', background: '#f9fafb', borderRadius: '12px', border: '1px dashed #e5e7eb' }}>
              Aucun membre enregistré. Lancez la synchronisation pour commencer.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb', color: '#6b7280', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '12px 16px' }}>Nom</th>
                    <th style={{ padding: '12px 16px' }}>Email</th>
                    <th style={{ padding: '12px 16px' }}>Date de création</th>
                  </tr>
                </thead>
                <tbody>
                  {allMembers.map(m => (
                    <tr key={m.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#111827' }}>
                        {m.firstName} {m.lastName}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#6b7280' }}>
                        {m.email}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#9ca3af', fontSize: '0.85rem' }}>
                        {m.createdAt.toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
