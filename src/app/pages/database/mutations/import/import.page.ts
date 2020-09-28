import { Component, OnInit } from "@angular/core";
import { Papa } from "ngx-papaparse";
import { LanguageService } from "src/app/services/language.service";
import { LoadingController } from "@ionic/angular";
import { ToastService } from "src/app/services/toast.service";
import { Router } from "@angular/router";
import { MutationsService } from "src/app/services/mutations.service";

@Component({
  selector: "app-import",
  templateUrl: "./import.page.html",
  styleUrls: ["./import.page.scss"]
})
export class ImportPage implements OnInit {
  doneMessage: string;
  errorMessage: string;
  csvData: any;

  constructor(
    private papa: Papa,
    public lang: LanguageService,
    private loadingController: LoadingController,
    private toastService: ToastService,
    private mutationsService: MutationsService,
    private router: Router
  ) {}

  ngOnInit() {}

  async load(event: any) {
    const csvFile = event.target.files[0];

    const csvOptions = {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results: any, file: any) => {
        if (results.errors.length > 0) {
          this.doneMessage = null;
          this.errorMessage = JSON.stringify(results.errors);
        } else {
          this.errorMessage = null;
          this.doneMessage = "Procesado correctamente";
          this.csvData = results.data;
          console.log(this.csvData);
        }
      }
    };

    if (event.target.files[0].name.split(".").pop() === "csv") {
      this.papa.parse(csvFile, csvOptions);
      console.log("es csv");
    } else {
      this.errorMessage = "No es un archivo .csv";
    }
  }

  async import(): Promise<any> {
    if (this.csvData) {
      const loading = await this.loadingController.create(null);

      loading.present().then(() => {
        this.mutationsService
          .import(this.csvData)
          .then(() => {
            this.loadingController.dismiss();
            this.router.navigate(["/database"]);
            this.toastService.show("success", "Datos importados con éxito");
          })
          .catch((error) => {
            this.loadingController.dismiss();
            this.toastService.show("danger", error);
          });
      });
    }
  }

  openUrl(url: string) {
    window.open(url, "_system");
  }
}
