import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import * as moment from "moment";
import * as firebase from "firebase/app";
import { ToastService } from "./toast.service";

@Injectable({
  providedIn: "root"
})
export class SubjectsService {
  constructor(private db: AngularFirestore, private toastService: ToastService) { }

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
        ref.where("mainDoctor", "==", doctorId).orderBy("identifier", "asc")
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
      } else {
        data.createdAt = moment().format();
        return this.db
          .collection("subjects")
          .add(data)
          .then((doc) => {
            this.db.doc(`subjects/${doc.id}`).update({ id: doc.id });
          });
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

  async importAnalyticData(id: string, csvData: any, filename: string, date: string): Promise<any> {
    console.log(csvData);

    const values = [];
    let analysisElements = [];

    // Consigo los elementos de análisis configurados en la base de datos y los meto en un array
    await this.db.firestore
      .collection(`clinicAnalysisElements`)
      .get()
      .then(async (aes) => {
        analysisElements = aes.docs.map((element: any) => (element = element.data()));
        console.log(analysisElements);
      });

    let subject: any;
    let age: any;
    let genre: any;

    this.getSubjectData(id).then(async data => {
      subject = data.data();

      if (subject.history) {
        // Normalizamos al formato Synlab
        age = subject.history.age;
        switch (subject.history.genre) {
          case "varon":
            genre = "Hombres"
            break;
          case "hembra":
            genre = "Mujeres"
            break;
          default:
            break;
        }
      }

      if (age && genre) {
        for await (const element of csvData) {

          if (typeof element.RESULTADO === 'string') {
            element.RESULTADO = parseFloat(element.RESULTADO.replace(/,/, '.').replace(">", "").replace("<", ""));
          }

          console.log("RESULTADO DEL EXCEL UNA VEZ LIMPIADO", element.RESULTADO);

          let status = "normal";

          let meaning = "negative"

          const analysisElement = analysisElements.find(
            (anael) => anael.elementCode === element.ID_ANALISIS
          );

          console.log("ELEMENTO ENCONTRADO", analysisElement);

          // CALCULAR STATUS

          if (analysisElement && analysisElement.ranges) {
            for await (const rango of analysisElement.ranges) {
              // Comprobación de sexo y edad
              if (age && genre) {
                if (
                  rango.UNIDAD_INTERVALO_EDAD === "Años" &&
                  (rango.SEXO == genre || rango.SEXO == "Ambos") &&
                  rango.INTERVALO_INF_EDAD <= age &&
                  rango.INTERVALO_SUP_EDAD >= age
                ) {

                  if (typeof rango.LIM_SUP === 'string') {
                    rango.LIM_SUP = parseFloat(rango.LIM_SUP.replace(/,/, '.'));
                  }

                  if (typeof rango.LIM_INF === 'string') {
                    rango.LIM_INF = parseFloat(rango.LIM_INF.replace(/,/, '.'));
                  }

                  if (rango.INTERPRETACION && rango.INTERPRETACION === "Positivo") {
                    if (rango.LIM_INF > element.RESULTADO) {
                      status = "low";
                      meaning = "negative";
                    } else if (rango.LIM_SUP < element.RESULTADO) {
                      status = "high";
                      meaning = "negative";
                    } else if (rango.LIM_SUP >= element.RESULTADO && rango.LIM_INF <= element.RESULTADO) {
                      status = "normal";
                      meaning = "positive";
                    }
                  } else if (element.INTERPRETACION && element.INTERPRETACION === "Negativo") {
                    if (rango.LIM_INF > element.RESULTADO) {
                      status = "low";
                      meaning = "positive";
                    } else if (rango.LIM_SUP < element.RESULTADO) {
                      status = "high";
                      meaning = "positive";
                    } else if (rango.LIM_SUP >= element.RESULTADO && rango.LIM_INF <= element.RESULTADO) {
                      status = "normal";
                      meaning = "negative";
                    }
                  } else {
                    if (rango.LIM_INF > element.RESULTADO) {
                      status = "low";
                      meaning = "positive";
                    } else if (rango.LIM_SUP < element.RESULTADO) {
                      status = "high";
                      meaning = "positive";
                    } else if (rango.LIM_SUP >= element.RESULTADO && rango.LIM_INF <= element.RESULTADO) {
                      status = "normal";
                      meaning = "negative";
                    }
                  }

                }
              }
            }

          } else if (analysisElement === undefined) {
            this.toastService.show("danger", "No se encuentra elemento con el código: " + element.ID_ANALISIS);
            console.log("no se encuentra código", element.ID_ANALISIS);

          } else if (analysisElement && (analysisElement.ranges === undefined || analysisElement.ranges === null || analysisElement.ranges.length === 0)) {
            this.toastService.show("danger", "No se encuentran rangos en el elemento con el código: " + element.ID_ANALISIS);
            console.log("no se encuentra rango", element.ID_ANALISIS);
          }


          // FIN DE CALCULO DE STATUS

          if (analysisElement) {
            values.push({
              id: analysisElement.id,
              name: analysisElement.name.trim() || null,
              ranges: analysisElement.ranges || null,
              status: status,
              meaning: meaning,
              value: element.RESULTADO
            });
          }

        }

        console.log(values);
        // createAnalysis en sujeto con estos datos
        const result = {
          date: date,
          values,
          shortcode:
            "[ANA" + Math.floor(Math.random() * 1000 + 1).toString(10) + "]",
          createdAt: moment().format(),
          filename: filename || null,
        };
        console.log(result);

        return await this.db
          .collection(`subjects/${id}/analysisStudies`)
          .add(result)
          .then(async (doc) => {
            await this.db
              .doc(`subjects/${id}/analysisStudies/${doc.id}`)
              .update({ id: doc.id });
          });
      }

    })

  }

  async importEmbryologyData(subjectId: string, csvData: any, filename: string, date: string): Promise<any> {
    this.updateSubject(subjectId, {
      embriology: firebase.firestore.FieldValue.arrayUnion({
        fileName: filename,
        samples: csvData,
        date: date
      })
    })
  }
}
