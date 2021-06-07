import { Component, OnInit } from '@angular/core';
import { ClinicAnalysisElementsService } from 'src/app/services/clinic-analysis-elements.service';
import { ClinicAnalysisService } from 'src/app/services/clinic-analysis.service';

@Component({
  selector: 'app-clinic-analysis',
  templateUrl: './clinic-analysis.page.html',
  styleUrls: ['./clinic-analysis.page.scss'],
})
export class ClinicAnalysisPage implements OnInit {

  clinicAnalysis: any;
  queryClinicAnalysis: any;

  analysisElements: any;

  constructor(
    private clinicAnalysisService: ClinicAnalysisService,
    private clinicAnalysisElementsService: ClinicAnalysisElementsService) { }

  ngOnInit() {
    this.clinicAnalysisService
      .getAllData().then(async (data) => {
        this.clinicAnalysis = data.docs.map(el => el = el.data());
        this.clinicAnalysis = this.clinicAnalysis.sort((a, b) => this.removeAccents(a.testCode).localeCompare(this.removeAccents(b.testCode)))
        const filtered = this.clinicAnalysis.filter(element => !element.elements);
        const problematicos = this.clinicAnalysis.filter(element => element.elements && typeof element.elements[0] == "string");
      })
  }

  async getAnalysisElements(): Promise<void> {
    return new Promise(async (resolve) => {
      this.analysisElements = (await this.clinicAnalysisElementsService.getClinicAnalysisElementsData()).docs.map(data => data.data());
      console.log(this.analysisElements);
      resolve();
    })
  }

  async updateElements(input: any) {
    for await (const analysis of input) {
      console.log(analysis);
      let index = 0;
      for await (const element of analysis.elements) {
        analysis.elements[index] = {
          id: element,
          order: 0,
          name: this.analysisElements.find(el => el.id === element).name
        }
        index = index + 1;
      }
      await this.clinicAnalysisService.update(analysis.id, {
        elements: analysis.elements
      });
      console.log(analysis.id);
    }
    console.log("done");
  }

  onSearchChange(query: string) {
    console.log(query);

    if (query.length > 0) {
      this.queryClinicAnalysis = this.clinicAnalysis.filter((test) =>
        this.removeAccents(test.name.toLowerCase()).includes(this.removeAccents(query.toLowerCase())) || this.removeAccents(test.testCode.toLowerCase()).includes(this.removeAccents(query.toLowerCase()))
      );
      console.log(this.queryClinicAnalysis);
    } else {
      this.queryClinicAnalysis = null;
    }
  }

  removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

}
