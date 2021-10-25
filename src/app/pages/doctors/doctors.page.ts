import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import { LanguageService } from "src/app/services/language.service";
import { DoctorsService } from "src/app/services/doctors.service";
import { AuthService } from "src/app/services/auth.service";
import { ToastService } from "src/app/services/toast.service";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-doctors",
  templateUrl: "./doctors.page.html",
  styleUrls: ["./doctors.page.scss"]
})
export class DoctorsPage implements OnInit, OnDestroy {
  doctors: any;
  queryDoctors: any;

  doctorData: any;

  doctorsSub: Subscription;

  invitationUrl: string;

  user$: any;
  userData: any;
  userSub: Subscription;

  invitationEmail: string;

  invitationEndpointURL = "https://europe-west3-radiewcare-app.cloudfunctions.net/api/sendDoctorInvitation";

  constructor(
    private doctorsService: DoctorsService,
    public lang: LanguageService,
    private toastService: ToastService,
    private httpClient: HttpClient,
    private auth: AuthService
  ) { }

  ngOnInit() {

  }

  async ionViewDidEnter() {
    this.user$ = this.auth.user$;

    this.userSub = this.user$.subscribe(async (data) => {
      this.userData = data;
      await this.getDoctorData();

      this.doctorsSub = this.doctorsService.getDoctorsByClinic(this.doctorData.clinic).subscribe((data) => {
        this.doctors = data;
        this.invitationUrl = `https://one-me.radiewcare.com/register/${this.doctorData.clinic}`
        console.log(this.doctors);

        this.doctors = this.doctors.sort((a, b) => this.removeAccents(a.name).localeCompare(this.removeAccents(b.name)))
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
        this.removeAccents(doctor.name.toLowerCase()).includes(this.removeAccents(query.toLowerCase()))
      );
    } else {
      this.queryDoctors = null;
    }
  }

  removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  async sendDoctorInvitation() {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (re.test(String(this.invitationEmail).toLowerCase())) {
      const options = {
        headers: {
          Authorization: "9fe3212a-6657-4bb6-9789-dd5ad8e3c049"
        }
      }
      const url = this.invitationEndpointURL + `?email=${this.invitationEmail}&clinicId=${this.doctorData.clinic}`
      try {
        const response = await this.httpClient.get(url, options).toPromise();
        console.log(response);
      } catch (error) {
        console.error(error);
      }
    } else {
      this.toastService.show("danger", "Correo inválido")
    }
  }

  ngOnDestroy() {
    if (this.doctorsSub) {
      this.doctorsSub.unsubscribe();
    }
    if (this.userData) {
      this.userSub.unsubscribe();
    }
  }
}
