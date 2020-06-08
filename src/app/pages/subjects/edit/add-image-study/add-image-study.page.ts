import { Component, OnInit, OnDestroy, Input } from "@angular/core";
import { LanguageService } from "src/app/services/language.service";
import { ImageTestsService } from "src/app/services/image-tests.service";
import { Observable, Subscription } from "rxjs";
import { ModalController } from "@ionic/angular";
import { ToastService } from "src/app/services/toast.service";
import { ImageStudiesService } from "src/app/services/image-studies.service";
import { GalleryPage } from "../gallery/gallery.page";
import { AddImagePage } from "../add-image/add-image.page";
import { SubjectsService } from "src/app/services/subjects.service";

@Component({
  selector: "app-add-image-study",
  templateUrl: "./add-image-study.page.html",
  styleUrls: ["./add-image-study.page.scss"]
})
export class AddImageStudyPage implements OnInit, OnDestroy {
  @Input() id: string;
  imageTests$: Observable<any>;
  imageTestsSub: Subscription;
  imageTests: any;
  currentImageTest: any;
  currentImageTestData: any;
  date: string;
  values: any;
  counter = 0;

  userSub: Subscription;
  user: any;

  constructor(
    public lang: LanguageService,
    private imageStudiesService: ImageStudiesService,
    private imageTestsService: ImageTestsService,
    private subjectsService: SubjectsService,
    private modalController: ModalController,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.userSub = this.subjectsService.getSubject(this.id).subscribe(data => {
      this.user = data;
    });
    this.getImageTests();
  }

  getImageTests() {
    this.imageTests$ = this.imageTestsService.getImageTests();
    this.imageTestsSub = this.imageTests$.subscribe(data => {
      console.log("imageTests", data);
      this.imageTests = data;
    });
  }

  getCurrentImageTest(imageTest: any) {
    this.imageTestsService.getImageTestData(imageTest).then(data => {
      this.currentImageTestData = data.data();
      this.values = this.currentImageTestData.fields;
      this.values.forEach(element => {
        element.value = null;
        element.status = null;
      });
      console.log("currentImageTestData", this.currentImageTestData);
    });
  }

  editImageField(value: any, index: number) {
    this.values[index].value = value;
    if (
      value === this.values[index].trueInput ||
      (this.values[index].positiveOptions &&
        this.values[index].positiveOptions.includes(value))
    ) {
      this.values[index].status = "positive";
    } else {
      this.values[index].status = "negative";
    }
    this.saveWithoutExit();
  }

  isValid() {
    return true;
  }

  saveWithoutExit() {
    if (this.isValid()) {
      const positive = this.values.some(
        element => element.status === "positive"
      );
      if (this.counter === 0) {
        this.counter++;
        this.imageStudiesService
          .addImageTest(this.id, {
            values: this.values,
            date: this.date,
            name: this.currentImageTestData.name,
            imageTestId: this.currentImageTestData.id,
            shortcode:
              "[IMA" + Math.floor(Math.random() * 1000 + 1).toString(10) + "]",
            status: positive ? "positive" : "negative"
          })
          .then(async () => {
            this.toastService.show(
              "success",
              "Prueba de imagen creada con éxito"
            );
          })
          .catch(async error => {
            this.toastService.show(
              "danger",
              "Ha habido algún problema con la creación de la prueba de imagen: " +
                error
            );
          });
      } else {
        this.user.imageTests[
          this.user.imageTests.length - 1
        ].values = this.values;
        this.subjectsService
          .updateSubject(this.id, {
            imageTests: this.user.imageTests
          })
          .then(async () => {
            this.toastService.show(
              "success",
              "Prueba de imagen editada con éxito"
            );
          })
          .catch(async error => {
            this.toastService.show(
              "danger",
              "Ha habido algún problema con la edición de la prueba de imagen: " +
                error
            );
          });
      }
    }
  }

  async save() {
    await this.dismissModal();
  }

  async showGallery(field: number, test: string) {
    const modal = await this.modalController.create({
      component: GalleryPage,
      componentProps: {
        id: this.id,
        field: field,
        test: test
      },
      cssClass: "my-custom-modal-css"
    });
    return await modal.present();
  }

  async addImage(field: number, test: string) {
    const modal = await this.modalController.create({
      component: AddImagePage,
      componentProps: {
        id: this.id,
        field: field,
        test: test
      }
    });
    return await modal.present();
  }

  async dismissModal(): Promise<any> {
    return await this.modalController.dismiss();
  }

  ngOnDestroy() {
    if (this.imageTestsSub) {
      this.imageTestsSub.unsubscribe();
    }
  }
}
