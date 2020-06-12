import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { AuthService } from "src/app/services/auth.service";
import { LanguageService } from "src/app/services/language.service";
import { DoctorsService } from "src/app/services/doctors.service";

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

  constructor(
    private doctorsService: DoctorsService,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    public lang: LanguageService
  ) {}

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.paramMap.get("id");
    this.userSub = this.authService.user$.subscribe((data) => {
      this.currentUser = data.id;
      console.log(this.currentUser);
    });
    this.doctorsSub = this.doctorsService.getDoctors().subscribe((data) => {
      console.log(data);
      this.doctors = data;
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
            this.doctorsService.revokeSubjectAccess(this.id, doctor, access);
          } else {
            this.doctorsService.grantSubjectAccess(this.id, doctor, access);
          }
          break;
        case "genetic":
          if (data.data().sharedSubjectsGenetic.includes(this.id)) {
            this.doctorsService.revokeSubjectAccess(this.id, doctor, access);
          } else {
            this.doctorsService.grantSubjectAccess(this.id, doctor, access);
          }
          break;
        case "analytic":
          if (data.data().sharedSubjectsAnalytic.includes(this.id)) {
            this.doctorsService.revokeSubjectAccess(this.id, doctor, access);
          } else {
            this.doctorsService.grantSubjectAccess(this.id, doctor, access);
          }
          break;
        case "image":
          if (data.data().sharedSubjectsImage.includes(this.id)) {
            this.doctorsService.revokeSubjectAccess(this.id, doctor, access);
          } else {
            this.doctorsService.grantSubjectAccess(this.id, doctor, access);
          }
          break;

        default:
          break;
      }
    });
  }

  shareAll(doctor: string) {
    this.doctorsService.getDoctorData(doctor).then((data) => {
      this.doctorsService.grantAllSubjectAccess(this.id, doctor);
    });
  }

  revokeAll(doctor: string) {
    this.doctorsService.getDoctorData(doctor).then((data) => {
      this.doctorsService.revokeAllSubjectAccess(this.id, doctor);
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
