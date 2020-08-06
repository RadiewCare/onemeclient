import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { ReportsService } from "src/app/services/reports.service";
import { ToastService } from "src/app/services/toast.service";
import { Subscription, Observable } from "rxjs";
import { AngularFirestore } from "@angular/fire/firestore";
import { AuthService } from "src/app/services/auth.service";
import * as moment from "moment";
import { LanguageService } from "src/app/services/language.service";
import { SubjectsService } from "src/app/services/subjects.service";

@Component({
  selector: "app-create",
  templateUrl: "./create.page.html",
  styleUrls: ["./create.page.scss"]
})
export class CreatePage implements OnInit, OnDestroy {
  currentUser: any;
  userSub: Subscription;

  subject: any;
  subjects$: Observable<any>;
  subjects = [];
  subjectsSub: Subscription;

  mainDoctor: string;
  doctors = [];
  template: any;
  templates$: Observable<any>;
  templatesSub: Subscription;

  constructor(
    private db: AngularFirestore,
    private router: Router,
    private reportsService: ReportsService,
    private subjectsService: SubjectsService,
    private toastService: ToastService,
    private authService: AuthService,
    public lang: LanguageService
  ) {}

  ngOnInit() {}

  ionViewDidEnter() {
    new Promise((resolve) => {
      this.userSub = this.authService.user$.subscribe((user) => {
        this.subjectsSub = this.subjectsService.getSubjectByDoctor(user.id).subscribe(data => {
          var reA = /[^a-zA-Z]/g;
          var reN = /[^0-9]/g;
          this.subjects = data.sort((a, b) => {
            var aA = a.identifier.replace(reA, "");
            var bA = b.identifier.replace(reA, "");
            if (aA === bA) {
              var aN = parseInt(a.identifier.replace(reN, ""), 10);
              var bN = parseInt(b.identifier.replace(reN, ""), 10);
              return aN === bN ? 0 : aN > bN ? 1 : -1;
            } else {
              return aA > bA ? 1 : -1;
            }
          });;
        });

        this.currentUser = user;
        this.mainDoctor = this.currentUser.id;
        this.doctors.push(this.currentUser.id);
        resolve();
      });
    }).then(() => {
      this.templates$ = this.db
        .collection(`doctors/${this.currentUser.id}/templates`)
        .valueChanges();
    });
  }

  save() {
    const data = {
      subject: { id: this.subject.id, identifier: this.subject.identifier },
      mainDoctor: this.mainDoctor,
      doctors: this.doctors,
      template: this.template,
      createdAt: moment().format()
    };

    if (this.subject !== undefined || this.subject.length > 0) {
      this.reportsService
        .createReport(this.currentUser.id, data)
        .then(() => {
          this.router.navigate(["/reports"]);
          this.toastService.show("success", "Informe creado con éxito");
        })
        .catch(() => {
          this.toastService.show("danger", "Error al crear el informe");
        });
    } else {
      this.toastService.show("danger", "Debes poner un nombre al sujeto");
    }
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
  }
}
