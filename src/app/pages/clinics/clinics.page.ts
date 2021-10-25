import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ClinicsService } from 'src/app/services/clinics.service';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-clinics',
  templateUrl: './clinics.page.html',
  styleUrls: ['./clinics.page.scss'],
})
export class ClinicsPage implements OnInit {
  clinics: any;
  queryClinics: any;

  clinicsSub: Subscription;

  constructor(
    private clinicsService: ClinicsService,
  ) { }

  ngOnInit() { }

  ionViewDidEnter() {
    this.clinicsSub = this.clinicsService.getAll().subscribe((data) => {
      this.clinics = data;
      this.clinics = this.clinics.sort((a, b) => this.removeAccents(a.name).localeCompare(this.removeAccents(b.name)))
    });
  }

  onSearchChange(query: string) {
    if (query.length > 0) {
      this.queryClinics = this.clinics.filter((doctor) =>
        this.removeAccents(doctor.name.toLowerCase()).includes(this.removeAccents(query.toLowerCase()))
      );
    } else {
      this.queryClinics = null;
    }
  }

  removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  ngOnDestroy() {
    if (this.clinicsSub) {
      this.clinicsSub.unsubscribe();
    }
  }

}
