import { Component, OnInit } from "@angular/core";
import { MenuController, LoadingController } from "@ionic/angular";
import { ToastService } from "src/app/services/toast.service";
import { DoctorsService } from "src/app/services/doctors.service";
import { kMaxLength } from 'buffer';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: "app-register",
  templateUrl: "./register.page.html",
  styleUrls: ["./register.page.scss"]
})
export class RegisterPage implements OnInit {
  name = "";
  email = "";
  password = "";
  password2 = "";
  language = "esp";
  clinic = "";
  isOwner = false;
  constructor(
    private loadingController: LoadingController,
    private toastService: ToastService,
    private menuController: MenuController,
    private doctorsService: DoctorsService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }
  ngOnInit() {
    this.clinic = this.activatedRoute.snapshot.paramMap.get("id");
    this.isOwner = this.activatedRoute.snapshot.queryParamMap.get("isOwner") === "true";
    console.log(this.isOwner);

    // Esconde el menú lateral
    this.menuController.get().then((menu: HTMLIonMenuElement) => {
      menu.disabled = true;
      menu.swipeGesture = false;
    });
  }
  async register() {
    if (
      this.password.trim().length > 0 &&
      this.name.trim().length > 0 &&
      this.password === this.password2
    ) {
      const loading = await this.loadingController.create(null);
      loading.present();
      this.doctorsService
        .registerDoctor(
          { name: this.name, language: this.language, clinic: this.clinic, isOwner: this.isOwner },
          this.email,
          this.password
        )
        .then(() => {
          loading.dismiss().then(() => {
            this.router.navigate(["/dashboard"]).then(() => {
              if (this.language === "esp") {
                this.toastService.show(
                  "success",
                  "Registrado con éxito, bienvenid@ a One-Me"
                );
              } else {
                this.toastService.show(
                  "success",
                  "Registered with success, welcome to One-Me"
                );
              }
            });
          });
        })
        .catch(error => {
          loading.dismiss();
          if (this.language === "esp") {
            this.toastService.show(
              "danger",
              "Error al registrar usuario: " + error
            );
          } else {
            this.toastService.show(
              "danger",
              "Error at registering user: " + error
            );
          }
        });
    } else {
      if (this.language === "esp") {
        this.toastService.show(
          "danger",
          "Error: Hay datos vacíos o contraseñas no coincidentes"
        );
      } else {
        this.toastService.show(
          "danger",
          "Error: There is empty data or no coincident passwords"
        );
      }
    }
  }
  changeLanguage(lang: string) {
    this.language = lang;
  }
}
