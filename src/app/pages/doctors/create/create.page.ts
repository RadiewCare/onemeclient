import { Component, Input, OnInit } from "@angular/core";
import { ToastService } from "src/app/services/toast.service";
import { ActivatedRoute, Router } from "@angular/router";
import { UsersService } from "src/app/services/users.service";
import { LanguageService } from "src/app/services/language.service";
import { DoctorsService } from "src/app/services/doctors.service";
import { AuthService } from "src/app/services/auth.service";

@Component({
  selector: "app-create",
  templateUrl: "./create.page.html",
  styleUrls: ["./create.page.scss"]
})
export class CreatePage implements OnInit {
  clinic: string;
  name: string;
  email: string;
  password: string;

  testEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

  constructor(
    private doctorsService: DoctorsService,
    private toastService: ToastService,
    public lang: LanguageService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.clinic = this.activatedRoute.snapshot.paramMap.get("id");
  }

  ionViewDidEnter() {

  }

  isValid() {
    return this.name !== undefined && this.name !== null && this.name.trim().length > 0 && this.testEmail.test(this.email.trim().toLowerCase());
  }

  async save(): Promise<any> {
    if (this.isValid()) {
      const data = {
        clinic: this.clinic,
        isDoctor: true,
        isOwner: false,
        name: this.name.trim() || null,
        sharedSubjectsPhenotypic: [],
        sharedSubjectsGenetic: [],
        sharedSubjectsAnalytic: [],
        sharedSubjectsImage: []
      };
      this.authService.emailSignUp(this.email.trim().toLowerCase(), this.password.trim()).then(() => {
        this.doctorsService
          .createDoctor(data)
          .then(() => {
            this.router.navigate(["/doctors"]).then(() => {
              this.toastService.show("success", "Doctor creado con éxito");
            });
          })
          .catch((error) => {
            this.toastService.show(
              "danger",
              "Error: No se ha podido crear el doctor" + error
            );
          });
      }).catch((error) => {
        this.toastService.show(
          "danger",
          "Error: No se ha podido crear el doctor" + error
        );
      })
    }
  }
}
