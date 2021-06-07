import { Component, OnInit, Input } from "@angular/core";
import { LoadingController, ModalController } from "@ionic/angular";
import { ToastService } from "src/app/services/toast.service";
import { LanguageService } from "src/app/services/language.service";
import { SubjectImageTestsService } from "src/app/services/subject-image-tests.service";
import { ImageTestsElementsService } from "src/app/services/image-tests-elements.service";
import { AngularFireStorage } from "@angular/fire/storage";
import { Subscription } from "rxjs";
import { ReproductionTestsService } from "src/app/services/reproduction-tests.service";

@Component({
  selector: "app-add-image",
  templateUrl: "./add-image.page.html",
  styleUrls: ["./add-image.page.scss"]
})
export class AddImagePage implements OnInit {
  @Input() subjectImageTestId: string;
  @Input() biomarkerId: string;
  @Input() field: number;
  @Input() origin: string;

  imageTestElement: any;
  subjectImageTest: any;

  biomarker: any;
  indexOfBiomarker: any;

  id: string;
  indexTest: number;
  test: any;
  tests: any;
  currentSection: string;
  currentX: number;
  currentY: number;
  currentZ: number;
  preview: any;

  currentFiles: any;

  fileSubscription: Subscription;

  images = [];

  biomarkers = [];

  subject: any;

  constructor(
    private modalController: ModalController,
    private toastService: ToastService,
    public lang: LanguageService,
    private loadingController: LoadingController,
    private subjectImageTestsService: SubjectImageTestsService,
    private imageTestsElementsService: ImageTestsElementsService,
    private storage: AngularFireStorage,
    private reproductionTestsService: ReproductionTestsService
  ) { }

  ngOnInit() {
    if (this.origin == "reproduction") {
      this.getDataReproduction();
    } else {
      this.getData();
    }

  }

  getData() {
    this.subjectImageTestsService.getOneData(this.subjectImageTestId).then(data => {
      this.subjectImageTest = data;
      console.log(this.subjectImageTest, "subjectImageTest");
      this.imageTestsElementsService.getImageTestElementData(this.biomarkerId).then(data => {
        this.imageTestElement = data.data();
        console.log(this.imageTestElement);

        this.indexOfBiomarker = this.subjectImageTest.values.findIndex(element => element.id === this.biomarkerId);
        console.log(this.indexOfBiomarker, "index of biomarker");

        this.biomarker = this.subjectImageTest.values.filter(element => element.id === this.biomarkerId);
        console.log(this.biomarker);
        if (this.biomarker.length > 0) {
          this.biomarker = this.biomarker[0];
          this.biomarkers = this.subjectImageTest.values[this.indexOfBiomarker].locations || [];
          console.log(this.biomarkers);
        }
      })
    })
  }

  getDataReproduction() {
    this.reproductionTestsService.getOneData(this.subjectImageTestId).then(data => {
      this.subjectImageTest = data;
      console.log(this.subjectImageTest, "subjectImageTest");
      this.imageTestsElementsService.getImageTestElementData(this.biomarkerId).then(data => {
        this.imageTestElement = data.data();
        console.log(this.imageTestElement);

        this.indexOfBiomarker = this.subjectImageTest.values.findIndex(element => element.id === this.biomarkerId);
        console.log(this.indexOfBiomarker, "index of biomarker");

        this.biomarker = this.subjectImageTest.values.filter(element => element.id === this.biomarkerId);
        console.log(this.biomarker);
        if (this.biomarker.length > 0) {
          this.biomarker = this.biomarker[0];
          this.biomarkers = this.subjectImageTest.values[this.indexOfBiomarker].locations || [];
          console.log(this.biomarkers);
        }
      })
    })
  }

