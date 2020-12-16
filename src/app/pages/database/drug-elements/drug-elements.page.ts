import { Component, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { DrugElementsService } from "src/app/services/drug-elements.service";
import { ImportPage } from "./import/import.page";
import { ModalController } from "@ionic/angular";

@Component({
  selector: "app-drug-elements",
  templateUrl: "./drug-elements.page.html",
  styleUrls: ["./drug-elements.page.scss"]
})
export class DrugElementsPage implements OnInit {
  geneticElementsSub: Subscription;
  geneticElements: any;
  queryElements: any;
  listView = true;

  gridApi: any;

  columnDefs = [
    {
      headerName: "Elemento",
      field: "drugElement"
    },
    {
      headerName: "Genes",
      field: "genes"
    },
    {
      headerName: "Variante",
      field: "geneticVariant"
    },
    {
      headerName: "Riesgo alto",
      field: "highRiskAllelesPair"
    },
    {
      headerName: "Riesgo medio",
      field: "mediumRiskAllelesPair"
    },
    {
      headerName: "Riesgo favorable",
      field: "lowRiskAllelesPair"
    },
    {
      headerName: "Efecto fármaco-metabólico",
      field: "effect"
    }
  ];

  defaultColDef = {
    resizable: true,
    sortable: true,
    filter: true,
    editable: true,
    minWidth: 100
  };

  constructor(
    private drugElementsService: DrugElementsService,
    private modalController: ModalController
  ) { }

  ngOnInit() { }

  ionViewDidEnter() {
    this.drugElementsService.getDrugElements().subscribe((data) => {
      this.geneticElements = data;
    });
  }

  onSearchChange(query: string) {
    if (query.length > 0) {
      this.queryElements = this.geneticElements.filter(
        (geneticElement) =>
          this.removeAccents(geneticElement.drugElement
            .toLowerCase())
            .includes(this.removeAccents(query.toLowerCase())) ||
          (geneticElement.geneticVariant &&
            this.removeAccents(geneticElement.geneticVariant
              .toLowerCase())
              .includes(this.removeAccents(query.toLowerCase())))
      );
    } else {
      this.queryElements = null;
    }
  }

  removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  changeView(option: string) {
    option === "list" ? (this.listView = true) : (this.listView = false);
  }

  sizeToFit() {
    this.gridApi.sizeColumnsToFit();
  }

  async importDrugElements() {
    const modal = await this.modalController.create({
      component: ImportPage
    });
    return await modal.present();
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.sizeToFit();
  }
}
