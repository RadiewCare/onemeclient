import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import { LanguageService } from "src/app/services/language.service";
import { LoadingController, ModalController } from "@ionic/angular";
import { ToastService } from "src/app/services/toast.service";
import { SubjectImageTestsService } from "src/app/services/subject-image-tests.service";
import { ImageTestsService } from "src/app/services/image-tests.service";
import { ImageTestsElementsService } from "src/app/services/image-tests-elements.service";
import { AddImagePage } from "../add-image/add-image.page";
import { GalleryPage } from "../gallery/gallery.page";

@Component({
  selector: "app-edit-image-study",
  templateUrl: "./edit-image-study.page.html",
  styleUrls: ["./edit-image-study.page.scss"]
})
export class EditImageStudyPage implements OnInit, OnDestroy {
  @Input() id: string;

  currentImageTestData: any;
  date: string;
  values: any;
  oldValues: any;
  user: any;
  userSub: Subscription;
  updatedImageTests: any;

  accessionNumber: string = "";

  subjectImageTest: any;
  imageTest: any;
  imageTestFields: any;
  subjectValues: any;
  imageTestsElements: any;

  status = "negative";

  // B, VU, VV, R, V, RV, C, P, RU, U, leftOvary, rightOvary, UT, ufl,
  // IM, SS, SM, otheruf

  constructor(
    public lang: LanguageService,
    private modalController: ModalController,
    private loadingController: LoadingController,
    private toastService: ToastService,
    private subjectImageTestsService: SubjectImageTestsService,
    private imageTestsService: ImageTestsService,
    private imageTestsElementsService: ImageTestsElementsService
  ) { }

  ngOnInit() { }

  async ionViewDidEnter() {
    await this.getSubjectImageTest();
    await this.getImageTestsElements();
    await this.getImageTestData();
  }

  async getSubjectImageTest(): Promise<void> {
    this.subjectImageTest = await this.subjectImageTestsService.getOneData(this.id);

    this.date = this.subjectImageTest.date;
    this.accessionNumber = this.subjectImageTest.accessionNumber || "";

    if (!this.subjectImageTest.format) {
      this.oldValues = this.subjectImageTest.values;
      this.values = [];
    } else {
      this.values = this.subjectImageTest.values;
      this.oldValues = this.subjectImageTest.oldValues || null;
    }

    this.status = this.subjectImageTest.status;

    console.log(this.subjectImageTest, "Datos del subjectImageTest");
    console.log(this.values, "Valores del formulario");
  }

  async getImageTestData() {

    // Prueba de imagen (config)
    this.imageTest = (await this.imageTestsService.getImageTestData(this.subjectImageTest.imageTestId)).data();
    console.log(this.imageTest, "Datos completos de la prueba");

    // Crear los biomarcadores
    this.subjectImageTest.biomarkers = this.imageTest.elements;

    // Coger la información de los biomarcadores
    for await (const biomarker of this.subjectImageTest.biomarkers) {
      biomarker.data = this.imageTestsElements.filter(element => element.id === biomarker.id)[0];
    }

    if (this.subjectImageTest.format) {
      // Cargar en biomarkers los value y status comparando las IDs para que el frontend lo pueda leer todo de un mismo sitio y no de dos arrays diferentes
      for await (const biomarker of this.subjectImageTest.biomarkers) {
        for await (const value of this.values) {
          if (value.id === biomarker.id) {
            biomarker.value = value.value;
            biomarker.status = value.status;
          }
        }
      }
    } else { // Al no tener values (es una prueba antigua) una vez cargado esto creamos un values por defecto con los biomarkers de la prueba
      // TIENE QUE SER CON LOS VALORES POR DEFECTO DE LA PRUEBA
      for await (const biomarker of this.subjectImageTest.biomarkers) {
        biomarker.value = biomarker.data.defaultOption || null;

        if (biomarker.data.positiveOptions && biomarker.data.positiveOptions.includes(biomarker.data.defaultOption)) {
          biomarker.status = "positive";
        }

        this.values.push({
          id: biomarker.id,
          status: null,
          value: biomarker.data.defaultOption || null
        })
      }
      console.log(this.values, "estos son los values que se han creado al ser una prueba vieja");

    }

    console.log(this.subjectImageTest.biomarkers, "Biomarcadores cargados");
  }

  async getImageTestsElements() {
    this.imageTestsElements = (await this.imageTestsElementsService.getImageTestElementsData()).docs.map(element => element = element.data());
    console.log(this.imageTestsElements, "Elementos de prueba de imagen");
  }

