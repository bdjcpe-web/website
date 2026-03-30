/**
 * @file src/lib/calendar.ts
 * @author Loann Cordel - Président du BDJ
 * @date 29/03/2026
 * @architecture Client Component
 * @description Fonctions pour récupérer les données du calendrier Google et extraire les liens HelloAsso.
 */

export async function getEventsData() {
  try {
    const res = await fetch(`https://calendar.google.com/calendar/ical/bdj.cpe%40gmail.com/public/basic.ics?t=${Date.now()}`, {
      cache: 'no-store'
    });
    if (!res.ok) return [];

    const text = await res.text();
    const events: any[] = [];
    const lines = text.split(/\r?\n/);
    let currentEvent: any = null;
    let inDescription = false;

    for (const line of lines) {
      if (line.startsWith('BEGIN:VEVENT')) {
        currentEvent = {};
      } else if (line.startsWith('END:VEVENT') && currentEvent) {
        events.push(currentEvent);
        currentEvent = null;
        inDescription = false;
      } else if (currentEvent) {
        if (line.startsWith('DTSTART') && line.includes(':')) {
          const dateStr = line.split(':')[1];
          const year = parseInt(dateStr.substring(0, 4));
          const month = parseInt(dateStr.substring(4, 6)) - 1;
          const day = parseInt(dateStr.substring(6, 8));
          if (dateStr.length > 8) {
            const hour = parseInt(dateStr.substring(9, 11));
            const min = parseInt(dateStr.substring(11, 13));
            currentEvent.date = new Date(Date.UTC(year, month, day, hour, min));
            currentEvent.hasTime = true;
          } else {
            currentEvent.date = new Date(year, month, day);
            currentEvent.hasTime = false;
          }
          inDescription = false;
        } else if (line.startsWith('DTEND') && line.includes(':')) {
          const dateStr = line.split(':')[1];
          if (dateStr.length > 8) {
            const year = parseInt(dateStr.substring(0, 4));
            const month = parseInt(dateStr.substring(4, 6)) - 1;
            const day = parseInt(dateStr.substring(6, 8));
            const hour = parseInt(dateStr.substring(9, 11));
            const min = parseInt(dateStr.substring(11, 13));
            currentEvent.endDate = new Date(Date.UTC(year, month, day, hour, min));
          }
          inDescription = false;
        } else if (line.startsWith('SUMMARY:')) {
          currentEvent.title = line.substring(8);
          inDescription = false;
        } else if (line.startsWith('DESCRIPTION:')) {
          currentEvent.description = line.substring(12).replace(/\\n/g, ' ').replace(/\\,/g, ',');
          inDescription = true;
        } else if (inDescription && line.startsWith(' ')) {
          currentEvent.description += line.substring(1).replace(/\\n/g, ' ').replace(/\\,/g, ',');
        } else if (line.startsWith('LOCATION:')) {
          currentEvent.location = line.substring(9).replace(/\\n/g, ' ').replace(/\\,/g, ',');
          inDescription = false;
        } else {
          inDescription = false;
        }
      }
    }
    return events;
  } catch (e) {
    console.error("Error fetching ICS", e);
    return [];
  }
}

