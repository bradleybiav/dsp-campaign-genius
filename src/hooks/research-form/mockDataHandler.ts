import { NormalizedInput } from '@/utils/apiUtils';
import type { ResearchResults } from './types';

/**
 * Generate mock research results for testing
 */
export function generateMockResearchResults(
  normalizedInputs: NormalizedInput[],
  selectedVerticals: string[]
): ResearchResults {
  const mockResults: ResearchResults = {
    dspResults: [],
    radioResults: [],
    djResults: [],
    pressResults: []
  };
  
  // Only generate mock data for selected verticals
  if (selectedVerticals.includes('dsp')) {
    mockResults.dspResults = generateMockPlaylists(normalizedInputs);
  }
  
  if (selectedVerticals.includes('radio')) {
    mockResults.radioResults = generateMockRadioPlays(normalizedInputs);
  }
  
  if (selectedVerticals.includes('dj')) {
    mockResults.djResults = generateMockDjPlays(normalizedInputs);
  }
  
  if (selectedVerticals.includes('press')) {
    mockResults.pressResults = generateMockPressResults(normalizedInputs);
  }
  
  return mockResults;
}

/**
 * Generate mock playlist results
 */
function generateMockPlaylists(normalizedInputs: NormalizedInput[]) {
  const playlists = [
    { name: 'Friday Cratediggers', curator: 'Spotify', followers: 798542 },
    { name: 'Electronic Rising', curator: 'Spotify', followers: 456123 },
    { name: 'Dance Classics', curator: 'Apple Music', followers: 325789 },
    { name: 'Underground Selects', curator: 'DJ Mag', followers: 127865 },
    { name: 'New Music Friday', curator: 'Spotify', followers: 3980654 },
    { name: 'Electronic Essentials', curator: 'Apple Music', followers: 1457823 },
    { name: 'Club Bangers', curator: 'Beatport', followers: 87954 },
    { name: 'EDM Hits', curator: 'dance.wav', followers: 45678 },
    { name: 'Techno Fundamentals', curator: 'HATE', followers: 234567 },
    { name: 'Deep House Delights', curator: 'Defected', followers: 145678 }
  ];
  
  return playlists.map((playlist, i) => {
    // Randomly assign 1-2 inputs to each playlist
    const numMatches = 1 + Math.floor(Math.random() * 2);
    const matchedInputs: number[] = [];
    
    for (let j = 0; j < numMatches; j++) {
      if (normalizedInputs.length > 0) {
        const randomInputIndex = Math.floor(Math.random() * normalizedInputs.length);
        const inputIndex = normalizedInputs[randomInputIndex].inputIndex;
        
        if (!matchedInputs.includes(inputIndex)) {
          matchedInputs.push(inputIndex);
        }
      }
    }
    
    // Random date in the last 30 days
    const lastUpdated = new Date(
      Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
    ).toISOString();
    
    return {
      id: `mock-playlist-${i}`,
      playlistName: playlist.name,
      curatorName: playlist.curator,
      followerCount: playlist.followers,
      lastUpdated,
      playlistUrl: `https://open.spotify.com/playlist/mock${i}`,
      matchedInputs,
      vertical: 'dsp' as const
    };
  });
}

/**
 * Generate mock radio play results
 */
function generateMockRadioPlays(normalizedInputs: NormalizedInput[]) {
  const radioStations = [
    { station: 'BBC Radio 1', show: 'Essential Mix', dj: 'Pete Tong', country: 'UK' },
    { station: 'Triple J', show: 'Friday Night Shuffle', dj: 'The Aston Shuffle', country: 'Australia' },
    { station: 'Rinse FM', show: 'The Selector', dj: 'Jamz Supernova', country: 'UK' },
    { station: 'NTS Radio', show: 'NTS Breakfast Show', dj: 'Charlie Bones', country: 'UK' },
    { station: 'SiriusXM', show: 'Area', dj: 'Afrojack', country: 'USA' },
    { station: 'KCRW', show: 'Metropolis', dj: 'Jason Bentley', country: 'USA' },
    { station: 'Radio FG', show: 'Club FG', dj: 'Antoine Clamaran', country: 'France' },
    { station: 'Kiss FM', show: 'Kisstory', dj: 'Dixon Brothers', country: 'UK' }
  ];
  
  return radioStations.map((station, i) => {
    // Randomly assign 1-2 inputs to each radio play
    const numMatches = 1 + Math.floor(Math.random() * 2);
    const matchedInputs: number[] = [];
    
    for (let j = 0; j < numMatches; j++) {
      if (normalizedInputs.length > 0) {
        const randomInputIndex = Math.floor(Math.random() * normalizedInputs.length);
        const inputIndex = normalizedInputs[randomInputIndex].inputIndex;
        
        if (!matchedInputs.includes(inputIndex)) {
          matchedInputs.push(inputIndex);
        }
      }
    }
    
    // Random date in the last 60 days
    const lastSpin = new Date(
      Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000
    ).toISOString();
    
    // For more realistic mock data, add playsCount
    const playsCount = Math.floor(Math.random() * 30) + 1;
    
    return {
      id: `mock-radio-${i}`,
      station: station.station,
      show: station.show,
      dj: station.dj,
      country: station.country,
      lastSpin,
      airplayLink: `https://example.com/airplay/mock${i}`,
      playsCount,
      matchedInputs,
      vertical: 'radio' as const
    };
  });
}

