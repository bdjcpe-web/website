/**
 * @file @/components/Admin/AddMemberForm.tsx
 * @author Loann Cordel
 * @date 27/03/2026
 * @description Composant pour ajouter un membre
 */

"use client";

import { useState } from "react";

export default function AddMemberForm() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            const res = await fetch("/api/admin/add-member", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                setMessage({ text: data.error || "Une erreur est survenue", type: "error" });
            } else {
                setMessage({ text: data.message, type: "success" });
                setEmail("");
            }
        } catch (error) {
            setMessage({ text: "Erreur de connexion au serveur.", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-form-container animate-fade-in">
            <h3 className="admin-form-title">Ajouter un membre</h3>

            <form onSubmit={handleSubmit} className="admin-form">
                <div>
                    <label htmlFor="email" className="admin-form-label">
                        Adresse email CPE (@cpe.fr)
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="prenom.nom@cpe.fr"
                        required
                        pattern=".*@cpe\.fr$"
                        title="Veuillez entrer une adresse se terminant par @cpe.fr"
                        className="admin-form-input"
                    />
                </div>

                {/* On utilise TA classe btn et btn-premium ! */}
                <button
                    type="submit"
                    disabled={isLoading || !email}
                    className="btn btn-premium"
                    style={{ width: "100%", marginTop: "8px" }}
                >
                    {isLoading ? "Ajout en cours..." : "Ajouter à la liste"}
                </button>
            </form>

            {message && (
                <div className={`admin-form-message ${message.type}`}>
                    {message.text}
                </div>
            )}
        </div>
    );
}