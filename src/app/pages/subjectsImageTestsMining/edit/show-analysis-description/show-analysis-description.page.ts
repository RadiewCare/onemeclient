import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ClinicAnalysisElementsService } from 'src/app/services/clinic-analysis-elements.service';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-show-analysis-description',
  templateUrl: './show-analysis-description.page.html',
  styleUrls: ['./show-analysis-description.page.scss'],
})
export class ShowAnalysisDescriptionPage implements OnInit {
  @Input() id: string;
  @Input() isAdmin: boolean;

  element: any;

  constructor(
    private analysisElementsService: ClinicAnalysisElementsService,
    public lang: LanguageService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.getElement();
  }

  async getElement() {
    this.element = (await this.analysisElementsService.getClinicAnalysisElementData(this.id)).data();
    console.log(this.element);

  }

  async dismissModal(): Promise<any> {
    return await this.modalController.dismiss();
  }

}
