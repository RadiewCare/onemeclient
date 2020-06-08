import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ClinicAnalysisElementsService } from "src/app/services/clinic-analysis-elements.service";
import { ToastService } from "src/app/services/toast.service";
import * as moment from "moment";

@Component({
  selector: "app-create",
  templateUrl: "./create.page.html",
  styleUrls: ["./create.page.scss"]
})
export class CreatePage implements OnInit {
  name: string;
  category: string;
  metricUnit: string;
  lowerLevel: number;
  upperLevel: number;
  lowerAge: number;
  upperAge: number;
  sex: string;

  ranges = [];

  constructor(
    private analysisElementsService: ClinicAnalysisElementsService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit() {}

  addRange() {
    if (this.lowerLevel || this.upperLevel) {
      this.ranges.push({
        sex: this.sex || null,
        lowerAge: this.lowerAge || null,
        upperAge: this.upperAge || null,
        lowerLevel: this.lowerLevel || null,
        upperLevel: this.upperLevel || null
      });
    } else {
      this.toastService.show(
        "danger",
        "Al menos debes introducir valor mínimo ó máximo"
      );
    }
  }

  deleteRange(index: number) {
    this.ranges.splice(index, 1);
  }

  save() {
    if (
      this.name !== undefined &&
      this.name.length > 0 &&
      this.category !== undefined &&
      this.category.length > 0 &&
      this.metricUnit !== undefined &&
      this.metricUnit.length > 0
    ) {
      const element = {
        name: this.name,
        category: this.category,
        metricUnit: this.metricUnit,
        ranges: this.ranges,
        createdAt: moment().format()
      };
      console.log(element);

      this.analysisElementsService
        .createClinicAnalysisElement(element)
        .then(() => {
          this.router.navigate(["/database/analysis-elements"]).then(() => {
            this.toastService.show(
              "success",
              "Elemento de análisis clínico creado con éxito"
            );
          });
        })
        .catch(() => {
          this.toastService.show(
            "danger",
            "Error al crear el elemento de análisis clínico"
          );
        });
    } else {
      this.toastService.show("danger", "Error: Campos erróneos o incompletos");
    }
  }
}
