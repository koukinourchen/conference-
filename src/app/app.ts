import { Component, computed, inject, signal } from '@angular/core';

import { Header } from './components/header/header';
import { Navbar } from './components/navbar/navbar';
import { UserProfile } from './components/user-profile/user-profile';
import { FriendList } from './components/friend-list/friend-list';
import { Notifications } from './components/notifications/notifications';
import { Footer } from './components/footer/footer';

import { ConferenceList } from './components/conference-list/conference-list';
import { ConferenceDetail } from './components/conference-detail/conference-detail';
import { ConferenceForm } from './components/conference-form/conference-form';

import { Conference } from './models/conference';
import { ConferenceService } from './services/conference.service';

@Component({
  selector: 'app-root',
  imports: [
    Header,
    Navbar,
    UserProfile,
    FriendList,
    Notifications,
    ConferenceList,
    ConferenceDetail,
    ConferenceForm,
    Footer
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly conferenceService = inject(ConferenceService);

  // On retient seulement l'id choisi, puis on retrouve la conférence À JOUR dans le service
  // (sinon le panneau de détails afficherait d'anciennes données après une réservation).
  private readonly selectedId = signal<number | null>(null);

  readonly selectedConference = computed<Conference | null>(() => {
    const id = this.selectedId();
    return id === null ? null : (this.conferenceService.getById(id) ?? null);
  });

  // Conférence en cours de modification (null = formulaire en mode ajout).
  readonly editing = signal<Conference | null>(null);

  onConferenceSelected(conference: Conference) {
    this.selectedId.set(conference.id);
  }

  startEdit(conference: Conference) {
    this.editing.set(conference);
    queueMicrotask(() =>
      document.getElementById('ajout')?.scrollIntoView?.({ behavior: 'smooth' }),
    );
  }
}
