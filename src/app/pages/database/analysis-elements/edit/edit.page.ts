import { Component, OnInit, OnDestroy } from "@angular/core";
import { AlertController } from "@ionic/angular";
import { ClinicAnalysisElementsService } from "src/app/services/clinic-analysis-elements.service";
import { Router, ActivatedRoute } from "@angular/router";
import { ToastService } from "src/app/services/toast.service";
import { Observable, Subscription } from "rxjs";
import * as moment from "moment";
import { ClinicAnalysisService } from "src/app/services/clinic-analysis.service";
import * as firebase from "firebase";
import { CategoriesService } from "src/app/services/categories.service";
import { LabelsService } from "src/app/services/labels.service";

@Component({
  selector: "app-edit",
  templateUrl: "./edit.page.html",
  styleUrls: ["./edit.page.scss"]
})
export class EditPage implements OnInit, OnDestroy {
  id: string;
  elementCode: string;
  format: string;
  name: string;
  intervaloEdad: string;

  information: string;

  analysisElement$: Observable<any>;
  analysisElement: any;
  analysisElementSub: Subscription;

  // Información antigua
  metricUnit: string;
  lowerLevel: number;
  upperLevel: number;
  lowerAge: number;
  upperAge: number;
  sex: string;

  // Información nueva SYNLAB general

  CODIGO: any;
  CODIGO_T: any;
  CUALITATIVO: any;
  DESCRIPCION: any;
  DESCRIPCION_TEST: any;
  GRUPO_VR: any;
  INTERPRETACION: any;
  OBSERVACIONES: any;
  UNIDAD: any;

  // Información nueva (lo que tiene un rango)
  INTERVALO_INF_EDAD: any;
  INTERVALO_SUP_EDAD: any;
  LIM_INF: any;
  LIM_SUP: any;
  SEXO: any;
  SIMBOLO_LIM_INF: any;
  SIMBOLO_LIM_SUP: any;
  SUBGRUPO_VR: any;
  TITULACION: any;
  UNIDAD_INTERVALO_EDAD: any;

  ranges = [];

  metrics = ["ng/mL", "mg/24h", "ng/dL", "ug/L", "mg/g creat", "ug/mL", "g/L", "Título", "%", "mg/dL", "U/mL", "mg/L", "µmol/L", "TRU/mL", "UA", "kU/L", "GPL-U/mL", "MPL-U/mL", "Índice", "pg/mL", "U/L", "KUI/L", "mg/g crea", "RU/mL", "UI/mL", "EU/mL", "g/g crea", "umol/L", "mmol/mol crea", "gr/24h", "ug/g creat", "UA/mL", "nmol/min/mL", "ug/24h", "mg/g creatinina", "KU/L", "mmol/L", "ug/g heces", "pmol/L", "U/gHb/seg-1", "ug/24 h", "ug/g crea", "x10³/mm³", "mequ/L", "mEqu/24h", "nmol/24 h", "ng/mg", "ug/dL", "mg/24 h", "nmol/mmol Cr", "g/g creat", "µg/L", "Indice", "kRU/L", "UI/L", "ug GIP / gr", "mg/mmol Crea", "mmol/mol cr", "ug/g cabello", "ng/L", "ug Eq/mL", "UB", "mU/L", "mEq/L", "mg Xilosa", "% recuper", "IE", "ng/mg creat", "% de Hb", "ug/g pelo", "nmol/L", "U/g creat", "pg/min", "seg", "ng/mL/hora", "% hemólisis", "ng B12/L", "nmol/h/mL", "mg/g cre", "CFU/g", "mUI/mL", "g/5h", "UL/g Hb", "Cociente", "fmol/L", "ug/g de tej", "UI/g Hb", "UI/g Hgb", "AU/ml", "mL", "nmol/21h ", "U/dL", "g/100gr", "mg/g heces hum", "mg/gr crea", "APL/mL", "nmol/h/mg pr", "mU/mL", "por mil", "copias/mL", "mmol/mol creat", "mmol/molcrea", "nmol/min/mg pr", "mOsm/Kg", "pmol/mg prot", "nmol ECO/mM cr", "MPL/mL", "mol/mol crea", "ug/g de tejido", "Ratio", "ug/g Crea", "U/24h", "AU/mL", "mEq/24h", "umol/g creat", "NG/10^9 PLT", "mm", "umol/24h", "GPL/mL", "mg/mg", "g/24h", "ug/g de crea", "k/UL", "umol/g crea", "/ 10³ Hematíes", "U/g Hb", "% lisis celular", "mg/gr creat", "nmol/mL", "mOsm/mL", "U. arb./mL", "nmol/min/mg", "ug/g Hb", "U/g"];
  genres = [];
  intervaloEdades = ["Años", "Días", "Horas", "Meses", "Semanas"];

