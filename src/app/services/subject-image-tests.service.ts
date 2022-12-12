import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import * as moment from "moment";
import { Observable } from 'rxjs';
import { TypesenseService } from "./typesense.service";

@Injectable({
  providedIn: 'root'
})
export class SubjectImageTestsService {

  constructor(private db: AngularFirestore, private typesense: TypesenseService) { }

  getOne(id: string): Observable<any> {
    return this.db.doc(`subjectImageTests/${id}`).valueChanges();
  }

  async getOneData(id: string): Promise<firebase.firestore.DocumentData> {
    return (await this.db.firestore.doc(`subjectImageTests/${id}`).get()).data();
  }

  getAll(): Observable<any> {
    return this.db.collection("subjectImageTests").valueChanges();
  }


  async getAllDataTypesense(id: string, currentPage:number, params:any): Promise<any> {
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
      facet_by: 'status, values.name, values.status, values.markers, centroReferente, genre, subjectAge, diseases, signsAndSymptoms, nombre, AETitle, subjectAge',
      max_facet_values: 450,
      sort_by: sortBy,
      prefix: false, 
      split_join_tokens: 'off',
      pre_segmented_query: true
    }

    console.log(query);
    searchResults = await this.typesense.typeSense.collections('subjectImageTests').documents().search(query);

    return searchResults;
  }

  async getAllData(): Promise<any> {
    return (await this.db.firestore.collection("subjectImageTests").get()).docs
  }

  async getAllDataBySubject(subjectId: string) {
    return (await this.db.firestore.collection("subjectImageTests").where('subjectId', '==', subjectId).get()).docs
  }

  async getAllDataByWithReproduction() {
    return await this.db.firestore.collection("subjectImageTests").where('isReproductionTest', '==', true).get();
  }

  getAllDataBySubjectObservable(subjectId: string): Observable<any> {
    return this.db.collection("subjectImageTests", ref => ref.where('subjectId', '==', subjectId)).valueChanges();
  }

  async create(data: any): Promise<void> {
    const doc = await this.db.collection("subjectImageTests").add(data);
    await this.update(doc.id, { id: doc.id });
    return await this.db.doc(`subjects/${data.subjectId}`).update({ subjectImageTests: firebase.firestore.FieldValue.arrayUnion(doc.id) })
  }

  async update(id: string, data: any): Promise<void> {
    return await this.db.doc(`subjectImageTests/${id}`).update(data);
  }

  async delete(id: string): Promise<void> {
    return await this.db.doc(`subjectImageTests/${id}`).delete();
  }

}
