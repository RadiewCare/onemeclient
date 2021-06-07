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
  elementCode: string;
  loinc: string;

  constructor(
    private analysisElementsService: ClinicAnalysisElementsService,
    private router: Router,
    private toastService: ToastService
  ) { }

  ngOnInit() { }

  save() {
    if (
      this.name !== undefined &&
      this.name.length > 0 &&
      this.elementCode !== undefined &&
      this.elementCode.length > 0
    ) {
      const element = {
        name: this.name,
        elementCode: this.elementCode,
        createdAt: moment().format(),
        loinc: this.loinc || null
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
