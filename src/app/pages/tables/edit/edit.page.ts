import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { TablesService } from "src/app/services/tables.service";
import { Observable, Subscription } from "rxjs";
import * as moment from "moment";
import { ToastService } from "src/app/services/toast.service";
import { AuthService } from "src/app/services/auth.service";
import { DiseasesService } from "src/app/services/diseases.service";
import { LanguageService } from "src/app/services/language.service";

@Component({
  selector: "app-edit",
  templateUrl: "./edit.page.html",
  styleUrls: ["./edit.page.scss"]
})
export class EditPage implements OnInit, OnDestroy {
  @Input() id: string;

  name: string;
  shortcode = null;
  currentUser: any;
  userSub: Subscription;
  diseases$: Observable<any>;
  diseases: any;
  diseaseSub: Subscription;

  constructor(
    private tablesService: TablesService,
    private diseasesService: DiseasesService,
    private modalController: ModalController,
    private toastService: ToastService,
    private authService: AuthService,
    public lang: LanguageService
  ) {}

  ngOnInit() {
    this.getUser().then(() => {
      this.getTable();
    });
    this.getDiseases();
  }

  ionViewDidEnter() {}

  async getUser(): Promise<any> {
    return new Promise(resolve => {
      this.userSub = this.authService.user$.subscribe(user => {
        this.currentUser = user;
        resolve();
      });
    });
  }

  async getTable(): Promise<any> {
    this.tablesService.getTableData(this.currentUser.id, this.id).then(data => {
      this.name = data.data().name;
      this.diseases = data.data().diseases;
    });
  }

  async getDiseases(): Promise<any> {
    this.diseases$ = this.diseasesService.getDiseases();
    this.diseaseSub = this.diseases$.subscribe(data => {
      this.diseases = data;
    });
  }

  save() {
    if (
      this.name !== undefined &&
      this.name.length > 0 &&
      this.diseases.length > 0
    ) {
      const diseasesData = [];
      this.diseases.forEach(element => {
        diseasesData.push({ id: element.id, name: element.name });
      });
      const data = {
        name: this.name,
        shortcode: `[${this.name.replace(/\s/g, "").toUpperCase()}]`,
        diseases: diseasesData,
        updatedAt: moment().format()
      };
      this.tablesService
        .updateTable(this.currentUser.id, this.id, data)
        .then(() => {
          this.dismissModal().then(() => {
            this.toastService.show("success", "Tabla editada con éxito");
          });
        })
        .catch(() => {
          this.toastService.show("danger", "Error al editar la tabla");
        });
    } else {
      this.toastService.show("danger", "Completa todos los campos");
    }
  }

  async dismissModal(): Promise<any> {
    return new Promise(resolve => {
      this.modalController.dismiss();
      resolve();
    });
  }

  ngOnDestroy(): void {
    this.diseaseSub.unsubscribe();
  }
}
