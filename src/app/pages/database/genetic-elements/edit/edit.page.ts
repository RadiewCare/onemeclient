import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { ToastService } from "src/app/services/toast.service";
import { GeneticElementsService } from "src/app/services/genetic-elements.service";
import { Subscription, Observable } from "rxjs";
import { AlertController } from "@ionic/angular";
import { PolymorphismsService } from "src/app/services/polymorphisms.service";
import { DiseasesService } from "src/app/services/diseases.service";
import * as firebase from "firebase/app";

@Component({
  selector: "app-edit",
  templateUrl: "./edit.page.html",
  styleUrls: ["./edit.page.scss"]
})
export class EditPage implements OnInit {
  id: string;

  geneticVariants: Observable<any>;

  geneticElement$: Observable<any>;
  geneticElement: any;
  geneticElementData;
  geneticElementSub: Subscription;

  diseaseName: string;
  geneticVariant: any;
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

  url: string;

  constructor(
    private router: Router,
    private geneticElementsService: GeneticElementsService,
    private polymorphismsService: PolymorphismsService,
    private toastService: ToastService,
    private activatedRoute: ActivatedRoute,
    private alertController: AlertController,
    private diseasesService: DiseasesService
  ) { }

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.paramMap.get("id");
    this.getGeneticElement();
    this.getPolymorphisms();
  }

  getGeneticElement() {
    this.geneticElementsService
      .getGeneticElementData(this.id)
      .then((geneticElement) => {
        console.log(geneticElement.data());

        this.geneticElement = geneticElement.data();
        this.polymorphismsData = this.geneticElement.geneticVariant;
        this.diseaseName = this.geneticElement.disease.name;
        this.url = `/database/diseases/edit/${this.geneticElement.disease.id}`;
        this.polymorphismsService
          .getPolymorphismData(this.geneticElement.geneticVariant.id)
          .then((gv) => {
            this.impliedGenes = gv.data().genes;
          });
        this.highRiskAllelesFather = this.geneticElement.highRiskAlleles.father;
        this.highRiskAllelesMother = this.geneticElement.highRiskAlleles.mother;
        this.mediumRiskAllelesFather = this.geneticElement.mediumRiskAlleles.father;
        this.mediumRiskAllelesMother = this.geneticElement.mediumRiskAlleles.mother;
        this.lowRiskAllelesFather = this.geneticElement.lowRiskAlleles.father;
        this.lowRiskAllelesMother = this.geneticElement.lowRiskAlleles.mother;
        this.highRiskOddRatio = this.geneticElement.highRiskOddRatio;
        this.mediumRiskOddRatio = this.geneticElement.mediumRiskOddRatio;
        this.lowRiskOddRatio = this.geneticElement.lowRiskOddRatio;
        this.comment = this.geneticElement.comment;
        this.bibliography = this.geneticElement.bibliography;
      });
  }

  getPolymorphisms() {
    this.polymorphisms = this.polymorphismsService.getPolymorphisms();
  }

  getGenes() {
    this.impliedGenes = this.polymorphismsData.genes;
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
        .updateGeneticElement(this.id, data)
        .then(() => {
          this.router
            .navigate([
              `/database/diseases/edit/${this.geneticElement.disease.id}`
            ])
            .then(() => {
              this.toastService.show(
                "success",
                "Elemento genético editado con éxito"
              );
            });
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

  async delete() {
    const alert = await this.alertController.create({
      header: "¿Estás seguro?",
      message: "Pulse aceptar para eliminar el elemento genético",
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
            this.diseasesService
              .updateDisease(this.geneticElement.disease.id, {
                geneticElements: firebase.firestore.FieldValue.arrayRemove({
                  id: this.geneticElement.id,
                  name: this.geneticElement.geneticVariant.name
                })
              })
              .then(() => {
                this.geneticElementsService
                  .deleteGeneticElement(this.id)
                  .then(() => {
                    this.router.navigate(["/database/genetic-elements"]);
                    this.toastService.show(
                      "success",
                      "Elemento genético eliminado con éxito"
                    );
                  })
                  .catch(() => {
                    this.toastService.show(
                      "danger",
                      "Error: Ha hablido algún error al eliminar el elemento genético, inténtelo más tarde"
                    );
                  });
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
}
