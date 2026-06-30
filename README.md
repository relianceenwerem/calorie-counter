# Calorie Tracker 🍎

A simple, mobile-first daily calorie tracker. Log food under Breakfast, Lunch,
Snack, and Dinner, watch a live progress bar against your daily target, and look
back at previous days. All data is stored locally in your browser — no account,
no backend.

## Features

- **Daily target** (default **1,200 kcal**, editable in Settings)
- **Four meal categories** with icons and per-category subtotals
- **Live total + progress bar** — green under target, red when over, with a
  "kcal remaining / over" readout
- **Per-day storage** — each day is saved separately so you can swipe back
  through history
- **History view** — bar chart of the last 30 days, color-coded under vs. over
  target; tap any day to open it
- **Delete entries** individually or **Clear day**
- **Quick-add** — save a food + calorie combo (tap the ★) for one-tap re-adding
- **CSV export** of all your data
- Works great added to a phone home screen

## Tech stack

- [React](https://react.dev/) + [Vite](https://vite.dev/)
- `localStorage` for persistence (no backend)
- Single-page app, no router

## Run locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173/calorie-counter/).

To build and preview the production bundle:

```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages

This project is preconfigured for GitHub Pages via the
[`gh-pages`](https://www.npmjs.com/package/gh-pages) package.

1. Make sure `base` in `vite.config.js` matches your repo name. It is set to
   `'/calorie-counter/'`. If you rename the repo, update it.
2. Publish:

   ```bash
   npm run deploy
   ```

   This builds the app and pushes the contents of `dist/` to the `gh-pages`
   branch.
3. In your repo on GitHub, go to **Settings → Pages**, set **Source** to
   **Deploy from a branch**, choose the **`gh-pages`** branch and the **`/ (root)`**
   folder, and save.

Your live site will be at:

```
https://<your-username>.github.io/calorie-counter/
```

### Deploy updates

After making changes, just run:

```bash
npm run deploy
```
