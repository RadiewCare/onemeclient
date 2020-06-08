import { Component, OnInit, Input } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { ShowPage } from "./show/show.page";
import { LanguageService } from "src/app/services/language.service";
import { SubjectsService } from "src/app/services/subjects.service";
import { ToastService } from "src/app/services/toast.service";

@Component({
  selector: "app-gallery",
  templateUrl: "./gallery.page.html",
  styleUrls: ["./gallery.page.scss"]
})
export class GalleryPage implements OnInit {
  @Input() id: string;
  @Input() test: string;
  @Input() field: number;

  images = [];
  tests: any;
  subject: any;

  constructor(
    private subjectsService: SubjectsService,
    private modalController: ModalController,
    public lang: LanguageService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.subjectsService.getSubjectData(this.id).then(data => {
      this.subject = data.data();
      console.log(this.subject);
      if (data.data().imageTests) {
        data.data().imageTests.forEach(test => {
          if (test.images) {
            test.images.forEach(image => {
              if (image.test === this.test) {
                this.images.push(image);
              }
            });
          }
        });
      } else {
        this.images = [];
      }

      console.log(this.images);
    });
  }

  async openImage(image: any) {
    const modal = await this.modalController.create({
      component: ShowPage,
      componentProps: {
        image: image
      },
      cssClass: "my-custom-modal-css-full"
    });
    return await modal.present();
  }

  deleteImage(index: number) {
    this.images = this.subject.imageTests[
      this.field
    ].images = this.subject.imageTests[this.field].images.splice(index, 0);

    this.subjectsService
      .updateSubject(this.id, {
        imageTests: this.subject.imageTests
      })
      .then(() => {
        this.toastService.show("success", "Imagen eliminada con éxito");
      })
      .catch(error => {
        this.toastService.show("danger", "Error: " + error);
      });
  }

  dismissModal() {
    this.modalController.dismiss();
  }
}
