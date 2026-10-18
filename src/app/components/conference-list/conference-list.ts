import { Component, inject, output } from '@angular/core';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { Conference } from '../../models/conference';
import { ALL_TOPICS, ConferenceService } from '../../services/conference.service';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-conference-list',
  imports: [DatePipe, UpperCasePipe],
  templateUrl: './conference-list.html',
  styleUrl: './conference-list.css',
})
// Ce composant ne garde plus aucune donnée : il AFFICHE et demande tout aux services.
export class ConferenceList {
  private readonly conferenceService = inject(ConferenceService);
  readonly booking = inject(BookingService);

  // On réutilise directement les signals du service.
  readonly conferences = this.conferenceService.filteredConferences;
  readonly topics = this.conferenceService.topics;
  readonly selectedTopic = this.conferenceService.selectedTopic;
  readonly ALL = ALL_TOPICS;

  conferenceSelected = output<Conference>();

  fill(c: Conference) {
    return Math.round((c.nbParticipants / c.maxParticipants) * 100);
  }

  filterBy(topic: string) {
    this.conferenceService.setTopic(topic);
  }

  selectConference(conference: Conference) {
    this.conferenceSelected.emit(conference);
  }

  register(conference: Conference, event: Event) {
    event.stopPropagation();
    this.booking.book(conference.id);
  }

  cancel(conference: Conference, event: Event) {
    event.stopPropagation();
    this.booking.cancel(conference.id);
  }
}
