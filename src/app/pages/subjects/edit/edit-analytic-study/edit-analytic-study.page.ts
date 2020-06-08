import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { UsersService } from "src/app/services/users.service";
import { ModalController } from "@ionic/angular";
import { LanguageService } from "src/app/services/language.service";
import { ToastService } from "src/app/services/toast.service";
import { Observable, Subscription } from "rxjs";
import * as moment from "moment";
import { AnalyticStudiesService } from "src/app/services/analytic-studies.service";
import { SubjectsService } from "src/app/services/subjects.service";

@Component({
  selector: "app-edit-analytic-study",
  templateUrl: "./edit-analytic-study.page.html",
  styleUrls: ["./edit-analytic-study.page.scss"]
})
export class EditAnalyticStudyPage implements OnInit, OnDestroy {
  @Input() id: string;
  @Input() testId: string;

  analyticElements$: Observable<any>;
  analyticStudy$: Observable<any>;
  date: string;
  analyticValues = [];
  elements: any;
  elementsSub: Subscription;
  subject: any;
  age: number;

  constructor(
    private usersService: UsersService,
    private subjectService: SubjectsService,
    private analyticStudiesService: AnalyticStudiesService,
    private modalController: ModalController,
    public lang: LanguageService,
    private toastsService: ToastService
  ) {}

  ngOnInit() {}

  ionViewDidEnter() {
    this.getAnalyticStudy();
    this.getSubject();
  }

  getSubject() {
    this.subjectService.getSubjectData(this.id).then(data => {
      this.subject = data.data();
      this.age = moment().diff(this.subject.history.birthdate, "years", false);
      console.log(this.age);
    });
  }

  getAnalyticStudy() {
    this.analyticElements$ = this.analyticStudiesService.getAnalyticStudy(
      this.id,
      this.testId
    );
    this.elementsSub = this.analyticElements$.subscribe(data => {
      console.log(data);
      this.date = data.date;
      this.elements = data.values;
      this.elements.forEach(element => {
        this.analyticValues.push({
          category: element.category,
          id: element.id,
          metricUnit: element.metricUnit,
          name: element.name,
          ranges: element.ranges || null,
          value: element.value || null,
          status: element.status || null,
          relatedDiseases: element.relatedDiseases || null
        });
      });
      console.log(this.analyticValues);
    });
    this.analyticStudy$ = this.analyticStudiesService.getAnalyticStudies(
      this.id
    );
  }

  editElement(value: string, indexArray: number) {
    this.analyticValues[indexArray].value = parseFloat(value);
    this.analyticValues[indexArray].ranges.forEach(element => {
      // Comprobación de sexo y edad
      if (element.sex && element.lowerAge && element.upperAge && this.age) {
        if (
          element.sex === this.subject.history.genre &&
          element.lowerAge <= this.age &&
          element.upperAge >= this.age
        ) {
          // Comprobación de valores (por defecto)
          if (element.lowerLevel > value) {
            this.analyticValues[indexArray].status = "low";
          } else if (element.upperLevel < value) {
            this.analyticValues[indexArray].status = "high";
          } else {
            this.analyticValues[indexArray].status = "normal";
          }
          return;
        }
      } else {
        // Comprobación de valores (por defecto)
        if (element.lowerLevel > value) {
          this.analyticValues[indexArray].status = "low";
        } else if (element.upperLevel < value) {
          this.analyticValues[indexArray].status = "high";
        } else {
          this.analyticValues[indexArray].status = "normal";
        }
      }
    });
  }

  save() {
    const data = {
      date: this.date,
      values: this.analyticValues,
      updatedAt: moment().format()
    };

    this.analyticStudiesService
      .updateAnalyticStudy(this.id, this.testId, data)
      .then(() => {
        this.dismissModal().then(() => {
          this.toastsService.show("success", "Análisis editado con éxito");
        });
      });
  }

  async dismissModal(): Promise<any> {
    this.modalController.dismiss();
  }

  ngOnDestroy(): void {
    this.elementsSub.unsubscribe();
  }
}
