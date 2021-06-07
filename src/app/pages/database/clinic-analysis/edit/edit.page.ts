import { Component, OnInit } from "@angular/core";
import { ToastService } from "src/app/services/toast.service";
import { ActivatedRoute, Router } from "@angular/router";
import { ModalController, AlertController, LoadingController } from "@ionic/angular";
import { Observable, Subscription } from "rxjs";
import * as moment from "moment";
import * as firebase from 'firebase';
import { CategoriesService } from 'src/app/services/categories.service';
import { LabelsService } from 'src/app/services/labels.service';
import { ClinicAnalysisService } from "src/app/services/clinic-analysis.service";
import { ClinicAnalysisElementsService } from "src/app/services/clinic-analysis-elements.service";
import { AddAnalysisElementPage } from "./add-analysis-element/add-analysis-element.page";

@Component({
  selector: 'app-edit',
  templateUrl: './edit.page.html',
  styleUrls: ['./edit.page.scss'],
})
export class EditPage implements OnInit {

  id: string;
  name: any;

  clinicAnalysis$: Observable<any>;
  clinicAnalysis: any;
  clinicAnalysisSub: Subscription;

  analysisElements: any;

  queryLabel: string;
  queryCategory: string;

  categories = [];
  labels = [];

  suggestedCategories: any;
  suggestedLabels: any;

  relatedCategories: any;
  relatedLabels: any;

  testCode: string;

  isDefault: boolean;

  names = [];

  information: string;

  constructor(
    private toastService: ToastService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private modalController: ModalController,
    private alertController: AlertController,
    private categoriesService: CategoriesService,
    private labelsService: LabelsService,
    private loadingController: LoadingController,
    private clinicAnalysisService: ClinicAnalysisService,
    private clinicAnalysisElementsService: ClinicAnalysisElementsService
  ) {
    this.id = this.activatedRoute.snapshot.paramMap.get("id");
  }

  async ngOnInit() {
    await this.getAnalysisElements();
    this.getClinicAnalysis();
    this.getCategories();
    this.getLabels();
  }

  ionViewDidEnter() { }

  async getClinicAnalysis() {
    this.clinicAnalysisSub = this.clinicAnalysisService
      .get(this.id)
      .subscribe(async (clinicAnalysis) => {
        this.clinicAnalysis = clinicAnalysis;
        this.clinicAnalysis.elements = this.clinicAnalysis.elements || [];
        this.name = this.clinicAnalysis.name;
        this.testCode = this.clinicAnalysis.testCode;
        this.relatedCategories = this.clinicAnalysis.relatedCategories || [];
        this.relatedLabels = this.clinicAnalysis.relatedLabels || [];
        this.isDefault = this.clinicAnalysis.isDefault || false;
        this.information = this.clinicAnalysis.information || null;
        await this.getData();
      });
  }

  async getAnalysisElements(): Promise<void> {
    return new Promise(async (resolve) => {
      this.analysisElements = (await this.clinicAnalysisElementsService.getClinicAnalysisElementsData()).docs.map(data => data.data());
      console.log(this.analysisElements);
      resolve();
    })

  }

