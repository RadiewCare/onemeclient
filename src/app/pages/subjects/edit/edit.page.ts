import { Component, OnInit, ViewChild, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  AlertController,
  IonSegment,
  LoadingController,
  ModalController,
} from "@ionic/angular";
import { ToastService } from "src/app/services/toast.service";
import { Observable, Subscription } from "rxjs";
import { AngularFirestore } from "@angular/fire/firestore";
import { LanguageService } from "src/app/services/language.service";
import { AddImagePage } from "./add-image/add-image.page";
import { GalleryPage } from "./gallery/gallery.page";
import { AuthService } from "src/app/services/auth.service";
import { AddAnalyticStudyPage } from "./add-analytic-study/add-analytic-study.page";
import { AddImageStudyPage } from "./add-image-study/add-image-study.page";
import { EditAnalyticStudyPage } from "./edit-analytic-study/edit-analytic-study.page";
import { EditImageStudyPage } from "./edit-image-study/edit-image-study.page";
import { AnalyticStudiesService } from "src/app/services/analytic-studies.service";
import { ImageStudiesService } from "src/app/services/image-studies.service";
import { SubjectsService } from "src/app/services/subjects.service";
import { DoctorsService } from "src/app/services/doctors.service";
import { EditQuibimPage } from "./edit-quibim/edit-quibim.page";
import { CreateReportPage } from './create-report/create-report.page';
import { CategoriesService } from 'src/app/services/categories.service';
import { LabelsService } from 'src/app/services/labels.service';
import { ImageTestsService } from 'src/app/services/image-tests.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { findIndex } from 'rxjs/operators';

@Component({
  selector: "app-edit",
  templateUrl: "./edit.page.html",
  styleUrls: ["./edit.page.scss"],
})
export class EditPage implements OnInit, OnDestroy {
  @ViewChild(IonSegment, { static: true }) segment: IonSegment;
  /* Sujeto */
  id: string;
  subject: any;
  subject$: Observable<any>;
  subjectSub: Subscription;
  identifier: string;
  page = 50;

  // Doctor
  user$: any;
  userData: any;
  userSub: Subscription;
  doctorSub: Subscription;

  /* Observables */
  phenotypicStudy$: any;
  geneticStudy$: Observable<any>;
  geneticStudy: any;
  geneticSub: Subscription;
  geneticNumberSub: Subscription;
  analyticStudy$: Observable<any>;
  numberOfVariants$: Observable<any>;
  imageStudy$: any;

  /* Otras variables */
  skeletonData = new Array(20);
  currentUserId: string;

  // DATOS FENOTÍPICOS

  /* Actualpacs */
  actualpacsId: string;
  accessionNumber: number;
  inicialesDelSujeto: string;
  centroReferente: string;

  /* Datos biométricos */
  genre: string;
  birthDate: string;
  height: number;
  weight: number;
  populationGroup: string;
  skin: string;
  hair: string;
  eyes: string;
  imc: number;
  androidFat: number;
  highBloodPressure: number;
  lowBloodPressure: number;
  alergies: string;
  foodIntolerance: string;
  intestinalDisorders: string;
  children: number;
  menarcheAge: number;
  menopausalAge: number;
  sop: boolean;
  vaginalSpotting: boolean;

  /* Hábitos de vida */
  smoker: boolean;
  alcohol: boolean;
  otherDrugs: string;
  medicines: boolean;
  solarExposition: string;
  workExposition: string;
  physicalActivity: string;

  /* Signos y síntomas */
  signs = [];
  symptoms = [];
  currentSign: string;
  currentSymptom: string;

  /* Antecedentes */
  cancer: boolean;
  neurodegeneratives: boolean;
  autoinmunes: boolean;
  cardioDisease: boolean;
  infertility: boolean;

  /* Otros antecedentes */
  otherBackground: string;

  /* Tratamiento actual */
  currentTreatment: string;

  // DATOS GENÉTICOS
  mutations: any;
  numberOfVariants: number;
  gridApi: any;
  columnDefs = [
    {
      headerName: "Genetic Variant",
      field: "geneticVariant",
    },
    {
      headerName: "Frequency",
      field: "frequency",
    },
    {
      headerName: "Magnitude",
      field: "magnitude",
    },
  ];

  defaultColDef = {
    resizable: true,
    sortable: true,
    filter: true,
    minWidth: 100,
  };

