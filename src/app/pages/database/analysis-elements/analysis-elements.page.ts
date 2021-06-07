import { Component } from "@angular/core";
import { LoadingController } from "@ionic/angular";
import { ClinicAnalysisElementsService } from "src/app/services/clinic-analysis-elements.service";
import { SynlabCatalogService } from "src/app/services/synlab-catalog.service";

@Component({
  selector: "app-analysis-elements",
  templateUrl: "./analysis-elements.page.html",
  styleUrls: ["./analysis-elements.page.scss"]
})
export class AnalysisElementsPage {
  analysisElements = null;
  queryElements = null;

  constructor
    (
      private analysisElementsService: ClinicAnalysisElementsService,
      private loadingController: LoadingController
    ) { }

  async ionViewDidEnter() {
    await this.getAnalysisElements();
  }

  async getAnalysisElements() {
    // this.presentLoading();
    await this.analysisElementsService.getClinicAnalysisElementsData().then(async data => {
      const datos = data.docs.map(element => element = element.data());
      this.analysisElements = [...datos]
      this.analysisElements = this.analysisElements.sort((a, b) => a.elementCode < b.elementCode ? -1 : 1);
      console.log(this.analysisElements, "ELEMENTOS");
      console.log(this.analysisElements.length, "NÚMERO DE ELEMENTOS");
    });
    // await this.loadingController.dismiss();
  }

  async resetDefaultValues() {
    for await (const element of this.analysisElements) {
      await this.analysisElementsService.updateClinicAnalysisElement(element.id, { isDefault: false });
      console.log(element.id, "done");
    }
    console.log("ALL DONE");
  }

  onSearchChange(query: string) {
    if (query.length > 0) {
      this.queryElements = this.analysisElements.filter((analysisElement) =>
        this.removeAccents(analysisElement.elementCode.toString()).toLowerCase().includes(this.removeAccents(query.toLowerCase())) ||
        this.removeAccents(analysisElement.name.toString()).toLowerCase().includes(this.removeAccents(query.toLowerCase()))
      )
    } else {
      this.queryElements = null;
    }
  }

  removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      message: 'Cargando...'
    });
    await loading.present();
  }

}
