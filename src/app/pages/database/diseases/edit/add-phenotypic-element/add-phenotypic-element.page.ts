import { Component, OnInit, Input } from "@angular/core";
import { LanguageService } from "src/app/services/language.service";
import { DiseasesService } from "src/app/services/diseases.service";
import { ModalController } from "@ionic/angular";
import { ToastService } from "src/app/services/toast.service";
import * as firebase from "firebase/app";
import * as moment from "moment";

@Component({
  selector: "app-add-phenotypic-element",
  templateUrl: "./add-phenotypic-element.page.html",
  styleUrls: ["./add-phenotypic-element.page.scss"]
})
export class AddPhenotypicElementPage implements OnInit {
  @Input() id: string;

  disease: any;
  phenotypicData: any;
  compareFunction: string;
  value: any;
  currentValues = [];
  currentType: any;
  numberValue: number;
  textValue: string;
  optionValue: any;
  booleanValue: boolean;
  signValue: string;
  symptomValue: string;

  phenotypic = [
    {
      id: "sex",
      name: "Sexo",
      type: "options",
      values: ["varon", "hembra", "intersexo", "none"]
    },
    {
      id: "birthdate",
      name: "Fecha de nacimiento",
      type: "date"
    },
    {
      id: "height",
      name: "Estatura",
      type: "number"
    },
    {
      id: "populationGroup",
      name: "Grupo de población",
      type: "options",
      values: [
        "subsahariano",
        "africano",
        "indioasiatico",
        "caucasico",
        "chino",
        "japones",
        "sudesteasiatico",
        "otrosgruposasiaticos",
        "aborigendeaustralia",
        "islasdelpacificoypolinesia",
        "amerindio",
        "latinohispano"
      ]
    }
  ];

  constructor(
    private lang: LanguageService,
    private diseasesService: DiseasesService,
    private modalController: ModalController,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.getDisease();
  }

  getDisease() {
    this.diseasesService.getDiseaseData(this.id).then((diseaseData) => {
      this.disease = diseaseData.data();
    });
  }

  getFieldValues(values: any, type: string) {
    this.currentValues = values;
    this.currentType = type;
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  isValid() {
    if (true) {
      return true;
    } else {
      return false;
    }
  }

  save() {
    let data;
    if (this.isValid()) {
      switch (this.currentType) {
        case "text":
          data = {
            phenotypicElements: firebase.firestore.FieldValue.arrayUnion({
              id: this.phenotypicData.id,
              value: this.textValue
            }),
            updatedAt: moment().format()
          };
          console.log(data);
          this.diseasesService.updateDisease(this.id, data).then(() => {
            this.toastService.show(
              "success",
              "Rasgo fenotípico añadido con éxito"
            );
            this.dismissModal();
          });
          break;
        case "number":
          data = {
            phenotypicElements: firebase.firestore.FieldValue.arrayUnion({
              id: this.phenotypicData.id,
              compare: this.compareFunction,
              value: this.numberValue
            }),
            updatedAt: moment().format()
          };
          console.log(data);
          this.diseasesService.updateDisease(this.id, data).then(() => {
            this.toastService.show(
              "success",
              "Rasgo fenotípico añadido con éxito"
            );
            this.dismissModal();
          });
          break;
        case "options":
          data = {
            phenotypicElements: firebase.firestore.FieldValue.arrayUnion({
              id: this.phenotypicData.id,
              value: this.optionValue
            }),
            updatedAt: moment().format()
          };
          console.log(data);
          this.diseasesService.updateDisease(this.id, data).then(() => {
            this.toastService.show(
              "success",
              "Rasgo fenotípico añadido con éxito"
            );
            this.dismissModal();
          });

          break;
        case "boolean":
          data = {
            phenotypicElements: firebase.firestore.FieldValue.arrayUnion({
              id: this.phenotypicData.id,
              value: this.booleanValue
            }),
            updatedAt: moment().format()
          };
          console.log(data);
          this.diseasesService.updateDisease(this.id, data).then(() => {
            this.toastService.show(
              "success",
              "Rasgo fenotípico añadido con éxito"
            );
            this.dismissModal();
          });
          break;

        case "sign":
          data = {
            phenotypicElements: firebase.firestore.FieldValue.arrayUnion({
              id: this.phenotypicData.id,
              value: this.signValue
            }),
            updatedAt: moment().format()
          };
          console.log(data);
          this.diseasesService.updateDisease(this.id, data).then(() => {
            this.toastService.show(
              "success",
              "Rasgo fenotípico añadido con éxito"
            );
            this.dismissModal();
          });
          break;

        case "symptom":
          data = {
            phenotypicElements: firebase.firestore.FieldValue.arrayUnion({
              id: this.phenotypicData.id,
              value: this.symptomValue
            }),
            updatedAt: moment().format()
          };
          console.log(data);
          this.diseasesService.updateDisease(this.id, data).then(() => {
            this.toastService.show(
              "success",
              "Rasgo fenotípico añadido con éxito"
            );
            this.dismissModal();
          });
          break;

        default:
          break;
      }
    } else {
      this.toastService.show(
        "danger",
        "Error: Hay campos erróneos o incompletos"
      );
    }
  }
}
