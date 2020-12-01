import { Injectable } from "@angular/core";
import { ImageTestsService } from "./image-tests.service";
import { AngularFirestore } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import * as firebase from "firebase/app";
import { DiseasesService } from './diseases.service';

@Injectable({
  providedIn: "root"
})
export class ImageTestsElementsService {
  constructor(
    private db: AngularFirestore,
    private imageTestsService: ImageTestsService,
  ) { }

  getImageTestElements(): Observable<any> {
    return this.db.collection("imageTestElements").valueChanges();
  }

  getImageTestElementsData(): Promise<any> {
    return this.db.firestore.collection("imageTestElements").get();
  }

  getImageTestElement(id: string): Observable<any> {
    return this.db.doc(`imageTestElements/${id}`).valueChanges();
  }

  async getImageTestElementData(id: string): Promise<any> {
    return await this.db.firestore.doc(`imageTestElements/${id}`).get();
  }

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

  async updateImageTestElement(id: string, data: any): Promise<any> {
    // TODO: Actualizar las pruebas que contengan este elemento comprobando que los valores existentes pueden editarse
    return await this.db.doc(`imageTestElements/${id}`).update(data);

  }

  async deleteImageTestElement(id: string): Promise<any> {
    // TODO: Borrar de las pruebas que contengan este elemento la referencia
    return await this.db.doc(`imageTestElements/${id}`).delete();
  }
}
