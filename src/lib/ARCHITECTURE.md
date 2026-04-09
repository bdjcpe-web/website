/**
 * @file src/lib/README.md  (conceptuel - traité comme documentation)
 * @description Architecture et bonnes pratiques du projet BDJ
 * 
 * ========== STRUCTURE LES FICHIERS ==========
 * 
 * src/lib/
 * ├── auth.ts           ✅ Configuration NextAuth (singleton pattern)
 * ├── prisma.ts         ✅ Client Prisma singleton (réutilisable partout)
 * ├── constants.ts      ✅ Toutes les valeurs magiques
 * ├── date.ts           ✅ Utilitaires de gestion des dates
 * ├── calendar.ts       📅 Google Calendar integration
 * ├── mail.ts           📧 Système d'envoi email
 * └── README.md         📖 (ce fichier)
 * 
 * ========== PRINCIPES CLÉS ==========
 * 
 * 1️⃣ SINGLETON PRISMA
 *    ✅ Toujours utiliser : import prisma from '@/lib/prisma'
 *    ❌ JAMAIS : const prisma = new PrismaClient()
 *    
 *    Pourquoi ? Évite les fuites mémoire et limite les connexions BD
 *    Voir lib/prisma.ts pour le pattern exact
 * 
 * 2️⃣ GESTION DES DATES
 *    ⚠️ CRITIQUE : Les dates sont TOUJOURS en format local (pas UTC)
 *    
 *    Format de stockage BD : Date(year, month-1, day, 0, 0, 0, 0)
 *    Format de transmission : "YYYY-MM-DD" (string)
 *    
 *    Utilitaires disponibles :
 *    • parseDateLocal(dateStr)    : "2026-04-10" → Date locale
 *    • formatDateToString(date)   : Date locale → "2026-04-10"
 *    • getMonday(date)            : Jour → Lundi de la semaine
 *    • getSundayEnd(monday)       : Lundi → Dimanche 23:59:59
 * 
 * 3️⃣ CONSTANTES CENTRALISÉES
 *    Voir src/lib/constants.ts
 *    
 *    Avantage : Un seul endroit pour modifier les règles métier
 *    Exemple : Changer MAX_BOOKINGS_PER_WEEK = 2 redéfinit la règle partout
 * 
 * 4️⃣ COMMENTAIRES JSDOC
 *    Format pour chaque fonction :
 * 
 *    /**
 *     * Description courte de la fonction
 *     * @param param1 - Description du param1
 *     * @returns Type de retour et ce qu'il signifie
 *     * @example
 *     * myFunction('hello') // Returns "HELLO"
 *     *\/
 *    export function myFunction(param1: string) { ... }
 * 
 * 5️⃣ ORGANISER VOS API ROUTES
 *    Chaque route doit avoir :
 *    - JSDoc décrivant endpoint, méthodes, security
 *    - Imports clairement listés
 *    - Utilisation des constantes et utilitaires
 *    - Messages d'erreur depuis MESSAGES constant
 *    - Logs en cas d'erreur
 * 
 * ========== FLUX DE RÉSERVATION COMPLET ==========
 * 
 * 📱 CLIENT (CalendarBooking.tsx)
 *   - Utilisateur sélectionne date et créneau
 *   - Coche 5 règles → Validation locale
 *   - POST /api/bookings avec date en "YYYY-MM-DD"
 * 
 * 🖥️ SERVER (route.ts)
 *   - Vérifiehrefication règles acceptées
 *   - Vérification métier : 1 actif max, 1/semaine, éviction
 *   - Parse date en local, pas UTC
 *   - Crée réservation en BD avec date locale
 *   - Envoie email si éviction
 * 
 * 💾 DATABASE
 *   - Stocke date au format local
 *   - Display dans profil utilise directe.toLocaleDateString()
 * 
 * 📧 EMAIL
 *   - Reçoit "dateFormatted" et ajoute heure + contexte
 *   - Voir sendCancellationEmail() pour le template
 * 
 * ========== CHECKLIST POUR UN NOUVEAU FICHIER ==========
 * 
 * ☑️ JSDoc avec @file, @author, @description complet
 * ☑️ Imports organisés (React → externe → local)
 * ☑️ Utilisation de constantes depuis constants.ts
 * ☑️ Utilisation de utilitaires de date depuis date.ts
 * ☑️ Singleton prisma (pas new PrismaClient())
 * ☑️ Commentaires pour les sections logiques
 * ☑️ Gestion d'erreurs cohérente
 * ☑️ Messages d'erreur depuis MESSAGES const
 * ☑️ Logs en cas d'erreur serveur
 * 
 * ========== MIGRATION DE CODE ANTIGA ==========
 * 
 * Si vous avez des fichiers anciensavec :
 * - const prisma = new PrismaClient() → Remplacer par import
 * - Hardcoded "7" ou "1" → Utiliser constants.ts
 * - toISOString() → Utiliser formatDateToString()
 * - new Date(dateStr) → Utiliser parseDateLocal()
 * - Messages texte → Utiliser MESSAGES constant
 * 
 * ========== RESSOURCES ==========
 * 
 * • Prisma Singleton: https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-instantiation-type-safety
 * • NextAuth Config: https://next-auth.js.org/configuration/pages
 * • Date Handling en JS: Toujours utiliser new Date(year, month-1, day)
 */
