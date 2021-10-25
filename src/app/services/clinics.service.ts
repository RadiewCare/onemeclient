import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as moment from 'moment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClinicsService {

  collectionName = "clinics";

  constructor(private db: AngularFirestore) { }

  getAll(): Observable<any> {
    return this.db
      .collection(`${this.collectionName}`, (ref) => ref.orderBy("name"))
      .valueChanges();
  }

  async getAllData(): Promise<any> {
    return await this.db.firestore
      .collection(`${this.collectionName}`)
      .orderBy("name").get();
  }

  get(id: string): Observable<any> {
    return this.db.doc(`${this.collectionName}/${id}`).valueChanges();
  }

  async getData(id: string): Promise<any> {
    return await this.db.firestore.doc(`${this.collectionName}/${id}`).get();
  }

  async create(data: any): Promise<any> {
    data.createdAt = moment().format();
    return await this.db
      .collection(`${this.collectionName}`)
      .add(data)
      .then((doc) => {
        this.db.doc(`${this.collectionName}/${doc.id}`).update({ id: doc.id });
      });
  }

  async update(id: string, data: any): Promise<any> {
    data.updatedAt = moment().format();
    return await this.db.doc(`${this.collectionName}/${id}`).update(data);
  }

  async delete(id: string): Promise<any> {
    return await this.db.doc(`${this.collectionName}/${id}`).delete();
  }
}
