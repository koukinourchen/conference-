import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { CATEGORIES, Conference } from '../../models/conference';
import { ConferenceService } from '../../services/conference.service';
import { notBlank, notInPast, seatsValidator } from './conference-form.validators';

// PROSITS 1, 2 et 3 : formulaire Reactive Form pour ajouter OU modifier une conférence.
@Component({
  selector: 'app-conference-form',
  imports: [ReactiveFormsModule],
  templateUrl: './conference-form.html',
  styleUrl: './conference-form.css',
})
export class ConferenceForm {
  private readonly conferenceService = inject(ConferenceService);

  readonly categories = CATEGORIES;
  readonly descriptionMax = 300;

  // input() : le parent nous donne une conférence à modifier. null = on est en mode « ajout ».
  conference = input<Conference | null>(null);

  // output() : on prévient le parent quand on a fini (ou annulé).
  finished = output<void>();

  // Mode modification ou ajout ? (calculé automatiquement)
  readonly isEditMode = computed(() => this.conference() !== null);
  readonly successMessage = signal('');

  // PROSIT 1 + 2 : le FormGroup = tout le formulaire.
  // Chaque FormControl = un champ, avec sa valeur de départ et ses règles (Validators).
  readonly form = new FormGroup(
    {
      title: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, notBlank, Validators.minLength(3), Validators.maxLength(60)],
      }),
      description: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, notBlank, Validators.minLength(10), Validators.maxLength(this.descriptionMax)],
      }),
      category: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      place: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, notBlank, Validators.minLength(2), Validators.maxLength(60)],
      }),
      date: new FormControl('', { nonNullable: true, validators: [Validators.required, notInPast] }),
      maxParticipants: new FormControl<number | null>(null, [
        Validators.required,
        Validators.min(1),
        Validators.max(1000),
        Validators.pattern(/^\d+$/),
      ]),
      nbParticipants: new FormControl(0, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)],
      }),
    },
    // Règle sur plusieurs champs : inscrits <= maximum.
    { validators: seatsValidator },
  );

  // PROSIT 3 : toSignal() transforme valueChanges / statusChanges en signals.
  // Plus besoin de subscribe() ni de unsubscribe().
  private readonly formValue = toSignal(this.form.valueChanges, { initialValue: this.form.value });
  private readonly formStatus = toSignal(this.form.statusChanges, { initialValue: this.form.status });

  // Nombre de caractères de la description, en temps réel.
  readonly descriptionLength = computed(() => (this.formValue().description ?? '').length);

  // Le formulaire est-il valide ? (en temps réel)
  readonly isValid = computed(() => this.formStatus() === 'VALID');

  // Le bouton « Enregistrer » est actif seulement si le formulaire est valide.
  readonly canSave = computed(() => this.isValid());

  constructor() {
    // effect() s'exécute chaque fois que `conference` change :
    // on remplit le formulaire (modification) ou on le vide (ajout).
    effect(() => {
      const c = this.conference();
      this.successMessage.set('');
      if (c) {
        this.form.reset({
          title: c.title,
          description: c.description,
          category: c.category,
          place: c.place,
          date: new Date(c.date).toISOString().slice(0, 10),
          maxParticipants: c.maxParticipants,
          nbParticipants: c.nbParticipants,
        });
      } else {
        this.form.reset();
      }
    });
  }

  // Raccourcis pour écrire title.hasError(...) dans le HTML au lieu de form.controls.title...
  get title() { return this.form.controls.title; }
  get description() { return this.form.controls.description; }
  get category() { return this.form.controls.category; }
  get place() { return this.form.controls.place; }
  get date() { return this.form.controls.date; }
  get maxParticipants() { return this.form.controls.maxParticipants; }
  get nbParticipants() { return this.form.controls.nbParticipants; }

  // Afficher une erreur seulement si le champ est invalide ET que l'utilisateur l'a touché.
  showError(control: AbstractControl): boolean {
    return control.invalid && (control.touched || control.dirty);
  }

  // PROSIT 2 : récupérer les données quand on clique sur « Enregistrer ».
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // getRawValue() = un objet avec toutes les valeurs du formulaire.
    const raw = this.form.getRawValue();
    const data: Omit<Conference, 'id'> = {
      title: raw.title.trim(),
      description: raw.description.trim(),
      category: raw.category,
      place: raw.place.trim(),
      date: new Date(raw.date),
      maxParticipants: Number(raw.maxParticipants),
      nbParticipants: raw.nbParticipants,
    };

    // Modification -> updateConference ; ajout -> addConference.
    const current = this.conference();
    if (current) {
      this.conferenceService.updateConference({ ...data, id: current.id });
      this.finished.emit();
    } else {
      const created = this.conferenceService.addConference(data);
      this.form.reset();
      this.successMessage.set(`« ${created.title} » a bien été ajoutée.`);
    }
  }

  cancel(): void {
    this.finished.emit();
  }
}
