import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AngularFirestore } from "@angular/fire/firestore";

@Injectable({
  providedIn: "root"
})
export class SymptomsService {
  constructor(private db: AngularFirestore) {}

  /**
   * Recoge los datos de un síntoma como observable
   * @param id Identificador del síntoma
   */
  getSymptom(id: string): Observable<any> {
    return this.db.doc(`symptoms/${id}`).valueChanges();
  }

  /**
   * Recoge los datos de un síntoma como promesa
   * @param id Identificador del síntoma
   */
  async getSymptomData(id: string): Promise<any> {
    return await this.db.firestore.doc(`symptoms/${id}`).get();
  }

  /**
   * Recoge un listado de síntomas (orden opcional)
   */
  getSymptoms(order?: string): Observable<any> {
    if (order) {
      return this.db
        .collection("symptoms", (ref) => ref.orderBy(order))
        .valueChanges();
    } else {
      return this.db.collection("symptoms").valueChanges();
    }
  }

  getSymptomsData(order?: string): Promise<any> {
    if (order) {
      return this.db.firestore.collection("symptoms").orderBy(order).get();
    } else {
      return this.db.firestore.collection("symptoms").get();
    }
  }

  /**
   * Crea un síntoma
   * @param data Datos del síntoma
   */
  async createSymptom(data: any): Promise<any> {
    return await this.db.firestore
      .collection("symptoms")
      .where("name", "==", data.name)
      .get()
      .then((symptoms) => {
        if (symptoms.size === 0) {
          return this.db
            .collection("symptoms")
            .add(data)
            .then((doc) => {
              this.db.doc(`symptoms/${doc.id}`).update({ id: doc.id });
            });
        } else {
          return Promise.reject("El síntoma ya existe");
        }
      });
  }

  /**
   * Modifica un síntoma
   * @param id Identificador del síntoma
   * @param data Datos del síntoma
   */
  async updateSymptom(id: string, data: any): Promise<any> {
    return await this.db.doc(`symptoms/${id}`).update(data);
  }

  /**
   * Elimina una variante genética
   * @param id Identificador de el polimorfismo
   */
  async deleteSymptom(id: string): Promise<any> {
    return await this.db.doc(`symptoms/${id}`).delete();
  }
}
