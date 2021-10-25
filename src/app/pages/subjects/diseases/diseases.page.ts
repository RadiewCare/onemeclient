import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { Observable, Subscription } from 'rxjs';
import { AnalyticStudiesService } from 'src/app/services/analytic-studies.service';
import { AssistantReportsService } from 'src/app/services/assistant-reports.service';
import { CategoriesService } from 'src/app/services/categories.service';
import { DiseasesService } from 'src/app/services/diseases.service';
import { ImageTestsElementsService } from 'src/app/services/image-tests-elements.service';
import { ImageTestsService } from 'src/app/services/image-tests.service';
import { LabelsService } from 'src/app/services/labels.service';
import { LanguageService } from 'src/app/services/language.service';
import { SubjectImageTestsService } from 'src/app/services/subject-image-tests.service';
import { SubjectsService } from 'src/app/services/subjects.service';
import { SymptomsService } from 'src/app/services/symptoms.service';
import { ToastService } from 'src/app/services/toast.service';
import * as moment from "moment";
import * as firebase from "firebase/app";
import { ClinicAnalysisElementsService } from 'src/app/services/clinic-analysis-elements.service';
import { ShowDiseaseDescriptionPage } from '../edit/show-disease-description/show-disease-description.page';
import { DoctorsService } from 'src/app/services/doctors.service';
import { AuthService } from 'src/app/services/auth.service';
import { ReproductionTestsService } from 'src/app/services/reproduction-tests.service';

@Component({
  selector: 'app-diseases',
  templateUrl: './diseases.page.html',
  styleUrls: ['./diseases.page.scss'],
})
export class DiseasesPage implements OnInit, OnDestroy {

  id: string;

  subject: any;

  clinicAnalysis: any;
  signsAndSymptoms = [];
  diseases = [];
  subjectDiseases = [];
  originalDiseases = [];
  diseasesList = [];
  history: any;

  exclusion = false;

  selectedReport: any;

  analyticStudy$: Observable<any>;
  subjectAnaliticStudies = [];
  clinicAnalysisElements: any;

  assistantReports: any;
  assistantReportsSub: Subscription;

  combinedTests = [];


  // FERTILIDAD

  embryos: any;
  subjectTestsSub: Subscription;

  // ESTUDIO DE IMAGEN
  imageTests: any;
  imageTestsElements: any;

  // filtros
  queryLabel: string;
  queryCategory: string;

  categories = [];
  labels = [];

  suggestedCategories: any;
  suggestedLabels: any;

  relatedCategories: any;
  relatedLabels: any;

  selectedCategories = [];
  selectedLabels = [];
  selectedCategoriesIds = [];
  selectedLabelsIds = [];

  originalImageTests: any;
  originalReproductionTests: any;

  imageTestsList = [];

  reproductionTests = [];

  excludedTests = [];

  // BIOMARCADORES

  imageBiomarkers = [];
  analyticBiomarkers = [];
  reproductionBiomarkers = [];

  reproductionTestsSub: Subscription;

  confirmedDiseases = [];
  confirmedDiseasesList = [];

  excludedDiseases = [];
  excludedDiseaesList = [];

  isAdmin = false;
  userSub: Subscription;




  constructor(
    private activatedRoute: ActivatedRoute,
    private alertController: AlertController,
    private toastService: ToastService,
    private analyticStudiesService: AnalyticStudiesService,
    private subjectsService: SubjectsService,
    private loadingController: LoadingController,
    public lang: LanguageService,
    private categoriesService: CategoriesService,
    private labelsService: LabelsService,
    private imageTestsService: ImageTestsService,
    private diseasesService: DiseasesService,
    private symptomsService: SymptomsService,
    private subjectImageTestsService: SubjectImageTestsService,
    private imageTestsElementsService: ImageTestsElementsService,
    private assistantReportsService: AssistantReportsService,
    private clinicAnalysisElementsService: ClinicAnalysisElementsService,
    private doctorsService: DoctorsService,
    private modalController: ModalController,
    private authService: AuthService,
    private reproductionTestsService: ReproductionTestsService
  ) { }

  async ngOnInit() {
    this.presentLoading();
    this.id = this.activatedRoute.snapshot.params.id;

    // SUJETO
    this.subjectsService.getSubjectData(this.id).then(data => {
      this.subject = data.data(); // Datos del sujeto
      if (this.subject.history) {
        this.history = this.subject.history;
      }
      this.getAssistanceReports(); // Reportes de asistente
    })

    console.log();

    this.userSub = this.authService.user$.subscribe(data => {
      this.isAdmin = data.isAdmin
    })

    await this.getImageTestElements();
    this.getSubjectImageTests(); // Pruebas de imagen del sujeto
    this.getReproductionTests();
    this.getClinicAnalysisElements().then(() => {
      this.getAnalyticStudy(); // Pruebas analíticas del sujeto
    }); // Elementos de prueba clínica

    // COLECCIONES DE BASE DE DATOS
    this.getCategories(); // Categorías
    this.getLabels(); // Etiquetas 
    this.getSignsAndSypmtoms(); // Signos y síntomas
    this.getDiseases(); // Enfermedades
    this.getImageTestElements(); // Elementos de prueba de imagen
  }

  getAssistanceReports() {
    this.assistantReportsSub = this.assistantReportsService.getAllBySubject(this.id).subscribe((data) => {
      this.assistantReports = data.sort((a, b) => {
        if (moment(a.date) < moment(b.date)) {
          return 1;
        }
        if (moment(a.date) > moment(b.date)) {
          return -1;
        }
        return 0;
      });;
      console.log(this.assistantReports);
    })
  }

  combineTests() {
    if (this.history.signsAndSymptoms) {
      this.combinedTests = [...this.history.signsAndSymptoms, ...this.subjectAnaliticStudies, ...this.imageTests, ...this.reproductionTests];
    } else {
      this.combinedTests = [...this.subjectAnaliticStudies, ...this.imageTests, ...this.reproductionTests];
    }
    console.log(this.combinedTests);
  }


  excludeTest(excluded: boolean, item: any) {
    console.log(excluded);
    console.log(item);
    if (excluded) {
      this.excludedTests.push(item);
    } else {
      this.excludedTests = this.excludedTests.filter(element => element !== item);
    }
    console.log(this.excludedTests);
  }

