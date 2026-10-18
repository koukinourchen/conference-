import { Injectable, computed, inject, signal } from '@angular/core';
import { ConferenceService } from './conference.service';

// PROSIT SERVICES : ce service gère UNIQUEMENT les réservations.
// Il est en 'root' : la Navbar et la liste partagent donc exactement les mêmes réservations.
@Injectable({ providedIn: 'root' })
export class BookingService {
  // inject() = demander à Angular de nous donner le ConferenceService (remplace le constructeur).
  private readonly conferenceService = inject(ConferenceService);

  // On mémorise seulement les id des conférences réservées.
  private readonly _bookedIds = signal<number[]>([]);

  readonly bookedIds = this._bookedIds.asReadonly();

  // Les conférences réservées (le « programme personnalisé »), calculées automatiquement.
  readonly bookedConferences = computed(() => {
    const ids = this._bookedIds();
    return this.conferenceService.conferences().filter((c) => ids.includes(c.id));
  });

  // Nombre de réservations : c'est ce que la Navbar affiche.
  readonly count = computed(() => this._bookedIds().length);

  // Cette conférence est-elle déjà réservée ?
  isBooked(id: number): boolean {
    return this._bookedIds().includes(id);
  }

  // Réserver : on vérifie qu'on n'a pas déjà réservé et qu'il reste une place.
  book(id: number): boolean {
    if (this.isBooked(id)) {
      return false;
    }
    if (!this.conferenceService.reserveSeat(id)) {
      return false;
    }
    this._bookedIds.update((ids) => [...ids, id]);
    return true;
  }

  // Annuler : on enlève la réservation et on libère la place.
  cancel(id: number): void {
    if (!this.isBooked(id)) {
      return;
    }
    this._bookedIds.update((ids) => ids.filter((x) => x !== id));
    this.conferenceService.releaseSeat(id);
  }
}
