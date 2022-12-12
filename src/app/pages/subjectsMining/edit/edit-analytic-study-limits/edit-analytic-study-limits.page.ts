import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { LanguageService } from "src/app/services/language.service";
import { ToastService } from "src/app/services/toast.service";
import { Observable, Subscription } from "rxjs";
import * as moment from "moment";
import { AnalyticStudiesService } from "src/app/services/analytic-studies.service";
import { SubjectsService } from "src/app/services/subjects.service";

@Component({
  selector: 'app-edit-analytic-study-limits',
  templateUrl: './edit-analytic-study-limits.page.html',
  styleUrls: ['./edit-analytic-study-limits.page.scss'],
})
export class EditAnalyticStudyLimitsPage implements OnInit {
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
  accessionNumber: number;

  genre: any;

  canBeAnalyzed = true;

  constructor(
    private subjectService: SubjectsService,
    private analyticStudiesService: AnalyticStudiesService,
    private modalController: ModalController,
    public lang: LanguageService,
    private toastsService: ToastService
  ) { }

  ngOnInit() { }

  ionViewDidEnter() {
    this.getAnalyticStudy();
    this.getSubject();
  }

  getSubject() {
    this.subjectService.getSubjectData(this.id).then(data => {
      this.subject = data.data();
      if (this.subject.history) {
        // Normalizamos al formato Synlab
        this.age = this.subject.history.age;
        switch (this.subject.history.genre) {
          case "varon":
            this.genre = "Hombres"
            break;
          case "hembra":
            this.genre = "Mujeres"
            break;
          default:
            break;
        }
      }
      console.log(this.age);
      console.log(this.genre);
      this.canAnalysis();
    });
  }

  canAnalysis() {
    if (!this.age || !this.genre) {
      this.canBeAnalyzed = false;
    }
  }

  getAnalyticStudy() {
    this.analyticElements$ = this.analyticStudiesService.getAnalyticStudy(
      this.id,
      this.testId
    );

    this.elementsSub = this.analyticElements$.subscribe(data => {
      console.log(data);
      this.date = data.date;
      this.accessionNumber = data.accessionNumber || null,
        this.elements = data.values;
      this.elements.forEach(element => {
        this.analyticValues.push({
          id: element.id,
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

  editElement(value: any, indexArray: number) {
    value = parseFloat(value.replace(/,/, '.'));
    this.analyticValues[indexArray].value = value;

    if (this.analyticValues[indexArray].ranges) {
      this.analyticValues[indexArray].ranges.forEach((element) => {
        // Comprobación de sexo y edad
        if (
          element.UNIDAD_INTERVALO_EDAD == "Años" &&
          (element.SEXO == this.genre || element.SEXO == "Ambos") &&
          element.INTERVALO_INF_EDAD <= this.age &&
          element.INTERVALO_SUP_EDAD >= this.age
        ) {
          console.log("Entro en: ", element);
          if (parseFloat(element.LIM_INF.replace(/,/, '.')) > value) {
            console.log("soy low");
            console.log(parseFloat(element.LIM_INF.replace(/,/, '.')), value);
            this.analyticValues[indexArray].status = "low";
            element.INTERPRETACION && element.INTERPRETACION ? this.analyticValues[indexArray].meaning = "negative" : this.analyticValues[indexArray].meaning = "positive";

          } else if (parseFloat(element.LIM_SUP.replace(/,/, '.')) < value) {
            console.log(parseFloat(element.LIM_SUP.replace(/,/, '.')), value);
            console.log("soy high");
            this.analyticValues[indexArray].status = "high";
            element.INTERPRETACION && element.INTERPRETACION ? this.analyticValues[indexArray].meaning = "negative" : this.analyticValues[indexArray].meaning = "positive";

          } else if (parseFloat(element.LIM_SUP.replace(/,/, '.')) >= value && parseFloat(element.LIM_INF.replace(/,/, '.')) <= value) {
            console.log("soy normal");
            console.log(value);
            this.analyticValues[indexArray].status = "normal";
            element.INTERPRETACION && element.INTERPRETACION ? this.analyticValues[indexArray].meaning = "negative" : this.analyticValues[indexArray].meaning = "positive";
          }
        }
      });
    } else {
      this.toastsService.show(
        "danger",
        `El elemento de análisis "${this.analyticValues[indexArray].DESCRIPCION_TEST}" no tiene aún rangos de valores`
      );
    }
  }

  save() {
    const data = {
      date: this.date,
      values: this.analyticValues,
      updatedAt: moment().format(),
      accessionNumber: this.accessionNumber
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