  async createReport() {
    this.presentLoading();

    await this.getSubjectImageTests(); // Pruebas de  del sujeto
    await this.getAnalyticStudy(); // Pruebas analíticas del sujeto
    this.confirmedDiseases = [];
    this.loadingController.dismiss();
    const diseases = await this.createDiagnosis();
    console.log("diagnosis creada");

    console.log(this.imageBiomarkers, "IMAGE BIOMARKERS");

    console.log(this.reproductionBiomarkers, "REPRODUCTION BIOMARKERS");

    this.assistantReportsService.create({
      subjectId: this.id,
      diseases: diseases || [],
      confirmedDiseases: this.confirmedDiseases,
      date: moment().format(),
      signsAndSymptoms: this.history && this.history.signsAndSymptoms ? this.history.signsAndSymptoms : [],
      imageBiomarkers: this.imageBiomarkers || [],
      reproductionBiomarkers: this.reproductionBiomarkers || [],
      analyticBiomarkers: this.analyticBiomarkers || [],
    })
      .then(() => {
        this.toastService.show("success", "Informe creado con éxito");
        this.selectReport(0);
      })
      .catch((error) => {
        this.toastService.show("danger", "Error al crear el informe: " + error);
      })
  }

  async createDiagnosis(): Promise<any> {
    console.log("creando diagnosis");

    // RECOPILACIÓN DE BIOMARCADORES POSITIVOS

    console.log(this.subject, "sujeto");

    // Historial
    console.log(this.history, "history");

    // Edad y sexo
    if (this.history) {
      const birthdate = this.history.birthdate || null
      const age = this.history.age || null;
      const genre = this.history.genre || null;
    }

    // Pruebas de laboratorio
    console.log(this.subjectAnaliticStudies, "analy");

    // Quitar las excluídas 
    if (this.exclusion) {
      this.subjectAnaliticStudies = this.subjectAnaliticStudies.filter(element => !this.excludedTests.includes(element.id));
    }

    for await (const analysis of this.subjectAnaliticStudies) {
      analysis.values.forEach(element => {
        if (element.status === "high" || element.status === "low") {
          this.analyticBiomarkers.push(element)
        }
      });
    }
    console.log(this.analyticBiomarkers, "biomarcadores positivos de analítica");


    // PRUEBAS DE IMAGEN
    console.log(this.imageTests, "image");

    // Quitar las excluidas
    if (this.exclusion) {
      this.imageTests = this.imageTests.filter(element => !this.excludedTests.includes(element.id));
    }

    for await (const test of this.imageTests) {
      if (test.status === "positive") {
        test.values.forEach(element => {
          if (element.status === "positive") {
            this.imageBiomarkers.push(element);
          }
        });
      }
    }
    console.log(this.imageBiomarkers, "biomarcadores positivos de imagen");

    // Reproducción

    // Quitar las excluídas
    if (this.exclusion) {
      this.reproductionTests = this.reproductionTests.filter(element => !this.excludedTests.includes(element.id));
    }

    for await (const test of this.reproductionTests) {
      if (test.status === "positive") {
        test.values.forEach(element => {
          if (element.status === "positive") {
            this.reproductionBiomarkers.push({
              id: element.id,
              name: test.name,
              status: element.status,
              value: element.value
            });
          }
        });
      }
    }
    console.log(this.reproductionBiomarkers, "biomarcadores positivos de reproducción");


    // Quitar las excluídas de history
    if (this.exclusion) {
      this.history.signsAndSymptoms = this.history.signsAndSymptoms.filter(element => !this.excludedTests.includes(element.id));
    }

    // RECOPILACIÓN DE ENFERMEDADES RELACIONADAS CON ESOS BIOMARCADORES POSITIVOS

    // ANÁLISIS
    let analysisDiseases = [];
    let analysisDiseasesWithoutFrecuencies = [];
    let relatedAnalysisBiomarkerFoundDiseases = [];
    let relatedAnalysisBiomarkerFoundDiseasesWithValues = [];

    for await (const biomarker of this.analyticBiomarkers) {
      const biomarkerData = this.clinicAnalysisElements.find(element => element.id == biomarker.id);
      let biomarkerFound = false;

      if (biomarker.format && biomarker.format == 'actualpacs') { // ANÁLISIS DESDE ACTUALPACS
        this.originalDiseases.forEach(disease => {
          if (disease.analysisElements) {
            disease.analysisElements.forEach(biom => {
              if (biom.id === biomarker.id) {
                let isRelevant = false;
                let ponderation = 0;

                // TRATAMIENTO NORMAL DEL ELEMENTO EN UNA ENFERMEDAD PERO SIN VALORES
                biomarkerFound = true;

                if (biom.condition) {
                  ponderation = parseInt(biom.condition);
                }

                if (biom.relevancy) {
                  if (biom.relevancy == "both" && (biomarker.status == "high" || biomarker.status == "low")) {
                    isRelevant = true;
                  } else if (biom.relevancy == "superior" && biomarker.status == "high") {
                    isRelevant = true;
                  } else if (biom.relevancy == "inferior" && biomarker.status == "low") {
                    isRelevant = true;
                  }
                }

                if (ponderation == 5 && isRelevant) {
                  console.log("PONDERACIÓN", ponderation);
                  if (!this.confirmedDiseases.map(el => el = el.disease).includes(disease.id)) {
                    this.confirmedDiseases.push({ disease: disease.id, name: disease.name, value: biomarker.status, ponderation: ponderation });
                  } else {
                    this.confirmedDiseases.filter(el => el.disease === disease.id)[0].value = this.confirmedDiseases.filter(el => el.disease === disease.id)[0].value + "," + biomarker.status;
                  }

                  if (!relatedAnalysisBiomarkerFoundDiseasesWithValues.some(element => element.disease == disease.id && element.value == element && element.ponderation == ponderation)) {
                    relatedAnalysisBiomarkerFoundDiseases.push(disease.id);
                    relatedAnalysisBiomarkerFoundDiseasesWithValues.push({ disease: disease.id, value: biomarker.status, ponderation: ponderation, testName: biomarker.name });
                  }

                }

                if (ponderation > 1 && ponderation < 5 && isRelevant) {
                  console.log("PONDERACIÓN", ponderation);

                  if (!relatedAnalysisBiomarkerFoundDiseasesWithValues.some(element => element.disease == disease.id && element.value == element && element.ponderation == ponderation)) {
                    relatedAnalysisBiomarkerFoundDiseases.push(disease.id);
                    relatedAnalysisBiomarkerFoundDiseasesWithValues.push({ disease: disease.id, value: biomarker.status, ponderation: ponderation, testName: biomarker.name });
                  }
                }

                if (ponderation == 1 && isRelevant) {
                  console.log("PONDERACIÓN", ponderation);
                  if (!this.excludedDiseases.map(el => el = el.disease).includes(disease.id)) {
                    this.excludedDiseases.push({ disease: disease.id, name: disease.name, testName: biomarker.name });
                  }
                }

              }
            });
          }
        })
      } else { // ANÁLISIS DESDE ONE-ME
        this.originalDiseases.forEach(disease => {
          if (disease.analysisElements) {
            disease.analysisElements.forEach(biom => {
              if (biom.id === biomarker.id) {
                let isRelevant = false;
                let ponderation = 0;

                if (biom.ranges.length > 0) {
                  // TO DO: TRATAR LOS RANGOS PERSONALIZADOS
                  console.log("ENTRO CON RANGOS EN: ", biom);

                  biomarkerFound = true;

                  if (biom.condition) {
                    ponderation = parseInt(biom.condition);
                  }

                  biom.ranges.forEach(range => {
                    if (range.relevancy) {
                      if (range.relevancy == "both" && (biomarker.value <= range.LIM_INF || biomarker.value >= range.LIM_SUP)) {
                        isRelevant = true;
                      } else if (range.relevancy == "superior" && biomarker.value >= range.LIM_SUP) {
                        isRelevant = true;
                      } else if (range.relevancy == "inferior" && biomarker.value <= range.LIM_INF) {
                        isRelevant = true;
                      }

                      if (ponderation == 5 && isRelevant) {
                        console.log("PONDERACIÓN", ponderation);
                        if (!this.confirmedDiseases.map(el => el = el.disease).includes(disease.id)) {
                          this.confirmedDiseases.push({ disease: disease.id, name: disease.name, value: biomarker.value, ponderation: ponderation });
                        } else {
                          this.confirmedDiseases.filter(el => el.disease === disease.id)[0].value = this.confirmedDiseases.filter(el => el.disease === disease.id)[0].value + "," + biomarker.value;
                        }

                        if (!relatedAnalysisBiomarkerFoundDiseasesWithValues.some(element => element.disease == disease.id && element.value == element && element.ponderation == ponderation)) {
                          relatedAnalysisBiomarkerFoundDiseases.push(disease.id);
                          relatedAnalysisBiomarkerFoundDiseasesWithValues.push({ disease: disease.id, value: biomarker.value, ponderation: ponderation, testName: biomarker.name });
                        }

                      }

                      if (ponderation > 1 && ponderation < 5 && isRelevant) {
                        console.log("PONDERACIÓN", ponderation);

                        if (!relatedAnalysisBiomarkerFoundDiseasesWithValues.some(element => element.disease == disease.id && element.value == element && element.ponderation == ponderation)) {
                          relatedAnalysisBiomarkerFoundDiseases.push(disease.id);
                          relatedAnalysisBiomarkerFoundDiseasesWithValues.push({ disease: disease.id, value: biomarker.value, ponderation: ponderation, testName: biomarker.name });
                        }
                      }

                      if (ponderation == 1 && isRelevant) {
                        console.log("PONDERACIÓN", ponderation);
                        if (!this.excludedDiseases.map(el => el = el.disease).includes(disease.id)) {
                          this.excludedDiseases.push({ disease: disease.id, name: disease.name, testName: biomarker.name });
                        }
                      }
                    }

                  });


                } else { // TRATAMIENTO NORMAL DEL ELEMENTO EN UNA ENFERMEDAD
                  biomarkerFound = true;

                  if (biom.condition) {
                    ponderation = parseInt(biom.condition);
                  }

                  if (biom.relevancy) {
                    if (biom.relevancy == "both" && (biomarker.status == "high" || biomarker.status == "low")) {
                      isRelevant = true;
                    } else if (biom.relevancy == "superior" && biomarker.status == "high") {
                      isRelevant = true;
                    } else if (biom.relevancy == "inferior" && biomarker.status == "low") {
                      isRelevant = true;
                    }
                  }

                  if (ponderation == 5 && isRelevant) {
                    console.log("PONDERACIÓN", ponderation);
                    if (!this.confirmedDiseases.map(el => el = el.disease).includes(disease.id)) {
                      this.confirmedDiseases.push({ disease: disease.id, name: disease.name, value: biomarker.value, ponderation: ponderation });
                    } else {
                      this.confirmedDiseases.filter(el => el.disease === disease.id)[0].value = this.confirmedDiseases.filter(el => el.disease === disease.id)[0].value + "," + biomarker.value;
                    }

                    if (!relatedAnalysisBiomarkerFoundDiseasesWithValues.some(element => element.disease == disease.id && element.value == element && element.ponderation == ponderation)) {
                      relatedAnalysisBiomarkerFoundDiseases.push(disease.id);
                      relatedAnalysisBiomarkerFoundDiseasesWithValues.push({ disease: disease.id, value: biomarker.value, ponderation: ponderation, testName: biomarker.name });
                    }

                  }

                  if (ponderation > 1 && ponderation < 5 && isRelevant) {
                    console.log("PONDERACIÓN", ponderation);

                    if (!relatedAnalysisBiomarkerFoundDiseasesWithValues.some(element => element.disease == disease.id && element.value == element && element.ponderation == ponderation)) {
                      relatedAnalysisBiomarkerFoundDiseases.push(disease.id);
                      relatedAnalysisBiomarkerFoundDiseasesWithValues.push({ disease: disease.id, value: biomarker.value, ponderation: ponderation, testName: biomarker.name });
                    }
                  }

                  if (ponderation == 1 && isRelevant) {
                    console.log("PONDERACIÓN", ponderation);
                    if (!this.excludedDiseases.map(el => el = el.disease).includes(disease.id)) {
                      this.excludedDiseases.push({ disease: disease.id, name: disease.name, testName: biomarker.name });
                    }
                  }
                }
              }
            });
          }
        })
      }

      if (biomarkerFound) {
        analysisDiseases = analysisDiseases.concat(relatedAnalysisBiomarkerFoundDiseases);
        relatedAnalysisBiomarkerFoundDiseases = [...new Set([...analysisDiseases, ...relatedAnalysisBiomarkerFoundDiseases])]
        analysisDiseasesWithoutFrecuencies = [...new Set([...analysisDiseases, ...relatedAnalysisBiomarkerFoundDiseases])]
      }

    }
    console.log(analysisDiseases, "bruto de de enfermedades relacionadas con los biomarcadores positivos de análisis");
    console.log(analysisDiseasesWithoutFrecuencies, "total de enfermedades relacionadas con los biomarcadores positivos de analisis");
    console.log(relatedAnalysisBiomarkerFoundDiseasesWithValues, "analisis con valores");



    // IMAGEN
    let imageDiseases = [];
    let imageDiseasesWithoutFrecuencies = [];
    let relatedBiomarkerFoundDiseases = [];
    let relatedBiomarkerFoundDiseasesWithValues = [];

    console.log(this.imageTestsElements, "previo for");

    for await (const biomarker of this.imageBiomarkers) {
      // console.log(biomarker, "biomarcador de imagen para evaluar enfermedades");

      const biomarkerData = this.imageTestsElements.find(element => element.id === biomarker.id);
      // console.log(biomarkerData, "datos del biomarcador");

      let biomarkerFound = false;

      // si biomarkerFound tengo que buscar en las enfermedades para ver qué elements son y comparar el value

      this.originalDiseases.forEach(disease => {
        if (disease.imageBiomarkers) {
          disease.imageBiomarkers.forEach(biom => {
            if (biom.id === biomarker.id) {
              biomarker.value.forEach(element => {
                if (biom.values.includes(element)) {
                  const index = biom.values.findIndex(el => el === element);

                  console.log("ENCONTRADO", element);

                  biomarkerFound = true;

                  if (biom.conditions) {
                    const ponderation = biom.conditions[index];

                    if (ponderation == 5) {
                      if (!this.confirmedDiseases.map(el => el = el.disease).includes(disease.id)) {
                        this.confirmedDiseases.push({ disease: disease.id, name: disease.name, value: element, ponderation: ponderation });
                      } else {
                        this.confirmedDiseases.filter(el => el.disease === disease.id)[0].value = this.confirmedDiseases.filter(el => el.disease === disease.id)[0].value + "," + element;
                      }

                      if (!relatedBiomarkerFoundDiseasesWithValues.some(element => element.disease == disease.id && element.value == element && element.ponderation == ponderation)) {
                        relatedBiomarkerFoundDiseases.push(disease.id);
                        relatedBiomarkerFoundDiseasesWithValues.push({ disease: disease.id, value: element, ponderation: ponderation, testName: biomarker.name });
                      }

                    }

                    if (ponderation > 1 && ponderation < 5) {
                      if (!relatedBiomarkerFoundDiseasesWithValues.some(element => element.disease == disease.id && element.value == element && element.ponderation == ponderation)) {
                        relatedBiomarkerFoundDiseases.push(disease.id);
                        relatedBiomarkerFoundDiseasesWithValues.push({ disease: disease.id, value: element, ponderation: ponderation, testName: biomarker.name });
                      }
                    }

                    if (ponderation == 1) {
                      if (!this.excludedDiseases.map(el => el = el.disease).includes(disease.id)) {
                        this.excludedDiseases.push({ disease: disease.id, name: disease.name, testName: biomarker.name });
                      }
                    }
                  }


                }
              })
            }
          });
        }
      })

      if (biomarkerFound) {
        imageDiseases = imageDiseases.concat(relatedBiomarkerFoundDiseases);
        relatedBiomarkerFoundDiseases = [...new Set([...imageDiseases, ...relatedBiomarkerFoundDiseases])]
        imageDiseasesWithoutFrecuencies = [...new Set([...imageDiseases, ...relatedBiomarkerFoundDiseases])]
      }

    }

    console.log(relatedBiomarkerFoundDiseases);
    console.log(relatedBiomarkerFoundDiseasesWithValues);
    console.log(imageDiseases, "bruto de de enfermedades relacionadas con los biomarcadores positivos de imagen");

    console.log(imageDiseasesWithoutFrecuencies, "total de enfermedades relacionadas con los biomarcadores positivos de imagen");

    // REPRODUCCION
    let reproductionDiseases = [];
    let reproductionDiseasesWithoutFrecuencies = [];
    let relatedReproBiomarkerFoundDiseases = [];
    let relatedReproBiomarkerFoundDiseasesWithValues = [];

    for await (const biomarker of this.reproductionBiomarkers) {
      console.log(biomarker, "biomarcador de imagen para evaluar enfermedades");

      const biomarkerData = this.imageTestsElements.find(element => element.id === biomarker.id);
      console.log(biomarkerData, "datos del biomarcador");

      let biomarkerFound = false;

      // si biomarkerFound tengo que buscar en las enfermedades para ver qué elements son y comparar el value

      this.originalDiseases.forEach(disease => {
        if (disease.imageBiomarkers) {
          disease.imageBiomarkers.forEach(biom => {
            if (biom.id === biomarker.id) {
              console.log(biom.id, biomarker.id);
              console.log(biomarker);

              if (typeof biomarker.value == "string" || typeof biomarker.value == "number") {
                if (biom.values.includes(biomarker.value)) {
                  console.log("SE ENCUENTRA EL VALOR", biomarker.value);
                  const index = biom.values.findIndex(el => el === biomarker.value);
                  biomarkerFound = true;

                  if (biom.conditions) {
                    const ponderation = biom.conditions[index];

                    if (ponderation == 5) {
                      if (!this.confirmedDiseases.map(el => el = el.disease).includes(disease.id)) {
                        this.confirmedDiseases.push({ disease: disease.id, name: disease.name, value: biomarker.value, ponderation: ponderation });
                      } else {
                        this.confirmedDiseases.filter(el => el.disease === disease.id)[0].value = this.confirmedDiseases.filter(el => el.disease === disease.id)[0].value + "," + biomarker.value;
                      }
                      if (!relatedReproBiomarkerFoundDiseasesWithValues.some(element => element.disease == disease.id && element.value == element && element.ponderation == ponderation)) {
                        relatedReproBiomarkerFoundDiseases.push(disease.id);
                        relatedReproBiomarkerFoundDiseasesWithValues.push({ disease: disease.id, value: biomarker.value, ponderation: ponderation, testName: biomarker.name });
                      }
                    }

                    if (ponderation > 1 && ponderation < 5) {
                      if (!relatedReproBiomarkerFoundDiseasesWithValues.some(element => element.disease == disease.id && element.value == element && element.ponderation == ponderation)) {
                        relatedReproBiomarkerFoundDiseases.push(disease.id);
                        relatedReproBiomarkerFoundDiseasesWithValues.push({ disease: disease.id, value: biomarker.value, ponderation: ponderation, testName: biomarker.name });
                      }
                    }

                    if (ponderation == 1) {
                      if (!this.excludedDiseases.map(el => el = el.disease).includes(disease.id)) {
                        this.excludedDiseases.push({ disease: disease.id, name: disease.name });
                      }
                    }
                  }

                }
              } else {
                biomarker.value.forEach(element => {
                  console.log("VALOR DEL BIOMARCADOR DE REPRODUCCIÓN", element);

                  if (biom.values.includes(element)) {
                    console.log("SE ENCUENTRA EL VALOR", element);
                    const index = biom.values.findIndex(el => el === element);
                    biomarkerFound = true;

                    if (biom.conditions) {
                      const ponderation = biom.conditions[index];

                      if (ponderation == 5) {
                        if (!this.confirmedDiseases.map(el => el = el.disease).includes(disease.id)) {
                          this.confirmedDiseases.push({ disease: disease.id, name: disease.name, value: element, ponderation: ponderation });
                        } else {
                          this.confirmedDiseases.filter(el => el.disease === disease.id)[0].value = this.confirmedDiseases.filter(el => el.disease === disease.id)[0].value + "," + element;
                        }
                        if (!relatedReproBiomarkerFoundDiseasesWithValues.some(element => element.disease == disease.id && element.value == element && element.ponderation == ponderation)) {
                          relatedReproBiomarkerFoundDiseases.push(disease.id);
                          relatedReproBiomarkerFoundDiseasesWithValues.push({ disease: disease.id, value: element, ponderation: ponderation, testName: biomarker.name });
                        }
                      }

                      if (ponderation > 1 && ponderation < 5) {
                        if (!relatedReproBiomarkerFoundDiseasesWithValues.some(element => element.disease == disease.id && element.value == element && element.ponderation == ponderation)) {
                          relatedReproBiomarkerFoundDiseases.push(disease.id);
                          relatedReproBiomarkerFoundDiseasesWithValues.push({ disease: disease.id, value: element, ponderation: ponderation, testName: biomarker.name });
                        }
                      }

                      if (ponderation == 1) {
                        if (!this.excludedDiseases.map(el => el = el.disease).includes(disease.id)) {
                          this.excludedDiseases.push({ disease: disease.id, name: disease.name });
                        }
                      }
                    }

                  }
                })
              }


            }
          });
        }
      })

      if (biomarkerFound) {
        reproductionDiseases = reproductionDiseases.concat(relatedReproBiomarkerFoundDiseases);
        relatedBiomarkerFoundDiseases = [...new Set([...reproductionDiseases, ...relatedReproBiomarkerFoundDiseases])]
        reproductionDiseasesWithoutFrecuencies = [...new Set([...reproductionDiseases, ...relatedReproBiomarkerFoundDiseases])]
      }
    }
    console.log(reproductionDiseases, "bruto de de enfermedades relacionadas con los biomarcadores positivos de reproduccion");


    console.log(reproductionDiseasesWithoutFrecuencies, "total de enfermedades relacionadas con los biomarcadores positivos de reproducción");

    // SIGNOS Y SÍNTOMAS
    let signsDiseases = [];
    let signsDiseasesWithoutFrecuencies = [];
    let relatedSignsFoundDiseases = [];
    let relatedSignsFoundDiseasesWithValues = [];

    if (this.history && this.history.signsAndSymptoms) {
      for await (const sign of this.history.signsAndSymptoms) {
        const signData = this.signsAndSymptoms.find(element => element.id == sign.id);

        let biomarkerFound = false;

        this.originalDiseases.forEach(disease => {
          if (disease.signsAndSymptoms) {
            disease.signsAndSymptoms.forEach(biom => {
              if (biom.id === sign.id) {
                let ponderation = 0;

                biomarkerFound = true;
                if (biom.condition) {
                  ponderation = biom.condition;
                }

                if (biom.ponderation) {
                  ponderation = biom.ponderation;
                }

                if (ponderation == 5) {
                  if (!this.confirmedDiseases.map(el => el = el.disease).includes(disease.id)) {
                    this.confirmedDiseases.push({ disease: disease.id, name: disease.name, value: sign.name, ponderation: ponderation });
                  } else {
                    this.confirmedDiseases.filter(el => el.disease === disease.id)[0].value = this.confirmedDiseases.filter(el => el.disease === disease.id)[0].value + "," + sign.name;
                  }

                  if (!relatedSignsFoundDiseasesWithValues.some(element => element.disease == disease.id && element.value == element && element.ponderation == ponderation)) {
                    relatedSignsFoundDiseases.push(disease.id);
                    relatedSignsFoundDiseasesWithValues.push({ disease: disease.id, value: sign.name, ponderation: ponderation, testName: sign.name });
                  }

                }

                if (ponderation > 1 && ponderation < 5) {
                  if (!relatedSignsFoundDiseasesWithValues.some(element => element.disease == disease.id && element.value == element && element.ponderation == ponderation)) {
                    relatedSignsFoundDiseases.push(disease.id);
                    relatedSignsFoundDiseasesWithValues.push({ disease: disease.id, value: sign.name, ponderation: ponderation, testName: sign.name });
                  }
                }

                if (ponderation == 1) {
                  if (!this.excludedDiseases.map(el => el = el.disease).includes(disease.id)) {
                    this.excludedDiseases.push({ disease: disease.id, name: disease.name, testName: sign.name });
                  }
                }

              }
            });
          }
        })

        if (biomarkerFound) {
          signsDiseases = signsDiseases.concat(relatedSignsFoundDiseases);
          relatedSignsFoundDiseases = [...new Set([...signsDiseases, ...relatedSignsFoundDiseases])]
          signsDiseasesWithoutFrecuencies = [...new Set([...signsDiseases, ...relatedSignsFoundDiseases])]
        }
      }

      console.log(signsDiseases, "bruto de de enfermedades relacionadas con los sintomas");
      console.log(signsDiseasesWithoutFrecuencies, "total de enfermedades relacionadas con los sintomas");
    }

    return new Promise<any>(async resolve => {
      const diseases = analysisDiseases.concat(imageDiseases).concat(signsDiseases).concat(reproductionDiseases);
      const diseasesWithoutFrecuencies = [...new Set([...analysisDiseases, ...imageDiseases, ...signsDiseases, ...reproductionDiseases])]
      console.log(diseasesWithoutFrecuencies, "RESULTADO FINAL");

      const diseasesWithFrequencies = [];
      const result = [];
      diseasesWithoutFrecuencies.forEach(async dis => {
        console.log(dis);

        console.log(this.diseases.find(disease => disease.id === dis));
        if (this.diseases.find(disease => disease.id === dis)) {
          const toBePushed = this.diseases.find(disease => disease.id === dis);
          toBePushed.values = [];
          toBePushed.ponderation = 0;
          relatedAnalysisBiomarkerFoundDiseasesWithValues.forEach(relAna => { // ANÁLISIS
            if (relAna.disease === dis) {
              console.log(relAna, "REL-ANA");
              console.log(toBePushed, "DISEASE CON ANALISIS PARA VER PONDERACION");
              if (relAna.ponderation && relAna.ponderation > 2) {
                toBePushed.ponderation = toBePushed.ponderation + parseInt(relAna.ponderation);
              } else if (relAna.ponderation && relAna.ponderation == 2) {
                toBePushed.ponderation = toBePushed.ponderation - parseInt(relAna.ponderation);
              }
              toBePushed.values.push(`${relAna.testName}: ${relAna.value}`);
            }
          })
          relatedBiomarkerFoundDiseasesWithValues.forEach(rel => {
            if (rel.disease === dis) {
              console.log(rel, "REL-IMAGE");
              if (rel.ponderation && rel.ponderation > 2) {
                toBePushed.ponderation = toBePushed.ponderation + parseInt(rel.ponderation);
              } else if (rel.ponderation && rel.ponderation == 2) {
                toBePushed.ponderation = toBePushed.ponderation - parseInt(rel.ponderation);
              }
              toBePushed.values.push(`${rel.testName}: ${rel.value}`);
            }
          });
          relatedReproBiomarkerFoundDiseasesWithValues.forEach(relRepro => {
            if (relRepro.disease === dis) {
              console.log(relRepro, "REL-REPRO");
              toBePushed.values.push(`${relRepro.testName}: ${relRepro.value}`);
              if (relRepro.ponderation && relRepro.ponderation > 2) {
                toBePushed.ponderation = toBePushed.ponderation + parseInt(relRepro.ponderation);
              } else if (relRepro.ponderation && relRepro.ponderation == 2) {
                toBePushed.ponderation = toBePushed.ponderation - parseInt(relRepro.ponderation);
              }
            }
          });
          relatedSignsFoundDiseasesWithValues.forEach(relSign => {
            if (relSign.disease === dis) {
              console.log(relSign, "REL-SIGN");
              console.log(toBePushed, "DISEASE CON SINTOMAS PARA VER PONDERACION");

              toBePushed.values.push(`Signo o síntoma: ${relSign.value}`);
              if (relSign.ponderation && relSign.ponderation > 2) {
                toBePushed.ponderation = toBePushed.ponderation + parseInt(relSign.ponderation);
              } else if (relSign.ponderation && relSign.ponderation == 2) {
                toBePushed.ponderation = toBePushed.ponderation - parseInt(relSign.ponderation);
              }
            }
          })

          result.push(
            {
              id: toBePushed.id,
              name: toBePushed.name,
              values: toBePushed.values || [],
              ponderation: toBePushed.ponderation
            }
          );
        }

      })

      console.log(result);

      console.log(this.excludedDiseases, "LISTA DE DESCARTADOS");



      for await (const dis of this.excludedDiseases) {

        for await (const element of result) {

          if (element.id == dis.disease) {

            const index = result.findIndex(el => el.id === element.id);

            if (index > -1) {
              result.splice(index, 1);
            }
          }
        }
      }

      for await (const element of result) {
        element.frequency = element.values.length;
      }


      for await (const confirmedDisease of this.confirmedDiseases) {
        for await (const element of result) {
          if (element.id == confirmedDisease.disease) {
            element.confirmedFrequency = element.confirmedFrequency ? element.confirmedFrequency + 1 : 1;
          }
        }
      }

      resolve(result);
    })
  }

