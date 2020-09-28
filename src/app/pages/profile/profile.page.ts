import { Component, OnInit, OnDestroy } from "@angular/core";
import { AuthService } from "src/app/services/auth.service";
import { Observable, Subscription } from "rxjs";
import { MenuController, AlertController } from "@ionic/angular";
import { UsersService } from "src/app/services/users.service";
import { ToastService } from "src/app/services/toast.service";
import { LanguageService } from "src/app/services/language.service";
import { AngularFireAuth } from "@angular/fire/auth";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.page.html",
  styleUrls: ["./profile.page.scss"]
})
export class ProfilePage implements OnInit, OnDestroy {
  user: Observable<any>;
  userSub: Subscription;
  currentUser: any;

  name: string;
  email: string;
  language: string;

  showEmail = false;
  newEmail = "";
  password = "";

  report$: Observable<any>;
  report: any;

  subjectId: string;
  subject$: Observable<any>;
  subject: object;

  tables$: Observable<any>;
  tables: any;

  templateId: any;
  templates$: Observable<any>;
  templateData: any;

  doctorsIds: string[];
  mainDoctorId: string;

  constructor(
    private auth: AuthService,
    private menuController: MenuController,
    private afAuth: AngularFireAuth,
    private usersService: UsersService,
    private toastService: ToastService,
    public lang: LanguageService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.getUser();
  }

  ionViewDidEnter() {}

  async getUser(): Promise<any> {
    return new Promise((resolve) => {
      this.userSub = this.auth.user$.subscribe(async (user) => {
        if (user.isDoctor === false) {
          this.menuController.get().then((menu: HTMLIonMenuElement) => {
            menu.disabled = true;
            menu.swipeGesture = false;
          });
        }
        this.currentUser = user;
        this.email = (await this.afAuth.currentUser).email;
        this.language = user.language;
        resolve();
      });
    });
  }

  save() {
    if (this.email !== undefined && this.email.length > 0) {
      this.usersService
        .updateUser(this.currentUser.id, {
          language: this.language
        })
        .then(() => {
          this.toastService.show("success", "Datos actualizados con éxito");
        })
        .catch((error) => {
          this.toastService.show(
            "danger",
            "Error al guardar los datos " + error
          );
        });
    } else {
      this.toastService.show("danger", "Rellene todos los campos");
    }
  }

  async updateEmail() {
    const currentUser = await this.afAuth.currentUser;

    currentUser
      .updateEmail(this.email)
      .then(async () => {
        this.usersService
          .updateUser((await this.afAuth.currentUser).uid, {
            email: this.email
          })
          .then(() => {
            if (this.lang.isSpanish()) {
              this.toastService.show(
                "success",
                "Correo electrónico actualizado con éxito"
              );
            } else {
              this.toastService.show("success", "Email update succeded");
            }
          })
          .catch((error) => {
            this.toastService.show("error", error);
          });
      })
      .catch((error) => {
        this.toastService.show("error", error);
      });
  }

  resetPassword() {
    this.afAuth
      .sendPasswordResetEmail(this.email)
      .then(() => {
        if (this.lang.isSpanish()) {
          this.toastService.show("success", "Revisa tu correo electrónico");
        } else {
          this.toastService.show("success", "Check your email inbox");
        }
      })
      .catch((error) => {
        this.toastService.show("error", error);
      });
  }

  async openSignOut() {
    const alert = await this.alertController.create({
      header: "Cerrar sesión",
      message: "¿Seguro que quieres cerrar sesión y salir?",
      buttons: [
        {
          text: "Cancelar",
          role: "cancel",
          cssClass: "secondary"
        },
        {
          text: "Aceptar",
          handler: () => {
            this.signOut();
          }
        }
      ]
    });
    return await alert.present();
  }

  signOut() {
    this.auth.signOut();
  }

  ngOnDestroy(): void {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }
}
