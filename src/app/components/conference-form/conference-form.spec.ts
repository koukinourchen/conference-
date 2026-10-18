import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConferenceForm } from './conference-form';
import { ConferenceService } from '../../services/conference.service';

const VALID = {
  title: 'NgConf Tunis',
  description: 'Une journée complète dédiée à Angular et aux Signals.',
  category: 'Web',
  place: 'Tunis',
  date: '2099-05-20',
  maxParticipants: 120,
  nbParticipants: 0,
};

describe('ConferenceForm', () => {
  let fixture: ComponentFixture<ConferenceForm>;
  let component: ConferenceForm;
  let service: ConferenceService;
  const el = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ConferenceForm] }).compileComponents();
    fixture = TestBed.createComponent(ConferenceForm);
    component = fixture.componentInstance;
    service = TestBed.inject(ConferenceService);
    await fixture.whenStable();
  });

  it('should create and start invalid', () => {
    expect(component).toBeTruthy();
    expect(component.form.invalid).toBe(true);
    expect(component.isValid()).toBe(false);
  });

  describe('validation', () => {
    it('title: required, min 3', () => {
      component.title.setValue('');
      expect(component.title.hasError('required')).toBe(true);
      component.title.setValue('ab');
      expect(component.title.hasError('minlength')).toBe(true);
      component.title.setValue('   ');
      expect(component.title.hasError('blank')).toBe(true);
      component.title.setValue('Angular');
      expect(component.title.valid).toBe(true);
    });

    it('description: min 10, max 300', () => {
      component.description.setValue('court');
      expect(component.description.hasError('minlength')).toBe(true);
      component.description.setValue('x'.repeat(301));
      expect(component.description.hasError('maxlength')).toBe(true);
    });

    it('date: refuses the past', () => {
      component.date.setValue('2000-01-01');
      expect(component.date.hasError('pastDate')).toBe(true);
      component.date.setValue('2099-01-01');
      expect(component.date.valid).toBe(true);
    });

    it('maxParticipants: integer between 1 and 1000', () => {
      component.maxParticipants.setValue(0);
      expect(component.maxParticipants.hasError('min')).toBe(true);
      component.maxParticipants.setValue(1001);
      expect(component.maxParticipants.hasError('max')).toBe(true);
      component.maxParticipants.setValue(10.5);
      expect(component.maxParticipants.hasError('pattern')).toBe(true);
      component.maxParticipants.setValue(50);
      expect(component.maxParticipants.valid).toBe(true);
    });

    it('group: nbParticipants cannot exceed maxParticipants', () => {
      component.form.patchValue({ ...VALID, maxParticipants: 10, nbParticipants: 11 });
      expect(component.form.hasError('seatsExceeded')).toBe(true);
      expect(component.form.invalid).toBe(true);
      component.form.patchValue({ nbParticipants: 10 });
      expect(component.form.valid).toBe(true);
    });
  });

  describe('signals (prosit 3)', () => {
    it('counts description characters in real time', () => {
      component.description.setValue('Hello');
      expect(component.descriptionLength()).toBe(5);
      component.description.setValue('Hello world');
      expect(component.descriptionLength()).toBe(11);
    });

    it('enables the save button only when the form is valid', async () => {
      const button = () => el().querySelector('button[type=submit]') as HTMLButtonElement;
      await fixture.whenStable();
      expect(button().disabled).toBe(true);

      component.form.setValue(VALID);
      await fixture.whenStable();
      expect(component.canSave()).toBe(true);
      expect(button().disabled).toBe(false);

      component.title.setValue('');
      await fixture.whenStable();
      expect(button().disabled).toBe(true);
    });
  });

  describe('error messages', () => {
    it('shows messages after submit on an invalid form', async () => {
      component.onSubmit();
      await fixture.whenStable();
      expect(el().textContent).toContain('Le titre est obligatoire.');
      expect(el().textContent).toContain('Choisissez une catégorie.');
    });
  });

  describe('add mode', () => {
    it('adds a conference to the service and resets the form', () => {
      const before = service.conferences().length;
      component.form.setValue(VALID);
      component.onSubmit();

      expect(service.conferences().length).toBe(before + 1);
      const added = service.conferences().at(-1)!;
      expect(added.title).toBe('NgConf Tunis');
      expect(added.date).toEqual(new Date('2099-05-20'));
      expect(added.id).toBeGreaterThan(4);
      expect(component.form.getRawValue().title).toBe('');
      expect(component.successMessage()).toContain('NgConf Tunis');
    });

    it('does not add anything when invalid', () => {
      const before = service.conferences().length;
      component.onSubmit();
      expect(service.conferences().length).toBe(before);
    });
  });

  describe('edit mode (same form reused)', () => {
    it('pre-fills and updates the existing conference', async () => {
      const existing = service.getById(1)!;
      fixture.componentRef.setInput('conference', existing);
      await fixture.whenStable();

      expect(component.isEditMode()).toBe(true);
      expect(component.title.value).toBe(existing.title);
      expect(component.date.value).toBe('2026-10-20');

      let finished = false;
      component.finished.subscribe(() => (finished = true));

      component.title.setValue('Angular Conference 2026');
      component.onSubmit();

      expect(service.getById(1)!.title).toBe('Angular Conference 2026');
      expect(service.conferences().length).toBe(4);
      expect(finished).toBe(true);
    });

    it('goes back to an empty add form when conference becomes null', async () => {
      fixture.componentRef.setInput('conference', service.getById(1)!);
      await fixture.whenStable();
      fixture.componentRef.setInput('conference', null);
      await fixture.whenStable();

      expect(component.isEditMode()).toBe(false);
      expect(component.title.value).toBe('');
    });
  });
});
