import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import { LanguageService } from "src/app/services/language.service";
import { DoctorsService } from "src/app/services/doctors.service";
import { ModalController } from "@ionic/angular";
import { InvitationPage } from "./invitation/invitation.page";

@Component({
  selector: "app-doctors",
  templateUrl: "./doctors.page.html",
  styleUrls: ["./doctors.page.scss"]
})
export class DoctorsPage implements OnInit, OnDestroy {
  doctors: any;
  queryDoctors: any;
  doctorsSub: Subscription;

  constructor(
    private doctorsService: DoctorsService,
    public lang: LanguageService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.doctorsSub = this.doctorsService.getDoctors().subscribe((data) => {
      this.doctors = data;
      this.doctors = this.doctors.sort((a, b) => this.removeAccents(a.name).localeCompare(this.removeAccents(b.name)))
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
    this.doctorsSub.unsubscribe();
  }
}
