import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { SavedGame } from '../types/chess';

interface DeepPocketDB extends DBSchema {
  games: {
    key: string;
    value: SavedGame;
    indexes: { 'by-date': number };
  };
  activeGame: {
    key: string;
    value: {
      id: string;
      fen: string;
      pgn: string;
      sanHistory: string[];
      playerColor: 'w' | 'b';
      mode: 'vs_ai' | 'pass_and_play' | 'analysis';
      personalityId: string;
      whiteTimeMs?: number;
      blackTimeMs?: number;
      lastUpdated: number;
    };
  };
  repertoires: {
    key: string;
    value: {
      id: string;
      eco: string;
      name: string;
      moves: string[];
      notes?: string;
      bookmarkedAt: number;
    };
  };
}

const DB_NAME = 'deeppocket_chess_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<DeepPocketDB>> | null = null;

function getDb(): Promise<IDBPDatabase<DeepPocketDB>> {
  if (!dbPromise) {
    dbPromise = openDB<DeepPocketDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('games')) {
          const gameStore = db.createObjectStore('games', { keyPath: 'id' });
          gameStore.createIndex('by-date', 'timestamp');
        }
        if (!db.objectStoreNames.contains('activeGame')) {
          db.createObjectStore('activeGame', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('repertoires')) {
          db.createObjectStore('repertoires', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export async function saveGameToDb(game: SavedGame): Promise<void> {
  const db = await getDb();
  await db.put('games', game);
}

export async function getAllSavedGames(): Promise<SavedGame[]> {
  const db = await getDb();
  const games = await db.getAllFromIndex('games', 'by-date');
  return games.reverse(); // Newest first
}

export async function deleteSavedGame(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('games', id);
}

export async function saveActiveGameState(state: {
  fen: string;
  pgn: string;
  sanHistory: string[];
  playerColor: 'w' | 'b';
  mode: 'vs_ai' | 'pass_and_play' | 'analysis';
  personalityId: string;
  whiteTimeMs?: number;
  blackTimeMs?: number;
}): Promise<void> {
  const db = await getDb();
  await db.put('activeGame', {
    id: 'current',
    ...state,
    lastUpdated: Date.now(),
  });
}

export async function loadActiveGameState() {
  const db = await getDb();
  return await db.get('activeGame', 'current');
}

export async function clearActiveGameState(): Promise<void> {
  const db = await getDb();
  await db.delete('activeGame', 'current');
}

export async function bookmarkRepertoire(item: {
  eco: string;
  name: string;
  moves: string[];
  notes?: string;
}): Promise<void> {
  const db = await getDb();
  await db.put('repertoires', {
    id: item.eco + '_' + item.name.replace(/\s+/g, '_'),
    ...item,
    bookmarkedAt: Date.now(),
  });
}

export async function getBookmarkedRepertoires() {
  const db = await getDb();
  return await db.getAll('repertoires');
}

export async function removeBookmarkedRepertoire(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('repertoires', id);
}
