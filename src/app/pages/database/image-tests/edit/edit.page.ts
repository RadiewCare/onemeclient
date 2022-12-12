import { Component, OnInit } from "@angular/core";
import { ImageTestsService } from "src/app/services/image-tests.service";
import { ImageTestsElementsService } from "src/app/services/image-tests-elements.service";
import { ToastService } from "src/app/services/toast.service";
import { ActivatedRoute, Router } from "@angular/router";
import { ModalController, AlertController, LoadingController } from "@ionic/angular";
import { Observable, Subscription } from "rxjs";
import { AddImageTestElementPage } from "./add-image-test-element/add-image-test-element.page";
import * as moment from "moment";
import * as firebase from 'firebase';
import { CategoriesService } from 'src/app/services/categories.service';
import { LabelsService } from 'src/app/services/labels.service';

@Component({
  selector: "app-edit",
  templateUrl: "./edit.page.html",
  styleUrls: ["./edit.page.scss"]
})
export class EditPage implements OnInit {
  id: string;
  name: any;
  bibliography: any;

  imageTest$: Observable<any>;
  imageTest: any;
  imageTestSub: Subscription;

  queryLabel: string;
  queryCategory: string;
 
  categories = [];
  labels = [];

  suggestedCategories: any;
  suggestedLabels: any;

  relatedCategories: any;
  relatedLabels: any;

  constructor(
    private imageTestsService: ImageTestsService,
    private imageTestsElementsService: ImageTestsElementsService,
    private toastService: ToastService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private modalController: ModalController,
    private alertController: AlertController,
    private categoriesService: CategoriesService,
    private labelsService: LabelsService,
    private loadingController: LoadingController
  ) {
    this.id = this.activatedRoute.snapshot.paramMap.get("id");
  }

  ngOnInit() {
    this.getImageTest();
    this.getCategories();
    this.getLabels();
  }

  getImageTest() {
    this.imageTestSub = this.imageTestsService
      .getImageTest(this.id)
      .subscribe((imageTest) => {
        this.imageTest = imageTest;
        this.name = this.imageTest.name;
        this.bibliography = this.imageTest.bibliography;
        this.relatedCategories = this.imageTest.relatedCategories || [];
        this.relatedLabels = this.imageTest.relatedLabels || [];
      });
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

  async addImageTestElement() {
    const modal = await this.modalController.create({
      component: AddImageTestElementPage,
      componentProps: {
        id: this.id,
        action: "create"
      }
    });
    return await modal.present();
  }

  editImageTestElement(name: string, index: number) {
    console.log(name, index);

    // this.router.navigate(`/database/image-test-elements/`);
    /*const modal = await this.modalController.create({
      component: AddImageTestElementPage,
      componentProps: {
        id: this.id,
        action: "edit",
        index: index
      }
    });
    return await modal.present();*/
  }

  async deleteImageTestElement(id: string) {
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
            this.imageTestsService
              .updateImageTest(this.id, {
                elements: this.imageTest.elements.filter(
                  (element) => element.id !== id
                )
              })
              .then(() => {
                // Eliminar de relatedTest dentro del elemento
                this.imageTestsElementsService.updateImageTestElement(id, {
                  relatedTests: firebase.firestore.FieldValue.arrayRemove(this.id)
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
    const item = this.imageTest.elements.splice(ev.detail.from, 1)[0];
    this.imageTest.elements.splice(ev.detail.to, 0, item);
    let index = 0;
    this.imageTest.elements.forEach(element => {
      element.order = index;
      index = index + 1;
    });
    ev.detail.complete();
    console.log(this.imageTest.elements);
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

    this.imageTestsService.updateImageTest(this.id, {
      relatedCategories: this.relatedCategories
    }).then(() => {
      this.toastService.show("success", "Categoría añadida con éxito")
    })

    // Referencias de categories
    this.categoriesService.update(category.id, {
      relatedImageTests: firebase.firestore.FieldValue.arrayUnion(this.id)
    })
  }

  async removeCategory(index: number, category: any) {
    this.relatedCategories.splice(index, 1);

    this.imageTestsService.updateImageTest(this.id, {
      relatedCategories: this.relatedCategories
    }).then(() => {
      this.toastService.show("success", "Categoría eliminada con éxito")
    })

    // Referencias de categories
    this.categoriesService.update(category.id, {
      relatedImageTests: firebase.firestore.FieldValue.arrayRemove(this.id)
    })
  }

  async addLabel(label: any) {
    this.relatedLabels.push(label);
    this.queryLabel = null;

    this.imageTestsService.updateImageTest(this.id, {
      relatedLabels: this.relatedLabels
    }).then(() => {
      this.toastService.show("success", "Etiqueta añadida con éxito")
    })

    // Referencias de labels
    this.labelsService.update(label.id, {
      relatedImageTests: firebase.firestore.FieldValue.arrayUnion(this.id)
    })
  }

  async removeLabel(index: number, label: any) {
    this.relatedLabels.splice(index, 1);

    this.imageTestsService.updateImageTest(this.id, {
      relatedLabels: this.relatedLabels
    }).then(() => {
      this.toastService.show("success", "Etiqueta eliminada con éxito")
    })

    // Referencias de labels
    this.labelsService.update(label.id, {
      relatedImageTests: firebase.firestore.FieldValue.arrayRemove(this.id)
    })
  }

  save() {
    if (this.name.length !== 0) {
      this.presentLoading();
      this.imageTestsService
        .updateImageTest(this.id, {
          name: this.name,
          bibliography: this.bibliography,
          elements: this.imageTest.elements,
          updatedAt: moment().format()
        })
        .then(async () => {

          this.loadingController.dismiss();
          this.toastService.show(
            "success",
            "Prueba de imagen editada con éxito"
          );
        })
        .catch(() => {
          this.loadingController.dismiss();
          this.toastService.show(
            "danger",
            "Error al editar la prueba de imagen"
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
        "Pulse aceptar para eliminar la prueba de imagen. Se perderán todos los elementos asociados.",
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
            this.imageTestsService
              .deleteImageTest(this.id)
              .then(() => {
                this.router.navigate(["/database/image-tests"]).then(() => {
                  this.toastService.show(
                    "success",
                    "Prueba de imagen eliminada con éxito"
                  );
                });
              })
              .catch(() => {
                this.toastService.show(
                  "danger",
                  "Error al eliminar la prueba de imagen"
                );
              });
          }
        }
      ]
    });

    await alert.present();
  }
}
