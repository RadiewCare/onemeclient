import { Component, OnInit, OnDestroy } from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { LanguageService } from "src/app/services/language.service";
import { AuthService } from "src/app/services/auth.service";
import { DoctorsService } from "src/app/services/doctors.service";
import { SubjectsService } from "src/app/services/subjects.service";
import * as moment from "moment";
import { SubjectImageTestsService } from "src/app/services/subject-image-tests.service";
import { ReproductionTestsService } from "src/app/services/reproduction-tests.service";
import { ActivatedRoute } from "@angular/router";
import { LoadingController } from "@ionic/angular";

@Component({
  selector: "app-subjects",
  templateUrl: "./subjects.page.html",
  styleUrls: ["./subjects.page.scss"],
})
export class SubjectsPage implements OnInit, OnDestroy {
  user$: any;
  userData: any;
  userSub: Subscription;

  subjects: any;
  querySubjects: any;
  subjects$: Observable<any>;
  subjectsSub: Subscription;

  showShared: false;

  sharedSubjectsAnalytic: string[];
  sharedSubjectsGenetic: string[];
  sharedSubjectsImage: string[];
  sharedSubjectsPhenotypic: string[];
  sharedSubjectsReproduction: string[];

  sharedSubjects = [];

  sharedSubjectsData = [];
  originalSharedSubjectsData = [];

  centrosReferentes = [];

  originalSubjects: any;

  lastSubjects: any;

  currentCentros: any;
  currentFecha: any;
  currentOrder: any;
  currentQuery: any;

  initialDate: any;
  finalDate: any;

  order: string = "ninguno";

  currentDate: any;
  intervalDate: any;
  filterInterval = "always";

  aWeekAgo: any;
  twoWeeksAgo: any;
  aMonthAgo: any;
  threeMonthsAgo: any;
  sixMonthsAgo: any;
  aYearAgo: any;
  fiveYearsAgo: any;

  id: string;

  doctorName: string;

  doctorData: any;

  isSameClinic = false;

  constructor(
    private subjectsService: SubjectsService,
    private doctorsService: DoctorsService,
    private subjectImageTestsService: SubjectImageTestsService,
    private reproductionTestsService: ReproductionTestsService,
    public lang: LanguageService,
    private auth: AuthService,
    private activatedRoute: ActivatedRoute,
    private loadingController: LoadingController
  ) { }

  ngOnInit(): void {
    this.presentLoading();
  }

  async ionViewDidEnter() {

    if (this.activatedRoute.snapshot.params.id) {
      console.log("LÓGICA DESDE ADMINISTRADOR");

      this.id = this.activatedRoute.snapshot.params.id;

      this.userSub = this.auth.user$.subscribe(async (data) => {
        this.userData = data;
        const userDoctor = (await this.doctorsService.getDoctorData(this.userData.id)).data();
        this.doctorData = (await this.doctorsService.getDoctorData(this.id)).data();
        this.isSameClinic = this.doctorData.clinic === userDoctor.clinic;
        console.log(this.userData);
        console.log(this.doctorData);
        console.log(userDoctor);

        await this.getSubjectsFromDoctorId();

        this.loadingController.dismiss();

        this.sortDateDesc();
        this.getCentrosReferentes();
      });
    } else {
      console.log("LÓGICA NORMAL");

      this.userSub = this.auth.user$.subscribe(async (data) => {
        this.userData = data;
        this.doctorData = (await this.doctorsService.getDoctorData(this.userData.id)).data();
        console.log(this.userData);
        console.log(this.doctorData);

        this.getSubjects().then(() => {
          this.sortDateDesc();
          this.getCentrosReferentes();
          this.loadingController.dismiss();
        });
        this.getDoctorData();
      });
    }
    // this.updateReproductionTestsExistence();
    this.getCurrentDate();
  }

  getCurrentDate() {
    console.log("getCurrentDate");

    this.currentDate = moment().format();
    this.aWeekAgo = moment().subtract(7, 'days').format();
    this.twoWeeksAgo = moment().subtract(15, 'days').format();
    this.aMonthAgo = moment().subtract(1, 'months').format();
    this.threeMonthsAgo = moment().subtract(3, 'months').format();
    this.sixMonthsAgo = moment().subtract(6, 'months').format();
    this.aYearAgo = moment().subtract(12, 'months').format();
    this.fiveYearsAgo = moment().subtract(5, 'years').format();
  }

