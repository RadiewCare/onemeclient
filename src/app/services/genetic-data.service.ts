import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { LoadingController } from "@ionic/angular";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root"
})
export class GeneticDataService {
  count = 0;

  constructor(
    private db: AngularFirestore,
    private loadingController: LoadingController,
    private http: HttpClient
  ) { }

  /**
   * Devuelve los datos genéticos de un sujeto como observable
   * @param subjectId Identificador del sujeto
   */
  getGeneticData(subjectId: string): Observable<any> {
    return this.db
      .collection(`subjects/${subjectId}/geneticData`, (ref) => ref.limit(100))
      .valueChanges();
  }

  /**
   * Devuelve los datos genéticos de un sujeto como promesa
   * @param subjectId Identificador del sujeto
   */
  getGeneticDataPromise(subjectId: string) {
    return this.db.firestore
      .collection(`subjects/${subjectId}/geneticData`)
      .get();
  }

  /**
   * Devuelve los datos genéticos de un sujeto en las que interviene una variante concreta como observable
   * @param subjectId Identificador del sujeto
   * @param geneticVariant Variante genética
   */
  getGeneticDataByVariant(
    subjectId: string,
    geneticVariant: string
  ): Observable<any> {
    return this.db
      .collection(`subjects/${subjectId}/geneticData`, (ref) =>
        ref.where("geneticVariant", "==", geneticVariant)
      )
      .valueChanges();
  }

  /**
   * Devuelve los datos genéticos de un sujeto en las que interviene una variante concreta como promesa
   * @param subjectId Identificador del sujeto
   * @param geneticVariant Variante genética
   */
  getGeneticDataByVariantPromise(
    subjectId: string,
    geneticVariant: string
  ): Promise<any> {
    return this.db.firestore
      .collection(`subjects/${subjectId}/geneticData`)
      .where("geneticVariant", "==", geneticVariant)
      .get();
  }

  /**
   * Importa datos geneticos de un sujeto
   * @param subjectId Identificador del sujeto
   * @param data Datos geneticos a importar
   */
  async importGeneticData(subjectId: string, data: any[]): Promise<any> {
    const transformedData = [];
    const loading = await this.loadingController.create(null);
    await loading.present();

    for await (const varianteGenetica of data) {
      // Separamos el nombre de la variante
      const split = varianteGenetica.Name.split("(");
      // Descomponemos los alelos
      if (split.length > 1) {
        const alelo = split[1].substring(0, split[1].length - 1);
        const alelos = alelo.split(";");
        // Agregamos a la transformación de datos
        transformedData.push({
          geneticVariant: split[0],
          alleles: {
            father: alelos[0],
            mother: alelos[1]
          },
          frequency: varianteGenetica.Freq === null ? 0 : varianteGenetica.Freq,
          magnitude: varianteGenetica.Magnitude
        });
      } else {
        transformedData.push({
          geneticVariant: split[0],
          alleles: null,
          frequency: varianteGenetica.Freq === null ? 0 : varianteGenetica.Freq,
          magnitude: varianteGenetica.Magnitude
        });
      }
    }

    const arr1 = transformedData.slice(0, transformedData.length / 4);
    const arr2 = transformedData.slice(
      transformedData.length / 4,
      transformedData.length / 2
    );
    const arr3 = transformedData.slice(
      transformedData.length / 2,
      transformedData.length - transformedData.length / 4
    );
    const arr4 = transformedData.slice(
      transformedData.length - transformedData.length / 4
    );
    console.log(arr1);
    console.log(arr2);
    console.log(arr3);
    console.log(arr4);

    if (transformedData.length > 0) {
      this.db
        .doc(`subjects/${subjectId}`)
        .update({ numberOfVariants: transformedData.length });
    }

    let index1 = 0;
    let index2 = 0;
    let index3 = 0;
    let index4 = 0;

    const promise1 = new Promise<void>(async (resolve) => {
      for await (const element of arr1) {
        loading.message =
          index1 +
          index2 +
          index3 +
          index4 +
          " elementos de " +
          transformedData.length;
        await this.db
          .collection(`subjects/${subjectId}/geneticData`)
          .add(element);
        index1++;
      }
      resolve();
    });
    const promise2 = new Promise<void>(async (resolve) => {
      for await (const element of arr2) {
        loading.message =
          index1 +
          index2 +
          index3 +
          index4 +
          " elementos de " +
          transformedData.length;
        await this.db
          .collection(`subjects/${subjectId}/geneticData`)
          .add(element);
        index2++;
      }
      resolve();
    });
    const promise3 = new Promise<void>(async (resolve) => {
      for await (const element of arr3) {
        loading.message =
          index1 +
          index2 +
          index3 +
          index4 +
          " elementos de " +
          transformedData.length;
        await this.db
          .collection(`subjects/${subjectId}/geneticData`)
          .add(element);
        index3++;
      }
      resolve();
    });
    const promise4 = new Promise<void>(async (resolve) => {
      for await (const element of arr4) {
        loading.message =
          index1 +
          index2 +
          index3 +
          index4 +
          " elementos de " +
          transformedData.length;
        await this.db
          .collection(`subjects/${subjectId}/geneticData`)
          .add(element);
        index4++;
      }
      resolve();
    });

    return Promise.all([promise1, promise2, promise3, promise4]).then(() => {
      loading.dismiss();
    });
  }

