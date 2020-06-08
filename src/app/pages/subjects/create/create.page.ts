import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ToastService } from "src/app/services/toast.service";
import { AuthService } from "src/app/services/auth.service";
import { LanguageService } from "src/app/services/language.service";
import { SubjectsService } from "src/app/services/subjects.service";

@Component({
  selector: "app-create",
  templateUrl: "./create.page.html",
  styleUrls: ["./create.page.scss"]
})
export class CreatePage implements OnInit {
  identifier: string;
  mainDoctor: string;

  constructor(
    private router: Router,
    private toastService: ToastService,
    private authService: AuthService,
    private subjectsService: SubjectsService,
    public lang: LanguageService
  ) {}

  ngOnInit() {}

  ionViewDidEnter() {
    this.authService.user$.subscribe((data) => {
      this.mainDoctor = data.id;
    });
  }

  save() {
    const data = {
      uid: null,
      identifier: this.identifier,
      mainDoctor: this.mainDoctor,
      doctors: [this.mainDoctor],
      reports: []
    };

    if (this.identifier !== undefined) {
      this.subjectsService
        .createSubject(data)
        .then(() => {
          this.router.navigate(["/subjects"]).then(() => {
            this.toastService.show("success", "Sujeto creado con éxito");
          });
        })
        .catch((error) => {
          this.toastService.show(
            "danger",
            "Error al crear un sujeto: " + error
          );
          console.error(error);
        });
    } else {
      this.toastService.show(
        "danger",
        "Debes poner un identificador al sujeto"
      );
    }
  }
}
