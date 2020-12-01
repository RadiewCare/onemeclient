import { Component, OnInit } from '@angular/core';
import { IonicSelectableValueTemplateDirective } from 'ionic-selectable';
import { Papa } from 'ngx-papaparse';
import { SynlabCatalogService } from 'src/app/services/synlab-catalog.service';

@Component({
  selector: 'app-import',
  templateUrl: './import.page.html',
  styleUrls: ['./import.page.scss'],
})
export class ImportPage implements OnInit {
  file: any;
  name: string

  doneMessagePhenotypic: string;
  doneMessageGenetic: string;
  doneMessageAnalytic: string;
  doneMessageImage: string;
  errorMessagePhenotypic: string;
  errorMessageGenetic: string;
  errorMessageAnalytic: string;
  errorMessageImage: string;

  csvAnalyticData: any;

  constructor(private papa: Papa, private synlabCatalogService: SynlabCatalogService) { }

  ngOnInit() {
  }

  isValid() {
    return this.csvAnalyticData[0].CODIGO ? true : false;
  }

  loadData(file: any) {
    this.errorMessageAnalytic = null;
    this.name = file.name;

    const csvOptions = {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: async (results: any, file: any) => {
        if (results.errors.length > 0) {
          this.doneMessageAnalytic = null;
          this.errorMessageAnalytic = JSON.stringify(results.errors);
        } else {
          this.errorMessageAnalytic = null;
          this.doneMessageAnalytic = "Procesado correctamente";
          this.csvAnalyticData = results.data;
          await this.trimValues();
          console.log(this.csvAnalyticData);
        }
      }
    };

    if (file.name.split(".").pop() === "csv") {
      this.papa.parse(file, csvOptions);
      console.log("es csv");
    } else {
      this.errorMessageAnalytic = "No es un archivo .csv";
    }
  }

  async trimValues() {
    this.csvAnalyticData.forEach(element => {
      if (element.V_REFERENCIA) {
        element.V_REFERENCIA = element.V_REFERENCIA.trim()
      }
    });
  }

  async import() {
    if (this.isValid()) {
      console.log(this.file);

      const list = await this.synlabCatalogService.getClinicAnalysisElementsList();
      const datos = await list.docs.map(element => element = element.data());

      for await (const element of this.csvAnalyticData) {
        if (!datos.some(original => original.CODIGO === element.CODIGO)) {
          this.synlabCatalogService.createClinicAnalysisElement(element)
            .then(() => console.log(element))
            .catch(error => console.log(error));
        } else {
          console.log("Repetido: " + element.CODIGO);
        }
      }
    } else {
      this.errorMessageAnalytic = "Los campos tienen un formato incorrecto";
    }
  }
}
