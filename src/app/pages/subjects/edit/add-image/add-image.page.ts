import { Component, OnInit, Input } from "@angular/core";
import { ModalController } from "@ionic/angular";
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

  test: any;
  tests: any;
  currentSection: string;
  currentX: number;
  currentY: number;
  currentZ: number;
  preview: any;
  constructor(
    private modalController: ModalController,
    private toastService: ToastService,
    private subjectsService: SubjectsService,
    private imageTestsService: ImageTestsService,
    public lang: LanguageService
  ) {}

  ngOnInit() {
    console.log(this.id);
    console.log(this.field);
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

  dismissModal() {
    this.modalController.dismiss();
  }

  isValid() {
    if (
      this.preview === undefined ||
      this.currentSection === undefined ||
      this.currentX === undefined ||
      this.currentY === undefined ||
      this.currentZ === undefined ||
      this.test === undefined ||
      this.test === null
    ) {
      return false;
    } else {
      return true;
    }
  }

  save() {
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
  }
}
