function stringToIri (string) {

  let iri = string;

  try {
    // vérifier si répond à la contrainte de forme d’une URL
    // valide aussi les IRI, donc OK pour URN
    // si invalide  : passe au bloc catch
    // si valide    : passe directement au bloc finally
    new URL(iri);

  } catch(e) {

    // Une erreur est levée : pas un IRI
    // Donc convertir la chaîne

    // prefixes
    const bot = "https://w3id.org/bot#";
    const crm = "http://www.cidoc-crm.org/cidoc-crm/";
    const display = "https://w3id.org/display#";
    const la = "https://linked.art/ns/terms/";


    switch (string) {
      case "Space":
        iri = `${bot}${string}`
        break;
      case "Display":
      case "Element":
      case "Exhibit":
      case "ExhibitionSpace":
      case "HangingInterface":
      case "PathwayInterface":
        iri = `${display}${string}`
        break;
      case "Activity":
        iri = `${crm}E7_Activity`
        break;
      case "Creation":
        iri = `${crm}E65_Creation`
        break;
        case "Dimension":
        iri = `${crm}E54_Dimension`
        break;
      case "Group":
        iri = `${crm}E74_Group`
        break;
      case "LinguisticObject":
        iri = `${crm}E33_Linguistic_Object`
        break;
      case "MeasurementUnit":
        iri = `${crm}E58_Measurement_Unit`
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
      case "PropositionalObject":
        iri = `${crm}E89_Propositional_Object`
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