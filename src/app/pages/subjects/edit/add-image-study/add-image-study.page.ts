import { Component, OnInit, OnDestroy, Input } from "@angular/core";
import { LanguageService } from "src/app/services/language.service";
import { ImageTestsService } from "src/app/services/image-tests.service";
import { Observable, Subscription, of } from "rxjs";
import { ModalController } from "@ionic/angular";
import { ToastService } from "src/app/services/toast.service";
import { ImageStudiesService } from "src/app/services/image-studies.service";
import { GalleryPage } from "../gallery/gallery.page";
import { AddImagePage } from "../add-image/add-image.page";
import { SubjectsService } from "src/app/services/subjects.service";
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: "app-add-image-study",
  templateUrl: "./add-image-study.page.html",
  styleUrls: ["./add-image-study.page.scss"],
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

  json: any;

  // MODELO DE DATOS DE PRUEBA ENDOMETRIOSIS

  endometriosisData = {};
  clinical_info: string;
  technique: string;
  report = {};
  conclusionExists: string;
  motor_m1: boolean = false;
  motor_0: boolean = false;
  motor_1: boolean = false;
  subjectKey: string = "";
  locationOID: string = "";
  mriyn: string = "";
  mrirsnd: string = "";
  mridat: string = "";
  mritim: string = "";
  fastyn: string = "";
  fastrsnd: string;
  abnormalFindingsExists: string = "";
  abnormalFindingsValue: string = "";

  bnLesions: number;
  bLesions = [];
  bDiamLesions = [];
  bIsAnUpdate = [];

  vunLesions: number;
  vuLesions = [];
  vuDiamLesions = [];
  vuIsAnUpdate = [];

  vvnLesions: number;
  vvLesions = [];
  vvDiamLesions = [];
  vvIsAnUpdate = [];

  rnLesions: number;
  rLesions = [];
  rDiamLesions = [];
  rIsAnUpdate = [];

  vnLesions: number;
  vLesions = [];
  vDiamLesions = [];
  vIsAnUpdate = [];

  rvnLesions: number;
  rvLesions = [];
  rvDiamLesions = [];
  rvIsAnUpdate = [];

  cnLesions: number;
  cLesions = [];
  cDiamLesions = [];
  cIsAnUpdate = [];

  pnLesions: number;
  pLesions = [];
  pDiamLesions = [];
  pIsAnUpdate = [];

  runLesions: number;
  ruLesions = [];
  ruDiamLesions = [];
  ruIsAnUpdate = [];

  unLesions: number;
  uLesions = [];
  uDiamLesions = [];
  uIsAnUpdate = [];

  leftOvarynLesions: number;
  leftOvaryLesions = [];
  leftOvaryDiamLesions = [];
  leftOvaryIsAnUpdate = [];

  rightOvarynLesions: number;
  rightOvaryLesions = [];
  rightOvaryDiamLesions = [];
  rightOvaryIsAnUpdate = [];

  utnLesions: number;
  utLesions = [];
  utDiamLesions = [];
  utIsAnUpdate = [];

  uflnLesions: number;
  uflLesions = [];
  uflDiamLesions = [];
  uflIsAnUpdate = [];

  imnLesions: number;
  imLesions = [];
  imDiamLesions = [];
  imIsAnUpdate = [];

  ssnLesions: number;
  ssLesions = [];
  ssDiamLesions = [];
  ssIsAnUpdate = [];

  smnLesions: number;
  smLesions = [];
  smDiamLesions = [];
  smIsAnUpdate = [];

  otherufnLesions: number;
  otherufLesions = [];
  otherufDiamLesions = [];
  otherufIsAnUpdate = [];

  thickness: string = "";

  downloadJsonHref: any;

  private setting = {
    element: {
      dynamicDownload: null as HTMLElement
    }
  }

  // B, VU, VV, R, V, RV, C, P, RU, U, leftOvary, rightOvary, UT, ufl,
  // IM, SS, SM, otheruf

  constructor(
    public lang: LanguageService,
    private imageStudiesService: ImageStudiesService,
    private imageTestsService: ImageTestsService,
    private subjectsService: SubjectsService,
    private modalController: ModalController,
    private toastService: ToastService, private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.userSub = this.subjectsService
      .getSubject(this.id)
      .subscribe((data) => {
        this.user = data;
      });
    this.getImageTests();
  }

  getImageTests() {
    this.imageTests$ = this.imageTestsService.getImageTests();
    this.imageTestsSub = this.imageTests$.subscribe((data) => {
      console.log("imageTests", data);
      this.imageTests = data;
    });
  }

  getCurrentImageTest(imageTest: any) {
    this.imageTestsService.getImageTestData(imageTest).then((data) => {
      this.currentImageTestData = data.data();
      if (this.currentImageTestData.fields) {
        this.values = this.currentImageTestData.fields;
        this.values.forEach((element) => {
          element.value = null;
          element.status = null;
        });
        console.log("currentImageTestData", this.currentImageTestData);
      }
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
        (element) => element.status === "positive"
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
            status: positive ? "positive" : "negative",
          })
          .then(async () => {
            this.toastService.show(
              "success",
              "Prueba de imagen creada con éxito"
            );
          })
          .catch(async (error) => {
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
            imageTests: this.user.imageTests,
          })
          .then(async () => {
            this.toastService.show(
              "success",
              "Prueba de imagen editada con éxito"
            );
          })
          .catch(async (error) => {
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
    if (
      Object.keys(this.endometriosisData).length > 0 &&
      this.endometriosisData.constructor === Object
    ) {
      this.saveEndometriosis();
    }
    this.dismissModal();
  }

  async showGallery(field: number, test: string) {
    const modal = await this.modalController.create({
      component: GalleryPage,
      componentProps: {
        id: this.id,
        field: field,
        test: test,
      },
      cssClass: "my-custom-modal-css",
    });
    return await modal.present();
  }

  async addImage(field: number, test: string) {
    const modal = await this.modalController.create({
      component: AddImagePage,
      componentProps: {
        id: this.id,
        field: field,
        test: test,
      },
    });
    return await modal.present();
  }

  async dismissModal(): Promise<any> {
    return await this.modalController.dismiss();
  }

  addLesion(key: any, value: any) {
    this.report[key] = value;
  }

  addData(key: any, value) {
    this.endometriosisData[key] = value;
  }

  changeDiameter(type: string, index: number, diameter: string) {

    // B, VU, VV, R, V, RV, C, P, RU, U, leftOvary, rightOvary, UT, ufl,
    // IM, SS, SM, otheruf
    switch (type) {
      case "B":
        this.bDiamLesions[index] = diameter;
        break;
      case "VU":
        this.vuDiamLesions[index] = diameter;
        break;
      case "VV":
        this.vvDiamLesions[index] = diameter;
        break;
      case "R":
        this.rDiamLesions[index] = diameter;
        break;
      case "V":
        this.vDiamLesions[index] = diameter;
        break;
      case "RV":
        this.rvDiamLesions[index] = diameter;
        break;
      case "C":
        this.cDiamLesions[index] = diameter;
        break;
      case "P":
        this.pDiamLesions[index] = diameter;
        break;
      case "RU":
        this.ruDiamLesions[index] = diameter;
        break;
      case "U":
        this.uDiamLesions[index] = diameter;
        break;
      case "leftOvary":
        this.leftOvaryDiamLesions[index] = diameter;
        break;
      case "rightOvary":
        this.rightOvaryDiamLesions[index] = diameter;
        break;
      case "UT":
        this.utDiamLesions[index] = diameter;
        break;
      case "ufl":
        this.uflDiamLesions[index] = diameter;
        break;
      case "IM":
        this.imDiamLesions[index] = diameter;
        break;
      case "SS":
        this.ssDiamLesions[index] = diameter;
        break;
      case "SM":
        this.smDiamLesions[index] = diameter;
        break;
      case "otheruf":
        this.otherufDiamLesions[index] = diameter;
        break;

      default:
        break;
    }
  }

  changeIsAnUpdate(type: string, index: number, state: boolean) {

    // B, VU, VV, R, V, RV, C, P, RU, U, leftOvary, rightOvary, UT, ufl,
    // IM, SS, SM, otheruf

    switch (type) {
      case "B":
        this.bIsAnUpdate[index] = state;
        break;
      case "VU":
        this.vuIsAnUpdate[index] = state;
        break;
      case "VV":
        this.vvIsAnUpdate[index] = state;
        break;
      case "R":
        this.rIsAnUpdate[index] = state;
        break;
      case "V":
        this.vIsAnUpdate[index] = state;
        break;
      case "RV":
        this.rvIsAnUpdate[index] = state;
        break;
      case "C":
        this.cIsAnUpdate[index] = state;
        break;
      case "P":
        this.pIsAnUpdate[index] = state;
        break;
      case "RU":
        this.ruIsAnUpdate[index] = state;
        break;
      case "U":
        this.uIsAnUpdate[index] = state;
        break;
      case "leftOvary":
        this.leftOvaryIsAnUpdate[index] = state;
        break;
      case "rightOvary":
        this.rightOvaryIsAnUpdate[index] = state;
        break;
      case "UT":
        this.utIsAnUpdate[index] = state;
        break;
      case "ufl":
        this.uflIsAnUpdate[index] = state;
        break;
      case "IM":
        this.imIsAnUpdate[index] = state;
        break;
      case "SS":
        this.ssIsAnUpdate[index] = state;
        break;
      case "SM":
        this.smIsAnUpdate[index] = state;
        break;
      case "otheruf":
        this.otherufIsAnUpdate[index] = state;
        break;

      default:
        break;
    }
  }

  isValidEndometriosis() {
    return true;
  }

  async saveEndometriosis() {
    console.log("Save endo");

    this.validateReport();
    this.endometriosisData = {
      ...this.endometriosisData,
      report: this.report,
      conclusions: {
        exists: this.conclusionExists,
        motor_m1: this.motor_m1,
        motor_0: this.motor_0,
        motor_1: this.motor_1
      },
      abnormal_findings: {
        exists: this.abnormalFindingsExists,
        value: this.abnormalFindingsValue
      }
    }

    console.log(this.endometriosisData);

    this.imageStudiesService
      .addImageTest(this.id, {
        values: this.endometriosisData,
        date: this.date,
        name: this.currentImageTestData.name,
        imageTestId: this.currentImageTestData.id,
        shortcode:
          "[ENDO" + Math.floor(Math.random() * 1000 + 1).toString(10) + "]",
        status: "negative",
      })
      .then(async () => {
        this.toastService.show(
          "success",
          "Prueba de imagen creada con éxito"
        );
      })
      .catch(async (error) => {
        console.log(error);

        this.toastService.show(
          "danger",
          "Ha habido algún problema con la creación de la prueba de imagen: " +
          error
        );
      });

    await this.dismissModal();
  }

  changeFindings(values: any) {
    console.log(values);

    if (values.includes("motor_m1")) {
      this.motor_m1 = true;
    } else {
      this.motor_m1 = false;
    }
    if (values.includes("motor_0")) {
      this.motor_0 = true;
    } else {
      this.motor_0 = false;
    }
    if (values.includes("motor_1")) {
      this.motor_1 = true
    } else {
      this.motor_1 = false;
    }

  }

  fakeValidateUserData() {
    this.validateReport();
    this.endometriosisData = {
      ...this.endometriosisData,
      report: this.report,
      conclusions: {
        exists: this.conclusionExists,
        motor_m1: this.motor_m1,
        motor_0: this.motor_0,
        motor_1: this.motor_1
      },
      abnormal_findings: {
        exists: this.abnormalFindingsExists,
        value: this.abnormalFindingsValue
      }
    }
    return of(this.endometriosisData);
  }

  async validateReport() {
    // B, VU, VV, R, V, RV, C, P, RU, U, leftOvary, rightOvary, UT, ufl,
    // IM, SS, SM, otheruf

    if (this.bnLesions > 0) {
      const blesions = [];

      for (let index = 0; index < this.bLesions.length; index++) {
        blesions.push({
          lesionId: `B-${index + 1}`,
          diameter: this.bDiamLesions[index],
          isUpdate: this.bIsAnUpdate[index]
        })
      }

      this.report = {
        ...this.report,
        B: {
          n_lesions: this.bnLesions,
          lesions: blesions
        }
      }
    }
    if (this.vunLesions > 0) {
      const vulesions = [];

      for (let index = 0; index < this.vuLesions.length; index++) {
        vulesions.push({
          lesionId: `VU-${index + 1}`,
          diameter: this.vuDiamLesions[index],
          isUpdate: this.vuIsAnUpdate[index]
        })
      }

      this.report = {
        ...this.report,
        VU: {
          n_lesions: this.vunLesions,
          lesions: vulesions
        }
      }
    }
    if (this.vvnLesions > 0) {
      const vvlesions = [];

      for (let index = 0; index < this.vvLesions.length; index++) {
        vvlesions.push({
          lesionId: `VV-${index + 1}`,
          diameter: this.vvDiamLesions[index],
          isUpdate: this.vvIsAnUpdate[index]
        })
      }

      this.report = {
        ...this.report,
        VV: {
          n_lesions: this.vvnLesions,
          lesions: vvlesions
        }
      }
    }
    if (this.rnLesions > 0) {
      const rlesions = [];

      for (let index = 0; index < this.rLesions.length; index++) {
        rlesions.push({
          lesionId: `R-${index + 1}`,
          diameter: this.rDiamLesions[index],
          isUpdate: this.rIsAnUpdate[index]
        })
      }

      this.report = {
        ...this.report,
        R: {
          n_lesions: this.rnLesions,
          lesions: rlesions
        }
      }
    }
    if (this.vnLesions > 0) {
      const vlesions = [];

      for (let index = 0; index < this.vLesions.length; index++) {
        vlesions.push({
          lesionId: `V-${index + 1}`,
          diameter: this.vDiamLesions[index],
          isUpdate: this.vIsAnUpdate[index]
        })
      }

      this.report = {
        ...this.report,
        V: {
          n_lesions: this.vnLesions,
          lesions: vlesions
        }
      }
    }
    if (this.rvnLesions > 0) {
      const rvlesions = [];

      for (let index = 0; index < this.rvLesions.length; index++) {
        rvlesions.push({
          lesionId: `RV-${index + 1}`,
          diameter: this.rvDiamLesions[index],
          isUpdate: this.rvIsAnUpdate[index]
        })
      }

      this.report = {
        ...this.report,
        RV: {
          n_lesions: this.rvnLesions,
          lesions: rvlesions
        }
      }
    }
    if (this.cnLesions > 0) {
      const clesions = [];

      for (let index = 0; index < this.cLesions.length; index++) {
        clesions.push({
          lesionId: `C-${index + 1}`,
          diameter: this.cDiamLesions[index],
          isUpdate: this.cIsAnUpdate[index]
        })
      }

      this.report = {
        ...this.report,
        C: {
          n_lesions: this.cnLesions,
          lesions: clesions
        }
      }
    }
    if (this.pnLesions > 0) {
      const plesions = [];

      for (let index = 0; index < this.pLesions.length; index++) {
        plesions.push({
          lesionId: `P-${index + 1}`,
          diameter: this.pDiamLesions[index],
          isUpdate: this.pIsAnUpdate[index]
        })
      }

      this.report = {
        ...this.report,
        P: {
          n_lesions: this.pnLesions,
          lesions: plesions
        }
      }
    }
    if (this.runLesions > 0) {
      const rulesions = [];

      for (let index = 0; index < this.ruLesions.length; index++) {
        rulesions.push({
          lesionId: `RU-${index + 1}`,
          diameter: this.ruDiamLesions[index],
          isUpdate: this.ruIsAnUpdate[index]
        })
      }

      this.report = {
        ...this.report,
        RU: {
          n_lesions: this.runLesions,
          lesions: rulesions
        }
      }
    }
    if (this.unLesions > 0) {
      const ulesions = [];

      for (let index = 0; index < this.uLesions.length; index++) {
        ulesions.push({
          lesionId: `U-${index + 1}`,
          diameter: this.uDiamLesions[index],
          isUpdate: this.uIsAnUpdate[index]
        })
      }

      this.report = {
        ...this.report,
        U: {
          n_lesions: this.unLesions,
          lesions: ulesions
        }
      }
    }
    if (this.leftOvarynLesions > 0) {
      const leftOvarylesions = [];

      for (let index = 0; index < this.leftOvaryLesions.length; index++) {
        leftOvarylesions.push({
          lesionId: `Left_Ovary-${index + 1}`,
          diameter: this.leftOvaryDiamLesions[index],
          isUpdate: this.leftOvaryIsAnUpdate[index]
        })
      }

      this.report = {
        ...this.report,
        Left_Ovary: {
          n_lesions: this.leftOvarynLesions,
          lesions: leftOvarylesions
        }
      }
    }
    if (this.rightOvarynLesions > 0) {
      const rightOvarylesions = [];

      for (let index = 0; index < this.rightOvaryLesions.length; index++) {
        rightOvarylesions.push({
          lesionId: `Right_Ovary-${index + 1}`,
          diameter: this.rightOvaryDiamLesions[index],
          isUpdate: this.rightOvaryIsAnUpdate[index]
        })
      }

      this.report = {
        ...this.report,
        Right_Ovary: {
          n_lesions: this.rightOvarynLesions,
          lesions: rightOvarylesions
        }
      }
    }
    if (this.utnLesions > 0) {
      const utlesions = [];

      for (let index = 0; index < this.utLesions.length; index++) {
        utlesions.push({
          lesionId: `UT-${index + 1}`,
          diameter: this.utDiamLesions[index],
          isUpdate: this.utIsAnUpdate[index]
        })
      }

      this.report = {
        ...this.report,
        UT: {
          n_lesions: this.utnLesions,
          lesions: utlesions
        }
      }
    }
    if (this.uflnLesions > 0) {
      const ufllesions = [];

      for (let index = 0; index < this.uflLesions.length; index++) {
        ufllesions.push({
          lesionId: `UFL-${index + 1}`,
          diameter: this.uflDiamLesions[index],
          isUpdate: this.uflIsAnUpdate[index]
        })
      }

      this.report = {
        ...this.report,
        UFL: {
          n_lesions: this.uflnLesions,
          lesions: ufllesions
        }
      }
    }
    if (this.imnLesions > 0) {
      const imlesions = [];

      for (let index = 0; index < this.imLesions.length; index++) {
        imlesions.push({
          lesionId: `IM-${index + 1}`,
          diameter: this.imDiamLesions[index],
          isUpdate: this.imIsAnUpdate[index]
        })
      }

      this.report = {
        ...this.report,
        IM: {
          n_lesions: this.imnLesions,
          lesions: imlesions
        }
      }
    }
    if (this.ssnLesions > 0) {
      const sslesions = [];

      for (let index = 0; index < this.ssLesions.length; index++) {
        sslesions.push({
          lesionId: `SS-${index + 1}`,
          diameter: this.ssDiamLesions[index],
          isUpdate: this.ssIsAnUpdate[index]
        })
      }

      this.report = {
        ...this.report,
        SS: {
          n_lesions: this.ssnLesions,
          lesions: sslesions
        }
      }
    }
    if (this.smnLesions > 0) {
      const smlesions = [];

      for (let index = 0; index < this.smLesions.length; index++) {
        smlesions.push({
          lesionId: `SM-${index + 1}`,
          diameter: this.smDiamLesions[index],
          isUpdate: this.smIsAnUpdate[index]
        })
      }

      this.report = {
        ...this.report,
        SM: {
          n_lesions: this.smnLesions,
          lesions: smlesions
        }
      }
    }
    if (this.otherufnLesions > 0) {
      const otheruflesions = [];

      for (let index = 0; index < this.otherufLesions.length; index++) {
        otheruflesions.push({
          lesionId: `other_UF-${index + 1}`,
          diameter: this.otherufDiamLesions[index],
          isUpdate: this.otherufIsAnUpdate[index]
        })
      }

      this.report = {
        ...this.report,
        other_UF: {
          n_lesions: this.otherufnLesions,
          lesions: otheruflesions
        }
      }
    }

    this.report = {
      ...this.report,
      thickness: this.thickness
    }

  }

  dynamicDownloadJson() {
    this.fakeValidateUserData().subscribe((res) => {
      this.dyanmicDownloadByHtmlTag({
        fileName: `endometriosis-${this.user.identifier}-${this.date}.json`,
        text: JSON.stringify(res)
      });
    });
  }

  private dyanmicDownloadByHtmlTag(arg: {
    fileName: string,
    text: string
  }) {
    if (!this.setting.element.dynamicDownload) {
      this.setting.element.dynamicDownload = document.createElement('a');
    }
    const element = this.setting.element.dynamicDownload;
    const fileType = arg.fileName.indexOf('.json') > -1 ? 'text/json' : 'text/plain';
    element.setAttribute('href', `data:${fileType};charset=utf-8,${encodeURIComponent(arg.text)}`);
    element.setAttribute('download', arg.fileName);

    var event = new MouseEvent("click");
    element.dispatchEvent(event);
  }

  ngOnDestroy() {
    if (this.imageTestsSub) {
      this.imageTestsSub.unsubscribe();
    }
  }
}
