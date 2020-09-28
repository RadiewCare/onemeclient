import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class PolymorphismsService {
  constructor(private db: AngularFirestore) {}

  /**
   * Recoge un listado de variantes genéticas (orden opcional)
   */
  getPolymorphisms(order?: string): Observable<any> {
    if (order) {
      return this.db
        .collection("polymorphisms", (ref) => ref.orderBy(order))
        .valueChanges();
    } else {
      return this.db.collection("polymorphisms").valueChanges();
    }
  }

  getPolymorphismsData(order?: string): Promise<any> {
    if (order) {
      return this.db.firestore.collection("polymorphisms").orderBy(order).get();
    } else {
      return this.db.firestore.collection("polymorphisms").get();
    }
  }

  /**
   * Recoge los datos de una variante genética como observable
   * @param id Identificador de el polimorfismo
   */
  getPolymorphism(id: string): Observable<any> {
    return this.db.doc(`polymorphisms/${id}`).valueChanges();
  }

  /**
   * Recoge los datos de una variante genética
   * @param id Identificador de el polimorfismo
   */
  async getPolymorphismData(id: string): Promise<any> {
    return await this.db.firestore.doc(`polymorphisms/${id}`).get();
  }

  /**
   * Recoge los datos de una variante genética
   * @param id Identificador de el polimorfismo
   */
  async getPolymorphismDataByName(name: string): Promise<any> {
    return await this.db.firestore
      .collection("polymorphisms")
      .where("name", "==", name)
      .get();
  }

  /**
   * Crea una variante genética
   * @param data Datos de el polimorfismo
   */
  async createPolymorphism(data: any): Promise<any> {
    if (data.genes) {
      const genes = data.genes.split(",");
      genes.forEach((element) => {
        element = element.trim();
      });
      data.genes = genes;
    }

    return await this.db.firestore
      .collection("polymorphisms")
      .where("name", "==", data.name)
      .get()
      .then((polymorphisms) => {
        if (polymorphisms.size === 0) {
          return this.db
            .collection("polymorphisms")
            .add(data)
            .then((doc) => {
              this.db.doc(`polymorphisms/${doc.id}`).update({ id: doc.id });
            });
        } else {
          return Promise.reject("El polimorfismo ya existe");
        }
      });
  }

  /**
   * Modifica una variante genética
   * @param id Identificador de el polimorfismo
   * @param data Datos de el polimorfismo
   */
  async updatePolymorphism(id: string, data: any): Promise<any> {
    return await this.db.doc(`polymorphisms/${id}`).update(data);
  }

  /**
   * Elimina una variante genética
   * @param id Identificador de el polimorfismo
   */
  async deletePolymorphism(id: string): Promise<any> {
    return await this.db.doc(`polymorphisms/${id}`).delete();
  }

  async import(data: any): Promise<any> {
    data.forEach((element) => {
      this.createPolymorphism(element);
    });
  }
}
