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
import { ImageTestsElementsService } from 'src/app/services/image-tests-elements.service';
import { CategoriesService } from 'src/app/services/categories.service';
import { LabelsService } from 'src/app/services/labels.service';

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

  imageBiomarkers = [];
  imageTestsElements: any;
  imageTestsElementsSub: Subscription;
  imageTestsElements$: Observable<any>;


  queryLabel: string;
  queryCategory: string;

  categories = [];
  labels = [];

  suggestedCategories: any;
  suggestedLabels: any;

  relatedCategories: any;
  relatedLabels: any;

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
    private imageTestsElementsService: ImageTestsElementsService,
    private categoriesService: CategoriesService,
    private labelsService: LabelsService,
    private imageTestsService: ImageTestsService
  ) {
    this.id = this.activatedRoute.snapshot.paramMap.get("id");
  }

  ngOnInit() {
    this.diseaseSub = this.diseasesService
      .getDisease(this.id)
      .subscribe((disease) => {
        this.disease = disease;
        console.log(this.disease);

        this.name = disease.name;
        this.notes = disease.notes;
        this.highRiskExplanation = disease.highRiskExplanation;
        this.mediumRiskExplanation = disease.mediumRiskExplanation;
        this.lowRiskExplanation = disease.lowRiskExplanation;

        this.relatedLabels = disease.relatedLabels || [];
        this.relatedCategories = disease.relatedCategories || [];
      });
    this.getCategories();
    this.getLabels();
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

  onCategoryChange(input: string) {
    if (input.length > 0) {
      this.suggestedCategories = this.categories.filter(cat =>
        cat.name.trim().toLowerCase().includes(input.trim().toLowerCase())
      );
    } else {
      this.suggestedCategories = null;
    }
  }

  onLabelChange(input: string) {
    if (input.length > 0) {
      this.suggestedLabels = this.labels.filter(lab =>
        lab.name.trim().toLowerCase().includes(input.trim().toLowerCase())
      );
    } else {
      this.suggestedLabels = null;
    }
  }

  async addCategory(category: any) {
    this.relatedCategories.push(category);
    this.queryCategory = null;

    this.diseasesService.updateDisease(this.id, {
      relatedCategories: this.relatedCategories
    }).then(() => {
      this.toastService.show("success", "Categoría añadida con éxito")
    })

    // Referencias de categories
    this.categoriesService.update(category.id, {
      relatedDiseases: firebase.firestore.FieldValue.arrayUnion(this.id)
    })
  }

  async removeCategory(index: number, category: any) {
    this.relatedCategories.splice(index, 1);

    this.diseasesService.updateDisease(this.id, {
      relatedCategories: this.relatedCategories
    }).then(() => {
      this.toastService.show("success", "Categoría eliminada con éxito")
    })

    // Referencias de categories
    this.categoriesService.update(category.id, {
      relatedDiseases: firebase.firestore.FieldValue.arrayRemove(this.id)
    })
  }

  async addLabel(label: any) {
    this.relatedLabels.push(label);
    this.queryLabel = null;

    this.diseasesService.updateDisease(this.id, {
      relatedLabels: this.relatedLabels
    }).then(() => {
      this.toastService.show("success", "Etiqueta añadida con éxito")
    })

    // Referencias de labels
    this.labelsService.update(label.id, {
      relatedDiseases: firebase.firestore.FieldValue.arrayUnion(this.id)
    })
  }

  async removeLabel(index: number, label: any) {
    this.relatedLabels.splice(index, 1);

    this.diseasesService.updateDisease(this.id, {
      relatedLabels: this.relatedLabels
    }).then(() => {
      this.toastService.show("success", "Etiqueta eliminada con éxito")
    })

    // Referencias de labels
    this.labelsService.update(label.id, {
      relatedDiseases: firebase.firestore.FieldValue.arrayRemove(this.id)
    })
  }

  /* MODIFICACIONES */

  migrateImageBiomarkers() {

    const diseasesResult = [];

    this.imageTestsElements$ = this.imageTestsElementsService.getImageTestElements();

    this.imageTestsElementsSub = this.imageTestsElements$.subscribe(imageTestsElements => {

      const filteredBiomarkers = imageTestsElements.map(element => element.name);

      this.diseasesService.getDiseasesData().then(async diseases => {

        const diseasesList = [];

        for await (const element of diseases.docs) {
          diseasesList.push(element.data());
        }

        for await (const disease of diseasesList) {

          if (disease.imageTests) {
            const filteredImageTests = disease.imageTests.map(element => element.test);

            filteredImageTests.forEach(imageTest => {
              if (filteredBiomarkers.includes(imageTest)) {
                const index = imageTestsElements.findIndex(element => element.name === imageTest);
                if (!disease.imageBiomarkers) {
                  disease.imageBiomarkers = [];
                }
                disease.imageBiomarkers.push({
                  id: imageTestsElements[index].id,
                  name: imageTestsElements[index].name,
                  order: 0
                })
              }
            });
            diseasesResult.push(disease);

            // update del disease

            if (disease.id && disease.imageBiomarkers) {
              this.diseasesService.updateDisease(disease.id, { imageBiomarkers: disease.imageBiomarkers });
            }
          }

        }
        console.log("terminado");

      })

      // this.diseasesService.updateDisease(this.id, { imageBiomarkers: this.imageBiomarkers });
    })
  }

  /* MODIFICACIONES */

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
      const removed = element.data().imageBiomarkers.splice(index, 1);

      this.diseasesService
        .updateDisease(diseaseId, {
          imageBiomarkers: firebase.firestore.FieldValue.arrayRemove(removed[0])
        })
        .then(() => {
          this.toastService.show(
            "success",
            "Biomarcador de prueba de imagen eliminado de la enfermedad"
          );
        })
        .catch((error) => {
          this.toastService.show(
            "danger",
            "Error al eliminar el biomarcador de la prueba de imagen en la enfermedad" +
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

  async deleteEpigeneticFeatures(
    diseaseId: string,
    epigeneticFeatureId: string
  ) { }

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
          handler: (blah) => { }
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
    if (this.imageTestsElementsSub) {
      this.imageTestsElementsSub.unsubscribe();
    }
  }
}
