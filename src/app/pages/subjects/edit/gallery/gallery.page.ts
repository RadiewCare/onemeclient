import { Component, OnInit, Input } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { ShowPage } from "./show/show.page";
import { LanguageService } from "src/app/services/language.service";
import { SubjectsService } from "src/app/services/subjects.service";
import { ToastService } from "src/app/services/toast.service";
import { ImageTestsElementsService } from "src/app/services/image-tests-elements.service";

@Component({
  selector: "app-gallery",
  templateUrl: "./gallery.page.html",
  styleUrls: ["./gallery.page.scss"]
})
export class GalleryPage implements OnInit {
  @Input() id: string;

  images = [];

  constructor(
    private modalController: ModalController,
    private imageTestsElementsService: ImageTestsElementsService,
    public lang: LanguageService,
  ) { }

  ngOnInit() {
    console.log(this.id);

    this.imageTestsElementsService.getImageTestElementData(this.id).then(data => {

      const imageElement = data.data();

      console.log(imageElement);

      const loadedOptions = imageElement.options;
      const loadedImages = imageElement.images;

      if (loadedImages) {
        loadedImages.forEach(element => {
          let index = loadedImages.indexOf(element);
          if (element) {
            this.images.push({ image: element, index: loadedOptions[index] });
          }
        });
      }


      console.log(this.images);
    })
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

  dismissModal() {
    this.modalController.dismiss();
  }
}
