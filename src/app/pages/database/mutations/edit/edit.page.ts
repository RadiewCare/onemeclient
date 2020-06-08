import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastService } from "src/app/services/toast.service";
import { Subscription } from "rxjs";
import { AlertController } from "@ionic/angular";
import * as moment from "moment";
import { MutationsService } from "src/app/services/mutations.service";

@Component({
  selector: "app-edit",
  templateUrl: "./edit.page.html",
  styleUrls: ["./edit.page.scss"]
})
export class EditPage implements OnInit {
  id: string;

  geneticVariant: any;
  geneticVariantSub: Subscription;

  name: string;
  formalName: string;
  genes: string[] = [];
  position: number;
  chromosome: number;

  temporaryGene: string;
  constructor(
    private mutationsService: MutationsService,
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
    this.geneticVariantSub = this.mutationsService
      .getMutation(this.id)
      .subscribe((geneticVariant) => {
        this.name = geneticVariant.name;
        this.formalName = geneticVariant.formalName;
        this.genes = geneticVariant.genes;
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
        position: this.position,
        chromosome: this.chromosome,
        updatedAt: moment().format()
      };

      return await this.mutationsService
        .updateMutation(this.id, this.geneticVariant)
        .then(() => {
          this.router.navigate(["/database/mutations"]);
          this.toastService.show("success", "Mutación editada con éxito");
        })
        .catch(() => {
          this.toastService.show(
            "danger",
            "Error: Ha habido algún error al editar la mutación, inténtelo más tarde"
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
      message: "Pulse aceptar para eliminar la mutación",
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
            this.router.navigate(["/database/mutations"]);
            this.mutationsService
              .deleteMutation(this.id)
              .then(() => {
                this.toastService.show(
                  "success",
                  "Mutación eliminada con éxito"
                );
              })
              .catch(() => {
                this.toastService.show(
                  "danger",
                  "Error: Ha habido algún error al eliminar la mutación, inténtelo más tarde"
                );
              });
          }
        }
      ]
    });

    await alert.present();
  }
}
