import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import { LanguageService } from "src/app/services/language.service";
import { DoctorsService } from "src/app/services/doctors.service";
import { ModalController } from "@ionic/angular";
import { InvitationPage } from "./invitation/invitation.page";
import { AuthService } from "src/app/services/auth.service";

@Component({
  selector: "app-doctors",
  templateUrl: "./doctors.page.html",
  styleUrls: ["./doctors.page.scss"]
})
export class DoctorsPage implements OnInit, OnDestroy {
  doctors: any;
  queryDoctors: any;

  doctorsSub: Subscription;

  user$: any;
  userData: any;
  userSub: Subscription;

  constructor(
    private doctorsService: DoctorsService,
    public lang: LanguageService,
    private modalController: ModalController,
    private auth: AuthService
  ) { }

  ngOnInit() {

  }

  ionViewDidEnter() {
    this.doctorsSub = this.doctorsService.getDoctors().subscribe((data) => {
      this.doctors = data;
      this.doctors = this.doctors.sort((a, b) => this.removeAccents(a.name).localeCompare(this.removeAccents(b.name)))
    });

    this.user$ = this.auth.user$;

    this.userSub = this.user$.subscribe((data) => {
      this.userData = data;
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

  async openDoctorInvitation() {
    const modal = await this.modalController.create({
      component: InvitationPage
    });
    return await modal.present();
  }

  ngOnDestroy() {
    if (this.doctorsSub) {
      this.doctorsSub.unsubscribe();
    }
  }
}
