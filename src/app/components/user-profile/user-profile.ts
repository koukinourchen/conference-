import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-user-profile',
  imports: [DatePipe],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css',
})
export class UserProfile {
  readonly booking = inject(BookingService);

  readonly booked = this.booking.bookedConferences;
}
