import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HpoService {

  baseURL = "https://hpo.jax.org/api/hpo/"

  termURL = "term/"
  searchURL = "search/?q="
  diseaseURL = "disease/"
  geneURL = "gene/"

  options: {

  }

  constructor(private httpClient: HttpClient) { }

  async search(query: string): Promise<any> {
    const promise = new Promise<any>((resolve, reject) => {
      const apiURL = `${this.baseURL}${this.searchURL}${query}`;
      this.httpClient.get(apiURL)
        .toPromise()
        .then(
          res => { // Success
            resolve(res);
          }
        );
    });
    return promise;
  }

  async disease(diseaseId: string): Promise<any> {
    const promise = new Promise<any>((resolve, reject) => {
      const apiURL = `${this.baseURL}${this.diseaseURL}${diseaseId}`;
      this.httpClient.get(apiURL)
        .toPromise()
        .then(
          res => { // Success
            resolve(res);
          }
        );
    });
    return promise;
  }

  async term(ontologyId: string): Promise<any> {
    const promise = new Promise<any>((resolve, reject) => {
      const apiURL = `${this.baseURL}${this.termURL}${ontologyId}`;
      this.httpClient.get(apiURL)
        .toPromise()
        .then(
          res => { // Success
            resolve(res);
          }
        );
    });
    return promise;
  }

  async gene(geneId: string): Promise<any> {
    const promise = new Promise<any>((resolve, reject) => {
      const apiURL = `${this.baseURL}${this.geneURL}${geneId}`;
      this.httpClient.get(apiURL)
        .toPromise()
        .then(
          res => { // Success
            resolve(res);
          }
        );
    });
    return promise;
  }

}
