const NOMBRES_AREAS = {
  cardiologia: 'Cardiología',
  clinica_medica: 'Clínica médica',
  ginecologia: 'Ginecología',
  infectologia: 'Infectología',
  medicina_legal: 'Medicina legal',
  obstetricia: 'Obstetricia',
  pediatria: 'Pediatría',
  vacunas: 'Vacunas',
  cirugia: 'Cirugía',
  psiquiatria: 'Psiquiatría',
  salud_publica: 'Salud pública',
  farmacologia: 'Farmacología',
  traumatologia: 'Traumatología',
  neurologia: 'Neurología',
  neumonologia: 'Neumonología',
  gastroenterologia: 'Gastroenterología',
  endocrinologia: 'Endocrinología',
  nefrologia: 'Nefrología',
  hematologia: 'Hematología',
  oncologia: 'Oncología',
  reumatologia: 'Reumatología',
  oftalmologia: 'Oftalmología',
  otorrinolaringologia: 'Otorrinolaringología',
  dermatologia: 'Dermatología',
  urologia: 'Urología',
  medicina_familiar: 'Medicina familiar',
  emergentologia: 'Emergentología',
}

const NOMBRES_SUBTEMAS = {
  cancer_cuello_uterino: 'Cáncer de cuello uterino',
  cancer_mama: 'Cáncer de mama',
  anticoncepcion: 'Anticoncepción',
  embarazo_normal: 'Embarazo normal',
  embarazo_patologico: 'Embarazo patológico',
  parto_normal: 'Parto normal',
  puerperio: 'Puerperio',
  infecciones_ginecologicas: 'Infecciones ginecológicas',
  patologia_mamaria: 'Patología mamaria',
  endometriosis: 'Endometriosis',
  miomatosis: 'Miomatosis',
  desarrollo_psicomotor: 'Desarrollo psicomotor',
  nutricion_infantil: 'Nutrición infantil',
  vacunas_calendario: 'Vacunas — calendario nacional',
  infecciones_respiratorias: 'Infecciones respiratorias',
  diarrea_aguda: 'Diarrea aguda',
  maltrato_infantil: 'Maltrato infantil',
  recien_nacido: 'Recién nacido',
  maduracion_neurologica: 'Maduración neurológica',
  cardiopatias_congenitas: 'Cardiopatías congénitas',
  hiv_sida: 'VIH / SIDA',
  tuberculosis: 'Tuberculosis',
  hepatitis: 'Hepatitis',
  its: 'Infecciones de transmisión sexual',
  chagas: 'Chagas',
  dengue: 'Dengue',
  meningitis: 'Meningitis',
  insuficiencia_cardiaca: 'Insuficiencia cardíaca',
  hipertension: 'Hipertensión arterial',
  sindrome_coronario: 'Síndrome coronario agudo',
  arritmias: 'Arritmias',
  valvulopatias: 'Valvulopatías',
  diabetes: 'Diabetes',
  hipotiroidismo: 'Hipotiroidismo',
  hipertiroidismo: 'Hipertiroidismo',
  obesidad: 'Obesidad',
  epoc: 'EPOC',
  asma: 'Asma',
  neumonia: 'Neumonía',
  insuficiencia_renal: 'Insuficiencia renal',
  litiasis_renal: 'Litiasis renal',
  anemia: 'Anemia',
  leucemia: 'Leucemia',
  linfoma: 'Linfoma',
  apendicitis: 'Apendicitis',
  colecistitis: 'Colecistitis',
  obstruccion_intestinal: 'Obstrucción intestinal',
  hernia: 'Hernia',
  trauma: 'Trauma',
  fracturas: 'Fracturas',
  lumbalgia: 'Lumbalgia',
  depresion: 'Depresión',
  esquizofrenia: 'Esquizofrenia',
  trastorno_bipolar: 'Trastorno bipolar',
  ansiedad: 'Ansiedad',
  responsabilidad_medica: 'Responsabilidad médica',
  consentimiento_informado: 'Consentimiento informado',
  certificacion_defuncion: 'Certificación de defunción',
  epidemiologia: 'Epidemiología',
  bioestadistica: 'Bioestadística',
  prevencion: 'Prevención',
}

export function formatArea(area) {
  if (!area) return ''
  const key = area.toLowerCase().trim()
  return NOMBRES_AREAS[key] ||
    NOMBRES_SUBTEMAS[key] ||
    area
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
}

export function formatSubtema(subtema) {
  if (!subtema) return ''
  const key = subtema.toLowerCase().trim()
  return NOMBRES_SUBTEMAS[key] ||
    subtema
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
}