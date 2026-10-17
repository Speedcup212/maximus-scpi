// Deterministic description based ONLY on sourced, displayed allocation percentages.
// This is NOT an investment strategy inferred by an LLM and does not predict returns.
export type AllocatedSectorOrCountry={name:string;value:number};
export function sourceBackedPortfolioDescription(input:{
  sectors?:AllocatedSectorOrCountry[];
  countries?:AllocatedSectorOrCountry[];
  referencePeriod?:string;
}):string{
  const items=(arr?:AllocatedSectorOrCountry[])=>Array.isArray(arr)
    ? arr.filter(x=>x&&typeof x.name==='string'&&x.name.trim()
        &&Number.isFinite(x.value)&&x.value>=0&&x.value<=100)
      .sort((a,b)=>b.value-a.value).slice(0,3)
      .map(x=>x.name+' ('+x.value.toLocaleString('fr-FR',{maximumFractionDigits:2})+' %)').join(', ')
    : '';
  const sectors=items(input.sectors);
  const geography=items(input.countries);
  if(!sectors&&!geography)return '';
  const period=input.referencePeriod?.trim()||'dernière répartition documentée';
  return 'Répartition publiée ('+period+') : '
   +(sectors?'principaux secteurs : '+sectors+'. ':'')
   +(geography?'principaux pays : '+geography+'. ':'')
   +'Ces répartitions décrivent le patrimoine à la date indiquée et non les acquisitions futures. '
   +'Les parts présentent un risque de perte en capital, les revenus ne sont pas garantis et leur revente peut être différée.';
}