  getDoctorData() {
    console.log("getDoctorData");

    this.doctorsService.getDoctorData(this.userData.id).then((data) => {
      this.sharedSubjectsPhenotypic =
        data.data().sharedSubjectsPhenotypic || [];
      this.sharedSubjectsGenetic = data.data().sharedSubjectsGenetic || [];
      this.sharedSubjectsAnalytic = data.data().sharedSubjectsAnalytic || [];
      this.sharedSubjectsImage = data.data().sharedSubjectsImage || [];
      this.sharedSubjectsReproduction = data.data().sharedSubjectsReproduction || [];
      this.getSharedSubjects();
    });
  }

  getSubjectsWithLimit(): Promise<void> {
    this.querySubjects = null;
    this.subjects$ = this.subjectsService.getSubjectsByDoctorLimit(this.userData.id);
    return new Promise((resolve) => {
      this.subjectsSub = this.subjects$.subscribe((subjects) => {
        this.subjects = subjects;
        this.originalSubjects = subjects;
        resolve(subjects);
      });
    });
  }

  async getSubjects(): Promise<void> {
    console.log("getSubjects");

    this.querySubjects = null;
    this.subjects = (await this.subjectsService.getSubjectsByDoctorData(this.userData.id)).docs.map(element => element.data());
    this.originalSubjects = [...this.subjects];

    console.log(this.subjects);
    console.log(this.subjects.length, "TAMAÑO DE LOS SUJETOS");

    /*
    this.subjects$ = this.subjectsService.getSubjectByDoctor(this.userData.id);
    return new Promise(async(resolve) => {
      this.subjects = await this.subjectsService.getSubjectsByDoctorData(this.userData.id);
      
      this.subjectsSub = this.subjects$.subscribe((subjects) => {
        this.subjects = subjects;
        this.originalSubjects = subjects;
        resolve(subjects);
      });
      
    });
    */
  }

  getSubjectsFromDoctorId(): Promise<void> {
    console.log("getSubjectsFromDoctorId");

    this.querySubjects = null;
    this.subjects$ = this.subjectsService.getSubjectByDoctor(this.id);
    return new Promise((resolve) => {
      this.subjectsSub = this.subjects$.subscribe((subjects) => {
        this.subjects = subjects;
        this.originalSubjects = subjects;
        resolve(subjects);
      });
    });
  }

  async updateImageAnalysisExistence(): Promise<void> {
    for await (const sujeto of this.subjects) {
      if (!sujeto.hasImageAnalysis && sujeto.subjectImageTests && sujeto.subjectImageTests.length > 0) {
        console.log(sujeto.id);

        await this.subjectsService.updateSubject(sujeto.id, { hasImageAnalysis: true });
      }
    }
    console.log("Done");
  }

  async updateReproductionTestsExistence(): Promise<void> {
    return new Promise(async resolve => {
      console.log();
      const aux = (await this.subjectImageTestsService.getAllDataByWithReproduction()).docs
      console.log(aux);
      aux.forEach(el => {
        console.log(el.data());
        this.reproductionTestsService.create(el.data()).then(() => {
          console.log(el.data());
        })
      })
    })
  }

  sortAlphanumeric() {
    console.log("sortAlphanumeric");

    var reA = /[^a-zA-Z]/g;
    var reN = /[^0-9]/g;

    if (this.querySubjects) {
      this.querySubjects = this.subjects.sort((a, b) => {
        var aA = a.identifier.toLowerCase().replace(reA, "");
        var bA = b.identifier.toLowerCase().replace(reA, "");
        if (aA === bA) {
          var aN = parseInt(a.identifier.replace(reN, ""), 10);
          var bN = parseInt(b.identifier.replace(reN, ""), 10);
          return aN === bN ? 0 : aN > bN ? 1 : -1;
        } else {
          return aA > bA ? 1 : -1;
        }
      });
    } else {
      this.subjects = this.subjects.sort((a, b) => {
        var aA = a.identifier.toLowerCase().replace(reA, "");
        var bA = b.identifier.toLowerCase().replace(reA, "");
        if (aA === bA) {
          var aN = parseInt(a.identifier.replace(reN, ""), 10);
          var bN = parseInt(b.identifier.replace(reN, ""), 10);
          return aN === bN ? 0 : aN > bN ? 1 : -1;
        } else {
          return aA > bA ? 1 : -1;
        }
      });
    }
  }

  sortDateAsc() {
    console.log("sortDateAsc");

    this.subjects = this.subjects.sort((a, b) => {
      return <any>new Date(a.createdAt) - <any>new Date(b.createdAt);
    });
    this.originalSubjects = this.originalSubjects.sort((a, b) => {
      return <any>new Date(a.createdAt) - <any>new Date(b.createdAt);
    });
  }

