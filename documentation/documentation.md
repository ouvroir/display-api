---
title: |
    Display API : document de travail
author: [David, Zoë, Emmanuel]
---
Display API : document de travail

# Généralités

## Serveur CRAFTS

CRAFTS est une API REST configurable pour interagir avec des données RDF stockées dans un entrepôt de triplets.
 
La sémantique d’un chemin reflète les opérations configurées pour une API. Par exemple, le chemin `/apis/display/resource` sert à récupérer les informations sur une ressource RDF accessible par l’API `display`.

La sémantique d’une valeur associée à un paramètre `get` (`query parameter`) reflète une interaction, configurée pour une API, avec un modèle de données. Par exemple, pour compléter la  requête `/apis/display/resource`, il faut ajouter deux paramètres `get` obligatoires :

- `id` : identifiant d’une interaction configurée dans l’API
  - exemples de valeur possible :
    - `exhibition` (sémantique du type)
- `iri` : identifiant de la ressource RDF
  - exemples de valeur possible :
    - `https://ouvroir.umontreal.ca/data/activity0000`
- `graph` : identifiant d’un graphe nommé
- donc : `/apis/display/resource?id=exhibition&iri=https://ouvroir.umontreal.ca/data/activity0000&graph=https://ouvroir.umontreal.ca/data/digital-object/{nanoID}`

## Accès

URL de l’interface Swagger :

- <https://crafts.ntnlv.ca:450/docs>

# Initialisation

Cette section formule des recommandations sur les entités et les propriétés qu’il est nécessaire de créer lors de l’intialisation d’un projet.

## Préambule

