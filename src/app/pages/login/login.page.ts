import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { MenuController, LoadingController } from "@ionic/angular";
import { AuthService } from "../../services/auth.service";
import { ToastService } from "src/app/services/toast.service";
import { AngularFirestore } from "@angular/fire/firestore";

@Component({
  selector: "app-login",
  templateUrl: "./login.page.html",
  styleUrls: ["./login.page.scss"]
})
export class LoginPage implements OnInit {
  email = "";
  password = "";
  password2 = "";
  isLogin = true;
  language = "spanish";

  constructor(
    private loadingController: LoadingController,
    private router: Router,
    private auth: AuthService,
    private toastService: ToastService,
    private menuController: MenuController,
    private db: AngularFirestore
  ) {
    // Esconde el menú lateral
    this.menuController.get().then((menu: HTMLIonMenuElement) => {
      menu.disabled = true;
      menu.swipeGesture = false;
    });
    this.router.navigate(["/dashboard"]);
  }

  ngOnInit() {}

  ionViewWillEnter() {
    // Esconde el menú lateral
    this.menuController.get().then((menu: HTMLIonMenuElement) => {
      menu.disabled = true;
      menu.swipeGesture = false;
    });
  }

  ionViewDidEnter() {}

  /**
   * Evalúa y realiza el login en la aplicación
   */
  async login() {
    const loading = await this.loadingController.create(null);
    loading.present();

    this.auth
      .emailSignIn(this.email, this.password)
      .then((user) => {
        loading.dismiss();
        this.db.firestore
          .doc(`users/${user.user.uid}`)
          .get()
          .then((data) => {
            if (data.data().isDoctor) {
              this.router.navigate(["/dashboard"]).then(() => {
                this.menuController.get().then((menu: HTMLIonMenuElement) => {
                  menu.disabled = false;
                  menu.swipeGesture = true;
                });
              });
            } else {
              this.router.navigate(["/profile"]);
            }
          });
      })
      .catch((error) => {
        loading.dismiss();
        console.log(error);
        if (error.code === "auth/invalid-email") {
          this.toastService.show(
            "danger",
            "Error: La dirección de correo no es válida o está mal escrita"
          );
        }
        if (error.code === "auth/user-not-found") {
          this.toastService.show("danger", "Error: El usuario no existe");
        }
        if (error.code === "auth/wrong-password") {
          this.toastService.show(
            "danger",
            "Error: La contraseña es incorrecta"
          );
        }
      });
  }

  changeLanguage(lang: string) {
    this.language = lang;
  }
}
