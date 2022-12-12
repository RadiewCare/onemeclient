import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LanguageService } from 'src/app/services/language.service';
import { ReportsService } from 'src/app/services/reports.service';

@Component({
  selector: 'app-create-report',
  templateUrl: './create-report.page.html',
  styleUrls: ['./create-report.page.scss'],
})
export class CreateReportPage implements OnInit {
  @Input() id: string;
  @Input() imageTest: any;
  @Input() subject: any;
  @Input() doctor: any;
  @Input() clinic: any;

  asociadas = false;

  constructor(public lang: LanguageService, private modalController: ModalController, private reportsService: ReportsService) { }

  ngOnInit() {
  }

  createFullReport() {
    this.reportsService.exportImageTest(this.imageTest, this.subject, this.doctor, this.clinic, this.asociadas);
  }

  createFullReportWithoutEmptyFields() {
    this.imageTest.values = this.imageTest.values.filter(element => element.value);
    this.reportsService.exportImageTest(this.imageTest, this.subject, this.doctor, this.clinic, this.asociadas);
  }

  createPositivesReport() {
    this.imageTest.values = this.imageTest.values.filter(element => element.status === "positive");
    this.reportsService.exportImageTest(this.imageTest, this.subject, this.doctor, this.clinic, this.asociadas);
  }

  async dismissModal(): Promise<any> {
    return await this.modalController.dismiss();
  }

}
