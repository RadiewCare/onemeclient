import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { CategoriesService } from 'src/app/services/categories.service';
import { DiseasesService } from 'src/app/services/diseases.service';
import { ImageTestsService } from 'src/app/services/image-tests.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.page.html',
  styleUrls: ['./edit.page.scss'],
})
export class EditPage implements OnInit, OnDestroy {

  id: string;

  category: any;
  categoryName: string = "";
  categoryNameInDatabase: string;
  categories = [];
  categoryIndex: number;

  categoriesSub: Subscription;

  relatedDiseases: any;
  relatedImageTests: any;
  relatedClinicTests: any;

  constructor(
    private categoriesService: CategoriesService,
    private toastService: ToastService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private alertController: AlertController,
    private diseasesService: DiseasesService,
    private imageTestsService: ImageTestsService) {
    this.id = this.activatedRoute.snapshot.params.id;
  }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.getCategory();
    this.getCategories();
  }

  getCategory() {
    this.categoriesService.getData(this.id).then(data => {
      this.category = data.data();
      this.categoryName = this.category.name
      this.categoryNameInDatabase = this.category.name;
      this.relatedDiseases = this.category.relatedDiseases || [];
      this.relatedImageTests = this.category.relatedImageTests || [];
      this.relatedClinicTests = this.category.relatedClinicTests || [];
    })
  }

  async getCategories() {
    this.categoriesSub = this.categoriesService.getAll().subscribe(data => {
      this.categories = data;
    })
  }

  isValid() {
    const categoriesNames = this.categories.map(element => element = element.name.toLowerCase());

    if (
      this.categoryName.trim().length === 0
    ) {
      return false
    } else {
      if (this.categoryName.trim().toLowerCase() === this.categoryNameInDatabase.trim().toLowerCase()) {
        return true;
      } else {
        if (categoriesNames.includes(this.categoryName.trim().toLowerCase())) {
          return false;
        } else return true;
      }
    };
  }

  save() {
    if (this.isValid()) {
      this.categoriesService.update(this.id, { name: this.categoryName }).then(async () => {
        // Editar las referencias
        // Enfermedades
        for await (const id of this.relatedDiseases) {
          // Coger las enferemdades y modificar las implicadas
          this.diseasesService.getDiseaseData(id).then((diseaseData) => {
            const auxElements = diseaseData.data().relatedCategories;

            const indexElement = diseaseData.data().relatedCategories.findIndex(element =>
              element.id === this.id
            );

            console.log(indexElement);

            // Meter el elemento actualizado en elements
            auxElements[indexElement].name = this.categoryName;

            // Actualizar la prueba
            this.diseasesService.updateDisease(id, {
              relatedCategories: auxElements
            })
          }).catch(error => {
            console.log(error);
          })
        }

        // Pruebas de imagen

        for await (const id of this.relatedImageTests) {
          // Coger los elementos de la prueba y modificar el implicado
          this.imageTestsService.getImageTestData(id).then((imageTestData) => {
            const auxElements = imageTestData.data().relatedCategories;

            const indexElement = imageTestData.data().relatedCategories.findIndex(element =>
              element.id === this.id
            );

            console.log(indexElement);

            // Meter el elemento actualizado en elements
            auxElements[indexElement].name = this.categoryName;

            // Actualizar la prueba
            this.imageTestsService.updateImageTest(id, {
              relatedCategories: auxElements
            })
          }).catch(error => {
            console.log(error);
          })
        }
        // Pruebas de imagen
        // Pruebas analíticas

        await this.toastService.show("success", "Categoría editada con éxito");
        this.router.navigate(["/database/categories"]);
      }).catch(error => {
        this.toastService.show("danger", "Error al editar la categoría: " + error);
      });
    } else {
      this.toastService.show("danger", "El nombre no es válido o ya existe");
    }
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
                const elements = data.data().relatedCategories;
                const indexForDelete = elements.findIndex(element => element.id === relatedDisease);
                elements.splice(indexForDelete, 1);
                this.diseasesService.updateDisease(relatedDisease, {
                  relatedCategories: elements
                })
              })
            }

            // Pruebas de imagen
            for await (const relatedTest of this.relatedImageTests) {
              this.imageTestsService.getImageTestData(relatedTest).then(data => {
                const elements = data.data().relatedCategories;
                const indexForDelete = elements.findIndex(element => element.id === relatedTest);
                elements.splice(indexForDelete, 1);
                this.imageTestsService.updateImageTest(relatedTest, {
                  relatedCategories: elements
                })
              })
            }
            // Pruebas analíticas

            // Eliminar la entidad
            this.categoriesService.delete(this.id).then(async () => {
              await this.toastService.show("success", "Categoría eliminada con éxito");
              this.router.navigate(["/database/categories"])
            }).catch((error) => {
              this.toastService.show("danger", "Error al eliminar la categoría: " + error)
            });
          },
        },
      ],
    });
    await alert.present();
  }

  ngOnDestroy(): void {
    if (this.categoriesSub) { this.categoriesSub.unsubscribe(); }
  }

}
