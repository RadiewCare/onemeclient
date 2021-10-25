import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { LanguageService } from "src/app/services/language.service";
import { ClinicAnalysisElementsService } from "src/app/services/clinic-analysis-elements.service";
import { Observable, Subscription } from "rxjs";
import { ToastService } from "src/app/services/toast.service";
import { AnalyticStudiesService } from "src/app/services/analytic-studies.service";
import { SubjectsService } from "src/app/services/subjects.service";
import { ClinicAnalysisService } from "src/app/services/clinic-analysis.service";
import * as moment from "moment";
import { ActivityService } from "src/app/services/activity.service";
import { AuthService } from "src/app/services/auth.service";
import { DoctorsService } from "src/app/services/doctors.service";
import { ClinicsService } from "src/app/services/clinics.service";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: 'app-activity',
  templateUrl: './activity.page.html',
  styleUrls: ['./activity.page.scss'],
})
export class ActivityPage implements OnInit, OnDestroy {

  id: string;

  logs: any;

  logsSub: Subscription;

  constructor(
    public lang: LanguageService,
    private activityService: ActivityService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.params.id;
  }

  ionViewDidEnter() {
    this.getActivities();
  }

  getActivities() {
    this.logsSub = this.activityService.getAllByClinic(this.id).subscribe(data => {
      this.logs = data;

      this.logs.sort((a, b) => {
        return <any>new Date(b.createdAt) - <any>new Date(a.createdAt);
      });
    });
  }

  ngOnDestroy() {
    if (this.logsSub) {
      this.logsSub.unsubscribe();
    }
  }

}
