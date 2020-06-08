import { Component, OnInit } from "@angular/core";
import { ModalController, AlertController } from "@ionic/angular";

import { CreatePage } from "./create/create.page";
import { EditPage } from "./edit/edit.page";

import { Observable, Subscription } from "rxjs";
import { ToastService } from "src/app/services/toast.service";
import { TablesService } from "src/app/services/tables.service";
import { AuthService } from "src/app/services/auth.service";
import { DiseasesService } from "src/app/services/diseases.service";
import { LanguageService } from "src/app/services/language.service";

@Component({
  selector: "app-tables",
  templateUrl: "./tables.page.html",
  styleUrls: ["./tables.page.scss"]
})
export class TablesPage implements OnInit {
  tables: any;
  tables$: Observable<any>;
  tablesSub: Subscription;

  diseases: any;
  diseases$: Observable<any>;
  diseasesSub: Subscription;

  currentUser: any;
  userSub: Subscription;

  constructor(
    private tablesService: TablesService,
    private modalController: ModalController,
    private alertController: AlertController,
    private toastService: ToastService,
    private authService: AuthService,
    private diseasesService: DiseasesService,
    public lang: LanguageService
  ) {}

  ngOnInit() {
    this.getUser().then(() => {
      this.getTables();
    });
    this.getDiseases();
  }

  async getUser(): Promise<any> {
    return new Promise((resolve) => {
      this.userSub = this.authService.user$.subscribe((user) => {
        this.currentUser = user;
        resolve();
      });
    });
  }

  /**
   * Recoge las tablas existentes
   */
  async getTables(): Promise<any> {
    return new Promise((resolve) => {
      this.tables$ = this.tablesService.getTables(this.currentUser.id);
      this.tablesSub = this.tables$.subscribe((tables) => {
        this.tables = tables;
        resolve();
      });
    });
  }

  /**
   * Recoge las enfermedades de la base de datos
   */
  async getDiseases(): Promise<any> {
    return new Promise((resolve) => {
      this.diseases$ = this.diseasesService.getDiseases();
      this.diseasesSub = this.diseases$.subscribe((diseases) => {
        this.diseases = diseases;
        resolve();
      });
    });
  }

  /**
   * Muestra el modal de creación de tabla
   */
  async create() {
    const modal = await this.modalController.create({
      component: CreatePage
    });
    return await modal.present();
  }

  /**
   * Muestra el modal de edición de tabla
   * @param tableId Identificador de la tabla
   */
  async edit(tableId: string) {
    const modal = await this.modalController.create({
      component: EditPage,
      componentProps: {
        id: tableId
      }
    });
    return await modal.present();
  }

  /**
   * Elimina una tabla
   * @param tableId Identificador de la tabla
   */
  async delete(tableId: string) {
    const alert = await this.alertController.create({
      header: "Eliminar tabla",
      message: "¿Estás seguro?",
      buttons: [
        {
          text: "Cancelar",
          role: "cancel",
          cssClass: "secondary",
          handler: (blah) => {}
        },
        {
          text: "Aceptar",
          handler: () => {
            this.tablesService
              .deleteTable(this.currentUser.id, tableId)
              .then(() => {
                this.toastService.show("success", "Tabla eliminada con éxito");
              })
              .catch(() => {
                this.toastService.show("danger", "Error al eliminar la tabla");
              });
          }
        }
      ]
    });
    await alert.present();
  }

  onSearchChange(value: any) {}

  /**
   * Copia en el portapapeles el shortcode seleccionado con el ratón al hacer clic
   * @param text Texto del shortcode
   */
  copyToClipboard(text: string) {
    const selBox = document.createElement("textarea");
    selBox.style.position = "fixed";
    selBox.style.left = "0";
    selBox.style.top = "0";
    selBox.style.opacity = "0";
    selBox.value = text;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand("copy");
    document.body.removeChild(selBox);
    this.toastService.show("success", "Código copiado al portapapeles");
  }
}
