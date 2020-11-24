import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { ImageTestsService } from "src/app/services/image-tests.service";
import { ModalController } from "@ionic/angular";
import { ToastService } from "src/app/services/toast.service";
import { ImageTestsElementsService } from "src/app/services/image-tests-elements.service";
import * as firebase from "firebase/app";
import * as moment from "moment";
import { Subscription } from "rxjs";
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
})
export class CreatePage implements OnInit {

  id: string;
  action: string;

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
  defaultOption: string;

  imageTest: any;

  relatedTestsData: any;
  relatedDiseasesData: any;

  constructor(
    private imageTestsElementsService: ImageTestsElementsService,
    private modalController: ModalController,
    private toastService: ToastService,
    private activatedRoute: ActivatedRoute
  ) {
    this.id = this.activatedRoute.snapshot.paramMap.get("id");
  }

  ngOnInit() {

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
        defaultOption: this.defaultOption || null,
        relatedTests: [],
        isIllustrated: false,
        positiveOptions: this.positiveOptions || []
      };

      // Crear elemento
      this.imageTestsElementsService
        .createImageTestElement(data)
        .then(() => {

          this.toastService.show(
            "success",
            "Elemento de prueba de imagen añadido"
          );

        })
        .catch(() => {
          this.toastService.show(
            "danger",
            "Error al añadir elemento de prueba de imagen"
          );
        });

    } else {
      this.toastService.show("danger", "Todos los campos son obligatorios");
    }
  }

  dismissModal(): Promise<any> {
    return this.modalController.dismiss();
  }

  ngOnDestroy(): void {

  }

}
