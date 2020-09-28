import { Component, OnInit, Input } from "@angular/core";
import { DiseasesService } from "src/app/services/diseases.service";
import { Observable, Subscription } from "rxjs";
import { GeneticElementsService } from "src/app/services/genetic-elements.service";
import { ModalController } from "@ionic/angular";
import { ToastService } from "src/app/services/toast.service";
import { PolymorphismsService } from "src/app/services/polymorphisms.service";

@Component({
  selector: "app-add-genetic-element",
  templateUrl: "./add-genetic-element.page.html",
  styleUrls: ["./add-genetic-element.page.scss"]
})
export class AddGeneticElementPage implements OnInit {
  @Input() id: string;

  disease: any;

  geneticElements$: Observable<any>;
  geneticElements: any;
  geneticElementsData;
  geneticElementsSub: Subscription;

  diseaseName: string;
  geneticVariant: any;
  genes: string[] = [];
  highRiskAllelesFather: string;
  highRiskAllelesMother: string;
  mediumRiskAllelesFather: string;
  mediumRiskAllelesMother: string;
  lowRiskAllelesFather: string;
  lowRiskAllelesMother: string;
  highRiskOddRatio: number;
  mediumRiskOddRatio: number;
  lowRiskOddRatio: number;
  comment: string;
  bibliography: string;

  polymorphisms: Observable<any>;
  polymorphismsData: any;

  impliedGenes: string[];

  constructor(
    private diseasesService: DiseasesService,
    private geneticElementsService: GeneticElementsService,
    private modalController: ModalController,
    private toastService: ToastService,
    private polymorphismsService: PolymorphismsService
  ) {}

  ngOnInit() {
    this.getDisease();
    this.getGeneticElements();
    this.getPolymorphisms();
  }

  getDisease() {
    this.diseasesService.getDiseaseData(this.id).then((diseaseData) => {
      this.disease = diseaseData.data();
    });
  }

  getGeneticElements() {
    this.geneticElements$ = this.geneticElementsService.getGeneticElements();
  }

  getPolymorphisms() {
    this.polymorphisms = this.polymorphismsService.getPolymorphisms();
  }

  getGenes() {
    this.impliedGenes = this.polymorphismsData.genes;
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  isValid() {
    if (
      this.polymorphismsData === undefined ||
      this.highRiskAllelesFather === undefined ||
      this.highRiskAllelesMother === undefined ||
      this.mediumRiskAllelesFather === undefined ||
      this.mediumRiskAllelesMother === undefined ||
      this.lowRiskAllelesFather === undefined ||
      this.lowRiskAllelesMother === undefined ||
      this.highRiskOddRatio === undefined ||
      this.mediumRiskOddRatio === undefined ||
      this.lowRiskOddRatio === undefined
    ) {
      return false;
    } else {
      return true;
    }
  }

  save() {
    if (this.isValid()) {
      const data = {
        disease: { id: this.id, name: this.disease.name },
        geneticVariant: {
          id: this.polymorphismsData.id,
          name: this.polymorphismsData.name
        },
        genes: this.impliedGenes,
        highRiskAlleles: {
          father: this.highRiskAllelesFather,
          mother: this.highRiskAllelesMother
        },
        highRiskAllelesPair: `(${this.highRiskAllelesFather},${this.highRiskAllelesMother})`,
        mediumRiskAlleles: {
          father: this.mediumRiskAllelesFather,
          mother: this.mediumRiskAllelesMother
        },
        mediumRiskAllelesPair: `(${this.mediumRiskAllelesFather},${this.mediumRiskAllelesMother})`,
        lowRiskAlleles: {
          father: this.lowRiskAllelesFather,
          mother: this.lowRiskAllelesMother
        },
        lowRiskAllelesPair: `(${this.lowRiskAllelesFather},${this.lowRiskAllelesMother})`,
        highRiskOddRatio: this.highRiskOddRatio,
        mediumRiskOddRatio: this.mediumRiskOddRatio,
        lowRiskOddRatio: this.lowRiskOddRatio,
        comment: this.comment,
        bibliography: this.bibliography
      };
      this.geneticElementsService
        .createGeneticElement(data, this.disease.id)
        .then(() => {
          this.dismissModal();
          this.toastService.show(
            "success",
            "Elemento genético añadido con éxito"
          );
        })
        .catch(() => {
          this.toastService.show(
            "danger",
            "Error al añadir el elemento genético"
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
