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
import { DiseasesService } from 'src/app/services/diseases.service';
import { SymptomsService } from 'src/app/services/symptoms.service';
import { SubjectImageTestsService } from "src/app/services/subject-image-tests.service";
import * as moment from "moment";
import { ImageTestsElementsService } from "src/app/services/image-tests-elements.service";
import { AddReproductionTechniquePage } from "./add-reproduction-technique/add-reproduction-technique.page";
import { ShowEmbryoDetailsPage } from "./show-embryo-details/show-embryo-details.page";
import { EditReproductionTestPage } from "./edit-reproduction-test/edit-reproduction-test.page";
import { ShowAnalysisDescriptionPage } from "./show-analysis-description/show-analysis-description.page";
import { ClinicAnalysisElementsService } from "src/app/services/clinic-analysis-elements.service";
import { EditAnalyticStudyLimitsPage } from "./edit-analytic-study-limits/edit-analytic-study-limits.page";
import { ReproductionTestsService } from "src/app/services/reproduction-tests.service";
import { ImageTestContainerService } from "src/app/services/image-test-container.service";
import * as firebase from "firebase/app";
import { HttpClient } from "@angular/common/http";
import { HpoService } from "src/app/services/hpo.service";
import { ClinicsService } from "src/app/services/clinics.service";

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

  // DATOS FENOT??PICOS

  /* Actualpacs */
  actualpacsId: string;
  accessionNumber: number;
  inicialesDelSujeto: string;
  centroReferente: string;

  /* Datos biom??tricos */
  genre: string;
  birthDate: string;
  age: number;
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
  bloodType: string;
  rh: string;

  // Genes en fenot??picos
  currentGenes = [];
  genes = [];
  queryGenes = [];
  queryGenesList = [];

  /* H??bitos de vida */
  smoker: boolean;
  alcohol: boolean;
  otherDrugs: string;
  medicines: boolean;
  solarExposition: string;
  workExposition: string;
  physicalActivity: string;

  /* Enfermedades confirmadas */
  diseases = [];
  currentDiseases = [];
  queryDisease: string;
  queryDiseaseList = [];

  /* Signos y s??ntomas */
  signsAndSymptoms = [];
  currentSignsAndSymptoms = [];
  querySignsAndSymptoms: string;
  querySignsAndSymptomsList = [];

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

  // DATOS GEN??TICOS
  mutations: any;
  numberOfVariants: number;

  gridApi: any;

  columnDefs = [
    {
      headerName: "#Reported",
      field: "#Reported",
      filterParams: {
        buttons: ['reset', 'apply'], closeOnApply: true,
      },
    },
    {
      headerName: "Sample category",
      field: "Sample category",
      filterParams: {
        buttons: ['reset', 'apply'], closeOnApply: true,
      },
    },
    {
      headerName: "Comment",
      field: "Comment",
      filterParams: {
        buttons: ['reset', 'apply'], closeOnApply: true,
      },
    },
    {
      headerName: "Global review",
      field: "Global review", filterParams: {
        buttons: ['reset', 'apply'], closeOnApply: true,
      },
    },
    {
      headerName: "Prediction",
      field: "Prediction", filterParams: {
        buttons: ['reset', 'apply'], closeOnApply: true,
      },
    },
    {
      headerName: "Chr",
      field: "Chr",
      filterParams: {
        buttons: ['reset', 'apply'], closeOnApply: true,
      },
    },
    {
      headerName: "Coordinate",
      field: "Coordinate", filterParams: {
        buttons: ['reset', 'apply'], closeOnApply: true,
      },
    },
    {
      headerName: "Ref",
      field: "Ref", filterParams: {
        buttons: ['reset', 'apply'], closeOnApply: true,
      },
    },
    {
      headerName: "Alt",
      field: "Alt",
      filterParams: {
        buttons: ['reset', 'apply'], closeOnApply: true,
      },
    },
    {
      headerName: "Gene",
      field: "Gene", filterParams: {
        buttons: ['reset', 'apply'], closeOnApply: true,
      },
    },
    {
      headerName: "RefSeq ID",
      field: "RefSeq ID", filterParams: {
        buttons: ['reset', 'apply'], closeOnApply: true,
      },
    },
    {
      headerName: "Affected Exon",
      field: "Affected Exon",
      filterParams: {
        buttons: ['reset', 'apply'], closeOnApply: true,
      },
    },
    {
      headerName: "Exons Number",
      field: "Exons Number", filterParams: {
        buttons: ['reset', 'apply'], closeOnApply: true,
      },
    },
    {
      headerName: "c.Hgvs",
      field: "c.Hgvs", filterParams: {
        buttons: ['reset', 'apply'], closeOnApply: true,
      },
    },
    {
      headerName: "p.Hgvs",
      field: "p.Hgvs", filterParams: {
        buttons: ['reset', 'apply'], closeOnApply: true,
      },
    },
    {
      headerName: "Protein Effect",
      field: "Protein Effect", filterParams: {
        buttons: ['reset', 'apply'], closeOnApply: true,
      },
    },
    {
      headerName: "Region",
      field: "Region", filterParams: {
        buttons: ['reset', 'apply'], closeOnApply: true,
      },
    },
    {
      headerName: "Zygosity",
      field: "Zygosity", filterParams: {
        buttons: ['reset', 'apply'], closeOnApply: true,
      },
    },
    {
      headerName: "ID dbSNP",
      field: "ID dbSNP", filterParams: {
        buttons: ['reset', 'apply'], closeOnApply: true,
      },
    },
    {
      headerName: "Max Allele Freq",
      field: "Max Allele Freq", filterParams: {
        buttons: ['reset', 'apply'], closeOnApply: true,
      },
    },
    {
      headerName: "Max Allele Freq Origin",
      field: "Max Allele Freq Origin", filterParams: {
        buttons: ['reset', 'apply'], closeOnApply: true,
      },
    },
    {
      headerName: "ClinVar Clinical Significance",
      field: "ClinVar Clinical Significance",
      filterParams: {
        buttons: ['reset', 'apply'], closeOnApply: true,
      },
    },
    {
      headerName: "ClinVar Disease",
      field: "ClinVar Disease",
      filterParams: {
        buttons: ['reset', 'apply'], closeOnApply: true,
      },
    },
    {
      headerName: "MIM Number",
      field: "MIM Number", filterParams: {
        buttons: ['reset', 'apply'], closeOnApply: true,
      },
    },
    {
      headerName: "OMIM Phenotype",
      field: "OMIM Phenotype", filterParams: {
        buttons: ['reset', 'apply'], closeOnApply: true,
      },
    },
    {
      headerName: "OMIM Inheritance",
      field: "OMIM Inheritance", filterParams: {
        buttons: ['reset', 'apply'], closeOnApply: true,
      },
    },
    {
      headerName: "HPO Term",
      field: "HPO Term", filterParams: {
        buttons: ['reset', 'apply'], closeOnApply: true,
      },
    },
    {
      headerName: "DG Prediction",
      field: "DG Prediction", filterParams: {
        buttons: ['reset', 'apply'], closeOnApply: true,
      },
    },
    {
      headerName: "PFAM Domain",
      field: "PFAM Domain", filterParams: {
        buttons: ['reset', 'apply'], closeOnApply: true,
      },
    },
    {
      headerName: "PanelApp - Relevant Disorders",
      field: "PanelApp - Relevant Disorders", filterParams: {
        buttons: ['reset', 'apply'], closeOnApply: true,
      },
    },
    {
      headerName: "PanelApp - Disease Group",
      field: "PanelApp - Disease Group", filterParams: {
        buttons: ['reset', 'apply'], closeOnApply: true,
      },
    },
    {
      headerName: "ALoFT",
      field: "ALoFT",
      filterParams: {
        buttons: ['reset', 'apply'], closeOnApply: true,
      },
    },
    {
      headerName: "DEOGEN2",
      field: "DEOGEN2", filterParams: {
        buttons: ['reset', 'apply'], closeOnApply: true,
      },
    },

    {
      headerName: "FATHMM",
      field: "FATHMM", filterParams: {
        buttons: ['reset', 'apply'], closeOnApply: true,
      },
    },
    {
      headerName: "FATHMM-MKL",
      field: "FATHMM-MKL", filterParams: {
        buttons: ['reset', 'apply'], closeOnApply: true,
      },
    },
    {
      headerName: "FATHMM-XF",
      field: "FATHMM-XF", filterParams: {
        buttons: ['reset', 'apply'], closeOnApply: true,
      },
    },
    {
      headerName: "LRT",
      field: "LRT", filterParams: {
        buttons: ['reset', 'apply'], closeOnApply: true,
      },
    },

    {
      headerName: "Meta-LR",
      field: "Meta-LR", filterParams: {
        buttons: ['reset', 'apply'], closeOnApply: true,
      },
    },
    {
      headerName: "Meta-SVM",
      field: "Meta-SVM", filterParams: {
        buttons: ['reset', 'apply'], closeOnApply: true,
      },
    },
    {
      headerName: "Mutation Assesor",
      field: "Mutation Assesor", filterParams: {
        buttons: ['reset', 'apply'], closeOnApply: true,
      },
    },
    {
      headerName: "Mutation Taster",
      field: "Mutation Taster", filterParams: {
        buttons: ['reset', 'apply'], closeOnApply: true,
      },
    },
    {
      headerName: "Provean",
      field: "Provean", filterParams: {
        buttons: ['reset', 'apply'], closeOnApply: true,
      },
    },
    {
      headerName: "SIFT",
      field: "SIFT", filterParams: {
        buttons: ['reset', 'apply'], closeOnApply: true,
      },
    },
    {
      headerName: "SIFT 4G",
      field: "SIFT 4G", filterParams: {
        buttons: ['reset', 'apply'], closeOnApply: true,
      },
    },
    {
      headerName: "Variant Type",
      field: "Variant Type", filterParams: {
        buttons: ['reset', 'apply'], closeOnApply: true,
      },
    }
  ];

  defaultColDef = {
    resizable: true,
    sortable: true,
    filter: true,
    minWidth: 100,
  };

  // ANALISIS CL??NICOS
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
  analyticStudiesSub: Subscription;
  analyticStudies: any;
  originalAnalyticStudies: any;
  analysisElements: any;

  // FERTILIDAD

  embryos: any;
  subjectTestsSub: Subscription;
  reproductionTestsSub: Subscription;

  // ESTUDIO DE IMAGEN
  imageTests: any;
  imageTestsElements: any;
  imageTestsContainers: any;
  imageTestsContainersSub: Subscription;


  containerName: string;

  clinicData: any;

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
  originalReproductionTests: any;

  imageTestsList = [];

  reproductionTests = [];


  // ACCESOS

  phenotypicAccess = false;
  geneticAccess = false;
  reproductionAccess = false;
  analysisAccess = false;
  imageAccess = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private alertController: AlertController,
    private toastService: ToastService,
    private analyticStudiesService: AnalyticStudiesService,
    private analysisElementsService: ClinicAnalysisElementsService,
    private subjectsService: SubjectsService,
    private imageStudiesService: ImageStudiesService,
    private router: Router,
    private loadingController: LoadingController,
    private modalController: ModalController,
    public lang: LanguageService,
    private auth: AuthService,
    private doctorsService: DoctorsService,
    private categoriesService: CategoriesService,
    private labelsService: LabelsService,
    private imageTestsService: ImageTestsService,
    private diseasesService: DiseasesService,
    private symptomsService: SymptomsService,
    private subjectImageTestsService: SubjectImageTestsService,
    private imageTestsElementsService: ImageTestsElementsService,
    private reproductionTestsService: ReproductionTestsService,
    private imageTestsContainersService: ImageTestContainerService,
    private http: HttpClient,
    private hpoService: HpoService,
    private clinicService: ClinicsService
  ) { }

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.params.id;
    this.segment.value = "phenotypic-data";
    // console.log(this.segment.value);
    this.getContainers();
    this.getCategories();
    this.getLabels();
    this.getDiseases();
    this.getSignsAndSypmtoms();
    this.getImageTestElements();
  }

  ionViewDidEnter() {
    this.user$ = this.auth.user$;

    this.userSub = this.user$.subscribe((data) => {
      this.currentUserId = data.id;
      this.doctorSub = this.doctorsService
        .getDoctor(data.id)
        .subscribe((doc) => {
          this.userData = doc;
          // console.log(this.segment.value);

          this.getClinicData(this.userData.clinic);

          if (!this.userData.isAdmin && !this.userData.isOwner) {
            if (this.userData.id !== this.subject.mainDoctor && !this.userData.sharedSubjectsPhenotypic.includes(this.id)) {
              this.phenotypicAccess = true;
              this.segment.value = "phenotypic-data";
            }
            if (this.userData.id !== this.subject.mainDoctor && !this.userData.sharedSubjectsGenetic.includes(this.id)) {
              this.geneticAccess = true;
              this.segment.value = "phenotypic-data";
            }
            if (this.userData.id !== this.subject.mainDoctor && !this.userData.sharedSubjectsReproduction.includes(this.id)) {
              this.reproductionAccess = true;
              this.segment.value = "phenotypic-data";
            }
            if (this.userData.id !== this.subject.mainDoctor && !this.userData.sharedSubjectsAnalytic.includes(this.id)) {
              this.analysisAccess = true;
              this.segment.value = "phenotypic-data";
            }
            if (this.userData.id !== this.subject.mainDoctor && !this.userData.sharedSubjectsImage.includes(this.id)) {
              this.imageAccess = true;
              this.segment.value = "phenotypic-data";
            }
            this.segmentChanged(this.segment.value)
          }
        });
    });

    this.subject$ = this.subjectsService.getSubject(this.id);
    this.subjectSub = this.subject$.subscribe(async (data) => {
      this.subject = data;

      // console.log(this.subject);

      this.identifier = this.subject.identifier;
      this.numberOfVariants = this.subject.numberOfVariants;
      this.mutations = this.subject.mutations;
      this.hasClinicAnalysis = this.subject.hasClinicAnalysis;
      if (this.subject.embriology) {
        this.embryos = this.subject.embriology;
        // console.log(this.embryos);
      }
      if (data.history) {
        const history = data.history;
        this.actualpacsId = history.actualpacsId;
        this.accessionNumber = history.accesionNumber;
        this.inicialesDelSujeto = history.inicialesDelSujeto;
        this.centroReferente = history.centroReferente;
        this.genre = history.genre;
        this.birthDate = history.birthDate;
        this.age = history.age;
        this.height = history.height;
        this.weight = history.weight;
        this.populationGroup = history.populationGroup;
        this.skin = history.skin;
        this.hair = history.hair;
        this.eyes = history.eyes;
        this.imc = history.imc;
        this.bloodType = history.bloodType;
        this.rh = history.rh;
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
        this.otherBackground = history.otherBackground || this.searchOtherBackground;
        this.currentTreatment = history.currentTreatment;
        if (history.diseases) {
          this.currentDiseases = history.diseases;
        }
        if (history.signsAndSymptoms) {
          this.currentSignsAndSymptoms = history.signsAndSymptoms;
        }
        if (history.genes) {
          this.currentGenes = history.genes;
        }
        if (this.birthDate) {
          this.calculateAge();
        }
      }

      // Carga de pruebas de imagen
      this.getSubjectImageTests();

    });


  }

  async getClinicData(clinicId: string) {
    this.clinicData = (await this.clinicService.getData(clinicId)).data();
  }

  async getSubjectImageTests() {
    this.imageTestsList = await this.imageTestsService.getImageTestsData();
    this.imageTestsList = this.imageTestsList.map(element => element = element.data());

    this.getReproductionTests();

    this.subjectTestsSub = this.subjectImageTestsService.getAllDataBySubjectObservable(this.subject.id).subscribe(async data => {
      this.imageTests = data;

      for await (const it of this.imageTests) {
        const prueba = this.imageTestsList.filter(element => element.id === it.imageTestId);
        it.name = prueba[0].name;
        it.relatedCategories = prueba[0].relatedCategories || [];
        it.relatedLabels = prueba[0].relatedLabels || [];
      }

      console.log(this.imageTests, "Pruebas de imagen del sujeto");

      this.imageTests = this.imageTests.sort((a, b) => {
        if (a.date == b.date) {
          if (a.createdAt < b.createdAt) {
            return 1;
          }
          if (a.createdAt > b.createdAt) {
            return -1;
          }
        }
        if (a.date < b.date) {
          return 1;
        }
        if (a.date > b.date) {
          return -1;
        }
        return 0;
      });
      this.originalImageTests = this.imageTests.sort((a, b) => {
        if (a.date == b.date) {
          if (a.createdAt < b.createdAt) {
            return 1;
          }
          if (a.createdAt > b.createdAt) {
            return -1;
          }
        }
        if (a.date < b.date) {
          return 1;
        }
        if (a.date > b.date) {
          return -1;
        }
        return 0;
      });

      await this.getSubjectImageTestElementDetails();
    });

  }

  async getReproductionTests() {
    this.reproductionTestsSub = this.reproductionTestsService.getAllDataBySubjectObservable(this.subject.id).subscribe(async data => {
      this.reproductionTests = data;

      for await (const it of this.reproductionTests) {
        const prueba = this.imageTestsList.filter(element => element.id === it.imageTestId);
        it.name = prueba[0].name;

        it.relatedCategories = prueba[0].relatedCategories || [];
        it.relatedLabels = prueba[0].relatedLabels || [];
      }

      // console.log(this.reproductionTests, "Fertilidad");

      this.reproductionTests = this.reproductionTests.sort((a, b) => a.order - b.order);
      this.originalReproductionTests = this.reproductionTests.sort((a, b) => a.order - b.order);

      await this.getReproductionTestElementDetails();
    });
  }

  async loadReproductionTestsRelatedDiseases() {
    for await (const test of this.reproductionTests) {
      // Recorremos los values
      for await (const value of test.values) {
        // Cargamos los related diseases de ese biomarker
        if (value.status === "positive") {
          // Creamos un array si no est?? hecho
          if (!value.relatedDiseases) {
            // console.log("se crea array de relatedDiseases");
            value.relatedDiseases = [];
          }
          let relatedElement = await this.imageTestsElements.filter(element => element.id === value.id);
          relatedElement = relatedElement[0] || [];
          // console.log(relatedElement, "Datos del elemento positivo relacionado");
          // console.log(relatedElement.relatedDiseases, "RelatedDiseases del elemento positivo relacionado");


          if (relatedElement.relatedDiseases !== undefined && relatedElement.relatedDiseases.length > 0) {
            // console.log("Hay enfermedades relacionadas para " + relatedElement.name);

            // Buscamos en cada disease si el biomarker positivo de este test est?? dentro de los factores positivos de la enfermedad

            for await (const disease of relatedElement.relatedDiseases) {
              // console.log(disease, "Enfermedad relacionada con: " + relatedElement.name);
              const relatedDisease = this.diseases.filter(element => element.id === disease);
              if (relatedDisease.length > 0) {
                // console.log(relatedDisease[0].imageBiomarkers, "Biomarcadores de la enfermedad relacionada");
                // console.log("Valor que andamos buscando", value.value);


                const result = relatedDisease[0].imageBiomarkers.filter(element => (element.name === relatedElement.name) && this.compareArrays(element.values, value.value));
                if (result.length > 0) {
                  // En caso positivo metemos dentro de ese value dentro del campo relatedDiseases el nombre de la enfermedad relacionada
                  value.relatedDiseases.push(relatedDisease[0].name)
                }
              }
            }

            // Si est?? vac??o poner la info sin diagn??tico
            if (value.relatedDiseases.length === 0) {
              value.relatedDiseases.push("Sin diagn??stico relacionado");
            }

          } else {
            value.relatedDiseases.push("Sin diagn??stico relacionado");
          }

        }

      }
    }
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

    this.getReproductionTestElementDetails();
  }

  async getReproductionTestElementDetails() {
    // Necesitamos el nombre
    for await (const imageTest of this.reproductionTests) {
      for await (const biomarker of imageTest.values) {
        const result = this.imageTestsElements.filter(element => element.id === biomarker.id);
        if (result.length > 0) {
          biomarker.name = result[0].name;
        }
      }
    }
    // console.log(this.reproductionTests, "con nombre");

    await this.loadReproductionTestsRelatedDiseases();
  }

  async getImageTestElements() {
    this.imageTestsElements = (await this.imageTestsElementsService.getImageTestElementsData()).docs.map(element => element = element.data());
    // console.log(this.imageTestsElements, "Elementos de pruebas de imagen");
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

  async getDiseases() {
    const diseases = await this.diseasesService.getDiseasesData();
    diseases.forEach(element => {
      this.diseases.push(element.data());
    })
    // console.log(this.diseases, "Totalidad de las enfermedades");

  }

  async getSignsAndSypmtoms() {
    const symptoms = await this.symptomsService.getSymptomsData();
    symptoms.forEach(element => {
      this.signsAndSymptoms.push(element.data());
    })
  }

  onCategoryChange(input: string) {
    if (input.length > 0) {
      this.suggestedCategories = this.categories.filter(cat =>
        this.removeAccents(cat.name.trim().toLowerCase()).includes(this.removeAccents(input.trim().toLowerCase()))
      );
    } else {
      this.suggestedCategories = null;
    }
  }

  onLabelChange(input: string) {
    if (input.length > 0) {
      this.suggestedLabels = this.labels.filter(lab =>
        this.removeAccents(lab.name.trim().toLowerCase()).includes(this.removeAccents(input.trim().toLowerCase()))
      );
    } else {
      this.suggestedLabels = null;
    }
  }

  onAETitleChange(input: string) {
    if (input.length > 0) {
      this.imageTests.filter(test =>
        this.removeAccents(test.AETitle.trim().toLowerCase()).includes(this.removeAccents(input.trim().toLowerCase()))
      );
    } else {
      this.imageTests = this.originalImageTests;
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

  async addCategoryAnalysis(category: any) {
    this.selectedCategories.push(category);
    this.selectedCategoriesIds.push(category.id);
    await this.filterCategoriesAnalysis();
    this.filterLabelsAnalysis()
    this.queryCategory = null;
  }

  async removeCategoryAnalysis(index: number) {
    this.selectedCategories.splice(index, 1);
    this.selectedCategoriesIds.splice(index, 1);
    await this.filterCategoriesAnalysis();
    this.filterLabelsAnalysis()
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

  async addLabelAnalysis(label: any) {
    this.selectedLabels.push(label);
    this.selectedLabelsIds.push(label.id);
    await this.filterCategoriesAnalysis();
    this.filterLabelsAnalysis()
    this.queryLabel = null;
  }

  async removeLabelAnalysis(index: number) {
    this.selectedLabels.splice(index, 1);
    this.selectedLabelsIds.splice(index, 1);
    await this.filterCategoriesAnalysis();
    this.filterLabelsAnalysis()
    this.queryLabel = null;
  }

  async filterCategories() {
    if (this.segment.value === "epigenetic-study") {
      if (this.selectedCategoriesIds.length !== 0) {
        // console.log(this.selectedCategories);

        const newTests = [];
        // Miro en qu?? indices est??n los elementos que coinciden con la categor??a
        this.reproductionTests.forEach(test => {
          test.relatedCategories.forEach(category => {
            if (this.selectedCategoriesIds.includes(category.id)) {
              newTests.push(test);
            }
          });
        });

        this.reproductionTests = newTests
      } else {
        if (this.selectedLabelsIds.length === 0) {
          this.reproductionTests = this.originalReproductionTests;
        }
      }
    } else {
      if (this.selectedCategoriesIds.length !== 0) {
        // console.log(this.selectedCategories);

        const newTests = [];
        // Miro en qu?? indices est??n los elementos que coinciden con la categor??a
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

  }

  async filterCategoriesAnalysis() {
    if (this.selectedCategoriesIds.length !== 0) {
      // console.log(this.selectedCategories);

      let newTests = [];
      // Miro en qu?? indices est??n los elementos que coinciden con la categor??a
      this.analyticStudies.forEach(test => {

        test.values.forEach(value => {
          const filteredElement = this.analysisElements.find(element => element.id === value.id);
          if (filteredElement && filteredElement.relatedCategories) {
            filteredElement.relatedCategories.forEach(category => {
              if (this.selectedCategoriesIds.includes(category.id)) {
                value.relevant = true;
                newTests.push(test);
              } else {
                value.relevant = false;
              }
            });
          }
        });
      });

      newTests = [...new Set(newTests)];
      this.analyticStudies = [...newTests];

    } else {
      if (this.selectedLabelsIds.length === 0) {
        // console.log("reseteo desde categories");
        this.analyticStudies = [...this.originalAnalyticStudies];
      }
    }
  }

  async filterLabels() {
    if (this.segment.value === "epigenetic-study") {
      if (this.selectedLabelsIds.length !== 0) {
        //console.log(this.selectedCategories);

        const newTests = [];
        // Miro en qu?? indices est??n los elementos que coinciden con la categor??a
        this.reproductionTests.forEach(test => {
          test.relatedLabels.forEach(label => {
            if (this.selectedLabelsIds.includes(label.id)) {
              newTests.push(test);
            }
          });
        });

        this.reproductionTests = newTests
      } else {
        if (this.selectedCategoriesIds.length === 0) {
          this.reproductionTests = this.originalReproductionTests;
        }
      }
    } else {
      if (this.selectedLabelsIds.length !== 0) {
        //console.log(this.selectedCategories);

        const newTests = [];
        // Miro en qu?? indices est??n los elementos que coinciden con la categor??a
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

  }

  async filterLabelsAnalysis() {


    console.log(this.selectedLabelsIds);

    if (this.selectedLabelsIds.length !== 0) {
      let newTests = [];

      this.analyticStudies.forEach(test => {
        test.values.forEach(value => {
          const filteredElement = this.analysisElements.find(element => element.id === value.id);

          // console.log(filteredElement);

          if (filteredElement && filteredElement.relatedLabels) {
            filteredElement.relatedLabels.forEach(label => {
              if (this.selectedLabelsIds.includes(label.id)) {
                // console.log("relevante");
                // console.log(value);

                value.relevant = true;
                newTests.push(test);
              } else {
                if (!value.relevant) {
                  value.relevant = false;
                }
              }
            });
          }
        });
      });

      newTests = [...new Set(newTests)];
      this.analyticStudies = [...newTests];

    } else {
      if (this.selectedLabelsIds.length === 0) {
        // console.log("reseteo desde label");
        this.analyticStudies = [...this.originalAnalyticStudies];
      }
    }

    /*
    if (this.selectedCategoriesIds.length !== 0) {
      // console.log(this.selectedCategories);

      let newTests = [];
      // Miro en qu?? indices est??n los elementos que coinciden con la categor??a
      this.analyticStudies.forEach(test => {

        test.values.forEach(value => {
          const filteredElement = this.analysisElements.find(element => element.id === value.id);
          if (filteredElement && filteredElement.relatedCategories) {
            filteredElement.relatedCategories.forEach(category => {
              if (this.selectedCategoriesIds.includes(category.id)) {
                value.relevant = true;
                newTests.push(test);
              } else {
                value.relevant = false;
              }
            });
          }
        });
      });

      newTests = [...new Set(newTests)];
      this.analyticStudies = [...newTests];

    } else {
      if (this.selectedLabelsIds.length === 0) {
        console.log("reseteo desde categories");
        this.analyticStudies = [...this.originalAnalyticStudies];
      }
    }
     */

  }

  isFiltered() {
    if (this.selectedCategories.length > 0 || this.selectedLabels.length > 0) {
      return true
    } else {
      return false;
    }
  }

  removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  async loadGeneticData(event?: any): Promise<any> {
    /*
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
    */

    const loading = await this.loadingController.create(null);

    await loading.present();

    const result: any = await this.http.post("https://couchdb.radiewcare-apps.es/genetic-data/_find", {
      "selector": {
        "subjectId": {
          "$eq": this.id
        }
      },
      "limit": 999999
    }, {
      headers: {
        Authorization: "Basic YXBpOkFQSV9jYXJlMjAyMA=="
      }
    }).toPromise();

    console.log(result);

    this.geneticStudy = result.docs;

    this.numberOfVariants = this.geneticStudy.length;

    console.log(this.geneticStudy);

    loading.dismiss();

  }

  async loadGeneticMore(event: any): Promise<any> {
    const loading = await this.loadingController.create(null);
    loading.present();
    this.page = this.page + 50;
    this.loadGeneticData(event).then(() => {
      loading.dismiss();
    });
  }

  async getAnalyticStudy() {
    this.analyticStudy$ = this.analyticStudiesService.getAnalyticStudies(
      this.id
    );

    this.analyticStudiesSub = this.analyticStudy$.subscribe(data => {
      this.analyticStudies = data;
      // console.log(this.analyticStudies, "An??lisis cl??nicos");

      this.originalAnalyticStudies = [...data];
      // console.log(this.originalAnalyticStudies, "An??lisis cl??nicos originales");
    })

    this.analysisElements = (await this.analysisElementsService.getClinicAnalysisElementsData()).docs.map(element => element = element.data());
    // console.log(this.analysisElements, "Elementos de an??lisis");
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
        // console.log(this.currentAnalysisValues);

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
      header: "??Est??s seguro?",
      message: "Pulse aceptar para eliminar el an??lisis",
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
                  "An??lisis cl??nico eliminado con ??xito"
                );
                this.currentAnalysis = undefined;
              })
              .catch(() => {
                this.toastService.show(
                  "danger",
                  "Error al eliminar el an??lisis cl??nico"
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
      header: "??Est??s seguro?",
      message: "Pulse aceptar para eliminar el an??lisis",
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
                  "An??lisis cl??nico eliminado con ??xito"
                );
                this.currentAnalysis = undefined;
              })
              .catch(() => {
                this.toastService.show(
                  "danger",
                  "Error al eliminar el an??lisis cl??nico"
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
      header: "??Est??s seguro?",
      message: "Pulse aceptar para eliminar",
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
            this.subjectImageTestsService.delete(this.imageTests[index].id).then(() => {
              // this.imageTests.splice(index, 1);
              if (this.imageTests.length === 0) {
                this.subjectsService.updateSubject(this.id, {
                  hasImageAnalysis: false,
                });
              }
              this.toastService.show(
                "success",
                "Prueba eliminada con ??xito"
              );
              console.log(this.imageTests);
            })
              .catch(() => {
                this.toastService.show(
                  "danger",
                  "Error al eliminar la prueba"
                );
              });
          },
        },
      ],
    });

    await alert.present();
  }

  // CONTENEDORES

  async getContainers() {
    this.imageTestsContainersSub = this.imageTestsContainersService.getAllBySubject(this.id).subscribe((data) => {
      this.imageTestsContainers = data.sort((a, b) => {
        if (a.createdAt < b.createdAt) {
          return 1;
        }
        if (a.createdAt > b.createdAt) {
          return -1;
        }
        return 0;
      });;
      console.log(this.imageTestsContainers);
    });
  }

  createContainer() {
    if (this.containerName && this.containerName.trim().length > 0) {
      this.imageTestsContainersService.create({
        name: this.containerName,
        subjectId: this.id,
        tests: []
      }).then(() => {
        this.toastService.show("success", "Contenedor creado con ??xito");
        this.containerName = null;
      }).catch((error) => {
        this.toastService.show("danger", "Error al crear contenedor: " + error)
      })
    } else {
      this.toastService.show("danger", "Nombre del contenedor incorrecto");
    }
  }

  deleteContainer(container: any) {
    if (container.tests && container.tests.length === 0) {
      this.imageTestsContainersService.delete(container.id)
        .then(() => {
          this.toastService.show("success", "Contenedor eliminado con ??xito")
        }).catch((error) => {
          this.toastService.show("danger", "Error al eliminar contenedor: " + error)
        });
    } else {
      this.toastService.show("danger", "Debes extraer antes todas las pruebas que contiene");
    }
  }

  insertImageTest(imageTestId: string, selectedContainer: any) {
    console.log(imageTestId);
    console.log(event);


    this.imageTestsContainersService.update(selectedContainer, {
      tests: firebase.firestore.FieldValue.arrayUnion(imageTestId)
    }).then(() => {
      this.subjectImageTestsService.update(imageTestId, {
        isContained: true
      });
      this.toastService.show("success", "Test insertado con ??xito");
    }).catch((error) => {
      console.log(error);

      this.toastService.show("danger", "Error al insertar test: " + error)
    })
  }

  extractImageTest(containerId: string, imageTestId: string) {
    console.log(containerId, imageTestId);

    this.imageTestsContainersService.update(containerId, {
      tests: firebase.firestore.FieldValue.arrayRemove(imageTestId)
    }).then(() => {
      this.subjectImageTestsService.update(imageTestId, {
        isContained: false
      });
      this.toastService.show("success", "Test extra??do con ??xito")
    }).catch((error) => {
      console.log(error);

      this.toastService.show("danger", "Error al extraer test: " + error)
    })
  }

  // FIN DE CONTENEDORES

  async deleteReproductionTest(index: number) {
    const alert = await this.alertController.create({
      header: "??Est??s seguro?",
      message: "Pulse aceptar para eliminar",
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
            this.reproductionTestsService.delete(this.reproductionTests[index].id).then(() => {
              if (this.reproductionTests.length === 0) {
                this.subjectsService.updateSubject(this.id, {
                  hasReproductionTests: false,
                });
              }
              this.toastService.show(
                "success",
                "Prueba eliminada con ??xito"
              );
              console.log(this.imageTests);
            })
              .catch(() => {
                this.toastService.show(
                  "danger",
                  "Error al eliminar la prueba"
                );
              });
          },
        },
      ],
    });

    await alert.present();
  }

  addSignAndSymptom(signAndSypmtom: any) {
    this.currentSignsAndSymptoms.push({ id: signAndSypmtom.id, name: signAndSypmtom.name });
    this.querySignsAndSymptomsList = [];
    this.querySignsAndSymptoms = null;
  }

  deleteSignAndSymptoms(index: any) {
    // console.log(index);
    // console.log(this.currentSignsAndSymptoms);
    this.currentSignsAndSymptoms.splice(index, 1);
  }

  onQuerySignsAndSymptoms(query: string) {
    this.querySignsAndSymptomsList = this.signsAndSymptoms.filter(element => this.removeAccents(element.name.trim().toLowerCase()).includes(this.removeAccents(query.trim().toLowerCase())));
    // console.log(this.querySignsAndSymptomsList);
  }

  // Genes

  async onQueryGenes(query: string) {
    this.queryGenesList = (await this.hpoService.search(query)).genes;
    console.log(this.queryGenesList);
  }

  addGene(gene: any) {
    this.currentGenes.push({ id: gene.entrezGeneId, name: gene.entrezGeneSymbol });
    this.queryGenesList = [];
    this.queryGenes = null;

    // Introducir enfermedades seg??n genes
    this.fillDiseasesByGene(gene.entrezGeneId);
  }

  deleteGene(index: any) {
    this.currentGenes.splice(index, 1);
  }

  async fillDiseasesByGene(id: number) {
    console.log(this.currentDiseases);

    const diseases = (await this.diseasesService.getByGene(id)).docs.map(element => {
      return { name: element.data().name, id: element.data().id }
    })
    this.currentDiseases = this.currentDiseases.concat(diseases);
  }

  addDisease(disease: any) {
    this.currentDiseases.push({ id: disease.id, name: disease.name });
    this.queryDiseaseList = [];
    this.queryDisease = null;
  }

  deleteDisease(index: any) {
    this.currentDiseases.splice(index, 1);
  }

  onDiseaseQueryChange(query: string) {
    this.queryDiseaseList = this.diseases.filter(element => this.removeAccents(element.name.trim().toLowerCase()).includes(this.removeAccents(query.trim().toLowerCase())));
  }

  save() {
    this.savePhenotypic()
  }

  async savePhenotypic(): Promise<any> {
    // Calcular edad si es necesario

    this.calculateAge();

    const data = {
      actualpacsId: this.actualpacsId || null,
      inicialesDelSujeto: this.inicialesDelSujeto || null,
      centroReferente: this.centroReferente || null,
      genre: this.genre || null,
      birthDate: this.birthDate || null,
      age: this.age || null,
      height: this.height || null,
      weight: this.weight || null,
      populationGroup: this.populationGroup || null,
      skin: this.skin || null,
      hair: this.hair || null,
      eyes: this.eyes || null,
      imc: this.imc || null,
      bloodType: this.bloodType || null,
      rh: this.rh || null,
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
      signsAndSymptoms: this.currentSignsAndSymptoms || [],
      diseases: this.currentDiseases || [],
      genes: this.currentGenes
    };

    if (this.identifier.length > 0) {
      await this.subjectsService
        .updateSubject(this.id, { identifier: this.identifier, history: data, embriology: this.embryos || null })
        .then(() => {
          this.toastService.show(
            "success",
            "Datos del sujeto actualizados con ??xito"
          );
        })
        .catch((error) => {
          this.toastService.show(
            "danger",
            "Error al actualizar los datos del sujeto"
          );
        });
    } else {
      this.toastService.show("danger", "El identificador no puede estar vac??o");
    }
  }

  async saveReproductionMark(index: number, checked: boolean) {
    console.log(index, checked);
    this.subjectImageTestsService.update(this.reproductionTests[index].id, {
      isReproductionTest: checked
    })
      .then(() => {
        this.toastService.show("success", "Guardado con ??xito");
      })
      .catch(() => {
        this.toastService.show("danger", "Error al guardar");
      });
  }

  calculateAge() {
    if (this.age && !this.birthDate) {
      // Calcular fecha de nacimiento
      const fecha = moment().subtract(this.age, 'years');
      // console.log(fecha);
      this.birthDate = moment(fecha).format();
    } else if (this.birthDate && !this.age) {
      // Calcular edad
      const edad = moment().diff(this.birthDate, 'years', false);
      // console.log(edad);
      this.age = edad;
    } else if (this.birthDate && this.age) {
      const edad = moment().diff(this.birthDate, 'years', false);
      if (edad > this.age) {
        this.age = edad;
      }
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

  async openQuibim(id: string) {
    const modal = await this.modalController.create({
      component: EditQuibimPage,
      componentProps: {
        id: id
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
        subject: this.subject,
        clinic: this.clinicData.name,
        doctor: this.userData.name
      },
      cssClass: "my-custom-modal-css",
    });
    return await modal.present();
  }

  async showAddAnalytic() {
    if (this.subject.history && this.subject.history.genre && (this.subject.history.age || this.subject.history.birthDate)) {
      const modal = await this.modalController.create({
        component: AddAnalyticStudyPage,
        componentProps: {
          id: this.id,
        },
        cssClass: "my-custom-modal-css",
        backdropDismiss: false,
      });
      return await modal.present();
    } else {
      this.toastService.show("danger", "No se pueden crear anal??sis cl??nicos hasta que la edad y el sexo sean rellenados");
    }
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

  async showEditAnalyticWithLimits(testId: string) {
    const modal = await this.modalController.create({
      component: EditAnalyticStudyLimitsPage,
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
        id: this.id, // Id del sujeto
      },
      cssClass: "my-custom-modal-css",
      backdropDismiss: false,
    });
    return await modal.present();
  }

  async showAddReproductionTest() {
    const modal = await this.modalController.create({
      component: AddReproductionTechniquePage,
      componentProps: {
        id: this.id, // Id del sujeto
      },
      cssClass: "my-custom-modal-css"
    });
    return await modal.present();
  }

  async showEmbryoDetails(i: number, j: number) {
    const modal = await this.modalController.create({
      component: ShowEmbryoDetailsPage,
      componentProps: {
        embryoData: this.embryos[i].samples[j], // Datos del embri??n
      },
      cssClass: "my-custom-modal-css"
    });
    return await modal.present();
  }

  async deleteEmbryo(i: number, j: number) {

    const embryo = this.embryos[i].samples[j];
    // console.log(embryo);

    this.embryos[i].samples.splice(j, 1);
    // console.log(this.embryos);

  }

  async showImageTest(testId: string) {
    const modal = await this.modalController.create({
      component: EditImageStudyPage,
      componentProps: {
        id: testId
      },
      cssClass: "my-custom-modal-css",
      backdropDismiss: false,
    });
    return await modal.present();
  }

  async showReproductionTest(testId: string) {
    const modal = await this.modalController.create({
      component: EditReproductionTestPage,
      componentProps: {
        id: testId
      },
      cssClass: "my-custom-modal-css",
      backdropDismiss: false,
    });
    return await modal.present();
  }

  async showAnalysisDescription(elementId: string, isAdmin: boolean) {
    const modal = await this.modalController.create({
      component: ShowAnalysisDescriptionPage,
      componentProps: {
        id: elementId,
        isAdmin: isAdmin
      },
      cssClass: "my-custom-modal-css",
      backdropDismiss: false,
    });
    return await modal.present();
  }

  doReorder(ev: any) {
    const item = this.reproductionTests.splice(ev.detail.from, 1)[0];
    this.reproductionTests.splice(ev.detail.to, 0, item);
    let index = 0;
    this.reproductionTests.forEach(element => {
      element.order = index;
      index = index + 1;
    });
    ev.detail.complete();
    // console.log(this.reproductionTests);
    this.reproductionTests.forEach(test => {
      this.subjectImageTestsService.update(test.id, test);
    })
    this.toastService.show("success", "Pruebas ordenadas con ??xito");
  }

  async import(): Promise<any> { }

  async delete(): Promise<any> {
    const alert = await this.alertController.create({
      header: "??Est??s seguro?",
      message:
        "Pulse aceptar para eliminar el sujeto. Se eliminar??n todos los datos asociados.",
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
                    "Sujeto eliminado con ??xito"
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
    this.gridApi.autoSizeColumns(this.columnDefs, false)()
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

  async searchOtherBackground() {
    let background: string;

    for await (const element of this.imageTests) {
      if (element.otherBackground) {
        background = element.otherBackground;
      }
    }

    return background || null;
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
    this.toastService.show("success", "C??digo copiado al portapapeles");
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
    if (this.subjectTestsSub) {
      this.subjectTestsSub.unsubscribe();
    }
    if (this.analyticStudiesSub) {
      this.analyticStudiesSub.unsubscribe();
    }
    if (this.reproductionTestsSub) {
      this.reproductionTestsSub.unsubscribe();
    }
    if (this.imageTestsContainersSub) {
      this.imageTestsContainersSub.unsubscribe();
    }
  }
}
