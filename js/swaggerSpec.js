const swaggerJsdoc = require('swagger-jsdoc');
const config = require('../data/config');

const options = {
	swaggerDefinition: {
		openapi: '3.0.0',
		info: {
			title: 'Display CRAFTS - Configurable RESTful APIs For Triple Stores',
			version: '1.0.0',
			license: {
				name: "CRAFTS API: Apache 2.0",
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
		]
	},
	apis: ['./js/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;