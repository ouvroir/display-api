function replaceIriByUpdateIri(model) {
  model.oprops.forEach(field => {
    if (field.updateIri) {
      field.iri = field.updateIri;
      console.log(field.iri);
    } else {
      console.log(field.iri);
    }
  });
}

function replaceTargetIdByUpdateTargetId(model) {
  model.oprops.forEach(field => {
    if (field.updateTargetId) {
      field.targetId = field.updateTargetId;
      console.log(field.targetId);
    } else {
      console.log(field.targetId);
    }
  });
}


module.exports = {
	replaceIriByUpdateIri,
  replaceTargetIdByUpdateTargetId
}