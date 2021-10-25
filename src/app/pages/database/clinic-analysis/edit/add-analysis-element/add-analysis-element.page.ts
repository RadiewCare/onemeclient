import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { ToastService } from "src/app/services/toast.service";
import * as firebase from "firebase/app";
import { Observable, Subscription } from "rxjs";
import { ClinicAnalysisService } from "src/app/services/clinic-analysis.service";
import { ClinicAnalysisElementsService } from "src/app/services/clinic-analysis-elements.service";

@Component({
  selector: 'app-add-analysis-element',
  templateUrl: './add-analysis-element.page.html',
  styleUrls: ['./add-analysis-element.page.scss'],
})
export class AddAnalysisElementPage implements OnInit {
  @Input() id: string;

  name: string;
  type: string;
  options: string[] = [];
  currentOption: string;
  min: number;
  max: number;
  trueInput: string;
  falseInput: string;
  defaultInput = false;
  unit: string;
  positiveOptions = [];
  currentPositiveOption: string;

  clinicAnalysis: any;

  allClinicAnalysis$: Observable<any>;
  allClinicAnalysisSub: Subscription;
  allClinicAnalysis: any;

  currentAnalysisData: any;
  clinicAnalysisElements: any;
  clinicAnalysisElements$: Observable<any>;
  clinicAnalysisElementsSub: Subscription;

  constructor(
    private clinicAnalysisService: ClinicAnalysisService,
    private clinicAnalysisElementsService: ClinicAnalysisElementsService,
    private modalController: ModalController,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.getClinicAnalysis();
    this.loadElement();
  }

  async loadElement() {
    this.clinicAnalysis = (await this.clinicAnalysisService.getData(this.id)).data();
    console.log(this.clinicAnalysis);
  }

  async getClinicAnalysis() {
    this.clinicAnalysisElements = (await this.clinicAnalysisElementsService.getClinicAnalysisElementsData()).docs.map(element => element = element.data());
    this.clinicAnalysisElements = this.clinicAnalysisElements.sort((a, b) => (a.name < b.name) ? -1 : (a.name > b.name) ? 1 : 0);
    console.log(this.clinicAnalysisElements);
  }

  async save() {

    console.log(this.currentAnalysisData);

    if (!this.clinicAnalysis.elements) {
      this.clinicAnalysis.elements = [];
    }

    for await (const element of this.currentAnalysisData) {
      this.clinicAnalysis.elements.push({ id: element.id, name: element.name, order: this.clinicAnalysis.elements.length })
    }

    console.log(this.clinicAnalysis);

    this.clinicAnalysis.elements = [... new Set(this.clinicAnalysis.elements)];

    // Primero hay que actualizar el clinicAnalysis y si se hace bien actualizar las referencias 

    this.clinicAnalysisService.update(this.id, {
      elements: this.clinicAnalysis.elements
    }).then(async () => {
      for await (const element of this.clinicAnalysis.elements) {
        this.clinicAnalysisElementsService.insertTest(this.id, element.id, this.clinicAnalysis.testCode, this.clinicAnalysis.name);
      }
      await this.dismissModal();
      this.toastService.show("success", "Elementos de análisis añadidos con éxito");
    }).catch(error => {
      this.toastService.show("danger", "Error al insertar elementos");
    })
  }

  onSearch(event: any) {
    event.component.items = this.clinicAnalysisElements;
    if (event.text.length > 0) {
      event.component.items = event.component.items.filter(e => this.removeAccents(e.name.toLowerCase()).includes(this.removeAccents(event.text.toLowerCase())));
    }
  }

  removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }



  addOption(value: string) {
    if (value.length > 0 && value !== undefined && value !== null) {
      this.options.push(value.toLowerCase());
      this.currentOption = "";
    } else {
      this.toastService.show(
        "danger",
        "El campo de la opción no puede ser vacío"
      );
    }
  }

  addPositiveOptions(values: any) {
    this.positiveOptions = values;
  }

  removeOption(option: string) {
    this.options.splice(this.options.indexOf(option), 1);
  }

  isValid() {
    if (
      this.name !== undefined &&
      this.type !== undefined &&
      this.name.length > 0 &&
      this.type.length > 0
    ) {
      switch (this.type) {
        case "binary":
          if (
            this.falseInput !== undefined &&
            this.trueInput !== undefined &&
            this.falseInput.length > 0 &&
            this.trueInput.length > 0
          ) {
            return true;
          }
          break;
        case "multiple":
          if (this.options.length > 0) {
            return true;
          }
          break;
        case "interval":
          if (this.min !== undefined && this.max !== undefined) {
            return true;
          }
          break;
        case "unit":
          if (this.unit !== undefined) {
            return true;
          }
          break;

        case "text":
          return true;

        case "textarea":
          return true;

        case "number":
          return true;

        case "conclusion":
          return true;

        default:
          break;
      }
    } else {
      return false;
    }
  }

  dismissModal(): Promise<any> {
    return this.modalController.dismiss();
  }

  ngOnDestroy(): void {

  }

}
