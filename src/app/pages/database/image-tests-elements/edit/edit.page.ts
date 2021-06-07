import { Component, OnInit, OnDestroy } from "@angular/core";
import { ImageTestsService } from "src/app/services/image-tests.service";
import { AlertController, LoadingController } from "@ionic/angular";
import { ToastService } from "src/app/services/toast.service";
import { ImageTestsElementsService } from "src/app/services/image-tests-elements.service";
import * as moment from "moment";
import { Subscription } from "rxjs";
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFireStorage } from '@angular/fire/storage';
import { DiseasesService } from 'src/app/services/diseases.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.page.html',
  styleUrls: ['./edit.page.scss'],
})
export class EditPage implements OnInit, OnDestroy {

  id: string;
  action: string;

  previousName: string;

  name: string;
  type: string;
  options: string[] = [];
  currentOption: string;
  min: number;
  max: number;
  trueInput: string;
  falseInput: string;
  defaultInput = false;
  unit: string;
  positiveOptions = [];
  defaultOption: string;
  currentPositiveOption: string;

  imageTest: any;

  relatedTests: any;
  relatedTestsData = [];

  diseases = [];

  relatedDiseases: any;
  relatedDiseasesData = [];

  isIllustrated = false;

  temporaryImages: any;
  images: any;

  imageSubscription: Subscription;

  files: any;
  namesOfNewImages: string[];

  imageTestsElements: any;
  imageTests: any;

  constructor(
    private imageTestsService: ImageTestsService,
    private imageTestsElementsService: ImageTestsElementsService,
    private toastService: ToastService,
    private diseasesService: DiseasesService,
    private activatedRoute: ActivatedRoute,
    private loadingController: LoadingController,
    private storage: AngularFireStorage,
    private alertController: AlertController,
    private router: Router
  ) {
    this.id = this.activatedRoute.snapshot.paramMap.get("id");
  }

  ngOnInit() {
    this.loadElement();
  }

  loadElement() {
    this.imageTestsElementsService
      .getImageTestElementData(this.id)
      .then((datos) => {
        // Carga de propiedades
        this.imageTest = datos.data();
        console.log(this.imageTest, "imageTest");

        this.name = this.imageTest.name;
        this.type = this.imageTest.type;
        this.unit = this.imageTest.unit;
        this.options = this.imageTest.options;
        this.positiveOptions = this.imageTest.positiveOptions;
        this.defaultOption = this.imageTest.defaultOption || null;
        this.min = this.imageTest.min;
        this.max = this.imageTest.max;
        this.trueInput = this.imageTest.trueInput;
        this.falseInput = this.imageTest.falseInput;
        this.defaultInput = this.imageTest.defaultInput;
        this.isIllustrated = this.imageTest.isIllustrated || false;

        // Carga de imágenes
        if (this.imageTest.images) {
          this.images = [...this.imageTest.images];
        } else {
          this.images = new Array(this.imageTest.options.length);
          this.images.fill(null);
        }

        this.files = new Array(this.images.length);
        this.files.fill(null);

        // Relaciones
        this.relatedTests = this.imageTest.relatedTests || [];
        this.relatedDiseases = this.imageTest.relatedDiseases || [];

        this.loadRelatedTests();
        this.loadRelatedDiseases();
      });
  }

  async loadRelatedTests() {
    const imageTests = await this.imageTestsService.getImageTestsData();
    this.imageTests = imageTests.map(element => element.data());

    this.relatedTests.forEach(element => {
      const testToInclude = this.imageTests.find(test => test.id === element)

      const relatedTestsDataIds = this.relatedTestsData.map(element => element = element.id);
      if (!relatedTestsDataIds.includes(testToInclude.id)) {
        this.relatedTestsData.push(testToInclude);
      }
    });
  }

