import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { AuthService } from "src/app/services/auth.service";
import { LanguageService } from "src/app/services/language.service";
import { DoctorsService } from "src/app/services/doctors.service";
import { ToastService } from "src/app/services/toast.service";

@Component({
  selector: "app-share",
  templateUrl: "./share.page.html",
  styleUrls: ["./share.page.scss"]
})
export class SharePage implements OnInit, OnDestroy {
  id: string;
  currentUser: string;
  userSub: Subscription;

  doctors: any;
  queryDoctors: any;
  doctorsSub: Subscription;

  doctorData: any;
  userData: any;

  constructor(
    private doctorsService: DoctorsService,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    public lang: LanguageService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.paramMap.get("id");
    this.userSub = this.authService.user$.subscribe(async (data) => {
      this.userData = data;
      this.currentUser = data.id;
      await this.getDoctorData();
      console.log(this.currentUser);
      this.doctorsSub = this.doctorsService.getDoctorsByClinic(this.doctorData.clinic).subscribe((data) => {
        console.log(data);
        this.doctors = data;
      });
    });

  }

  async getDoctorData() {
    return await this.doctorsService.getDoctorData(this.userData.id).then((data) => {
      this.doctorData = data.data();
      console.log(this.doctorData);
    });
  }

  onSearchChange(query: string) {
    if (query.length > 0) {
      this.queryDoctors = this.doctors.filter((doctor) =>
        doctor.name.toLowerCase().includes(query.toLowerCase())
      );
    } else {
      this.queryDoctors = null;
    }
  }

  share(doctor: string, access: string) {
    this.doctorsService.getDoctorData(doctor).then((data) => {
      switch (access) {
        case "phenotypic":
          if (data.data().sharedSubjectsPhenotypic.includes(this.id)) {
            this.doctorsService.revokeSubjectAccess(this.id, doctor, access).then(() => {
              this.toastService.show("success", "El sujeto ha dejado de compartir datos fenotípicos")
            });
          } else {
            this.doctorsService.grantSubjectAccess(this.id, doctor, access).then(() => {
              this.toastService.show("success", "Sujeto compartido con éxito")
            });
          }
          break;
        case "genetic":
          if (data.data().sharedSubjectsGenetic.includes(this.id)) {
            this.doctorsService.revokeSubjectAccess(this.id, doctor, access).then(() => {
              this.toastService.show("success", "El sujeto ha dejado de compartir datos genéticos")
            });
          } else {
            this.doctorsService.grantSubjectAccess(this.id, doctor, access).then(() => {
              this.toastService.show("success", "Sujeto compartido con éxito")
            });
          }
          break;
        case "reproduction":
          if (data.data().sharedSubjectsReproduction.includes(this.id)) {
            this.doctorsService.revokeSubjectAccess(this.id, doctor, access).then(() => {
              this.toastService.show("success", "El sujeto ha dejado de compartir pruebas de reproducción")
            });
          } else {
            this.doctorsService.grantSubjectAccess(this.id, doctor, access).then(() => {
              this.toastService.show("success", "Sujeto compartido con éxito")
            });
          }
          break;
        case "analytic":
          if (data.data().sharedSubjectsAnalytic.includes(this.id)) {
            this.doctorsService.revokeSubjectAccess(this.id, doctor, access).then(() => {
              this.toastService.show("success", "El sujeto ha dejado de compartir pruebas analíticas")
            });
          } else {
            this.doctorsService.grantSubjectAccess(this.id, doctor, access).then(() => {
              this.toastService.show("success", "Sujeto compartido con éxito")
            });
          }
          break;
        case "image":
          if (data.data().sharedSubjectsImage.includes(this.id)) {
            this.doctorsService.revokeSubjectAccess(this.id, doctor, access).then(() => {
              this.toastService.show("success", "El sujeto ha dejado de compartir pruebas de imagen")
            });
          } else {
            this.doctorsService.grantSubjectAccess(this.id, doctor, access).then(() => {
              this.toastService.show("success", "Sujeto compartido con éxito")
            });
          }
          break;

        default:
          break;
      }
    });
  }

  shareAll(doctor: string) {
    this.doctorsService.getDoctorData(doctor).then((data) => {
      this.doctorsService.grantAllSubjectAccess(this.id, doctor).then(() => {
        this.toastService.show("success", "Sujeto compartido con éxito")
      });
    });
  }

  revokeAll(doctor: string) {
    this.doctorsService.getDoctorData(doctor).then((data) => {
      this.doctorsService.revokeAllSubjectAccess(this.id, doctor).then(() => {
        this.toastService.show("success", "El sujeto ha dejado de compartirse")
      });
    });
  }

  ngOnDestroy() {
    if (this.doctorsSub) {
      this.doctorsSub.unsubscribe();
    }
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }
}
