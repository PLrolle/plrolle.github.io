# link curator — extension navigateur

Extension Chrome/Firefox pour sauvegarder des liens vers `plrolle.github.io/links`.

## Installation (Chrome / Edge)

1. Ouvrir `chrome://extensions/`
2. Activer **Mode développeur** (en haut à droite)
3. Cliquer **Charger l'extension non empaquetée**
4. Sélectionner ce dossier `browser-extension/`

## Installation (Firefox)

1. Ouvrir `about:debugging#/runtime/this-firefox`
2. Cliquer **Charger un module temporaire**
3. Sélectionner le fichier `manifest.json`

## Configuration

Au premier lancement, cliquer sur **⚙ config** et renseigner :

- **Token GitHub** : créer un token sur https://github.com/settings/tokens
  - Scope requis : `repo` (ou `contents: write` en fine-grained)
- **Repo** : `plrolle/plrolle.github.io`

## Utilisation

1. Sur n'importe quelle page web, cliquer sur l'icône de l'extension
2. Le titre et la description OpenGraph sont récupérés automatiquement
3. Modifier si nécessaire
4. Ajouter des tags (Entrée pour valider chaque tag)
5. Cliquer **+ sauvegarder**

Le lien est ajouté en tête de `_data/links.json` dans le repo,
et le site se met à jour via GitHub Pages (délai ~1 min).

## Icônes

Les icônes dans `icons/` peuvent être des PNG simples 16×16, 48×48, 128×128.
Un carré noir suffira pour tester.
