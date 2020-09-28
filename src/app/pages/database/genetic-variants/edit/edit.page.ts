import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastService } from "src/app/services/toast.service";
import { GeneticVariantsService } from "src/app/services/genetic-variants.service";
import { Subscription } from "rxjs";
import { AlertController } from "@ionic/angular";
import * as moment from "moment";

@Component({
  selector: "app-edit",
  templateUrl: "./edit.page.html",
  styleUrls: ["./edit.page.scss"]
})
export class EditPage implements OnInit, OnDestroy {
  id: string;

  geneticVariant: any;
  geneticVariantSub: Subscription;

  name: string;
  formalName: string;
  genes: string[] = [];
  type: string;
  position: number;
  chromosome: number;

  temporaryGene: string;

  constructor(
    private geneticVariantsService: GeneticVariantsService,
    private activatedRoute: ActivatedRoute,
    private toastService: ToastService,
    private alertController: AlertController,
    private router: Router
  ) {}

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.paramMap.get("id");
    this.getGeneticVariant();
  }

  getGeneticVariant() {
    this.geneticVariantSub = this.geneticVariantsService
      .getGeneticVariant(this.id)
      .subscribe((geneticVariant) => {
        this.name = geneticVariant.name;
        this.formalName = geneticVariant.formalName;
        this.genes = geneticVariant.genes;
        this.type = geneticVariant.type;
        this.position = geneticVariant.position;
        this.chromosome = geneticVariant.chromosome;
      });
  }

  addGene(gene: string) {
    gene = gene.toUpperCase();

    if (!this.genes.includes(gene)) {
      this.genes.push(gene);
    } else {
      this.toastService.show("danger", "Error: El gen ya está incluido");
    }

    this.temporaryGene = "";
  }

  deleteGene(gene: string) {
    const index = this.genes.indexOf(gene);
    if (index > -1) {
      this.genes.splice(index, 1);
    }
  }

  isValid(): boolean {
    if (
      this.name === undefined ||
      this.formalName === undefined ||
      this.genes.length === 0 ||
      this.type === undefined ||
      this.position === undefined ||
      this.chromosome === undefined
    ) {
      return false;
    } else {
      return true;
    }
  }

  async save() {
    if (this.isValid()) {
      this.geneticVariant = {
        name: this.name,
        formalName: this.formalName,
        genes: this.genes,
        type: this.type,
        position: this.position,
        chromosome: this.chromosome,
        updatedAt: moment().format()
      };

      return await this.geneticVariantsService
        .updateGeneticVariant(this.id, this.geneticVariant)
        .then(() => {
          this.router.navigate(["/database/genetic-variants"]);
          this.toastService.show(
            "success",
            "Variante genética editada con éxito"
          );
        })
        .catch(() => {
          this.toastService.show(
            "danger",
            "Error: Ha habido algún error al editar la variante genética, inténtelo más tarde"
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
      message: "Pulse aceptar para eliminar la variante genética",
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
            this.geneticVariantSub.unsubscribe();
            this.router.navigate(["/database/genetic-variants"]);
            this.geneticVariantsService
              .deleteGeneticVariant(this.id)
              .then(() => {
                this.toastService.show(
                  "success",
                  "Variante genética eliminada con éxito"
                );
              })
              .catch(() => {
                this.toastService.show(
                  "danger",
                  "Error: Ha hablido algún error al eliminar la variante genética, inténtelo más tarde"
                );
              });
          }
        }
      ]
    });

    await alert.present();
  }

  ngOnDestroy() {
    // this.geneticVariantSub.unsubscribe();
  }
}
