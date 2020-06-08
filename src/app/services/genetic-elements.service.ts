import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { DiseasesService } from "./diseases.service";
import * as firebase from "firebase/app";
import { PolymorphismsService } from "./polymorphisms.service";
import * as moment from "moment";

@Injectable({
  providedIn: "root"
})
export class GeneticElementsService {
  constructor(
    private db: AngularFirestore,
    private diseasesService: DiseasesService,
    private polymophismsService: PolymorphismsService
  ) {}

  getGeneticElements(): Observable<any> {
    return this.db.collection("geneticElements").valueChanges();
  }

  getGeneticElement(id: string): Observable<any> {
    return this.db.doc(`geneticElements/${id}`).valueChanges();
  }

  async getGeneticElementData(id: string): Promise<any> {
    return await this.db.firestore.doc(`geneticElements/${id}`).get();
  }

  async createGeneticElement(data: any, disease?: string): Promise<any> {
    if (disease) {
      return await this.db
        .collection("geneticElements")
        .add(data)
        .then((doc) => {
          this.db
            .doc(`geneticElements/${doc.id}`)
            .update({ id: doc.id })
            .then(() => {
              this.diseasesService.updateDisease(disease, {
                geneticElements: firebase.firestore.FieldValue.arrayUnion({
                  id: doc.id,
                  name: data.geneticVariant.name
                })
              });
            });
        });
    } else {
      return await this.db
        .collection("geneticElements")
        .add(data)
        .then((doc) => {
          this.db.doc(`geneticElements/${doc.id}`).update({ id: doc.id });
        });
    }
  }

  async updateGeneticElement(id: string, data: any): Promise<any> {
    return await this.db.doc(`geneticElements/${id}`).update(data);
  }

  async deleteGeneticElement(id: string): Promise<any> {
    return await this.db.doc(`geneticElements/${id}`).delete();
  }

  async importGeneticElements(id: string, csvData: any): Promise<any> {
    console.log(csvData);
    let diseaseData;
    let diseaseName;
    let impliedGenes = [];

    await this.db.firestore
      .doc(`diseases/${id}`)
      .get()
      .then(async (disease) => {
        console.log(disease.data());
        diseaseData = disease.data();
        diseaseName = disease.data().name;

        csvData.forEach(async (element) => {
          if (
            !disease.data().geneticElements ||
            !disease
              .data()
              .geneticElements.map((ge) => (ge = ge.name))
              .includes(element.geneticVariant)
          ) {
            // Comprobar que la variante existe
            await this.db.firestore
              .collection(`polymorphisms`)
              .where("name", "==", element.geneticVariant)
              .get()
              .then((poly) => {
                if (poly.docs.length > 0) {
                  console.log(poly.docs[0].data());

                  element.geneticVariantId = poly.docs[0].data().id;
                  impliedGenes = poly.docs[0].data().genes;

                  console.log(element);
                } else {
                  this.polymophismsService
                    .createPolymorphism({
                      chromosome: null,
                      createdAt: moment().format(),
                      formalName: null,
                      genes: element.genes,
                      name: element.geneticVariant || null,
                      position: null
                    })
                    .then(() => {
                      this.polymophismsService
                        .getPolymorphismDataByName(element.geneticVariant)
                        .then((data) => {
                          if (data) {
                            element.geneticVariantId = data.data().id;

                            impliedGenes = data.data().genes;
                          }
                          console.log(element);
                        });
                    });
                }
              });

            const hr = element.highRiskAlleles.split(";");
            element.highRiskAllelesFather = hr[0];
            element.highRiskAllelesMother = hr[1];
            const mr = element.mediumRiskAlleles.split(";");
            element.mediumRiskAllelesFather = mr[0];
            element.mediumRiskAllelesMother = mr[1];
            const lr = element.lowRiskAlleles.split(";");
            element.lowRiskAllelesFather = lr[0];
            element.lowRiskAllelesMother = lr[1];

            const data = {
              disease: { id: id, name: diseaseName }, //
              geneticVariant: {
                id: element.geneticVariantId, //
                name: element.geneticVariant //
              },
              genes: impliedGenes, //
              highRiskAlleles: {
                father: element.highRiskAllelesFather,
                mother: element.highRiskAllelesMother
              },
              highRiskAllelesPair: `(${element.highRiskAllelesFather},${element.highRiskAllelesMother})`,
              mediumRiskAlleles: {
                father: element.mediumRiskAllelesFather,
                mother: element.mediumRiskAllelesMother
              },
              mediumRiskAllelesPair: `(${element.mediumRiskAllelesFather},${element.mediumRiskAllelesMother})`,
              lowRiskAlleles: {
                father: element.lowRiskAllelesFather,
                mother: element.lowRiskAllelesMother
              },
              lowRiskAllelesPair: `(${element.lowRiskAllelesFather},${element.lowRiskAllelesMother})`,
              highRiskOddRatio:
                typeof element.highRiskOddRatio === "string"
                  ? element.highRiskOddRatio.replace(",", ".")
                  : element.highRiskOddRatio,
              mediumRiskOddRatio:
                typeof element.mediumRiskOddRatio === "string"
                  ? element.mediumRiskOddRatio.replace(",", ".")
                  : element.mediumRiskOddRatio,
              lowRiskOddRatio:
                typeof element.lowRiskOddRatio === "string"
                  ? element.lowRiskOddRatio.replace(",", ".")
                  : element.lowRiskOddRatio,
              comment: element.comment,
              bibliography: element.bibliography
            };
            console.log(data);
            this.createGeneticElement(data, id);
          }
        });
      });
  }
}
