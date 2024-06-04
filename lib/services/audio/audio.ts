export const musicCategories = [
  "Joie",
  "Tristesse",
  "Excitation",
  "Mélancolie",
  "Enthousiasme",
  "Calme",
  "Émerveillement",
  "Amour",
  "Colère",
  "Paix intérieure",
  "Espoir",
  "Frustration",
  "Sérénité",
  "Nostalgie",
  "Surprise",
  "Admiration",
  "Confusion",
  "Energie",
  "Rêverie",
  "Gratitude",
  "Rage",
  "Contemplative",
  "Beats",
  "Epique",
];

export const audioSources = [
  "Human",
  "Suno",
  "Aiva",
  "Loudly",
] as const;

export type AudioSource = (typeof audioSources)[number];
