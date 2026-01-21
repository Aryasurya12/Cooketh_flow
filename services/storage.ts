import { MapDocument, MapMetadata, MapState } from '../types';

const STORAGE_KEY_PREFIX = 'cooketh_flow_map_';
const INDEX_KEY = 'cooketh_flow_index';

// Helper to generate UUIDs
const generateId = () => {
  return crypto.randomUUID ? crypto.randomUUID() : `map_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// --- API-like Interface for Storage ---

export const StorageService = {
  // List all maps (metadata only)
  listMaps: (): MapMetadata[] => {
    try {
      const indexJson = localStorage.getItem(INDEX_KEY);
      const index: MapMetadata[] = indexJson ? JSON.parse(indexJson) : [];
      return index.sort((a, b) => b.updatedAt - a.updatedAt);
    } catch (e) {
      console.error("Failed to list maps", e);
      return [];
    }
  },

  // Load full map data
  loadMap: (id: string): MapDocument | null => {
    try {
      const dataJson = localStorage.getItem(`${STORAGE_KEY_PREFIX}${id}`);
      if (!dataJson) return null;
      return JSON.parse(dataJson);
    } catch (e) {
      console.error("Failed to load map", e);
      return null;
    }
  },

  // Save or Update a map
  saveMap: (map: Partial<MapDocument> & { data: MapState }): MapDocument => {
    try {
      const now = Date.now();
      const id = map.id || generateId();
      
      const newDoc: MapDocument = {
        id,
        title: map.title || 'Untitled Map',
        createdAt: map.createdAt || now,
        updatedAt: now,
        data: map.data
      };

      // 1. Save actual data
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${id}`, JSON.stringify(newDoc));

      // 2. Update Index
      const index = StorageService.listMaps();
      const existingEntryIndex = index.findIndex(m => m.id === id);
      
      const metadata: MapMetadata = {
        id: newDoc.id,
        title: newDoc.title,
        createdAt: newDoc.createdAt,
        updatedAt: newDoc.updatedAt
      };

      if (existingEntryIndex >= 0) {
        index[existingEntryIndex] = metadata;
      } else {
        index.unshift(metadata);
      }
      
      localStorage.setItem(INDEX_KEY, JSON.stringify(index));
      
      return newDoc;
    } catch (e) {
      console.error("Failed to save map", e);
      throw e;
    }
  },

  // Delete a map
  deleteMap: (id: string): void => {
    try {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}${id}`);
      const index = StorageService.listMaps().filter(m => m.id !== id);
      localStorage.setItem(INDEX_KEY, JSON.stringify(index));
    } catch (e) {
      console.error("Failed to delete map", e);
    }
  }
};