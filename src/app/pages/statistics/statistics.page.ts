import { Component, OnInit } from "@angular/core";
import { LanguageService } from "src/app/services/language.service";
import { DiseasesService } from "src/app/services/diseases.service";

@Component({
  selector: "app-statistics",
  templateUrl: "./statistics.page.html",
  styleUrls: ["./statistics.page.scss"]
})
export class StatisticsPage implements OnInit {
  constructor(
    public lang: LanguageService,
    private diseaseService: DiseasesService
  ) {}

  ngOnInit() {
    // this.diseaseService.resetOddRatios();
  }
}
