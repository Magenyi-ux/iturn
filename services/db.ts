
import Dexie, { Table } from 'dexie';
import { Client } from '../types';

export interface ClientPhotos {
  clientId: string;
  front: string;
  side: string;
  back: string;
}

export class MySubClassedDexie extends Dexie {
  clients!: Table<Client>;
  photos!: Table<ClientPhotos>;

  constructor() {
    super('atelierDB');
    this.version(2).stores({
      clients: 'id, name',
      photos: 'clientId'
    });
  }
}

export const db = new MySubClassedDexie();
