import { Component, OnInit } from "@angular/core";
import { Papa } from "ngx-papaparse";
import { Router } from "@angular/router";
import { ToastService } from "src/app/services/toast.service";

@Component({
  selector: "app-import",
  templateUrl: "./import.page.html",
  styleUrls: ["./import.page.scss"]
})
export class ImportPage implements OnInit {
  csvData: any;
  doneMessage: string;
  errorMessage: string;

  constructor(
    private papa: Papa,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit() {}

  preloadFile(event: any) {
    this.errorMessage = null;
    this.doneMessage = null;
    const csvFile = event.target.files[0];

    const csvOptions = {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results: any, file: any) => {
        if (results.errors.length > 0) {
          this.errorMessage = JSON.stringify(results.errors);
        } else {
          this.doneMessage = "Procesado correctamente";
          this.csvData = results.data;
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

  import() {
    /*this.api
      .importGeneticVariants(this.csvData)
      .then(() => {
        this.router.navigate(["/database/genetic-variants/"]);
      })
      .catch(() => {
        this.toastService.show(
          "danger",
          "Error: Ha habido algún problema importando los datos"
        );
      });*/
  }
}
