import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription, Observable } from "rxjs";
import { ClinicAnalysisElementsService } from "src/app/services/clinic-analysis-elements.service";

@Component({
  selector: "app-analysis-elements",
  templateUrl: "./analysis-elements.page.html",
  styleUrls: ["./analysis-elements.page.scss"]
})
export class AnalysisElementsPage implements OnInit, OnDestroy {
  analysisElementsSub: Subscription;
  analysisElements$: Observable<any>;
  analysisElements: any;
  queryElements: any;
  listView = true;

  gridApi: any;

  columnDefs = [
    {
      headerName: "Nombre",
      field: "name",
      sortable: true,
      filter: true,
      editable: true
    },
    {
      headerName: "Categoría",
      field: "category",
      sortable: true,
      filter: true,
      editable: true
    },
    {
      headerName: "Unidad",
      field: "metricUnit",
      sortable: true,
      filter: true,
      editable: true
    }
  ];

  defaultColDef = {
    resizable: true,
    sortable: true,
    filter: true,
    editable: true,
    minWidth: 100
  };

  constructor(private analisysElementsService: ClinicAnalysisElementsService) {}

  ngOnInit() {
    this.getAnalysisElements();
  }

  getAnalysisElements() {
    this.analysisElements$ = this.analisysElementsService.getClinicAnalysisElements();
    this.analysisElementsSub = this.analysisElements$.subscribe(
      (analysisElements) => {
        this.analysisElements = analysisElements;
      }
    );
  }

  onSearchChange(query: string) {
    if (query.length > 0) {
      this.queryElements = this.analysisElements.filter((analysisElement) =>
        analysisElement.name.toLowerCase().includes(query.toLowerCase())
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

  ngOnDestroy(): void {
    this.analysisElementsSub.unsubscribe();
  }
}
