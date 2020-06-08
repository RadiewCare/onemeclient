import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import { LanguageService } from "src/app/services/language.service";
import { ModalController } from "@ionic/angular";
import { ToastService } from "src/app/services/toast.service";
import { SubjectsService } from "src/app/services/subjects.service";
import { AddImagePage } from "../add-image/add-image.page";
import { GalleryPage } from "../gallery/gallery.page";

@Component({
  selector: "app-edit-image-study",
  templateUrl: "./edit-image-study.page.html",
  styleUrls: ["./edit-image-study.page.scss"]
})
export class EditImageStudyPage implements OnInit, OnDestroy {
  @Input() id: string;
  @Input() index: string;
  currentImageTestData: any;
  date: string;
  values: any;
  user: any;
  userSub: Subscription;
  updatedImageTests: any;

  constructor(
    public lang: LanguageService,
    private modalController: ModalController,
    private toastService: ToastService,
    private usersService: SubjectsService
  ) {}

  ngOnInit() {}

  ionViewDidEnter() {
    this.getSubjectImageTests();
  }

  getSubjectImageTests() {
    this.userSub = this.usersService.getSubject(this.id).subscribe(data => {
      this.user = data;
      this.currentImageTestData = this.user.imageTests[this.index];
      this.date = this.currentImageTestData.date;
      this.values = this.currentImageTestData.values;
      this.updatedImageTests = this.user.imageTests;
    });
  }

  editImageField(value: any, index: number) {
    console.log(this.values, value, index);

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
  }

  isValid() {
    return true;
  }

  save() {
    if (this.isValid()) {
      const positive = this.values.some(
        element => element.status === "positive"
      );
      this.updatedImageTests[this.index].values = this.values;
      if (positive) {
        this.updatedImageTests[this.index].status = "positive";
      } else {
        this.updatedImageTests[this.index].status = "negative";
      }

      this.usersService
        .updateSubject(this.id, {
          imageTests: this.updatedImageTests
        })
        .then(async () => {
          await this.dismissModal();
          this.toastService.show(
            "success",
            "Prueba de imagen editada con éxito"
          );
        })
        .catch(async error => {
          await this.dismissModal();
          this.toastService.show(
            "danger",
            "Ha habido algún problema con la edición de la prueba de imagen: " +
              error
          );
        });
    }
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
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }
}
