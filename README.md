# Karate Training Planner

Plan karate trainings and see how long they take. Installable web app (PWA) for iPhone – data stays on the phone.

Project description: [project.md](project.md)

## Run locally

```bash
npm install
npm run dev
```

Open the address shown in the terminal. To try it on an iPhone on the same Wi-Fi, open the **Network** address in Safari.

## Publish

Every push to `main` builds the app and publishes it to GitHub Pages:
https://mckikis.github.io/karate-training-planner-app/

On iPhone: open the address in Safari → Share → **Add to Home Screen**.

```bash
git add .
git commit -m "Slovak exercises and app texts"
git pull --no-rebase --no-edit
git push
```
