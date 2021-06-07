import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import { Papa } from 'ngx-papaparse';
import { ClinicAnalysisElementsService } from 'src/app/services/clinic-analysis-elements.service';
import { ClinicAnalysisService } from 'src/app/services/clinic-analysis.service';
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

  analysisElements: any;
  clinicAnalysis: any;

  result: any;

  constructor(
    private papa: Papa,
    private analysisElementsService: ClinicAnalysisElementsService,
    private clinicAnalysisService: ClinicAnalysisService,
  ) { }

  async ngOnInit() {
    this.analysisElements = (await this.analysisElementsService.getClinicAnalysisElementsData()).docs.map(data => data = data.data());
    this.clinicAnalysis = (await this.clinicAnalysisService.getAllData()).docs.map(data => data = data.data());
    console.log(this.analysisElements);
    console.log(this.clinicAnalysis);
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
        if (results.errors && results.errors.length > 0) {
          this.doneMessageAnalytic = null;
          this.errorMessageAnalytic = JSON.stringify(results.errors);
        } else {
          this.csvAnalyticData = results.data;
          console.log(this.csvAnalyticData, "CSV CONTENT");
          this.errorMessageAnalytic = null;
          this.doneMessageAnalytic = "Procesado correctamente";
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

  // 3
  async createRanges() {
    this.csvAnalyticData.forEach(row => {

      const analysisElement = this.analysisElements.find(element => element.elementCode === row.CODIGO_T.toString());
      const testId = this.clinicAnalysis.find(element => element.testCode === row.CODIGO.toString()).id;

      row.testId = testId;

      this.analysisElementsService.updateClinicAnalysisElement(analysisElement.id,
        {
          ranges: firebase.firestore.FieldValue.arrayUnion(row)
        })
        .then(() => {
          this.clinicAnalysisService.update(testId,
            {
              elements: firebase.firestore.FieldValue.arrayUnion(analysisElement.id)
            }).then(() => {
              console.log(testId, analysisElement.id);
            }).catch(error => {
              console.log(error);
            })
        })
        .catch(error => {
          console.log(error);
        })
    });
  }

  // 1
  async importElements() {
    const tCodes = [];
    this.csvAnalyticData.forEach(element => {

      // Si no está creado crearlo
      if (!tCodes.includes(element.CODIGO_T.toString())) {
        tCodes.push(element.CODIGO_T.toString());
        this.analysisElementsService.createClinicAnalysisElement(
          {
            elementCode: element.CODIGO_T.toString(),
            name: element.DESCRIPCION_TEST,
            format: "synlab"
          }).then(() => {
            console.log(`Creado ${element.CODIGO_T}`);
          }).catch((error) => {
            console.log(error);
          })
      }

    });
    console.log(tCodes, "CÓDIGOS_T");
  }

  // 2
  async importTests() {
    const codes = [];

    // Migración de CÓDIGOS COMO PRUEBAS (LUEGO SE HACEN LOS RANGOS)
    this.csvAnalyticData.forEach(async element => {
      if (!codes.includes(element.CODIGO.toString())) {
        codes.push(element.CODIGO.toString());
        this.clinicAnalysisService.create({
          testCode: element.CODIGO.toString(),
          name: element.DESCRIPCION,
          elements: [],
          format: "synlab"
        }).then(() => {
          console.log(`Creado ${element.CODIGO}`);
        }).catch((error) => {
          console.log(error);
        })
      }
    });

    console.log(codes, "CÓDIGOS");
  }

  async importLoinc() {
    const elements = (await this.analysisElementsService.getClinicAnalysisElementsData()).docs.map(element => element = element.data());
    for await (const element of this.csvAnalyticData) {
      const elegido = elements.find(ele => ele.elementCode === element.elementCode);
      if (elegido && element.loinc) {
        await this.analysisElementsService.updateClinicAnalysisElement(elegido.id, {
          loinc: element.loinc.toString()
        })
        console.log(element.loinc);
      }
    }
    console.log("DONE");
  }

  async import() {
    if (true) {
      // this.importLoinc();
    } else {
      this.errorMessageAnalytic = "Los campos tienen un formato incorrecto";
    }
  }
}
