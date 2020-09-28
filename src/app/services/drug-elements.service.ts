import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class DrugElementsService {
  constructor(private db: AngularFirestore) {}

  getDrugElements(): Observable<any> {
    return this.db.collection("drugElements").valueChanges();
  }

  getDrugElementsData(): Promise<any> {
    return this.db.firestore.collection("drugElements").get();
  }

  getDrugElement(id: string): Observable<any> {
    return this.db.doc(`drugElements/${id}`).valueChanges();
  }

  async getDrugElementData(id: string): Promise<any> {
    return await this.db.firestore.doc(`drugElements/${id}`).get();
  }

  async createDrugElement(data: any): Promise<any> {
    if (data.genes !== null) {
      const genes = data.genes.split("|");
      genes.forEach((element) => {
        element = element.trim();
      });
      data.genes = genes;
    }
    return await this.db
      .collection("drugElements")
      .add(data)
      .then((doc) => {
        this.db.doc(`drugElements/${doc.id}`).update({ id: doc.id });
      });
  }

  async updateDrugElement(id: string, data: any): Promise<any> {
    return await this.db.doc(`drugElements/${id}`).update(data);
  }

  async deleteDrugElement(id: string): Promise<any> {
    return await this.db.doc(`drugElements/${id}`).delete();
  }

  async importDrugElements(csvData: any): Promise<any> {
    console.log(csvData);

    csvData.forEach(async (element) => {
      if (
        element.highRiskAlleles !== null ||
        element.mediumRiskAlleles !== null ||
        element.highRiskAlleles !== null
      ) {
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
          drugElement: element.drugElement,
          geneticVariant: element.geneticVariant,
          genes: element.genes,
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
          effect: element.effect
        };
        console.log(data);
        this.createDrugElement(data);
      } else {
        const data = {
          drugElement: element.drugElement,
          geneticVariant: element.geneticVariant,
          genes: element.genes,
          highRiskAlleles: null,
          highRiskAllelesPair: null,
          mediumRiskAlleles: null,
          mediumRiskAllelesPair: null,
          lowRiskAlleles: null,
          lowRiskAllelesPair: null,
          effect: element.effect
        };
        console.log(data);
        this.createDrugElement(data);
      }
    });
  }
}
