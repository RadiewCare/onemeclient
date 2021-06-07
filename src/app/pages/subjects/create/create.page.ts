import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ToastService } from "src/app/services/toast.service";
import { AuthService } from "src/app/services/auth.service";
import { LanguageService } from "src/app/services/language.service";
import { SubjectsService } from "src/app/services/subjects.service";
import * as moment from "moment";
import { LoadingController } from "@ionic/angular";

@Component({
  selector: "app-create",
  templateUrl: "./create.page.html",
  styleUrls: ["./create.page.scss"]
})
export class CreatePage implements OnInit {
  identifier: string;
  mainDoctor: string;
  age: number;
  birthdate: string;
  genre: string;

  constructor(
    private router: Router,
    private toastService: ToastService,
    private authService: AuthService,
    private subjectsService: SubjectsService,
    public lang: LanguageService,
    private loadingController: LoadingController
  ) { }

  ngOnInit() { }

  ionViewDidEnter() {
    this.authService.user$.subscribe((data) => {
      this.mainDoctor = data.id;
    });
  }

  calculateAge() {
    if (this.age && !this.birthdate) {
      // Calcular fecha de nacimiento
      const fecha = moment().subtract(this.age, 'years');
      this.birthdate = moment(fecha).format();
    } else if (this.birthdate && !this.age) {
      // Calcular edad
      const edad = moment().diff(this.birthdate, 'years', false);
      this.age = edad;
    }
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Creando sujeto...',
    });
    await loading.present();;
  }

  save() {
    this.calculateAge();
    const data = {
      uid: null,
      identifier: this.identifier,
      mainDoctor: this.mainDoctor,
      history: {
        genre: this.genre,
        birthDate: this.birthdate,
        age: this.age
      },
      doctors: [this.mainDoctor],
      reports: []
    };

    console.log(data);

    if (
      this.identifier &&
      this.genre &&
      (this.age || this.birthdate)
    ) {
      console.log("entro");
      this.presentLoading();
      this.subjectsService
        .createSubject(data)
        .then(() => {
          this.loadingController.dismiss();
          this.router.navigate(["/subjects"]).then(() => {
            this.toastService.show("success", "Sujeto creado con éxito");
          });
        })
        .catch((error) => {
          this.loadingController.dismiss();
          this.toastService.show(
            "danger",
            "Error al crear un sujeto: " + error
          );
          console.error(error);
        });
    } else {
      console.log("no entro");
      this.toastService.show(
        "danger",
        "Debes completar los datos del sujeto"
      );
    }
  }
}
