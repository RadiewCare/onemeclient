import { Component, OnInit, OnDestroy } from "@angular/core";
import { ReportsService } from "src/app/services/reports.service";
import { Observable, Subscription } from "rxjs";
import { AuthService } from "src/app/services/auth.service";
import { LanguageService } from "src/app/services/language.service";
import { TemplatesService } from "src/app/services/templates.service";

@Component({
  selector: "app-reports",
  templateUrl: "./reports.page.html",
  styleUrls: ["./reports.page.scss"]
})
export class ReportsPage implements OnInit, OnDestroy {
  currentUser: any;
  userSub: Subscription;
  reports: any;
  allReports: any;
  reports$: Observable<any>;
  reportsSub: Subscription;
  queryReports: any;
  templates = [];

  constructor(
    private authService: AuthService,
    private reportsService: ReportsService,
    private templateService: TemplatesService,
    public lang: LanguageService
  ) {}

  ngOnInit(): void {
    this.getUser().then(() => {
      this.getReports();
    });
  }

  async getUser(): Promise<any> {
    return new Promise((resolve) => {
      this.userSub = this.authService.user$.subscribe((user) => {
        this.currentUser = user;
        resolve();
      });
    });
  }

  async getReports(): Promise<any> {
    this.reports$ = await this.reportsService.getReports(this.currentUser.id);
    return new Promise((resolve) => {
      this.reportsSub = this.reports$.subscribe(async (reports) => {
        this.reports = reports;
        this.allReports = reports;
        for await (const element of reports) {
          await this.templateService
            .getTemplateData(element.mainDoctor, element.template)
            .then((data) => {
              console.log(data.data());
              this.templates.push(data.data().name);
            });
        }
        resolve();
      });
    });
  }

  onSearchChange(query: string): void {
    if (query.length > 0) {
      this.queryReports = this.reports.filter((report) =>
        report.subject.identifier.toLowerCase().includes(query.toLowerCase())
      );
    } else {
      this.queryReports = null;
    }
  }

  onDateChange(date: string): void {
    this.queryReports = this.reports.filter(
      (report) => report.createdAt >= date
    );
  }

  ngOnDestroy(): void {
    this.reportsSub.unsubscribe();
    this.userSub.unsubscribe();
  }
}
