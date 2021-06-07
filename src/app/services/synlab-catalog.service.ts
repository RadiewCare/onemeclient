import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SynlabCatalogService {

  constructor(private db: AngularFirestore) { }

  getClinicAnalysisElements(): Observable<any> {
    return this.db
      .collection("synlabCatalog")
      .valueChanges();
  }

  async getClinicAnalysisElementsData(): Promise<any> {
    return await this.db.firestore
      .collection("synlabCatalog")
      .get();
  }

  getDefaultClinicAnalysisElements(): Observable<any> {
    return this.db
      .collection("synlabCatalog", ref => ref.where('isDefault', '==', true))
      .valueChanges();
  }

  getClinicAnalysisElementsList(): Promise<any> {
    return this.db.firestore
      .collection("synlabCatalog")
      .get();
  }

  getClinicAnalysisElement(id: string): Observable<any> {
    return this.db.doc(`synlabCatalog/${id}`).valueChanges();
  }

  getClinicAnalysisElementData(id: string): Promise<any> {
    return this.db.firestore.doc(`synlabCatalog/${id}`).get();
  }

  async createClinicAnalysisElement(data: any): Promise<any> {
    return await this.db
      .collection("synlabCatalog")
      .add(data)
      .then((doc) => {
        this.db.doc(`synlabCatalog/${doc.id}`).update({ id: doc.id });
      });
  }

  async updateClinicAnalysisElement(id: string, data: any): Promise<any> {
    return await this.db.doc(`synlabCatalog/${id}`).update(data);
  }

  async deleteClinicAnalysisElement(id: string): Promise<any> {
    return await this.db.doc(`synlabCatalog/${id}`).delete();
  }
}
