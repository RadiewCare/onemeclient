import { Component, OnInit, OnDestroy } from "@angular/core";
import { ToastService } from "src/app/services/toast.service";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription, Observable } from "rxjs";
import * as moment from "moment";
import * as firebase from "firebase/app";
import { DiseasesService } from "src/app/services/diseases.service";
import { ClinicAnalysisElementsService } from "src/app/services/clinic-analysis-elements.service";
import { GeneticElementsService } from "src/app/services/genetic-elements.service";
import { ModalController, AlertController } from "@ionic/angular";
import { AddEpigeneticElementPage } from "./add-epigenetic-element/add-epigenetic-element.page";
import { AddMutationPage } from "./add-mutation/add-mutation.page";
import { AddImageTestPage } from "./add-image-test/add-image-test.page";
import { AddAnalysisElementPage } from "./add-analysis-element/add-analysis-element.page";
import { AddGeneticElementPage } from "./add-genetic-element/add-genetic-element.page";
import { MutationsService } from "src/app/services/mutations.service";
import { AddPhenotypicElementPage } from "./add-phenotypic-element/add-phenotypic-element.page";
import { ImageTestsService } from "src/app/services/image-tests.service";
import { ImportPage } from "./import/import.page";

@Component({
  selector: "app-edit",
  templateUrl: "./edit.page.html",
  styleUrls: ["./edit.page.scss"]
})
export class EditPage implements OnInit, OnDestroy {
  id: string;
  name: any;

  notes: string;

  highRiskExplanation: string;
  mediumRiskExplanation: string;
  lowRiskExplanation: string;

  disease: any;
  diseaseSub: Subscription;

  geneticElements$: Observable<any>;
  geneticElements: any;
  geneticElementsSub: Subscription;

  clinicAnalysisElements$: Observable<any>;
  clinicAnalysisElements: any;
  clinicAnalysisElementsSub: Subscription;

  imageTests$: Observable<any>;
  imageTests: any;
  imageTestsSub: Subscription;

  constructor(
    private diseasesService: DiseasesService,
    private clinicAnalysisService: ClinicAnalysisElementsService,
    private geneticElementsService: GeneticElementsService,
    private toastService: ToastService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private modalController: ModalController,
    private alertController: AlertController,
    private mutationsService: MutationsService,
    private imageTestsService: ImageTestsService
  ) {
    this.id = this.activatedRoute.snapshot.paramMap.get("id");
  }

  ngOnInit() {
    this.diseaseSub = this.diseasesService
      .getDisease(this.id)
      .subscribe((disease) => {
        this.disease = disease;
        this.name = disease.name;
        this.notes = disease.notes;
        this.highRiskExplanation = disease.highRiskExplanation;
        this.mediumRiskExplanation = disease.mediumRiskExplanation;
        this.lowRiskExplanation = disease.lowRiskExplanation;
      });
  }

  ionViewDidEnter() {
    this.geneticElements$ = this.geneticElementsService.getGeneticElements();
    this.geneticElementsSub = this.geneticElements$.subscribe(
      (geneticElements) => {
        this.geneticElements = geneticElements;
      }
    );

    this.clinicAnalysisElements$ = this.clinicAnalysisService.getClinicAnalysisElements();
    this.clinicAnalysisElementsSub = this.clinicAnalysisElements$.subscribe(
      (analysisElements) => {
        this.clinicAnalysisElements = analysisElements;
      }
    );
  }

  async addPhenotypicElement() {
    const modal = await this.modalController.create({
      component: AddPhenotypicElementPage,
      componentProps: {
        id: this.id
      }
    });
    return await modal.present();
  }

  deletePhenotypicConfig(index: string) {
    this.disease.phenotypicElements.splice(index, 1);
  }

  async addGeneticElement() {
    const modal = await this.modalController.create({
      component: AddGeneticElementPage,
      componentProps: {
        id: this.id
      }
    });
    return await modal.present();
  }

  async addAnalysisElement() {
    const modal = await this.modalController.create({
      component: AddAnalysisElementPage,
      componentProps: {
        id: this.id
      }
    });
    return await modal.present();
  }

