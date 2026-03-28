/**
 * @file @components/Admin/PlayerForm/removePlayerForm.tsx
 * @author Loann Cordel
 * @date 28/03/2026
 * @description Bouton pour retirer un joueur du roster
 */

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './RemovePlayerForm.module.css';

export default function RemovePlayerButton({ playerId, playerName }: { playerId: string, playerName: string }) {
    const router = useRouter();
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm(`Es-tu sûr de vouloir retirer ${playerName} du roster ?`)) return;

        setDeleting(true);
        try {
            const res = await fetch(`/api/esport/players?id=${playerId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                router.refresh();
            } else {
                const data = await res.json();
                alert(`Erreur: ${data.error}`);
            }
        } catch (err) {
            alert('Erreur réseau');
        }
        setDeleting(false);
    };

    return (
        <button
            onClick={handleDelete}
            disabled={deleting}
            title="Retirer le joueur"
            className={styles.removeBtn}
        >
            {/* Utilisation de l'icône poubelle ph-trash */}
            <i className={`ph ${deleting ? 'ph-spinner animate-spin' : 'ph-trash'}`} aria-hidden="true" />
        </button>
    );
}