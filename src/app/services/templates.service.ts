import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AngularFirestore } from "@angular/fire/firestore";

@Injectable({
  providedIn: "root"
})
export class TemplatesService {
  constructor(private db: AngularFirestore) {}

  getTemplates(userId: string): Observable<any> {
    return this.db.collection(`doctors/${userId}/templates`).valueChanges();
  }

  getTemplate(userId: string, templateId: string): Observable<any> {
    return this.db
      .doc(`doctors/${userId}/templates/${templateId}`)
      .valueChanges();
  }

  async getTemplateData(userId: string, templateId: string): Promise<any> {
    return this.db.firestore
      .doc(`doctors/${userId}/templates/${templateId}`)
      .get();
  }

  async createTemplate(userId: string, data: object): Promise<any> {
    return await this.db.collection(`doctors/${userId}/templates`).add(data);
  }

  async updateTemplate(
    userId: string,
    templateId: string,
    data: object
  ): Promise<any> {
    return this.db
      .doc(`doctors/${userId}/templates/${templateId}`)
      .update(data);
  }

  async deleteTemplate(userId: string, templateId: string): Promise<any> {
    return this.db.doc(`doctors/${userId}/templates/${templateId}`).delete();
  }
}
