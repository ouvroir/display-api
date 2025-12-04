const fetch = require('node-fetch');
const digestFetch = require('digest-fetch')
const mustache = require('mustache');
const logger = require('./logger'); // para el logging


async function queryEndpoint(endpoint, querytemp, pars, qinfo, graph) {
	// preparo consulta

  // if (endpoint.graphURI != undefined) {
  //   // pdata["default-graph-uri"] = endpoint.graphURI;
  //   pars.fromDefault = `<${endpoint.graphURI}>`;
  // }
  // if (graph != undefined && endpoint.id == '/display-reasoner') {
  //   // pdata["default-graph-uri"] = graph;
  //   pars.fromDefault = `<${graph}>`;
  // } else if (graph != undefined && endpoint.id != '/display-reasoner') {
  //   pars.fromDefault = `<${graph}>`;
  //   pars.union = `<${endpoint.metadataGraphURI}>`;
  // } else {
  //   pars.union = `<${endpoint.metadataGraphURI}>`;
  // }
  // if (endpoint.checkReasoner) {
  //   // pdata["default-graph-uri"] = graph;
  //   pars.fromDefault = `<${endpoint.graphURI}>`;
  // } 

let from;
let union = endpoint.metadataGraphURI;

if (endpoint.checkReasoner) {

  // TODO mettre les <> dans le template pour éviter de traiter des chaînes ici
  from = `<${endpoint.graphURI}>`;

} else if (graph !== undefined) {

  from = (endpoint.id === '/skosmos/sparql')
    ? `<${endpoint.graphURI}>`
    : `<${graph}>`;

  if (endpoint.id === '/display-reasoner') {
    union = undefined;
  }

} else if (endpoint.graphURI !== undefined) {

  from = `<${endpoint.graphURI}>`;

}

// error handling if from === undefined 400 ou 500
pars.fromDefault = from;
if (union) pars.union = union;

	// substitute parameters with mustache	
	let	query = mustache.render(querytemp, pars);
	// preparo los prefijos
	query = includePrefixes(query);

	// preparo URL de la consulta
	let pdata = {};
	pdata.query = query;
	pdata.format = 'application/sparql-results+json';
	const params = new URLSearchParams(pdata);
	const url = endpoint.sparqlURI + '?' + params.toString();
	
	// preparo opciones de la consulta (método HTTP)
	let options = {};
	options.method = endpoint.httpMethod == undefined? "GET" : endpoint.httpMethod;

  // Fuseki needs a request body when using POST method
  if (options.method == "POST") {
    options.headers = {
      // https://jena.apache.org/documentation/fuseki2/fuseki-config-endpoint.html#dispatch
      // An update is a POST where the body is “application/sparql-update” or an HTML form with field “update=”.
      // note: avoid adding update= in the body
      "Content-Type": "application/sparql-update"
    };
    options.body = query;
  }

  // icicializo respuesta (utilizaré fetch para obtener los resultados de la consulta	)
	let response = null;
	// preparo autorización si hace falta
	if (endpoint.authInfo != undefined) {
		let authops = {};
		if (endpoint.authInfo.type === "basic")
			authops.basic = true;
		const client = new digestFetch(endpoint.authInfo.user, endpoint.authInfo.password, authops);
		response = await client.fetch(url, options); // fetch con autorización
	}
	else // sin autorización
		response = await fetch(url, options); // fetch sin autorización
	if (response.ok) { // if HTTP-status is 200-299
		// la consulta fue bien, hago logging
		let logmes = {};
		logmes.reqId = qinfo.quuid;
		logmes.apiId = qinfo.apiId;
		logmes.endpoint = endpoint.id;
		logmes.query = query;
		logmes.result = 'success';
		logger.debug(logmes);

    let json, text;

    if (options.method == "POST") {
      // POST with Fuseki doesn't return JSON so we define it
      json = {};
      text = await response.text(); // nothing here (empty string: ???)
    } else {
      // get the response body and return it
      json = await response.json();
    }
		// incluyo la consulta
		json.query = query;
    json.text = text; // undefined (GET) ou empty string (POST)

		return Promise.resolve(json);			
	} else {
		// lanzo error
		let mens = 'HTTP error of the endpoint "' + endpoint.id + '" - code: '
			+ response.status + ' - query:\n' + query;
		let error = new Error(mens);
		error.code = response.status;
		throw error;
	}
}


function includePrefixes(query) {
	// inicializo cadena con los prefijos
	let cadprefs = '';
	// inicializo objetos con los namespaces e iris incluidos
	let objns = {};
	let objiris = {};
	// obtengo iris de la consulta
	const regiris = /<[^<>]+>/g; // cuidado, incluye el < > (y es bueno que lo incluya para los reemplazos)
	let iris = query.match(regiris);
	if (iris != null) { // será null si no encuentra nada
		// inicializo índice para los prefijos
		let nsind = 0;
		// analizo cada iri (con <>)
		for (let i=0; i<iris.length; i++) {
			const iri = iris[i];
			// 2021-03-24 no proceso reemplazos si incluye un & (falla Virtuoso en tal caso)
			if (!iri.includes("&") && !iri.includes(",") && !iri.includes("(") && !iri.includes(")") 
					&& iri.indexOf(":")==iri.lastIndexOf(":")) { // 2021-05-27 para no procesar IRIs con ":" varias veces
				// compruebo que no haya procesado ya esta iri
				if (objiris[iri] == undefined) {
					// guardo la iri
					objiris[iri] = true;
					// obtengo el índice del último '/' o '#' para preparar la cadena del reemplazo
					let indfin = Math.max( iri.lastIndexOf('/'), iri.lastIndexOf('#') );
					if (indfin > 8) { // si no se encontró (-1, muy raro) o si la la cadena a sustituir es muy corta, no se hace
						// extraigo namespace
						const ns = iri.substring(1, indfin + 1);
						// obtengo prefijo (comprobando si hace falta uno nuevo)
						let pref = objns[ns];
						if (pref == undefined) { // meto un prefijo nuevo
							pref = 'n' + nsind;
							// incremento índice
							nsind++;
							// guardo prefijo
							objns[ns] = pref;
							// actualizo cadprefs
							cadprefs += "PREFIX " + pref + ": <" + ns + ">\n";
						}
						// preparo cadena para sustituir
						const newcad = pref + ':' + iri.substring(indfin + 1, iri.length -1);					
						// sustituyo todas las ocurrencias
						query = query.split(iri).join(newcad);					
					}
				}
			}
		}
		// incluyo prefijos
		query = cadprefs + query;
	}	
	return query;
}


module.exports = {
	queryEndpoint
}