import { Component, inject } from '@angular/core';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  // Même instance que dans la liste (service 'root') => compteur toujours synchronisé.
  private readonly booking = inject(BookingService);

  // On lit le signal du service : l'écran se met à jour tout seul.
  readonly count = this.booking.count;
}
