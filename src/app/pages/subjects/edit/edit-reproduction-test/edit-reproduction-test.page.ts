import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { of } from 'rxjs';
import { ImageTestsElementsService } from 'src/app/services/image-tests-elements.service';
import { ImageTestsService } from 'src/app/services/image-tests.service';
import { LanguageService } from 'src/app/services/language.service';
import { ReproductionTestsService } from 'src/app/services/reproduction-tests.service';
import { SubjectImageTestsService } from 'src/app/services/subject-image-tests.service';
import { ToastService } from 'src/app/services/toast.service';
import { AddImagePage } from '../add-image/add-image.page';
import { GalleryPage } from '../gallery/gallery.page';

@Component({
  selector: 'app-edit-reproduction-test',
  templateUrl: './edit-reproduction-test.page.html',
  styleUrls: ['./edit-reproduction-test.page.scss'],
})
export class EditReproductionTestPage implements OnInit {
  @Input() id: string;

  subjectImageTest: any;
  imageTest: any;
  imageTestsElements: any;

  date: any;
  accessionNumber: any;

  values: any;

  // MODELO DE DATOS DE PRUEBA ENDOMETRIOSIS

  endometriosisData: any;
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
  mrirsn: string = "";
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

  findingsEdit = [];

  private setting = {
    element: {
      dynamicDownload: null as HTMLElement
    }
  }

  constructor(
    public lang: LanguageService,
    private modalController: ModalController,
    private imageTestsService: ImageTestsService,
    private imageTestsElementsService: ImageTestsElementsService,
    private reproductionTestsService: ReproductionTestsService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
  }

  async ionViewDidEnter() {
    await this.getSubjectImageTest();

    if (this.subjectImageTest.name == "Endometriosis") {
      this.loadEndometriosisData();
    } else {
      await this.getImageTestsElements();
      await this.getImageTestData();
    }
  }

  async getSubjectImageTest(): Promise<void> {
    this.subjectImageTest = await this.reproductionTestsService.getOneData(this.id);

    this.date = this.subjectImageTest.date;
    this.accessionNumber = this.subjectImageTest.accessionNumber || "";
    this.values = this.subjectImageTest.values

    console.log(this.subjectImageTest, "Datos del subjectImageTest");
    console.log(this.values, "Valores del formulario");
  }

  async getImageTestData() {

    // Prueba de imagen (config)
    this.imageTest = (await this.imageTestsService.getImageTestData(this.subjectImageTest.imageTestId)).data();
    console.log(this.imageTest, "Datos completos de la prueba");

    // Crear los biomarcadores
    this.subjectImageTest.biomarkers = this.imageTest.elements;

    // Coger la informaci??n de los biomarcadores
    for await (const biomarker of this.subjectImageTest.biomarkers) {
      biomarker.data = this.imageTestsElements.filter(element => element.id === biomarker.id)[0];
    }

    // Cargar en biomarkers los value y status comparando las IDs para que el frontend lo pueda leer todo de un mismo sitio y no de dos arrays diferentes
    for await (const biomarker of this.subjectImageTest.biomarkers) {
      for await (const value of this.values) {
        if (value.id === biomarker.id) {
          biomarker.value = value.value;
          biomarker.status = value.status;
        }
      }
    }

    console.log(this.subjectImageTest.biomarkers, "Biomarcadores cargados");
  }

  async getImageTestsElements() {
    this.imageTestsElements = (await this.imageTestsElementsService.getImageTestElementsData()).docs.map(element => element = element.data());
    console.log(this.imageTestsElements, "Elementos de prueba de imagen");
  }

