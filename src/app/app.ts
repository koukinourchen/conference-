import { Component, signal } from '@angular/core';

import { Header } from './components/header/header';
import { Navbar } from './components/navbar/navbar';
import { UserProfile } from './components/user-profile/user-profile';
import { FriendList } from './components/friend-list/friend-list';
import { Notifications } from './components/notifications/notifications';
import { Footer } from './components/footer/footer';

import { ConferenceList } from './components/conference-list/conference-list';
import { ConferenceDetail } from './components/conference-detail/conference-detail';

import { Conference } from './models/conference';

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
    Footer
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  selectedConference = signal<Conference | null>(null);

  onConferenceSelected(conference: Conference) {
    this.selectedConference.set(conference);
  }

}