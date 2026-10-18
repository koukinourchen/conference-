import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Navbar } from './navbar';
import { ConferenceList } from '../conference-list/conference-list';
import { BookingService } from '../../services/booking.service';

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navbar, ConferenceList],
    }).compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the booking count', async () => {
    expect(fixture.nativeElement.querySelector('.badge').textContent).toContain('0');

    TestBed.inject(BookingService).book(1);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.badge').textContent).toContain('1');
  });

  it('should stay in sync when a booking is made from the list', async () => {
    const list = TestBed.createComponent(ConferenceList);
    await list.whenStable();

    list.componentInstance.register(
      { id: 1 } as never,
      new Event('click'),
    );
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.badge').textContent).toContain('1');
  });
});
