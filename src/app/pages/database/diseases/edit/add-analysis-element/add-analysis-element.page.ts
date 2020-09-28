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

  constructor(
    private diseasesService: DiseasesService,
    private analysisElementsService: ClinicAnalysisElementsService,
    private modalController: ModalController,
    private toastService: ToastService
  ) {}

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
      const array = [];
      this.analysisElementsData.forEach((element) => {
        array.push({ id: element.id, name: element.name });
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
