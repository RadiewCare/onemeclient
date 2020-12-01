import { Component, OnInit, Input } from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { DiseasesService } from "src/app/services/diseases.service";
import { ClinicAnalysisElementsService } from "src/app/services/clinic-analysis-elements.service";
import { ModalController } from "@ionic/angular";
import { ToastService } from "src/app/services/toast.service";

@Component({
  selector: "app-add-analysis-element",
  templateUrl: "./add-analysis-element.page.html",
  styleUrls: ["./add-analysis-element.page.scss"]
})
export class AddAnalysisElementPage implements OnInit {
  @Input() id: string;

  disease: any;
  analysisElements$: Observable<any>;
  analysisElements: any;
  analysisElementsData;
  analysisElementsSub: Subscription;

  isCustom = false;

  ranges = [];

  lowerLevel: number;
  upperLevel: number;
  lowerAge: number;
  upperAge: number;
  sex: string;

  constructor(
    private diseasesService: DiseasesService,
    private analysisElementsService: ClinicAnalysisElementsService,
    private modalController: ModalController,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.getDisease();
    this.getAnalysisElements();
  }

  getDisease() {
    this.diseasesService.getDiseaseData(this.id).then((diseaseData) => {
      this.disease = diseaseData.data();
    });
  }

  getAnalysisElements() {
    this.analysisElements$ = this.analysisElementsService.getClinicAnalysisElements();
  }

  addRange() {
    if (this.lowerLevel || this.upperLevel) {
      this.ranges.push({
        sex: this.sex,
        lowerAge: this.lowerAge,
        upperAge: this.upperAge,
        lowerLevel: this.lowerLevel,
        upperLevel: this.upperLevel
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

  dismissModal() {
    this.modalController.dismiss();
  }

  isValid() {
    if (this.analysisElementsData === undefined) {
      return false;
    } else {
      return true;
    }
  }

  save() {
    if (this.isValid()) {
      const array = this.disease.analysisElements || [];
      this.analysisElementsData.forEach((element) => {
        array.push({ id: element.id, name: element.name, ranges: this.ranges });
      });
      const data = {
        analysisElements: array
      };
      this.diseasesService
        .updateDisease(this.disease.id, data)
        .then(() => {
          this.dismissModal();
          this.toastService.show(
            "success",
            "Elementos de análisis añadido con éxito"
          );
        })
        .catch(() => {
          this.toastService.show(
            "danger",
            "Error al añadir el elementos de análisis"
          );
        });
    } else {
      this.toastService.show(
        "danger",
        "Error: Hay campos erróneos o incompletos"
      );
    }
  }
}
