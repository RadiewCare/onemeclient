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
  //index: number;

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

  areIllustrated = false;

  temporaryImages: any;
  images: any;

  imageSubscription: Subscription;

  files: any;

  imageCode = [
    "A",
    "9",
    "B",
    "C",
    "8",
    "D",
    "F",
    "G",
    "H",
    "J",
    "1",
    "K",
    "L",
    "M",
    "N",
    "Ñ",
    "2",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "V",
    "3",
    "W",
    "X",
    "Y",
    "Z",
    "a",
    "b",
    "4",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "ñ",
    "o",
    "5",
    "p",
    "q",
    "6",
    "r",
    "s",
    "t",
    "7",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z"
  ];

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

  async updateRelatedDiseases() {
    this.imageTestsElements = (await this.imageTestsElementsService.getImageTestElementsData()).docs
      .map(element => element = element.data());

    let contador = 0;
    for await (const imageTestElement of this.imageTestsElements) {
      const filtered2 = this.diseases.filter(disease => {
        if (disease.imageBiomarkers) {
          return disease.imageBiomarkers.find(biomarker => biomarker.id === imageTestElement.id)
        }
      });

      const relatedDiseases = filtered2.map(element => element = element.id)
      await this.imageTestsElementsService.updateImageTestElement(imageTestElement.id, { relatedDiseases: relatedDiseases })
      console.log(relatedDiseases, imageTestElement.name, contador);
      contador = contador + 1;
    }
  }

  async fusionRepeated() {
    // COGER LOS ELEMENTOS REPETIDOS QUE SON SEAN ÉL MISMO
    const repeatedImageTestsElements = (await this.imageTestsElementsService.getImageTestElementsData()).docs.map(element => element = element.data()).filter(element => (element.name.trim().toLowerCase() === this.name.trim().toLowerCase()) && (element.id !== this.id));
    console.log(repeatedImageTestsElements, "REPETIDOS");
    // BORRAR LA RELACIÓN EXISTENTE DE LAS ENFERMEDADES Y PRUEBAS IMPLICADAS CON LOS ELEMENTOS QUE ESTABAN REPETIDOS (¿YA SE HACE AL ELIMINAR?)

    repeatedImageTestsElements.forEach(imageTestElement => {
      // ENFERMEDADES
      const relatedDiseasesData = [];
      console.log(imageTestElement, "el eelemento de prueba que va a quedar obsoleto y eliminarse");

      imageTestElement.relatedDiseases.forEach(async element => {
        const diseaseToInclude = this.diseases.find(disease => disease.id === element)
        console.log(diseaseToInclude, "enfermedad relacionada que experimenta el cambio");

        if (!this.relatedDiseases.includes(diseaseToInclude.id)) {
          relatedDiseasesData.push(diseaseToInclude);
          this.relatedDiseases.push(diseaseToInclude.id);

          console.log(diseaseToInclude.imageBiomarkers, "antes de eliminarse el repetido");
          console.log(diseaseToInclude.imageBiomarkers.filter(element => element.id !== imageTestElement.id), "después de eliminarse el repetido");

          // Quito de la enfermedad el que va a eliminarse y pongo el que hay cargado
          const index = diseaseToInclude.imageBiomarkers.findIndex(element => element.id == imageTestElement.id);
          diseaseToInclude.imageBiomarkers[index] = { id: this.id, name: this.name, options: this.options, order: 0, values: [] };

          console.log(diseaseToInclude.imageBiomarkers, "resultado final incluyendo el nuevo");


          this.diseasesService.updateDisease(diseaseToInclude.id, diseaseToInclude)
            .then(() => {
              console.log("exito en enfermedad", diseaseToInclude.name);
            })
            .catch(error => console.error(error, diseaseToInclude.name)
            );

        }
      });

      console.log(relatedDiseasesData, imageTestElement.name, "relatedDiseasesData");

      // TESTS
      const relatedTestsData = [];
      imageTestElement.relatedTests.forEach(async element => {
        const testToInclude = this.imageTests.find(test => test.id === element)
        console.log(testToInclude, "test relacionado que experimenta el cambio");

        if (!this.relatedTests.includes(testToInclude.id)) {
          relatedTestsData.push(testToInclude);
          this.relatedTests.push(testToInclude.id);

          console.log(testToInclude.elements, "antes de eliminarse el repetido");
          console.log(testToInclude.elements.filter(element => element.id !== imageTestElement.id), "después de eliminarse el repetido");

          // Quito del test el que va a eliminarse y pongo el que hay cargado
          const index = testToInclude.elements.findIndex(element => element.id == imageTestElement.id);
          testToInclude.elements[index] = { id: this.id, name: this.name, order: testToInclude.elements.length + 1 }

          console.log(testToInclude.elements, "resultado final incluyendo el nuevo");

          this.imageTestsService.updateImageTest(testToInclude.id, { elements: testToInclude.elements })
            .then(() => {
              console.log("exito en test", testToInclude.name);
            })
            .catch(error => console.error(error, testToInclude.name)
            );
        }

      });

      console.log(relatedTestsData, imageTestElement.name, "relatedTestsData");

      this.options = [...this.options, ...imageTestElement.options];
      this.positiveOptions = [...this.positiveOptions, ...imageTestElement.positiveOptions];

      // HACERLOS ÚNICOS
      this.options = this.options.filter((value, index, self) => {
        return self.indexOf(value) === index;
      });

      this.positiveOptions = this.positiveOptions.filter((value, index, self) => {
        return self.indexOf(value) === index;
      });
    });

    // LO QUE TENGO QUE HACER AHORA ES QUE SE VEAN LAS PRUEBAS DE LOS DUPLICADOS POR CONSOLA
    // enfermedades

    // tests
    console.log(this.relatedTests);
    console.log(this.relatedDiseases);

    await this.loadRelatedTests();
    await this.loadRelatedDiseases();

    console.log(this.relatedTestsData);
    console.log(this.relatedDiseasesData);


    // RELACIONAR LAS ENFERMEDADES Y PRUEBAS DE IMAGEN DE LOS REPETIDOS CON EL ELEMENTO PRINCIPAL EN LA MISMA POSICIÓN DONDE ESTABA EL OTRO
    // ENFERMEDADES
    // PRUEBAS

    // ELIMINAR LOS IMAGE TESTELEMENTS REPETIDOS QUE NO APORTAN YA NADA
  }

  loadElement() {
    this.imageTestsElementsService
      .getImageTestElementData(this.id)
      .then((datos) => {
        const data = datos.data();
        this.imageTest = data;
        console.log(this.imageTest);


        this.name = data.name;
        this.previousName = data.name;
        this.type = data.type;

        this.options = data.options;
        this.defaultOption = data.defaultOption || null;

        if (data.images) {
          this.images = [...data.images];
          this.temporaryImages = [...data.images];
        } else {
          this.images = new Array(data.options.length);
          this.images.fill(null);
          this.temporaryImages = new Array(this.images.length);
          this.temporaryImages.fill(null);
        }

        this.files = new Array(this.images.length);
        this.files.fill(null);

        this.min = data.min;
        this.max = data.max;
        this.trueInput = data.trueInput;
        this.falseInput = data.falseInput;
        this.defaultInput = data.defaultInput;
        this.defaultOption = data.defaultOption;
        this.unit = data.unit;
        if (data.positiveOptions) {
          this.positiveOptions = data.positiveOptions;
        } else {
          this.positiveOptions = [];
        }

        this.areIllustrated = data.isIllustrated || false;

        this.relatedTests = data.relatedTests || [];
        this.relatedDiseases = data.relatedDiseases || [];
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
    /*let result;
    this.relatedDiseases.forEach(async element => {
      result = await this.diseasesService.getDiseaseData(element);
      this.relatedDiseasesData.push(result.data());
    });

    const enfermedades = await this.diseasesService.getDiseasesData();
    this.diseases = enfermedades.docs.map(element => element.data());

    const filtered2 = this.diseases.filter(disease => {
      if (disease.imageBiomarkers) {
        return disease.imageBiomarkers.find(biomarker => biomarker.id === this.id)
      }
    });

    this.relatedDiseasesData = filtered2.map(element => element = { id: element.id, name: element.name })
    this.relatedDiseases = this.relatedDiseasesData;
    console.log(this.relatedDiseasesData);
    */

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
    if (value.length > 0 && value !== undefined && value !== null) {
      this.options.push(value.toLowerCase());
      this.currentOption = "";
    } else {
      this.toastService.show(
        "danger",
        "El campo de la opción no puede ser vacío"
      );
    }
  }

  addPositiveOptions(values: any) {
    this.positiveOptions = values;
  }

  removeOption(option: string) {
    this.options.splice(this.options.indexOf(option), 1);
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

        case "text":
          return true;

        case "textarea":
          return true;

        case "number":
          return true;

        default:
          break;
      }
    } else {
      return false;
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
          images: this.temporaryImages || null,
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
          isIllustrated: this.areIllustrated
        };


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
      promises.push(new Promise(async resolve => {
        if (this.files[index] !== null) {
          const code = this.generateCode();
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
                  this.temporaryImages[index] = data;
                  resolve(null);
                });
            })
        } else {
          resolve(null);
        }
      }))
    }
    return Promise.all(promises);
  }

  generateCode() {
    let code = "";
    for (let index = 0; index < 8; index++) {
      const num = Math.floor(Math.random() * this.imageCode.length - 1 + 1);
      code += this.imageCode[num];
    }
    return code;
  }

  showImage(url: any) {
    window.open(url);
  }

  deleteImage(index: any) {
    this.images[index] = null;
    this.temporaryImages[index] = null;
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

  ngOnDestroy(): void {
    if (this.imageSubscription) {
      this.imageSubscription.unsubscribe();
    }
  }

}
