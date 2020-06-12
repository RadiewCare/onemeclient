import { Component, OnInit, OnDestroy } from "@angular/core";
import { SymptomsService } from "../../../../services/symptoms.service";
import { ToastService } from "../../../../services/toast.service";
import { Router, ActivatedRoute } from "@angular/router";
import * as moment from "moment";
import { AlertController } from "@ionic/angular";
import { Subscription } from "rxjs";

@Component({
  selector: "app-edit",
  templateUrl: "./edit.page.html",
  styleUrls: ["./edit.page.scss"]
})
export class EditPage implements OnInit, OnDestroy {
  id: string;
  name: string;
  symptom: any;
  symptomSub: Subscription;

  constructor(
    private symptomsService: SymptomsService,
    private toastService: ToastService,
    private router: Router,
    private alertController: AlertController,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.paramMap.get("id");
    this.getSymptom();
  }

  getSymptom() {
    this.symptomSub = this.symptomsService
      .getSymptom(this.id)
      .subscribe((symptom) => {
        console.log(symptom);

        this.name = symptom.name;
      });
  }

  isValid(): boolean {
    if (this.name === undefined) {
      return false;
    } else {
      return true;
    }
  }

  async save() {
    if (this.isValid()) {
      this.symptom = {
        name: this.name,
        updatedAt: moment().format()
      };

      return await this.symptomsService
        .updateSymptom(this.id, this.symptom)
        .then(() => {
          this.router.navigate(["/database/symptoms"]);
          this.toastService.show("success", "Síntoma editado con éxito");
        })
        .catch((error) => {
          this.toastService.show(
            "danger",
            "Error: Ha habido algún error al editar el síntoma, inténtelo más tarde: " +
              error
          );
        });
    } else {
      this.toastService.show(
        "danger",
        "Error: Hay campos erróneos o incompletos"
      );
    }
  }

  async delete() {
    const alert = await this.alertController.create({
      header: "¿Estás seguro?",
      message: "Pulse aceptar para eliminar el síntoma",
      buttons: [
        {
          text: "Cancelar",
          role: "cancel",
          cssClass: "secondary",
          handler: (blah) => {}
        },
        {
          text: "Aceptar",
          handler: () => {
            this.symptomSub.unsubscribe();
            this.router.navigate(["/database/symptoms"]);
            this.symptomsService
              .deleteSymptom(this.id)
              .then(() => {
                this.toastService.show(
                  "success",
                  "Síntoma eliminado con éxito"
                );
              })
              .catch(() => {
                this.toastService.show(
                  "danger",
                  "Error: Ha hablido algún error al eliminar el síntoma, inténtelo más tarde"
                );
              });
          }
        }
      ]
    });

    await alert.present();
  }

  ngOnDestroy(): void {
    if (this.symptomSub) {
      this.symptomSub.unsubscribe();
    }
  }
}