  async updateSignsAndSymptoms() {
    for await (const disease of this.diseases) {
      if (disease.signsAndSymptoms) {
        for await (const symptom of disease.signsAndSymptoms) {
          console.log(symptom.id, disease.id);
          this.symptomsService.updateSymptom(symptom.id, {
            relatedDiseases: firebase.firestore.FieldValue.arrayUnion(disease.id)
          })
        }
      }
    }
  }

  async updateClinicAnalysisElements() {
    for await (const disease of this.diseases) {
      if (disease.analysisElements) {
        for await (const element of disease.analysisElements) {
          if (this.clinicAnalysisElements.filter(el => el.id === element.id).length === 1) {
            await this.clinicAnalysisElementsService.updateClinicAnalysisElement(element.id, {
              relatedDiseases: firebase.firestore.FieldValue.arrayUnion(disease.id)
            })
            console.log(element.id, disease.id);
          }
        }
      }
    }
  }

  selectReport(index: number) {
    this.selectedReport = index;

    this.confirmedDiseasesList = this.assistantReports[index].diseases.filter(el => el.confirmedFrequency);

    console.log(this.confirmedDiseasesList, "LISTA DE ENFERMEDADES CONFIRMADAS CON BIOMARCADOR 5");



    this.confirmedDiseasesList = this.confirmedDiseasesList.sort((a, b) => {
      if (a.confirmedFrequency == b.confirmedFrequency) {
        if (a.ponderation < b.ponderation) {
          return 1;
        }
        if (a.ponderation > b.ponderation) {
          return -1;
        }
      }
      if (a.confirmedFrequency < b.confirmedFrequency) {
        return 1;
      }
      if (a.confirmedFrequency > b.confirmedFrequency) {
        return -1;
      }
      return 0;
    });

    this.subjectDiseases = this.assistantReports[index].diseases.filter(el => !el.confirmedFrequency);

    this.subjectDiseases = this.subjectDiseases.sort((a, b) => {
      if (a.ponderation == b.ponderation) {
        if (a.frequency < b.frequency) {
          return 1;
        }
        if (a.frequency > b.frequency) {
          return -1;
        }
      }
      if (a.ponderation < b.ponderation) {
        return 1;
      }
      if (a.ponderation > b.ponderation) {
        return -1;
      }
      return 0;
    });

    this.originalDiseases = this.assistantReports[index].diseases.filter(el => !el.confirmedFrequency).sort((a, b) => {
      if (a.ponderation == b.ponderation) {
        if (a.frequency < b.frequency) {
          return 1;
        }
        if (a.frequency > b.frequency) {
          return -1;
        }
      }
      if (a.ponderation < b.ponderation) {
        return 1;
      }
      if (a.ponderation > b.ponderation) {
        return -1;
      }
      return 0;
    });

    this.subjectDiseases.forEach(dis => {
      const relatedDisease = this.diseases.filter(element => element.id === dis.id);
    })

    console.log(this.subjectDiseases, "ENFERMEDADES DE LA LISTA DENTRO DE LA DB");

  }