/**
 * Generate mock DJ play results
 */
function generateMockDjPlays(normalizedInputs: NormalizedInput[]) {
  const djs = [
    { name: 'Carl Cox', event: 'Tomorrowland', location: 'Belgium' },
    { name: 'Amelie Lens', event: 'Awakenings Festival', location: 'Amsterdam' },
    { name: 'Charlotte de Witte', event: 'Printworks', location: 'London' },
    { name: 'Fisher', event: 'EDC', location: 'Las Vegas' },
    { name: 'Jamie Jones', event: 'Paradise', location: 'Ibiza' },
    { name: 'Black Coffee', event: 'Hi Ibiza', location: 'Ibiza' },
    { name: 'The Blessed Madonna', event: 'Coachella', location: 'California' },
    { name: 'Adam Beyer', event: 'Drumcode Festival', location: 'Malta' }
  ];
  
  return djs.map((dj, i) => {
    // Randomly assign 1-2 inputs to each DJ play
    const numMatches = 1 + Math.floor(Math.random() * 2);
    const matchedInputs: number[] = [];
    
    for (let j = 0; j < numMatches; j++) {
      if (normalizedInputs.length > 0) {
        const randomInputIndex = Math.floor(Math.random() * normalizedInputs.length);
        const inputIndex = normalizedInputs[randomInputIndex].inputIndex;
        
        if (!matchedInputs.includes(inputIndex)) {
          matchedInputs.push(inputIndex);
        }
      }
    }
    
    // Random date in the last 90 days
    const date = new Date(
      Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000
    ).toISOString();
    
    return {
      id: `mock-dj-${i}`,
      dj: dj.name,
      event: dj.event,
      location: dj.location,
      date,
      tracklistUrl: `https://www.1001tracklists.com/tracklist/mock-${i}`,
      matchedInputs,
      vertical: 'dj' as const
    };
  });
}

/**
 * Generate mock press results
 */
function generateMockPressResults(normalizedInputs: NormalizedInput[]) {
  const publications = [
    { outlet: 'Mixmag', writer: 'Ben Murphy' },
    { outlet: 'DJ Mag', writer: 'Carl Loben' },
    { outlet: 'Resident Advisor', writer: 'Ryan Keeling' },
    { outlet: 'Pitchfork', writer: 'Philip Sherburne' },
    { outlet: 'Billboard', writer: 'Katie Bain' },
    { outlet: 'XLR8R', writer: 'Shawn Reynaldo' },
    { outlet: 'Electronic Beats', writer: 'Chal Ravens' },
    { outlet: 'Dancing Astronaut', writer: 'Rachel Narozniak' }
  ];
  
  return publications.map((pub, i) => {
    // Randomly assign 1-2 inputs to each press mention
    const numMatches = 1 + Math.floor(Math.random() * 2);
    const matchedInputs: number[] = [];
    
    for (let j = 0; j < numMatches; j++) {
      if (normalizedInputs.length > 0) {
        const randomInputIndex = Math.floor(Math.random() * normalizedInputs.length);
        const inputIndex = normalizedInputs[randomInputIndex].inputIndex;
        
        if (!matchedInputs.includes(inputIndex)) {
          matchedInputs.push(inputIndex);
        }
      }
    }
    
    // Random date in the last 180 days
    const date = new Date(
      Date.now() - Math.floor(Math.random() * 180) * 24 * 60 * 60 * 1000
    ).toISOString();
    
    const titles = [
      'Artist to Watch: Track {input}',
      'New Release Spotlight: The Latest From Artist {input}',
      'The Rise of Artist {input} in Electronic Music',
      'Interview: Artist {input} on Creative Process',
      'Deep Dive: The Sound of Artist {input}'
    ];
    
    const randomTitle = titles[Math.floor(Math.random() * titles.length)]
      .replace('{input}', matchedInputs.length > 0 ? matchedInputs[0].toString() : 'Unknown');
    
    return {
      id: `mock-press-${i}`,
      outlet: pub.outlet,
      writer: pub.writer,
      articleTitle: randomTitle,
      date,
      link: `https://example.com/${pub.outlet.toLowerCase().replace(' ', '')}/article-${i}`,
      matchedInputs,
      vertical: 'press' as const
    };
  });
}