  sortDateDesc() {
    console.log("sortDateDesc");
    this.subjects = this.subjects.sort((a, b) => {
      return <any>new Date(b.createdAt) - <any>new Date(a.createdAt);
    });
    this.originalSubjects = this.originalSubjects.sort((a, b) => {
      return <any>new Date(b.createdAt) - <any>new Date(a.createdAt);
    });
  }

  async getCentrosReferentes() {
    for await (const element of this.subjects) {
      if (
        element.history &&
        element.history.centroReferente &&
        !this.centrosReferentes.includes(element.history.centroReferente)
      ) {
        this.centrosReferentes.push(element.history.centroReferente);
      }
    }
    this.centrosReferentes.sort();
  }

  async getSharedSubjects() {
    this.sharedSubjects = await this.sharedSubjectsAnalytic
      .concat(this.sharedSubjectsGenetic, this.sharedSubjectsPhenotypic, this.sharedSubjectsImage, this.sharedSubjectsReproduction)

    this.sharedSubjects = [... new Set(this.sharedSubjects)];

    for await (const sub of this.sharedSubjects) {
      await this.subjectsService.getSubjectData(sub).then((userData) => {
        this.sharedSubjectsData.push(userData.data());
      });
    }

    this.originalSharedSubjectsData = [... this.sharedSubjectsData];
  }

  onSearchChange(query: string): void {
    this.currentQuery = query;
    if (query.length > 0) {
      this.querySubjects = this.subjects.filter((subject) =>
        this.removeAccents(subject.identifier.toLowerCase()).includes(this.removeAccents(query.toLowerCase()))
      );
      this.sharedSubjectsData = this.sharedSubjectsData.filter((sharedSubject) =>
        this.removeAccents(sharedSubject.identifier.toLowerCase()).includes(this.removeAccents(query.toLowerCase()))
      );
    } else {
      this.querySubjects = null;
      this.sharedSubjectsData = this.originalSharedSubjectsData;
    }
  }

  removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  onDateFilterChange(fechaInicial: string, fechaFinal: string): Promise<void> {
    if (fechaInicial && fechaFinal) {
      return new Promise((resolve) => {
        this.subjects = this.subjects.filter((subject) => {
          let a = moment(subject.createdAt);
          let b = moment(fechaInicial)
          let c = moment(fechaFinal);
          return b < a && a < c;
        })
        console.log(this.subjects);

        resolve();
      })
    }
  }

  onCentroChange(centros: string): Promise<void> {
    console.log(centros);
    console.log(this.currentCentros, "current");


    if (centros && centros.length === 0) {
      return new Promise(resolve => {
        resolve();
      })
    } else {
      return new Promise(resolve => {
        if (centros) {
          this.subjects = this.subjects.filter((subject) => {
            return (
              subject.history &&
              subject.history &&
              centros.includes(subject.history.centroReferente)
            );
          });

        }
        resolve();
      })
    }
  }

  onDateChange(order: string): void {
    this.order = order;

    if (order === "asc") {
      this.sortDateAsc();
    } else if (order === "desc") {
      this.sortDateDesc();
    } else {
      this.sortDateDesc();
    }
  }

  async onIntervalFilterChange(): Promise<void> {
    console.log(this.filterInterval);

    return new Promise(resolve => {
      switch (this.filterInterval) {
        case "always":
          this.onDateFilterChange(this.fiveYearsAgo, this.currentDate);
          resolve();
          break;

        case "1week":
          this.onDateFilterChange(this.aWeekAgo, this.currentDate);
          resolve();
          break;

        case "2weeks":
          this.onDateFilterChange(this.twoWeeksAgo, this.currentDate);
          resolve();
          break;

        case "1month":
          this.onDateFilterChange(this.aMonthAgo, this.currentDate);
          resolve();
          break;

        case "3months":
          this.onDateFilterChange(this.threeMonthsAgo, this.currentDate);
          resolve();
          break;

        case "6months":
          this.onDateFilterChange(this.sixMonthsAgo, this.currentDate);
          resolve();
          break;

        case "1year":
          this.onDateFilterChange(this.aYearAgo, this.currentDate);
          resolve();
          break;

        default:
          break;
      }

    })
  }

  async filterSubjects() {
    this.subjects = this.originalSubjects;

    // Filtro de fecha
    await this.onDateFilterChange(this.initialDate, this.finalDate)

    // Filtro de centros
    await this.onCentroChange(this.currentCentros)

    // Ordenamiento
    await this.onDateChange(this.currentOrder)

    // Dentro del rango
    await this.onIntervalFilterChange();

  }

  async resetFilters() {
    this.subjects = this.originalSubjects;
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      message: 'Cargando...'
    });
    await loading.present();
  }


  ngOnDestroy(): void {
    if (this.subjectsSub) {
      this.subjectsSub.unsubscribe();
    }
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }
}