function processEvents(events: any[]) {
  return events.map(e => {
    const monthNames = ['JAN', 'FÉV', 'MARS', 'AVR', 'MAI', 'JUIN', 'JUIL', 'AOÛT', 'SEPT', 'OCT', 'NOV', 'DÉC'];

    let rawDesc = e.description || '';
    let helloAssoSlug: string | null = null;

    // LA MAGIE HELLOASSO : On cherche d'abord un vrai lien HTML (<a href="...">Texte</a>)
    const anchorRegex = /<a\s+[^>]*href=["']?(https:\/\/(?:www\.)?helloasso\.com[^"'>\s]+)["']?[^>]*>(.*?)<\/a>/i;
    const anchorMatch = rawDesc.match(anchorRegex);

    if (anchorMatch && anchorMatch[1]) {
      const fullUrl = anchorMatch[1];
      try {
        const urlObj = new URL(fullUrl);
        const pathSegments = urlObj.pathname.split('/').filter(Boolean);
        helloAssoSlug = pathSegments[pathSegments.length - 1];

        // On détruit le lien complet ET le texte cliquable ("Lien HelloAsso")
        rawDesc = rawDesc.replace(anchorRegex, '').trim();
      } catch (err) {
        console.error("Lien HelloAsso invalide :", fullUrl);
      }
    } else {
      // FALLBACK : Si tu as juste collé le lien brut sans en faire un lien cliquable
      const rawUrlRegex = /(https:\/\/(?:www\.)?helloasso\.com[^\s<"']+)/i;
      const urlMatch = rawDesc.match(rawUrlRegex);

      if (urlMatch && urlMatch[1]) {
        const fullUrl = urlMatch[1];
        try {
          const urlObj = new URL(fullUrl);
          const pathSegments = urlObj.pathname.split('/').filter(Boolean);
          helloAssoSlug = pathSegments[pathSegments.length - 1];

          // On retire l'URL brute du texte
          rawDesc = rawDesc.replace(rawUrlRegex, '').trim();
        } catch (err) {
          console.error("Lien HelloAsso invalide :", fullUrl);
        }
      }
    }

    // NETTOYAGE GÉNÉRAL : On enlève le reste du HTML (saut de ligne, etc.)
    let cleanDesc = rawDesc.replace(/(<([^>]+)>)/gi, "").trim();

    const t = (e.title || '').toLowerCase();
    let color = 'var(--c-bordeaux)';
    if (t.includes('jdr') || t.includes('jeu de rôle') || t.includes('société') || t.includes('plateau')) color = 'var(--c-jdr)';
    else if (t.includes('poker') || t.includes('cartes')) color = 'var(--c-poker)';
    else if (t.includes('sortie') || t.includes('bar') || t.includes('laser') || t.includes('bowling')) color = 'var(--c-sorties)';
    else if (t.includes('minecraft') || t.includes('mc') || t.includes('gaming') || t.includes('jeux vidéo')) color = 'var(--c-gaming)';
    else if (t.includes('local') || t.includes('d016') || t.includes('permanence')) color = 'var(--c-local)';
    else if (t.includes('esport') || t.includes('lol') || t.includes('league of legends') || t.includes('valo') || t.includes('valorant') || t.includes('rl') || t.includes('rocket league') || t.includes('cs2') || t.includes('smash') || t.includes('ssbu')) color = '#e63946';

    const timeStrStart = e.hasTime
      ? e.date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' })
      : null;
    const timeStrEnd = (e.hasTime && e.endDate)
      ? e.endDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' })
      : null;

    const timeStr = (timeStrStart && timeStrEnd) ? `${timeStrStart} — ${timeStrEnd}` : timeStrStart;

    const isPast = (e.endDate || e.date) < new Date();

    return {
      id: e.title + e.date.getTime(),
      title: e.title || 'Événement',
      desc: cleanDesc,
      location: e.location || 'Lieu à préciser',
      helloAssoSlug,
      day: e.date.getDate().toString().padStart(2, '0'),
      month: monthNames[e.date.getMonth()],
      time: timeStr,
      color,
      dateStr: e.date.toISOString(),
      isPast
    };
  });
}

export async function getAllParsedEvents() {
  const events = await getEventsData();
  const processed = processEvents(events);
  processed.sort((a, b) => new Date(a.dateStr).getTime() - new Date(b.dateStr).getTime());
  return processed;
}

export async function getUpcomingEvents(limit?: number) {
  const allEvents = await getAllParsedEvents();
  const upcoming = allEvents.filter(e => !e.isPast);
  if (limit) return upcoming.slice(0, limit);
  return upcoming;
}