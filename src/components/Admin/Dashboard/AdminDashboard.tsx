/**
 * @file src/components/Admin/Dashboard/AdminDashboard.tsx
 * @author Loann Cordel
 * @date 27/03/2026
 * @description Composant pour le tableau de bord de l'administrateur
 * @requires @/components/Admin/AddMemberForm
 * @requires @/components/Admin/SyncMembersButton
 * @requires @/components/Admin/CancelBookingButton
 * @requires @/components/Admin/Dashboard/AdminDashboard.module.css
 */

import AddMemberForm from '@/components/Admin/AddMemberForm';
import SyncMembersButton from '@/components/Admin/SyncMembersButton';
import CancelBookingButton from '@/components/CancelBookingButton';
import styles from './AdminDashboard.module.css';

// Typage strict des données attendues par ce composant
export interface BookingWithUser {
    id: string;
    date: Date;
    startTime: string;
    endTime: string;
    user: {
        firstName: string;
        lastName: string;
        email: string;
    };
}

interface AdminDashboardProps {
    bookings: BookingWithUser[];
}

export default function AdminDashboard({ bookings }: AdminDashboardProps) {
    return (
        <section className={styles.adminBox}>
            <header className={styles.adminHeader}>
                <div className={styles.adminIconBox} aria-hidden="true">
                    <i className="ph ph-lock-key" style={{ fontSize: '2rem', color: '#fff' }} />
                </div>
                <div>
                    <h2 className={styles.adminTitle}>Dashboard Admin</h2>
                    <p style={{ color: 'var(--c-grey-medium)', margin: 0 }}>Gestion et Base de données</p>
                </div>
            </header>

            <div className={styles.adminGrid}>
                <AddMemberForm />

                <div className="admin-form-container">
                    <h3 className="admin-form-title">Synchronisation</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--c-grey-medium)', lineHeight: 1.5, marginBottom: '20px' }}>
                        Récupérez instantanément la liste des cotisants depuis HelloAsso pour mettre à jour les droits d'accès.
                    </p>
                    <SyncMembersButton />
                </div>
            </div>

            {bookings.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', background: '#f9f9f9', borderRadius: '24px', color: 'var(--c-grey-medium)' }}>
                    Aucune réservation active.
                </div>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.adminTable}>
                        <thead>
                            <tr>
                                <th className={styles.adminTh}>Date & Heure</th>
                                <th className={styles.adminTh}>Étudiant</th>
                                <th className={styles.adminTh} style={{ textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map(b => (
                                <tr key={b.id} className={styles.adminTr}>
                                    <td className={styles.adminTd}>
                                        <span style={{ fontWeight: 800 }}>
                                            {b.date.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' })}
                                        </span>
                                        <span className={styles.badgeTime}>{b.startTime} - {b.endTime}</span>
                                    </td>
                                    <td className={styles.adminTd}>
                                        <p style={{ fontWeight: 700, margin: 0 }}>{b.user.firstName} {b.user.lastName}</p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--c-grey-medium)', margin: 0 }}>{b.user.email}</p>
                                    </td>
                                    <td className={styles.adminTd}>
                                        <CancelBookingButton bookingId={b.id} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}