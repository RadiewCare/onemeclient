import { Component, OnInit, OnDestroy } from "@angular/core";

import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Warning from "@editorjs/warning";
import SimpleImage from "@editorjs/simple-image";
import Delimiter from "@editorjs/delimiter";

import { AngularFirestore } from "@angular/fire/firestore";
import { ToastService } from "src/app/services/toast.service";
import { Observable, Subscription } from "rxjs";
import { AlertController } from "@ionic/angular";
import { AuthService } from "src/app/services/auth.service";
import { LanguageService } from "src/app/services/language.service";

@Component({
  selector: "app-templates",
  templateUrl: "./templates.page.html",
  styleUrls: ["./templates.page.scss"]
})
export class TemplatesPage implements OnInit, OnDestroy {
  id: string;
  editor: any;

  currentId: string;
  templateName: string;
  templateData: any;

  templates: Observable<any>;

  userSub: Subscription;

  constructor(
    private db: AngularFirestore,
    private auth: AuthService,
    private toastService: ToastService,
    private alertController: AlertController,
    public lang: LanguageService
  ) { }

  ngOnInit() { }

  ionViewDidEnter() {
    const promise = new Promise((resolve) => {
      this.userSub = this.auth.user$.subscribe((data) => {
        this.id = data.id;
        console.log(this.id);
        resolve();
      });
    }).then(() => this.getTemplates());

    this.editor = new EditorJS({
      holder: "editorjs",

      tools: {
        header: Header,
        list: List,
        warning: Warning,
        delimiter: Delimiter,
        image: SimpleImage
      },
      autofocus: true,
      placeholder: this.lang.isSpanish() ? "Escribe aquí" : "Write here"
    });
  }

  getTemplates() {
    this.templates = this.db
      .collection(`doctors/${this.id}/templates`)
      .valueChanges();
  }

  changeTemplate(id: string) {
    this.db
      .doc(`doctors/${this.id}/templates/${id}`)
      .valueChanges()
      .subscribe((template: any) => {
        this.currentId = template.id;
        this.templateName = template.name;
        this.templateData = template.data;
        console.log(this.editor);

        this.editor.destroy();
        this.editor = new EditorJS({
          holder: "editorjs",

          tools: {
            header: Header,
            list: List,
            warning: Warning,
            delimiter: Delimiter,
            image: SimpleImage
          },
          autofocus: true,
          placeholder: "Escribir",
          data: this.templateData
        });
      });
  }

  create(origin?: string) {
    this.currentId = undefined;
    this.templateData = undefined;
    this.templateName = undefined;
    this.editor.destroy();
    this.editor = new EditorJS({
      holder: "editorjs",

      tools: {
        header: Header,
        list: List,
        warning: Warning,
        delimiter: Delimiter,
        image: SimpleImage
      },
      autofocus: true,
      placeholder: "Escribir"
    });
    if (!origin) {
      this.toastService.show("success", "Plantilla inicializada");
    }
  }

  save() {
    if (this.templateName !== undefined && this.templateName.length > 0) {
      if (this.currentId === undefined && this.templateData === undefined) {
        this.editor.save().then((output) => {
          this.db
            .collection(`doctors/${this.id}/templates`)
            .add({ data: output })
            .then((ref) => {
              this.db
                .doc(`doctors/${this.id}/templates/${ref.id}`)
                .update({ id: ref.id, name: this.templateName });
              this.currentId = ref.id;
              this.templateData = output;
              this.toastService.show("success", "Plantilla guardada");
            });
        });
      } else {
        this.editor.save().then((output) => {
          this.db
            .doc(`doctors/${this.id}/templates/${this.currentId}`)
            .update({ data: output, name: this.templateName })
            .then((data) => {
              this.toastService.show("success", "Plantilla actualizada");
            });
        });
      }
    } else {
      this.toastService.show("danger", "Nombre no introducido");
    }
  }

  async delete(id: string) {
    const alert = await this.alertController.create({
      header: "Eliminar plantilla",
      message: "¿Estas seguro?",
      buttons: [
        {
          text: "Cancelar",
          role: "cancel",
          cssClass: "secondary",
          handler: (blah) => { }
        },
        {
          text: "Aceptar",
          handler: () => {
            this.db
              .doc(`doctors/${this.id}/templates/${id}`)
              .delete()
              .then(() => {
                this.toastService.show(
                  "success",
                  "Plantilla eliminada con éxito"
                );
                this.create("delete");
              })
              .catch(() => {
                this.toastService.show(
                  "danger",
                  "Error al eliminar la plantilla"
                );
              });
          }
        }
      ]
    });
    await alert.present();
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
  }
}
