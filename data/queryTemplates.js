// query array with all the query templates
var queryTemplates = [
	{ 
		id: "test",
		description: "Test if an endpoint is working",
		template: 
'SELECT *\n\
WHERE {\n\
?s ?p ?o .\n\
} LIMIT 1',
		variables: [ "s", "p", "o" ],
		parameters: []
	},
	{ 
		id: "testInsert",
		description: "Test insert data of an endpoint",
		template: 
'INSERT DATA {\n\
<http://prueba.es/s> <http://prueba.es/p> <http://prueba.es/o>\n\
}',
		variables: [],
		parameters: []
	},
	{ 
		id: "testDelete",
		description: "Test delete data of an endpoint",
		template: 
'DELETE DATA {\n\
<http://prueba.es/s> <http://prueba.es/p> <http://prueba.es/o>\n\
}',
		variables: [],
		parameters: []
	},
	{ 
		id: "types",
		description: "Obtain the types of a list of iris (\"firis\"). The inferred types can be also obtained by setting \"inferred\" to true. Additional \"restrictions\" can be added, e.g. to filter the types to extract",
		template:
'SELECT DISTINCT ?iri ?type ?mapping  \n \
FROM {{{fromDefault}}} \n\
{{#union}}FROM {{{.}}} \n{{/union}}\
WHERE { \n \
?iri a{{#inferred}}/<http://www.w3.org/2000/01/rdf-schema#subClassOf>*{{/inferred}} ?type . \n \
OPTIONAL { \n \
?type <https://ntnlv.ca/ns/utils#jsonldmapping> ?mapping \n \
} \n \
{{#restrictions}}{{{.}}}\n{{/restrictions}}\
FILTER (?iri IN ( {{{firis}}} )) }',
		variables: [ "iri", "type", "mapping" ],
		parameters: [
			{ label: "firis", type: "firi[]", optional: false },
			{ label: "inferred", type: "boolean", optional: true },
			{ label: "restrictions", type: "string[]", optional: true }		
		]
	},
	{ 
		id: "propvalues",
		description: "Obtain the values of a property \"propiri\" of a list of iris (\"firis\"). The property can be inversed by setting  \"inv\" to true. Additional \"restrictions\" can be added, e.g. to filter the values to extract",
		template: 
'SELECT DISTINCT ?iri ?value \n\
FROM {{{fromDefault}}} \n\
{{#union}}FROM {{{.}}} \n{{/union}}\
WHERE { \n\
{{^inv}}?iri <{{{propiri}}}> ?value . \n{{/inv}}\
{{#inv}}?value <{{{propiri}}}> ?iri . \n{{/inv}}\
{{#restrictions}}{{{.}}}\n{{/restrictions}}\
FILTER (?iri IN ( {{{firis}}} )) }',
		variables: [ "iri", "value" ],
		parameters: [
			{ label: "firis", type: "firi[]", optional: false },
			{ label: "inv", type: "boolean", optional: true },
			{ label: "restrictions", type: "string[]", optional: true }		
		]
	},
  { 
		id: "ask",
		description: "Test if a resource exists",
		template: 
'ASK \n\
FROM {{{fromDefault}}} \n\
{{#union}}FROM {{{.}}} \n{{/union}}\
{\n\
?iri ?p ?o . \n\
FILTER (?iri IN ( {{{firis}}} )) \n\
}',
		variables: [ "iri", "p", "o" ],
		parameters: [
      { label: "fromDefault", type: "iri", optional: false },
      { label: "union", type: "iri", optional: true },
      { label: "firis", type: "firi[]", optional: false }
    ]
	},
  { 
		id: "testInfGraph",
		description: "Test if an inference graph is available",
		template: 
'ASK \n\
FROM {{{fromDefault}}} \n\
{\n\
{{{iri}}} <https://ntnlv.ca/ns/utils#activated> false  . \n\
}',
		variables: [ "p", "o" ],
		parameters: [
      { label: "fromDefault", type: "iri", optional: false },
      { label: "iri", type: "iri", optional: false }
    ]
	},{
		id: "toggleActiveInfGraph",
		description: "Toggle Active Inference Graph",
		template: 
'DELETE WHERE { \n\
  GRAPH {{{fromDefault}}} { \n\
    {{{iri}}} ?p ?o . \n\
  } \n\
}; \n\
WITH {{{fromDefault}}} \n\
INSERT { \n\
  {{{iri}}} <https://ntnlv.ca/ns/utils#activated> {{{active}}} ; \n\
  <https://ntnlv.ca/ns/utils#timeActivated> ?now . \n\
  } WHERE { \n\
  BIND(NOW() AS ?now) \n\
}',
		variables: [ "p", "o", "now"],
		parameters: [
      { label: "fromDefault", type: "iri", optional: false },
      { label: "iri", type: "iri", optional: false },
      { label: "active", type: "boolean", optional: false }
    ]
  },{
		id: "loadDataInInfGraph",
		description: "Load data in the selected inference graph",
		template: 
'WITH {{{inferenceGraphIri}}} \n\
INSERT { ?s ?p ?o } WHERE { \n\
  SERVICE {{{serviceIri}}} { \n\
    GRAPH {{{graph}}} { ?s ?p ?o } \n\
  } \n\
}; \n\
WITH {{{inferenceGraphIri}}} \n\
INSERT { \n\
  ?s1 ?p1 ?o1 . \n\
  ?o1 ?p2 ?o2 . \n\
  ?o2 ?p3 ?o3 . \n\
} WHERE { \n\
  SERVICE {{{serviceIri}}} { \n\
    { \n\
      SELECT DISTINCT ?s1 { \n\
        GRAPH {{{graph}}} { \n\
          { ?s1 ?p ?o } UNION { ?o2 ?p2 ?s1 } \n\
          FILTER EXISTS { ?o2 ?p2 ?s1 } \n\
        } \n\
      } \n\
    } \n\
    GRAPH {{{metadataGraphURI}}} { \n\
      { ?s1 ?p1 ?o1 } \n\
      OPTIONAL { \n\
        ?o1 ?p2 ?o2 . \n\
        OPTIONAL { \n\
          ?o2 ?p3 ?o3 . \n\
        } \n\
      } \n\
    } \n\
  } \n\
};',
		variables: [],
		parameters: [
      { label: "inferenceGraphIri", type: "iri", optional: false },
      { label: "serviceIri", type: "iri", optional: false },
      { label: "graph", type: "iri", optional: false },
      { label: "metadataGraphURI", type: "iri", optional: false },
    ]
  },{
		id: "clearInfGraph",
		description: "Clear inference graph",
		template: 
'CLEAR GRAPH {{{inferenceGraphIri}}}; \n\
ADD <urn:ouvroir:display:models> TO {{{inferenceGraphIri}}}; \n\
',
		variables: [],
		parameters: [
      { label: "inferenceGraphIri", type: "iri", optional: false }
    ]
  }
];


module.exports = {
	queryTemplates
}