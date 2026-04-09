/**
 * @file src/lib/constants.ts
 * @description Constantes globales du projet BDJ
 * Toutes les valeurs fixes et configurations doivent être centralisées ici pour faciliter la maintenance
 */

// ── CALENDRIER & DATES ──
/** Nombre de jours à l'avance disponibles pour réserver */
export const BOOKING_DAYS_AHEAD = 14;

/** Nombre de jours avant une réservation pour permettre l'éviction d'un non-membre */
export const EVICTION_DAYS_WINDOW = 7;

/** Nombre de réservations maximum par utilisateur (règle "une seule à la fois") */
export const MAX_ACTIVE_BOOKINGS = 1;

/** Nombre de réservations max par semaine */
export const MAX_BOOKINGS_PER_WEEK = 1;

// ── RÈGLEMENT & VALIDATIONS ──
/** Nombre de lignes du règlement à cocher */
export const RULES_COUNT = 5;

/** Jours de la semaine ouverts pour les réservations (0=Dim, 1=Lun, ..., 6=Sam) */
export const OPEN_DAYS = [1, 2, 3, 4, 5]; // Lun à Ven

/**
 * 🕐 TOUS LES CRÉNEAUX POSSIBLES (admin peut les activer/désactiver)
 * Utilisé pour afficher les options au moment où l'admin crée/ajoute un créneau
 */
export const ALL_POSSIBLE_SLOTS = [
  { startTime: '08:00', endTime: '10:00' },
  { startTime: '10:15', endTime: '12:15' },
  { startTime: '12:15', endTime: '13:30' },
  { startTime: '13:30', endTime: '15:30' },
  { startTime: '15:45', endTime: '17:45' },
  { startTime: '18:00', endTime: '20:00' },
] as const;

/**
 * 📅 CRÉNEAUX ACTIFS PAR DÉFAUT
 * Format: [{ dayOfWeek, startTime, endTime }, ...]
 * Ces créneaux sont seédés au premier migrate et peuvent ensuite être modifiés par admin
 */
export const DEFAULT_ACTIVE_SLOTS = [
  // Lundi (1)
  { dayOfWeek: 1, startTime: '12:15', endTime: '13:30' },
  { dayOfWeek: 1, startTime: '13:30', endTime: '15:30' },
  // Mardi (2)
  { dayOfWeek: 2, startTime: '12:15', endTime: '13:30' },
  { dayOfWeek: 2, startTime: '13:30', endTime: '15:30' },
  // Mercredi (3)
  { dayOfWeek: 3, startTime: '12:15', endTime: '13:30' },
  { dayOfWeek: 3, startTime: '13:30', endTime: '15:30' },
  // Jeudi (4)
  { dayOfWeek: 4, startTime: '12:15', endTime: '13:30' },
  { dayOfWeek: 4, startTime: '13:30', endTime: '15:30' },
  // Vendredi (5)
  { dayOfWeek: 5, startTime: '12:15', endTime: '13:30' },
  { dayOfWeek: 5, startTime: '13:30', endTime: '15:30' },
] as const;

/** Créneaux de réservation (legacy - garder pour compatibilité) */
export const BOOKING_SLOTS = {
  LUNCH: { start: '12:15', end: '13:30' },
  AFTERNOON: { start: '13:30', end: '16:00' },
};

// ── ADMINISTRATEURS ──
/** Variable d'environnement contenant les emails administrateurs séparés par virgule */
export const ADMIN_EMAILS_ENV_VAR = 'ADMIN_EMAILS';

// ── MESSAGES ──
export const MESSAGES = {
  BOOKING_SUCCESS: 'Réservation confirmée avec succès !',
  BOOKING_ALREADY_EXISTS: 'Tu as déjà réservé ce créneau.',
  BOOKING_RESERVED_BY_MEMBER: 'Ce créneau est réservé par un membre — il ne peut pas être repris.',
  BOOKING_RESERVED_BY_OTHER: "Ce créneau vient juste d'être pris par quelqu'un d'autre.",
  BOOKING_EVICTION_WINDOW_EXCEEDED: 'Tu ne peux évincer un non-membre que si la réservation a lieu dans les 7 prochains jours.',
  BOOKING_ACTIVE_LIMIT: 'Tu as déjà une réservation en attente ou en cours. Une seule à la fois !',
  BOOKING_WEEKLY_LIMIT: 'Pour assurer la rotation des joueurs, tu ne peux pas réserver plus d\'une fois par semaine.',
  RULES_REQUIRED: 'Tu dois obligatoirement accepter le règlement pour réserver le local.',
  UNAUTHORIZED: 'Non autorisé',
} as const;

// ── EMAILS ──
export const EMAIL_CONFIG = {
  SUBJECT_OVERRIDE: (date: string) => `Ta réservation du Local a été reprise par un membre (${date})`,
  SUBJECT_CANCELLATION: (date: string) => `Annulation de ta réservation du Local (${date})`,
} as const;
