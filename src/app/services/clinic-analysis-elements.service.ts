import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AngularFirestore } from "@angular/fire/firestore";
import * as firebase from "firebase";

@Injectable({
  providedIn: "root"
})
export class ClinicAnalysisElementsService {
  constructor(private db: AngularFirestore) { }

  getClinicAnalysisElements(): Observable<any> {
    return this.db
      .collection("clinicAnalysisElements", (ref) => ref.where("format", "==", "synlab").orderBy("category").orderBy("name"))
      .valueChanges();
  }

  async getClinicAnalysisElementsData(): Promise<any> {
    return await this.db.firestore
      .collection("clinicAnalysisElements").where("format", "==", "synlab")
      .get();
  }

  getClinicAnalysisElementsList(): Observable<any> {
    return this.db
      .collection("clinicAnalysisElements", (ref) => ref.where("format", "==", "synlab").orderBy("name"))
      .valueChanges();
  }

  getClinicAnalysisElement(id: string): Observable<any> {
    return this.db.doc(`clinicAnalysisElements/${id}`).valueChanges();
  }

  getClinicAnalysisElementData(id: string): Promise<any> {
    return this.db.firestore.doc(`clinicAnalysisElements/${id}`).get();
  }

  async createClinicAnalysisElement(data: any): Promise<any> {
    return await this.db
      .collection("clinicAnalysisElements")
      .add(data)
      .then((doc) => {
        this.db.doc(`clinicAnalysisElements/${doc.id}`).update({ id: doc.id });
      });
  }

  async updateClinicAnalysisElement(id: string, data: any): Promise<any> {
    return await this.db.doc(`clinicAnalysisElements/${id}`).update(data);
  }

  async deleteClinicAnalysisElement(id: string): Promise<any> {
    return await this.db.doc(`clinicAnalysisElements/${id}`).delete();
  }

  async insertTest(id: string, elementId: string, codigo: string, descripcion: string) {
    console.log(id, elementId);

    const element = (await this.getClinicAnalysisElementData(elementId)).data();
    console.log(element, "dentro");


    if (element.ranges) {
      // cojo el primer rango y le miro el testId
      const primero = element.ranges[0];
      // filtro los elementos que tienen ese testId
      const result = element.ranges.filter(el => el.testId == primero.testId);
      // cojo esa info le cambio la testId

      result.forEach(element => {
        element.testId = id;
        element.CODIGO = codigo;
        element.DESCRIPCION = descripcion;
        this.updateClinicAnalysisElement(elementId, {
          ranges: firebase.firestore.FieldValue.arrayUnion(element),
          relatedTests: firebase.firestore.FieldValue.arrayUnion(element.testId)
        })
      });
    }

  }
}
