import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import { DiseasesService } from "src/app/services/diseases.service";
import { LanguageService } from "src/app/services/language.service";

@Component({
  selector: "app-diseases",
  templateUrl: "./diseases.page.html",
  styleUrls: ["./diseases.page.scss"]
})
export class DiseasesPage implements OnInit, OnDestroy {
  diseases: any;
  queryDiseases: any;
  diseasesSub: Subscription;

  constructor(
    private diseasesService: DiseasesService,
    public lang: LanguageService
  ) {}

  ngOnInit() {
    this.diseasesSub = this.diseasesService
      .getDiseases()
      .subscribe((diseases) => {
        this.diseases = diseases;
      });
  }

  onSearchChange(query: string) {
    if (query.length > 0) {
      this.queryDiseases = this.diseases.filter((disease) =>
        disease.name.toLowerCase().includes(query.toLowerCase())
      );
    } else {
      this.queryDiseases = null;
    }
  }

  ngOnDestroy() {
    this.diseasesSub.unsubscribe();
  }
}
