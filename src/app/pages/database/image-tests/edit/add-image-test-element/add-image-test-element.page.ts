import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { ImageTestsService } from "src/app/services/image-tests.service";
import { ModalController } from "@ionic/angular";
import { ToastService } from "src/app/services/toast.service";
import { ImageTestsElementsService } from "src/app/services/image-tests-elements.service";
import * as firebase from "firebase/app";
import * as moment from "moment";
import { Observable, Subscription } from "rxjs";

@Component({
  selector: "app-add-image-test-element",
  templateUrl: "./add-image-test-element.page.html",
  styleUrls: ["./add-image-test-element.page.scss"]
})
export class AddImageTestElementPage implements OnInit, OnDestroy {
  @Input() id: string;
  @Input() action: string;
  @Input() index: number;

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

  imageTest: any;
  imageTestSub: Subscription;

  imageTests$: Observable<any>;
  imageTestsSub: Subscription;
  imageTests: any;

  currentImageTestData: any;
  imageTestsElements: any;
  imageTestsElements$: Observable<any>;
  imageTestsElementsSub: Subscription;

  constructor(
    private imageTestsService: ImageTestsService,
    private imageTestsElementsService: ImageTestsElementsService,
    private modalController: ModalController,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    /*if (this.action === "edit") {
      this.loadElement();
    }*/
    this.getImageTests();
    this.loadElement();
  }

  getImageTests() {
    this.imageTestsElements$ = this.imageTestsElementsService.getImageTestElements();
    this.imageTestsElementsSub = this.imageTestsElements$.subscribe((data) => {
      console.log("imageTestsElements", data);
      this.imageTestsElements = data.sort((a, b) => (a.name < b.name) ? -1 : (a.name > b.name) ? 1 : 0);
    });
  }

  async save() {

    if (this.imageTest.elements) {
      const imageTestElementsIds = this.imageTest.elements.map((element) => element.id);

      for await (const element of this.currentImageTestData) {
        if (!imageTestElementsIds.includes(element.id)) {
          this.imageTest.elements.push({ id: element.id, name: element.name, order: this.imageTest.elements.length });
        }
      }

    } else {
      this.imageTest.elements = [];

      for await (const element of this.currentImageTestData) {
        this.imageTest.elements.push({ id: element.id, name: element.name, order: this.imageTest.elements.length });
      }
    }

    this.imageTestsService.updateImageTest(this.id, { elements: this.imageTest.elements }).then(async () => {
      await this.dismissModal();
      this.toastService.show("success", "Elementos de imagen añadidos con éxito")
    }).catch((error) => {
      this.toastService.show("danger", "Error al añadir los elementos de imágenes")
    });
  }

  loadElement() {
    this.imageTestSub = this.imageTestsService
      .getImageTest(this.id)
      .subscribe((data) => {
        this.imageTest = data;
      });
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

  /*save() {
    if (this.isValid()) {
      const data = {
        name: this.name,
        type: this.type,
        options: this.options || null,
        min: this.min || null,
        max: this.max || null,
        trueInput: this.trueInput || null,
        falseInput: this.falseInput || null,
        defaultInput: this.defaultInput || null,
        unit: this.unit || null,
        positiveOptions: this.positiveOptions || []
      };
      if (this.action === "create") {
        // Crear elemento
        this.imageTestsService
          .updateImageTest(this.id, {
            fields: firebase.firestore.FieldValue.arrayUnion(data),
            updatedAt: moment().format()
          })
          .then(() => {
            this.dismissModal().then(() => {
              this.toastService.show(
                "success",
                "Elemento de prueba de imagen añadido"
              );
            });
          })
          .catch(() => {
            this.toastService.show(
              "danger",
              "Error al añadir elemento de prueba de imagen"
            );
          });
      } else {
        // Editar elemento
        const fieldsArray = this.imageTest.fields;
        fieldsArray[this.index] = data;
        this.imageTestsService
          .updateImageTest(this.id, {
            fields: fieldsArray,
            updatedAt: moment().format()
          })
          .then(() => {
            this.dismissModal().then(() => {
              this.toastService.show(
                "success",
                "Elemento de prueba de imagen editado"
              );
            });
          })
          .catch(() => {
            this.toastService.show(
              "danger",
              "Error al editar elemento de prueba de imagen"
            );
          });
      }
    } else {
      this.toastService.show("danger", "Todos los campos son obligatorios");
    }
  }*/

  dismissModal(): Promise<any> {
    return this.modalController.dismiss();
  }

  ngOnDestroy(): void {
    if (this.action === "edit") {
      this.imageTestSub.unsubscribe();
    }
  }
}
