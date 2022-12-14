import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { Router } from '@angular/router';
import { Observable, Subscription } from "rxjs";
import { LanguageService } from "src/app/services/language.service";
import { AuthService } from "src/app/services/auth.service";
import { DoctorsService } from "src/app/services/doctors.service";
import { SubjectsService } from "src/app/services/subjects.service";
import * as moment from "moment";
import { SubjectImageTestsService } from "src/app/services/subject-image-tests.service";
import { ReproductionTestsService } from "src/app/services/reproduction-tests.service";
import { ActivatedRoute } from "@angular/router";
import { LoadingController } from "@ionic/angular";
import { IonInfiniteScroll, IonVirtualScroll } from "@ionic/angular";
import { HttpClient } from '@angular/common/http';
import { AgGridAngular } from 'ag-grid-angular';
import {
  AgAreaSeriesOptions,
  AgChartLegendPosition,
  AgChartOptions,
} from 'ag-charts-community';
import { CellClickedEvent, ColDef, SideBarDef, ColGroupDef, GridReadyEvent, GridApi } from 'ag-grid-community';
import { IServerSideDatasource, IGetRowsParams, SetFilterValuesFuncParams, ISetFilter } from 'ag-grid-community';
import 'ag-grid-enterprise';

@Component({
  selector: "app-subjectsImageTestsMining",
  templateUrl: "./subjectsImageTestsMining.page.html",
  styleUrls: ["./subjectsImageTestsMining.page.scss"],
})
export class SubjectsImageTestsMiningPage implements OnInit, OnDestroy {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  @ViewChild(IonVirtualScroll) virtualScroll: IonVirtualScroll;
  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;

  user$: any;
  userData: any;
  userSub: Subscription;

  subjects: any;
  subjectsImageTest: any;
  /*subjectsStartAt: null;*/
  querySubjects: any;
  subjects$: Observable<any>;
  subjectsSub: Subscription;

  showShared: false;

  sharedSubjectsAnalytic: string[];
  sharedSubjectsGenetic: string[];
  sharedSubjectsImage: string[];
  sharedSubjectsPhenotypic: string[];
  sharedSubjectsReproduction: string[];

  sharedSubjects = [];

  sharedSubjectsData = [];
  originalSharedSubjectsData = [];

  centrosReferentes = [];

  originalSubjects: any;
  originalSubjectsImageTest: any;

  lastSubjects: any;

  currentCentros: any;
  currentFecha: any;
  currentOrder: any;
  currentQuery: any;

  initialDate: any;
  finalDate: any;

  order: string = "ninguno";

  currentDate: any;
  intervalDate: any;
  filterInterval = "always";

  aWeekAgo: any;
  twoWeeksAgo: any;
  aMonthAgo: any;
  threeMonthsAgo: any;
  sixMonthsAgo: any;
  aYearAgo: any;
  fiveYearsAgo: any;

  id: string;

  doctorName: string;

  doctorData: any;

  isSameClinic = false;
  frameworkComponents: any;

  private filterNombre = {
    values: (params: SetFilterValuesFuncParams) => {
      if (this.nombreTestFilter != null) {
        let nombreImageTestFilterAux = [];
        for (const status of this.nombreTestFilter) {
         nombreImageTestFilterAux.push(status.value);
          
        }
        params.success(nombreImageTestFilterAux);
      } else{
        params.success([]);
      }
    },
    comparator: (a: any, b: any) => {
      var valA = a.count;
      var valB = b.count;
      if (valA === valB) return 0;
      return valA > valB ? 1 : -1;
    },
    cellRenderer: (params) => {
      let item = this.nombreTestFilter.filter(i=>i.value==params.value);
      if (item.length != 0) {
        return `(${item[0].count}) ${params.value}`;
      }
    },
    defaultToNothingSelected: true,
    suppressSelectAll: true,
    refreshValuesOnOpen: true,
  };

  private filterElementoNombre  = {
    values: (params: SetFilterValuesFuncParams) => {
      if (this.elementoNameSubjectImageTestFilter != null) {
        let elementoNameSubjectImageTestFilterAux = [];
        for (const status of this.elementoNameSubjectImageTestFilter) {
          elementoNameSubjectImageTestFilterAux.push(status.value);
          
        }
        params.success(elementoNameSubjectImageTestFilterAux);
      } else{
        params.success([]);
      }
    },
    comparator: (a: any, b: any) => {
      var valA = a.count;
      var valB = b.count;
      if (valA === valB) return 0;
      return valA > valB ? 1 : -1;
    },
    cellRenderer: (params) => {
      let item = this.elementoNameSubjectImageTestFilter.filter(i=>i.value==params.value);
      if (item.length != 0) {
        return `(${item[0].count}) ${params.value}`;
      }
    },
    defaultToNothingSelected: true,
    suppressSelectAll: true,
    refreshValuesOnOpen: true,
  };