  async getData(): Promise<void> {
    return new Promise(async (resolve) => {
      let index = 0;
      console.log(this.clinicAnalysis.elements);

      for await (const element of this.clinicAnalysis.elements) {
        console.log(element);

        this.clinicAnalysis.elements[index].name = (this.analysisElements.find(el => el.id === element.id).name);
        index = index + 1;
      }
      resolve();
    })
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

  async addAnalysisElement() {
    const modal = await this.modalController.create({
      component: AddAnalysisElementPage,
      componentProps: {
        id: this.id,
      }
    });
    return await modal.present();
  }

  async editAnalysisElement(name: string, index: number) {
    console.log(name, index);

    this.router.navigate(["/database/analysis-elements"]);
    const modal = await this.modalController.create({
      component: AddAnalysisElementPage,
      componentProps: {
        id: this.id,
        action: "edit",
        index: index
      }
    });
    return await modal.present();
  }

  async deleteAnalysisElement(id: string) {
    const alert = await this.alertController.create({
      header: "¿Estás seguro?",
      message: "Pulse aceptar para eliminar el elemento de prueba",
      buttons: [
        {
          text: "Cancelar",
          role: "cancel",
          cssClass: "secondary",
          handler: (blah) => { }
        },
        {
          text: "Aceptar",
          handler: () => {
            this.clinicAnalysisService
              .update(this.id, {
                elements: this.clinicAnalysis.elements.filter(
                  (element) => element.id !== id
                )
              })
              .then(async () => {
                // Eliminar de relatedTest dentro del elemento
                const ele = (await this.clinicAnalysisElementsService.getClinicAnalysisElementData(id)).data();
                const ranges = ele.ranges.filter(el => el.CODIGO !== this.testCode);
                this.clinicAnalysisElementsService.updateClinicAnalysisElement(id, {
                  relatedTests: firebase.firestore.FieldValue.arrayRemove(this.id),
                  ranges: ranges
                }).then(() => {
                  this.toastService.show(
                    "success",
                    "Elemento de prueba eliminado con éxito"
                  );
                }).catch(error => {
                  this.toastService.show(
                    "danger",
                    "Error al eliminar la referencia de la prueba en el elemento de prueba"
                  );
                })
              })
              .catch(() => {
                this.toastService.show(
                  "danger",
                  "Error al eliminar el elemento de prueba"
                );
              });
          }
        }
      ]
    });

    await alert.present();
  }

  doReorder(ev: any) {
    const item = this.clinicAnalysis.elements.splice(ev.detail.from, 1)[0];
    this.clinicAnalysis.elements.splice(ev.detail.to, 0, item);
    let index = 0;
    this.clinicAnalysis.elements.forEach(element => {
      element.order = index;
      index = index + 1;
    });
    ev.detail.complete();
    console.log(this.clinicAnalysis.elements);
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

  removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  async addCategory(category: any) {
    this.relatedCategories.push(category);
    this.queryCategory = null;

    this.clinicAnalysisService.update(this.id, {
      relatedCategories: this.relatedCategories
    }).then(() => {
      this.toastService.show("success", "Categoría añadida con éxito")
    })

    // Referencias de categories
    this.categoriesService.update(category.id, {
      relatedClinicAnalysis: firebase.firestore.FieldValue.arrayUnion(this.id)
    })
  }

  async removeCategory(index: number, category: any) {
    this.relatedCategories.splice(index, 1);

    this.clinicAnalysisService.update(this.id, {
      relatedCategories: this.relatedCategories
    }).then(() => {
      this.toastService.show("success", "Categoría eliminada con éxito")
    })

    // Referencias de categories
    this.categoriesService.update(category.id, {
      relatedClinicAnalysis: firebase.firestore.FieldValue.arrayRemove(this.id)
    })
  }

  async addLabel(label: any) {
    this.relatedLabels.push(label);
    this.queryLabel = null;

    this.clinicAnalysisService.update(this.id, {
      relatedLabels: this.relatedLabels
    }).then(() => {
      this.toastService.show("success", "Etiqueta añadida con éxito")
    })

    // Referencias de labels
    this.labelsService.update(label.id, {
      relatedClinicAnalysis: firebase.firestore.FieldValue.arrayUnion(this.id)
    })
  }

  async removeLabel(index: number, label: any) {
    this.relatedLabels.splice(index, 1);

    this.clinicAnalysisService.update(this.id, {
      relatedLabels: this.relatedLabels
    }).then(() => {
      this.toastService.show("success", "Etiqueta eliminada con éxito")
    })

    // Referencias de labels
    this.labelsService.update(label.id, {
      relatedClinicAnalysis: firebase.firestore.FieldValue.arrayRemove(this.id)
    })
  }

  save() {
    if (this.name.length !== 0) {
      this.presentLoading();
      this.clinicAnalysisService
        .update(this.id, {
          name: this.name,
          elements: this.clinicAnalysis.elements,
          updatedAt: moment().format(),
          isDefault: this.isDefault,
          information: this.information
        })
        .then(async () => {

          this.loadingController.dismiss();
          this.toastService.show(
            "success",
            "Prueba de análisis clínico editada con éxito"
          );
        })
        .catch(() => {
          this.loadingController.dismiss();
          this.toastService.show(
            "danger",
            "Error al editar la prueba de análisis clínico"
          );
        });
    } else {
      this.toastService.show("danger", "Error: Rellene todos los campos");
    }
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      message: 'Actualizando...',
    });
    await loading.present();
  }

  async delete() {
    const alert = await this.alertController.create({
      header: "¿Estás seguro?",
      message:
        "Pulse aceptar para eliminar la prueba de anaálisis clínico. Se perderán todos los elementos asociados.",
      buttons: [
        {
          text: "Cancelar",
          role: "cancel",
          cssClass: "secondary",
          handler: (blah) => { }
        },
        {
          text: "Aceptar",
          handler: () => {
            this.clinicAnalysisService
              .delete(this.id)
              .then(() => {
                this.router.navigate(["/database/clinic-analysis"]).then(() => {
                  this.toastService.show(
                    "success",
                    "Prueba de análisis clínico eliminada con éxito"
                  );
                });
              })
              .catch(() => {
                this.toastService.show(
                  "danger",
                  "Error al eliminar la prueba de análisis clínico"
                );
              });
          }
        }
      ]
    });

    await alert.present();
  }

}
