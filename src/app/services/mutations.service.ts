import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AngularFirestore } from "@angular/fire/firestore";

@Injectable({
  providedIn: "root"
})
export class MutationsService {
  constructor(private db: AngularFirestore) {}

  /**
   * Devuelve todas las mutaciones (orden opcional)
   */
  getMutations(order?: string): Observable<any> {
    if (order) {
      return this.db
        .collection("mutations", (ref) => ref.orderBy(order))
        .valueChanges();
    } else {
      return this.db.collection("mutations").valueChanges();
    }
  }

  getMutationsData(order?: string): Promise<any> {
    if (order) {
      return this.db.firestore.collection("mutations").orderBy(order).get();
    } else {
      return this.db.firestore.collection("mutations").get();
    }
  }

  /**
   * Recoge los datos de una variante genética como observable
   * @param id Identificador de La mutación
   */
  getMutation(id: string): Observable<any> {
    return this.db.doc(`mutations/${id}`).valueChanges();
  }

  /**
   * Recoge los datos de una variante genética
   * @param id Identificador de La mutación
   */
  async getMutationData(id: string): Promise<any> {
    return await this.db.firestore.doc(`mutations/${id}`).get();
  }

  /**
   * Recoge los datos de una variante genética
   * @param id Identificador de La mutación
   */
  async getMutationDataByName(name: string): Promise<any> {
    return await this.db.firestore
      .collection("mutations")
      .where("name", "==", name)
      .get();
  }

  /**
   * Crea una variante genética
   * @param data Datos de La mutación
   */
  async createMutation(data: any): Promise<any> {
    const genes = data.genes.split(",");
    genes.forEach((element) => {
      element = element.trim();
    });
    data.genes = genes;
    return await this.db.firestore
      .collection("mutations")
      .where("name", "==", data.name)
      .get()
      .then((mutations) => {
        if (mutations.size === 0) {
          return this.db
            .collection("mutations")
            .add(data)
            .then((doc) => {
              this.db.doc(`mutations/${doc.id}`).update({ id: doc.id });
            });
        } else {
          return Promise.reject("La mutación ya existe");
        }
      });
  }

  /**
   * Modifica una variante genética
   * @param id Identificador de La mutación
   * @param data Datos de La mutación
   */
  async updateMutation(id: string, data: any): Promise<any> {
    return await this.db.doc(`mutations/${id}`).update(data);
  }

  /**
   * Elimina una variante genética
   * @param id Identificador de La mutación
   */
  async deleteMutation(id: string): Promise<any> {
    return await this.db.doc(`mutations/${id}`).delete();
  }

  async import(data: any): Promise<any> {
    data.forEach((element) => {
      this.createMutation(element);
    });
  }
}
