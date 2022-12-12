import { Component, OnInit, Input } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { LanguageService } from "src/app/services/language.service";
import { Papa } from "ngx-papaparse";
import { ToastService } from "src/app/services/toast.service";
import { SubjectImageTestsService } from "src/app/services/subject-image-tests.service";

@Component({
  selector: "app-edit-quibim",
  templateUrl: "./edit-quibim.page.html",
  styleUrls: ["./edit-quibim.page.scss"],
})
export class EditQuibimPage implements OnInit {
  @Input() id: string; // id de la prueba

  quibimData: any;
  quibimLoadedData = null;
  transformedQuibimData: any;
  imageTest: any;
  imageTests: any;
  result: any;

  subject: any;

  doneMessageQuibim: string;
  errorMessageQuibim: string;

  viewQuibimData = {};

  constructor(
    private modalController: ModalController,
    public lang: LanguageService,
    private subjectImageTestsService: SubjectImageTestsService,
    private papa: Papa,
    private toastService: ToastService
  ) { }

  ngOnInit() { }

  ionViewDidEnter() {
    this.getQuibimData();
  }

  getQuibimData() {

    this.subjectImageTestsService.getOneData(this.id).then((test) => {
      this.imageTest = test;
      console.log(test);
      if (this.imageTest.quibimData) {
        this.quibimLoadedData = Object.entries(
          this.imageTest.quibimData
        );
        this.quibimLoadedData = this.quibimLoadedData.sort();
      }
    });
  }

  async loadQuibimData(event: any) {
    const csvFile = event.target.files[0];

    const csvOptions = {
      header: false,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results: any, file: any) => {
        if (results.errors.length > 0) {
          this.doneMessageQuibim = null;
          this.errorMessageQuibim = JSON.stringify(results.errors);
        } else {
          this.errorMessageQuibim = null;
          this.doneMessageQuibim = "Procesado correctamente";
          this.quibimLoadedData = null;

          this.quibimData = results.data;

          console.log(results.data);

          for (let index = 0; index < this.quibimData[1].length; index++) {
            if (this.quibimData[1][index].trim().length > 0) {
              this.viewQuibimData[this.quibimData[1][index].trim()] = this.quibimData[2][index];
            }
          }

          this.result = this.viewQuibimData;
          console.log(this.result);

        }
      },
    };

    if (event.target.files[0].name.split(".").pop() === "csv") {
      this.papa.parse(csvFile, csvOptions);
      console.log("es csv");
    } else {
      this.errorMessageQuibim = "No es un archivo .csv";
    }
  }

  save() {
    console.log(this.quibimData);

    if (this.result !== null && this.result !== undefined) {
      this.subjectImageTestsService
        .update(this.id, {
          quibimData: this.result,
        })
        .then(() => {
          this.dismissModal().then(() => {
            this.toastService.show("success", "Datos importados con éxito");
          });
        })
        .catch(() => {
          this.toastService.show("danger", "Fallo al importar datos");
        });
    } else {
      this.dismissModal();
    }
  }

  async dismissModal(): Promise<any> {
    return await this.modalController.dismiss();
  }
}
