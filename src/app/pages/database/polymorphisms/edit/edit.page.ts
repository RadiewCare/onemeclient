import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastService } from "src/app/services/toast.service";
import { Subscription } from "rxjs";
import { AlertController } from "@ionic/angular";
import * as moment from "moment";
import { PolymorphismsService } from "src/app/services/polymorphisms.service";

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
    private polymorphismsService: PolymorphismsService,
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
    this.geneticVariantSub = this.polymorphismsService
      .getPolymorphism(this.id)
      .subscribe((geneticVariant) => {
        this.name = geneticVariant.name;
        this.formalName = geneticVariant.formalName || null;
        this.genes = geneticVariant.genes || null;
        this.position = geneticVariant.position || null;
        this.chromosome = geneticVariant.chromosome || null;
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
    if (this.name === undefined) {
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

      return await this.polymorphismsService
        .updatePolymorphism(this.id, this.geneticVariant)
        .then(() => {
          this.router.navigate(["/database/polymorphisms"]);
          this.toastService.show("success", "Polimorfismo editada con éxito");
        })
        .catch((error) => {
          this.toastService.show(
            "danger",
            "Error: Ha habido algún error al editar el polimorfismo, inténtelo más tarde: " +
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
      message: "Pulse aceptar para eliminar el polimorfismo",
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
            this.router.navigate(["/database/polymorphisms"]);
            this.polymorphismsService
              .deletePolymorphism(this.id)
              .then(() => {
                this.toastService.show(
                  "success",
                  "Polimorfismo eliminado con éxito"
                );
              })
              .catch(() => {
                this.toastService.show(
                  "danger",
                  "Error: Ha hablido algún error al eliminar el polimorfismo, inténtelo más tarde"
                );
              });
          }
        }
      ]
    });

    await alert.present();
  }
}
