const swaggerJsdoc = require('swagger-jsdoc');
const config = require('../data/config');

const options = {
	swaggerDefinition: {
		openapi: '3.0.0',
		info: {
			title: '[Display] CRAFTS - Configurable RESTful APIs For Triple Stores',
			description: "CRAFTS est une API personnalisable pour interagir avec des données RDF stockées dans un entrepôt de triplets. Ce serveur CRAFTS est pricipalement utilisé dans le cadre du projet [Display](#), réalisé au sein du laboratoire l’[Ouvroir d’histoire de l’art et de muséologie numériques](https://ouvroir.umontreal.ca/projets/display) à l’Université de Montréal.\n\nNotes de travail consignées à cet emplacement : [https://pad.libreon.fr/WwFA7598TCi5_w9J4VTQXw#](https://pad.libreon.fr/WwFA7598TCi5_w9J4VTQXw#).\n\n**Si le jeton de lecture que vous utilisez n’est plus fonctionnel**, prière de vous adresser à [david.valentine@umontreal.ca](mailto:david.valentine@umontreal.ca).",
			version: '1.0.0',
			license: {
				name: "CRAFTS API: licence Apache 2.0",
				url: "http://www.apache.org/licenses/LICENSE-2.0",
			},
			contact: {
				name: "Ouvroir d’histoire de l’art et de muséologie numériques",
				url: "https://ouvroir.umontreal.ca",
				email: "david.valentine@umontreal.ca",
			}
		},
		servers: [
			{
				url: config.scheme + '://' + config.authority + config.prepath
			}
		],
		externalDocs: {
      "description": "https://swagger.io/specification/v3/",
      "url": "https://swagger.io/specification/v3/"
    }
	},
	apis: ['./js/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;