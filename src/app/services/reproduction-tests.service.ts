import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReproductionTestsService {

  constructor(private db: AngularFirestore) { }

  getOne(id: string): Observable<any> {
    return this.db.doc(`reproductionTests/${id}`).valueChanges();
  }

  async getOneData(id: string): Promise<firebase.firestore.DocumentData> {
    return (await this.db.firestore.doc(`reproductionTests/${id}`).get()).data();
  }

  getAll(): Observable<any> {
    return this.db.collection("reproductionTests").valueChanges();
  }

  async getAllData(): Promise<any> {
    return (await this.db.firestore.collection("reproductionTests").get()).docs
  }

  async getAllDataBySubject(subjectId: string) {
    return (await this.db.firestore.collection("reproductionTests").where('subjectId', '==', subjectId).get()).docs
  }

  async getAllDataByWithReproduction() {
    return await this.db.firestore.collection("reproductionTests").where('isReproductionTest', '==', true).get();
  }

  getAllDataBySubjectObservable(subjectId: string): Observable<any> {
    return this.db.collection("reproductionTests", ref => ref.where('subjectId', '==', subjectId)).valueChanges();
  }

  async create(data: any): Promise<void> {
    const doc = await this.db.collection("reproductionTests").add(data);
    await this.update(doc.id, { id: doc.id });
    return await this.db.doc(`subjects/${data.subjectId}`).update({ reproductionTests: firebase.firestore.FieldValue.arrayUnion(doc.id) })
  }

  async update(id: string, data: any): Promise<void> {
    return await this.db.doc(`reproductionTests/${id}`).update(data);
  }

  async delete(id: string): Promise<void> {
    return await this.db.doc(`reproductionTests/${id}`).delete();
  }
}
