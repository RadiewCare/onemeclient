import { Component, OnInit } from "@angular/core";
import { ToastService } from "src/app/services/toast.service";
import { Router } from "@angular/router";
import * as moment from "moment";
import { MutationsService } from "src/app/services/mutations.service";

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
    private mutationsService: MutationsService
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

  save() {
    if (this.isValid()) {
      this.geneticVariant = {
        name: this.name,
        formalName: this.formalName,
        genes: this.genes,
        position: this.position,
        chromosome: this.chromosome,
        createdAt: moment().format()
      };

      this.mutationsService
        .createMutation(this.geneticVariant)
        .then(() => {
          this.router.navigate(["/database/mutations"]);
          this.toastService.show("success", "Mutación creada con éxito");
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
