import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AngularFirestore } from "@angular/fire/firestore";

@Injectable({
  providedIn: "root"
})
export class ClinicAnalysisElementsService {
  constructor(private db: AngularFirestore) {}

  getClinicAnalysisElements(): Observable<any> {
    return this.db
      .collection("clinicAnalysisElements", (ref) => ref.orderBy("category"))
      .valueChanges();
  }

  getClinicAnalysisElement(id: string): Observable<any> {
    return this.db.doc(`clinicAnalysisElements/${id}`).valueChanges();
  }

  getClinicAnalysisElementData(id: string): Promise<any> {
    return this.db.firestore.doc(`clinicAnalysisElements/${id}`).get();
  }

  async createClinicAnalysisElement(data: any): Promise<any> {
    return await this.db
      .collection("clinicAnalysisElements")
      .add(data)
      .then((doc) => {
        this.db.doc(`clinicAnalysisElements/${doc.id}`).update({ id: doc.id });
      });
  }

  async updateClinicAnalysisElement(id: string, data: any): Promise<any> {
    return await this.db.doc(`clinicAnalysisElements/${id}`).update(data);
  }

  async deleteClinicAnalysisElement(id: string): Promise<any> {
    return await this.db.doc(`clinicAnalysisElements/${id}`).delete();
  }
}
