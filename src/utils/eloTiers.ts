import { EnginePersonality } from '../types/chess';

export interface EloTierInfo {
  title: string;
  badge: string;
  icon: string;
  estimatedDepth: number;
  timeMs: number;
  description: string;
}

export function getEloTierInfo(elo: number): EloTierInfo {
  if (elo < 1000) {
    return {
      title: 'Beginner',
      badge: 'Novice',
      icon: '🐣',
      estimatedDepth: 4,
      timeMs: 400,
      description: 'Frequently overlooks tactics, hangs pieces, and makes spontaneous attacks.',
    };
  }
  if (elo < 1200) {
    return {
      title: 'Casual Player',
      badge: 'Class E',
      icon: '🌱',
      estimatedDepth: 6,
      timeMs: 500,
      description: 'Understands basic openings and captures, but vulnerable to simple forks and skewers.',
    };
  }
  if (elo < 1400) {
    return {
      title: 'Intermediate',
      badge: 'Class D',
      icon: '♟️',
      estimatedDepth: 7,
      timeMs: 650,
      description: 'Solid opening development and king safety, but prone to positional drift.',
    };
  }
  if (elo < 1600) {
    return {
      title: 'Club Player',
      badge: 'Class C',
      icon: '☕',
      estimatedDepth: 9,
      timeMs: 800,
      description: 'Familiar with standard tactical motifs and basic endgames.',
    };
  }
  if (elo < 1800) {
    return {
      title: 'Advanced Club',
      badge: 'Class B',
      icon: '⚔️',
      estimatedDepth: 11,
      timeMs: 950,
      description: 'Calculates 2-3 moves deep and exploits structural weaknesses.',
    };
  }
  if (elo < 2000) {
    return {
      title: 'Expert / Class A',
      badge: 'Class A',
      icon: '🛡️',
      estimatedDepth: 13,
      timeMs: 1100,
      description: 'Strong tactical radar, few unforced errors, sound endgame technique.',
    };
  }
  if (elo < 2200) {
    return {
      title: 'Candidate Master (CM)',
      badge: 'CM',
      icon: '🎖️',
      estimatedDepth: 14,
      timeMs: 1300,
      description: 'Sharp calculation, punishing opening mistakes and punishing inaccurate move orders.',
    };
  }
  if (elo < 2400) {
    return {
      title: 'National Master (NM)',
      badge: 'NM / FM',
      icon: '🏅',
      estimatedDepth: 16,
      timeMs: 1500,
      description: 'Near-flawless tactical defense and profound prophylactic understanding.',
    };
  }
  if (elo < 2600) {
    return {
      title: 'International Master (IM)',
      badge: 'IM',
      icon: '⚡',
      estimatedDepth: 18,
      timeMs: 1800,
      description: 'Elite positional play and devastating attack coordination.',
    };
  }
  if (elo < 2850) {
    return {
      title: 'Grandmaster (GM)',
      badge: 'GM',
      icon: '👑',
      estimatedDepth: 20,
      timeMs: 2200,
      description: 'World-class Grandmaster calculation, punishing any slight inaccuracy.',
    };
  }
  return {
    title: 'Super GM / Stockfish Max',
    badge: 'Super GM',
    icon: '🤖',
    estimatedDepth: 22,
    timeMs: 2500,
    description: 'Unhindered Stockfish 16+ WebAssembly engine calculation.',
  };
}

export function createCalibratedPersonality(
  base: EnginePersonality,
  exactElo: number
): EnginePersonality {
  const tier = getEloTierInfo(exactElo);
  return {
    ...base,
    id: `custom_${exactElo}_${base.playstyle}`,
    name: `${base.name.split(' (')[0]} (${exactElo})`,
    title: tier.title,
    elo: exactElo,
    depth: tier.estimatedDepth,
    limitStrength: exactElo < 3150,
  };
}
