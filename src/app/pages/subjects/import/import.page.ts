import { Component, OnInit } from "@angular/core";
import { Papa } from "ngx-papaparse";
import { ActivatedRoute } from "@angular/router";
import { ToastService } from "src/app/services/toast.service";
import { LoadingController } from "@ionic/angular";
import { AngularFirestore } from "@angular/fire/firestore";
import * as firebase from "firebase/app";
import { LanguageService } from "src/app/services/language.service";
import { GeneticDataService } from "src/app/services/genetic-data.service";
import { SubjectsService } from "src/app/services/subjects.service";

@Component({
  selector: "app-import",
  templateUrl: "./import.page.html",
  styleUrls: ["./import.page.scss"]
})
export class ImportPage implements OnInit {
  id: string;

  csvPhenotypicData: any;
  csvGeneticData: any;
  csvAnalyticData: any;
  csvImageData: any;
  csvEmbryologyData: any;
  csvEurofinsData: any;

  doneMessagePhenotypic: string;
  doneMessageGenetic: string;
  doneMessageEurofins: string;
  doneMessageAnalytic: string;
  doneMessageImage: string;
  doneMessageEmbryology: string;
  errorMessagePhenotypic: string;
  errorMessageGenetic: string;
  errorMessageEurofins: string;
  errorMessageAnalytic: string;
  errorMessageImage: string;
  errorMessageEmbryology: string;

  subject: any;
  filename: string;

  analyticFilename: string;
  embryologyFilename: string;

  date: string;

  constructor(
    private papa: Papa,
    private geneticDataService: GeneticDataService,
    private toastService: ToastService,
    private loadingController: LoadingController,
    private activatedRoute: ActivatedRoute,
    private subjectsService: SubjectsService,
    private db: AngularFirestore,
    public lang: LanguageService
  ) {
    this.id = this.activatedRoute.snapshot.paramMap.get("id");
  }

  ngOnInit() {

  }

  ionViewDidEnter() {
    this.subjectsService.getSubjectData(this.id).then((data) => {
      this.subject = data.data();
    })
  }

  loadPhenotypicData(event: any) {
    const csvFile = event.target.files[0];

    const csvOptions = {
      header: true,
      dynamicTyping: true,
      complete: (results: any, file: any) => {
        if (results.errors.length > 0) {
          this.doneMessagePhenotypic = null;
          this.errorMessagePhenotypic = JSON.stringify(results.errors);
        } else {
          this.errorMessagePhenotypic = null;
          this.doneMessagePhenotypic = "Procesado correctamente";
          this.csvPhenotypicData = results.data;
        }
      }
    };

    if (event.target.files[0].name.split(".").pop() === "csv") {
      this.papa.parse(csvFile, csvOptions);
      console.log("es csv");
    } else {
      this.errorMessagePhenotypic = "No es un archivo .csv";
    }
  }

  async loadGeneticData(event: any) {

    const csvFile = event.target.files[0];

    const csvOptions = {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results: any, file: any) => {
        if (results.errors.length > 0) {
          this.doneMessageGenetic = null;
          this.errorMessageGenetic = JSON.stringify(results.errors);
          this.loadingController.dismiss();
        } else {
          this.errorMessageGenetic = null;
          this.doneMessageGenetic = "Archivo procesado correctamente, importe cuando quiera";
          this.csvGeneticData = results.data;
          console.log(this.csvGeneticData);
          this.loadingController.dismiss();
        }
      }
    };

