import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubjectImageTestsService {

  constructor(private db: AngularFirestore) { }

  getOne(id: string): Observable<any> {
    return this.db.doc(`subjectImageTests/${id}`).valueChanges();
  }

  async getOneData(id: string): Promise<firebase.firestore.DocumentData> {
    return (await this.db.firestore.doc(`subjectImageTests/${id}`).get()).data();
  }

  getAll(): Observable<any> {
    return this.db.collection("subjectImageTests").valueChanges();
  }

  async getAllData(): Promise<any> {
    return (await this.db.firestore.collection("subjectImageTests").get()).docs
  }

  async getAllDataBySubject(subjectId: string) {
    return (await this.db.firestore.collection("subjectImageTests").where('subjectId', '==', subjectId).get()).docs
  }

  async getAllDataByWithReproduction() {
    return await this.db.firestore.collection("subjectImageTests").where('isReproductionTest', '==', true).get();
  }

  getAllDataBySubjectObservable(subjectId: string): Observable<any> {
    return this.db.collection("subjectImageTests", ref => ref.where('subjectId', '==', subjectId)).valueChanges();
  }

  async create(data: any): Promise<void> {
    const doc = await this.db.collection("subjectImageTests").add(data);
    await this.update(doc.id, { id: doc.id });
    return await this.db.doc(`subjects/${data.subjectId}`).update({ subjectImageTests: firebase.firestore.FieldValue.arrayUnion(doc.id) })
  }

  async update(id: string, data: any): Promise<void> {
    return await this.db.doc(`subjectImageTests/${id}`).update(data);
  }

  async delete(id: string): Promise<void> {
    return await this.db.doc(`subjectImageTests/${id}`).delete();
  }

}
