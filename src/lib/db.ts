import fs from "fs";
import path from "path";
import { CustomRecord } from "./types";

const DATA_FILE = path.join(process.cwd(), "src", "data", "records.json");

// In-memory fallback for serverless environments (like Vercel read-only filesystems)
let memoryStore: CustomRecord[] = [];

function loadInitialData(): CustomRecord[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error reading records.json:", err);
  }
  return [];
}

memoryStore = loadInitialData();

export function getRecords(): CustomRecord[] {
  return [...memoryStore];
}

export function getRecordByRegno(regno: string): CustomRecord[] {
  const norm = regno.trim().toUpperCase();
  return memoryStore.filter((r) => r.regno.toUpperCase() === norm);
}

export function saveRecord(data: Omit<CustomRecord, "id" | "updatedAt"> & { id?: string }): CustomRecord {
  const normRegno = data.regno.trim().toUpperCase();
  const id = data.id || `rec-${normRegno}-${data.yearmode || Date.now()}`;
  const now = new Date().toISOString();

  const existingIndex = memoryStore.findIndex((r) => r.id === id || (r.regno.toUpperCase() === normRegno && r.yearmode === data.yearmode));

  const newRecord: CustomRecord = {
    ...data,
    id,
    regno: normRegno,
    updatedAt: now,
  };

  if (existingIndex >= 0) {
    memoryStore[existingIndex] = newRecord;
  } else {
    memoryStore.unshift(newRecord);
  }

  // Attempt to write to file if possible (local dev)
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryStore, null, 2), "utf-8");
  } catch {
    // If running on readonly filesystem like Vercel Lambda, memoryStore persists for lambda warm runtime
  }

  return newRecord;
}

export function deleteRecord(id: string): boolean {
  const initialLen = memoryStore.length;
  memoryStore = memoryStore.filter((r) => r.id !== id);
  const changed = memoryStore.length < initialLen;

  if (changed) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(memoryStore, null, 2), "utf-8");
    } catch {
      // Ignored in read-only environment
    }
  }

  return changed;
}
