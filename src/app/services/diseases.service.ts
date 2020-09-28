import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AngularFirestore } from "@angular/fire/firestore";

@Injectable({
  providedIn: "root"
})
export class DiseasesService {
  constructor(private db: AngularFirestore) {}

  resetOddRatios(): Promise<any> {
    return this.db.firestore
      .collection("diseases")
      .get()
      .then((diseases) => {
        diseases.docs.forEach((doc) => {
          this.updateDisease(doc.data().id, {
            averageOddRatio: 0,
            averageProductRatio: 1
          });
        });
      });
  }

  getDiseases(): Observable<any> {
    return this.db
      .collection("diseases", (ref) => ref.orderBy("name"))
      .valueChanges();
  }

  getDiseasesData(): Promise<any> {
    return this.db.firestore.collection("diseases").orderBy("name").get();
  }

  getDisease(id: string): Observable<any> {
    return this.db.doc(`diseases/${id}`).valueChanges();
  }

  getDiseaseData(id: string) {
    return this.db.firestore.doc(`diseases/${id}`).get();
  }

  async createDisease(data: any): Promise<any> {
    return await this.db
      .collection("diseases")
      .add(data)
      .then((doc) => {
        this.db.doc(`diseases/${doc.id}`).update({ id: doc.id });
      });
  }

  async updateDisease(id: string, data: any): Promise<any> {
    return await this.db.doc(`diseases/${id}`).update(data);
  }

  async deleteDisease(id: string): Promise<any> {
    return await this.db.doc(`diseases/${id}`).delete();
  }
}