  async editTestField(biomarkerId: string, value: any) {
    console.log(value, "evento");

    const indexInValues = this.values.findIndex(element => element.id === biomarkerId);
    const index = this.subjectImageTest.biomarkers.findIndex(element => element.id === biomarkerId);

    this.subjectImageTest.biomarkers[index].value = value;
    this.values[indexInValues].value = value;

    this.calculatePositiveBiomarker(biomarkerId, value);
  }

  async calculatePositiveBiomarker(biomarkerId: string, value: any) {

    const index = this.subjectImageTest.biomarkers.findIndex(element => element.id === biomarkerId);
    const indexInValues = this.values.findIndex(element => element.id === biomarkerId);

    const positiveOptions = this.subjectImageTest.biomarkers[index].data.positiveOptions;

    console.log(positiveOptions, "Datos del biomarcador a evaluar positivo");
    console.log("Calculando si es positivo", biomarkerId, value);

    // Múltiples

    if (this.subjectImageTest.biomarkers[index].data.type === "multiple") {
      let found = false;

      for await (const val of value) {
        for await (const option of positiveOptions) {
          if (val === option) {
            found = true;
          }
        }
      }

      if (found) {
        this.subjectImageTest.biomarkers[index].status = "positive"
        this.values[indexInValues].status = "positive";
      } else {
        this.subjectImageTest.biomarkers[index].status = "negative"
        this.values[indexInValues].status = "negative";
      }
    }

    // Textos
    if (
      (this.subjectImageTest.biomarkers[index].data.type === "text" || this.subjectImageTest.biomarkers[index].data.type === "textarea")
      && this.subjectImageTest.biomarkers[index].value
      && this.subjectImageTest.biomarkers[index].value.length >= 1
    ) {
      this.subjectImageTest.biomarkers[index].status = "positive"
      this.values[indexInValues].status = "positive";
    } else if ((this.subjectImageTest.biomarkers[index].data.type === "text" || this.subjectImageTest.biomarkers[index].data.type === "textarea")
      && this.values[indexInValues].value === "") {
      this.subjectImageTest.biomarkers[index].status = null
      this.values[indexInValues].status = null;
    }

    // Números
    if ((this.subjectImageTest.biomarkers[index].data.type === "number" || this.subjectImageTest.biomarkers[index].data.type === "unit") && this.subjectImageTest.biomarkers[index].value) {
      this.subjectImageTest.biomarkers[index].status = "positive"
      this.values[indexInValues].status = "positive";
    } else if ((this.subjectImageTest.biomarkers[index].data.type === "number" || this.subjectImageTest.biomarkers[index].data.type === "unit") && this.subjectImageTest.biomarkers[index].value === "") {
      this.subjectImageTest.biomarkers[index].status = null
      this.values[indexInValues].status = null;
    }

    console.log(this.subjectImageTest.biomarkers, "Valores de la prueba en el formulario actualizados");
    console.log(this.values, "Valores de la prueba actualizados");

  }

  async addImage(subjectImageTestId: string, biomarkerId: string, field: number) {
    const modal = await this.modalController.create({
      component: AddImagePage,
      componentProps: {
        subjectImageTestId: subjectImageTestId,
        biomarkerId: biomarkerId,
        field: field
      }
    });
    return await modal.present();
  }

  async showGallery(id: string) {
    const modal = await this.modalController.create({
      component: GalleryPage,
      componentProps: {
        id: id,
      },
      cssClass: "my-custom-modal-css"
    });
    return await modal.present();
  }

  async save() {
    console.log(this.status, "STATUS FINAL");

    let positive = false;
    for await (const value of this.values) {
      if (value.status === "positive") {
        positive = true;
      }
    }

    if (positive) {
      this.status = "positive";
    } else {
      this.status = "negative";
    }

    let indice = 0;
    for await (const item of this.values) {
      if (item.value && item.value.length > 1) {
        console.log(item.value, "más de uno");
        console.log(this.imageTest.elements[indice].data.defaultOption);

        const index = item.value.indexOf(this.imageTest.elements[indice].data.defaultOption)
        console.log(index);

        if (index > -1) {
          item.value.splice(index, 1);
        }
      }
      indice = indice + 1;
    }

    const data = {
      accessionNumber: this.accessionNumber || null,
      date: this.date || null,
      values: this.values || [],
      status: this.status,
      oldValues: this.oldValues || null,
      format: "new"
    }
    console.log(data, "Datos a guardar");

    this.subjectImageTestsService.update(this.id, data)
      .then(async () => {
        await this.dismissModal();
        this.toastService.show("success", "Prueba actualizada con éxito");
      }).catch((error) => {
        console.error(error);
        this.toastService.show("danger", "Error al actualizar la prueba: " + error);
      })
  }

  async dismissModal(): Promise<any> {
    return await this.modalController.dismiss();
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      message: 'Guardando...',
    });
    await loading.present();
  }

  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }
}