  loadImage(index: number, files: any) {
    const file = files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.biomarkers[index].image = reader.result;
      this.biomarkers[index].files = files;
    };
    reader.onerror = error => {
      console.log("Error: ", error);
    };
  }

  addImage() {
    console.log(this.preview);
  }

  /**
   * 
   * @param index 
   * @param type 
   * @param value 
   */
  addData(index: any, type: any, value: any) {
    if (this.biomarkers.length > 0 && this.biomarkers.length > index) {
      switch (type) {
        case "number":
          this.biomarkers[index].number = value;
          break;
        case "x":
          this.biomarkers[index].x = value;
          break;
        case "y":
          this.biomarkers[index].y = value;
          break;
        case "section":
          this.biomarkers[index].section = value;
          break;
        case "sequence":
          this.biomarkers[index].sequence = value;
          break;
        default:
          break;
      }
    } else {
      switch (type) {
        case "number":
          this.biomarkers.push({ number: value });
          break;
        case "x":
          this.biomarkers.push({ x: value });
          break;
        case "y":
          this.biomarkers.push({ y: value });
          break;
        case "section":
          this.biomarkers.push({ section: value });
          break;
        case "sequence":
          this.biomarkers[index].sequence = value;
          break;
        default:
          break;
      }
    }
    console.log(this.biomarkers, "location");
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  isValid() {
    if (
      this.images.length > 0
    ) {
      return true;
    } else {
      return false;
    }
  }

  saveImage(biomarker: any): Promise<void> {
    return new Promise(async (resolve) => {
      const code = this.createFileCode();
      this.storage
        .upload(
          `/subjectBiomarkerImages/${code}${biomarker.files[0].name}`,
          biomarker.files[0]
        )
        .then(async () => {
          // Se guarda la url de la imagen en la actividad
          this.fileSubscription = this.storage
            .ref(`/subjectBiomarkerImages/${code}${biomarker.files[0].name}`)
            .getDownloadURL()
            .subscribe(async data => {
              biomarker.url = data;
              biomarker.code = code;
              biomarker.fileName = biomarker.files[0].name;
              resolve();
            });
        }).catch(error => {
          this.toastService.show("danger", `Error al subir el archivo: ${error}`);
        })
    })
  }

  async save() {
    this.presentLoading();
    // Guardar las imágenes
    for await (const el of this.biomarkers) {
      if (el.image) {
        console.log("imagen nueva");
        // Borrar la anterior
        this.storage.ref(`/subjectBiomarkerImages/${el.code}${el.fileName}`).delete();
        // Subir la nueva
        await this.saveImage(el);
        delete el.image;
        delete el.files;
      }
    }

    // Guardar la información
    this.subjectImageTest.values[this.indexOfBiomarker].locations = this.biomarkers;

    if (this.origin == "reproduction") {
      this.reproductionTestsService.update(this.subjectImageTestId, { values: this.subjectImageTest.values })
        .then(async () => {
          this.loadingController.dismiss();
          await this.toastService.show("success", "Coordenadas añadidas con éxito");
          this.modalController.dismiss();
        }).catch(async () => {
          this.loadingController.dismiss();
          await this.toastService.show("danger", "Error al añadir las coordenadas");
          this.modalController.dismiss();
        })
    } else {
      this.subjectImageTestsService.update(this.subjectImageTestId, { values: this.subjectImageTest.values })
        .then(async () => {
          this.loadingController.dismiss();
          await this.toastService.show("success", "Coordenadas añadidas con éxito");
          this.modalController.dismiss();
        }).catch(async () => {
          this.loadingController.dismiss();
          await this.toastService.show("danger", "Error al añadir las coordenadas");
          this.modalController.dismiss();
        })
    }

  }

  createFileCode() {
    const dictionary = ["A", "9", "B", "C", "8", "D", "F", "G", "H", "J", "1", "K", "L", "M", "N", "Ñ", "2", "P", "Q", "R", "S", "T", "V", "3", "W", "X", "Y", "Z", "a", "b",
      "4", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "ñ", "o", "5", "p", "q", "6", "r", "s", "t", "7", "u", "v", "w", "x", "y", "z"
    ];
    let returnedCode = "";

    for (let index = 0; index < 8; index++) {
      returnedCode += dictionary[Math.floor(Math.random() * dictionary.length - 1 + 1)];
    }

    return returnedCode;
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      message: 'Guardando...',
    });
    await loading.present();
  }
}