  async loadRelatedDiseases() {
    const enfermedades = await this.diseasesService.getDiseasesData();
    this.diseases = enfermedades.docs.map(element => element.data());

    this.relatedDiseases.forEach(element => {
      const diseaseToInclude = this.diseases.find(disease => disease.id === element)

      const relatedDiseasesIds = this.relatedDiseasesData.map(element => element = element.id);
      console.log(relatedDiseasesIds);

      if (!relatedDiseasesIds.includes(diseaseToInclude.id)) {
        console.log("entro");

        this.relatedDiseasesData.push(diseaseToInclude);
      }
    });
  }

  addOption(value: string) {
    if (value && value.length > 0) {
      this.options.push(value.toLowerCase());
      this.images.push(null);
      this.currentOption = "";
    } else {
      this.toastService.show(
        "danger",
        "El campo de la opción no puede ser vacío"
      );
    }
  }

  removeOption(option: string) {
    this.options.splice(this.options.indexOf(option), 1);
    this.images.splice(this.options.indexOf(option), 1);
  }

  addPositiveOptions(values: any) {
    this.positiveOptions = values;
  }

  loadImage(files: any, index: any) {
    const file = files[0];
    this.files[index] = file;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.images[index] = reader.result;
    };
    reader.onerror = error => {
      console.log("Error: ", error);
    };
  }

  isValid() {
    if (
      this.name !== undefined &&
      this.type !== undefined &&
      this.name.length > 0 &&
      this.type.length > 0
    ) {
      switch (this.type) {
        case "binary":
          if (
            this.falseInput !== undefined &&
            this.trueInput !== undefined &&
            this.falseInput.length > 0 &&
            this.trueInput.length > 0
          ) {
            return true;
          }
          break;

        case "multiple":
          if (this.options.length > 0) {
            return true;
          }
          break;

        case "interval":
          if (this.min !== undefined && this.max !== undefined) {
            return true;
          }
          break;

        case "unit":
          if (this.unit !== undefined) {
            return true;
          }
          break;

        default:
          return true;
      }
    }
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      message: 'Actualizando...',
    });
    await loading.present();
  }

  save() {
    if (this.isValid()) {
      // Editar elemento
      this.presentLoading();

      this.saveImages().then(() => {

        const data = {
          name: this.name,
          type: this.type,
          options: this.options || null,
          images: this.images || null,
          min: this.min || null,
          max: this.max || null,
          trueInput: this.trueInput || null,
          falseInput: this.falseInput || null,
          defaultInput: this.defaultInput || null,
          defaultOption: this.defaultOption || null,
          unit: this.unit || null,
          positiveOptions: this.positiveOptions || [],
          relatedTests: this.relatedTests,
          relatedDiseases: this.relatedDiseases,
          isIllustrated: this.isIllustrated
        };

        console.log(data);



        this.imageTestsElementsService
          .updateImageTestElement(this.id, {
            ...data,
            updatedAt: moment().format()
          })
          .then(async () => {


            // TODO: ACTUALIZAR EL NOMBRE DEL ELEMENTO EN LAS PRUEBAS
            console.log(this.id);

            for await (const id of data.relatedTests) {
              // Coger los elementos de la prueba y modificar el implicado
              this.imageTestsService.getImageTestData(id).then((imageTestData) => {
                const auxElements = imageTestData.data().elements;

                const indexElement = imageTestData.data().elements.findIndex(element =>
                  element.id === this.id
                );

                console.log(indexElement);

                // Meter el elemento actualizado en elements
                auxElements[indexElement].name = data.name;

                // Actualizar la prueba
                this.imageTestsService.updateImageTest(id, {
                  elements: auxElements
                })
              }).catch(error => {
                console.log(error);

              })
            }

            // ACTUALIZAR EL ELEMENTO EN LAS ENFERMEDADES

            for await (const id of data.relatedDiseases) {
              this.diseasesService.getDiseaseData(id).then((disease) => {
                const auxElements = disease.data().imageBiomarkers;

                const indexElement = disease.data().imageBiomarkers.findIndex(element =>
                  element.id === this.id
                );

                console.log(indexElement);

                // Meter el elemento actualizado en elements
                auxElements[indexElement].name = data.name;
                auxElements[indexElement].options = data.options;

                console.log("resultado", auxElements);

                // Actualizar la prueba
                this.diseasesService.updateDisease(id, {
                  imageBiomarkers: auxElements
                });
              })
            }


            this.toastService.show(
              "success",
              "Elemento de prueba de imagen editado"
            );

            this.loadingController.dismiss();
          })
          .catch((error) => {
            this.toastService.show(
              "danger",
              "Error al editar elemento de prueba de imagen " + error
            );
            this.namesOfNewImages.forEach(element => {
              const deleted = this.storage.ref(`/biomarkers/${element}`).delete();
            });
            this.loadingController.dismiss();
          })
      }).catch(() => {
        this.toastService.show("danger", "Error al guardar las imágenes");
        this.loadingController.dismiss();
      })

    } else {
      this.toastService.show("danger", "Todos los campos son obligatorios");
    }

  }

  async saveImages(): Promise<any> {
    const promises = [];
    for (let index = 0; index < this.files.length; index++) {
      promises.push(new Promise<void>(async resolve => {
        if (this.files[index]) {
          console.log(this.files[index]);
          console.log(this.files[index].name);
          const code = this.imageTestsElementsService.createImageCode();
          console.log(code);
          console.log(`/biomarkers/${code}${this.files[index].name}`);


          await this.storage
            .upload(
              `/biomarkers/${code}${this.files[index].name}`,
              this.files[index]
            )
            .then(async () => {
              // Se guarda la url de la imagen en la actividad
              this.imageSubscription = this.storage
                .ref(`/biomarkers/${code}${this.files[index].name}`)
                .getDownloadURL()
                .subscribe(data => {
                  this.images[index] = data;
                  // this.namesOfNewImages.push(data);
                  console.log(this.images[index]);
                  resolve();
                });
            }).catch(error => {
              this.toastService.show("danger", `Error al subir la imagen: ${error}`);
            })
        } else {
          resolve();
        }
      }))
    }
    return Promise.all(promises);
  }

  showImage(url: any) {
    window.open(url);
  }

  deleteImage(index: any) {
    this.images[index] = null;
    this.files[index] = null;
  }

  async delete(): Promise<any> {
    const alert = await this.alertController.create({
      header: "¿Estás seguro?",
      message:
        "Pulse aceptar para eliminar el elemento de prueba de imagen. Se eliminará también de todas las pruebas de imagen relacionadas y enfermedades.",
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
            // Eliminar las referencias de los relatedTests
            for await (const relatedTest of this.relatedTests) {
              this.imageTestsService.getImageTestData(relatedTest).then(data => {
                const elements = data.data().elements;
                const indexForDelete = elements.findIndex(element => element.id === this.id);
                elements.splice(indexForDelete, 1);
                this.imageTestsService.updateImageTest(relatedTest, {
                  elements: elements
                })
              })
            }

            // Eliminar las referencias de los relatedDiseases
            for await (const relatedDisease of this.relatedDiseases) {
              this.diseasesService.getDiseaseData(relatedDisease).then(data => {
                const biomarkers = data.data().imageBiomarkers;
                const indexForDelete = biomarkers.findIndex(biomarker => biomarker.id === this.id);
                biomarkers.splice(indexForDelete, 1);
                this.diseasesService.updateDisease(relatedDisease, {
                  imageBiomarkers: biomarkers
                })
              })
            }

            this.imageTestsElementsService.deleteImageTestElement(this.id).then(() => {
              this.router.navigate(["/database/image-tests-elements"]).then(() => {
                this.toastService.show("success", "Elemento de prueba de imagen eliminado con éxito")
              });
            }).catch(() => {
              this.toastService.show("danger", "Error al eliminar el elemento de prueba de imagen")
            });

          },
        },
      ],
    });
    await alert.present();
  }

  cleanDefaultOption() {
    this.defaultOption = null;
  }

  ngOnDestroy(): void {
    if (this.imageSubscription) {
      this.imageSubscription.unsubscribe();
    }
  }

}
