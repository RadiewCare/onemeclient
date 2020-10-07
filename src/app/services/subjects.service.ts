import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import * as moment from "moment";

@Injectable({
  providedIn: "root"
})
export class SubjectsService {
  constructor(private db: AngularFirestore) { }

  /**
   * Devuelve todos los sujetos como observable
   * @param order Orden a aplicar (opcional)
   */
  getSubjects(order?: string): Observable<any> {
    if (order) {
      return this.db
        .collection("subjects", (ref) => ref.orderBy(order))
        .valueChanges();
    } else {
      return this.db.collection("subjects").valueChanges();
    }
  }

  /**
   * Devuelve todos los sujetos como promesa
   * @param order Orden a aplicar (opcional)
   */
  getSubjectsData(order?: string): Promise<any> {
    if (order) {
      return this.db.firestore.collection("subjects").orderBy(order).get();
    } else {
      return this.db.firestore.collection("subjects").get();
    }
  }

  getSubjectsByDoctor(id: string): Promise<any> {
    return this.db.firestore
      .collection("subjects")
      .get()
      .then((data) => {
        return data.docs.filter(
          (subject) =>
            subject.data().mainDoctor === id
        );
      });
  }

  /**
   * Devuelve un sujeto como observable
   * @param subjectId Identificador del sujeto
   */
  getSubject(subjectId: string): Observable<any> {
    return this.db.doc(`subjects/${subjectId}`).valueChanges();
  }

  /**
   * Devuelve un sujeto como promesa
   * @param subjectId Identificador del sujeto
   */
  getSubjectData(subjectId: string): Promise<any> {
    return this.db.firestore.doc(`subjects/${subjectId}`).get();
  }

  /**
   * Devuelve un sujeto como observable
   * @param subjectId Identificador del sujeto
   */
  getSubjectByDoctor(doctorId: string): Observable<any> {
    return this.db
      .collection(`subjects`, (ref) =>
        ref.where("doctors", "array-contains", doctorId).orderBy("identifier", "asc")
      )
      .valueChanges();
  }

  /**
   * Crea un sujeto
   * @param data Datos del sujeto
   */
  async createSubject(data: any): Promise<any> {
    return this.getSubjectsByDoctor(data.mainDoctor).then(async subjects => {
      if (subjects.length > 0) {
        let found = false;

        for await (const subject of subjects) {
          if (subject.data().identifier.trim().toLowerCase() === data.identifier.trim().toLowerCase()) {
            found = true;
          }
        }

        if (found) {
          return new Promise((resolve, reject) => {
            reject("El identificador ya está en uso")
          })
        } else {
          data.createdAt = moment().format();
          return this.db
            .collection("subjects")
            .add(data)
            .then((doc) => {
              this.db.doc(`subjects/${doc.id}`).update({ id: doc.id });
            });
        }
      }
    });

  }

  /**
   * Actualiza un sujeto
   * @param id Identificador del sujeto
   * @param data Datos del sujeto
   */
  updateSubject(id: string, data: any): Promise<any> {
    // TO DO: Actualizar dependencias

    data.updatedAt = moment().format();
    return this.db.doc(`subjects/${id}`).update(data);
  }

  /**
   * Elimina un sujeto
   * @param id Identificador del sujeto
   */
  deleteSubject(id: string): Promise<any> {
    // TO DO: Eliminar dependencias

    return this.db.doc(`subjects/${id}`).delete();
  }

  async importAnalyticData(id: string, csvData: any): Promise<any> {
    console.log(csvData);
    console.log(Object.keys(csvData[0]));

    const values = [];
    const analysisElements = [];

    // Consigo los elementos de análisis configurados en la base de datos y los meto en un array
    await this.db.firestore
      .collection(`clinicAnalysisElements`)
      .get()
      .then(async (aes) => {
        for await (const ae of aes.docs) {
          analysisElements.push(ae.data());
        }
        console.log(analysisElements);
      });

    // Mapeo un array con los nombres de los elementos de análisis
    const analysisNames = analysisElements.map(
      (element) => (element = element.name)
    );

    console.log(analysisNames);

    for await (const element of Object.keys(csvData[0])) {
      console.log(element);
      if (analysisNames.includes(element) && csvData[0][element]) {
        console.log(element);

        const analysisElement = analysisElements.filter(
          (anael) => anael.name === element
        );
        console.log(analysisElement);

        values.push({
          category: analysisElement[0].category,
          id: analysisElement[0].id,
          metricUnit: analysisElement[0].metricUnit,
          name: analysisElement[0].name,
          ranges: analysisElement[0].ranges || null,
          relatedDiseases: null,
          status: null,
          value: csvData[0][element]
        });
      }
    }
    console.log(values);

    // createAnalysis en sujeto con estos datos
    const data = {
      date: moment().format(),
      values,
      shortcode:
        "[ANA" + Math.floor(Math.random() * 1000 + 1).toString(10) + "]",
      createdAt: moment().format()
    };
    console.log(data);

    return await this.db
      .collection(`subjects/${id}/analysisStudies`)
      .add(data)
      .then((doc) => {
        this.db
          .doc(`subjects/${id}/analysisStudies/${doc.id}`)
          .update({ id: doc.id });
      });
  }
}
