import { Component, OnInit } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { ToastService } from "src/app/services/toast.service";
import * as moment from "moment";
import { Observable, Subscription } from "rxjs";
import { AuthService } from "src/app/services/auth.service";
import { TablesService } from "src/app/services/tables.service";
import { DiseasesService } from "src/app/services/diseases.service";
import { LanguageService } from "src/app/services/language.service";

@Component({
  selector: "app-create",
  templateUrl: "./create.page.html",
  styleUrls: ["./create.page.scss"]
})
export class CreatePage implements OnInit {
  name: string;
  shortcode = null;
  currentUser: any;
  userSub: Subscription;
  diseases$: Observable<any>;
  diseases: any;

  constructor(
    private diseasesService: DiseasesService,
    private modalController: ModalController,
    private tablesService: TablesService,
    private toastService: ToastService,
    private authService: AuthService,
    public lang: LanguageService
  ) {}

  ngOnInit() {
    this.getUser().then(() => {});
    this.diseases$ = this.diseasesService.getDiseases();
  }

  async getUser(): Promise<any> {
    return new Promise(resolve => {
      this.userSub = this.authService.user$.subscribe(user => {
        this.currentUser = user;
        resolve();
      });
    });
  }

  /**
   * Almacena la tabla en la base de datos
   */
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
        createdAt: moment().format()
      };

      this.tablesService
        .createTable(this.currentUser.id, data)
        .then(() => {
          this.dismissModal().then(() => {
            this.toastService.show("success", "Tabla creada con éxito");
          });
        })
        .catch(() => {
          this.toastService.show("danger", "Error al crear la tabla");
        });
    } else {
      this.toastService.show("danger", "Completa todos los campos");
    }
  }

  /**
   * Cierra el modal
   */
  async dismissModal(): Promise<any> {
    return new Promise(resolve => {
      this.modalController.dismiss();
      resolve();
    });
  }
}
