import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { UsersService } from "src/app/services/users.service";
import { ModalController } from "@ionic/angular";
import { LanguageService } from "src/app/services/language.service";
import { ClinicAnalysisElementsService } from "src/app/services/clinic-analysis-elements.service";
import { Observable, Subscription } from "rxjs";
import { ToastService } from "src/app/services/toast.service";
import * as moment from "moment";
import { AnalyticStudiesService } from "src/app/services/analytic-studies.service";

@Component({
  selector: "app-add-analytic-study",
  templateUrl: "./add-analytic-study.page.html",
  styleUrls: ["./add-analytic-study.page.scss"]
})
export class AddAnalyticStudyPage implements OnInit, OnDestroy {
  @Input() id: string;

  analyticElements$: Observable<any>;
  date: string;
  analyticValues = [];
  elements: any;
  elementsSub: Subscription;
  subject: any;
  age: number;

  constructor(
    private usersService: UsersService,
    private analyticStudiesService: AnalyticStudiesService,
    private modalController: ModalController,
    private analysisElementsService: ClinicAnalysisElementsService,
    public lang: LanguageService,
    private toastsService: ToastService
  ) {}

  ngOnInit() {}

  ionViewDidEnter() {
    this.getAnalyticStudy();
    this.getSubject();
  }

  getSubject() {
    this.usersService.getUserData(this.id).then((data) => {
      this.subject = data.data();
      this.age = moment().diff(this.subject.history.birthdate, "years", false);
      console.log(this.age);
    });
  }

  getAnalyticStudy() {
    this.analyticElements$ = this.analysisElementsService.getClinicAnalysisElements();
    this.elementsSub = this.analyticElements$.subscribe((data) => {
      this.elements = data;
      this.elements.forEach((element) => {
        this.analyticValues.push({
          category: element.category,
          id: element.id,
          metricUnit: element.metricUnit,
          name: element.name,
          ranges: element.ranges || null,
          relatedDiseases: element.relatedDiseases || null
        });
      });
    });
  }

  editElement(value: string, indexArray: number) {
    this.analyticValues[indexArray].value = parseFloat(value);
    if (this.analyticValues[indexArray].ranges) {
      this.analyticValues[indexArray].ranges.forEach((element) => {
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
    } else {
      this.toastsService.show(
        "danger",
        `El elemento de análisis "${this.analyticValues[indexArray].name}" no tiene aún rangos de valores`
      );
    }
  }

  save() {
    const data = {
      date: this.date || moment().format(),
      values: this.analyticValues,
      shortcode:
        "[ANA" + Math.floor(Math.random() * 1000 + 1).toString(10) + "]",
      createdAt: moment().format()
    };

    console.log(data);

    this.analyticStudiesService.createAnalysisStudy(this.id, data).then(() => {
      this.dismissModal().then(() => {
        this.toastsService.show("success", "Análisis creado con éxito");
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
