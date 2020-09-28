import { Component, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { GeneticElementsService } from "src/app/services/genetic-elements.service";

@Component({
  selector: "app-genetic-elements",
  templateUrl: "./genetic-elements.page.html",
  styleUrls: ["./genetic-elements.page.scss"]
})
export class GeneticElementsPage implements OnInit {
  geneticElementsSub: Subscription;
  geneticElements: any;
  queryElements: any;
  listView = true;

  gridApi: any;

  columnDefs = [
    {
      headerName: "Elemento",
      field: "analysisElement"
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
      headerName: "Prob. riesgo alto",
      field: "highRiskOddRatio"
    },
    {
      headerName: "Prob. riesgo medio",
      field: "mediumRiskOddRatio"
    },
    {
      headerName: "Prob. riesgo favorable",
      field: "lowRiskOddRatio"
    },
    {
      headerName: "Comentario",
      field: "comment"
    },
    {
      headerName: "Bibliografía",
      field: "bibliography"
    }
  ];

  defaultColDef = {
    resizable: true,
    sortable: true,
    filter: true,
    editable: true,
    minWidth: 100
  };

  constructor(private geneticElementsService: GeneticElementsService) {}

  ngOnInit() {}

  ionViewDidEnter() {
    this.geneticElementsService.getGeneticElements().subscribe((data) => {
      this.geneticElements = data;
    });
  }

  onSearchChange(query: string) {
    if (query.length > 0) {
      this.queryElements = this.geneticElements.filter(
        (geneticElement) =>
          geneticElement.analysisElement.includes(query) ||
          geneticElement.geneticVariant.includes(query)
      );
    } else {
      this.queryElements = null;
    }
  }

  changeView(option: string) {
    option === "list" ? (this.listView = true) : (this.listView = false);
  }

  sizeToFit() {
    this.gridApi.sizeColumnsToFit();
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.sizeToFit();
  }
}
