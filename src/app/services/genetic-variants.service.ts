import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AngularFirestore } from "@angular/fire/firestore";

@Injectable({
  providedIn: "root"
})
export class GeneticVariantsService {
  constructor(private db: AngularFirestore) {}

  /**
   * Recoge un listado de variantes genéticas (orden opcional)
   */
  getGeneticVariants(order?: string): Observable<any> {
    if (order) {
      return this.db
        .collection("geneticVariants", (ref) => ref.orderBy(order))
        .valueChanges();
    } else {
      return this.db.collection("geneticVariants").valueChanges();
    }
  }

  /**
   * Recoge los datos de una variante genética como observable
   * @param id Identificador de la variante genética
   */
  getGeneticVariant(id: string): Observable<any> {
    return this.db.doc(`geneticVariants/${id}`).valueChanges();
  }

  /**
   * Recoge los datos de una variante genética
   * @param id Identificador de la variante genética
   */
  async getGeneticVariantData(id: string): Promise<any> {
    return await this.db.firestore.doc(`geneticVariants/${id}`).get();
  }

  /**
   * Recoge los datos de una variante genética
   * @param id Identificador de la variante genética
   */
  async getGeneticVariantDataByName(name: string): Promise<any> {
    return await this.db.firestore
      .collection("geneticVariants")
      .where("name", "==", name)
      .get();
  }

  /**
   * Crea una variante genética
   * @param data Datos de la variante genética
   */
  async createGeneticVariant(data: any): Promise<any> {
    return await this.db.firestore
      .collection("geneticVariants")
      .where("name", "==", data.name)
      .get()
      .then((geneticVariants) => {
        if (geneticVariants.size === 0) {
          return this.db
            .collection("geneticVariants")
            .add(data)
            .then((doc) => {
              this.db.doc(`geneticVariants/${doc.id}`).update({ id: doc.id });
            });
        } else {
          return Promise.reject("La variante genética ya existe");
        }
      });
  }

  /**
   * Modifica una variante genética
   * @param id Identificador de la variante genética
   * @param data Datos de la variante genética
   */
  async updateGeneticVariant(id: string, data: any): Promise<any> {
    return await this.db.firestore
      .collection("geneticVariants")
      .where("name", "==", data.name)
      .get()
      .then((geneticVariants) => {
        if (geneticVariants.size === 0) {
          return this.db.doc(`geneticVariants/${id}`).update(data);
        } else {
          return Promise.reject("La variante genética ya existe");
        }
      });
  }

  /**
   * Elimina una variante genética
   * @param id Identificador de la variante genética
   */
  async deleteGeneticVariant(id: string): Promise<any> {
    return await this.db.doc(`geneticVariants/${id}`).delete();
  }
}
