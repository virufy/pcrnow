interface SymptomsProps {
  selected: string[];
}

export function executeValidation(symptoms : SymptomsProps) {
  if (!symptoms?.selected) return false;
  const { selected } = symptoms;
  const covidSymptoms = ['breathShortness', 'feverChillsSweating', 'dryCough', 'wetCough', 'newOrWorseCough'];

  let output = false;
  // eslint-disable-next-line no-plusplus
  for (let index = 0; !output && index < selected?.length; index++) {
    output = covidSymptoms.includes(selected[index]);
  }

  return output;
}
