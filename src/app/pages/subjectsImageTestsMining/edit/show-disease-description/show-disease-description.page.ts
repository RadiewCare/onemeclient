import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DiseasesService } from 'src/app/services/diseases.service';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-show-disease-description',
  templateUrl: './show-disease-description.page.html',
  styleUrls: ['./show-disease-description.page.scss'],
})
export class ShowDiseaseDescriptionPage implements OnInit {
  @Input() id: string;
  @Input() isAdmin: boolean;

  disease: any;

  constructor(
    private diseasesService: DiseasesService,
    public lang: LanguageService,
    private modalController: ModalController) { }

  ngOnInit() {
    this.getDisease();
  }

  async getDisease() {
    this.disease = (await this.diseasesService.getDiseaseData(this.id)).data();
    console.log(this.disease);
  }

  async dismissModal(): Promise<any> {
    return await this.modalController.dismiss();
  }

}