  async deleteReport(index: string) {
    const alert = await this.alertController.create({
      header: "¿Estás seguro?",
      message: "Pulse aceptar para eliminar el informe",
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
            this.assistantReportsService.delete(this.assistantReports[index].id).then(() => {
              this.toastService.show("success", "Informe eliminado con éxito")
            }).catch(() => {
              this.toastService.show("danger", "No ha podido eliminarse el informe")
            })
          },
        },
      ],
    });

    await alert.present();
  }

  getAnalyticStudy(): Promise<void> {
    return new Promise(resolve => {
      this.analyticStudiesService.getAnalyticStudiesData(
        this.id
      ).then(async data => {
        this.subjectAnaliticStudies = data.docs.map(element => element = element.data());
        for await (const el of this.subjectAnaliticStudies) {
          const aux = this.clinicAnalysisElements.find(caEl => caEl.id === el.id) || null;
          if (aux && aux.relatedDiseases) {
            el.relatedDiseases = aux.relatedDiseases;
          }
        }
        resolve();
      });
    })

  }

  async getSubjectImageTests(): Promise<void> {
    return new Promise(async resolve => {
      this.imageTestsList = await this.imageTestsService.getImageTestsData();
      this.imageTestsList = this.imageTestsList.map(element => element = element.data());

      this.subjectTestsSub = this.subjectImageTestsService.getAllDataBySubjectObservable(this.subject.id).subscribe(async data => {
        this.imageTests = data;
        console.log(this.imageTests, "PRUEBAS ANTES DEL FILTRO");

        let allTests = data;

        for await (const it of this.imageTests) {
          const prueba = this.imageTestsList.filter(element => element.id === it.imageTestId);
          it.name = prueba[0].name;

          it.relatedCategories = prueba[0].relatedCategories || [];
          it.relatedLabels = prueba[0].relatedLabels || [];
        }

        for await (const it of allTests) {
          const prueba = this.imageTestsList.filter(element => element.id === it.imageTestId);
          it.name = prueba[0].name;

          it.relatedCategories = prueba[0].relatedCategories || [];
          it.relatedLabels = prueba[0].relatedLabels || [];
        }

        /*this.imageTests = this.imageTests.filter(test => {
          if (test.relatedCategories) {
            return !test.relatedCategories.map(element => element = element.name).includes("Fertilidad");
          }
          else return -1
        });*/

        console.log(this.imageTests, "Pruebas de imagen del sujeto");

        this.imageTests = this.imageTests.sort((a, b) => +new Date(b.date) - +new Date(a.date));
        this.originalImageTests = this.imageTests.sort((a, b) => +new Date(b.date) - +new Date(a.date));

        await this.getSubjectImageTestElementDetails();
        resolve();
      });
    })

  }

  async getReproductionTests(): Promise<void> {
    return new Promise(async resolve => {
      this.imageTestsList = await this.imageTestsService.getImageTestsData();
      this.imageTestsList = this.imageTestsList.map(element => element = element.data());

      this.reproductionTestsSub = this.reproductionTestsService.getAllDataBySubjectObservable(this.subject.id).subscribe(async data => {
        this.reproductionTests = data;
        let allTests = data;

        for await (const it of this.imageTests) {
          const prueba = this.imageTestsList.filter(element => element.id === it.imageTestId);
          it.name = prueba[0].name;

          it.relatedCategories = prueba[0].relatedCategories || [];
          it.relatedLabels = prueba[0].relatedLabels || [];
        }

        for await (const it of allTests) {
          const prueba = this.imageTestsList.filter(element => element.id === it.imageTestId);
          it.name = prueba[0].name;

          it.relatedCategories = prueba[0].relatedCategories || [];
          it.relatedLabels = prueba[0].relatedLabels || [];
        }

        console.log(this.reproductionTests, "Fertilidad");

        this.reproductionTests = this.reproductionTests.sort((a, b) => +new Date(b.date) - +new Date(a.date));
        this.originalReproductionTests = this.reproductionTests.sort((a, b) => +new Date(b.date) - +new Date(a.date));

        await this.getReproductionImageTestElementDetails();
        resolve();
      });
    })
  }

  async getSubjectImageTestElementDetails() {

    // Necesitamos el nombre
    for await (const imageTest of this.imageTests) {
      for await (const biomarker of imageTest.values) {
        const result = this.imageTestsElements.filter(element => element.id === biomarker.id);
        if (result.length > 0) {
          biomarker.name = result[0].name;
        }

      }
    }
    console.log(this.imageTests, "con nombre");
  }

  async getReproductionImageTestElementDetails() {


    // Necesitamos el nombre
    for await (const imageTest of this.reproductionTests) {
      for await (const biomarker of imageTest.values) {
        const result = this.imageTestsElements.filter(element => element.id === biomarker.id);
        if (result.length > 0) {
          biomarker.name = result[0].name;
        }

      }
    }
    console.log(this.imageTests, "con nombre");
  }

  async loadReproductionTestsRelatedDiseases() {
    for await (const test of this.reproductionTests) {
      // Recorremos los values
      for await (const value of test.values) {
        // Cargamos los related diseases de ese biomarker
        if (value.status === "positive") {
          // Creamos un array si no está hecho
          if (!value.relatedDiseases) {
            console.log("se crea array de relatedDiseases");
            value.relatedDiseases = [];
          }
          let relatedElement = await this.imageTestsElements.filter(element => element.id === value.id);
          relatedElement = relatedElement[0] || [];
          console.log(relatedElement, "Datos del elemento positivo relacionado");
          console.log(relatedElement.relatedDiseases, "RelatedDiseases del elemento positivo relacionado");


          if (relatedElement.relatedDiseases !== undefined && relatedElement.relatedDiseases.length > 0) {
            console.log("Hay enfermedades relacionadas para " + relatedElement.name);

            // Buscamos en cada disease si el biomarker positivo de este test está dentro de los factores positivos de la enfermedad

            for await (const disease of relatedElement.relatedDiseases) {
              console.log(disease, "Enfermedad relacionada con: " + relatedElement.name);
              const relatedDisease = this.diseases.filter(element => element.id === disease);
              if (relatedDisease.length > 0) {
                console.log(relatedDisease[0].imageBiomarkers, "Biomarcadores de la enfermedad relacionada");
                console.log("Valor que andamos buscando", value.value);


                const result = relatedDisease[0].imageBiomarkers.filter(element => (element.name === relatedElement.name) && this.compareArrays(element.values, value.value));
                if (result.length > 0) {
                  // En caso positivo metemos dentro de ese value dentro del campo relatedDiseases el nombre de la enfermedad relacionada
                  value.relatedDiseases.push(relatedDisease[0].name)
                }
              }
            }

            // Si está vacío poner la info sin diagnótico
            if (value.relatedDiseases.length === 0) {
              value.relatedDiseases.push("Sin informe relacionado");
            }

          } else {
            value.relatedDiseases.push("Sin informe relacionado");
          }

        }

      }
    }
  }

  async getImageTestElements() {
    this.imageTestsElements = (await this.imageTestsElementsService.getImageTestElementsData()).docs.map(element => element = element.data());
    console.log(this.imageTestsElements, "Elementos de pruebas de imagen");
  }

  async getClinicAnalysisElements(): Promise<void> {
    return new Promise(async resolve => {
      this.clinicAnalysisElements = (await this.clinicAnalysisElementsService.getClinicAnalysisElementsData()).docs.map(element => element = element.data());
      console.log(this.clinicAnalysisElements, "Elementos de pruebas de analisis");
      resolve();
    })
  }

  async getCategories() {
    const categories = await this.categoriesService.getAllData();
    categories.forEach(element => {
      this.categories.push(element.data());
    })
    console.log(this.categories, "Totalidad de las categorias");
  }

  async getLabels() {
    const labels = await this.labelsService.getAllData();
    labels.forEach(element => {
      this.labels.push(element.data());
    })
    console.log(this.labels, "Totalidad de las labels");
  }

  async getDiseases() {
    const diseases = await this.diseasesService.getDiseasesData();
    diseases.forEach(element => {
      this.diseases.push(element.data());
      this.originalDiseases.push(element.data());
    })
    console.log(this.diseases, "Totalidad de las enfermedades");
  }

  async getSignsAndSypmtoms() {
    const symptoms = await this.symptomsService.getSymptomsData();
    symptoms.forEach(element => {
      this.signsAndSymptoms.push(element.data());
    })
    console.log(this.signsAndSymptoms, "Totalidad de los sintomas");
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
    console.log(this.selectedCategories);
    console.log(this.selectedCategoriesIds);

    await this.filterCategories();
    this.filterLabels()
    this.queryCategory = null;
  }

  async removeCategory(index: number) {
    this.selectedCategories.splice(index, 1);
    this.selectedCategoriesIds.splice(index, 1);
    console.log(this.selectedCategories);
    console.log(this.selectedCategoriesIds);

    await this.filterCategories();
    this.filterLabels()
    this.queryCategory = null;
  }

  async addLabel(label: any) {
    this.selectedLabels.push(label);
    this.selectedLabelsIds.push(label.id);
    console.log(this.selectedLabels);
    console.log(this.selectedLabelsIds);

    await this.filterCategories();
    this.filterLabels()
    this.queryLabel = null;
  }

  async removeLabel(index: number) {
    this.selectedLabels.splice(index, 1);
    this.selectedLabelsIds.splice(index, 1);
    console.log(this.selectedCategories);
    console.log(this.selectedCategoriesIds);

    await this.filterCategories();
    this.filterLabels()
    this.queryLabel = null;
  }

  async filterCategories() {
    if (this.selectedCategoriesIds.length !== 0) {

      const newTests = [];
      // Miro en qué indices están los elementos que coinciden con la categoría
      this.subjectDiseases.forEach(test => {
        console.log(test);

        if (test.relatedCategories) {
          test.relatedCategories.forEach(category => {
            if (this.selectedCategoriesIds.includes(category.id)) {
              newTests.push(test);
            }
          });
        }
      });

      this.subjectDiseases = newTests
    } else {
      if (this.selectedLabelsIds.length === 0) {
        this.subjectDiseases = this.originalDiseases;
      }
    }
  }

  async filterLabels() {
    if (this.selectedLabelsIds.length !== 0) {

      const newTests = [];
      // Miro en qué indices están los elementos que coinciden con la categoría
      this.subjectDiseases.forEach(test => {
        if (test.relatedLabels) {
          test.relatedLabels.forEach(label => {
            if (this.selectedLabelsIds.includes(label.id)) {
              newTests.push(test);
            }
          });
        }
      });

      this.subjectDiseases = newTests
    } else {
      if (this.selectedCategoriesIds.length === 0) {
        this.subjectDiseases = this.originalDiseases;
      }
    }

  }

  removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  async compareArrays(a, b) {
    let found = false;
    for await (const elementA of a) {
      for await (const elementB of b) {
        if (elementA === elementB) {
          found = true;
        }
      }
    }
    return found;
  }

  async showDiseaseDescription(diseaseId: string) {
    const modal = await this.modalController.create({
      component: ShowDiseaseDescriptionPage,
      componentProps: {
        id: diseaseId,
        isAdmin: this.isAdmin
      },
      cssClass: "my-custom-modal-css",
      backdropDismiss: false,
    });
    return await modal.present();
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Cargando informes...',
      duration: 3000
    });
    await loading.present();
  }

  ngOnDestroy() {
    if (this.subjectTestsSub) {
      this.subjectTestsSub.unsubscribe();
    }
    if (this.assistantReportsSub) {
      this.assistantReportsSub.unsubscribe();
    }
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }

}

