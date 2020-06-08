import { Component, OnInit } from "@angular/core";
import { ToastService } from "src/app/services/toast.service";
import { Router } from "@angular/router";
import * as moment from "moment";
import { PolymorphismsService } from "src/app/services/polymorphisms.service";

@Component({
  selector: "app-create",
  templateUrl: "./create.page.html",
  styleUrls: ["./create.page.scss"]
})
export class CreatePage implements OnInit {
  geneticVariant: any;

  name: string;
  formalName: string;
  genes: string[] = [];
  type: string;
  position: number;
  chromosome: number;

  temporaryGene: string;

  constructor(
    private toastService: ToastService,
    private router: Router,
    private polymorphismsService: PolymorphismsService
  ) {}

  ngOnInit() {}

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

  save() {
    if (this.isValid()) {
      this.geneticVariant = {
        name: this.name,
        formalName: this.formalName || null,
        genes: this.genes || null,
        position: this.position || null,
        chromosome: this.chromosome || null,
        createdAt: moment().format()
      };

      this.polymorphismsService
        .createPolymorphism(this.geneticVariant)
        .then(() => {
          this.router.navigate(["/database/polymorphisms"]);
          this.toastService.show("success", "Polimorfismo creado con éxito");
        })
        .catch((error) => {
          this.toastService.show("danger", "Error: " + error);
        });
    } else {
      this.toastService.show(
        "danger",
        "Error: Hay campos erróneos o incompletos"
      );
    }
  }
}
