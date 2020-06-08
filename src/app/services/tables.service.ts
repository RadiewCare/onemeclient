import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class TablesService {
  constructor(private db: AngularFirestore) {}

  /**
   * Devuelve todas las tablas o de un usuario concreto
   * @param userId Identificador del usuario
   */
  getTables(userId: string): Observable<any> {
    return this.db.collection(`doctors/${userId}/tables`).valueChanges();
  }

  /**
   * Recoge los datos de una tabla de un usuario concreto como observable
   * @param userId Identificador del usuario
   * @param tableId Identificador de la tabla
   */
  getTable(userId: string, tableId: string): Observable<any> {
    return this.db.doc(`doctors/${userId}/tables/${tableId}`).valueChanges();
  }

  /**
   * Recoge los datos de una tabla de un usuario concreto
   * @param userId Identificador del usuario
   * @param tableId Identificador de la tabla
   */
  getTableData(userId: string, tableId: string): Promise<any> {
    return this.db.firestore.doc(`doctors/${userId}/tables/${tableId}`).get();
  }

  /**
   * Crea una tabla de configuración en un usuario concreto
   * @param userId Identificador del usuario
   * @param body Datos de la tabla
   */
  async createTable(userId: string, body: any): Promise<any> {
    return this.db
      .collection(`doctors/${userId}/tables`)
      .add(body)
      .then((doc) => {
        this.db
          .doc(`doctors/${userId}/tables/${doc.id}`)
          .update({ id: doc.id });
      });
  }

  /**
   * Edita una tabla de configuración de un usuario concreto
   * @param userId Identificador del usuario
   * @param tableId Identificador de la tabla
   * @param body Datos de la tabla
   */
  async updateTable(userId: string, tableId: string, body: any): Promise<any> {
    return this.db.doc(`doctors/${userId}/tables/${tableId}`).update(body);
  }

  /**
   * Elimina una tabla de configuración de un usuario concreto
   * @param userId Identificador del usuario
   * @param tableId Identificador de la tabla
   */
  async deleteTable(userId: string, tableId: string): Promise<any> {
    return this.db.doc(`doctors/${userId}/tables/${tableId}`).delete();
  }
}