  private filterElementoStatus  = {
    values: (params: SetFilterValuesFuncParams) => {
      if (this.elementoStatusSubjectImageTestFilter != null) {
        let elementoStatusSubjectImageTestFilterAux = [];
        for (const status of this.elementoStatusSubjectImageTestFilter) {
          elementoStatusSubjectImageTestFilterAux.push(status.value);
          
        }
        params.success(elementoStatusSubjectImageTestFilterAux);
      } else{
        params.success([]);
      }
    },
    comparator: (a: any, b: any) => {
      var valA = a.count;
      var valB = b.count;
      if (valA === valB) return 0;
      return valA > valB ? 1 : -1;
    },
    cellRenderer: (params) => {
      let item = this.elementoStatusSubjectImageTestFilter.filter(i=>i.value==params.value);
      if (item.length != 0) {
        return `(${item[0].count}) ${params.value}`;
      }
    },
    defaultToNothingSelected: true,
    suppressSelectAll: true,
    refreshValuesOnOpen: true,
  };

  private filterElementoMarker  = {
    values: (params: SetFilterValuesFuncParams) => {
      if (this.elementoMarkerSubjectImageTestFilter != null) {
        let elementoMarkerSubjectImageTestFilterAux = [];
        for (const status of this.elementoMarkerSubjectImageTestFilter) {
          elementoMarkerSubjectImageTestFilterAux.push(status.value);
          
        }
        params.success(elementoMarkerSubjectImageTestFilterAux);
      } else{
        params.success([]);
      }
    },
    comparator: (a: any, b: any) => {
      var valA = a.count;
      var valB = b.count;
      if (valA === valB) return 0;
      return valA > valB ? 1 : -1;
    },
    cellRenderer: (params) => {
      let item = this.elementoMarkerSubjectImageTestFilter.filter(i=>i.value==params.value);
      if (item.length != 0) {
        return `(${item[0].count}) ${params.value}`;
      }
    },
    defaultToNothingSelected: true,
    suppressSelectAll: true,
    refreshValuesOnOpen: true,
  };

  private filterStatus = {
    values: (params: SetFilterValuesFuncParams) => {
      if (this.statusImageTestFilter != null) {
        let statusImageTestFilterAux = [];
        for (const status of this.statusImageTestFilter) {
          statusImageTestFilterAux.push(status.value);
          
        }
        params.success(statusImageTestFilterAux);
      } else{
        params.success([]);
      }
    },
    comparator: (a: any, b: any) => {
      var valA = a.count;
      var valB = b.count;
      if (valA === valB) return 0;
      return valA > valB ? 1 : -1;
    },
    cellRenderer: (params) => {
      let item = this.statusImageTestFilter.filter(i=>i.value==params.value);
      if (item.length != 0) {
        return `(${item[0].count}) ${params.value}`;
      }
    },
    defaultToNothingSelected: true,
    suppressSelectAll: true,
    refreshValuesOnOpen: true,
  };

  private filterParamsCR = {
    values: (params: SetFilterValuesFuncParams) => {
      if (this.elementocentroReferenteSubjectImageTestFilter != null) {
        let centrosReferentesAux = [];
        for (const centroReferente of this.elementocentroReferenteSubjectImageTestFilter) {
          centrosReferentesAux.push(centroReferente.value);
          
        }
        params.success(centrosReferentesAux);
      } else{
        params.success([]);
      }
    },
    comparator: (a: any, b: any) => {
      var valA = a.count;
      var valB = b.count;
      if (valA === valB) return 0;
      return valA > valB ? 1 : -1;
    },
    cellRenderer: (params) => {
      let item = this.elementocentroReferenteSubjectImageTestFilter.filter(i=>i.value==params.value);
      if (item.length != 0) {
        return `(${item[0].count}) ${params.value}`;
      }
    },
    defaultToNothingSelected: true,
    suppressSelectAll: true,
    refreshValuesOnOpen: true,

  };

