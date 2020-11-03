import { Component, OnInit, Input } from "@angular/core";
import { LoadingController, ModalController } from "@ionic/angular";
import { ToastService } from "src/app/services/toast.service";
import { LanguageService } from "src/app/services/language.service";
import { SubjectsService } from "src/app/services/subjects.service";
import { ImageTestsService } from "src/app/services/image-tests.service";

@Component({
  selector: "app-add-image",
  templateUrl: "./add-image.page.html",
  styleUrls: ["./add-image.page.scss"]
})
export class AddImagePage implements OnInit {
  @Input() id: string;
  @Input() field: number;
  @Input() value: any;
  @Input() indexTest: any;

  test: any;
  tests: any;
  currentSection: string;
  currentX: number;
  currentY: number;
  currentZ: number;
  preview: any;

  images = [];

  biomarkers = [];

  subject: any;

  constructor(
    private modalController: ModalController,
    private toastService: ToastService,
    private subjectsService: SubjectsService,
    private imageTestsService: ImageTestsService,
    public lang: LanguageService,
    private loadingController: LoadingController
  ) { }

  ngOnInit() {
    this.loadLocation()
  }

  loadLocation() {
    this.subjectsService
      .getSubjectData(this.id).then(data => {
        this.subject = data.data();
        console.log(this.subject);

      })
  }

  loadImage(files: any) {
    const file = files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.preview = reader.result;
      console.log(reader.result);
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
        default:
          break;
      }
    }

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

  save() {
    /*
    console.log(this.id);

    if (this.isValid()) {
      this.subjectsService
        .getSubjectData(this.id)
        .then(data => {
          const newImageTests = data.data().imageTests;

          const image = {
            url: this.preview,
            section: this.currentSection,
            coordinates: [this.currentX, this.currentY, this.currentZ],
            test: this.test
          };

          if (newImageTests[this.field].images) {
            newImageTests[this.field].images.push(image);
            console.log(newImageTests);
          } else {
            newImageTests[this.field].images = [];
            newImageTests[this.field].images.push(image);
            console.log(newImageTests);
          }
          this.subjectsService
            .updateSubject(this.id, {
              imageTests: newImageTests
            })
            .then(() => {
              this.dismissModal();
              this.toastService.show("success", "Imagen añadida con éxito");
            })
            .catch(() => {
              this.toastService.show("danger", "Error al añadir imagen");
            });
          // Aquí se debería de añadir la imagen en el biomarcador general
        })
        .catch(error => console.log(error));
    } else {
      this.toastService.show(
        "danger",
        "Error: Hay campos erróneos o incompletos"
      );
    }
    */

    if (this.isValid) {
      this.presentLoading();
      this.subjectsService
        .getSubjectData(this.id)
        .then(data => {
          const newImageTests = data.data().imageTests;
          console.log(newImageTests);
          newImageTests[this.indexTest].values[this.field].locations = this.biomarkers;
          console.log(newImageTests);

          this.subjectsService.updateSubject(this.id, {
            imageTests: newImageTests
          }).then(async () => {
            await this.toastService.show("success", "Coordenadas añadidas con éxito");
            this.loadingController.dismiss();
            this.modalController.dismiss();
          }).catch(async () => {
            await this.toastService.show("danger", "Error al añadir las coordenadas");
            this.loadingController.dismiss();
            this.modalController.dismiss();
          })
        })
    }


  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      message: 'Guardando...',
    });
    await loading.present();
  }
}
