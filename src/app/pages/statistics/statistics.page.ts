import { Component, OnDestroy, OnInit } from "@angular/core";
import { LanguageService } from "src/app/services/language.service";

@Component({
  selector: "app-statistics",
  templateUrl: "./statistics.page.html",
  styleUrls: ["./statistics.page.scss"]
})
export class StatisticsPage implements OnInit, OnDestroy {
  razas = [];

  constructor(
    public lang: LanguageService,
  ) { }

  ngOnInit() {
  }

  ionViewDidEnter() {

  }

  ngOnDestroy(): void {

  }

}
