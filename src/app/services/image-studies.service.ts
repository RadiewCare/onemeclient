import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import * as firebase from "firebase/app";

@Injectable({
  providedIn: "root"
})
export class ImageStudiesService {
  constructor(private db: AngularFirestore) {}

  getImageAnalysis(userId: string): Observable<any> {
    return this.db
      .collection(`subjects/${userId}/imageAnalysis`)
      .valueChanges();
  }

  createImageAnalysis(userId: string, data: object): Promise<any> {
    return this.db.doc(`subjects/${userId}`).update(data);
  }

  /**
   * Añade una prueba de imagen con valores en el usuario
   * @param userId Identificador del usuario
   * @param data Datos de la prueba de imagen
   */
  async addImageTest(userId: string, data: any): Promise<any> {
    this.db.doc(`subjects/${userId}`).update({
      imageTests: firebase.firestore.FieldValue.arrayUnion({
        values: data.values,
        date: data.date,
        name: data.name,
        imageTestId: data.imageTestId,
        status: data.status,
        shortcode: data.shortcode
      }),
      hasImageAnalysis: true
    });
  }
}
