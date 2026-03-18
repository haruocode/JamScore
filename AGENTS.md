# AGENTS.md

## Project

JamScore

## Goal

JamScore is a collaborative web app for creating band scores.
The first MVP is intentionally small.

Build a minimal web application where users can:

1. create a simple score with:
   - vocal main melody
   - bass line
2. view the score in the browser
3. play back the score with ordinary instrument-like sounds
   - melody should use a normal synth or piano-like sound
   - bass should use a bass-like sound
4. edit notes through a simple form-based UI
5. save and restore the score locally

Do NOT implement real-time collaboration in the first MVP.
Design the code so Yjs-based collaboration can be added later.

---

## Product Constraints

### Scope for MVP

Implement only:

- vocal melody track
- bass track
- score rendering
- playback
- local persistence
- simple editing UI

Do NOT implement yet:

- authentication
- cloud database
- Yjs
- WebSocket server
- advanced piano roll
- drag and drop note editing
- lyrics
- guitar TAB
- drum notation
- PDF export
- sharing
- SEO pages

### Musical assumptions

- time signature: 4/4 only
- single tempo for entire score
- fixed key handling is not necessary in MVP
- no tuplets
- no slurs
- no ties in first version unless required for rendering
- no chord input for melody track
- bass is monophonic in MVP
- melody is monophonic in MVP

---

## Tech Stack

Use the following stack unless there is a strong reason not to:

- Next.js
- TypeScript
- Tailwind CSS
- VexFlow for score rendering
- Tone.js for playback
- Zustand only if lightweight state separation becomes necessary
- localStorage for persistence in MVP

Avoid unnecessary libraries.

---

## Architecture Guidelines

### App structure

Prefer App Router.
Use a structure similar to:

- app/
- components/
- features/score/
- lib/
- types/

### Suggested module boundaries

Create clear separation between:

1. score domain model
2. score rendering
3. playback engine
4. editing UI
5. persistence

Example:

- `types/score.ts`
- `features/score/model/`
- `features/score/rendering/`
- `features/score/playback/`
- `features/score/components/`
- `lib/storage/`

### Domain model

Use a simple and explicit domain model.

Example idea:

- Score
- Track
- Note
- Measure

Keep it serializable and easy to adapt later for Yjs.

Do not tightly couple the domain model to VexFlow types.
Do not store VexFlow objects in app state.

---

## Data Model Guidelines

Prefer plain TypeScript objects.

Example direction:

- `Score`
  - tempo
  - timeSignature
  - measures
- `Measure`
  - melodyNotes
  - bassNotes
- `Note`
  - pitch
  - duration
  - beatOffset

Pitch should be represented in a way that works for both rendering and playback.
A practical MVP option is:

- scientific pitch notation such as `C4`, `D#4`, `A2`

Duration should be normalized into a small set:

- whole
- half
- quarter
- eighth

If needed, add helper functions for:

- converting note duration to VexFlow duration
- converting note duration to Tone.js time values

---

## UI Guidelines

### MVP editor UX

Use a simple editing UI first.

Provide:

- track selector: melody or bass
- pitch selector
- duration selector
- measure selector
- beat position selector
- add note button
- delete note action
- play button
- stop button
- tempo input
- save button
- reset button

Do NOT start with direct note clicking on staff if it slows development.
Clarity and working playback are more important than sophisticated editing UX.

### Screen layout

A simple layout is preferred:

- header
- score controls
- melody staff section
- bass staff section
- note editor panel

### Styling

Keep the UI clean and minimal.
Prefer:

- soft spacing
- readable typography
- simple neutral palette
- obvious primary action buttons

Do not overdesign the MVP.

---

## Rendering Guidelines

Use VexFlow only for rendering the visible notation.

Important:

- keep rendering code isolated from editor state logic
- re-render from domain state
- avoid mixing DOM mutation logic across components
- prefer a dedicated React component for each staff

Start with:

- treble clef for melody
- bass clef for bass

If full multi-measure rendering becomes complex, begin with a small number of measures and expand carefully.

---

## Playback Guidelines

Use Tone.js for playback.

Requirements:

- melody and bass should play in sync
- playback should respect tempo
- playback should start from the beginning of the score
- stop should immediately stop transport and active notes

Preferred audio behavior:

- melody: simple synth or piano-like sound
- bass: mono synth or bass-like sound

Keep playback scheduling deterministic and easy to debug.

Do not generate singing voice or vocal synthesis.
Melody playback is only an instrumental representation of the vocal line.

---

## Persistence Guidelines

For MVP:

- save score JSON to localStorage
- restore from localStorage on load
- provide a reset-to-default sample score

Use a versioned storage key if possible.

Example:

- `jamscore:mvp:score:v1`

---

## Code Quality Rules

- Use TypeScript strictly
- Prefer small pure functions
- Prefer explicit types over implicit magic
- Avoid giant components
- Avoid deeply nested conditionals
- Avoid premature abstraction
- Write readable names
- Add comments only where the intent is not obvious

### Error handling

- guard against invalid note positions
- guard against invalid tempo
- fail safely in playback code
- do not silently swallow important runtime errors

---

## Implementation Order

When working on tasks, prefer this order:

1. set up app shell
2. define score types
3. create sample score state
4. render melody and bass staffs with VexFlow
5. add playback with Tone.js
6. add note input form
7. make UI update the score
8. add save/load with localStorage
9. refactor for clarity

Do not jump ahead to collaboration features.

---

## Future Compatibility

Design with future collaboration in mind.

This means:

- keep score state serializable
- avoid UI-only hidden state mixed into score data
- make note updates granular
- prefer immutable update patterns where practical

Later we want to add:

- login
- private scores
- Yjs collaboration
- comments
- project-based score management

So current code should remain easy to evolve.

---

## What to optimize for

Optimize for:

- fast MVP delivery
- correctness
- clean architecture
- easy future extension

Do not optimize for:

- perfect notation coverage
- advanced DAW-like editing
- enterprise-grade infra
- premature performance tuning

---

## If you are asked to implement a feature

When implementing a feature:

1. explain the plan briefly
2. inspect existing files before changing structure
3. make the smallest good change
4. keep the project runnable
5. summarize what changed and what remains

---

## If you need to choose

When multiple implementation paths are possible, prefer:

- simpler
- more explicit
- easier to debug
- easier to extend later

---

## Definition of Done for MVP

The MVP is done when:

- user can open the app
- user can see a melody staff and a bass staff
- user can add notes through a simple UI
- user can play the score
- melody and bass play together in time
- user can save and reload the score locally
- code is organized enough to add Yjs later
