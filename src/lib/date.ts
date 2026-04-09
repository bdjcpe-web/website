/**
 * @file src/lib/date.ts
 * @description Utilitaires pour la gestion des dates
 * Important : Toutes les dates sont gérées en temps LOCAL (pas UTC) pour éviter les décalages
 */

/**
 * Récupère le lundi d'une semaine donnée
 * @param date - Date de référence
 * @returns Le lundi de la semaine au format Date (00:00:00)
 * @example getMonday(new Date('2026-04-09')) // Mercredi -> Lundi 06/04
 */
export function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay() || 7; // Convertir dimanche (0) en 7

  if (day !== 1) {
    date.setHours(-24 * (day - 1));
  }

  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Parse une date au format YYYY-MM-DD en objet Date local (sans conversion UTC)
 * CRUCIAL pour la gestion cohérente des réservations
 * @param dateStr - String au format YYYY-MM-DD
 * @returns Date au format local (00:00:00)
 * @example parseDateLocal('2026-04-10') // Retourne Date locale, pas UTC
 */
export function parseDateLocal(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Convertit une Date en string au format YYYY-MM-DD
 * @param date - Date à convertir
 * @returns String au format YYYY-MM-DD
 * @example formatDateToString(new Date('2026-04-10')) // '2026-04-10'
 */
export function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Crée une date limite (fin de journée) pour les requêtes de date range
 * @param date - Date de début
 * @returns Date + 1 jour à 00:00:00 (limite exclusive)
 * @example
 * const start = parseDateLocal('2026-04-10');
 * const end = getNextDayStart(start);
 * // Requête: where: { date: { gte: start, lt: end } }
 */
export function getNextDayStart(date: Date): Date {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  return nextDay;
}

/**
 * Vérifie si une date est dans le passé (avant maintenant)
 * @param date - Date à vérifier
 * @returns true si la date est passée
 */
export function isPast(date: Date): boolean {
  return date < new Date();
}

/**
 * Obtient la fin de dimanche d'une semaine donnée
 * @param monday - Le lundi de la semaine
 * @returns Le dimanche 23:59:59
 */
export function getSundayEnd(monday: Date): Date {
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
}
