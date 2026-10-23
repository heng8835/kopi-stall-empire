// The recipe hint under each order bubble, in the same words as the pour bar zones.
// "Teh C siew dai peng" -> "Teh ¾ · evap C · sugar SIEW DAI · stir · ice". Pure, no Phaser.
const SWEET = { none: 'KOSONG', less: 'SIEW DAI', normal: 'NORMAL', more: 'GA DAI' };

export function recipeHint(spec) {
  const pot = spec.iced ? '¾' : 'FULL';
  if (spec.base === 'milo' || spec.base === 'horlicks') {
    const name = spec.base === 'milo' ? 'Milo' : 'Horlicks';
    return [`${name} ${pot}`, spec.iced && 'ice', spec.topping && 'powder on top'].filter(Boolean).join(' · ');
  }
  const name = { kopi: 'Kopi', teh: 'Teh', cham: 'Kopi + teh' }[spec.base];
  const steps = [`${name} ${pot}`];
  if (spec.milk === 'condensed') steps.push(`condensed ${SWEET[spec.sugar]}`);
  else {
    steps.push(spec.milk === 'evap' ? 'evap C' : 'no milk');
    steps.push(spec.sugar === 'none' ? 'no sugar' : `sugar ${SWEET[spec.sugar]}`);
  }
  if (spec.milk !== 'none' || spec.sugar !== 'none') steps.push('stir');
  if (spec.iced) steps.push('ice');
  return steps.join(' · ');
}
