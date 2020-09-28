import { Component, OnInit, ViewChild } from "@angular/core";
import { Subscription } from "rxjs";
import { IonSearchbar } from "@ionic/angular";
import { SymptomsService } from "../../../services/symptoms.service";

@Component({
  selector: "app-symptoms",
  templateUrl: "./symptoms.page.html",
  styleUrls: ["./symptoms.page.scss"]
})
export class SymptomsPage implements OnInit {
  @ViewChild("searchbar", { static: false }) searchBar: IonSearchbar;

  symptoms: any;
  querySymptoms: any;

  symptomsSub: Subscription;

  constructor(private symptomsService: SymptomsService) {}

  ngOnInit() {}

  ionViewDidEnter() {
    this.getGeneticVariants();
    setTimeout(() => {
      this.searchBar.setFocus();
    }, 400);
  }

  getGeneticVariants() {
    this.symptomsSub = this.symptomsService
      .getSymptoms()
      .subscribe((symptoms) => {
        console.log(symptoms);

        this.symptoms = symptoms;
      });
  }

  onSearchChange(query: string) {
    if (query.length > 0) {
      this.querySymptoms = this.symptoms.filter((symptom) =>
        symptom.name.toLowerCase().includes(query.toLowerCase())
      );
    } else {
      this.querySymptoms = null;
    }
  }

  ionViewWillLeave() {
    this.symptomsSub.unsubscribe();
  }
}
