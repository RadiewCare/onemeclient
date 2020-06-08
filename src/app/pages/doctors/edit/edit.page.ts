import { Component, OnInit, OnDestroy } from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { ToastService } from "src/app/services/toast.service";
import { Router, ActivatedRoute } from "@angular/router";
import { AlertController } from "@ionic/angular";
import { LanguageService } from "src/app/services/language.service";
import { DoctorsService } from "src/app/services/doctors.service";
import { UsersService } from "src/app/services/users.service";

@Component({
  selector: "app-edit",
  templateUrl: "./edit.page.html",
  styleUrls: ["./edit.page.scss"]
})
export class EditPage implements OnInit, OnDestroy {
  user: Observable<any>;
  userSub: Subscription;
  userId: string;

  doctor: Observable<any>;
  doctorSub: Subscription;

  id: string;
  name: string;
  email: string;
  admin: boolean;

  sharedSubjectsAnalytic: string[];
  sharedSubjectsGenetic: string[];
  sharedSubjectsImage: string[];
  sharedSubjectsPhenotypic: string[];

  sharedSubjects = [];
  sharedSubjectsData = [];

  constructor(
    private usersService: UsersService,
    private doctorsService: DoctorsService,
    private toastService: ToastService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private alertController: AlertController,
    public lang: LanguageService
  ) {
    this.id = this.activatedRoute.snapshot.paramMap.get("id");
  }

  ngOnInit() {}

  ionViewDidEnter() {
    this.doctor = this.doctorsService.getDoctor(this.id);
    this.doctorSub = this.doctor.subscribe((doctorData) => {
      this.user = this.usersService.getUser(doctorData.id);
      this.userSub = this.user.subscribe((userData) => {
        this.email = userData.email;
        this.userId = userData.id;
      });
      this.name = doctorData.name;
      this.admin = doctorData.isAdmin;
      this.sharedSubjectsAnalytic = doctorData.sharedSubjectsAnalytic;
      this.sharedSubjectsGenetic = doctorData.sharedSubjectsGenetic;
      this.sharedSubjectsImage = doctorData.sharedSubjectsImage;
      this.sharedSubjectsPhenotypic = doctorData.sharedSubjectsPhenotypic;

      if (!doctorData.isAdmin) {
        this.sharedSubjects = this.sharedSubjectsAnalytic
          .concat(this.sharedSubjectsGenetic)
          .concat(this.sharedSubjectsPhenotypic)
          .concat(this.sharedSubjectsPhenotypic)
          .filter(function (item, pos, self) {
            return self.indexOf(item) === pos;
          });

        this.sharedSubjects.forEach((id) => {
          this.doctorsService.getDoctorData(id).then((userData) => {
            this.sharedSubjectsData.push(userData.data());
          });
        });
      }
    });
  }

  revoke(subjectId: string) {
    this.doctorsService.revokeAllSubjectAccess(subjectId, this.id).then(() => {
      this.sharedSubjects = this.sharedSubjectsAnalytic
        .concat(this.sharedSubjectsGenetic)
        .concat(this.sharedSubjectsPhenotypic)
        .concat(this.sharedSubjectsPhenotypic)
        .filter(function (item, pos, self) {
          return self.indexOf(item) === pos;
        });
      this.sharedSubjectsData = [];
      this.sharedSubjects.forEach((id) => {
        this.doctorsService.getDoctorData(id).then((userData) => {
          this.sharedSubjectsData.push(userData.data());
        });
      });
    });
  }

  /**
   * Actualiza el doctor en la base de datos. Actualiza el email del usuario.
   */
  async save(): Promise<any> {
    const data = {
      name: this.name,
      isAdmin: this.admin,
      sharedSubjectsAnalytic: this.sharedSubjectsAnalytic,
      sharedSubjectsGenetic: this.sharedSubjectsGenetic,
      sharedSubjectsImage: this.sharedSubjectsImage,
      sharedSubjectsPhenotypic: this.sharedSubjectsPhenotypic
    };
    if (this.admin) {
      data.sharedSubjectsAnalytic = [];
      data.sharedSubjectsGenetic = [];
      data.sharedSubjectsImage = [];
      data.sharedSubjectsPhenotypic = [];
    }
    // Actualizamos doctor
    this.doctorsService
      .updateDoctor(this.id, data)
      .then(() => {
        this.router.navigate(["/doctors"]).then(() => {
          this.toastService.show("success", "Doctor editado con éxito");
        });
      })
      .catch(() => {
        this.toastService.show(
          "danger",
          "Error: No se ha podido editar el doctor"
        );
      });
  }

  /**
   * Elimina el doctor
   */
  async delete(): Promise<any> {
    const alert = await this.alertController.create({
      header: "¿Estás seguro?",
      message: "Pulse aceptar para eliminar el doctor",
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
            this.doctorsService
              .deleteDoctor(this.id)
              .then(() => {
                // TO DO: Borrar de mainDoctor y doctors de todos los usuarios
                // Actualizar el usuario asociado
                this.usersService
                  .updateUser(this.userId, { isDoctor: false })
                  .then(() => {
                    this.router.navigate(["/doctors"]).then(() => {
                      this.toastService.show(
                        "success",
                        "Doctor eliminado con éxito"
                      );
                    });
                  });
              })
              .catch(() => {
                this.toastService.show(
                  "danger",
                  "Error: No se ha podido eliminar el doctor"
                );
              });
          }
        }
      ]
    });
    await alert.present();
  }

  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
    if (this.doctorSub) {
      this.doctorSub.unsubscribe();
    }
  }
}
