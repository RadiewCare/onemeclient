import { Component, OnInit, OnDestroy } from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { LanguageService } from "src/app/services/language.service";
import { AuthService } from "src/app/services/auth.service";
import { DoctorsService } from "src/app/services/doctors.service";
import { SubjectsService } from "src/app/services/subjects.service";
import * as moment from "moment";

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

  sharedSubjectsAnalytic: string[];
  sharedSubjectsGenetic: string[];
  sharedSubjectsImage: string[];
  sharedSubjectsPhenotypic: string[];

  sharedSubjects = [];

  sharedSubjectsData = [];

  centrosReferentes = [];

  originalSubjects: any;

  lastSubjects: any;

  currentCentros: any;
  currentFecha: any;
  currentOrder: any;
  currentQuery: any;

  order: string = "ninguno";

  constructor(
    private subjectsService: SubjectsService,
    private doctorsService: DoctorsService,
    public lang: LanguageService,
    private auth: AuthService
  ) { }

  ngOnInit(): void { }

  ionViewDidEnter() {
    this.userSub = this.auth.user$.subscribe((data) => {
      this.userData = data;
      this.getSubjects().then(() => {
        this.sortAlphanumeric();
        this.getCentrosReferentes();
      });
      this.getDoctorData();
    });
  }

  getDoctorData() {
    this.doctorsService.getDoctorData(this.userData.id).then((data) => {
      this.sharedSubjectsPhenotypic =
        data.data().sharedSubjectsPhenotypic || [];

      this.sharedSubjectsGenetic = data.data().sharedSubjectsGenetic || [];

      this.sharedSubjectsAnalytic = data.data().sharedSubjectsAnalytic || [];

      this.sharedSubjectsImage = data.data().sharedSubjectsImage || [];

      this.getSharedSubjects();
    });
  }

  getSubjects(): Promise<any> {
    this.querySubjects = null;
    this.subjects$ = this.subjectsService.getSubjectByDoctor(this.userData.id);
    return new Promise((resolve) => {
      this.subjectsSub = this.subjects$.subscribe((subjects) => {
        this.subjects = subjects;
        this.originalSubjects = subjects;
        resolve();
      });
    });
  }

  sortAlphanumeric() {
    var reA = /[^a-zA-Z]/g;
    var reN = /[^0-9]/g;

    if (this.querySubjects) {
      this.querySubjects = this.subjects.sort((a, b) => {
        var aA = a.identifier.replace(reA, "");
        var bA = b.identifier.replace(reA, "");
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
        var aA = a.identifier.replace(reA, "");
        var bA = b.identifier.replace(reA, "");
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
    this.subjects = this.subjects.sort((a, b) => {
      return <any>new Date(a.createdAt) - <any>new Date(b.createdAt);
    });
  }

  sortDateDesc() {
    this.subjects = this.subjects.sort((a, b) => {
      return <any>new Date(b.createdAt) - <any>new Date(a.createdAt);
    });
  }

  getCentrosReferentes() {
    this.subjects.forEach((element) => {
      if (
        element.history &&
        element.history.centroReferente &&
        !this.centrosReferentes.includes(element.history.centroReferente)
      ) {
        this.centrosReferentes.push(element.history.centroReferente);
      }
    });
  }

  async getSharedSubjects() {
    this.sharedSubjects = await this.sharedSubjectsAnalytic
      .concat(this.sharedSubjectsGenetic)
      .concat(this.sharedSubjectsPhenotypic)
      .concat(this.sharedSubjectsImage)
      .filter((item, pos, self) => {
        return self.indexOf(item) === pos;
      });

    for await (const sub of this.sharedSubjects) {
      await this.subjectsService.getSubjectData(sub).then((userData) => {
        this.sharedSubjectsData.push(userData.data());
      });
    }
  }

  onSearchChange(query: string): void {
    this.currentQuery = query;
    if (query.length > 0) {
      this.querySubjects = this.subjects.filter((report) =>
        report.identifier.toLowerCase().includes(query.toLowerCase())
      );
    } else {
      this.querySubjects = null;
    }
  }

  onDateFilterChange(fecha: string) {
    return new Promise((resolve) => {
      this.subjects = this.subjects.filter((subject) => {
        let a = moment(subject.createdAt)
        let b = moment(fecha);
        return a < b;
      })
      resolve();
    })
  }

  onCentroChange(centros: string): Promise<any> {
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
      this.sortAlphanumeric();
    }
  }

  async filterSubjects() {
    this.subjects = this.originalSubjects;
    // Filtro de fecha
    await this.onDateFilterChange(this.currentFecha)
    // Filtro de centros
    await this.onCentroChange(this.currentCentros)
    // Ordenamiento
    await this.onDateChange(this.currentOrder)
  }

  async resetFilters() {
    this.subjects = this.originalSubjects;
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