  editTestField(biomarkerId: string, value: any) {
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

    // M??ltiples

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

    // N??meros
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

  loadEndometriosisData() {

    this.endometriosisData = this.values;
    this.clinical_info = this.endometriosisData.clinical_info;
    this.technique = this.endometriosisData.technique;
    this.report = this.endometriosisData.report;
    this.conclusionExists = this.endometriosisData.conclusions.exists;
    this.motor_m1 = this.endometriosisData.conclusions.motor_m1;
    this.motor_0 = this.endometriosisData.conclusions.motor_0;
    this.motor_1 = this.endometriosisData.conclusions.motor_1;
    if (this.motor_m1) { this.findingsEdit.push("motor_m1") }
    if (this.motor_0) { this.findingsEdit.push("motor_0") }
    if (this.motor_1) { this.findingsEdit.push("motor_1") }
    this.subjectKey = this.endometriosisData.subjectKey;
    this.locationOID = this.endometriosisData.locationOID;
    this.mriyn = this.endometriosisData.mriyn;
    this.mrirsn = this.endometriosisData.mrirsn;
    this.mridat = this.endometriosisData.mridat;
    this.mritim = this.endometriosisData.mritim;
    this.fastyn = this.endometriosisData.fastyn;
    this.fastrsnd = this.endometriosisData.fastrsnd;
    this.abnormalFindingsExists = this.endometriosisData.abnormal_findings.exists;
    this.abnormalFindingsValue = this.endometriosisData.abnormal_findings.value;

    if (this.endometriosisData.report.B) {
      this.bnLesions = this.endometriosisData.report.B.n_lesions;
      this.bLesions = this.endometriosisData.report.B.lesions;

      for (let index = 0; index < this.bLesions.length; index++) {
        this.bDiamLesions[index] = this.bLesions[index].diameter;
        this.bIsAnUpdate[index] = this.bLesions[index].isUpdate;
      }
    }

    if (this.endometriosisData.report.V) {
      this.vunLesions = this.endometriosisData.report.V.n_lesions;
      this.vuLesions = this.endometriosisData.report.V.lesions;
      for (let index = 0; index < this.vuLesions.length; index++) {
        this.vDiamLesions[index] = this.vuLesions[index].diameter;
        this.vIsAnUpdate[index] = this.vuLesions[index].isUpdate;
      }
    }

    if (this.endometriosisData.report.VV) {
      this.vvnLesions = this.endometriosisData.report.VV.n_lesions;
      this.vvLesions = this.endometriosisData.report.VV.lesions;
      for (let index = 0; index < this.vvLesions.length - 1; index++) {
        this.vvDiamLesions[index] = this.vvLesions[index].diameter;
        this.vvIsAnUpdate[index] = this.vvLesions[index].isUpdate;
      }
    }

    if (this.endometriosisData.report.R) {
      this.rnLesions = this.endometriosisData.report.R.n_lesions;
      this.rLesions = this.endometriosisData.report.R.lesions;
      for (let index = 0; index < this.rLesions.length; index++) {
        this.rDiamLesions[index] = this.rLesions[index].diameter;
        this.rIsAnUpdate[index] = this.rLesions[index].isUpdate;
      }
    }

    if (this.endometriosisData.report.V) {
      this.vnLesions = this.endometriosisData.report.V.n_lesions;
      this.vLesions = this.endometriosisData.report.V.lesions;
      for (let index = 0; index < this.vLesions.length; index++) {
        this.vDiamLesions[index] = this.vLesions[index].diameter;
        this.vIsAnUpdate[index] = this.vLesions[index].isUpdate;
      }
    }

    if (this.endometriosisData.report.RV) {
      this.rvnLesions = this.endometriosisData.report.RV.n_lesions;
      this.rvLesions = this.endometriosisData.report.RV.lesions;
      for (let index = 0; index < this.rvLesions.length; index++) {
        this.rvDiamLesions[index] = this.rvLesions[index].diameter;
        this.rvIsAnUpdate[index] = this.rvLesions[index].isUpdate;
      }
    }


    if (this.endometriosisData.report.C) {
      this.cnLesions = this.endometriosisData.report.C.n_lesions;
      this.cLesions = this.endometriosisData.report.C.lesions;
      for (let index = 0; index < this.cLesions.length; index++) {
        this.cDiamLesions[index] = this.cLesions[index].diameter;
        this.cIsAnUpdate[index] = this.cLesions[index].isUpdate;
      }
    }

    if (this.endometriosisData.report.P) {
      this.pnLesions = this.endometriosisData.report.P.n_lesions;
      this.pLesions = this.endometriosisData.report.P.lesions;
      for (let index = 0; index < this.pLesions.length; index++) {
        this.pDiamLesions[index] = this.pLesions[index].diameter;
        this.pIsAnUpdate[index] = this.pLesions[index].isUpdate;
      }
    }

    if (this.endometriosisData.report.RU) {
      this.runLesions = this.endometriosisData.report.RU.n_lesions;
      this.ruLesions = this.endometriosisData.report.RU.lesions;
      for (let index = 0; index < this.ruLesions.length; index++) {
        this.ruDiamLesions[index] = this.ruLesions[index].diameter;
        this.ruIsAnUpdate[index] = this.ruLesions[index].isUpdate;
      }
    }

    if (this.endometriosisData.report.U) {
      this.unLesions = this.endometriosisData.report.U.n_lesions;
      this.uLesions = this.endometriosisData.report.U.lesions;
      for (let index = 0; index < this.uLesions.length; index++) {
        this.uDiamLesions[index] = this.uLesions[index].diameter;
        this.uIsAnUpdate[index] = this.uLesions[index].isUpdate;
      }
    }

    if (this.endometriosisData.report.Left_Ovary) {
      this.leftOvarynLesions = this.endometriosisData.report.Left_Ovary.n_lesions;
      this.leftOvaryLesions = this.endometriosisData.report.Left_Ovary.lesions;
      for (let index = 0; index < this.leftOvaryLesions.length; index++) {
        this.leftOvaryDiamLesions[index] = this.leftOvaryLesions[index].diameter;
        this.leftOvaryIsAnUpdate[index] = this.leftOvaryLesions[index].isUpdate;
      }
    }

    if (this.endometriosisData.report.Right_Ovary) {
      this.rightOvarynLesions = this.endometriosisData.report.Right_Ovary.n_lesions;
      this.rightOvaryLesions = this.endometriosisData.report.Right_Ovary.lesions;
      for (let index = 0; index < this.rightOvaryLesions.length; index++) {
        this.rightOvaryDiamLesions[index] = this.rightOvaryLesions[index].diameter;
        this.rightOvaryIsAnUpdate[index] = this.rightOvaryLesions[index].isUpdate;
      }
    }

    if (this.endometriosisData.report.UT) {
      this.utnLesions = this.endometriosisData.report.UT.n_lesions;
      this.utLesions = this.endometriosisData.report.UT.lesions;
      for (let index = 0; index < this.utLesions.length; index++) {
        this.utDiamLesions[index] = this.utLesions[index].diameter;
        this.utIsAnUpdate[index] = this.utLesions[index].isUpdate;
      }
    }

    if (this.endometriosisData.report.UFL) {
      this.uflnLesions = this.endometriosisData.report.UFL.n_lesions;
      this.uflLesions = this.endometriosisData.report.UFL.lesions;
      for (let index = 0; index < this.uflLesions.length; index++) {
        this.uflDiamLesions[index] = this.uflLesions[index].diameter;
        this.uflIsAnUpdate[index] = this.uflLesions[index].isUpdate;
      }
    }

    if (this.endometriosisData.report.IM) {
      this.imnLesions = this.endometriosisData.report.IM.n_lesions;
      this.imLesions = this.endometriosisData.report.IM.lesions;
      for (let index = 0; index < this.imLesions.length; index++) {
        this.imDiamLesions[index] = this.imLesions[index].diameter;
        this.imIsAnUpdate[index] = this.imLesions[index].isUpdate;
      }
    }

    if (this.endometriosisData.report.SS) {
      this.ssnLesions = this.endometriosisData.report.SS.n_lesions;
      this.ssLesions = this.endometriosisData.report.SS.lesions;
      for (let index = 0; index < this.ssLesions.length; index++) {
        this.ssDiamLesions[index] = this.ssLesions[index].diameter;
        this.ssIsAnUpdate[index] = this.ssLesions[index].isUpdate;
      }
    }

    if (this.endometriosisData.report.SM) {
      this.smnLesions = this.endometriosisData.report.SM.n_lesions;
      this.smLesions = this.endometriosisData.report.SM.lesions;
      for (let index = 0; index < this.smLesions.length; index++) {
        this.ssDiamLesions[index] = this.smLesions[index].diameter;
        this.ssIsAnUpdate[index] = this.smLesions[index].isUpdate;
      }
    }


    if (this.endometriosisData.report.other_UF) {
      this.otherufnLesions = this.endometriosisData.report.other_UF.n_lesions;
      this.otherufLesions = this.endometriosisData.report.other_UF.lesions;
      for (let index = 0; index < this.otherufLesions.length; index++) {
        this.otherufDiamLesions[index] = this.otherufLesions[index].diameter;
        this.otherufIsAnUpdate[index] = this.otherufLesions[index].isUpdate;
      }
    }

    if (this.endometriosisData.report.thickness) {
      this.thickness = this.endometriosisData.report.thickness;
    }

  }

  async addImage(subjectImageTestId: string, biomarkerId: string, field: number) {
    const modal = await this.modalController.create({
      component: AddImagePage,
      componentProps: {
        subjectImageTestId: subjectImageTestId,
        biomarkerId: biomarkerId,
        field: field,
        origin: "reproduction"
      }
    });
    return await modal.present();
  }

  async showGallery(field: number) {
    const modal = await this.modalController.create({
      component: GalleryPage,
      componentProps: {
        id: this.values[field].id,
        field: field,
      },
      cssClass: "my-custom-modal-css"
    });
    return await modal.present();
  }

  save() {
    if (
      this.endometriosisData &&
      Object.keys(this.endometriosisData).length > 0 &&
      this.endometriosisData.constructor === Object
    ) {
      this.saveEndometriosis();
    }
    else {
      const data = {
        accessionNumber: this.accessionNumber || null,
        date: this.date || null,
        values: this.values || []
      }
      console.log(data, "Datos a guardar");

      this.reproductionTestsService.update(this.id, data)
        .then(async () => {
          await this.dismissModal();
          this.toastService.show("success", "Prueba actualizada con ??xito");
        }).catch((error) => {
          console.error(error);
          this.toastService.show("danger", "Error al actualizar la prueba: " + error);
        })
    }

  }

  async dismissModal(): Promise<void> {
    this.modalController.dismiss();
  }

  // ENDOMETRIOSIS
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

    // GUARDAR EN BASE DE DATOS LOS CAMBIOS

    //this.updatedImageTests[this.index].values = this.endometriosisData;

    //this.updatedImageTests[this.index].accessionNumber = this.accessionNumber;
    //this.updatedImageTests[this.index].date = this.date;

    /*this.subjectImageTestsService
      .update(this.id, {
        imageBiomarkers: this.updatedImageTests
      })
      .then(async () => {
        this.toastService.show(
          "success",
          "Prueba de imagen editada con ??xito"
        );
      })
      .catch(async error => {
        this.toastService.show(
          "danger",
          "Ha habido alg??n problema con la edici??n de la prueba de imagen: " +
          error
        );
      });

    await this.dismissModal();
    */
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

  dynamicDownloadJson() {
    this.fakeValidateUserData().subscribe((res) => {
      this.dyanmicDownloadByHtmlTag({
        fileName: `endometriosis-${this.subjectImageTest.subjectId}-${this.date}.json`,
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
}
