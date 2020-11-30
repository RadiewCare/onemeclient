import { Component, OnInit, Input } from "@angular/core";
import { ImageTestsService } from "src/app/services/image-tests.service";
import { DiseasesService } from "src/app/services/diseases.service";
import { ModalController } from "@ionic/angular";
import { ToastService } from "src/app/services/toast.service";
import { Observable, Subscription } from "rxjs";
import { LanguageService } from "src/app/services/language.service";
import * as firebase from "firebase/app";
import { ImageTestsElementsService } from 'src/app/services/image-tests-elements.service';

@Component({
  selector: "app-add-image-test",
  templateUrl: "./add-image-test.page.html",
  styleUrls: ["./add-image-test.page.scss"]
})
export class AddImageTestPage implements OnInit {
  @Input() id: string;

  disease: any;
  imageTests$: Observable<any>;
  imageTestsData: any;
  imageTestsElements: any;
  imageTestsElementsSub: Subscription;
  fields: any;
  currentField: any;

  currentText: string;
  currentNumber: number;
  currentInterval: string;
  currentBinary: string;
  currentOption: string;
  currentUnit: number;
  compareFunction: string;

  constructor(
    private diseasesService: DiseasesService,
    private imageTestsService: ImageTestsService,
    private imageTestsElementsService: ImageTestsElementsService,
    private modalController: ModalController,
    private toastService: ToastService,
    public lang: LanguageService
  ) { }

  ngOnInit() {
    this.getDisease();
    this.getImageTests();
  }

  getDisease() {
    this.diseasesService.getDiseaseData(this.id).then((diseaseData) => {
      this.disease = diseaseData.data();
    });
  }

  getImageTests() {
    this.imageTests$ = this.imageTestsElementsService.getImageTestElements();
    this.imageTestsElementsSub = this.imageTests$.subscribe(data => {
      this.imageTestsElements = data.sort((a, b) => (a.name < b.name) ? -1 : (a.name > b.name) ? 1 : 0);
    })
  }

  addElementsOnList() {
    console.log(this.imageTestsData);
  }

  getTestFields() {
    console.log(this.imageTestsData.fields);
    this.currentField = undefined;

    this.fields = this.imageTestsData.fields;
  }

  setCurrentField(field: any) {
    const auxArray = this.imageTestsData.fields.filter(
      (element) => element.name === field
    );
    this.currentField = auxArray[0];
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  isValid() {
    if (this.imageTestsData === undefined) {
      return false;
    } else {
      return true;
    }
  }

  async save() {

    if (!this.disease.imageBiomarkers) {
      this.disease.imageBiomarkers = [];
    }

    if (this.imageTestsData && this.imageTestsData.length > 0) {

      for await (const element of this.imageTestsData) {
        this.disease.imageBiomarkers.push({ id: element.id, name: element.name, order: this.disease.imageBiomarkers.length, options: element.options })
      }

      this.diseasesService.updateDisease(this.disease.id, { imageBiomarkers: this.disease.imageBiomarkers }).then(() => {
        this.toastService.show("success", "Elementos de prueba añadidos").then(() => {
          // Añadir las referencias en los image-test-elements
          this.disease.imageBiomarkers.forEach(biomarker => {
            this.imageTestsElementsService.updateImageTestElement(biomarker.id, {
              relatedDiseases: firebase.firestore.FieldValue.arrayUnion(this.disease.id)
            })
          });
          this.dismissModal();
        })
      }).catch(() => {
        this.toastService.show("success", "Eror al añadir los elementos de prueba")
      });
    } else {
      this.dismissModal();
    }

    /*
    if (this.isValid()) {
      const element = {
        id: this.imageTestsData.id,
        name: this.imageTestsData.name,
        test: this.currentField.name,
        type: this.currentField.type,
        defaultInput: this.currentField.defaultInput || null,
        trueInput: this.currentField.trueInput || null,
        falseInput: this.currentField.falseInput || null,
        compareFunction: this.compareFunction || null,
        max: this.currentField.max || null,
        min: this.currentField.min || null,
        options: this.currentField.options || null,
        unit: this.currentField.currentUnit || null
      };
      switch (this.currentField.type) {
        case "text":
          Object.assign(element, { value: this.currentText });
          break;
        case "number":
          Object.assign(element, { value: this.currentNumber });
          break;
        case "interval":
          Object.assign(element, { value: this.currentInterval });
          break;
        case "binary":
          Object.assign(element, { value: this.currentBinary });
          break;
        case "textarea":
          Object.assign(element, { value: this.currentText });
          break;
        case "multiple":
          Object.assign(element, { value: this.currentOption });
          break;
        case "unit":
          Object.assign(element, { value: this.currentUnit });
          break;

        default:
          break;
      }
      const data = {
        imageTests: firebase.firestore.FieldValue.arrayUnion(element)
      };
      this.diseasesService
        .updateDisease(this.disease.id, data)
        .then(() => {
          this.dismissModal();
          this.toastService.show(
            "success",
            "Prueba de imagen añadida con éxito"
          );
        })
        .catch((error) => {
          this.toastService.show(
            "danger",
            "Error al añadir la prueba de imagen: " + error
          );
        });
    } else {
      this.toastService.show(
        "danger",
        "Error: Hay campos erróneos o incompletos"
      );
    }
    */
  }




}
