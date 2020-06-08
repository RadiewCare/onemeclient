import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { ImageTestsService } from "src/app/services/image-tests.service";
import { ModalController } from "@ionic/angular";
import { ToastService } from "src/app/services/toast.service";
import { ImageTestsElementsService } from "src/app/services/image-tests-elements.service";
import * as firebase from "firebase/app";
import * as moment from "moment";
import { Subscription } from "rxjs";

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

  constructor(
    private imageTestsService: ImageTestsService,
    private imageTestsElementsService: ImageTestsElementsService,
    private modalController: ModalController,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    if (this.action === "edit") {
      this.loadElement();
    }
  }

  loadElement() {
    this.imageTestSub = this.imageTestsService
      .getImageTest(this.id)
      .subscribe((data) => {
        this.imageTest = data;
        this.name = data.fields[this.index].name;
        this.type = data.fields[this.index].type;
        this.options = data.fields[this.index].options;
        this.min = data.fields[this.index].min;
        this.max = data.fields[this.index].max;
        this.trueInput = data.fields[this.index].trueInput;
        this.falseInput = data.fields[this.index].falseInput;
        this.defaultInput = data.fields[this.index].defaultInput;
        this.unit = data.fields[this.index].unit;
        this.positiveOptions = data.fields[this.index].positiveOptions;
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

        default:
          break;
      }
    } else {
      return false;
    }
  }

  save() {
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
  }

  dismissModal(): Promise<any> {
    return this.modalController.dismiss();
  }

  ngOnDestroy(): void {
    if (this.action === "edit") {
      this.imageTestSub.unsubscribe();
    }
  }
}