  private filterParamsGR = {
    values: (params: SetFilterValuesFuncParams) => {
      if (this.elementoGenreSubjectImageTestFilter != null) {
        let genreAux = [];
        for (const item of this.elementoGenreSubjectImageTestFilter) {
          genreAux.push(item.value);
        }
        params.success(genreAux);
      } else{
        params.success([]);
      }
    },
    comparator: (a: any, b: any) => {
      var valA = a.count;
      var valB = b.count;
      if (valA === valB) return 0;
      return valA > valB ? 1 : -1;
    },
    cellRenderer: (params) => {
      let item = this.elementoGenreSubjectImageTestFilter.filter(i=>i.value.includes(params.value));
      if (item.length != 0) {
        return `(${item[0].count}) ${params.value}`;
      }
    },
    defaultToNothingSelected: true,
    suppressSelectAll: true,
    refreshValuesOnOpen: true,
  };
  private filterParamsDisaseas = {
    values: (params: SetFilterValuesFuncParams) => {
      if (this.disaseasFilter != null) {
        let disaseasFilterAux = [];
        for (const item of this.disaseasFilter) {
          disaseasFilterAux.push(item.value);
        }
        params.success(disaseasFilterAux);
      } else{
        params.success([]);
      }
    },
    comparator: (a: any, b: any) => {
      var valA = a.count;
      var valB = b.count;
      if (valA === valB) return 0;
      return valA > valB ? 1 : -1;
    },
    cellRenderer: (params) => {
      let item = this.disaseasFilter.filter(i=>i.value==params.value);
      if (item.length != 0) {
        return `(${item[0].count}) ${params.value}`;
      }
      
    },
    defaultToNothingSelected: true,
    suppressSelectAll: true,
    refreshValuesOnOpen: true,
  };
  private filterParamsSignsAndSymptoms = {
    values: (params: SetFilterValuesFuncParams) => {
      if (this.signsAndSymptomsFilter != null) {
        let signsAndSymptomsFilterAux = [];
        for (const item of this.signsAndSymptomsFilter) {
          signsAndSymptomsFilterAux.push(item.value);
        }
        params.success(signsAndSymptomsFilterAux);
      } else{
        params.success([]);
      }
    },
    comparator: (a: any, b: any) => {
      var valA = a.count;
      var valB = b.count;
      if (valA === valB) return 0;
      return valA > valB ? 1 : -1;
    },
    cellRenderer: (params) => {
      let item = this.signsAndSymptomsFilter.filter(i=>i.value==params.value);
      if (item.length != 0) {
        return `(${item[0].count}) ${params.value}`;
      }
    },
    defaultToNothingSelected: true,
    suppressSelectAll: true,
    refreshValuesOnOpen: true,
  };
  private filterAeTitle = {
    values: (params: SetFilterValuesFuncParams) => {
      if (this.aetitleFilter != null) {
        let aetitleFilterAux = [];
        for (const item of this.aetitleFilter) {
          aetitleFilterAux.push(item.value);
        }
        params.success(aetitleFilterAux);
      } else{
        params.success([]);
      }
    },
    comparator: (a: any, b: any) => {
      var valA = a.count;
      var valB = b.count;
      if (valA === valB) return 0;
      return valA > valB ? 1 : -1;
    },
    cellRenderer: (params) => {
      let item = this.aetitleFilter.filter(i=>i.value==params.value);
      if (item.length != 0) {
        return `(${item[0].count}) ${params.value}`;
      }
    },
    defaultToNothingSelected: true,
    suppressSelectAll: true,
    refreshValuesOnOpen: true,
  };
  // Each Column Definition results in one Column.
  public columnDefs: (ColDef | ColGroupDef)[] = [
    { headerName: 'Informaci??n de la prueba',
      children: [
        { field: 'identifier', headerName: 'Identificador', filter: 'agTextColumnFilter', suppressFiltersToolPanel: true, filterParams: {
          suppressAndOrCondition: true, 
          filterOptions:[
            'contains',    
          ],
          
        }},
        { field: 'nombre', headerName: 'Nombre', sortable: false, filter: 'agSetColumnFilter', filterParams: this.filterNombre},
        { field: 'status', headerName: 'Estado', sortable: false, filter: 'agSetColumnFilter', filterParams: this.filterStatus},
        { field: 'AETitle', headerName: 'AETitle', sortable: false, filter: 'agSetColumnFilter', filterParams: this.filterAeTitle },
        { field: 'accessionNumber', headerName: 'Accesion Number', sortable: false, filter: false },
      ]
    },
    
    { headerName: 'Elemento de prueba de imagen',
      children: [
        { field: 'values.name', headerName: 'Nombre',  sortable: false, filter: 'agSetColumnFilter', filterParams: this.filterElementoNombre },
        { field: 'values.status', headerName: 'Estado',  sortable: false, filter: 'agSetColumnFilter', filterParams: this.filterElementoStatus },
        { field: 'values.markers', headerName: 'Marcadores de imagen', sortable: false, filter: 'agSetColumnFilter', filterParams: this.filterElementoMarker },
      ]
    },
    { headerName: 'Paciente',
      children: [
        { field: 'subjectIdentifier', headerName: 'Indentificador', filter: 'agTextColumnFilter', filterParams: {
          suppressAndOrCondition: true,
          filterOptions:[
            'contains',    
          ],
        } },
        { field: 'genre', headerName: 'G??nero', filter: 'agSetColumnFilter', filterParams: this.filterParamsGR },
        { field: 'subjectAge', headerName: 'Edad', filter: false},
        { field: 'centroReferente', headerName: 'Centro Referente', filter: 'agSetColumnFilter', filterParams: this.filterParamsCR}
      ]
    },
    { headerName: 'Antecedentes',
      children: [
        { field: 'diseases', headerName: 'Enfermedades', filter: 'agSetColumnFilter', filterParams: this.filterParamsDisaseas },
        { field: 'signsAndSymptoms', headerName: 'Signos y sintomas', filter: 'agSetColumnFilter', filterParams: this.filterParamsSignsAndSymptoms }
      ]
    },
    { headerName: 'Fecha',
      children: [
        { field: 'createdAt', headerName: 'Creaci??n', valueFormatter: this.dateFormatter, filter: 'agDateColumnFilter',
          filterParams: {
            debounceMs: 500,
            suppressAndOrCondition: true,
          },
        }
      ]
    }
  ];

  
  
