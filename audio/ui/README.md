# UI sound files — drop your WAVs here

The engine (`js/audio-engine.js` → `window.SonicPalette`) loads WAV files **by
filename**. Just place correctly-named `.wav` files in this folder and they play
automatically. No code changes needed. A missing file is silent (no error), so
the site works before you add anything and lights up as you add files.

## File format (recommended)

WAV PCM · **48 kHz · 16-bit · mono** · trimmed · 2–5 ms fades in/out · peak ≈ −3 dBFS.
(Short UI one-shots are tiny as WAV; no need to compress.)

## Naming convention

```
hover boton <section>.wav      → plays when the pointer enters that menu item
click menu <section>.wav       → plays when that menu item is pressed
```

`<section>` is one of these five (spaces and lowercase, exactly):

| Menu item        | `<section>`     |
|------------------|-----------------|
| about            | `about`         |
| art direction    | `art direction` |
| photography      | `photography`   |
| illustration     | `illustration`  |
| contact          | `contact`       |

### The exact 10 filenames the engine looks for

Hover:
- `hover boton about.wav`
- `hover boton art direction.wav`
- `hover boton photography.wav`
- `hover boton illustration.wav`
- `hover boton contact.wav`

Click:
- `click menu about.wav`
- `click menu art direction.wav`
- `click menu photography.wav`
- `click menu illustration.wav`
- `click menu contact.wav`

> You don't have to add all ten. Add what you have; the rest stay silent.
> To rename the pattern (e.g. use hyphens, or Spanish tokens), edit `FILE_FOR()`
> and the `SECTION` map at the top of `js/audio-engine.js`.

## Testing / debugging

Open the site with `?audiodebug` in the URL (e.g.
`http://localhost:8777/index.html?audiodebug`) to show an on-screen HUD with:
- whether the AudioContext is `running` (needs one click to unlock — browser policy),
- how many files loaded vs missing (404),
- the last file played.

You can also call `SonicPalette.debug()` from the console at any time.

## Notes
- **One click anywhere is required first** to unlock audio (browser autoplay policy).
- The 🔊 button in the nav mutes/unmutes and remembers your choice.
- Files play through a master limiter, so overlapping sounds can't clip.
- To add sounds for other elements later (section transitions, contact form,
  etc.), call `SonicPalette.play('<filename without .wav>')` from anywhere.
