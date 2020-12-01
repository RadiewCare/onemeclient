import { Component, OnDestroy, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { Observable, Subscription } from 'rxjs';
import { SynlabCatalogService } from 'src/app/services/synlab-catalog.service';

@Component({
  selector: 'app-synlab-catalog',
  templateUrl: './synlab-catalog.page.html',
  styleUrls: ['./synlab-catalog.page.scss'],
})
export class SynlabCatalogPage implements OnInit, OnDestroy {

  analysisElementsSub: Subscription;
  analysisElements$: Observable<any>;
  analysisElements = [];
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

  constructor(private analisysElementsService: SynlabCatalogService, private loadingController: LoadingController) { }

  ngOnInit() {

  }

  ionViewDidEnter() {
    this.queryElements = null;
    this.getAnalysisElements();
  }

  async getAnalysisElements() {
    this.presentLoading();
    let iterator = 0;
    await this.analisysElementsService.getClinicAnalysisElementsList().then(data => {
      const datos = data.docs.map(element => element = element.data());
      this.analysisElements = [...datos]
    });
    this.loadingController.dismiss();
  }

  onSearchChange(query: string) {
    if (query.length > 0) {
      this.queryElements = this.analysisElements.filter((analysisElement) =>
        analysisElement.DESCRIPCION.toLowerCase().includes(query.toLowerCase()) || analysisElement.CODIGO.toString().includes(query.toLowerCase())
      );
    } else {
      this.queryElements = null;
    }
  }

  toggleInfo(index: string) {
    if (this.queryElements) {
      if (!this.queryElements[index].visible) {
        this.queryElements[index].visible = true;
      } else {
        this.queryElements[index].visible = false;
      }
    } else {
      if (!this.analysisElements[index].visible) {
        this.analysisElements[index].visible = true;
      } else {
        this.analysisElements[index].visible = false;
      }
    }

  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      message: 'Cargando...'
    });
    await loading.present();
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
    if (this.analysisElementsSub) {

      this.analysisElementsSub.unsubscribe();
    }

  }
} 
