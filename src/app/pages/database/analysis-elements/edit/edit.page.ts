import { Component, OnInit, OnDestroy } from "@angular/core";
import { AlertController } from "@ionic/angular";
import { ClinicAnalysisElementsService } from "src/app/services/clinic-analysis-elements.service";
import { Router, ActivatedRoute } from "@angular/router";
import { ToastService } from "src/app/services/toast.service";
import { Observable, Subscription } from "rxjs";
import * as moment from "moment";

@Component({
  selector: "app-edit",
  templateUrl: "./edit.page.html",
  styleUrls: ["./edit.page.scss"]
})
export class EditPage implements OnInit, OnDestroy {
  id: string;

  analysisElement$: Observable<any>;
  analysisElement: any;
  analysisElementSub: Subscription;

  name: string;
  category: string;
  metricUnit: string;
  lowerLevel: number;
  upperLevel: number;
  lowerAge: number;
  upperAge: number;
  sex: string;
  information: string;

  ranges = [];

  constructor(
    private analysisElementsService: ClinicAnalysisElementsService,
    private router: Router,
    private toastService: ToastService,
    private alertController: AlertController,
    private activatedRoute: ActivatedRoute
  ) {
    this.id = this.activatedRoute.snapshot.params.id;
  }

  ngOnInit() {

  }

  ionViewDidEnter() {
    this.getAnalysisElement();
  }

  getAnalysisElement() {
    this.analysisElement$ = this.analysisElementsService.getClinicAnalysisElement(
      this.id
    );
    this.analysisElementSub = this.analysisElement$.subscribe(
      (analysisElement) => {
        this.analysisElement = analysisElement;
        this.name = this.analysisElement.name;
        this.category = this.analysisElement.category;
        this.metricUnit = this.analysisElement.metricUnit;
        this.ranges = this.analysisElement.ranges || [];
        this.information = this.analysisElement.information || null;
      }
    );
  }

  addRange() {
    if (this.lowerLevel || this.upperLevel) {
      this.ranges.push({
        sex: this.sex,
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
      this.name &&
      this.name.length > 0 &&
      this.category &&
      this.category.length > 0 &&
      this.metricUnit &&
      this.metricUnit.length > 0
    ) {
      const element = {
        name: this.name,
        category: this.category,
        metricUnit: this.metricUnit,
        ranges: this.ranges,
        information: this.information,
        updatedAt: moment().format()
      };
      console.log(element);

      this.analysisElementsService
        .updateClinicAnalysisElement(this.id, element)
        .then(() => {
          this.router.navigate(["/database/analysis-elements"]).then(() => {
            this.toastService.show(
              "success",
              "Elemento de análisis clínico editado con éxito"
            );
          });
        })
        .catch(() => {
          this.toastService.show(
            "danger",
            "Error al editar el elemento de análisis clínico"
          );
        });
    } else {
      this.toastService.show("danger", "Error: Campos erróneos o incompletos");
    }
  }

  async delete() {
    const alert = await this.alertController.create({
      header: "¿Estás seguro?",
      message: "Pulse aceptar para eliminar el elemento de análisis",
      buttons: [
        {
          text: "Cancelar",
          role: "cancel",
          cssClass: "secondary",
          handler: (blah) => { }
        },
        {
          text: "Aceptar",
          handler: () => {
            this.analysisElementsService
              .deleteClinicAnalysisElement(this.id)
              .then(async () => {
                this.analysisElementSub.unsubscribe();
                this.router.navigate(["/database/analysis-elements"]);

                this.toastService.show(
                  "success",
                  "Elemento de análisis eliminado con éxito"
                );
              })
              .catch(() => {
                this.toastService.show(
                  "danger",
                  "Error: Ha hablido algún error al eliminar el elemento de análisis, inténtelo más tarde"
                );
              })
              .catch(() => {
                this.toastService.show(
                  "danger",
                  "Error al eliminar referencia en enfermedad"
                );
              });
          }
        }
      ]
    });

    await alert.present();
  }

  ngOnDestroy() {
    if (this.analysisElementSub) {
      this.analysisElementSub.unsubscribe();
    }
  }
}
