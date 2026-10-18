import { Injectable, computed, signal } from '@angular/core';
import { Conference } from '../models/conference';

// Valeur spéciale du filtre : « afficher toutes les catégories ».
export const ALL_TOPICS = 'all';

// PROSIT SERVICES : ce service gère UNIQUEMENT le catalogue des conférences.
// providedIn: 'root' = Angular crée UNE SEULE instance, partagée par toute l'application.
// C'est ce qui permet à la Navbar et à la liste de voir les mêmes données.
@Injectable({ providedIn: 'root' })
export class ConferenceService {
  // Un signal = une « boîte » qui contient une valeur. Si elle change, l'écran se met à jour tout seul.
  // Il est privé (_) : seul ce service peut modifier la liste.
  private readonly _conferences = signal<Conference[]>([
    {
      id: 1,
      title: 'Angular Conference',
      category: 'Web',
      description: 'Découvrir Angular',
      date: new Date('2026-10-20'),
      place: 'Tunis',
      maxParticipants: 100,
      nbParticipants: 40,
    },
    {
      id: 2,
      title: 'AI Conference',
      category: 'IA',
      description: 'Découvrir intelligence artificielle',
      date: new Date('2026-11-15'),
      place: 'Ariana',
      maxParticipants: 50,
      nbParticipants: 45,
    },
    {
      id: 3,
      title: 'Cloud Conference',
      category: 'Cloud',
      description: 'Découvrir le Cloud',
      date: new Date('2026-12-10'),
      place: 'Sousse',
      maxParticipants: 30,
      nbParticipants: 30,
    },
    {
      id: 4,
      title: 'Cybersecurity Summit',
      category: 'Sécurité',
      description: 'Protéger les applications web modernes',
      date: new Date('2027-01-18'),
      place: 'Tunis',
      maxParticipants: 80,
      nbParticipants: 20,
    },
  ]);

  // Version en lecture seule, donnée aux composants (ils peuvent lire, pas modifier).
  readonly conferences = this._conferences.asReadonly();

  // Catégorie choisie dans le filtre.
  readonly selectedTopic = signal<string>(ALL_TOPICS);

  // computed = valeur calculée automatiquement. Ici : la liste des catégories sans doublons.
  readonly topics = computed(() => [...new Set(this._conferences().map((c) => c.category))]);

  // Conférences filtrées selon la catégorie choisie (recalculées à chaque changement).
  readonly filteredConferences = computed(() => {
    const topic = this.selectedTopic();
    const list = this._conferences();
    return topic === ALL_TOPICS ? list : list.filter((c) => c.category === topic);
  });

  // Retrouver une conférence grâce à son id.
  getById(id: number): Conference | undefined {
    return this._conferences().find((c) => c.id === id);
  }

  // Changer le filtre.
  setTopic(topic: string): void {
    this.selectedTopic.set(topic);
  }

  // Ajouter une conférence : l'id est calculé automatiquement (le plus grand + 1).
  addConference(data: Omit<Conference, 'id'>): Conference {
    const id = Math.max(0, ...this._conferences().map((c) => c.id)) + 1;
    const created: Conference = { ...data, id };
    this._conferences.update((list) => [...list, created]);
    return created;
  }

  // Modifier une conférence existante (on remplace celle qui a le même id).
  updateConference(updated: Conference): void {
    this._conferences.update((list) => list.map((c) => (c.id === updated.id ? updated : c)));
  }

  // Prendre une place : refusé si la conférence est complète.
  reserveSeat(id: number): boolean {
    const conference = this.getById(id);
    if (!conference || conference.nbParticipants >= conference.maxParticipants) {
      return false;
    }
    this.updateParticipants(id, +1);
    return true;
  }

  // Libérer une place (annulation).
  releaseSeat(id: number): void {
    const conference = this.getById(id);
    if (conference && conference.nbParticipants > 0) {
      this.updateParticipants(id, -1);
    }
  }

  // +1 ou -1 participant. On crée un NOUVEL objet ({ ...c }) au lieu de modifier l'ancien :
  // c'est ce qui permet au signal de détecter le changement.
  private updateParticipants(id: number, delta: number): void {
    
    this._conferences.update((list) =>
      list.map((c) => (c.id === id ? { ...c, nbParticipants: c.nbParticipants + delta } : c)),
    );
  }
}