  async deleteAnalysisElement(diseaseId: string, elementId: string) {
    this.clinicAnalysisService
      .getClinicAnalysisElementData(elementId)
      .then((element) => {
        this.diseasesService
          .updateDisease(diseaseId, {
            analysisElements: firebase.firestore.FieldValue.arrayRemove({
              id: element.data().id,
              name: element.data().name
            })
          })
          .then(() => {
            this.toastService.show(
              "success",
              "Prueba de laboratorio eliminada de la enfermedad"
            );
          })
          .catch((error) => {
            this.toastService.show(
              "danger",
              "Error al eliminar la prueba de laboratorio en la enfermedad" +
                error
            );
          });
      });
  }

  async addImageTest() {
    const modal = await this.modalController.create({
      component: AddImageTestPage,
      componentProps: {
        id: this.id
      }
    });
    return await modal.present();
  }

  async deleteImageTest(diseaseId: string, index: number) {
    console.log(index);

    this.diseasesService.getDiseaseData(diseaseId).then((element) => {
      const removed = element.data().imageTests.splice(index, 1);

      this.diseasesService
        .updateDisease(diseaseId, {
          imageTests: firebase.firestore.FieldValue.arrayRemove(removed[0])
        })
        .then(() => {
          this.toastService.show(
            "success",
            "Prueba de laboratorio eliminada de la enfermedad"
          );
        })
        .catch((error) => {
          this.toastService.show(
            "danger",
            "Error al eliminar la prueba de laboratorio en la enfermedad" +
              error
          );
        });
    });
  }

  async addMutation() {
    const modal = await this.modalController.create({
      component: AddMutationPage,
      componentProps: {
        id: this.id
      }
    });
    return await modal.present();
  }

  async deleteMutation(diseaseId: string, mutationId: string) {
    this.mutationsService.getMutationData(mutationId).then((element) => {
      this.diseasesService
        .updateDisease(diseaseId, {
          mutations: firebase.firestore.FieldValue.arrayRemove({
            id: element.data().id,
            name: element.data().name
          })
        })
        .then(() => {
          this.toastService.show(
            "success",
            "Mutación eliminada de la enfermedad"
          );
        })
        .catch((error) => {
          this.toastService.show(
            "danger",
            "Error al eliminar la mutación en la enfermedad" + error
          );
        });
    });
  }

  async addEpigeneticElement() {
    const modal = await this.modalController.create({
      component: AddEpigeneticElementPage,
      componentProps: {
        id: this.id
      }
    });
    return await modal.present();
  }

  async importGeneticElements() {
    const modal = await this.modalController.create({
      component: ImportPage,
      componentProps: {
        id: this.id
      }
    });
    return await modal.present();
  }

  save() {
    if (this.name.length !== 0) {
      this.diseasesService
        .updateDisease(this.id, {
          name: this.name,
          notes: this.notes || null,
          highRiskExplanation: this.highRiskExplanation || null,
          mediumRiskExplanation: this.mediumRiskExplanation || null,
          lowRiskExplanation: this.lowRiskExplanation || null,
          phenotypicElements: this.disease.phenotypicElements || null,
          updatedAt: moment().format()
        })
        .then(() => {
          this.toastService.show("success", "Enfermedad editada con éxito");
        })
        .catch((error) => {
          this.toastService.show(
            "danger",
            "Error al editar la enfermedad: " + error
          );
        });
    } else {
      this.toastService.show("danger", "Error: Rellene todos los campos");
    }
  }

  async delete() {
    const alert = await this.alertController.create({
      header: "¿Estás seguro?",
      message:
        "Pulse aceptar para eliminar la enfermedad. Se perderán todos los elementos genéticos asociados.",
      buttons: [
        {
          text: "Cancelar",
          role: "cancel",
          cssClass: "secondary",
          handler: (blah) => {}
        },
        {
          text: "Aceptar",
          handler: () => {
            this.diseaseSub.unsubscribe();
            this.router.navigate(["/database/diseases"]);
            this.diseasesService
              .deleteDisease(this.id)
              .then(() => {
                this.toastService.show(
                  "success",
                  "Enfermedad eliminada con éxito"
                );
              })
              .catch(() => {
                this.toastService.show(
                  "danger",
                  "Error al eliminar la enfermedad"
                );
              });
          }
        }
      ]
    });

    await alert.present();
  }

  ngOnDestroy() {
    if (this.imageTestsSub) {
      this.imageTestsSub.unsubscribe();
    }
    if (this.clinicAnalysisElementsSub) {
      this.clinicAnalysisElementsSub.unsubscribe();
    }
    if (this.geneticElementsSub) {
      this.geneticElementsSub.unsubscribe();
    }
    if (this.diseaseSub) {
      this.diseaseSub.unsubscribe();
    }
  }
}