  // DefaultColDef sets props common to all Columns
  public defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };
  public sideBar: SideBarDef | string | string[] | boolean | null = {
    toolPanels: [
      {
        id: 'filters',
        labelDefault: 'Filters',
        labelKey: 'filters',
        iconKey: 'filter',
        toolPanel: 'agFiltersToolPanel',
        toolPanelParams: {
          suppressExpandAll: true,
          suppressFilterSearch: true,
        },
      },
    ],
    defaultToolPanel: 'filters',
  };

  // Data that gets displayed in the grid
  public rowData: any[];
  public pagination = true;
  public rowModelType = 'serverSide';
  public paginationPageSize = 10;
  public cacheBlockSize = 10;
  private gridApi!: GridApi;
  private gridColumnApi: any;  
  private numberOfItems: any;
  private centrosReferentesFilter: any;
  private genre: any;
  private signsAndSymptomsFilter: any;
  private aetitleFilter: any;
  private subjectAgeFilter: any;
  private disaseasFilter:any;
  private genreFilter:any;
  private nombreTestFilter:any;
  private statusImageTestFilter: any;
  private elementoNameSubjectImageTestFilter: any;
  private elementoStatusSubjectImageTestFilter: any;
  private elementoMarkerSubjectImageTestFilter: any;
  private elementoGenreSubjectImageTestFilter: any;
  private elementosubjectAgeSubjectImageTestFilter: any;
  private elementocentroReferenteSubjectImageTestFilter: any;
  public optionsGenre :AgChartOptions;
  public optionsEstado: AgChartOptions;
  public optionsAetitle: AgChartOptions;
  public optionsDisaseas: AgChartOptions;
  public optionsSignsAndSymptoms: AgChartOptions;
  public optionsNameTest: AgChartOptions;
  public optionsStatusMarkerTest : AgChartOptions;
  public optionsCentroReferente : AgChartOptions;
  public optionsAgeSubject : AgChartOptions;
  public optionsStatusBioMarker: AgChartOptions;
  constructor(
    private subjectsService: SubjectsService,
    private doctorsService: DoctorsService,
    private subjectImageTestsService: SubjectImageTestsService,
    private reproductionTestsService: ReproductionTestsService,
    public lang: LanguageService,
    private auth: AuthService,
    private activatedRoute: ActivatedRoute,
    private loadingController: LoadingController,
    private http: HttpClient,
    private router: Router
  ) {
    this.optionsGenre = {
      theme: {
        baseTheme: 'ag-solar',
      },
      autoSize: true,
      data: [

      ],
      series: [
        {
          type: 'pie',
          angleKey: 'value',
        },
      ],
    };
    this.optionsEstado = {
      theme: {
        baseTheme: 'ag-solar',
      },
      autoSize: true,
      data: [

      ],
      series: [
        {
          type: 'pie',
          angleKey: 'value',
        },
      ],
    };
    this.optionsAetitle = {
      theme: {
        baseTheme: 'ag-solar',
      },
      autoSize: true,
      data: [

      ],
      series: [
        {
          type: 'column',
          xKey: 'value',
          yKey: 'count',
        },
      ],
      
    };

    this.optionsDisaseas = {
      theme: {
        baseTheme: 'ag-solar',
      },
      data: [],
      series: [
        {
          type: 'pie',
          angleKey: 'count',
          labelKey: 'value',
        },
      ],
    };
    this.optionsSignsAndSymptoms = {
      theme: {
        baseTheme: 'ag-solar',
      },
      data: [],
      series: [
        {
          type: 'pie',
          angleKey: 'count',
          labelKey: 'value',
        },
      ],
    };
    this.optionsNameTest = {
      theme: {
        baseTheme: 'ag-solar',
      },
      data: [],
      series: [
        {
          type: 'pie',
          angleKey: 'count',
          labelKey: 'value',
        },
      ],
    };
    this.optionsStatusMarkerTest = {
      theme: {
        baseTheme: 'ag-solar',
      },
      data: [],
      series: [
        {
          type: 'pie',
          angleKey: 'count',
          labelKey: 'value',
        },
      ],
    };
    this.optionsStatusBioMarker = {
      theme: {
        baseTheme: 'ag-solar',
      },
      data: [],
      series: [
        {
          type: 'pie',
          angleKey: 'count',
          labelKey: 'value',
        },
      ],
    };
    this.optionsCentroReferente = {
      data: [],
      series: [
        {
          type: 'column',
          xKey: 'value',
          yKey: 'count',
        },
      ],
      
    };
    this.optionsAgeSubject = {
      data: [],
      series: [
        {
          type: 'histogram',
          xKey: 'value',
          xName: 'Edad pacientes',
          yKey: 'count',
          yName: 'Cantidad',
          areaPlot: true,
          bins: [
            [0, 20],
            [20, 40],
            [40, 60],
            [60, 80],
            [80, 100],
          ],
        },
      ],
      legend: {
        enabled: false,
      },
      axes: [
        {
          type: 'number',
          position: 'bottom',
          title: { text: 'Edad' },
        },
        {
          type: 'number',
          position: 'left',
          title: { text: 'Cantidad' },
        },
      ],
    };
  }

  ngOnInit(): void {

  }

  myGetRowHeight() {
    return 45;
  }
  // Example of consuming Grid Event
  onCellClicked( e: CellClickedEvent): void {
    console.log('cellClicked', e);
  }

  // Example using Grid's API
  clearSelection(): void {
    this.agGrid.api.deselectAll();
  }
  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    //this.gridApi.setDomLayout('autoHeight');
  }
  getServerSideDatasource() : IServerSideDatasource {
    return {
      getRows: (params) => {
        this.getSubjectsImageTest(this.gridApi.paginationGetPageSize(), this.gridApi.paginationGetCurrentPage()+1, params.request).then(() => {
          params.success({
            rowData: this.subjectsImageTest,
            rowCount: this.numberOfItems,
          });
          const setElementoNameSubjectImageTestFilter = params.api.getFilterInstance('values.name') as ISetFilter;
          const setElementoStatusSubjectImageTestFilter = params.api.getFilterInstance('values.status') as ISetFilter;
          const setElementoMarkerSubjectImageTestFilter = params.api.getFilterInstance('values.markers') as ISetFilter;
          const setElementoGenreSubjectImageTestFilter = params.api.getFilterInstance('genre') as ISetFilter;
          const setElementocentroReferenteSubjectImageTestFilter = params.api.getFilterInstance('centroReferente') as ISetFilter;
          const setElementosignsAndSymptomsFilter = params.api.getFilterInstance('signsAndSymptoms') as ISetFilter;
          const setElementodisaseasFilter = params.api.getFilterInstance('diseases') as ISetFilter;
          const setNombreTestFilter = params.api.getFilterInstance('nombre') as ISetFilter;
          const setElementoaetitleFilter = params.api.getFilterInstance('AETitle') as ISetFilter;

          setElementoNameSubjectImageTestFilter.refreshFilterValues();
          setElementoStatusSubjectImageTestFilter.refreshFilterValues();
          setElementoMarkerSubjectImageTestFilter.refreshFilterValues();
          setElementoGenreSubjectImageTestFilter.refreshFilterValues();
          setElementocentroReferenteSubjectImageTestFilter.refreshFilterValues();
          setElementosignsAndSymptomsFilter.refreshFilterValues();
          setElementodisaseasFilter.refreshFilterValues();
          setNombreTestFilter.refreshFilterValues();
          setElementoaetitleFilter.refreshFilterValues();

          /*const setFilterDiseases = params.api.getFilterInstance('history.diseases.name') as ISetFilter;
          const setFiltersignsAndSymptoms = params.api.getFilterInstance('history.signsAndSymptoms.name') as ISetFilter;
          const setFiltercentroReferente = params.api.getFilterInstance('history.centroReferente') as ISetFilter;
          const setFilterGenre = params.api.getFilterInstance('history.genre') as ISetFilter;
          
  
          
          setFilterGenre.refreshFilterValues();
          //this.rowData = this.subjects;*/
          
          this.gridApi.sizeColumnsToFit();
        });
      }
    };
  }



  dateFormatter(params) {
    if (params.data != undefined) {
      console.log(params.data.createdAt);
      var date = new Date(params.data.createdAt * 1000);
      // Hours part from the timestamp
      var day = "0" + date.getDate();
      var month  = "0" +  (date.getMonth()+1);
      var year = date.getFullYear();
      var hours = "0" + date.getHours();
      // Minutes part from the timestamp
      var minutes = "0" + date.getMinutes();
      // Seconds part from the timestamp
      var seconds = "0" + date.getSeconds();

      // Will display time in 10:30:23 format
      var formattedTime = day.substr(-2) + '/' + month.substr(-2) + '/' + year + ' ' + hours.substr(-2) + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
      return formattedTime;
    } else{
      return '';
    }
  }
  arrayFormatter(params) {
    if (params.data != undefined) {
      if (params.data.hasOwnProperty("history.diseases") ){
        if (params.data['history.diseases'].length === 0  ){
          return 'No';
        } else{
          return 'Si';
        }
      } else{
        return '';
      }
    } else{
      return '';
    }
  }
  boolFormatter(params) {
    if (params.data != undefined) {
      if (params.data.hasOwnProperty("hasImageAnalysis") ){
        if (params.data['hasImageAnalysis'] === false  ){
          return 'No';
        } else{
          return 'Si';
        }
      } else{
        return '';
      }
    } else{
      return '';
    }
  }

  onSelectionChanged($event) {
    const selectedRows = this.gridApi.getSelectedRows();
    this.router.navigate(['/subjects/edit/'+selectedRows[0].subjectId]);
    
  }
 

  async ionViewDidEnter() {
    
    if (this.activatedRoute.snapshot.params.id) {
      console.log("L??GICA DESDE ADMINISTRADOR");

      this.id = this.activatedRoute.snapshot.params.id;

      this.userSub = this.auth.user$.subscribe(async (data) => {
        this.userData = data;
        const userDoctor = (await this.doctorsService.getDoctorData(this.userData.id)).data();
        this.doctorData = (await this.doctorsService.getDoctorData(this.id)).data();
        this.isSameClinic = this.doctorData.clinic === userDoctor.clinic;

        this.loadingController.dismiss();

        this.sortDateDesc();
        this.getCentrosReferentes();
      });
    } else {
      console.log("L??GICA NORMAL");

      this.userSub = this.auth.user$.subscribe(async (data) => {
        this.userData = data;
        this.doctorData = (await this.doctorsService.getDoctorData(this.userData.id)).data();
        this.getDoctorData();
        var datasource = this.getServerSideDatasource();
        this.gridApi!.setServerSideDatasource(datasource); 
      });
    }
    // this.updateReproductionTestsExistence();
    this.getCurrentDate();
    
  }

  getCurrentDate() {
    console.log("getCurrentDate");

    this.currentDate = moment().format();
    this.aWeekAgo = moment().subtract(7, 'days').format();
    this.twoWeeksAgo = moment().subtract(15, 'days').format();
    this.aMonthAgo = moment().subtract(1, 'months').format();
    this.threeMonthsAgo = moment().subtract(3, 'months').format();
    this.sixMonthsAgo = moment().subtract(6, 'months').format();
    this.aYearAgo = moment().subtract(12, 'months').format();
    this.fiveYearsAgo = moment().subtract(5, 'years').format();
  }

  getDoctorData() {
    console.log("getDoctorData");

    this.doctorsService.getDoctorData(this.userData.id).then((data) => {
      this.sharedSubjectsPhenotypic =
        data.data().sharedSubjectsPhenotypic || [];
      this.sharedSubjectsGenetic = data.data().sharedSubjectsGenetic || [];
      this.sharedSubjectsAnalytic = data.data().sharedSubjectsAnalytic || [];
      this.sharedSubjectsImage = data.data().sharedSubjectsImage || [];
      this.sharedSubjectsReproduction = data.data().sharedSubjectsReproduction || [];
      this.getSharedSubjects();
    });
  }

  getSubjectsWithLimit(): Promise<void> {
    this.querySubjects = null;
    this.subjects$ = this.subjectsService.getSubjectsByDoctorLimit(this.userData.id);
    return new Promise((resolve) => {
      this.subjectsSub = this.subjects$.subscribe((subjects) => {
        this.subjects = subjects;
        this.originalSubjects = subjects;
        resolve(subjects);
      });
    });
  }

  async getSubjectsImageTest(pageSize: number, currentPage: number, params: any ): Promise<void> {
    /*console.log("getSubjects");

    this.querySubjects = null;
    
    if (this.subjectsStartAt == null){
      this.subjects = (await this.subjectsService.getSubjectsByDoctorData(this.userData.id, this.subjectsStartAt)).docs.map(element => element.data());
    } else{
      this.subjects = [...this.subjects, ...(await this.subjectsService.getSubjectsByDoctorData(this.userData.id, this.subjectsStartAt)).docs.map(element => element.data())];
    }
    this.subjectsStartAt = this.subjects[this.subjects.length - 1];

    this.originalSubjects = [...this.subjects];
    console.log(this.subjects);
    console.log(this.subjects.length, "TAMA??O DE LOS SUJETOS");*/
    console.log('parametros AG: ' + JSON.stringify(params));
    let subjectImageTestTypesenseAux =  await this.subjectImageTestsService.getAllDataTypesense(this.userData.id, currentPage, params);
    let subjectImageTestTypesense = [];
    console.log(subjectImageTestTypesenseAux);
    for await (const hit of subjectImageTestTypesenseAux.hits) {
      subjectImageTestTypesense.push(hit.document);
    }


    this.querySubjects = null;
    this.subjectsImageTest = subjectImageTestTypesense;
    this.numberOfItems = subjectImageTestTypesenseAux.found;
    this.statusImageTestFilter = subjectImageTestTypesenseAux.facet_counts[0].counts;
    this.elementoNameSubjectImageTestFilter = subjectImageTestTypesenseAux.facet_counts[1].counts;
    this.elementoStatusSubjectImageTestFilter = subjectImageTestTypesenseAux.facet_counts[2].counts;
    this.elementoMarkerSubjectImageTestFilter = subjectImageTestTypesenseAux.facet_counts[3].counts;
    this.elementocentroReferenteSubjectImageTestFilter = subjectImageTestTypesenseAux.facet_counts[4].counts;
    this.elementoGenreSubjectImageTestFilter = subjectImageTestTypesenseAux.facet_counts[5].counts;
    this.elementosubjectAgeSubjectImageTestFilter = subjectImageTestTypesenseAux.facet_counts[6].counts;
    this.disaseasFilter = subjectImageTestTypesenseAux.facet_counts[7].counts;
    this.signsAndSymptomsFilter = subjectImageTestTypesenseAux.facet_counts[8].counts;
    this.nombreTestFilter = subjectImageTestTypesenseAux.facet_counts[9].counts;
    this.aetitleFilter = subjectImageTestTypesenseAux.facet_counts[10].counts;
    this.subjectAgeFilter = subjectImageTestTypesenseAux.facet_counts[11].counts;
    
    this.optionsGenre = {
      data: this.elementoGenreSubjectImageTestFilter,
      series: [
        {
          type: 'pie',
          angleKey: 'count',
          labelKey: 'value',
        },
      ],
    };

    this.optionsEstado = {
      data: this.statusImageTestFilter,
      series: [
        {
          type: 'pie',
          angleKey: 'count',
          labelKey: 'value',
        },
      ],
    };

    this.optionsAetitle = {
      data: this.aetitleFilter.slice(0, 10),
      series: [
        {
          type: 'column',
          xKey: 'value',
          yKey: 'count',
        },
      ],
      
    };
    this.optionsDisaseas = {
      data: this.disaseasFilter.slice(0, 10),
      series: [
        {
          type: 'pie',
          angleKey: 'count',
          labelKey: 'value',
        },
      ],
    };
    this.optionsSignsAndSymptoms = {
      data: this.signsAndSymptomsFilter.slice(0, 10),
      series: [
        {
          type: 'pie',
          angleKey: 'count',
          labelKey: 'value',
        },
      ],
    };
    this.optionsNameTest = {
      theme: {
        baseTheme: 'ag-solar',
      },
      data: this.nombreTestFilter.slice(0, 10),
      series: [
        {
          type: 'pie',
          angleKey: 'count',
          labelKey: 'value',
        },
      ],
    };
    this.optionsNameTest = {
      theme: {
        baseTheme: 'ag-solar',
      },
      data: this.nombreTestFilter.slice(0, 10),
      series: [
        {
          type: 'pie',
          angleKey: 'count',
          labelKey: 'value',
        },
      ],
    };
    this.optionsStatusMarkerTest= {
      theme: {
        baseTheme: 'ag-solar',
      },
      data: this.elementoStatusSubjectImageTestFilter.filter(element => element.value.includes("positive")).slice(0, 10),
      series: [
        {
          type: 'pie',
          angleKey: 'count',
          labelKey: 'value',
        },
      ],
    };
    this.optionsStatusBioMarker = {
      theme: {
        baseTheme: 'ag-solar',
      },
      data: this.elementoMarkerSubjectImageTestFilter.filter(element => element.value.includes("positive")).slice(0, 10),
      series: [
        {
          type: 'pie',
          angleKey: 'count',
          labelKey: 'value',
        },
      ],
    };
    this.optionsCentroReferente = {
      data: this.elementocentroReferenteSubjectImageTestFilter.slice(0, 10),
      series: [
        {
          type: 'column',
          xKey: 'value',
          yKey: 'count',
        },
      ],
      
    };

    this.optionsAgeSubject = {
      data: this.subjectAgeFilter.map(function(item) {
        return {count: item.count, highlighted: item.highlighted, value: parseInt(item.value)}
      }),
      series: [
        {
          type: 'histogram',
          aggregation: 'sum',
          xKey: 'value',
          xName: 'Edad pacientes',
          yKey: 'count',
          yName: 'Cantidad',
          bins: [
            [0, 20],
            [20, 40],
            [40, 60],
            [60, 80],
            [80, 100],
          ],
        },
      ],
      legend: {
        enabled: false,
      },
      axes: [
        {
          type: 'number',
          position: 'bottom',
          title: { text: 'Edad' },
        },
        {
          type: 'number',
          position: 'left',
          title: { text: 'Cantidad' },
        },
      ],
    };
    /*this.genreFilter = subjectImageTestTypesenseAux.facet_counts[1].counts;
    this.disaseasFilter = subjectImageTestTypesenseAux.facet_counts[2].counts;
    this.signsAndSymptomsFilter = subjectImageTestTypesenseAux.facet_counts[3].counts;*/
    //this.subjects = (await this.subjectsService.getSubjectsByDoctorData(this.userData.id)).docs.map(element => element.data());

    this.originalSubjectsImageTest = [...this.subjectsImageTest];

    
    console.log(this.subjectsImageTest.length, "TAMA??O DE LOS SUJETOS");
    /*
    this.subjects$ = this.subjectsService.getSubjectByDoctor(this.userData.id);
    return new Promise(async(resolve) => {
      this.subjects = await this.subjectsService.getSubjectsByDoctorData(this.userData.id);
      
      this.subjectsSub = this.subjects$.subscribe((subjects) => {
        this.subjects = subjects;
        this.originalSubjects = subjects;
        resolve(subjects);
      });
      
    });
    */
  }
 
  getSubjectsFromDoctorId(): Promise<void> {
    console.log("getSubjectsFromDoctorId");

    this.querySubjects = null;

    this.subjects$ = this.subjectsService.getSubjectByDoctor(this.id);
    return new Promise((resolve) => {
      this.subjectsSub = this.subjects$.subscribe((subjects) => {
        this.subjects = subjects;
        this.originalSubjects = subjects;
        resolve(subjects);
      });
    });
  }

  async updateImageAnalysisExistence(): Promise<void> {
    for await (const sujeto of this.subjects) {
      if (!sujeto.hasImageAnalysis && sujeto.subjectImageTests && sujeto.subjectImageTests.length > 0) {
        console.log(sujeto.id);

        await this.subjectsService.updateSubject(sujeto.id, { hasImageAnalysis: true });
      }
    }
    console.log("Done");
  }

  async updateReproductionTestsExistence(): Promise<void> {
    return new Promise(async resolve => {
      console.log();
      const aux = (await this.subjectImageTestsService.getAllDataByWithReproduction()).docs
      console.log(aux);
      aux.forEach(el => {
        console.log(el.data());
        this.reproductionTestsService.create(el.data()).then(() => {
          console.log(el.data());
        })
      })
    })
  }

  sortAlphanumeric() {
    console.log("sortAlphanumeric");

    var reA = /[^a-zA-Z]/g;
    var reN = /[^0-9]/g;

    if (this.querySubjects) {
      this.querySubjects = this.subjects.sort((a, b) => {
        var aA = a.identifier.toLowerCase().replace(reA, "");
        var bA = b.identifier.toLowerCase().replace(reA, "");
        if (aA === bA) {
          var aN = parseInt(a.identifier.replace(reN, ""), 10);
          var bN = parseInt(b.identifier.replace(reN, ""), 10);
          return aN === bN ? 0 : aN > bN ? 1 : -1;
        } else {
          return aA > bA ? 1 : -1;
        }
      });
    } else {
      this.subjects = this.subjects.sort((a, b) => {
        var aA = a.identifier.toLowerCase().replace(reA, "");
        var bA = b.identifier.toLowerCase().replace(reA, "");
        if (aA === bA) {
          var aN = parseInt(a.identifier.replace(reN, ""), 10);
          var bN = parseInt(b.identifier.replace(reN, ""), 10);
          return aN === bN ? 0 : aN > bN ? 1 : -1;
        } else {
          return aA > bA ? 1 : -1;
        }
      });
    }
  }

  sortDateAsc() {
    console.log("sortDateAsc");

    this.subjects = this.subjects.sort((a, b) => {
      return <any>new Date(a.createdAt) - <any>new Date(b.createdAt);
    });
    this.originalSubjects = this.originalSubjects.sort((a, b) => {
      return <any>new Date(a.createdAt) - <any>new Date(b.createdAt);
    });
  }

  sortDateDesc() {
    console.log("sortDateDesc");
    this.subjects = this.subjects.sort((a, b) => {
      return <any>new Date(b.createdAt) - <any>new Date(a.createdAt);
    });
    this.originalSubjects = this.originalSubjects.sort((a, b) => {
      return <any>new Date(b.createdAt) - <any>new Date(a.createdAt);
    });
  }

  async getCentrosReferentes() {
    for await (const element of this.subjects) {
      if (
        element.history &&
        element.history.centroReferente &&
        !this.centrosReferentes.includes(element.history.centroReferente)
      ) {
        this.centrosReferentes.push(element.history.centroReferente);
      }
    }
    this.centrosReferentes.sort();
  }

  async getSharedSubjects() {
    this.sharedSubjects = await this.sharedSubjectsAnalytic
      .concat(this.sharedSubjectsGenetic, this.sharedSubjectsPhenotypic, this.sharedSubjectsImage, this.sharedSubjectsReproduction)

    this.sharedSubjects = [... new Set(this.sharedSubjects)];

    for await (const sub of this.sharedSubjects) {
      await this.subjectsService.getSubjectData(sub).then((userData) => {
        this.sharedSubjectsData.push(userData.data());
      });
    }

    this.originalSharedSubjectsData = [... this.sharedSubjectsData];
  }

  onSearchChange(query: string): void {
    this.currentQuery = query;
    if (query.length > 0) {
      this.querySubjects = this.subjects.filter((subject) =>
        this.removeAccents(subject.identifier.toLowerCase()).includes(this.removeAccents(query.toLowerCase()))
      );
      this.sharedSubjectsData = this.sharedSubjectsData.filter((sharedSubject) =>
        this.removeAccents(sharedSubject.identifier.toLowerCase()).includes(this.removeAccents(query.toLowerCase()))
      );
    } else {
      this.querySubjects = null;
      this.sharedSubjectsData = this.originalSharedSubjectsData;
    }
  }

  removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  onDateFilterChange(fechaInicial: string, fechaFinal: string): Promise<void> {
    if (fechaInicial && fechaFinal) {
      return new Promise((resolve) => {
        this.subjects = this.subjects.filter((subject) => {
          let a = moment(subject.createdAt);
          let b = moment(fechaInicial)
          let c = moment(fechaFinal);
          return b < a && a < c;
        })
        console.log(this.subjects);

        resolve();
      })
    }
  }

  onCentroChange(centros: string): Promise<void> {
    console.log(centros);
    console.log(this.currentCentros, "current");


    if (centros && centros.length === 0) {
      return new Promise(resolve => {
        resolve();
      })
    } else {
      return new Promise(resolve => {
        if (centros) {
          this.subjects = this.subjects.filter((subject) => {
            return (
              subject.history &&
              subject.history &&
              centros.includes(subject.history.centroReferente)
            );
          });

        }
        resolve();
      })
    }
  }

  onDateChange(order: string): void {
    this.order = order;

    if (order === "asc") {
      this.sortDateAsc();
    } else if (order === "desc") {
      this.sortDateDesc();
    } else {
      this.sortDateDesc();
    }
  }

  async onIntervalFilterChange(): Promise<void> {
    console.log(this.filterInterval);

    return new Promise(resolve => {
      switch (this.filterInterval) {
        case "always":
          this.onDateFilterChange(this.fiveYearsAgo, this.currentDate);
          resolve();
          break;

        case "1week":
          this.onDateFilterChange(this.aWeekAgo, this.currentDate);
          resolve();
          break;

        case "2weeks":
          this.onDateFilterChange(this.twoWeeksAgo, this.currentDate);
          resolve();
          break;

        case "1month":
          this.onDateFilterChange(this.aMonthAgo, this.currentDate);
          resolve();
          break;

        case "3months":
          this.onDateFilterChange(this.threeMonthsAgo, this.currentDate);
          resolve();
          break;

        case "6months":
          this.onDateFilterChange(this.sixMonthsAgo, this.currentDate);
          resolve();
          break;

        case "1year":
          this.onDateFilterChange(this.aYearAgo, this.currentDate);
          resolve();
          break;

        default:
          break;
      }

    })
  }

  async filterSubjects() {
    this.subjects = this.originalSubjects;

    // Filtro de fecha
    await this.onDateFilterChange(this.initialDate, this.finalDate)

    // Filtro de centros
    await this.onCentroChange(this.currentCentros)

    // Ordenamiento
    await this.onDateChange(this.currentOrder)

    // Dentro del rango
    await this.onIntervalFilterChange();

  }

  async resetFilters() {
    this.subjects = this.originalSubjects;
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      message: 'Cargando...'
    });
    await loading.present();
  }


  ngOnDestroy(): void {
    if (this.subjectsSub) {
      this.subjectsSub.unsubscribe();
    }
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }
}
