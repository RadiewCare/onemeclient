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
  ) { }

  ngOnInit() {
    this.diseasesSub = this.diseasesService
      .getDiseases()
      .subscribe((diseases) => {
        this.diseases = diseases;
        this.diseases = this.diseases.sort((a, b) => this.removeAccents(a.name).localeCompare(this.removeAccents(b.name)))
      });
  }

  onSearchChange(query: string) {
    if (query.length > 0) {
      this.queryDiseases = this.diseases.filter((disease) =>
        this.removeAccents(disease.name.toLowerCase()).includes(this.removeAccents(query.toLowerCase()))
      );
    } else {
      this.queryDiseases = null;
    }
  }

  removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  ngOnDestroy() {
    this.diseasesSub.unsubscribe();
  }
}
