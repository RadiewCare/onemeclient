import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { ImageTestsService } from "src/app/services/image-tests.service";
import { AlertController, LoadingController, ModalController } from "@ionic/angular";
import { ToastService } from "src/app/services/toast.service";
import { ImageTestsElementsService } from "src/app/services/image-tests-elements.service";
import * as firebase from "firebase/app";
import * as moment from "moment";
import { Subscription } from "rxjs";
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFireStorage } from '@angular/fire/storage';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.page.html',
  styleUrls: ['./edit.page.scss'],
})
export class EditPage implements OnInit, OnDestroy {

  id: string;
  action: string;
  //index: number;

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
  currentPositiveOption: string;

  imageTest: any;
  imageTestSub: Subscription;

  relatedTests: any;
  relatedTestsData = [];

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

  constructor(
    private imageTestsService: ImageTestsService,
    private imageTestsElementsService: ImageTestsElementsService,
    private modalController: ModalController,
    private toastService: ToastService,
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
    this.imageTestSub = this.imageTestsElementsService
      .getImageTestElement(this.id)
      .subscribe((data) => {
        this.imageTest = data;
        console.log(this.imageTest);

        this.name = data.name;
        this.type = data.type;

        this.options = data.options;

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

        console.log(this.images);
        console.log(this.temporaryImages);
        console.log(this.files);

        this.min = data.min;
        this.max = data.max;
        this.trueInput = data.trueInput;
        this.falseInput = data.falseInput;
        this.defaultInput = data.defaultInput;
        this.unit = data.unit;
        this.positiveOptions = data.positiveOptions;

        this.areIllustrated = data.isIllustrated;

        this.relatedTests = data.relatedTests;
        this.loadRelatedTests();
      });
  }

  async loadRelatedTests() {
    let result;
    this.relatedTests.forEach(async element => {
      console.log(element);
      result = await this.imageTestsService.getImageTestData(element);
      this.relatedTestsData.push(result.data());
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
      console.log(this.images);
      console.log(this.temporaryImages);
      console.log(this.files);
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
        console.log(this.temporaryImages);

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
          unit: this.unit || null,
          positiveOptions: this.positiveOptions || [],
          relatedTests: this.relatedTests,
          isIllustrated: this.areIllustrated
        };

        console.log(data);


        this.imageTestsElementsService
          .updateImageTestElement(this.id, {
            ...data,
            updatedAt: moment().format()
          })
          .then(() => {
            this.toastService.show(
              "success",
              "Elemento de prueba de imagen editado"
            );
            this.loadingController.dismiss();
          })
          .catch(() => {
            this.toastService.show(
              "danger",
              "Error al editar elemento de prueba de imagen"
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



    /*if (this.isValid()) {
      const data = {
        name: this.name,
        type: this.type,
        options: this.options || null,
        min: this.min || null,
        max: this.max || null,
        trueInput: this.trueInput || null,
        falseInput: this.falseInput || null,
        defaultInput: this.defaultInput || null,
        unit: this.unit || null,
        positiveOptions: this.positiveOptions || []
      };
      if (this.action === "create") {
        // Crear elemento
        this.imageTestsService
          .updateImageTest(this.id, {
            fields: firebase.firestore.FieldValue.arrayUnion(data),
            updatedAt: moment().format()
          })
          .then(() => {
            this.dismissModal().then(() => {
              this.toastService.show(
                "success",
                "Elemento de prueba de imagen añadido"
              );
            });
          })
          .catch(() => {
            this.toastService.show(
              "danger",
              "Error al añadir elemento de prueba de imagen"
            );
          });
      } else {
        // Editar elemento
        const fieldsArray = this.imageTest.fields;
        fieldsArray[this.index] = data;
        this.imageTestsService
          .updateImageTest(this.id, {
            fields: fieldsArray,
            updatedAt: moment().format()
          })
          .then(() => {
            this.dismissModal().then(() => {
              this.toastService.show(
                "success",
                "Elemento de prueba de imagen editado"
              );
            });
          })
          .catch(() => {
            this.toastService.show(
              "danger",
              "Error al editar elemento de prueba de imagen"
            );
          });
      }
    } else {
      this.toastService.show("danger", "Todos los campos son obligatorios");
    }
    */
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
                  console.log(data);
                  this.temporaryImages[index] = data;
                  console.log(this.temporaryImages, "imagen salvada");
                  resolve();
                });
            })
        } else {
          resolve();
        }
      }))
    }
    return Promise.all(promises);
  }

  arrayEquals(a, b) {
    return Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((val, index) => val === b[index]);
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
        "Pulse aceptar para eliminar el elemento de prueba de imagen. Se eliminará también de todas las pruebas de imagen relacionadas.",
      buttons: [
        {
          text: "Cancelar",
          role: "cancel",
          cssClass: "secondary",
          handler: (blah) => { },
        },
        {
          text: "Aceptar",
          handler: () => {
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
    if (this.imageTestSub) {
      this.imageTestSub.unsubscribe();
    }
    if (this.imageSubscription) {
      this.imageSubscription.unsubscribe();
    }
  }

}
