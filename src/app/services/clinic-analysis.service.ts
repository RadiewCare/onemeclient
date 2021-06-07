import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClinicAnalysisService {

  collectionName = "clinicAnalysis";

  constructor(private db: AngularFirestore) { }

  getAll(): Observable<any> {
    return this.db
      .collection(`${this.collectionName}`)
      .valueChanges();
  }

  async getAllData(): Promise<any> {
    return await this.db.firestore
      .collection(`${this.collectionName}`).get();
  }

  get(id: string): Observable<any> {
    return this.db.doc(`${this.collectionName}/${id}`).valueChanges();
  }

  async getData(id: string): Promise<any> {
    return await this.db.firestore.doc(`${this.collectionName}/${id}`).get();
  }

  getDefaultClinicAnalysis(): Observable<any> {
    return this.db
      .collection(this.collectionName, ref => ref.where('isDefault', '==', true))
      .valueChanges();
  }

  async getDefaultClinicAnalysisData(): Promise<any> {
    return await this.db.firestore
      .collection(this.collectionName).where('isDefault', '==', true)
      .get();
  }

  async create(data: any): Promise<any> {
    return await this.db
      .collection(`${this.collectionName}`)
      .add(data)
      .then((doc) => {
        this.db.doc(`${this.collectionName}/${doc.id}`).update({ id: doc.id });
      });
  }

  async update(id: string, data: any): Promise<any> {
    return await this.db.doc(`${this.collectionName}/${id}`).update(data);
  }

  async delete(id: string): Promise<any> {
    return await this.db.doc(`${this.collectionName}/${id}`).delete();
  }
}
