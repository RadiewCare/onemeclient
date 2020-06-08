import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import { LanguageService } from "src/app/services/language.service";
import { DoctorsService } from "src/app/services/doctors.service";

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
    public lang: LanguageService
  ) {}

  ngOnInit() {
    this.doctorsSub = this.doctorsService.getDoctors().subscribe((data) => {
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

  ngOnDestroy() {
    this.doctorsSub.unsubscribe();
  }
}
