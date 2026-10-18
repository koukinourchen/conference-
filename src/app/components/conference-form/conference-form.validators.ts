import { AbstractControl, ValidationErrors } from '@angular/forms';

// Date d'aujourd'hui au format AAAA-MM-JJ (le même format que <input type="date">).
function todayIso(): string {
  return new Date().toLocaleDateString('en-CA');
}

// Validateur : refuse un texte composé uniquement d'espaces (par exemple «    »).
export function notBlank(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  return typeof value === 'string' && value.length > 0 && value.trim().length === 0
    ? { blank: true }
    : null;
}

// Validateur : la date ne doit pas être dans le passé.
export function notInPast(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;
  return value && value < todayIso() ? { pastDate: true } : null;
}

// Validateur du GROUPE : les inscrits ne peuvent pas dépasser le maximum.
// Il vérifie plusieurs champs à la fois, donc il se place sur le FormGroup.
export function seatsValidator(group: AbstractControl): ValidationErrors | null {
  const max = group.get('maxParticipants')?.value;
  const nb = group.get('nbParticipants')?.value;
  return max != null && nb != null && nb > max ? { seatsExceeded: true } : null;
}
