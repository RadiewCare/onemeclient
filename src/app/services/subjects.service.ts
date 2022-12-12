import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import * as moment from "moment";
import * as firebase from "firebase/app";
import { ToastService } from "./toast.service";
import { TypesenseService } from "./typesense.service";
 
@Injectable({
  providedIn: "root"
})

export class SubjectsService {
  constructor(private db: AngularFirestore, private toastService: ToastService, private typesense: TypesenseService) { }

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
   async getSubjectsData(order?: string): Promise<any> {
    let searchResults = [];
    searchResults = await this.typesense.typeSense.collections('subjects').documents().search({
      q: '',
      query_by: 'id'
    });
    if (order) {
      return this.db.firestore.collection("subjects").orderBy(order).get();
    } else {
      return this.db.firestore.collection("subjects").get();
    }
  }
  async getSubjectsDataTypesense(order?: string): Promise<any> {
    let searchResults = [];
    searchResults = await this.typesense.typeSense.collections('subjects').documents().search({
      q: '',
      query_by: 'id'
    });
    return searchResults;
  }

  async getSubjectsByDoctorTypesense(id: string, currentPage:number, params:any): Promise<any> {

    let searchResults = [];
    
    let queryText = '*';
    let queryTextBy = 'identifier';
    let filterSet = 'mainDoctor:'+id;
    let filterSetBy = '';
    
    if ( Object.keys(params.filterModel).length != 0 ) {
      Object.keys(params.filterModel).map(function(key, index) {
        let auxFilter = '';
        if (params.filterModel[key].filterType == 'text'){
          queryText = params.filterModel[key].filter;
          queryTextBy = key;

        }
        if (params.filterModel[key].filterType == 'set'){
          auxFilter = '';
          for (const item of params.filterModel[key].values){
            auxFilter = auxFilter + '`' + item + '`' + ',';
          }
          filterSetBy = String(key)+':';
          filterSetBy = filterSetBy + '[' + auxFilter.slice(0, -1) + ']';
          filterSet = filterSet + '&&' + filterSetBy;
        }
      });
    }
    let sortBy = '_text_match(buckets: 10):desc,weighted_score:desc,';
    if (Object.keys(params.sortModel).length != 0){
      for (const element of params.sortModel) {
        sortBy = sortBy + element.colId + ':' + element.sort;
      }
    } else{
      sortBy = 'createdAt:desc';
    }
    console.log('q: '+queryText);
    console.log('query_by:' + queryTextBy);

    searchResults = await this.typesense.typeSense.collections('subjects').documents().search({
      q: queryText,
      query_by: queryTextBy,
      filter_by: filterSet,
      num_typos: 2,
      per_page: 10,
      page: currentPage,
      facet_by: 'history.centroReferente,history.genre',
      sort_by: sortBy,
      prefix: false, 
    });
    
    
    return searchResults;
  }

  async getSubjectsFlattenedByDoctorTypesense(id: string, currentPage:number, params:any): Promise<any> {

    let searchResults = [];
    
    let queryText = '*';
    let queryTextBy = 'identifier';
    let filterSet = 'mainDoctor:'+id;
    let filterSetBy = '';
    let sortBy = 'createdAt:desc';
    if (params.filterModel !== undefined) {
      if ( Object.keys(params.filterModel).length != 0 ) {
        Object.keys(params.filterModel).map(function(key, index) {
          let auxFilter = '';
          if (params.filterModel[key].filterType == 'text'){
            queryText = '"'+String(params.filterModel[key].filter)+'"';
            queryTextBy = String(key);

          }
          if (params.filterModel[key].filterType == 'set'){
            auxFilter = '';
            for (const item of params.filterModel[key].values){
              auxFilter = auxFilter + '`' + item + '`' + ',';
            }
            filterSetBy = String(key)+':=';
            filterSetBy = filterSetBy + '[' + auxFilter.slice(0, -1) + ']';
            filterSet = filterSet + '&&' + filterSetBy;
          }
        });
      }
    } 
    if (params.sortModel !== undefined) {
      if (Object.keys(params.sortModel).length != 0){
        for (const element of params.sortModel) {
          sortBy = sortBy + element.colId + ':' + element.sort;
        }
      } 
    }

    let query = {
      q: queryText,
      query_by: queryTextBy,
      filter_by: filterSet,
      per_page: 10,
      page: currentPage,
      facet_by: 'history.centroReferente,history.genre,history.diseases.name,history.signsAndSymptoms.name',
      max_facet_values: 450,
      sort_by: sortBy,
      prefix: false, 
      split_join_tokens: 'off',
      pre_segmented_query: true
    }
    console.log(query);
    searchResults = await this.typesense.typeSense.collections('subjectsFlattened').documents().search(query);
    
    
    return searchResults;
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
 
  getSubjectsByDoctorLimit(id: string): Observable<any> {
    return this.db
      .collection("subjects", ref => ref.where("mainDoctor", "==", id).orderBy('createdAt', 'desc').limit(50))
      .valueChanges()
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
 * Devuelve los sujetos de un doctor como promesa
 * @param subjectId Identificador del sujeto
 */
  getSubjectsByDoctorData(doctorId: string): Promise<any> {
  /*getSubjectsByDoctorData(doctorId: string, subjectStartAt:any): Promise<any> {
    if (subjectStartAt == null) {
      return this.db.firestore.collection(`subjects`).where("mainDoctor", "==", doctorId).orderBy("createdAt", "desc").limit(25).get();
    } else{
      return this.db.firestore.collection(`subjects`).where("mainDoctor", "==", doctorId).orderBy("createdAt", "desc").startAfter(subjectStartAt.createdAt).limit(25).get();
    }*/
    return this.db.firestore.collection(`subjects`).where("mainDoctor", "==", doctorId).orderBy("identifier", "asc").get();

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