    if (event.target.files[0].name.split(".").pop() === "csv") {
      const loading = await this.loadingController.create({ message: "Leyendo csv de datos genéticos" });
      await loading.present();
      this.papa.parse(csvFile, csvOptions);
      console.log("es csv");
    } else {
      this.errorMessageGenetic = "No es un archivo .csv";
    }
  }

  async loadEurofinsData(event: any) {

    const csvFile = event.target.files[0];

    const csvOptions = {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results: any, file: any) => {
        if (results.errors.length > 0) {
          console.log(results.errors);

          this.doneMessageEurofins = null;
          this.errorMessageEurofins = JSON.stringify(results.errors);
          this.loadingController.dismiss();
        } else {
          this.errorMessageEurofins = null;
          this.doneMessageEurofins = "Archivo procesado correctamente, importe cuando quiera";
          this.csvEurofinsData = results.data;
          console.log(this.csvEurofinsData);
          this.loadingController.dismiss();
        }
      }
    };

    if (event.target.files[0].name.split(".").pop() === "csv") {
      const loading = await this.loadingController.create({ message: "Leyendo csv de datos genéticos Eurofins / Thermofisher" });
      await loading.present();
      this.papa.parse(csvFile, csvOptions);
      console.log("es csv");
    } else {
      this.errorMessageEurofins = "No es un archivo .csv";
    }
  }

  loadAnalyticData(event: any) {
    this.analyticFilename = event.target.files[0].name;
    const csvFile = event.target.files[0];

    const csvOptions = {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results: any, file: any) => {
        if (results.errors.length > 0) {
          this.doneMessageAnalytic = null;
          this.errorMessageAnalytic = JSON.stringify(results.errors);
        } else {
          this.errorMessageAnalytic = null;
          this.doneMessageAnalytic = "Procesado correctamente";
          this.csvAnalyticData = results.data;

          this.csvAnalyticData.forEach(element => {
            if (typeof element.RESULTADO === "string" && element.RESULTADO[element.RESULTADO.length - 1] === ",") {
              element.RESULTADO.splice(element.RESULTADO.length - 1, 1);
            }
            if (!element.RESULTADO ||
              element.RESULTADO === "Positivo" ||
              element.RESULTADO === "Negativo" ||
              element.RESULTADO === "Indeterminado"
            ) {
              this.csvAnalyticData.splice(this.csvAnalyticData.indexOf(element), 1);
            }
          });
          console.log(this.csvAnalyticData);
        }
      }
    };

    if (event.target.files[0].name.split(".").pop() === "csv") {
      this.papa.parse(csvFile, csvOptions);
      console.log("es csv");
    } else {
      this.errorMessageAnalytic = "No es un archivo .csv";
    }
  }

  loadImageData(event: any) {
    const csvFile = event.target.files[0];

    const csvOptions = {
      header: true,
      dynamicTyping: true,
      complete: (results: any, file: any) => {
        if (results.errors.length > 0) {
          this.doneMessageImage = null;
          this.errorMessageImage = JSON.stringify(results.errors);
        } else {
          this.errorMessageImage = null;
          this.doneMessageImage = "Procesado correctamente";
          this.csvImageData = results.data;
        }
      }
    };

    if (event.target.files[0].name.split(".").pop() === "csv") {
      this.filename = event.target.files[0].name;
      this.papa.parse(csvFile, csvOptions);
      console.log("es csv");
    } else {
      this.errorMessageImage = "No es un archivo .csv";
    }
  }

  loadEmbryologyData(event: any) {
    this.embryologyFilename = event.target.files[0].name;
    const csvFile = event.target.files[0];

    const csvOptions = {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results: any, file: any) => {
        if (results.errors.length > 0) {
          this.doneMessageEmbryology = null;
          this.errorMessageEmbryology = JSON.stringify(results.errors);
        } else {
          this.errorMessageEmbryology = null;
          this.doneMessageEmbryology = "Procesado correctamente";
          this.csvEmbryologyData = results.data;
          this.csvEmbryologyData = JSON.parse(JSON.stringify(this.csvEmbryologyData).replace(/"\s+|\s+"/g, '"'))
          console.log(this.csvEmbryologyData);
        }
      }
    };

    if (event.target.files[0].name.split(".").pop() === "csv") {
      this.filename = event.target.files[0].name;
      this.papa.parse(csvFile, csvOptions);
      console.log("es csv");
    } else {
      this.errorMessageEmbryology = "No es un archivo .csv";
    }
  }

  async import(): Promise<any> {
    if (this.csvGeneticData) {
      console.log("Loading");

      /* VERSIÓN ANTIGUA
      await this.geneticDataService
        .importGeneticData(this.id, this.csvGeneticData)
        .then(async () => {
          await this.subjectsService.updateSubject(this.id, {
            hasGeneticAnalysis: true
          });

          const loading = await this.loadingController.create(null);
          loading.message = "Localizando mutaciones";
          await loading.present();
          await this.db.firestore
            .collection(`subjects/${this.id}/geneticData`)
            .where("frequency", "<=", 1)
            .where("frequency", ">", 0)
            .get()
            .then(async (mutations) => {
              console.log("hago mutaciones");
              for await (const mutation of mutations.docs) {
                await this.subjectsService.updateSubject(this.id, {
                  mutations: firebase.firestore.FieldValue.arrayUnion(
                    mutation.data()
                  )
                });
                await loading.dismiss().then(() => {
                  this.toastService.show(
                    "success",
                    "Datos genéticos importados con éxito"
                  );
                  this.subjectsService.updateSubject(this.id, {
                    geneticDataFileName: this.filename
                  })
                });
              }
            });
        })
        .catch((error) => {
          this.toastService.show("danger", error);
        });
      */
      await this.geneticDataService
        .importGeneticDataGenome(this.id, this.csvGeneticData)
        .then(async () => {
          /*
          this.subjectsService.updateSubject(this.id, {
            hasGeneticAnalysis: true
          }).then(() => {
            this.toastService.show(
              "success",
              "Datos genéticos importados con éxito"
            );
            this.subjectsService.updateSubject(this.id, {
              geneticDataFileName: this.filename
            })
          }).catch((error) => {
            this.toastService.show(
              "danger",
              "Fallo al actualizar la existencia de análisis genético en el sujeto: " + error
            );
          });*/
        })
        .catch((error) => {
          this.toastService.show("danger", error);
        });
    }
    if (this.csvEurofinsData) {
      await this.geneticDataService
        .importGeneticDataEurofins(this.id, this.csvEurofinsData)
        .then(async () => {
          this.toastService.show("success", "Importado con éxito")
        })
        .catch((error) => {
          this.toastService.show("danger", error);
        });
    }
    if (this.csvAnalyticData) {
      const loading = await this.loadingController.create(null);
      loading.present().then(() => {
        this.subjectsService
          .importAnalyticData(this.id, this.csvAnalyticData, this.analyticFilename, this.date)
          .then(async () => {
            await loading.dismiss();
            this.toastService.show("success", "Datos importados con éxito");
          })
          .catch(async (error) => {
            await loading.dismiss();
            console.log(error);

            this.toastService.show("danger", "Error al importar datos");
          });
      });
    }
    if (this.csvEmbryologyData) {
      console.log(this.csvEmbryologyData);

      const loading = await this.loadingController.create(null);
      loading.present().then(() => {
        this.subjectsService
          .importEmbryologyData(this.id, this.csvEmbryologyData, this.embryologyFilename, this.date)
          .then(async () => {
            await loading.dismiss();
            this.toastService.show("success", "Datos importados con éxito");
          })
          .catch(async (error) => {
            await loading.dismiss();
            console.log(error);

            this.toastService.show("danger", "Error al importar datos");
          });
      });
    }
  }

  openUrl(url: string) {
    window.open(url, "_system");
  }
}