  // ANALISIS CLÍNICOS
  analyticElements$: Observable<any>;
  analyticValues = [];
  currentAnalysisDate: string;
  currentAnalysis: string;
  currentAnalysisData$: Observable<any>;
  currentAnalysisData: any;
  currentAnalysisValues: any;
  clinicAnalysis$: Observable<any>;
  hasClinicAnalysis = false;
  analysisSub: Subscription;
  analyticValuesSub: Subscription;
  analyticStudyValues$: Observable<any>;

  // ESTUDIO DE IMAGEN
  imageTests: any;

  // filtros
  queryLabel: string;
  queryCategory: string;

  categories = [];
  labels = [];

  suggestedCategories: any;
  suggestedLabels: any;

  relatedCategories: any;
  relatedLabels: any;

  filteredImageTests: any;

  selectedCategories = [];
  selectedLabels = [];
  selectedCategoriesIds = [];
  selectedLabelsIds = [];

  originalImageTests: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private alertController: AlertController,
    private toastService: ToastService,
    private analyticStudiesService: AnalyticStudiesService,
    private subjectsService: SubjectsService,
    private imageStudiesService: ImageStudiesService,
    private router: Router,
    private loadingController: LoadingController,
    private db: AngularFirestore,
    private modalController: ModalController,
    public lang: LanguageService,
    private auth: AuthService,
    private doctorsService: DoctorsService,
    private categoriesService: CategoriesService,
    private labelsService: LabelsService,
    private imageTestsService: ImageTestsService
  ) { }

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.params.id;
    this.segment.value = "phenotypic-data";
    this.getCategories();
    this.getLabels();
  }

  ionViewDidEnter() {
    this.user$ = this.auth.user$;
    this.userSub = this.user$.subscribe((data) => {
      this.currentUserId = data.id;
      this.doctorSub = this.doctorsService
        .getDoctor(data.id)
        .subscribe((doc) => {
          this.userData = doc;
          if (!this.userData.isAdmin && this.userData.isCollaborator) {
            if (this.userData.sharedSubjectsPhenotypic.includes(this.id)) {
              this.segment.value = "phenotypic-data";
            } else if (this.userData.sharedSubjectsGenetic.includes(this.id)) {
              this.segment.value = "genetic-data";
            } else if (this.userData.sharedSubjectsAnalytic.includes(this.id)) {
              this.segment.value = "analytic-data";
            } else if (this.userData.sharedSubjectsImage.includes(this.id)) {
              this.segment.value = "image-data";
            }
            this.segmentChanged(this.segment.value);
          }
        });
    });

    this.subject$ = this.subjectsService.getSubject(this.id);
    this.subjectSub = this.subject$.subscribe(async (data) => {
      this.subject = data;

      console.log(this.subject);

      this.identifier = this.subject.identifier;
      this.numberOfVariants = this.subject.numberOfVariants;
      this.mutations = this.subject.mutations;
      this.hasClinicAnalysis = this.subject.hasClinicAnalysis;
      if (data.history) {
        const history = data.history;
        this.actualpacsId = history.actualpacsId;
        this.accessionNumber = history.accesionNumber;
        this.inicialesDelSujeto = history.inicialesDelSujeto;
        this.centroReferente = history.centroReferente;
        this.genre = history.genre;
        this.birthDate = history.birthDate;
        this.height = history.height;
        this.weight = history.weight;
        this.populationGroup = history.populationGroup;
        this.skin = history.skin;
        this.hair = history.hair;
        this.eyes = history.eyes;
        this.imc = history.imc;
        this.androidFat = history.androidFat;
        this.highBloodPressure = history.highBloodPressure;
        this.lowBloodPressure = history.lowBloodPressure;
        this.alergies = history.alergies;
        this.foodIntolerance = history.foodIntolerance;
        this.intestinalDisorders = history.intestinalDisorders;
        this.children = history.children;
        this.menarcheAge = history.menarcheAge;
        this.menopausalAge = history.menopausalAge;
        this.sop = history.sop;
        this.vaginalSpotting = history.vaginalSpotting;
        this.smoker = history.smoker;
        this.alcohol = history.alcohol;
        this.otherDrugs = history.otherDrugs;
        this.medicines = history.medicines;
        this.solarExposition = history.solarExposition;
        this.workExposition = history.workExposition;
        this.physicalActivity = history.physicalActivity;
        this.cancer = history.cancer;
        this.neurodegeneratives = history.neurodegeneratives;
        this.autoinmunes = history.autoinmunes;
        this.cardioDisease = history.cardioDisease;
        this.infertility = history.infertility;
        this.otherBackground = history.otherBackground;
        this.currentTreatment = history.currentTreatment;
        if (history.signs) {
          this.signs = history.signs;
        }
        if (history.symptoms) {
          this.symptoms = history.symptoms;
        }
      }
      if (data.imageTests) {
        this.imageTests = data.imageTests.sort((a, b) => {
          return b.date - a.date;
        });
        this.originalImageTests = data.imageTests.sort((a, b) => {
          return b.date - a.date;
        });
        console.log(this.imageTests);

        let iterator = 0;
        for await (const element of this.imageTests) {
          this.imageTestsService.getImageTestData(element.imageTestId).then(data => {
            console.log(data.data());

            this.imageTests[iterator].relatedCategories = data.data().relatedCategories || [];
            this.imageTests[iterator].relatedLabels = data.data().relatedLabels || [];
            iterator = iterator + 1;
          })
        }
        console.log(this.imageTests);

      }
    });
  }

  segmentChanged(event: any) {
    if (!this.userData.isCollaborator) {
      this.segment.value = event.detail.value;
    }

    switch (this.segment.value) {
      case "phenotypic-data":
        break;
      case "genetic-study":
        this.page = 50;
        this.loadGeneticData();
        break;
      case "analytic-study":
        this.getAnalyticStudy();
        break;
      case "image-study":
        this.getImageStudy();
        break;
      default:
        break;
    }
  }

  async getCategories() {
    const categories = await this.categoriesService.getAllData();
    categories.forEach(element => {
      this.categories.push(element.data());
    })
  }

  async getLabels() {
    const labels = await this.labelsService.getAllData();
    labels.forEach(element => {
      this.labels.push(element.data());
    })
  }

  onCategoryChange(input: string) {
    if (input.length > 0) {
      this.suggestedCategories = this.categories.filter(cat =>
        cat.name.trim().toLowerCase().includes(input.trim().toLowerCase())
      );
    } else {
      this.suggestedCategories = null;
    }
  }

  onLabelChange(input: string) {
    if (input.length > 0) {
      this.suggestedLabels = this.labels.filter(lab =>
        lab.name.trim().toLowerCase().includes(input.trim().toLowerCase())
      );
    } else {
      this.suggestedLabels = null;
    }
  }

  async addCategory(category: any) {
    this.selectedCategories.push(category);
    this.selectedCategoriesIds.push(category.id);
    await this.filterCategories();
    this.filterLabels()
    this.queryCategory = null;
  }

  async removeCategory(index: number) {
    this.selectedCategories.splice(index, 1);
    this.selectedCategoriesIds.splice(index, 1);
    await this.filterCategories();
    this.filterLabels()
    this.queryCategory = null;
  }

  async addLabel(label: any) {
    this.selectedLabels.push(label);
    this.selectedLabelsIds.push(label.id);
    await this.filterCategories();
    this.filterLabels()
    this.queryLabel = null;
  }

  async removeLabel(index: number) {
    this.selectedLabels.splice(index, 1);
    this.selectedLabelsIds.splice(index, 1);
    await this.filterCategories();
    this.filterLabels()
    this.queryLabel = null;
  }

  async filterCategories() {
    if (this.selectedCategoriesIds.length !== 0) {
      console.log(this.selectedCategories);

      const newTests = [];
      // Miro en qué indices están los elementos que coinciden con la categoría
      this.imageTests.forEach(test => {
        test.relatedCategories.forEach(category => {
          if (this.selectedCategoriesIds.includes(category.id)) {
            newTests.push(test);
          }
        });
      });

      this.imageTests = newTests
    } else {
      if (this.selectedLabelsIds.length === 0) {
        this.imageTests = this.originalImageTests;
      }
    }
  }

  async filterLabels() {
    if (this.selectedLabelsIds.length !== 0) {
      console.log(this.selectedCategories);

      const newTests = [];
      // Miro en qué indices están los elementos que coinciden con la categoría
      this.imageTests.forEach(test => {
        test.relatedLabels.forEach(label => {
          if (this.selectedLabelsIds.includes(label.id)) {
            newTests.push(test);
          }
        });
      });

      this.imageTests = newTests
    } else {
      if (this.selectedCategoriesIds.length === 0) {
        this.imageTests = this.originalImageTests;
      }
    }
  }

  async loadGeneticData(event?: any): Promise<any> {
    this.geneticStudy$ = await this.db
      .collection(`subjects/${this.id}/geneticData`, (ref) =>
        ref.limit(this.page)
      )
      .valueChanges();
    this.geneticSub = this.geneticStudy$.subscribe((data) => {
      this.geneticStudy = data;
      if (event) {
        event.target.complete();
      }
    });
  }

  async loadGeneticMore(event: any): Promise<any> {
    const loading = await this.loadingController.create(null);
    loading.present();
    this.page = this.page + 50;
    this.loadGeneticData(event).then(() => {
      loading.dismiss();
    });
  }

  getAnalyticStudy() {
    this.analyticStudy$ = this.analyticStudiesService.getAnalyticStudies(
      this.id
    );
  }

  changeCurrentAnalysis(analysis: string) {
    if (analysis) {
      this.currentAnalysis = analysis;
      this.currentAnalysisData$ = this.analyticStudiesService.getAnalyticStudy(
        this.id,
        this.currentAnalysis
      );
      this.analyticValuesSub = this.analyticStudyValues$.subscribe((data) => {
        this.currentAnalysisValues = data;
      });
      this.analysisSub = this.currentAnalysisData$.subscribe((data) => {
        this.currentAnalysisData = data;
        this.currentAnalysisDate = data.date;
      });
    } else {
      this.getAnalyticStudy();
    }
  }

  changeCurrentAnalysisDate(date: string) {
    this.currentAnalysisDate = date;
  }

  async deleteClinicAnalysis() {
    const alert = await this.alertController.create({
      header: "¿Estás seguro?",
      message: "Pulse aceptar para eliminar el análisis",
      buttons: [
        {
          text: "Cancelar",
          role: "cancel",
          cssClass: "secondary",
          handler: (blah) => { },
        },
        {
          text: "Aceptar",
          handler: () => {
            this.currentAnalysisData$ = undefined;
            this.analyticStudyValues$ = undefined;
            this.analyticStudy$ = undefined;
            this.analysisSub.unsubscribe();
            this.analyticValuesSub.unsubscribe();
            this.currentAnalysisData = undefined;
            this.currentAnalysisDate = undefined;
            this.currentAnalysisValues = undefined;
            this.analyticStudiesService
              .deleteAnalysisStudy(this.id, this.currentAnalysis)
              .then(() => {
                this.toastService.show(
                  "success",
                  "Análisis clínico eliminado con éxito"
                );
                this.currentAnalysis = undefined;
              })
              .catch(() => {
                this.toastService.show(
                  "danger",
                  "Error al eliminar el análisis clínico"
                );
              });
          },
        },
      ],
    });

    await alert.present();
  }

  async deleteAnalyticStudy(studyId: string) {
    const alert = await this.alertController.create({
      header: "¿Estás seguro?",
      message: "Pulse aceptar para eliminar el análisis",
      buttons: [
        {
          text: "Cancelar",
          role: "cancel",
          cssClass: "secondary",
          handler: (blah) => { },
        },
        {
          text: "Aceptar",
          handler: () => {
            this.analyticStudiesService
              .deleteAnalysisStudy(this.id, studyId)
              .then(() => {
                this.toastService.show(
                  "success",
                  "Análisis clínico eliminado con éxito"
                );
                this.currentAnalysis = undefined;
              })
              .catch(() => {
                this.toastService.show(
                  "danger",
                  "Error al eliminar el análisis clínico"
                );
              });
          },
        },
      ],
    });

    await alert.present();
  }

  editElement(
    id: string,
    name: string,
    value: number,
    metricUnit: string,
    category: string
  ) {
    const index = this.analyticValues.findIndex((element) => {
      return element.id === id;
    });
    if (index === -1) {
      this.analyticValues.push({
        id,
        name,
        value,
        metricUnit,
        category,
      });
    } else {
      this.analyticValues[index] = {
        id,
        name,
        value,
        metricUnit,
        category,
      };
    }
  }

  getImageStudy() {
    this.imageStudy$ = this.imageStudiesService.getImageAnalysis(this.id);
  }

  createImageStudy() {
    const data = { imageAnalysis: [], hasImageAnalysis: true };
    this.imageStudiesService.createImageAnalysis(this.id, data);
  }

  async deleteImageTest(index: number) {
    const alert = await this.alertController.create({
      header: "¿Estás seguro?",
      message: "Pulse aceptar para eliminar la prueba de imagen",
      buttons: [
        {
          text: "Cancelar",
          role: "cancel",
          cssClass: "secondary",
          handler: (blah) => { },
        },
        {
          text: "Aceptar",
          handler: () => {
            this.imageTests.splice(index, 1);
            this.subjectsService
              .updateSubject(this.id, {
                imageTests: this.imageTests,
              })
              .then(() => {
                if (this.imageTests.length === 0) {
                  this.subjectsService.updateSubject(this.id, {
                    hasImageAnalysis: false,
                  });
                }
                this.toastService.show(
                  "success",
                  "Prueba de imagen eliminada con éxito"
                );
              })
              .catch(() => {
                this.toastService.show(
                  "danger",
                  "Error al eliminar la prueba de imagen"
                );
              });
          },
        },
      ],
    });

    await alert.present();
  }

  /*editImageDate(value: any, formIndex: number) {
    this.imageTestsArray[formIndex].date = value;
  }

  editImageField(value: any, formIndex: number, fieldIndex?: number) {
    this.imageTestsArray[formIndex].fields[fieldIndex].value = value;
  }*/

  /*showField(index: string) {
    if (this.visibleFields.includes(index)) {
      this.visibleFields = this.visibleFields.filter(
        element => element !== index
      );
    } else {
      this.visibleFields.push(index);
    }
  }*/

  addSign(sign: string) {
    if (sign.length > 0) {
      this.signs.push(sign.toLowerCase());
      this.currentSign = "";
    }
  }

  addSymptom(symptom: string) {
    console.log(symptom);

    if (symptom.length > 0) {
      this.symptoms.push(symptom.toLowerCase());
      this.currentSymptom = "";
    }
  }

  save() {
    /* switch (this.segment.value) {
      case "phenotypic-data":
        this.savePhenotypic();
        break;
      case "genetic-study":
        break;
      case "analytic-study":
        break;
      case "image-study":
        /*this.saveImage();
        break;
      default:
    break;     
    } */

    this.savePhenotypic()
  }

  async savePhenotypic(): Promise<any> {
    const data = {
      actualpacsId: this.actualpacsId || null,
      accessionNumber: this.accessionNumber || null,
      inicialesDelSujeto: this.inicialesDelSujeto || null,
      centroReferente: this.centroReferente || null,
      genre: this.genre || null,
      birthDate: this.birthDate || null,
      height: this.height || null,
      weight: this.weight || null,
      populationGroup: this.populationGroup || null,
      skin: this.skin || null,
      hair: this.hair || null,
      eyes: this.eyes || null,
      imc: this.imc || null,
      androidFat: this.androidFat || null,
      highBloodPressure: this.highBloodPressure || null,
      lowBloodPressure: this.lowBloodPressure || null,
      alergies: this.alergies || null,
      foodIntolerance: this.foodIntolerance || null,
      intestinalDisorders: this.intestinalDisorders || null,
      children: this.children || null,
      menarcheAge: this.menarcheAge || null,
      menopausalAge: this.menopausalAge || null,
      sop: this.sop || null,
      vaginalSpotting: this.vaginalSpotting || null,
      smoker: this.smoker || null,
      alcohol: this.alcohol || null,
      otherDrugs: this.otherDrugs || null,
      medicines: this.medicines || null,
      solarExposition: this.solarExposition || null,
      workExposition: this.workExposition || null,
      physicalActivity: this.physicalActivity || null,
      cancer: this.cancer || null,
      neurodegeneratives: this.neurodegeneratives || null,
      autoinmunes: this.autoinmunes || null,
      cardioDisease: this.cardioDisease || null,
      infertility: this.infertility || null,
      otherBackground: this.otherBackground || null,
      currentTreatment: this.currentTreatment || null,
      symptoms: this.symptoms || null,
      signs: this.signs || null,
    };
    if (this.identifier.length > 0) {
      await this.subjectsService
        .updateSubject(this.id, { identifier: this.identifier, history: data })
        .then(() => {
          this.toastService.show(
            "success",
            "Datos del sujeto actualizados con éxito"
          );
        })
        .catch((error) => {
          this.toastService.show(
            "danger",
            "Error al actualizar los datos del sujeto"
          );
        });
    } else {
      this.toastService.show("danger", "El identificador no puede estar vacío");
    }
  }

  async addImage(field: number) {
    const modal = await this.modalController.create({
      component: AddImagePage,
      componentProps: {
        id: this.id,
        field,
      },
    });
    return await modal.present();
  }

  async showGallery(field: number) {
    const modal = await this.modalController.create({
      component: GalleryPage,
      componentProps: {
        id: this.id,
        field,
      },
      cssClass: "my-custom-modal-css",
    });
    return await modal.present();
  }

  async openQuibim(index: number) {
    const modal = await this.modalController.create({
      component: EditQuibimPage,
      componentProps: {
        id: this.id,
        index,
      },
      cssClass: "my-custom-modal-css",
    });
    return await modal.present();
  }

  async openReports(imageTest: any) {
    const modal = await this.modalController.create({
      component: CreateReportPage,
      componentProps: {
        id: this.id,
        imageTest,
      },
      cssClass: "my-custom-modal-css",
    });
    return await modal.present();
  }

  async showAddAnalytic() {
    const modal = await this.modalController.create({
      component: AddAnalyticStudyPage,
      componentProps: {
        id: this.id,
      },
      cssClass: "my-custom-modal-css",
      backdropDismiss: false,
    });
    return await modal.present();
  }

  async showEditAnalytic(testId: string) {
    const modal = await this.modalController.create({
      component: EditAnalyticStudyPage,
      componentProps: {
        id: this.id,
        testId,
      },
      cssClass: "my-custom-modal-css",
      backdropDismiss: false,
    });
    return await modal.present();
  }

  async showAddImage() {
    const modal = await this.modalController.create({
      component: AddImageStudyPage,
      componentProps: {
        id: this.id,
      },
      cssClass: "my-custom-modal-css",
      backdropDismiss: false,
    });
    return await modal.present();
  }

  async showImageTest(testId: string, index: number) {
    const modal = await this.modalController.create({
      component: EditImageStudyPage,
      componentProps: {
        id: this.id,
        index,
      },
      cssClass: "my-custom-modal-css",
      backdropDismiss: false,
    });
    return await modal.present();
  }

  /*async saveImage(): Promise<any> {
    this.usersService
      .updateUser(this.id, {
        imageTests: this.imageTestsArray
      })
      .then(() => {
        this.toastService.show(
          "success",
          "Pruebas de imagen guardadas con éxito"
        );
      })
      .catch(() => {
        this.toastService.show(
          "danger",
          "Error al guardar las pruebas de imagen"
        );
      });
  }*/

  async import(): Promise<any> { }

  async delete(): Promise<any> {
    const alert = await this.alertController.create({
      header: "¿Estás seguro?",
      message:
        "Pulse aceptar para eliminar el sujeto. Se eliminarán todos los datos asociados.",
      buttons: [
        {
          text: "Cancelar",
          role: "cancel",
          cssClass: "secondary",
          handler: (blah) => { },
        },
        {
          text: "Aceptar",
          handler: () => {
            // TO DO: Eliminar referencias en doctores
            this.subjectSub.unsubscribe();
            this.subjectsService
              .deleteSubject(this.id)
              .then(() => {
                this.router.navigate(["/subjects"]).then(() => {
                  this.toastService.show(
                    "success",
                    "Sujeto eliminado con éxito"
                  );
                });
              })
              .catch(() => {
                this.toastService.show("danger", "Error al eliminar el sujeto");
              });
          },
        },
      ],
    });
    await alert.present();
  }

  sizeToFit() {
    this.gridApi.sizeColumnsToFit();
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.sizeToFit();
  }

  isNotAllowed(page: string) {
    switch (page) {
      case "phenotypic":
        return this.userData.sharedSubjectsPhenotypic.includes(this.id);
      case "genetic":
        return this.userData.sharedSubjectsGenetic.includes(this.id);
      case "analytic":
        return this.userData.sharedSubjectsAnalytic.includes(this.id);
      case "image":
        return this.userData.sharedSubjectsImage.includes(this.id);

      default:
        break;
    }
  }

  copyToClipboard(text: string) {
    const selBox = document.createElement("textarea");
    selBox.style.position = "fixed";
    selBox.style.left = "0";
    selBox.style.top = "0";
    selBox.style.opacity = "0";
    selBox.value = text;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand("copy");
    document.body.removeChild(selBox);
    this.toastService.show("success", "Código copiado al portapapeles");
  }

  ngOnDestroy() {
    if (this.analysisSub) {
      this.analysisSub.unsubscribe();
    }
    if (this.analyticValuesSub) {
      this.analyticValuesSub.unsubscribe();
    }
    if (this.subjectSub) {
      this.subjectSub.unsubscribe();
    }
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
    if (this.geneticNumberSub) {
      this.geneticNumberSub.unsubscribe();
    }
  }
}
