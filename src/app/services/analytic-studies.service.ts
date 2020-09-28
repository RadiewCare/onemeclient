import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { SubjectsService } from "./subjects.service";
import * as moment from "moment";

@Injectable({
  providedIn: "root"
})
export class AnalyticStudiesService {
  constructor(
    private db: AngularFirestore,
    private subjectsService: SubjectsService
  ) {}

  /**
   * Devuelve todos los estudios analíticos de un sujeto ordenados por fecha descendente
   * @param subjectId Identificador del sujeto
   */
  getAnalyticStudies(subjectId: string): Observable<any> {
    return this.db
      .collection(`subjects/${subjectId}/analysisStudies`, (ref) =>
        ref.orderBy("date", "desc")
      )
      .valueChanges();
  }

  /**
   * Devuelve un estudio analítico concreto de un sujeto
   * @param subjectId Identificador del sujeto
   * @param analysisId Identificador del análisis
   */
  getAnalyticStudy(subjectId: string, analysisId: string): Observable<any> {
    return this.db
      .doc(`subjects/${subjectId}/analysisStudies/${analysisId}`)
      .valueChanges();
  }

  /**
   * Crea un estudio analítico en un sujeto
   * @param subjectId Identificador del sujeto
   * @param data Datos del estudio analítico
   */
  async createAnalysisStudy(subjectId: string, data): Promise<any> {
    await this.db
      .collection(`subjects/${subjectId}/analysisStudies`)
      .add(data)
      .then((doc) => {
        this.db
          .doc(`subjects/${subjectId}/analysisStudies/${doc.id}`)
          .update({ id: doc.id })
          .then(() => {
            this.subjectsService.updateSubject(subjectId, {
              hasClinicAnalysis: true
            });
          });
      });
  }

  /**
   * Actualiza un estudio analítico de un sujeto
   * @param subjectId Identificador del sujeto
   * @param analysisId Identificador del estudio analítico
   * @param data Datos del estudio analítico a actualizar
   */
  updateAnalyticStudy(subjectId: string, analysisId: string, data: any) {
    data.updatedAt = moment().format();
    return this.db
      .doc(`subjects/${subjectId}/analysisStudies/${analysisId}`)
      .update(data);
  }

  /**
   * Elimina un estudio analítico de un sujeto
   * @param subjectId Identificador del sujeto
   * @param analysisId Identificador del estudio analítico
   */
  async deleteAnalysisStudy(
    subjectId: string,
    analysisId: string
  ): Promise<any> {
    this.db
      .doc(`subjects/${subjectId}/analysisStudies/${analysisId}`)
      .delete()
      .then(() => {
        this.db.firestore
          .collection(`subjects/${subjectId}/analysisStudies`)
          .get()
          .then((dataDocs: any) => {
            if (dataDocs.docs.length === 0) {
              this.db.doc(`subjects/${subjectId}`).update({
                hasClinicAnalysis: false
              });
            }
          });
      });
  }
}
