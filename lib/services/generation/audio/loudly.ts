export const loudlyMoods = [
    "Dreamy",
    "Laid Back",
    "Dark",
    "Hopeful",
    "Happy",
    "Cool",
    "Dadda",
    "Energetic",
    "Fun",
    "Intense",
    "Upbeat",
    "Exotic",
    "Flowing",
    "Groovy",
    "Carefree",
    "Euphoric",
    "Crazy"
] as const;

export type LoudlyMood = typeof loudlyMoods[number];

export const loudlyGenres = [
    "Ambient Cinematic",
    "Drum 'n' Bass",
    "EDM",
    "Epic Score",
    "Hip Hop",
    "House",
    "Lo Fi & Neo Soul",
    "Reggaeton",
    "Synthwave",
    "Techno",
    "Trap Double Tempo",
    "Trap Half Tempo",
    "Electronica Downtempo",
] as const;

export const getCorrespondingLoudlyGenre = (genre: string): LoudlyGenre|undefined => {
    const lc = genre.toLocaleLowerCase();
    const result = loudlyGenres.find(g => g.toLocaleLowerCase() === lc);
    return result;
}

export type LoudlyGenre = typeof loudlyGenres[number];

export const loudlyKeys = [
    "Ab/G# Major",
    "Ab/G# Minor",
    "A Major",
    "A Minor",
    "Bb/A# Major",
    "Bb/A# Minor",
    "B Major",
    "B Minor",
    "C Major",
    "C Minor",
    "Db/C# Minor",
    "D Major",
    "D Minor",
    "Eb/D# Major",
    "Eb/D# Minor",
    "E Major",
    "E Minor",
    "F Major",
    "F Minor",
    "Gb/F# Major",
    "Gb/F# Minor",
    "G Major",
    "G Minor"
] as const;

export type LoudlyKey = typeof loudlyKeys[number];