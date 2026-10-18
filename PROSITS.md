# Prosits Angular — version simple pour débutant

> Le design (thème violet sombre) est celui de votre projet d'origine. Seules les fonctionnalités ont été ajoutées.

Ce fichier explique, simplement, ce qui a été ajouté au projet pour chaque prosit
et où trouver le code.

---

## Prosit « Services et injection de dépendances »

**Problème :** toute la logique était dans `ConferenceList`, et la Navbar essayait de
faire `new ConferenceList()`. Résultat : deux copies des données, jamais synchronisées.

**Solution :**
| Fichier | Rôle |
|---|---|
| `services/conference.service.ts` | Garde le **catalogue** : liste, **filtre par catégorie** (`filteredConferences`), ajout, modification, places (`reserveSeat` / `releaseSeat`). |
| `services/booking.service.ts` | Garde les **réservations** : réserver, annuler, `count`, programme personnalisé (`bookedConferences`). Refuse si la conférence est complète. |
| `conference-list` | Affiche seulement (liste filtrée, boutons réserver / annuler). |
| `navbar` | Affiche le nombre de réservations (`count()`), synchronisé automatiquement. |

**Idées clés :**
- **Service** = une classe qui contient la logique et les données, séparée de l'affichage
  (principe de responsabilité unique).
- **`inject(MonService)`** = demander à Angular de nous donner le service.
- **`providedIn: 'root'`** = Angular crée **une seule instance** pour toute l'application.
  La Navbar et la liste partagent donc les mêmes données : un clic sur « S'inscrire »
  met à jour le compteur de la Navbar immédiatement.
- `providers: [...]` dans un composant crée **une instance par composant** : chacun aurait
  ses propres données, et on retrouverait le bug de départ.
- **`signal`** = une boîte avec une valeur (`signal(0)`, lecture `maListe()`, écriture `.set()` / `.update()`).
  **`computed`** = valeur calculée automatiquement à partir d'autres signals.

**Réponse à la question centrale :** les services centralisent les données à un seul endroit,
l'injection de dépendances donne la même instance à tous les composants, et les signals
préviennent automatiquement les composants quand quelque chose change.

---

## Prosit 1 — Découvrir les Reactive Forms

**Ce qu'est un Reactive Form :** un formulaire entièrement construit et contrôlé dans le
**TypeScript** (et non dans le HTML).

**Les éléments de base :**
| Élément | Rôle |
|---|---|
| `FormControl` | Un seul champ (sa valeur, son état, ses erreurs). |
| `FormGroup` | Un groupe de champs = le formulaire entier. |
| `Validators` | Les règles (`required`, `minLength`, `min`, `max`…). |
| `[formGroup]` | Relie la balise `<form>` au `FormGroup`. |
| `formControlName` | Relie un `<input>` à un `FormControl`. |
| `ReactiveFormsModule` | À importer dans le composant pour utiliser tout ça. |

**Reactive vs Template-driven :**
| | Reactive Forms | Template-driven |
|---|---|---|
| Où est la logique ? | TypeScript | HTML |
| Validation | Facile à écrire et à tester | Limitée |
| Formulaires complexes | ✅ Adapté | ❌ Vite compliqué |
| Réutilisation (ajout + modification) | ✅ `form.patchValue(...)` | Plus difficile |

**Pourquoi Reactive pour nous ?** Plusieurs formulaires, validations, réutilisation pour
« ajouter » et « modifier » : tout est plus clair, testable et maintenable en TypeScript.

**Dans le projet :** le même composant `conference-form` sert pour **ajouter** et **modifier**.
Le parent lui donne une conférence avec `input()` ; un `effect()` remplit alors le formulaire
(`form.reset({...})`). Sans conférence, le formulaire reste vide (mode ajout).

---

## Prosit 2 — Construire un formulaire valide

Code : `components/conference-form/`

| Champ | Contraintes |
|---|---|
| `title` | obligatoire, pas seulement des espaces, entre 3 et 60 caractères |
| `description` | obligatoire, pas seulement des espaces, entre 10 et 300 caractères |
| `category` | obligatoire (liste déroulante) |
| `place` | obligatoire, entre 2 et 60 caractères |
| `date` | obligatoire, **pas dans le passé** (`notInPast`) |
| `maxParticipants` | obligatoire, nombre entier entre 1 et 1000 |
| `nbParticipants` | nombre entier ≥ 0, **et jamais supérieur au maximum** (`seatsValidator` sur le groupe) |

Les validateurs personnalisés sont dans `conference-form.validators.ts`.

L'`id` n'est pas dans le formulaire : le service le génère automatiquement.

**Messages d'erreur :** affichés avec `@if (champ.touched && champ.errors)`, puis un message
selon l'erreur (`errors['required']`, `errors['minlength']`…).
Si on clique sur « Enregistrer » trop tôt, `markAllAsTouched()` affiche toutes les erreurs.

**Récupérer les données :** dans `onSubmit()`, `this.form.getRawValue()` renvoie un objet
avec toutes les valeurs, qu'on envoie à `ConferenceService.addConference(...)` (ou `updateConference(...)` en modification).

**Réponses :**
- *Comment construire un formulaire ?* On crée un `FormControl` par champ, on les rassemble dans un `FormGroup`, puis on les relie au HTML avec `[formGroup]` et `formControlName`.
- *Comment Angular valide-t-il avant l'envoi ?* Chaque contrôle applique ses `Validators` à chaque modification ; `form.valid` / `form.invalid` indique si tout est correct, et on bloque l'envoi tant que le formulaire est invalide.

---

## Prosit 3 — Reactive Forms et Signals

**Problème :** `valueChanges` et `statusChanges` sont des flux RxJS (Observables) : il faut
s'abonner, se désabonner, et ça s'intègre mal avec les signals.

**Solution :** `toSignal()` transforme ces flux en signals.

```ts
private formValue  = toSignal(this.form.valueChanges,  { initialValue: this.form.getRawValue() });
private formStatus = toSignal(this.form.statusChanges, { initialValue: this.form.status });

descriptionLength = computed(() => (this.formValue().description ?? '').length);
isValid           = computed(() => this.formStatus() === 'VALID');
```

Dans le HTML :
- compteur : `{{ descriptionLength() }} / 200 caractères`
- statut : `{{ isValid() ? 'Formulaire valide' : 'Formulaire incomplet' }}`
- bouton : `[disabled]="!isValid()"` (activé automatiquement quand tout est valide)

**Réponse :** en combinant les Reactive Forms (structure et validation) et les Signals
(lecture réactive sans abonnement manuel), on obtient un affichage en temps réel plus simple,
plus lisible et plus performant, car seules les parties qui lisent un signal sont mises à jour.

---

## Lancer le projet

```bash
npm install
ng serve        # http://localhost:4200
ng test         # tests unitaires
```
