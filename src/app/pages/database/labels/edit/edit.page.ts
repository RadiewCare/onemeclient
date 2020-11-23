import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { DiseasesService } from 'src/app/services/diseases.service';
import { ImageTestsService } from 'src/app/services/image-tests.service';
import { LabelsService } from 'src/app/services/labels.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.page.html',
  styleUrls: ['./edit.page.scss'],
})
export class EditPage implements OnInit {

  id: string;

  label: any;
  labelName: string = "";
  labelNameInDatabase: string;
  labels = [];

  relatedDiseases: any;
  relatedImageTests: any;
  relatedClinicTests: any;

  labelsSub: Subscription;

  constructor(
    private labelsService: LabelsService,
    private toastService: ToastService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private alertController: AlertController,
    private imageTestsService: ImageTestsService,
    private loadingController: LoadingController,
    private diseasesService: DiseasesService) {
    this.id = this.activatedRoute.snapshot.params.id;
  }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.getLabel();
    this.getLabels();
  }

  getLabel() {
    this.labelsService.getData(this.id).then(data => {
      this.label = data.data();
      console.log(this.label);

      this.labelName = this.label.name
      this.labelNameInDatabase = this.label.name;

      this.relatedDiseases = this.label.relatedDiseases || [];
      this.relatedImageTests = this.label.relatedImageTests || [];
      this.relatedClinicTests = this.label.relatedClinicTests || [];
    })
  }

  async getLabels() {
    this.labelsSub = this.labelsService.getAll().subscribe(data => {
      this.labels = data;
    })
  }

  isValid() {
    const labelsNames = this.labels.map(element => element = element.name.toLowerCase());

    if (
      this.labelName.trim().length === 0
    ) {
      return false
    } else {
      if (this.labelName.trim().toLowerCase() === this.labelNameInDatabase.trim().toLowerCase()) {
        return true;
      } else {
        if (labelsNames.includes(this.labelName.trim().toLowerCase())) {
          return false;
        } else return true;
      }
    };
  }

  save() {
    if (this.isValid()) {

      this.presentLoading();

      this.labelsService.update(this.id, { name: this.labelName }).then(async () => {
        // Editar las referencias

        // Enfermedades
        for await (const id of this.relatedDiseases) {
          // Coger las enferemdades y modificar las implicadas
          this.diseasesService.getDiseaseData(id).then((diseaseData) => {
            const auxElements = diseaseData.data().relatedLabels;

            const indexElement = diseaseData.data().relatedLabels.findIndex(element =>
              element.id === this.id
            );

            console.log(indexElement);

            // Meter el elemento actualizado en elements
            auxElements[indexElement].name = this.labelName;

            // Actualizar la prueba
            this.diseasesService.updateDisease(id, {
              relatedLabels: auxElements
            })
          }).catch(error => {
            console.log(error);
          })
        }

        // Pruebas de imagen

        for await (const id of this.relatedImageTests) {
          // Coger los elementos de la prueba y modificar el implicado
          this.imageTestsService.getImageTestData(id).then((imageTestData) => {
            const auxElements = imageTestData.data().relatedLabels;

            const indexElement = imageTestData.data().relatedLabels.findIndex(element =>
              element.id === this.id
            );

            console.log(indexElement);

            // Meter el elemento actualizado en elements
            auxElements[indexElement].name = this.labelName;

            // Actualizar la prueba
            this.imageTestsService.updateImageTest(id, {
              relatedLabels: auxElements
            })
          }).catch(error => {
            console.log(error);
          })
        }

        // Pruebas analíticas

        this.loadingController.dismiss();
        await this.toastService.show("success", "Etiqueta editada con éxito");
        this.router.navigate(["/database/labels"]);
      }).catch(error => {
        this.loadingController.dismiss();
        this.toastService.show("danger", "Error al editar la etiqueta: " + error);
        console.log(error);
      });
    } else {
      this.toastService.show("danger", "El nombre no es válido o ya existe");
    }
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      message: 'Actualizando...',
    });
    await loading.present();
  }

  async delete(): Promise<any> {
    const alert = await this.alertController.create({
      header: "¿Estás seguro?",
      message:
        "Pulse aceptar para eliminar. Se eliminará de todas las entidades que tenga relacionadas",
      buttons: [
        {
          text: "Cancelar",
          role: "cancel",
          cssClass: "secondary",
          handler: (blah) => { },
        },
        {
          text: "Aceptar",
          handler: async () => {
            // Eliminar las referencias
            // Enfermedades
            for await (const relatedDisease of this.relatedDiseases) {
              this.diseasesService.getDiseaseData(relatedDisease).then(data => {
                const elements = data.data().relatedLabels;
                const indexForDelete = elements.findIndex(element => element.id === relatedDisease);
                elements.splice(indexForDelete, 1);
                this.diseasesService.updateDisease(relatedDisease, {
                  relatedLabels: elements
                })
              })
            }

            // Pruebas de imagen
            for await (const relatedTest of this.relatedImageTests) {
              this.imageTestsService.getImageTestData(relatedTest).then(data => {
                const elements = data.data().relatedLabels;
                const indexForDelete = elements.findIndex(element => element.id === relatedTest);
                elements.splice(indexForDelete, 1);
                this.imageTestsService.updateImageTest(relatedTest, {
                  relatedLabels: elements
                })
              })
            }

            // Pruebas analíticas

            // Eliminar la entidad
            this.labelsService.delete(this.id).then(async () => {
              await this.toastService.show("success", "Etiqueta eliminada con éxito");
              this.router.navigate(["/database/labels"])
            }).catch((error) => {
              this.toastService.show("danger", "Error al eliminar la etiqueta: " + error)
            });
          },
        },
      ],
    });
    await alert.present();
  }

  ngOnDestroy(): void {
    if (this.labelsSub) { this.labelsSub.unsubscribe(); }
  }

}
