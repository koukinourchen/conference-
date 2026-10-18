import { TestBed } from '@angular/core/testing';
import { ConferenceService, ALL_TOPICS } from './conference.service';

describe('ConferenceService', () => {
  let service: ConferenceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConferenceService);
  });

  it('should expose the catalogue', () => {
    expect(service.conferences().length).toBeGreaterThan(0);
  });

  it('should filter by topic and reset with "all"', () => {
    service.setTopic('IA');
    expect(service.filteredConferences().every((c) => c.category === 'IA')).toBe(true);

    service.setTopic(ALL_TOPICS);
    expect(service.filteredConferences().length).toBe(service.conferences().length);
  });

  it('should reserve and release a seat', () => {
    const before = service.getById(1)!.nbParticipants;
    expect(service.reserveSeat(1)).toBe(true);
    expect(service.getById(1)!.nbParticipants).toBe(before + 1);

    service.releaseSeat(1);
    expect(service.getById(1)!.nbParticipants).toBe(before);
  });

  it('should refuse to reserve a full conference', () => {
    const full = service.conferences().find((c) => c.nbParticipants === c.maxParticipants)!;
    expect(service.reserveSeat(full.id)).toBe(false);
  });
});
