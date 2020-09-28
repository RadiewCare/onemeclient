import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { LoadingController } from "@ionic/angular";

@Injectable({
  providedIn: "root"
})
export class GeneticDataService {
  constructor(
    private db: AngularFirestore,
    private loadingController: LoadingController
  ) {}

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

    const promise1 = new Promise(async (resolve) => {
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
    const promise2 = new Promise(async (resolve) => {
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
    const promise3 = new Promise(async (resolve) => {
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
    const promise4 = new Promise(async (resolve) => {
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
}
