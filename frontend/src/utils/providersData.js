// Provider data with TMDB IDs and clean public logos
export const PROVIDERS = [
  {
    id: 8,
    name: 'Netflix',
    otakuName: 'Netflix',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
    invert: false
  },
  {
    id: 350,
    name: 'Apple TV+',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Apple_TV_Plus_Logo.svg',
    invert: true // Often black logo, might need inverting on dark theme
  },
  {
    id: 9,
    name: 'Amazon Prime',
    otakuName: 'Amazon Prime Video',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video.png',
    invert: false
  },
  {
    id: 15,
    name: 'Hulu',
    otakuName: 'Hulu',
    logo: 'https://api.iconify.design/simple-icons:hulu.svg?color=%231ce783&width=120',
    invert: false
  },
  {
    id: 1899,
    name: 'Max',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Max_logo.svg',
    invert: true // Max logo is often dark blue/black, invert for dark theme
  },
  {
    id: 531,
    name: 'Paramount+',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Paramount_Plus.svg',
    invert: true
  },
  {
    id: 337,
    name: 'Disney+',
    otakuName: 'Disney Plus',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg',
    invert: true
  },
  {
    id: 283,
    name: 'Crunchyroll',
    otakuName: 'Crunchyroll',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Crunchyroll_Logo.png',
    invert: false
  },
  {
    id: 430,
    name: 'HIDIVE',
    otakuName: 'HIDIVE',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Hidive_text_logo.svg/250px-Hidive_text_logo.svg.png',
    invert: false
  }
];

// Anime heavy providers: Netflix (8), Prime (9), Hulu (15), Crunchyroll (283), Disney+ (337), HIDIVE (430)
export const ANIME_PROVIDERS = [8, 9, 15, 283, 337, 430];
