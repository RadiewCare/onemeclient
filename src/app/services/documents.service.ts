import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import * as moment from "moment";

@Injectable({
  providedIn: 'root'
})
export class DocumentsService {

  collectionName = "documents"

  constructor(private db: AngularFirestore) { }

  getAll(): Observable<any> {
    return this.db
      .collection(`${this.collectionName}`)
      .valueChanges();
  }

  getAllBySubject(id: string): Observable<any> {
    return this.db
      .collection(`${this.collectionName}`, ref => ref.where("subjectId", "==", id))
      .valueChanges();
  }

  async getAllData(): Promise<any> {
    return await this.db.firestore
      .collection(`${this.collectionName}`).get();
  }

  async getAllDataBySubject(id: string): Promise<any> {
    return await this.db.firestore
      .collection(`${this.collectionName}`).where("subjectId", "==", id).orderBy("createdAt", "desc").get();
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
    return await this.db.doc(`${this.collectionName}/${id}`).update(data);
  }

  async delete(id: string): Promise<any> {
    return await this.db.doc(`${this.collectionName}/${id}`).delete();
  }
}