  async importGeneticDataGenome(subjectId: string, data: any[]): Promise<any> {
    // Hay que llamar a la API para que guarde en la base de datos nueva los datos genéticos
    console.log(subjectId);
    console.log(data);
    console.log("antes de la api", data.length);

    const arr1 = data.slice(0, data.length / 4);
    const arr2 = data.slice(
      data.length / 4,
      data.length / 2
    );
    const arr3 = data.slice(
      data.length / 2,
      data.length - data.length / 4
    );
    const arr4 = data.slice(
      data.length - data.length / 4
    );
    console.log(arr1);
    console.log(arr2);
    console.log(arr3);
    console.log(arr4);

    const lenght = data.length;

    const loading = await this.loadingController.create({
      message: "Importando: " + this.count + " de " + lenght
    })

    loading.present();

    let index1 = 0;
    let index2 = 0;
    let index3 = 0;
    let index4 = 0;

    const promise1 = new Promise<void>(async (resolve) => {
      for await (const element of arr1) {
        loading.message =
          index1 +
          index2 +
          index3 +
          index4 +
          " elementos de " +
          data.length;
        await this.http.post("https://couchdb.radiewcare-apps.es/genetic-data/",
          {
            "subjectId": subjectId,
            "#Reported": element["#Reported"],
            "ALoFT": element.ALoFT,
            "Affected Exon": element["Affected Exon"],
            "Alt": element.Alt,
            "Chr": element.Chr,
            "ClinVar Clinical Significance": element["ClinVar Clinical Significance"],
            "ClinVar Disease": element["ClinVar Disease"],
            "Comment": element.Comment,
            "Coordinate": element.Coordinate,
            "DEOGEN2": element["DEOGEN2"],
            "DG Prediction": element["DG Prediction"],
            "Exons Number": element["Exons Number"],
            "FATHMM": element["FATHMM"],
            "FATHMM-MKL": element["FATHMM-MKL"],
            "FATHMM-XF": element["FATHMM-XF"],
            "Gene": element.Gene,
            "Global review": element["Global review"],
            "HPO Term": element["HPO Term"],
            "ID dbSNP": element["ID dbSNP"],
            "LRT": element["LRT"],
            "MIM Number": element["MIM Number"],
            "Max Allele Freq": element["Max Allele Freq"],
            "Max Allele Freq Origin": element["Max Allele Freq Origin"],
            "Meta-LR": element["Meta-LR"],
            "Meta-SVM": element["Meta-SVM"],
            "Mutation Assesor": element["Mutation Assesor"],
            "Mutation Taster": element["Mutation Taster"],
            "OMIM Inheritance": element["OMIM Inheritance"],
            "OMIM Phenotype": element["OMIM Phenotype"],
            "PFAM Domain": element["PFAM Domain"],
            "PanelApp - Disease Group": element["PanelApp - Disease Group"],
            "PanelApp - Relevant Disorders": element["PanelApp - Relevant Disorders"],
            "Prediction": element["Prediction"],
            "Protein Effect": element["Protein Effect"],
            "Provean": element["Provean"],
            "Ref": element["Ref"],
            "RefSeq ID": element["RefSeq ID"],
            "Region": element["Region"],
            "SIFT": element["SIFT"],
            "SIFT 4G": element["SIFT 4G"],
            "Sample category": element["Sample category"],
            "Variant Type": element["Variant Type"],
            "Zygosity": element["Zygosity"],
            "c.Hgvs": element["c.Hgvs"],
            "p.Hgvs": element["p.Hgvs"]
          },
          {
            headers: {
              Authorization: "Basic YXBpOkFQSV9jYXJlMjAyMA=="
            }
          }).toPromise().then(() => {
            index1++;
          }).catch(() => {
            console.log("FAIL");
          });
      }
      resolve();
    });
    const promise2 = new Promise<void>(async (resolve) => {
      for await (const element of arr2) {
        loading.message =
          index1 +
          index2 +
          index3 +
          index4 +
          " elementos de " +
          data.length;
        await this.http.post("https://couchdb.radiewcare-apps.es/genetic-data/",
          {
            "subjectId": subjectId,
            "#Reported": element["#Reported"],
            "ALoFT": element.ALoFT,
            "Affected Exon": element["Affected Exon"],
            "Alt": element.Alt,
            "Chr": element.Chr,
            "ClinVar Clinical Significance": element["ClinVar Clinical Significance"],
            "ClinVar Disease": element["ClinVar Disease"],
            "Comment": element.Comment,
            "Coordinate": element.Coordinate,
            "DEOGEN2": element["DEOGEN2"],
            "DG Prediction": element["DG Prediction"],
            "Exons Number": element["Exons Number"],
            "FATHMM": element["FATHMM"],
            "FATHMM-MKL": element["FATHMM-MKL"],
            "FATHMM-XF": element["FATHMM-XF"],
            "Gene": element.Gene,
            "Global review": element["Global review"],
            "HPO Term": element["HPO Term"],
            "ID dbSNP": element["ID dbSNP"],
            "LRT": element["LRT"],
            "MIM Number": element["MIM Number"],
            "Max Allele Freq": element["Max Allele Freq"],
            "Max Allele Freq Origin": element["Max Allele Freq Origin"],
            "Meta-LR": element["Meta-LR"],
            "Meta-SVM": element["Meta-SVM"],
            "Mutation Assesor": element["Mutation Assesor"],
            "Mutation Taster": element["Mutation Taster"],
            "OMIM Inheritance": element["OMIM Inheritance"],
            "OMIM Phenotype": element["OMIM Phenotype"],
            "PFAM Domain": element["PFAM Domain"],
            "PanelApp - Disease Group": element["PanelApp - Disease Group"],
            "PanelApp - Relevant Disorders": element["PanelApp - Relevant Disorders"],
            "Prediction": element["Prediction"],
            "Protein Effect": element["Protein Effect"],
            "Provean": element["Provean"],
            "Ref": element["Ref"],
            "RefSeq ID": element["RefSeq ID"],
            "Region": element["Region"],
            "SIFT": element["SIFT"],
            "SIFT 4G": element["SIFT 4G"],
            "Sample category": element["Sample category"],
            "Variant Type": element["Variant Type"],
            "Zygosity": element["Zygosity"],
            "c.Hgvs": element["c.Hgvs"],
            "p.Hgvs": element["p.Hgvs"]
          },
          {
            headers: {
              Authorization: "Basic YXBpOkFQSV9jYXJlMjAyMA=="
            }
          }).toPromise().then(() => {
            index2++;
          }).catch(() => {
            console.log("FAIL");
          });
      }
      resolve();
    });
    const promise3 = new Promise<void>(async (resolve) => {
      for await (const element of arr3) {
        loading.message =
          index1 +
          index2 +
          index3 +
          index4 +
          " elementos de " +
          data.length;
        await this.http.post("https://couchdb.radiewcare-apps.es/genetic-data/",
          {
            "subjectId": subjectId,
            "#Reported": element["#Reported"],
            "ALoFT": element.ALoFT,
            "Affected Exon": element["Affected Exon"],
            "Alt": element.Alt,
            "Chr": element.Chr,
            "ClinVar Clinical Significance": element["ClinVar Clinical Significance"],
            "ClinVar Disease": element["ClinVar Disease"],
            "Comment": element.Comment,
            "Coordinate": element.Coordinate,
            "DEOGEN2": element["DEOGEN2"],
            "DG Prediction": element["DG Prediction"],
            "Exons Number": element["Exons Number"],
            "FATHMM": element["FATHMM"],
            "FATHMM-MKL": element["FATHMM-MKL"],
            "FATHMM-XF": element["FATHMM-XF"],
            "Gene": element.Gene,
            "Global review": element["Global review"],
            "HPO Term": element["HPO Term"],
            "ID dbSNP": element["ID dbSNP"],
            "LRT": element["LRT"],
            "MIM Number": element["MIM Number"],
            "Max Allele Freq": element["Max Allele Freq"],
            "Max Allele Freq Origin": element["Max Allele Freq Origin"],
            "Meta-LR": element["Meta-LR"],
            "Meta-SVM": element["Meta-SVM"],
            "Mutation Assesor": element["Mutation Assesor"],
            "Mutation Taster": element["Mutation Taster"],
            "OMIM Inheritance": element["OMIM Inheritance"],
            "OMIM Phenotype": element["OMIM Phenotype"],
            "PFAM Domain": element["PFAM Domain"],
            "PanelApp - Disease Group": element["PanelApp - Disease Group"],
            "PanelApp - Relevant Disorders": element["PanelApp - Relevant Disorders"],
            "Prediction": element["Prediction"],
            "Protein Effect": element["Protein Effect"],
            "Provean": element["Provean"],
            "Ref": element["Ref"],
            "RefSeq ID": element["RefSeq ID"],
            "Region": element["Region"],
            "SIFT": element["SIFT"],
            "SIFT 4G": element["SIFT 4G"],
            "Sample category": element["Sample category"],
            "Variant Type": element["Variant Type"],
            "Zygosity": element["Zygosity"],
            "c.Hgvs": element["c.Hgvs"],
            "p.Hgvs": element["p.Hgvs"]
          },
          {
            headers: {
              Authorization: "Basic YXBpOkFQSV9jYXJlMjAyMA=="
            }
          }).toPromise().then(() => {
            index3++;
          }).catch(() => {
            console.log("FAIL");
          });

      }
      resolve();
    });
    const promise4 = new Promise<void>(async (resolve) => {
      for await (const element of arr4) {
        loading.message =
          index1 +
          index2 +
          index3 +
          index4 +
          " elementos de " +
          data.length;
        await this.http.post("https://couchdb.radiewcare-apps.es/genetic-data/",
          {
            "subjectId": subjectId,
            "#Reported": element["#Reported"],
            "ALoFT": element.ALoFT,
            "Affected Exon": element["Affected Exon"],
            "Alt": element.Alt,
            "Chr": element.Chr,
            "ClinVar Clinical Significance": element["ClinVar Clinical Significance"],
            "ClinVar Disease": element["ClinVar Disease"],
            "Comment": element.Comment,
            "Coordinate": element.Coordinate,
            "DEOGEN2": element["DEOGEN2"],
            "DG Prediction": element["DG Prediction"],
            "Exons Number": element["Exons Number"],
            "FATHMM": element["FATHMM"],
            "FATHMM-MKL": element["FATHMM-MKL"],
            "FATHMM-XF": element["FATHMM-XF"],
            "Gene": element.Gene,
            "Global review": element["Global review"],
            "HPO Term": element["HPO Term"],
            "ID dbSNP": element["ID dbSNP"],
            "LRT": element["LRT"],
            "MIM Number": element["MIM Number"],
            "Max Allele Freq": element["Max Allele Freq"],
            "Max Allele Freq Origin": element["Max Allele Freq Origin"],
            "Meta-LR": element["Meta-LR"],
            "Meta-SVM": element["Meta-SVM"],
            "Mutation Assesor": element["Mutation Assesor"],
            "Mutation Taster": element["Mutation Taster"],
            "OMIM Inheritance": element["OMIM Inheritance"],
            "OMIM Phenotype": element["OMIM Phenotype"],
            "PFAM Domain": element["PFAM Domain"],
            "PanelApp - Disease Group": element["PanelApp - Disease Group"],
            "PanelApp - Relevant Disorders": element["PanelApp - Relevant Disorders"],
            "Prediction": element["Prediction"],
            "Protein Effect": element["Protein Effect"],
            "Provean": element["Provean"],
            "Ref": element["Ref"],
            "RefSeq ID": element["RefSeq ID"],
            "Region": element["Region"],
            "SIFT": element["SIFT"],
            "SIFT 4G": element["SIFT 4G"],
            "Sample category": element["Sample category"],
            "Variant Type": element["Variant Type"],
            "Zygosity": element["Zygosity"],
            "c.Hgvs": element["c.Hgvs"],
            "p.Hgvs": element["p.Hgvs"]
          },
          {
            headers: {
              Authorization: "Basic YXBpOkFQSV9jYXJlMjAyMA=="
            }
          }).toPromise().then(() => {
            index4++;
          }).catch(() => {
            console.log("FAIL");
          });

      }
      resolve();
    });

    return Promise.all([promise1, promise2, promise3, promise4]).then(() => {
      loading.dismiss();
    });

    /*
    for await (const element of data) {
      await this.http.post("https://couchdb.radiewcare-apps.es/genetic-data/",
        {
          "subjectId": subjectId,
          "#Reported": element["#Reported"],
          "ALoFT": element.ALoFT,
          "Affected Exon": element["Affected Exon"],
          "Alt": element.Alt,
          "Chr": element.Chr,
          "ClinVar Clinical Significance": element["ClinVar Clinical Significance"],
          "ClinVar Disease": element["ClinVar Disease"],
          "Comment": element.Comment,
          "Coordinate": element.Coordinate,
          "DEOGEN2": element["DEOGEN2"],
          "DG Prediction": element["DG Prediction"],
          "Exons Number": element["Exons Number"],
          "FATHMM": element["FATHMM"],
          "FATHMM-MKL": element["FATHMM-MKL"],
          "FATHMM-XF": element["FATHMM-XF"],
          "Gene": element.Gene,
          "Global review": element["Global review"],
          "HPO Term": element["HPO Term"],
          "ID dbSNP": element["ID dbSNP"],
          "LRT": element["LRT"],
          "MIM Number": element["MIM Number"],
          "Max Allele Freq": element["Max Allele Freq"],
          "Max Allele Freq Origin": element["Max Allele Freq Origin"],
          "Meta-LR": element["Meta-LR"],
          "Meta-SVM": element["Meta-SVM"],
          "Mutation Assesor": element["Mutation Assesor"],
          "Mutation Taster": element["Mutation Taster"],
          "OMIM Inheritance": element["OMIM Inheritance"],
          "OMIM Phenotype": element["OMIM Phenotype"],
          "PFAM Domain": element["PFAM Domain"],
          "PanelApp - Disease Group": element["PanelApp - Disease Group"],
          "PanelApp - Relevant Disorders": element["PanelApp - Relevant Disorders"],
          "Prediction": element["Prediction"],
          "Protein Effect": element["Protein Effect"],
          "Provean": element["Provean"],
          "Ref": element["Ref"],
          "RefSeq ID": element["RefSeq ID"],
          "Region": element["Region"],
          "SIFT": element["SIFT"],
          "SIFT 4G": element["SIFT 4G"],
          "Sample category": element["Sample category"],
          "Variant Type": element["Variant Type"],
          "Zygosity": element["Zygosity"],
          "c.Hgvs": element["c.Hgvs"],
          "p.Hgvs": element["p.Hgvs"]
        },
        {
          headers: {
            Authorization: "Basic YXBpOkFQSV9jYXJlMjAyMA=="
          }
        }).toPromise().then(() => {
          console.log("ok");
          this.count = this.count + 1;
          loading.message = "Importando: " + this.count + " de " + lenght
        }).catch(() => {
          console.log("FAIL");
        });

    }
    */

  }
  async importGeneticDataEurofins(subjectId: string, data: any[]): Promise<any> {
    // Hay que llamar a la API para que guarde en la base de datos nueva los datos genéticos
    console.log(subjectId);
    console.log(data);
    console.log("antes de la api", data.length);

    const arr1 = data.slice(0, data.length / 4);
    const arr2 = data.slice(
      data.length / 4,
      data.length / 2
    );
    const arr3 = data.slice(
      data.length / 2,
      data.length - data.length / 4
    );
    const arr4 = data.slice(
      data.length - data.length / 4
    );
    console.log(arr1);
    console.log(arr2);
    console.log(arr3);
    console.log(arr4);

    const lenght = data.length;

    const loading = await this.loadingController.create({
      message: "Importando: " + this.count + " de " + lenght
    })

    loading.present();

    let index1 = 0;
    let index2 = 0;
    let index3 = 0;
    let index4 = 0;

    const promise1 = new Promise<void>(async (resolve) => {
      for await (const element of arr1) {
        loading.message =
          index1 +
          index2 +
          index3 +
          index4 +
          " elementos de " +
          data.length;
        await this.http.post("https://couchdb.radiewcare-apps.es/eurofins-data/",
          {
            "subjectId": subjectId,
            "Alleles": element["Alt Allele"],
            "Alt Allele": element["Alt Allele"],
            "Chromosome": element["Chromosome"],
            "Extended RSID": element["Extended RSID"],
            "Ordered Alleles": element["Ordered Alleles"],
            "Physical Position": element["Physical Position"],
            "Position End": element["Position End"],
            "Ref Allele": element["Ref Allele"],
            "dbSNP RS ID": element["dbSNP RS ID"],
          },
          {
            headers: {
              Authorization: "Basic YXBpOkFQSV9jYXJlMjAyMA=="
            }
          }).toPromise().then(() => {
            index1++;
          }).catch(() => {
            console.log("FAIL");
          });
      }
      resolve();
    });
    const promise2 = new Promise<void>(async (resolve) => {
      for await (const element of arr2) {
        loading.message =
          index1 +
          index2 +
          index3 +
          index4 +
          " elementos de " +
          data.length;
        await this.http.post("https://couchdb.radiewcare-apps.es/eurofins-data/",
          {
            "subjectId": subjectId,
            "Alleles": element["Alt Allele"],
            "Alt Allele": element["Alt Allele"],
            "Chromosome": element["Chromosome"],
            "Extended RSID": element["Extended RSID"],
            "Ordered Alleles": element["Ordered Alleles"],
            "Physical Position": element["Physical Position"],
            "Position End": element["Position End"],
            "Ref Allele": element["Ref Allele"],
            "dbSNP RS ID": element["dbSNP RS ID"],
          },
          {
            headers: {
              Authorization: "Basic YXBpOkFQSV9jYXJlMjAyMA=="
            }
          }).toPromise().then(() => {
            index2++;
          }).catch(() => {
            console.log("FAIL");
          });
      }
      resolve();
    });
    const promise3 = new Promise<void>(async (resolve) => {
      for await (const element of arr3) {
        loading.message =
          index1 +
          index2 +
          index3 +
          index4 +
          " elementos de " +
          data.length;
        await this.http.post("https://couchdb.radiewcare-apps.es/eurofins-data/",
          {
            "subjectId": subjectId,
            "Alleles": element["Alt Allele"],
            "Alt Allele": element["Alt Allele"],
            "Chromosome": element["Chromosome"],
            "Extended RSID": element["Extended RSID"],
            "Ordered Alleles": element["Ordered Alleles"],
            "Physical Position": element["Physical Position"],
            "Position End": element["Position End"],
            "Ref Allele": element["Ref Allele"],
            "dbSNP RS ID": element["dbSNP RS ID"],
          },
          {
            headers: {
              Authorization: "Basic YXBpOkFQSV9jYXJlMjAyMA=="
            }
          }).toPromise().then(() => {
            index3++;
          }).catch(() => {
            console.log("FAIL");
          });

      }
      resolve();
    });
    const promise4 = new Promise<void>(async (resolve) => {
      for await (const element of arr4) {
        loading.message =
          index1 +
          index2 +
          index3 +
          index4 +
          " elementos de " +
          data.length;
        await this.http.post("https://couchdb.radiewcare-apps.es/eurofins-data/",
          {
            "subjectId": subjectId,
            "Alleles": element["Alt Allele"],
            "Alt Allele": element["Alt Allele"],
            "Chromosome": element["Chromosome"],
            "Extended RSID": element["Extended RSID"],
            "Ordered Alleles": element["Ordered Alleles"],
            "Physical Position": element["Physical Position"],
            "Position End": element["Position End"],
            "Ref Allele": element["Ref Allele"],
            "dbSNP RS ID": element["dbSNP RS ID"],
          },
          {
            headers: {
              Authorization: "Basic YXBpOkFQSV9jYXJlMjAyMA=="
            }
          }).toPromise().then(() => {
            index4++;
          }).catch(() => {
            console.log("FAIL");
          });

      }
      resolve();
    });

    return Promise.all([promise1, promise2, promise3, promise4]).then(() => {
      loading.dismiss();
    });

    /*
    for await (const element of data) {
      await this.http.post("https://couchdb.radiewcare-apps.es/genetic-data/",
        {
          "subjectId": subjectId,
          "#Reported": element["#Reported"],
          "ALoFT": element.ALoFT,
          "Affected Exon": element["Affected Exon"],
          "Alt": element.Alt,
          "Chr": element.Chr,
          "ClinVar Clinical Significance": element["ClinVar Clinical Significance"],
          "ClinVar Disease": element["ClinVar Disease"],
          "Comment": element.Comment,
          "Coordinate": element.Coordinate,
          "DEOGEN2": element["DEOGEN2"],
          "DG Prediction": element["DG Prediction"],
          "Exons Number": element["Exons Number"],
          "FATHMM": element["FATHMM"],
          "FATHMM-MKL": element["FATHMM-MKL"],
          "FATHMM-XF": element["FATHMM-XF"],
          "Gene": element.Gene,
          "Global review": element["Global review"],
          "HPO Term": element["HPO Term"],
          "ID dbSNP": element["ID dbSNP"],
          "LRT": element["LRT"],
          "MIM Number": element["MIM Number"],
          "Max Allele Freq": element["Max Allele Freq"],
          "Max Allele Freq Origin": element["Max Allele Freq Origin"],
          "Meta-LR": element["Meta-LR"],
          "Meta-SVM": element["Meta-SVM"],
          "Mutation Assesor": element["Mutation Assesor"],
          "Mutation Taster": element["Mutation Taster"],
          "OMIM Inheritance": element["OMIM Inheritance"],
          "OMIM Phenotype": element["OMIM Phenotype"],
          "PFAM Domain": element["PFAM Domain"],
          "PanelApp - Disease Group": element["PanelApp - Disease Group"],
          "PanelApp - Relevant Disorders": element["PanelApp - Relevant Disorders"],
          "Prediction": element["Prediction"],
          "Protein Effect": element["Protein Effect"],
          "Provean": element["Provean"],
          "Ref": element["Ref"],
          "RefSeq ID": element["RefSeq ID"],
          "Region": element["Region"],
          "SIFT": element["SIFT"],
          "SIFT 4G": element["SIFT 4G"],
          "Sample category": element["Sample category"],
          "Variant Type": element["Variant Type"],
          "Zygosity": element["Zygosity"],
          "c.Hgvs": element["c.Hgvs"],
          "p.Hgvs": element["p.Hgvs"]
        },
        {
          headers: {
            Authorization: "Basic YXBpOkFQSV9jYXJlMjAyMA=="
          }
        }).toPromise().then(() => {
          console.log("ok");
          this.count = this.count + 1;
          loading.message = "Importando: " + this.count + " de " + lenght
        }).catch(() => {
          console.log("FAIL");
        });

    }
    */

  }
}
