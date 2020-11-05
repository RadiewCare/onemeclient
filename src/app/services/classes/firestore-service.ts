import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export class FirestoreService {

  collectionName: string
  db: AngularFirestore;

  constructor(collection: string) {
    this.collectionName = collection;
  }

  getOne(id: string): Observable<any> {
    return this.db.doc(`${this.collectionName}/${id}`).valueChanges()
  }

  async getOneData(id: string): Promise<firebase.firestore.DocumentData> {
    return (await this.db.firestore.doc(`${this.collectionName}/${id}`).get()).data();
  }

  getAll(): Observable<any> {
    return this.db.collection(this.collectionName).valueChanges();
  }

  async getAllData(): Promise<any> {
    return (await this.db.firestore.collection(this.collectionName).get()).docs
  }

  async create(data: any): Promise<void> {
    const doc = await this.db.collection(this.collectionName).add(data);
    return await this.update(doc.id, { id: doc.id });
  }

  async update(id: string, data: any): Promise<void> {
    return await this.db.doc(`${this.collectionName}/${id}`).update(data);
  }

  async delete(id: string): Promise<void> {
    return await this.db.doc(`${this.collectionName}/${id}`).delete();
  }
}