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
  @Input() field: number;
  @Input() index: number;

  images = [];
  tests: any;
  subject: any;

  constructor(
    private subjectsService: SubjectsService,
    private modalController: ModalController,
    public lang: LanguageService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.subjectsService.getSubjectData(this.id).then(data => {
      this.subject = data.data();

      const loadedOptions = this.subject.imageTests[this.index].values[this.field].options;
      const loadedImages = this.subject.imageTests[this.index].values[this.field].images;

      loadedImages.forEach(element => {
        let index = loadedImages.indexOf(element);
        if (element) {
          this.images.push({ image: element, index: loadedOptions[index] });
        }
      });

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
