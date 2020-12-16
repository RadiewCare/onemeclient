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

  constructor(private symptomsService: SymptomsService) { }

  ngOnInit() { }

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
        this.symptoms = this.symptoms.sort((a, b) => this.removeAccents(a.name).localeCompare(this.removeAccents(b.name)))
      });
  }

  onSearchChange(query: string) {
    if (query.length > 0) {
      this.querySymptoms = this.symptoms.filter((symptom) =>
        this.removeAccents(symptom.name.toLowerCase()).includes(this.removeAccents(query.toLowerCase()))
      );
    } else {
      this.querySymptoms = null;
    }
  }

  removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  ionViewWillLeave() {
    this.symptomsSub.unsubscribe();
  }
}
