import { Component, OnInit } from "@angular/core";
import { ImageTestsService } from "src/app/services/image-tests.service";
import { ToastService } from "src/app/services/toast.service";
import { Router } from "@angular/router";
import * as moment from "moment";

@Component({
  selector: "app-create",
  templateUrl: "./create.page.html",
  styleUrls: ["./create.page.scss"]
})
export class CreatePage implements OnInit {
  name: string;

  constructor(
    private imageTestsService: ImageTestsService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit() {}

  save() {
    if (this.name !== undefined && this.name.length > 0) {
      this.imageTestsService
        .createImageTest({
          name: this.name,
          createdAt: moment().format()
        })
        .then(() => {
          this.router.navigate(["/database/image-tests"]).then(() => {
            this.toastService.show(
              "success",
              "Prueba de imagen creada con éxito"
            );
          });
        })
        .catch(() => {
          this.toastService.show(
            "danger",
            "Error al crear la prueba de imagen"
          );
        });
    } else {
      this.toastService.show("danger", "Error: Rellene todos los campos");
    }
  }
}
