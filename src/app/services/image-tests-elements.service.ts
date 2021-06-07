import { Injectable } from "@angular/core";
import { ImageTestsService } from "./image-tests.service";
import { AngularFirestore } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import * as firebase from "firebase/app";

@Injectable({
  providedIn: "root"
})
export class ImageTestsElementsService {
  constructor(
    private db: AngularFirestore,
    private imageTestsService: ImageTestsService,
  ) { }

  /**
   * 
   * @returns 
   */
  getImageTestElements(): Observable<any> {
    return this.db.collection("imageTestElements").valueChanges();
  }

  /**
   * 
   * @returns 
   */
  getImageTestElementsData(): Promise<any> {
    return this.db.firestore.collection("imageTestElements").get();
  }

  /**
   * 
   * @param id 
   * @returns 
   */
  getImageTestElement(id: string): Observable<any> {
    return this.db.doc(`imageTestElements/${id}`).valueChanges();
  }

  /**
   * 
   * @param id 
   * @returns 
   */
  async getImageTestElementData(id: string): Promise<any> {
    return await this.db.firestore.doc(`imageTestElements/${id}`).get();
  }

  /**
   * 
   * @param data 
   * @param imageTest 
   * @returns 
   */
  async createImageTestElement(data: any, imageTest?: string): Promise<any> {
    if (imageTest) {
      return await this.db
        .collection("imageTestElements")
        .add(data)
        .then((doc) => {
          this.db
            .doc(`imageTestElements/${doc.id}`)
            .update({ id: doc.id })
            .then(() => {
              this.imageTestsService.updateImageTest(imageTest, {
                elements: firebase.firestore.FieldValue.arrayUnion({
                  id: doc.id,
                  name: data.name
                })
              });
            });
        });
    } else {
      return await this.db
        .collection("imageTestElements")
        .add(data)
        .then((doc) => {
          this.db.doc(`imageTestElements/${doc.id}`).update({ id: doc.id }).then(() => {
            if (data.relatedTests.length === 1) {
              this.db.firestore.doc(`imageTestElements/${doc.id}`).get().then(testElement => {
                this.imageTestsService.updateImageTest(data.relatedTests[0], {
                  elements: firebase.firestore.FieldValue.arrayUnion({
                    id: doc.id,
                    name: testElement.data().name,
                    options: testElement.data().options,
                    order: 0,
                  })
                })
              })
            }
          });
        });
    }
  }

  /**
   * 
   * @param id 
   * @param data 
   * @returns 
   */
  async updateImageTestElement(id: string, data: any): Promise<any> {
    // TODO: Actualizar las pruebas que contengan este elemento comprobando que los valores existentes pueden editarse
    return await this.db.doc(`imageTestElements/${id}`).update(data);
  }

  /**
   * 
   * @param id Identificador del elemento
   * @returns Una promesa de conclusión de la operación en la base de datos
   */
  async deleteImageTestElement(id: string): Promise<any> {
    // TODO: Borrar de las pruebas que contengan este elemento la referencia
    return await this.db.doc(`imageTestElements/${id}`).delete();
  }

  /**
   * Crea un código para incluir en las nomenclaturas de imagen e impedir que haya dos archivos de nombres repetidos en el storage
   * @returns Un código random de 8 dígitos
   */
  createImageCode() {
    const dictionary = ["A", "9", "B", "C", "8", "D", "F", "G", "H", "J", "1", "K", "L", "M", "N", "Ñ", "2", "P", "Q", "R", "S", "T", "V", "3", "W", "X", "Y", "Z", "a", "b",
      "4", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "ñ", "o", "5", "p", "q", "6", "r", "s", "t", "7", "u", "v", "w", "x", "y", "z"
    ];
    let returnedCode = "";

    for (let index = 0; index < 8; index++) {
      returnedCode += dictionary[Math.floor(Math.random() * dictionary.length - 1 + 1)];
    }

    return returnedCode;
  }
}
