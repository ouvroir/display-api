# Display API

**display-api** est un fork personnalisé et spécialisé de
[CRAFTS](https://github.com/guiveg/crafts) (Configurable REST APIs For Triple Stores) préparé par le laboratoire l’Ouvroir d’histoire de l’art et de muséologie numériques.

## Branching

### Lignes directrices

- https://nvie.com/posts/a-successful-git-branching-model/

Prière de diriger les PR vers la branch `dev`.

### Remarques

- Les fusions sont effectuées avec l’option `--no-ff` pour conserver la topographie du projet.
- Les noms de branches sont significatifs afin que les messages de fusion soient explicites.
- Les messages de validation pour les fusions de branches sont enrichis, si nécessaire ;
  - Exemple : `Merge branch 'json-ld' into dev: intégration module de traitement des mappings JSON-LD`

Des exceptions subsistent :
certaines branches sont utilisées pour effectuer des `rebase`.
Dans ce cas, les validations  effectuées sur ces branches doivent porter un préfixe exactement équivalent au nom de la branche.

Ces branches sont les suivantes :

- `doc`

## Voir aussi

- [Dépôt original](https://github.com/guiveg/crafts)
- G. Vega-Gorgojo, "CRAFTS: Configurable REST APIs for Triple Stores," in IEEE Access, vol. 10, pp. 32426-32441, 2022, doi: 10.1109/ACCESS.2022.3160610.
  - [Get the PDF](https://ieeexplore.ieee.org/document/9737489)