  analysisElements: any;

  currentAnalysisData: any;

  clinicAnalysis: any;

  queryLabel: string;
  queryCategory: string;

  categories = [];
  labels = [];

  suggestedCategories: any;
  suggestedLabels: any;

  relatedCategories: any;
  relatedLabels: any;

  loinc: string;


  constructor(
    private analysisElementsService: ClinicAnalysisElementsService,
    private router: Router,
    private toastService: ToastService,
    private alertController: AlertController,
    private activatedRoute: ActivatedRoute,
    private clinicAnalysisService: ClinicAnalysisService,
    private categoriesService: CategoriesService,
    private labelsService: LabelsService,
  ) {
    this.id = this.activatedRoute.snapshot.params.id;
    this.metrics = this.metrics.sort();
  }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.getAnalysisElement();
    this.getClinicAnalysis();
    this.getLabels();
    this.getCategories();
  }

  getClinicAnalysis() {
    this.clinicAnalysisService.getAllData().then(data => {
      this.clinicAnalysis = data.docs.map(el => el = el.data()).sort((a, b) => {
        if (a.name < b.name) {
          return -1;
        }
        if (a.name > b.name) {
          return 1;
        }
        return 0;
      });
      console.log(this.clinicAnalysis);
    })
  }

  getAnalysisElement() {
    this.analysisElement$ = this.analysisElementsService.getClinicAnalysisElement(
      this.id
    );
    this.analysisElementSub = this.analysisElement$.subscribe(
      (analysisElement) => {
        this.analysisElement = analysisElement;
        this.ranges = this.analysisElement.ranges || [];
        this.name = this.analysisElement.name;
        this.elementCode = this.analysisElement.elementCode;
        this.format = this.analysisElement.format;
        this.information = this.analysisElement.information || null;
        this.relatedCategories = this.analysisElement.relatedCategories || [];
        this.relatedLabels = this.analysisElement.relatedLabels || [];
        this.loinc = this.analysisElement.loinc || null;

        console.log(this.analysisElement, "Elemento");
        console.log(this.ranges, "Ranges");
      }
    );
  }

  async getCategories() {
    const categories = await this.categoriesService.getAllData();
    categories.forEach(element => {
      this.categories.push(element.data());
    })
  }

  async getLabels() {
    const labels = await this.labelsService.getAllData();
    labels.forEach(element => {
      this.labels.push(element.data());
    })
  }

  async addCategory(category: any) {
    this.relatedCategories.push(category);
    this.queryCategory = null;

    this.analysisElementsService.updateClinicAnalysisElement(this.id, {
      relatedCategories: this.relatedCategories
    }).then(() => {
      this.toastService.show("success", "Categoría añadida con éxito")
    })

    // Referencias de categories
    this.categoriesService.update(category.id, {
      relatedClinicAnalysisElements: firebase.firestore.FieldValue.arrayUnion(this.id)
    })
  }

  async removeCategory(index: number, category: any) {
    this.relatedCategories.splice(index, 1);

    this.analysisElementsService.updateClinicAnalysisElement(this.id, {
      relatedCategories: this.relatedCategories
    }).then(() => {
      this.toastService.show("success", "Categoría eliminada con éxito")
    })

    // Referencias de categories
    this.categoriesService.update(category.id, {
      relatedClinicAnalysisElements: firebase.firestore.FieldValue.arrayRemove(this.id)
    })
  }

  async addLabel(label: any) {
    this.relatedLabels.push(label);
    this.queryLabel = null;

    this.analysisElementsService.updateClinicAnalysisElement(this.id, {
      relatedLabels: this.relatedLabels
    }).then(() => {
      this.toastService.show("success", "Etiqueta añadida con éxito")
    })

    // Referencias de labels
    this.labelsService.update(label.id, {
      relatedClinicAnalysisElements: firebase.firestore.FieldValue.arrayUnion(this.id)
    })
  }

  async removeLabel(index: number, label: any) {
    this.relatedLabels.splice(index, 1);

    this.analysisElementsService.updateClinicAnalysisElement(this.id, {
      relatedLabels: this.relatedLabels
    }).then(() => {
      this.toastService.show("success", "Etiqueta eliminada con éxito")
    })

    // Referencias de labels
    this.labelsService.update(label.id, {
      relatedClinicAnalysisElements: firebase.firestore.FieldValue.arrayRemove(this.id)
    })
  }

  onCategoryChange(input: string) {
    if (input.length > 0) {
      this.suggestedCategories = this.categories.filter(cat =>
        this.removeAccents(cat.name.trim().toLowerCase()).includes(this.removeAccents(input.trim().toLowerCase()))
      );
    } else {
      this.suggestedCategories = null;
    }
  }

  onLabelChange(input: string) {
    if (input.length > 0) {
      this.suggestedLabels = this.labels.filter(lab =>
        this.removeAccents(lab.name.trim().toLowerCase()).includes(this.removeAccents(input.trim().toLowerCase()))
      );
    } else {
      this.suggestedLabels = null;
    }
  }

  onSearch(event: any) {
    event.component.items = this.clinicAnalysis;
    if (event.text.length > 0) {
      event.component.items = event.component.items.filter(e => this.removeAccents(e.name.toLowerCase()).includes(this.removeAccents(event.text.toLowerCase())));
    }

  }

  removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  async addRange() {
    console.log(this.currentAnalysisData);

    let data = {
      SEXO: this.sex,
      INTERVALO_INF_EDAD: this.lowerAge || 0,
      INTERVALO_SUP_EDAD: this.upperAge || 999,
      LIM_INF: this.lowerLevel || null,
      LIM_SUP: this.upperLevel || null,
      UNIDAD_INTERVALO_EDAD: this.intervaloEdad || null,
      UNIDAD: this.metricUnit || null,
      testId: this.currentAnalysisData.id,
      CODIGO: this.currentAnalysisData.testCode,
      CODIGO_T: this.elementCode,
      DESCRIPCION: this.currentAnalysisData.name,
      DESCRIPCION_TEST: this.name
    }

    console.log(data);


    if (
      this.sex &&
      this.intervaloEdad &&
      this.metricUnit &&
      this.currentAnalysisData
    ) {

      data = {
        SEXO: this.sex,
        INTERVALO_INF_EDAD: this.lowerAge || 0,
        INTERVALO_SUP_EDAD: this.upperAge || 999,
        LIM_INF: this.lowerLevel || 0,
        LIM_SUP: this.upperLevel || 99999,
        UNIDAD_INTERVALO_EDAD: this.intervaloEdad || null,
        UNIDAD: this.metricUnit || null,
        testId: this.currentAnalysisData.id,
        CODIGO: this.currentAnalysisData.testCode,
        CODIGO_T: this.elementCode,
        DESCRIPCION: this.currentAnalysisData.name,
        DESCRIPCION_TEST: this.name
      }
      console.log(data);
      this.analysisElementsService.updateClinicAnalysisElement(this.id, {
        ranges: firebase.firestore.FieldValue.arrayUnion(data)
      }).then(async () => {
        // Se añade en la prueba
        this.clinicAnalysisService.update(data.testId, {
          elements: firebase.firestore.FieldValue.arrayUnion({
            id: this.id,
            name: this.name,
            order: 99,
          })
        }).then(() => {
          this.toastService.show("success", "Rango añadido con éxito");
          this.sex = null;
          this.lowerAge = null;
          this.upperAge = null;
          this.lowerLevel = null;
          this.upperLevel = null;
          this.intervaloEdad = null;
          this.metricUnit = null;
          this.currentAnalysisData = null;
        }).catch((error) => {
          this.toastService.show("danger", "No ha podido actualizarse la referencia en la prueba: " + error)
        })

      }).catch((error) => {
        this.toastService.show("danger", "No ha podido crearse el rango: " + error)
      })
    } else {
      this.toastService.show(
        "danger",
        "Faltan datos en el rango indicado, complete todos los campos"
      );
    }
  }

  async deleteRange(index: number) {
    const relatedTest = (await this.clinicAnalysisService.getData(this.ranges[index].testId)).data();

    console.log(relatedTest);

    if (relatedTest) {
      this.ranges.splice(index, 1);

      const rangesLength = this.ranges.filter(element => element.testId === relatedTest.id).length;

      this.analysisElementsService.updateClinicAnalysisElement(this.id, {
        ranges: this.ranges
      }).then(() => {
        // Referencia
        const element = relatedTest.elements.find(el => el.id === this.id);

        // Si no hay más elementos de ese test en ranges se quita la referencia.
        if (rangesLength === 0) {
          this.clinicAnalysisService.update(relatedTest.id, {
            elements: firebase.firestore.FieldValue.arrayRemove(element)
          }).then(() => {
            this.toastService.show("success", "Rango eliminado con éxito")
          }).catch((error) => {
            this.toastService.show("danger", "Error al eliminar la referencia del elemento en la prueba: " + error)
            console.log(error);

          })
        } else {
          this.toastService.show("success", "Rango eliminado con éxito")
        }

      }).catch((error) => {
        this.toastService.show("danger", "Error al eliminar el rango en el elemento: " + error)
        console.log(error);
      });
    }
  }

  save() {

    const element = {
      elementCode: this.elementCode,
      format: this.format,
      name: this.name,
      information: this.information,
      updatedAt: moment().format(),
      loinc: this.loinc
    };

    console.log(element);

    this.analysisElementsService
      .updateClinicAnalysisElement(this.id, element)
      .then(() => {
        // Añadir referencia en la prueba
        this.router.navigate(["/database/analysis-elements"]).then(() => {
          this.toastService.show(
            "success",
            "Elemento de análisis clínico editado con éxito"
          );
        });
      })
      .catch(() => {
        this.toastService.show(
          "danger",
          "Error al editar el elemento de análisis clínico"
        );
      });
  }

  async delete() {
    const alert = await this.alertController.create({
      header: "¿Estás seguro?",
      message: "Pulse aceptar para eliminar el elemento de análisis",
      buttons: [
        {
          text: "Cancelar",
          role: "cancel",
          cssClass: "secondary",
          handler: (blah) => { }
        },
        {
          text: "Aceptar",
          handler: async () => {
            // ELIMINAR REFERENCIAS

            for await (const element of this.ranges) {
              const el = (await this.clinicAnalysisService.getData(element.testId)).data();
              const related = el.elements.find(eli => eli.id === this.id);
              this.clinicAnalysisService.update(related.id, {
                elements: firebase.firestore.FieldValue.arrayRemove({
                  id: related.id,
                  name: related.name,
                  order: related.order,
                })
              })
            }

            // ELIMINAR ELEMENTO
            this.analysisElementsService
              .deleteClinicAnalysisElement(this.id)
              .then(async () => {
                this.analysisElementSub.unsubscribe();
                this.router.navigate(["/database/analysis-elements"]);
                this.toastService.show(
                  "success",
                  "Elemento de análisis eliminado con éxito"
                );
              })
              .catch(() => {
                this.toastService.show(
                  "danger",
                  "Error: Ha hablido algún error al eliminar el elemento de análisis, inténtelo más tarde"
                );
              })
              .catch(() => {
                this.toastService.show(
                  "danger",
                  "Error al eliminar referencia en enfermedad"
                );
              });
          }
        }
      ]
    });

    await alert.present();
  }

  ngOnDestroy() {
    if (this.analysisElementSub) {
      this.analysisElementSub.unsubscribe();
    }
  }
}
