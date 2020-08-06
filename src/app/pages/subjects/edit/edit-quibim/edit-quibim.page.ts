import { Component, OnInit, Input } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { LanguageService } from "src/app/services/language.service";
import { SubjectsService } from "src/app/services/subjects.service";
import { Papa } from "ngx-papaparse";
import { ToastService } from "src/app/services/toast.service";

@Component({
  selector: "app-edit-quibim",
  templateUrl: "./edit-quibim.page.html",
  styleUrls: ["./edit-quibim.page.scss"],
})
export class EditQuibimPage implements OnInit {
  @Input() id: string;
  @Input() index: string;

  quibimData: any;
  quibimLoadedData: any;
  imageTest: any;
  imageTests: any;

  subject: any;

  doneMessageQuibim: string;
  errorMessageQuibim: string;

  viewQuibimData = {};

  constructor(
    private modalController: ModalController,
    public lang: LanguageService,
    private subjectService: SubjectsService,
    private papa: Papa,
    private toastService: ToastService
  ) {}

  ngOnInit() {}

  ionViewDidEnter() {
    this.getQuibimData();
  }

  getQuibimData() {
    this.subjectService.getSubjectData(this.id).then((subject) => {
      this.subject = subject.data();
      if (this.subject.imageTests[this.index].quibimData) {
        this.quibimLoadedData = Object.entries(
          this.subject.imageTests[this.index].quibimData
        );
        this.quibimLoadedData = this.quibimLoadedData.sort();
      }
      this.imageTests = this.subject.imageTests;
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

          const array = [];

          for (let index = 0; index < this.quibimData[1].length; index++) {
            if (this.quibimData[1][index].trim().length > 0) {
              this.viewQuibimData[
                this.quibimData[1][index].trim()
              ] = this.quibimData[2][index];
            }
          }

          this.imageTests[this.index].quibimData = this.viewQuibimData;
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
    if (this.quibimData !== null && this.quibimData !== undefined) {
      this.subjectService
        .updateSubject(this.id, {
          imageTests: this.imageTests,
        })
        .then(() => {
          this.dismissModal().then(() => {
            this.toastService.show("success", "Datos importados con éxito");
          });
        })
        .catch(() => {
          this.toastService.show("error", "Fallo al importar datos");
        });
    }
  }

  async dismissModal(): Promise<any> {
    return await this.modalController.dismiss();
  }
}
