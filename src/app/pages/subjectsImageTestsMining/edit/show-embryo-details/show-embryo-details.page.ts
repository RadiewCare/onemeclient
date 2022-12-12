import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-show-embryo-details',
  templateUrl: './show-embryo-details.page.html',
  styleUrls: ['./show-embryo-details.page.scss'],
})
export class ShowEmbryoDetailsPage implements OnInit {
  @Input() embryoData: any;

  keys: any;
  values: any;

  finalData: any;

  constructor(private modalController: ModalController) { }

  ngOnInit() {
    console.log(this.embryoData);
    this.keys = Object.keys(this.embryoData);
    this.values = Object.values(this.embryoData);
    this.finalData = Object.entries(this.embryoData);

    this.finalData = this.finalData.sort();
    this.finalData.splice(0, 1);
    this.finalData.splice(0, 1);
    this.finalData.pop();
    this.finalData.pop();

    this.sortAlphanumeric();

    console.log(this.finalData);

  }

  sortAlphanumeric() {
    var reA = /[^a-zA-Z]/g;
    var reN = /[^0-9]/g;

    if (this.finalData) {
      this.finalData = this.finalData.sort((a, b) => {
        var aA = a[0].toLowerCase().replace(reA, "");
        var bA = b[0].toLowerCase().replace(reA, "");
        if (aA === bA) {
          var aN = parseInt(a[0].replace(reN, ""), 10);
          var bN = parseInt(b[0].replace(reN, ""), 10);
          return aN === bN ? 0 : aN > bN ? 1 : -1;
        } else {
          return aA > bA ? 1 : -1;
        }
      });
    }
  }

  async dismissModal(): Promise<any> {
    return await this.modalController.dismiss();
  }

}
