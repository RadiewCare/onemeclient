import { Component, OnInit } from "@angular/core";
import { MenuController } from "@ionic/angular";
import { LanguageService } from "src/app/services/language.service";
import { DiseasesService } from "src/app/services/diseases.service";
import { PolymorphismsService } from "src/app/services/polymorphisms.service";
import { DoctorsService } from "src/app/services/doctors.service";
import { SubjectsService } from "src/app/services/subjects.service";
import { MutationsService } from "src/app/services/mutations.service";
import { DrugElementsService } from "src/app/services/drug-elements.service";
import { AuthService } from "../../services/auth.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.page.html",
  styleUrls: ["./dashboard.page.scss"]
})
export class DashboardPage implements OnInit {
  numberOfOwnSubjects: string;
  numberOfSubjects: string;
  numberOfDoctors: string;
  numberOfDiseases: string;
  numberOfPolymorphisms: string;
  numberOfMutations: string;
  numberOfPharma: string;
  userSub: Subscription;
  userData: any;

  constructor(
    private menuController: MenuController,
    public lang: LanguageService,
    private doctorsService: DoctorsService,
    private diseasesService: DiseasesService,
    private subjectsService: SubjectsService,
    private polymorphismsService: PolymorphismsService,
    private mutationsService: MutationsService,
    private drugElementsService: DrugElementsService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.hideMenu();
  }

  ionViewDidEnter() {
    this.userSub = this.authService.user$.subscribe((user) => {
      this.userData = user;
      console.log(this.userData);

      this.subjectsService
        .getSubjectsByDoctor(this.userData.id)
        .then((data) => {
          console.log(data);

          this.numberOfOwnSubjects = data.length;
        });

      this.subjectsService.getSubjectsData().then((data) => {
        this.numberOfSubjects = data.docs.length;
      });

      this.doctorsService.getDoctorsData().then((data) => {
        this.numberOfDoctors = data.docs.length;
      });

      this.diseasesService.getDiseasesData().then((data) => {
        this.numberOfDiseases = data.docs.length;
      });

      this.polymorphismsService.getPolymorphismsData().then((data) => {
        this.numberOfPolymorphisms = data.docs.length;
      });

      this.mutationsService.getMutationsData().then((data) => {
        this.numberOfMutations = data.docs.length;
      });

      this.drugElementsService.getDrugElementsData().then((data) => {
        this.numberOfPharma = data.docs.length;
      });
    });
  }

  hideMenu() {
    this.menuController.get().then((menu: HTMLIonMenuElement) => {
      menu.disabled = false;
      menu.swipeGesture = true;
    });
  }
}
