import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class ImageTestsService {
  constructor(private db: AngularFirestore) {}

  getImageTests(): Observable<any> {
    return this.db
      .collection("imageTests", (ref) => ref.orderBy("name"))
      .valueChanges();
  }

  getImageTest(id: string): Observable<any> {
    return this.db.doc(`imageTests/${id}`).valueChanges();
  }

  async getImageTestData(id: string): Promise<any> {
    return await this.db.firestore.doc(`imageTests/${id}`).get();
  }

  async createImageTest(data: any): Promise<any> {
    return await this.db
      .collection("imageTests")
      .add(data)
      .then((doc) => {
        this.db.doc(`imageTests/${doc.id}`).update({ id: doc.id });
      });
  }

  async updateImageTest(id: string, data: any): Promise<any> {
    return await this.db.doc(`imageTests/${id}`).update(data);
  }

  async deleteImageTest(id: string): Promise<any> {
    return await this.db.doc(`imageTests/${id}`).delete();
  }
}
