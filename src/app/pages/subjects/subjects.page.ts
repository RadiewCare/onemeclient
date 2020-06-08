import { Component, OnInit, OnDestroy } from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { LanguageService } from "src/app/services/language.service";
import { AuthService } from "src/app/services/auth.service";
import { DoctorsService } from "src/app/services/doctors.service";
import { SubjectsService } from "src/app/services/subjects.service";

@Component({
  selector: "app-subjects",
  templateUrl: "./subjects.page.html",
  styleUrls: ["./subjects.page.scss"]
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

  constructor(
    private subjectsService: SubjectsService,
    private doctorsService: DoctorsService,
    public lang: LanguageService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.sharedSubjectsData = [];
    this.userSub = this.auth.user$.subscribe((data) => {
      this.userData = data;
      this.getSubjects();
      this.getDoctorData();
    });
  }

  ionViewDidEnter() {}

  getDoctorData() {
    this.doctorsService.getDoctorData(this.userData.id).then((data) => {
      console.log(data.data());

      this.sharedSubjectsPhenotypic =
        data.data().sharedSubjectsPhenotypic || [];
      console.log(this.sharedSubjectsPhenotypic);

      this.sharedSubjectsGenetic = data.data().sharedSubjectsGenetic || [];
      console.log(this.sharedSubjectsGenetic);

      this.sharedSubjectsAnalytic = data.data().sharedSubjectsAnalytic || [];
      console.log(this.sharedSubjectsAnalytic);

      this.sharedSubjectsImage = data.data().sharedSubjectsImage || [];
      console.log(this.sharedSubjectsImage);

      this.getSharedSubjects();
    });
  }

  getSubjects(): Promise<any> {
    console.log(this.userData.id);

    this.subjects$ = this.subjectsService.getSubjectByDoctor(this.userData.id);
    return new Promise((resolve) => {
      this.subjectsSub = this.subjects$.subscribe((subjects) => {
        console.log(subjects);

        this.subjects = subjects.sort((a, b) => {
          if (a.identifier < b.identifier) {
            return -1;
          }
          if (a.identifier > b.identifier) {
            return 1;
          }
          return 0;
        });
        resolve();
      });
    });
  }

  async getSharedSubjects() {
    this.sharedSubjects = this.sharedSubjectsAnalytic
      .concat(this.sharedSubjectsGenetic)
      .concat(this.sharedSubjectsPhenotypic)
      .concat(this.sharedSubjectsImage)
      .filter((item, pos, self) => {
        return self.indexOf(item) === pos;
      });

    console.log(this.sharedSubjects);

    for await (const sub of this.sharedSubjects) {
      await this.subjectsService.getSubjectData(sub).then((userData) => {
        console.log(userData.data());

        this.sharedSubjectsData.push(userData.data());
      });
    }

    console.log(this.sharedSubjectsData);
  }

  onSearchChange(query: string): void {
    if (query.length > 0) {
      this.querySubjects = this.subjects.filter((report) =>
        report.identifier.toLowerCase().includes(query.toLowerCase())
      );
    } else {
      this.querySubjects = null;
    }
  }

  ngOnDestroy(): void {
    if (this.subjectsSub) {
      this.subjectsSub.unsubscribe();
    }
  }
}
