export const FIELD_META = {
  OverallQual:  { label: 'Overall Quality',   unit: '/ 10',   min: 1,    max: 10,    step: 1,   description: 'Material & finish quality — 1 (Poor) to 10 (Excellent)' },
  OverallCond:  { label: 'Overall Condition', unit: '/ 10',   min: 1,    max: 10,    step: 1,   description: 'Overall condition rating — 1 (Poor) to 10 (Excellent)' },
  GrLivArea:    { label: 'Living Area',       unit: 'sq ft',  min: 100,  max: 10000, step: 10,  description: 'Above-grade living area in square feet' },
  TotalBsmtSF:  { label: 'Basement Area',     unit: 'sq ft',  min: 0,    max: 6000,  step: 10,  description: 'Total basement area in square feet' },
  LotArea:      { label: 'Lot Size',          unit: 'sq ft',  min: 1000, max: 200000,step: 100, description: 'Lot size in square feet' },
  GarageArea:   { label: 'Garage Area',       unit: 'sq ft',  min: 0,    max: 1500,  step: 10,  description: 'Garage size in square feet' },
  WoodDeckSF:   { label: 'Wood Deck',         unit: 'sq ft',  min: 0,    max: 900,   step: 5,   description: 'Wood deck area in square feet' },
  OpenPorchSF:  { label: 'Open Porch',        unit: 'sq ft',  min: 0,    max: 600,   step: 5,   description: 'Open porch area in square feet' },
  FullBath:     { label: 'Full Bathrooms',    unit: '',       min: 0,    max: 4,     step: 1,   description: 'Full bathrooms above grade' },
  HalfBath:     { label: 'Half Bathrooms',    unit: '',       min: 0,    max: 3,     step: 1,   description: 'Half bathrooms above grade' },
  BedroomAbvGr: { label: 'Bedrooms',          unit: '',       min: 0,    max: 10,    step: 1,   description: 'Number of bedrooms above grade' },
  GarageCars:   { label: 'Garage Capacity',   unit: 'cars',   min: 0,    max: 5,     step: 1,   description: 'How many cars the garage can hold' },
  Fireplaces:   { label: 'Fireplaces',        unit: '',       min: 0,    max: 4,     step: 1,   description: 'Number of fireplaces' },
  YearBuilt:    { label: 'Year Built',        unit: '',       min: 1800, max: 2025,  step: 1,   description: 'Year the house was originally built' },
  YearRemodAdd: { label: 'Year Remodeled',    unit: '',       min: 1800, max: 2025,  step: 1,   description: 'Year of most recent remodel (same as built if none)' },
}

export const FORM_SECTIONS = [
  {
    title: 'Quality & Condition',
    fields: ['OverallQual', 'OverallCond'],
  },
  {
    title: 'Size & Space',
    fields: ['GrLivArea', 'TotalBsmtSF', 'LotArea', 'GarageArea', 'WoodDeckSF', 'OpenPorchSF'],
  },
  {
    title: 'Rooms & Features',
    fields: ['FullBath', 'HalfBath', 'BedroomAbvGr', 'GarageCars', 'Fireplaces'],
  },
  {
    title: 'Age & Updates',
    fields: ['YearBuilt', 'YearRemodAdd'],
  },
]
