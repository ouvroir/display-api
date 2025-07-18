function stringToIri (string) {

  let iri = string;

  try {
    // vérifier si répond à la contrainte de forme d’une URL
    // valide aussi les IRI, donc OK pour URN
    // invalide : passe au bloc catch
    // valide : passe directement au bloc finally
    new URL(iri);

  } catch(e) {

    // Une erreur est levée : pas un IRI
    // Donc convertir la chaîne

    // prefixes
    const bot = "https://w3id.org/bot#";
    const crm = "http://www.cidoc-crm.org/cidoc-crm/";
    const la = "https://linked.art/ns/terms/";


    switch (string) {
      case "Space":
        iri = `${bot}${string}`
        break;
      case "Element":
      case "Exhibit":
      case "ExhibitionSpace":
        iri = `${display}${string}`
        break;
      case "Activity":
        iri = `${crm}E7_Activity`
        break;
      case "LinguisticObject":
        iri = `${crm}E33_Linguistic_Object`
        break;
      case "Name":
        iri = `${crm}E33_E41_Linguistic_Appellation`
        break;
      case "Person":
        iri = `${crm}E21_Person`
        break;
      case "Production":
        iri = `${crm}E12_Production`
        break;
      case "Set":
        iri = `${la}Set`
        break;
      case "TimeSpan":
        iri = `${crm}E52_Time-Span`
        break;
      case "Type":
        iri = `${crm}E55_Type`
        break;
      default:
        break;
    }

  } finally {
    return iri;
  }
}

module.exports = {
  stringToIri
}