L’interprétation topologique d’une exposition prend la forme d’un ensemble de triplets stocké dans un graphe nommé ([*named graph*](https://www.w3.org/TR/rdf11-concepts/#dfn-named-graph)) à l’intérieur de notre jeu de données RDF. Chaque graphe nommé est associé formellement à une version d’exposition.

Une version d’exposition est une entité permettant

- l’identification et la description d’une interprétation topologique ;
- le référencement de l’activité d’exposition sur laquelle porte ladite version.

## Technicalités

Afin de lire ou d’écrire des informations spécifiques à une version, il faut transmettre avec la requête HTTP un IRI qui est le nom du graphe contenant les triplets associés.

L’échange d’information sur les expositions est en mode stateless, il faut donc transmettre cet IRI avec chaque requête (on introduit un nouveau `queryparam` plus bas).

La version est toujours associée à un seul graphe nommé et une seule activité d’exposition (mais une activité peut être associée à plusieurs versions).

Le lien entre les versions dans notre jeu de données et les projets dans l’application est laissé à l’entière discrétion du client.

## Formalisation

Les schémas présentés ci-dessous sont des exemples fonctionnels minimaux des entités à créer lors de l’initialisation d’un projet.

### Version

Les versions sont des entités instanciées comme membre de la classe `crm:E73_Information_Object` (aligné sur la chaîne `InformationObject`). Comme `InformationObject` est une sous-classe de `PropositionalObject`, ils utilisent le même point d’accès (abstract-work) ; à ce sujet, (voir [remarque sur la sémantique de abstract-work](#remarquesur-la-sémantique-de-abstract-work)).

#### Schema

```js
/**
 * @type {Object}
 * @property {URL} id - IRI de la version
 * @property {string} type - chaine "InformationObject"
 * @property {string} _label - A human readable label as a string
 * @property {URL} classified_as - aat:300220469, version of document
 * @property {URL | object } about - IRI ou objet de l’activité d’exposition sur laquelle porte la version (selon les cas de figures)
 * @property {object} digitally_carried_by représente le graphe nommé associé à la version
 * @property {URL} digitally_carried_by.id - IRI du graphe nommé
 * @property {string} digitally_carried_by.type - chaine "DigitalObject"
 * @property {string} digitally_carried_by._label - A human readable label as a string
 */
{
  "id": "https://ouvroir.umontreal.ca/data/version/tegqh4ow",
  "type": "InformationObject",
  "_label": "Version de travail portant sur activity/c6o5h6c4",
  "classified_as": "http://vocab.getty.edu/aat/300220469",
  "about": "https://ouvroir.umontreal.ca/data/activity/c6o5h6c4",
  "digitally_carried_by": {
    "id": "https://ouvroir.umontreal.ca/data/digital-object/tegqh4ow",
    "type": "DigitalObject",
    "_label": "The named graph containing triples of version/tegqh4ow"
  }
}
```

Remarque :

- lors de la création de la version, la valeur de `digitally_carried_by.id` doit être transmise au serveur en utilisant le query parameter **`graph`** ; par la suite, toutes les requêtes associées à cette version doivent utiliser cette valeur avec ce paramètre ;
  - exemple (non fonctionnel) : `https://crafts.ntnlv.ca:450/apis/display/resource?id=abstract-work&iri=https://ouvroir.umontreal.ca/data/version/bidonbidon&graph=https://ouvroir.umontreal.ca/data/digital-object/bidonbidon`
- l’entité `DigitalObject` qui représente le graphe nommé est instancié en même temps que la version ; il n’y a rien d’autre à faire pour l’entité `DigitalObject`.

#### Cas de figure : l’exposition n’existe pas

Lors de la création de la version, si l’exposition n’existe pas :

- La propriété `about` pour l’entité `InformationObject` est un objet (au lieu d’une URL) avec le schéma ci-dessous (l’activité d’exposition sera instanciée en même temps que la version) :

```js
/**
 * Les core properties : le trio id-type-label
 * @property {URL} about.id - IRI de l’activité d’exposition
 * @property {string} about.type - chaine "Activity"
 * @property {string} about._label - A human readable label as a string
*/
```

Remarques :

- les métadonnées détaillées sur l’activité doivent être transmises subséquemment au point d’accès pour les activités d’exposition (car en tant que valeur du champ about pour la version, seules les *core properties* peuvent être transmises) ;

Certaines métadonnées pour les activités d’exposition sont attendues, notamment la classification et la collection d’œuvres.

La requête subséquente minimale consiste donc à ajouter un terme de classification et l’ensemble des des œuvres (qui est initialement vide) à l’activité d’exposition désignée par la version :

- terme de classification : aat:300054766, Exhibiting
- collection : Set vide

```json
[
  {
    "op": "add",
    "path": "/classified_as",
    "value": "http://vocab.getty.edu/aat/300054766"
  },
  {
    "op": "add",
    "path": "/used_specific_object",
    "value": {
      "id": "https://example",
      "type": "Set",
      "_label": "Exhibits of activity/nanoID"
    }
  },
  {
    "op": "add",
    "path": "/member_of",
    "value": "https://ouvroir.umontreal.ca/data/exhibitions"
  }
]
```

#### Cas de figure : l’exposition existe

La propriété `about` pour la version reçoit simplement l’IRI de l’activité d’exposition.

Remarques :

- la liste des œuvres instanciées et liées à l’exposition peut être utilisée par la version grâce à la propriété `used_specific_object` de l’activité sur laquelle porte la version
- [pas implémenté mais possible] il existe des fonctions native en SPARQL qui permettent au backend du dupliquer efficacement et à coût minimal un graphe nommé ; par exemple en envoyant un champ booléen (purement fonctionnel, non-sémantisé) dans l’objet décrivant une version afin de déclencher la duplication ; à discuter, si on veut un vrai système de versionnement dans nos données.

# Points d’accès

## Décrire (GET)

### Une exposition

Statut : testing

@path /apis/display/resource
@method **`GET`**
@queryparam {string} **`id`** - (required) Identifiant du modèle : **`exhibition`**
@queryparam {string} **`iri`** - (required) IRI d’une exposition
@queryparam {string} **`graph`** - IRI d’un graphe nommé dont l’ensemble des nœuds contient l’IRI de l’entité décrite.

Exemple :

- https://crafts.ntnlv.ca:450/apis/display/resource?id=exhibition&iri=https://ouvroir.umontreal.ca/data/activity0000

Note :

- L’attribut `used_specific_object` (Linked Art) renvoie les ensembles exhibits utilisés dans l’exposition.
    
### Un ensemble exhibits

Statut : testing

@path /apis/display/resource
@method **`GET`**
@queryparam {string} **`id`** - (required) Identifiant du modèle : **`set`**
@queryparam {string} **`iri`** - (required) IRI d’un ensemble d’exhibits

Exemple :

- https://crafts.ntnlv.ca:450/apis/display/resource?id=set&iri=https://ouvroir.umontreal.ca/data/set0000

### Un expôt (exhibit)

Statut : testing

@path /apis/display/resource
@method **`GET`**
@queryparam {string} **`id`** - (required) Identifiant du modèle : **`exhibit`**
@queryparam {string} **`iri`** - (required) IRI d’un exhibit
@queryparam {string} **`graph`** - IRI d’un graphe nommé dont l’ensemble des nœuds contient l’IRI de l’entité décrite.

Exemples :

- exhibit0001 : exhibit typique avec :
    - **`classified_as`** Artwork+Painting
    - **`identified_by`** : appellation principale en français
        - `classified_as` Primary Name
    - description `classified_as` material statement
    - événement de production (**`produced_by`**) incluant 
        - **`timespan`** représentant une année (intervalle d’une année)
        - acteurs impliqués via **`carried_out_by`**
    -  deux dimensions
    -  https://crafts.ntnlv.ca:450/apis/display/resource?id=exhibit&iri=https://ouvroir.umontreal.ca/data/exhibit0001
- exhibit0003, exhibit0004 :
    - dans ces deux exemples, utilisation du champ **`referred_to_by`** pour exprimer deux types de déclaration au sujet de l’exhibit (pour chaque exemple) :
        - Material Statement
        - Description
- exhibit0006 :
    - dimensions :
        - deux dimensions pour la taille (H x W)
        - une dimension pour la masse
        - format : liste de trois dimensions
    - https://crafts.ntnlv.ca:450/apis/display/resource?id=exhibit&iri=https://ouvroir.umontreal.ca/data/exhibit0006
- exhibit0015 :
    - titre dans deux langues, un avec classified_as Primary Name et l’autre avec classified_as Alternate Name 
    - https://crafts.ntnlv.ca:450/apis/display/resource?id=exhibit&iri=https://ouvroir.umontreal.ca/data/exhibit0015
- element0015 : **élément scénaographique**
    - type Element
    - avec le champ classified_as et la valeur http://vocab.getty.edu/aat/300037336
    - pour élément communicationnel, utiliser http://vocab.getty.edu/aat/300220751

### Une œuvre abstraite (abstract work)

@path /apis/display/resource
@method **`GET`**
@queryparam {string} **`id`** - (required) Identifiant du modèle : **`abstract-work`**
@queryparam {string} **`iri`** - (required) IRI d’un abstract-work
@queryparam {string} **`graph`** - IRI d’un graphe nommé dont l’ensemble des nœuds contient l’IRI de l’entité décrite

#### Remarque sur la sémantique de `abstract-work`

Le sémantique du terme `abstract work` est plus près du terme anglais « work » (ouvrage ou travail) que du terme français « œuvre » qui a souvent tendance, mais pas nécessairement, à être connoté artistiquement. Il s’agit donc de travaux abstraits ou d’ouvrage abstrait, dont le sens peut être précisé par l’utilisation du mécanisme de typage par classification (propriété `classified_as`) ou par des sous-classes lorsque possible.

#### L’idée d’une œuvre d’art (ou abstract work)

PropositionalObject

- classified_as aat:300387357 (creative work)
- about [some Exhbitis]

```json
{
  "id": "http://example/an-abstract-work",
  "type": "PropositionalObject",
  "classified_as": "http://vocab.getty.edu/aat/300387357",
  "about": [
    "http://example/an-exhibit",
    "http://example/another-exhibit",
  ]
}
```

#### L’idée d’une exposition (exhibition concept)

Exhibition as an abstract work, or exhibition concept

À ma connaissance, nous n’avons pas formellement décidé de ce qu’il advenait de ce type d’entité, donc C’est consigné ici à titre informatif.

PropositionalObject

- classified_as aat:300417531 (exihibition)
- influenced (Activity classified_as aat:300054766)

```json
{
  "id": "http://example/an-exhibition-concept",
  "type": "PropositionalObject",
  "classified_as": "exhibition",
  "influenced": [
    "http://example/feux-pâles-1990",
    "http://example/feux-pâles-2014",
  ]
}
```

Remarque : propriété `influenced` only usable when value is an entity of type `Activity`.

#### Version de travail

InformationObject

- classified_as aat:300220469 (version)
- about (activity classified_as aat:300054766 exhibiting)

```json
{
  "id": "http://example/a-working-version",
  "type": "InformationObject",
  "classified_as": "http://vocab.getty.edu/aat/300220469",
  "about": "http://example/feux-pâles-1990",
  "digitally_carried_by": "http://example/a-named-graph"
}
```

Remarque :

- max 1 about
- max 1 digitally_carried_by

#### Exemples

- https://ouvroir.umontreal.ca/data/abstract-work/9lh24u72
  - lié aux exhibits suivants par le champ **`about`** :
    - https://ouvroir.umontreal.ca/data/exhibit0021
    - https://ouvroir.umontreal.ca/data/exhibit0022
- https://ouvroir.umontreal.ca/data/abstract-work/zy8b3c93
  - lié aux exhibits suivants par le champ **`about`** :
    - https://ouvroir.umontreal.ca/data/exhibit0037
    - https://ouvroir.umontreal.ca/data/exhibit0041

Dans le sens inverse, les exhibits sont liés à l’œuvre abstraite par le champ **`subject_of`**

### Un espace

Statut : testing

@path /apis/display/resource
@method **`GET`**
@queryparam {string} **`id`** - (required) Identifiant du modèle : **`space`**
@queryparam {string} **`iri`** - (required) IRI d’un espace
@queryparam {string} **`graph`** - IRI d’un graphe nommé dont l’ensemble des nœuds contient l’IRI de l’entité décrite

Exemple :

- https://crafts.ntnlv.ca:450/apis/display/resource?id=space&iri=https://ouvroir.umontreal.ca/data/space0000
- avec espaces imbriqués (`has_exhibition_space`) : https://crafts.ntnlv.ca:450/apis/display/resource?id=space&iri=https://ouvroir.umontreal.ca/data/space0001

### Une interface

Une interface est une relation modélisée comme une classe, ce qui permet de lier plus de deux entités par cette relation et d’associer diverses propriétés à cette relation (qualified relationship).

En tant que relation, l’interface est une entité abstraite (pas un exhibit) et ne dispose pas de point d’accès. En ce sens, on ne décrit pas directement une interface, mais les entités impliquées dans la relation. Il s’agit d’une entité abstraite de second plan dont l’identification n’est pas pertinente sans les entités impliquées dans la relation.

Une interface peut être créée ou modifiée en transmettant la description d’une entité exhibit ou space (modalité de la méthode PATCH).

S’il s’avère nécessaire de disposer d’un point d’accès, cela est possible, et alors les interfaces seront seulement référencées (id, type, _label) par les entités impliquées.

L’interface décrit une relation technique (non topologique) entre :

- au moins deux espaces
- au moins deux exhibits (ou element)

Dans l’ontologie Display, il existe deux types d’interface (qui sont modélisées comme des sous-classes de `bot:Interface`) :

- `display:PathwayInterface` : pour décrire le dispositif de circulation entre les espaces 
- `display:HangingInterface` : pour décrire le dispositif d’accrochage (au sens large) d’un exhibit qui est une œuvre d’art

#### Exemples

##### Circulation

space0000 dispose de deux interfaces de circulation vers d’autres espaces.

@path /apis/display/resource
@method **`GET`**
@queryparam {string} **`id`** - (required) Identifiant du modèle : **`space`**
@queryparam {string} **`iri`** - (required) IRI d’un espace
@queryparam {string} **`graph`** - IRI d’un graphe nommé dont l’ensemble des nœuds contient l’IRI de l’entité décrite

`space0000` : espace avec interfaces de circulation :

-  https://crafts.ntnlv.ca:450/apis/display/resource?id=space&iri=https://ouvroir.umontreal.ca/data/space0000
    - champ **`interface`** décrit l’interface
      - **`interface_of`** : les entités impliquées dans la relation
      - **`provided_by`** : l’entité ou les entités permettant cette relation (par ex. door ou doorway)
    - remarques :
      - space0000 est connecté à space0002, qui est un espace imbriqué dans space0001, lui même adjacent à space0000; on pourrait choisir de connecter directement space0000 et space0001, dépendamment de ce sur quoi on veut insister.
      - la référence donnée par le champ `provided_by` est un element qui peut être décrit normalement (cf. https://crafts.ntnlv.ca:450/apis/display/resource?id=exhibit&iri=https://ouvroir.umontreal.ca/data/element0058), classified_as doorway avec ses relations topologiques (à la gauche de element0004)

##### Accrochage

exhibit0001 (code-barres) dispose de d’une interface de d’accrochage avec element0004 (cloison mobile).

@path /apis/display/resource
@method **`GET`**
@queryparam {string} **`id`** - (required) Identifiant du modèle : **`exhibit`**
@queryparam {string} **`iri`** - (required) IRI d’un exhibit
@queryparam {string} **`graph`** - IRI d’un graphe nommé dont l’ensemble des nœuds contient l’IRI de l’entité décrite

`exhibit0001` : exhibit et element avec interface d’accrochage :

- https://crafts.ntnlv.ca:450/apis/display/resource?id=exhibit&iri=https://ouvroir.umontreal.ca/data/exhibit0001
    - champ **`interface`** décrit l’interface
      - **`interface_of`** : les entités impliquées dans la relation
      - **`provided_by`** : l’entité ou les entités permettant cette relation (par ex. picture rails ou hanger)
    - remarques :
      - il n’y a pas de relation topologique décrite entre exhibit0001 et element0004, seulement l’interface, mais ces relations ne sont pas exclusives, donc l’une n’empĉhe pas l’autre.
      - la référence donnée par le champ `provided_by` est un element qui peut être décrit normalement (cf. https://crafts.ntnlv.ca:450/apis/display/resource?id=exhibit&iri=https://ouvroir.umontreal.ca/data/element00060), classified_as picture rails, sans relation topologique (mais pourrait en avoir)

### Un acteur

Un acteur reçoit le "type" "Person" ou "Group".

Son IRI est constitué de la concaténation de deux éléments :

- https://ouvroir.umontreal.ca/data/actor/
- la valeur **slugifiée** du champ "_label"

Exemple d’IRI :

- https://ouvroir.umontreal.ca/data/actor/philippe-thomas

Il est possible d’utiliser le champ "equivalent" pour consigner l’IRI d’une ou de plusieurs notices d’autorité.

Remarques :

- il est essentiel que la valeur utilisé pour constituer l’IRI soit **slugifiée**
- les instances de ce type d’entité sont référencées par le champ "carried_out_by" et ne disposent pas de point d’accès.

#### Exemples

Voir le champ `carried_out_by` ou `produced_by.carried_out_by` si c’est un exhibit.

- https://ouvroir.umontreal.ca/data/activity0000
- https://ouvroir.umontreal.ca/data/exhibit0015

### Lister

#### Toutes les expositions

Statut : unstable

@path /apis/display/resource
@method **`GET`**
@queryparam {string} **`id`** - (required) Identifiant du modèle : **`set`**

Pour lister toutes les expositions disponibles, on utilise le @queryparam `id=set` avec une ressource spéciale : 

- https://ouvroir.umontreal.ca/data/exhibitions

Exemple :

- https://crafts.ntnlv.ca:450/apis/display/resource?id=set&iri=https://ouvroir.umontreal.ca/data/exhibitions


## Créer (PUT)

*Glossaire*

- ressource : le terme « ressource » est utilisé au sens RDF du terme, c’est-à-dire, dans notre contexte, une entité dont la description est structurée par les modèles que nous utilisons; autrement dit : les nœuds d’un graphe de données RDF.

### Introduction

La création des ressources utilise les mêmes points d’accès que la méthode GET, mais avec la méthode PUT

Pourquoi ne pas utiliser POST?

- POST requiert une gestion des identifiants côté serveur (il ne serait donc pas nécessaire de connaître l’IRI spécifique de la ressource préalablement à son enregistrement).
- Mais un entrepôt RDF requiert qu’une ressource soit identifiée préalablement à son insertion, même à la création : pas d’identifiant, pas de ressource, d’autant plus que nous insérons généralement des graphes à deux niveaux de profondeur à partir du point d’entrée de la description d’une ressource.
- Cela est donc équivalent à transmettre une représentation vers un IRI spécifique.

C’est PUT qui doit permettre cela (par contrainte sémantique normative).

### Fonctionnement

La méthode **PUT est utilisé pour créer ou remplacer** une ressource.

On insère des graphes de données RDF formatés en JSON-LD, conforme au modèle Linked Art, auxquels on ajoute les spécificités de Display. Un graphe est transmis dans le corps de la requête.

Le format à insérer est une version allégée du format renvoyé par la méthode GET :

- le champ `@context` **doit obligatoirement** être omis
- champs où un IRI est attendu : pour une seule valeur, celle-ci n’a pas besoin d’être incluse dans une liste, mais elle peut aussi se trouver dans une liste d’une seule valeur
- il n’est pas nécessaire de décrire certains types de ressources référencées dans le graphe, par exemple un terme de vocabulaire contrôlé ou les valeurs énumérées présentes dans la base de données;
  - seulement l’IRI suffit

### Exemple de représentation à transmettre

Exemple de représentation (avec allègements) à utiliser dans le body d’une requête PUT :

```json
{
  "id": "https://ouvroir.umontreal.ca/data/activity/kq3dqj7u",
  "type": "Activity",
  "_label": "Exposition 'Bidon-bidon' avec Nano ID",
  "classified_as": "http://vocab.getty.edu/aat/300054766",
  "identified_by": [
    {
      "id": "urn:ouvroir:display:Name:p6z8h4ju",
      "type": "Name",
      "_label": "Nom de l’exposition (Bidon-bidon)",
      "content": "Bidon-bidon",
      "classified_as": "http://vocab.getty.edu/aat/300404670",
      "language": "http://vocab.getty.edu/aat/300388306"
    }
  ],
  "referred_to_by": [
    {
      "id": "urn:ouvroir:display:LinguisticObject:dh9igi4u",
      "type": "LinguisticObject",
      "_label": "Description de l’exposition (Bidon-bidon)",
      "content": "Cette exposition est un test. Dans l’univers des expositions, il s’agit d’un test. Tout simplement.",
      "classified_as": "http://vocab.getty.edu/aat/300435416",
      "language": "http://vocab.getty.edu/aat/300388306"
    }
  ],
  "carried_out_by": [
    "http://vocab.getty.edu/ulan/500305133",
    "http://vocab.getty.edu/ulan/500096019"
  ],
  "timespan": {
    "id": "urn:ouvroir:display:TimeSpan:638ctkku",
    "type": "TimeSpan",
    "begin_of_the_begin": "2025-05-26",
    "end_of_the_end": "2025-05-27"
  }
}
```

### Implication du remplacement de ressource

Remplacer une ressrouce écrase celle-ci.

Supposons :

- une ressource A inexistante
- les opérations 1 et 2
  - effectuées séquentiellement
  - insérant respectivement chacun un graphe décrivant A

Opération 1 :

- PUT A B C . A D E . E H I .

Opération 2 :

- PUT A F G .

Le résultat de GET A sera seulement : A F G .

Conséquences :

- La description de la ressource A est écrasée (ce n’est pas un merge comme en SPARQL)
- E H I devient orphelin (isolé du graphe, donc obsolète ; mais pas un problème, peut être nettoyé périodiquement par une tâche)
- Idempotence : la répétition d’une même opération avec une même représention (requête identique) donne toujours le même résultat, et ne doit pas dépendre de ce qui se trouve dans l’entrepôt

À discuter :

- Risque d’écraser une ressource : y a-t-il des cas où il serait utile de remplacer une ressource?
  - si ce n’est pas le cas et que c’est jugé risqué, on peut mettre en place un code 400 lors d’une tentative de de requête PUT sur une ressource existante ; mais cela contrevient au principe de l’idempotence (sémantique de PUT), car requête identique avec effet différent pas (très grave)
  - dans ce cas, le remplacement pourrait toujours s’effectuer explicitement par une requête DELETE suivie de PUT
- Un cas à considérer : PUT A B C . C D E suivi de PUT C F G :
  PUT C F G va écraser C D E .

Remarque sur protocole SPARQL Query :

- L’insertion de deux graphes décrivant une même ressource, mais qui ne sont pas sémantiquement équivalents, est traité comme une fusion (merge) des graphes
- La méthode PUT de l'API contourne se comportement et écrase la description d’une ressource

### Implications de l’insertion de graphes RDF

Tous les nœuds du graphe à insérer doivent être identifiés explicitement. Par exemple :

- identifer la ressource decrite selon le modèle d’IRI suivant :
  - `https://ouvroir.umontreal.ca/data/{type}/{nanoId}`
- identifier les ressources dépendantes (exemple : le nom d’un exhibit est un nœud avec sa propre description) :
  - normalement, ce sont des blank nodes (RDF), mais ceux-ci compliquent beaucoup le traitement des données par l’API et ralentissent le calcul des inférences
  - solution : leur attribuer des identifiants selon l’un des modèles d’IRI suivant :
    - `urn:uuid:{uuid}`
    - ou utiliser une option plus significative comme `urn:ouvroir:display:Name:{nanoId}`
    - N.B. : pour le principe, ce n’est pas vraiment différent d’un blank node dans un entrepôt RDF : nous utiliserons simplement un identifiant utilisant la contrainte de forme de l’IRI

Résumé en deux points :

- Une URL identifie une ressource principale dont la représentation peut être manipulée à travers un point d’accès
- Un URN remplace l’identifiant de nœud anonyme (blank node) pour les ressources dont la représentation n’est accessible qu’à travers une ressource pricipale (nœud dépendant)

## Modifier (PATCH)

La modification des ressources utilise les mêmes points d’accès que la méthode GET, mais avec la méthode PATCH

L’API implémente une version limitée du standard RFC 6902 (JSON Patch) :

- https://datatracker.ietf.org/doc/html/rfc6902/
- https://jsonpatch.com

“JSON Patch is a format for describing changes to a JSON document.”

### Format

Une liste d’opérations à effectuer (chaque opération est un objet json) :

```json
[
  { "op": "replace", "path": "/baz", "value": "boo" },
  { "op": "add", "path": "/hello", "value": ["world"] },
  { "op": "remove", "path": "/foo" }
]
```

### Implémentation

**Champ `op` :** spécifier l’opération ; valeurs possibles :

- add
- replace
- remove

**Champ `path` :** spécifier le champ d’API à modifier :

- commence obligatoirement par `/` (racine de l’objet)
- suivi du nom du champ à modifier dans l’API

On peut accéder à l’item d’une liste en utilisant son indice (`/baz/0`), ou pousser dans une liste en utilisant un l’indice générique `-` (`/baz/-`).

N.B. : l’API implémente un maximum de deux token dans le chemin ; le deuxième token peut être :

- un indice numérique ou générique
- ou le nom d’un champ de deuxième niveau; peu fréquent (mais possible) puisque la plupart des valeurs sont dans des listes

**Champ `value` :** valeur à ajouter ou valeur de remplacement

- en cas de remplacement
  - si liste ou objet, on fournit la liste ou l’objet intégralement
  - si liste, on peut accéder à un item en utilisant son indice avec le champ `path`
    - exemple : `"path": "/identified_by/0"`

N.B. : le champ `value` est invalide avec l’opération `remove` (code 400).

### Exemples

Toujours mêmes points d’accès : la ressource à modifier est indiquée par le “query parameter” `iri`, et le point d’accès par `id` :

`http://localhost:8888/apis/display/resource?id=exhibit&iri=https://ouvroir.umontreal.ca/data/exhibit/phm4ft2r`

#### PATCH replace `/_label`

- [x] Champ de type string : remplace sans dupliquer.

Exemple :

```json
[
  { "op": "replace",
    "path": "/_label",
    "value": "test PATCH replace"
  }
]
```

#### PATCH replace `/classified_as/0`

- [X] Replace le type à l’indice 0

Exemple :

```json
[
  { "op": "replace",
    "path": "/classified_as/0",
    "value": "http://vocab.getty.edu/aat/300054766"
  }
]
```

#### PATCH replace `/identified_by`

Pour remplacer l’intégralité de la valeur du champ `identified_by`, on insère la liste d’objet avec de nouveaux identifiants.

```json
[
  {
    "op": "replace",
    "path": "/identified_by",
    "value": [
      {
        "id": "urn:ouvroir:display:Name:c2jinicq",
        "type": "Name",
        "content": "Test pour Ouvroir",
        "classified_as": "http://vocab.getty.edu/aat/300404670",
        "language": "http://vocab.getty.edu/aat/300388306"
      },
      {
        "id": "urn:ouvroir:display:Name:hq3kbp6i",
        "type": "Name",
        "content": "For Ouvroir",
        "classified_as": "http://vocab.getty.edu/aat/300404670",
        "language": "http://vocab.getty.edu/aat/300388277"
      }
    ]
  }
]
```

#### PATCH remove `/carried_out_by/0`

- [X] Supprime à l’index 0

Exemple :

```json

[
  { "op": "remove",
    "path": "/carried_out_by/0"
  }
]
```

#### PATCH add `/carried_out_by`

Exemple :

```json
[
  { "op": "add",
    "path": "/carried_out_by",
    "value": "http://vocab.getty.edu/ulan/500305133"
  }
]
```

Remarque : on peut mettre un array dans le champ "value" afin d'insérer plusieurs valeurs.

Attention, effet indésirable : remplace l’array par un array avec la valeur de "value". Autrement dit, l’opération `add` sans indice pour la valeur de `path` et sur un champ déjà populé écrase ce champ. Voir l’exemple suivant pour workaround raisonnable.

#### PATCH add `/carried_out_by/-`

Si le champ existe et que l’on souhaite ajouter une valeur, utiliser le tiret comme indice générique pour ajouter (append) la valeur à la fin de la liste (comme un `Array.push()` [mais l’ordre n’est pas garanti en lecture, étant donné que l’API renvoie des graphes au format JSON-LD]) :

Exemple :

```json
[
  { "op": "add",
    "path": "/carried_out_by/-",
    "value": "http://vocab.getty.edu/ulan/500305133"
  }
]
```

### Problèmes connus

#### Champs à un seul objet (ex timespan)

À clarifier

Pour les champs à un seul objet (exemple timespan) : si opération `add` et que le champ existe déjà, renverra toujours le premier de liste (mais enregistré dans l'entrepôt) (**ce cas est avec ou sans `-`?)**

#### Duplication des littéraux

Si `replace` un champ de type objet (car limite de deux tokens), que ce soit directement, en passant par un indice de liste ou en insérant une liste d’objet, alors les littéraux sont dupliqués (merge)

Mais devrait se comporter comme PUT.

- Solution possible : toujours effectuer `replace` avec de nouveaux identifiants.

## Exemples : mise à jour des relations

Cas de figure :

- relations entre exhibits
- relations entre les exhibits et les espaces
- relations entre espaces
- métadonnées

### Relations entre exhibits

#### Ajouter une relation entre exhibits

Supposons :

- exhibit A préalablement enregistré
- salle 1 liée à exhibit A par la propriété `display:containsExhibit`

Ajout d’une relation topologique à A avec la méthode PATCH :

URL:

http://localhost:8888/apis/display/resource?id=exhibit&iri=A

body:

```json
[
  {
    "op": "add",
    "path": "/faces",
    "value": "B"
  }
]
```

Résulat :

- A display:faces B
- B display:faces A
- B rdf:type display:Exhibit
- salle 1 display:hasExhibit B (à confirmer)

Remarque : si A utilise déjà le champ `faces`, celui-ci sera écrasé ; pour éviter ce comportement, utiliser le chemin `/faces/-` pour insérer la valeur dans la liste :

- si le champ est déjà utilisé, la valeur sera insérée dans la liste des valeurs
- si le champ n’est pas déjà utilisé, l’API renvoie un code 400 (car il s’agit d’une tentative de push dans une liste inexistante) ; recommencer avec le chemin `/faces`(sans danger d’écrasement)

Il est possible d’être plus explicite si on souhaite ajouter des éléments descriptifs sur l’objet représenté par la valeur insérée.
Par exemple, pour instancier l’objet dans la classe `display:Element` et lui ajouter un `rdfs:label` :

```json
[
  {
    "op": "add",
    "path": "/faces/-",
    "value": {
      "id": "urn:bidon:UnAutreElement",
      "type": "Element",
      "_label": "Un label, etc."
    }
  }
]
```

Autrement dit, la valeur du champ "value" peut prendre la forme d’un graphe de données (JSON-LD) décrivant la ressource avec les “core properties” (id, type, _label).

### Relations entre les exhibits et les espaces

#### Ajouter une relation entre espace et exhibit

Ajout d’une relation entre un espace et un exhibit avec la méthode PATCH :

```json
[
  {
    "op": "add",
    "path": "/contains_exhibit",
    "value": "urn:test1"
  }
]
```

#### Problème connu

L’API ne peut pas traiter en écriture les champs qui utilisent des chemins de propriétés complexes dans les requêtes SPARQL effectuées en arrière-plan.

- Solution probable : définir des propriétés directes pour ces champs spécifiquement pour les requêtes en écriture ; confirmer aussi le bon fonctionnement avec la méthode **`PUT`**. 

# Suivi 2025-09-04

Rencontre avec Zoë et Emmanuel

Fait pour application :

- nettoyage interface, interface revue et corrigée par Tractr
- à la recherche d'utilisateurs pour tester

## Version d’exposition

[Remarque : cette section sert à consigner des notes de rencontre (pas de la documentation)]

- par exemple, comparer deux versions de salles
- Emmanuel proposose : graphe nommé comme "display" de haut niveau chez nous, sans les alertes d'incohérences
- donc graphe nommé, circonscrire les alertes au niveau de l'exposition, utilisant un mécanisme interne, Glenn et app n'ont pas à s'en rendre compte

Donc, conceptuellement, "display" de haut niveau, pour comparer différents exhibits dans différentes configurations de salles, donc comparer des hypothèse.

Remarque : acteullement, les exhibits sont ressemblé au niveau d’un `la:Set` utilisé par l’événement de type exhibition. Mais conceptuellement, nous voulons rassembler des triplets.

### Solutions potentielles

**graphes nommés :**

- problématique, car nous utilisons des graphes nommés pour comparer les ensembles de  triplets enregistrés (sans inférence) avec les triplets caclulés (avec inférence)
- cumbersome : il faudrait créer dynamiquement des graphes nommés imbriqués systématiquement dans les deux graphes nommés
- la configuration des moteurs d’inférences avec les graphes només est :
  - statique (demande redémarrage serveur pour être effectif)
  - cumbersome (lourd)
- usage découragé par les bonnes pratiques deopuis RDF-Star
- **verdict : très réticent**

---

**classe `display:Display`**

- permet d’inclure des exhibits, et le display peut lui-même être situé dans l’espace
- pas conçu conceptuellement pour inclure des déclarations (besoin exprimé) ; ces déclarations ne sont pas des exhibits
- **verdict : très réticent**

---

**classe `la:Set`**

- sémantiquement, un ensemble d’objets physiques ou conceptuels
- donc définit les objet du Set comme étant une entité CIDOC
- exigera l’utilisation de `P2_has_type` pour discrimer parmi d’autre sortes de Set
- **verdict : plutôt réticent à court terme, à moins d’utilisation d’un profil d’application approprié**

---

**annotations de triplets** (RDF-Star, bientôt RDF 1.2)

- solution idéale, requêtage efficace, dans le standard
- **verdict : très favorable**
- remarque : **exige de hacker l'API** : l’application doit transmettre à l’API un identifiant de version, nous devrons inclure un paramètre dans l’URL, puis gérer les requêtes effectuées en arrière-plan ; faisabilité à évaluer en lien avec le temps restant
- remarque : lecture et écriture à re-tester
- remarque : demande quelques classes/propriété supplémentaire ; mini-ontologie fonctionnelle pour documenter?

## Œuvres en plusieurs parties

Ainsi discuté :

- traiter comme type diférents d’entité : les exhibits (objets physique CIDOC E22) sont distincts des œuvres (objets propositionnels E89)
- puis les exhibits qui composent l’œuvre sont liés formellement à l’œuvre par le propriété appropriée

Solution parmi les propositions de LA :

- E89 Propositional Object P129 is about (is subject of) E1 CRM Entity

qui sera mappé sur ces champs dans l’API (extrait du @context) :

```json
{
  "about": {
    "@id": "crm:P129_is_about",
    "@type": "@id",
    "@container": "@set"
  },
  "subject_of": {
    "@id": "crm:P129i_is_subject_of",
    "@type": "@id",
    "@container": "@set"
  }
}
```

Un problème :

- où consigne-t-on les métadonnées, pour demeurer consistant? Actuellement, c’est consigné au niveau de l’objet physique
- probablement minimal au niveau de l’objet propositionnel pour demeurer cohérent avec l’approche spatiale/physique

Une remarque :

- événement de production pour E22 et événement de création pour E89
- dans le modèle de LA, les objects physiques en plusieurs parties réfèrent à un objet **physique** principal

## Noms des auteurs/créateurs :

- proposition de emmanuel, carried out sans id? réticence
- non, un id généré à partir des informations, même forme que id des exhibits, avec la finale qui utilise la chaine de carctères du nom

## Termes AAT

- termes, on descend, on fait une liste, extensionner LA si nécessaire
- en attendant il y a des exemples sommaires pour l’app fournis à Glenn
- pour nous y retrouver actuellement, je recommande de consulter https://vocab.ntnlv.ca:450/dist/en/ qui documente les termes actuellement utilisés par Display et les termes qui s’inscrivent comme extensions de LA.

## Suivi technique à effectuer

- **pointer des exemples avec les interfaces**
- **pointer des exemples de relation entre les espaces** (topologique ou interface)
- + autre exemples utilent découlant des remaruqes ci-dessus

## Notes

- Je reviens avec évaluation plus précise de la connexion entre app et API
- Et aussi évaluation plus précise du temps nécessaire et de la faisabilité
- georges macdonald, la vision du musée comme service d'information, repositoinnement de la mission muséale

# Suivi 2025-05-06

Suivi effectué à la suite de la rencontre entre l’Ouvroir (Emmanuel et David) et Tractr (Pierre et Glenn).

Lors de cette rencontre, il a été **notamment convenu que l’API fournie par l’Ouvroir allait se conformer au modèle de Linked Art**. Linked Art propose un schéma JSON-LD permettant une correspondance (mapping) avec un *application profile* de l’ontologie CIDOC-CRM.

Le modèle de Display vient s’y greffer. Ainsi, le modèle de Linked Art est utilisé pour structurer les métadonnées rudimentaires sur les objets utilisés dans une exposition, tandis que le modèle Display est utulisé pour décrire la topologie abstraite de l’exposition.

Éléments du suivi :

- **Réponses HTTP :** il y a une réponse à tous les éléments discutés avec Tractr, y compris pour les ressources inexistantes (404) ou utilisation d’IRI d’un certain type avec de mauvais points d’accès (400)
- **Linked Art :** la sortie d’API (GET) « conforme » avec Linked Art pour la section CIDOC (pour les métadonnées)
  - remarque : Linked Art ne supporte que la méthode GET : https://linked.art/api/1.0/protocol/#operations
  - remarque : nous suivons les principes de JSON-LD et de Linked Art, mais nous ne serons jamais conforme à LA puisque nous présentons les classes de Display dans la sortie; ~~nous pourrions faire autrement, par exemple se coller davantage sur LA et faire apparaitre display seulement pour les propriétés topologiques,~~ (c’est ce que nous faisons...) ce qui pourrait aussi simplifier le fichier de contexte, et nous aider dans la cohérence des points d’accès, à discuter
- **@context :** ajout de attribut `@context` (seulement pour Linked Art pour l’instant, il faudra penser à l’adapter)
- **Nœuds vides :** nœuds vides (anonymes) éliminés, car ça posait toutes sortes de problèmes (qui ont ralenti les travaux), et pour CRAFTS et pour la gestion des inférences, puisque la logique du modèle de données repose beaucoup sur les chemins de propriété (à cause de CIDOC) et du merge CIDOC/Display ; donc toute ressource est dorénavant identifiée explicitement, mais nous allons utiliser des URN ~~dans l’espace de nom uuid, ex. urn:uuid:valeur,~~ (voir exemples : `urn:ouvroir:display:Name:1a2b3c4d`) pour les nœuds qu’il n’est pas pertinent d’atteindre directement depuis un point d’accès
- **Écriture** : voir les détails en supra : [créer, modifier](#Créer). En infra, notes de travail initiales :
    - **méthode `PUT` (create or replace) :**
        - ça fonctionne bien, utilise la même forme que le retour de GET; ici JSON-LD est vraiment intéresant, car la forme du graphe permet de créer bien plus qu'une simple ressource, en effet logiquement une ressource est crée pour chaque nœud du graphe avec les inférences attendues, exemple PUT A left_of B crée {A a Exhibit;left_of B. B a Exhibit; right_of A} ; autrement dit, il apparait plus juste de dire qu'on crée des triplets plutôt que simplement des ressources
        - écueil potentiel : que se passe-t-il si on crée une ressource, donc un graphe, utilisant des ressources déjà existantes? Plusieurs hypothèses à confirmer/infirmer
        - Cependant : PUT est idempotent, donc la requête doit fournir les IRI et avoir toujours le même effet si répétée
        - si on insère la propriété B pour la ressource A qui existe préalablement avec les propriétés B et C? On veut avoir A avec prop B et C, mais PUT devrait produire A avec prop B en supprimant C (écrase le graphe)... Le remplacement partiel (donc un merge) serait  non standard en approche REST (en arrière-plan, entre API et serveur SPARQL, c'est POST... donc merge...)
        - les inférences du serveur sont hors du contrôle du client, seuls les triplets explicitement soumis sont conidérés pour l’idempotence
    - **méthode `PATCH` (Update a resource) :**
        - utilise la spécification JSON Patch
        - PUT et PATCH, assez facile d'utilisation, notamment avec les use cases de Linked Art; par contre l'API doit être obligatoirement configurée pour gérer les propriétés utilisées, donc on ne peut pas dire n’importe quoi comme on ferait directement avec SPARQL; donc on peut dire n’importe quoi seuelement à l’intérieur du vocabulaire configuré dans l’API
    - **méthode `DELETE` :** comme `PUT` (replace) est un `delete` suivi d'un `insert`, je n'anticipe pas trop de problème

# Remarques et notes techniques

## Réponses de l’API

- **@todo** Lors de la création de ressource, il peut être utile de retourner l’IRI de la ressource créée
    - Peut être géré par l’API
    - Remarque : l’IRI doit exister avant la requête, donc il sera connu.
- **@todo** Aussi, renvoyer le graphe des relations inférées
    - solution partiellement implémentée localement

## Évolutions à apporter au modèle de données

- ajouter les sources : DC qualifié dc:title, dc:description, dc:source, dc:creation + qualificateur, dc:type + qualificateur

## Remarques sur les IRI

2025-06-12

Gestion sémantique des IRI?

- Stratégie actuelle :
  - IRI unique par ressource avec instanciation multiple
- Stratégie possible si l’on souhaite distinguer clairement les identités :
  - IRI canonique (un "record" ou méta-entité en relation avec les ressources typées)
  - IRI pour type CIDOC (métadonnées)
  - IRI pour type display (topologie)
  - implication API :
      - les identités sont confondues à travers l’API pour créer une représentation utile et LOUD (une seule requête, toutes les infos utiles ; c’est le focntionnement actuel)
      - mais les IRI (éventullement) déréférençables (URL) renvoient des représentations distinctes (ou alors on ajoute des fragments à l’IRI canonique pour faire cette distinction)

La description des entités s’exprime selon deux conceptualisations (cidoc, Display), qui peuvent être matérialisées

- soit par l’instanciation multiple (approche actuelle)
- soit par des instanciations distinctes liées par une entité canonique

# Notes obsolètes

## Doc legacy

### Configuration

Dans l’application CRAFTS, les API sont configurées avec des documents structurés au format JSON.

Le schéma de configuration est dispobible ici : <https://crafts.ntnlv.ca:450/docs/#/api/getApi>.

En particulier, les deux champs suivants contiennent des `array` d’objets JSON permettant de configurer des opérations sur les ressources RDF :

- `model` : contient les `model element` pour les opérations sur une ressource RDF
    - chemin `/apis/{apiId}/resource`
    - réponse : format JSON (configurable)
    - possibilité d’imbriquer des descriptions (autrement dit, on peut suivre des chemins de propriété et se balader dans le graphe à partir de la ressource d’entrée)
- `queryTemplate` : contient les `query template element` (gabarits de requête SPARQL sur mesure avec la clause `SELECT`), avec toute la complexité nécessaire et la possibilité de faire du templating pour injecter dans les requêtes SPARQL des valeurs passées par `get`
    - chemin `/apis/{apiId}/query`
    - réponse : format JSON SPARQL 1.1 Query Results conforme au standard, auquel s’ajoute la requête SPARQL
    - possibilité de faire du templating pour injecter dans les requêtes SPARQL des valeurs passées par `get` (obligatoires ou facultatives) à partir de l’API

### Documentation

La documentation pour le seveur CRAFTS est pricipalement basée sur un article et sur des exemples :

- Article : G. Vega-Gorgojo, "CRAFTS: Configurable REST APIs for Triple Stores," in IEEE Access, vol. 10, pp. 32426-32441, 2022, doi: 10.1109/ACCESS.2022.3160610.
- Exemples de configuration :
    - <https://crafts.gsic.uva.es/CRAFTSconfig101.html> (il est possible de se créer un compte pour tester les exemples)
    - https://crafts.gsic.uva.es/CRAFTSaccess101.pdf

Beaucoup de commentaires dans le code source.

Info : CRAFTS is available under an Apache 2.0 license. Please send us an email to [guiveg@tel.uva.es](mailto:guiveg@tel.uva.es) if you use or plan to use CRAFTS. Drop us also a message if you have comments or suggestions for improvement.

### Point d’accès

Note interne : pour définir les endpoints côté SPARQL (sur lesquels CRAFTS lui-même effectue les requêtses), la spécification d’un graphe est obligatoire, même pour le graphe par défaut. Le graphe par défaut dans Fuseki est `urn:x-arq:DefaultGraph`.

```json
{"endpoints":[{"graphURI": "urn:x-arq:DefaultGraph"}]}
```

## Décrire

### Tous les exhibits

Statut : brouillon, **obsolète?**

Ambigu : y a-t-il vraiment un scénario où l’on voudrait lister tous les exhibits en utilisant l’interface web?

Donc tous les exhibits de la base de donnée parmi toutes les expositions?

C’est possible, mais est-ce utile dans le contexte de l’application Display?

Précision suggérée :

- tous les exhibits, d’une exposition comme concept (a E...)
  - soulève enjeux : traitement des relations topologiques entre les exhibits (display ontology v0.2) :
    - le triplet est (instanciation multiple)
      - une instance d’une déclaration effectuée dans le cadre d’un travail d’interprétation historique (RDF*)
      - une instance de relation topologique (RDF*)
    - associer la relation topologique à une instance d’exposition
- tous les exhibits, d’une instance d’exposition

## Suivi 2025-03-12

- générer spécification? xqdoc?
- graphe nommé pour lier les entités des données RDF avec les projets ou les utilisateurs
- tirer partie de l'onto, gain pour utilisateur

## Données : généralités

Le résultat d’une requête est un tableau, résultat standard d’une requête SPARQL avec `SELECT`.

Le gabarit d’une requête est défini dans un array (donc plusieurs gabarits possibles) qui est valeur du membre `queryTemplate` de la configuration d’une API.

Peut-on renvoyer des réponses structurées en JSON?
Ça dépend.
Avec le membre `model`, on construit l’objet JSON décrivant une ressource.
Avec le membre `queryTemplate`, on peut produire du contenu structuré avec SPARQL (par exemple la clause `CONSTRUCT`).

## Génération des identifiants

IRI minting. Options :

- https://github.com/ai/nanoid/
- générateur uuid, donc urn:uuid
- existe-il quelque chose par défaut dans jena
  - peut-être par l’interface de programmation (mais il n’est pas prévu de développer en Java)
  - pas pour Fuseki en tout cas : logiquement, l’IRI doit préexister à toute requête INSERT
    - donc cela devra être effectué dans une étape préalable à l’opération INSERT ou `put` (peu importe dans quel environnement : la requête SPARQL doit recevoir une IRI pour procéder)