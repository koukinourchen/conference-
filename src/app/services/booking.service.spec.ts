import { TestBed } from '@angular/core/testing';
import { BookingService } from './booking.service';
import { ConferenceService } from './conference.service';

describe('BookingService', () => {
  let booking: BookingService;
  let conferences: ConferenceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    booking = TestBed.inject(BookingService);
    conferences = TestBed.inject(ConferenceService);
  });

  it('should start with no booking', () => {
    expect(booking.count()).toBe(0);
    expect(booking.bookedConferences()).toEqual([]);
  });

  it('should book a conference, update count and seats', () => {
    const before = conferences.getById(1)!.nbParticipants;

    expect(booking.book(1)).toBe(true);

    expect(booking.count()).toBe(1);
    expect(booking.isBooked(1)).toBe(true);
    expect(conferences.getById(1)!.nbParticipants).toBe(before + 1);
    expect(booking.bookedConferences()[0].id).toBe(1);
  });

  it('should not book the same conference twice', () => {
    booking.book(1);
    expect(booking.book(1)).toBe(false);
    expect(booking.count()).toBe(1);
  });

  it('should not book a full conference', () => {
    expect(booking.book(3)).toBe(false);
    expect(booking.count()).toBe(0);
  });

  it('should cancel a booking and free the seat', () => {
    const before = conferences.getById(1)!.nbParticipants;
    booking.book(1);
    booking.cancel(1);

    expect(booking.count()).toBe(0);
    expect(conferences.getById(1)!.nbParticipants).toBe(before);
  });
});
