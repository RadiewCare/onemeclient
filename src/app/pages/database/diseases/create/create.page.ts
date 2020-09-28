import { Component, OnInit } from "@angular/core";
import { ToastService } from "src/app/services/toast.service";
import { Router } from "@angular/router";
import * as moment from "moment";
import { DiseasesService } from "src/app/services/diseases.service";

@Component({
  selector: "app-create",
  templateUrl: "./create.page.html",
  styleUrls: ["./create.page.scss"]
})
export class CreatePage implements OnInit {
  name: string;
  highRiskExplanation: string;
  mediumRiskExplanation: string;
  lowRiskExplanation: string;

  constructor(
    private geneticDiseasesService: DiseasesService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit() {}

  save() {
    if (
      this.name !== undefined &&
      this.name.length > 0 &&
      this.highRiskExplanation !== undefined &&
      this.highRiskExplanation.length > 0 &&
      this.mediumRiskExplanation !== undefined &&
      this.mediumRiskExplanation.length > 0 &&
      this.lowRiskExplanation !== undefined &&
      this.lowRiskExplanation.length > 0
    ) {
      this.geneticDiseasesService
        .createDisease({
          name: this.name,
          highRiskExplanation: this.highRiskExplanation,
          mediumRiskExplanation: this.mediumRiskExplanation,
          lowRiskExplanation: this.lowRiskExplanation,
          createdAt: moment().format()
        })
        .then(() => {
          this.router.navigate(["/database/diseases"]).then(() => {
            this.toastService.show("success", "Enfermedad creada con éxito");
          });
        });
    } else {
      this.toastService.show("danger", "Error: Rellene todos los campos");
    }
  }
}
