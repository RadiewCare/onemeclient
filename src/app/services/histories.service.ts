import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import * as moment from "moment";

@Injectable({
  providedIn: "root"
})
export class HistoriesService {
  constructor(private db: AngularFirestore) { }

  /**
   * Devuelve un historial propio de un sujeto
   * @param subjectId Identificador del sujeto
   */
  getHistory(subjectId: string): Observable<any> {
    return this.db
      .collection(`subjects/${subjectId}/histories}`, (ref) =>
        ref.where("grade", "==", "self")
      )
      .valueChanges();
  }

  async getFamiliar(subjectId: string, familiarId: string): Promise<any> {
    console.log(subjectId, "desde servicio sid");
    console.log(familiarId, "desde servicio fid");

    return await this.db.firestore
      .doc(`subjects/${subjectId}/histories/${familiarId}`)
      .get();
  }

  /**
   *
   * @param subjectId Identificador del sujeto
   */
  getFirstGradeFamiliars(subjectId: string): Observable<any> {
    return this.db
      .collection(`subjects/${subjectId}/histories`, (ref) =>
        ref.where("grade", "==", "first")
      )
      .valueChanges();
  }

  /**
   *
   * @param subjectId Identificador del sujeto
   */
  getSecondGradeFamiliars(subjectId: string): Observable<any> {
    return this.db
      .collection(`subjects/${subjectId}/histories`, (ref) =>
        ref.where("grade", "==", "second")
      )
      .valueChanges();
  }

  /**
   * Crea un historial en un sujeto
   * @param subjectId Identificador del sujeto
   * @param data Datos a actualizar
   */
  createHistory(subjectId: string, data: any): Promise<any> {
    data.createdAt = moment().format();
    return this.db
      .collection(`subjects/${subjectId}/histories`)
      .add(data)
      .then((doc) => {
        this.db
          .doc(`subjects/${subjectId}/histories/${doc.id}`)
          .update({ id: doc.id });
      });
  }

  /**
   * Actualiza un historial de un sujeto
   * @param subjectId Identificador del sujeto
   * @param historyId Identificador del historial
   * @param data Datos a actualizar
   */
  updateHistory(
    subjectId: string,
    historyId: string,
    data: object
  ): Promise<any> {
    // TO DO: Actualizar referencias
    console.log(subjectId, "desde servicio sid");
    console.log(historyId, "desde servicio fid");
    return this.db
      .doc(`subjects/${subjectId}/histories/${historyId}`)
      .update(data);
  }

  /**
   * Elimina un historial de un sujeto
   * @param subjectId Identificador del sujeto
   * @param historyId Identificador del historial
   */
  deleteHistory(subjectId: string, historyId: string): Promise<any> {
    // TO DO: Eliminar referencias

    return this.db.doc(`subjects/${subjectId}/histories/${historyId}`).delete();
  }
}
