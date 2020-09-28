import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { LanguageService } from "src/app/services/language.service";
import { HistoriesService } from "src/app/services/histories.service";

@Component({
  selector: "app-familiars",
  templateUrl: "./familiars.page.html",
  styleUrls: ["./familiars.page.scss"]
})
export class FamiliarsPage implements OnInit {
  id: string;
  firstGradeFamiliars$: Observable<any>;
  secondGradeFamiliars$: Observable<any>;

  constructor(
    private historiesService: HistoriesService,
    private activatedRoute: ActivatedRoute,
    public lang: LanguageService
  ) {}

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.params.id;
  }

  ionViewDidEnter() {
    this.firstGradeFamiliars$ = this.historiesService.getFirstGradeFamiliars(
      this.id
    );
    this.secondGradeFamiliars$ = this.historiesService.getSecondGradeFamiliars(
      this.id
    );
  }
}
