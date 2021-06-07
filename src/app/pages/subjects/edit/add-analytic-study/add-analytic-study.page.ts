import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { LanguageService } from "src/app/services/language.service";
import { ClinicAnalysisElementsService } from "src/app/services/clinic-analysis-elements.service";
import { Observable, Subscription } from "rxjs";
import { ToastService } from "src/app/services/toast.service";
import { AnalyticStudiesService } from "src/app/services/analytic-studies.service";
import { SubjectsService } from "src/app/services/subjects.service";
import { ClinicAnalysisService } from "src/app/services/clinic-analysis.service";
import * as moment from "moment";

@Component({
  selector: "app-add-analytic-study",
  templateUrl: "./add-analytic-study.page.html",
  styleUrls: ["./add-analytic-study.page.scss"]
})
export class AddAnalyticStudyPage implements OnInit, OnDestroy {
  @Input() id: string;

  clinicAnalysis$: Observable<any>;

  date: string;
  analyticValues = [];
  clinicAnalysis: any;

  clinicAnalysisSub: Subscription;

  subject: any;
  age: number;
  genre: string;
  accessionNumber: number;

  canBeAnalyzed = true;

  analysisElements: any;
  currentAnalysis: any;

  constructor(
    private usersService: SubjectsService,
    private analyticStudiesService: AnalyticStudiesService,
    private modalController: ModalController,
    private clinicAnalysisService: ClinicAnalysisService,
    private clinicAnalysisElementsService: ClinicAnalysisElementsService,
    public lang: LanguageService,
    private toastsService: ToastService
  ) { }

  ngOnInit() { }

  ionViewDidEnter() {
    this.getClinicAnalysis();
    this.getSubject();
  }

  getSubject() {
    this.usersService.getSubjectData(this.id).then((data) => {
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

  getClinicAnalysis() {
    this.clinicAnalysisService.getDefaultClinicAnalysisData().then(data => {
      this.clinicAnalysis = data.docs.map(el => el = el.data());
      console.log(this.clinicAnalysis);
    });
  }

  canAnalysis() {
    if (!this.age || !this.genre) {
      this.canBeAnalyzed = false;
    }
  }

  getCurrentAnalysis() {
    console.log(this.currentAnalysis);
    this.analyticValues = [];

    this.clinicAnalysisElementsService.getClinicAnalysisElementsData().then((data) => {
      this.analysisElements = data.docs.map(el => el = el.data());
      console.log(this.analysisElements, "Elementos de análisis");

      this.currentAnalysis.elements.forEach((element) => {
        console.log(element, "elemento a comparar");

        const elementData = this.analysisElements.find(el => el.id === element.id);

        console.log(elementData, "datos del elemento encontrado");

        this.analyticValues.push({
          id: element.id,
          name: element.name,
          ranges: elementData.ranges.filter(el => el.testId === this.currentAnalysis.id)
        });
      });
      console.log(this.analyticValues, "formulario");

    })
  }

  onSearch(event: any) {
    event.component.items = this.clinicAnalysis;
    if (event.text.length > 0) {
      event.component.items = event.component.items.filter(e => this.removeAccents(e.name.toLowerCase()).includes(this.removeAccents(event.text.toLowerCase())));
    }
  }

  removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  editElement(value: any, indexArray: number) {
    value = parseFloat(value.replace(/,/, '.'));
    this.analyticValues[indexArray].value = value;
    console.log(this.analyticValues[indexArray]);


    if (this.analyticValues[indexArray].ranges) {
      this.analyticValues[indexArray].ranges.forEach((element) => {

        if (typeof element.LIM_SUP === 'string') {
          element.LIM_SUP = parseFloat(element.LIM_SUP.replace(/,/, '.'));
        }

        if (typeof element.LIM_INF === 'string') {
          element.LIM_INF = parseFloat(element.LIM_INF.replace(/,/, '.'));
        }

        // Comprobación de sexo y edad
        if (
          element.UNIDAD_INTERVALO_EDAD === "Años" &&
          (element.SEXO == this.genre || element.SEXO == "Ambos") &&
          element.INTERVALO_INF_EDAD <= this.age &&
          element.INTERVALO_SUP_EDAD >= this.age
        ) {
          if (element.INTERPRETACION && element.INTERPRETACION === "Positivo") {
            if (element.LIM_INF > value) {
              console.log("soy low");
              console.log(element.LIM_INF, value);
              this.analyticValues[indexArray].status = "low";
              this.analyticValues[indexArray].meaning = "negative";
            } else if (element.LIM_SUP < value) {
              console.log(element.LIM_SUP, value);
              console.log("soy high");
              this.analyticValues[indexArray].status = "high";
              this.analyticValues[indexArray].meaning = "negative";
            } else if (element.LIM_SUP >= value && element.LIM_INF <= value) {
              console.log("soy normal");
              console.log(value);
              this.analyticValues[indexArray].status = "normal";
              this.analyticValues[indexArray].meaning = "positive";
            }
          } else if (element.INTERPRETACION && element.INTERPRETACION === "Negativo") {
            if (element.LIM_INF > value) {
              console.log("soy low");
              console.log(element.LIM_INF, value);
              this.analyticValues[indexArray].status = "low";
              this.analyticValues[indexArray].meaning = "positive";
            } else if (element.LIM_SUP < value) {
              console.log(element.LIM_SUP, value);
              console.log("soy high");
              this.analyticValues[indexArray].status = "high";
              this.analyticValues[indexArray].meaning = "positive";
            } else if (element.LIM_SUP >= value && element.LIM_INF <= value) {
              console.log("soy normal");
              console.log(value);
              this.analyticValues[indexArray].status = "normal";
              this.analyticValues[indexArray].meaning = "negative";
            }
          } else {
            console.log("segundo if");
            console.log("Entro en: ", element);
            if (element.LIM_INF > value) {
              console.log("soy low");
              console.log(element.LIM_INF, value);
              this.analyticValues[indexArray].status = "low";
              this.analyticValues[indexArray].meaning = "positive";
            } else if (element.LIM_SUP < value) {
              console.log(element.LIM_SUP, value);
              console.log("soy high");
              this.analyticValues[indexArray].status = "high";
              this.analyticValues[indexArray].meaning = "positive";

            } else if (element.LIM_SUP >= value && element.LIM_INF <= value) {
              console.log("soy normal");
              console.log(value);
              this.analyticValues[indexArray].status = "normal";
              this.analyticValues[indexArray].meaning = "negative";
            }
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
      date: this.date || moment().format(),
      values: this.analyticValues,
      shortcode:
        "[ANA" + Math.floor(Math.random() * 1000 + 1).toString(10) + "]",
      createdAt: moment().format(),
      accessionNumber: this.accessionNumber || null,
      relatedCategories: this.currentAnalysis.relatedCategories ? this.currentAnalysis.relatedCategories.map(element => element = element) : [],
      relatedLabels: this.currentAnalysis.relatedLabels ? this.currentAnalysis.relatedLabels.map(element => element = element) : [],
      testId: this.currentAnalysis.id,
      testName: this.currentAnalysis.name
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
    if (this.clinicAnalysisSub) {
      this.clinicAnalysisSub.unsubscribe();
    }
  }
}
