import { Component, OnInit } from "@angular/core";
import { ImageTestsService } from "src/app/services/image-tests.service";
import { ImageTestsElementsService } from "src/app/services/image-tests-elements.service";
import { ToastService } from "src/app/services/toast.service";
import { ActivatedRoute, Router } from "@angular/router";
import { ModalController, AlertController } from "@ionic/angular";
import { Observable, Subscription } from "rxjs";
import { AddImageTestElementPage } from "./add-image-test-element/add-image-test-element.page";
import * as moment from "moment";

@Component({
  selector: "app-edit",
  templateUrl: "./edit.page.html",
  styleUrls: ["./edit.page.scss"]
})
export class EditPage implements OnInit {
  id: string;
  name: any;

  imageTest$: Observable<any>;
  imageTest: any;
  imageTestSub: Subscription;

  constructor(
    private imageTestsService: ImageTestsService,
    private imageTestsElementsService: ImageTestsElementsService,
    private toastService: ToastService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private modalController: ModalController,
    private alertController: AlertController
  ) {
    this.id = this.activatedRoute.snapshot.paramMap.get("id");
  }

  ngOnInit() {
    this.getImageTest();
  }

  getImageTest() {
    this.imageTestSub = this.imageTestsService
      .getImageTest(this.id)
      .subscribe((imageTest) => {
        this.imageTest = imageTest;
        this.name = this.imageTest.name;
      });
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

  async editImageTestElement(name: string, index: number) {
    const modal = await this.modalController.create({
      component: AddImageTestElementPage,
      componentProps: {
        id: this.id,
        action: "edit",
        index: index
      }
    });
    return await modal.present();
  }

  deleteImageTestElement(name: string) {
    this.imageTestsService
      .updateImageTest(this.id, {
        fields: this.imageTest.fields.filter((field) => field.name !== name)
      })
      .then(() => {
        this.toastService.show(
          "success",
          "Elemento de prueba de imagen eliminado con éxito"
        );
      })
      .catch(() => {
        this.toastService.show(
          "danger",
          "Error al eliminar el elemento de prueba de imagen"
        );
      });
  }

  save() {
    if (this.name.length !== 0) {
      this.imageTestsService
        .updateImageTest(this.id, {
          name: this.name,
          updatedAt: moment().format()
        })
        .then(() => {
          this.router.navigate(["/database/image-tests"]).then(() => {
            this.toastService.show(
              "success",
              "Prueba de imagen editada con éxito"
            );
          });
        })
        .catch(() => {
          this.toastService.show(
            "danger",
            "Error al editar la prueba de imagen"
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
        "Pulse aceptar para eliminar la prueba de imagen. Se perderán todos los elementos asociados.",
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
