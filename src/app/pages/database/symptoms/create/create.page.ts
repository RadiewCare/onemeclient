import { Component, OnInit } from "@angular/core";
import * as moment from "moment";
import { SymptomsService } from "../../../../services/symptoms.service";
import { Router } from "@angular/router";
import { ToastService } from "../../../../services/toast.service";

@Component({
  selector: "app-create",
  templateUrl: "./create.page.html",
  styleUrls: ["./create.page.scss"]
})
export class CreatePage implements OnInit {
  name: string;
  symptom: any;

  constructor(
    private symptomsService: SymptomsService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit() {}

  isValid(): boolean {
    if (this.name === undefined) {
      return false;
    } else {
      return true;
    }
  }

  save() {
    if (this.isValid()) {
      this.symptom = {
        name: this.name,
        createdAt: moment().format()
      };

      this.symptomsService
        .createSymptom(this.symptom)
        .then(() => {
          this.router.navigate(["/database/symptoms"]);
          this.toastService.show("success", "Síntoma creado con éxito");
        })
        .catch((error) => {
          this.toastService.show("danger", "Error: " + error);
        });
    } else {
      this.toastService.show(
        "danger",
        "Error: Hay campos erróneos o incompletos"
      );
    }
  }
}
