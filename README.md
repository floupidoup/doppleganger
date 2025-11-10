# Doppleganger (site ARG - horreur)

Site statique volontairement amateur, sombre et cryptique. Idéal pour une expérience ARG légère.

Fichiers:
- `index.html` page d'accueil, mauvaise mise en page.
- `secret.html` page cachée accessible depuis le formulaire seulement.
- `styles.css` styles volontairement bricolés.
- `script.js` scripts louches et mal faits.

Pour lancer localement (Windows, cmd.exe):

```bat
python -m http.server 8000
```

Déploiement sur GitHub Pages

J'ai ajouté un workflow GitHub Actions (`.github/workflows/gh-pages.yml`) qui publie automatiquement le contenu du dépôt sur la branche `gh-pages` à chaque push sur `main` ou `master`.

Étapes pour déployer manuellement depuis Windows (cmd.exe):

```bat
cd C:\Users\Enzo\PhpstormProjects\doppleganger
:: initialiser git si nécessaire
git init
git add .
git commit -m "Initial site"
:: lier au dépôt distant (remplacez URL par votre repo)
git remote add origin https://github.com/USERNAME/REPO.git
:: pousser sur main
git branch -M main
git push -u origin main
```

Après le push, GitHub Actions s'exécutera et publiera le site sur la branche `gh-pages`. Active GitHub Pages dans les paramètres du repo si nécessaire (source: `gh-pages` branch).

Remarque: supprimez ou remplacez les images placeholder (`placeholder.png`, `whingu.png`, `corrupt.jpg`) par vos assets réels pour un rendu plus convaincant.

Licence: usage personnel et tests uniquement.
