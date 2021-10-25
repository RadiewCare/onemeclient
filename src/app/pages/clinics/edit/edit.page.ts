import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { ClinicsService } from 'src/app/services/clinics.service';
import { DoctorsService } from 'src/app/services/doctors.service';
import { LanguageService } from 'src/app/services/language.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.page.html',
  styleUrls: ['./edit.page.scss'],
})
export class EditPage implements OnInit, OnDestroy {

  id: string;
  name: string

  invitationUrl: string;

  user$: Observable<any>;

  userSub: Subscription;

  userData: any;

  doctorsSub: Subscription;

  doctorData: any;

  doctors: any;

  queryDoctors: any;

  constructor(
    private clinicsService: ClinicsService,
    private activatedRoute: ActivatedRoute,
    private toastService: ToastService,
    private router: Router,
    public lang: LanguageService,
    private auth: AuthService,
    private doctorsService: DoctorsService
  ) { }

  ngOnInit() {
    this.id = this.id = this.activatedRoute.snapshot.paramMap.get("id");
  }

  ionViewDidEnter() {
    this.clinicsService.get(this.id).subscribe(data => {
      this.name = data.name;
      this.invitationUrl = `https://one-me.radiewcare.com/register/${data.id}?isOwner=true`
    })

    this.user$ = this.auth.user$;

    this.userSub = this.user$.subscribe(async (data) => {
      this.userData = data;
      await this.getDoctorData();

      this.doctorsSub = this.doctorsService.getDoctorsByClinic(this.id).subscribe((data) => {
        this.doctors = data;
        this.invitationUrl = `https://one-me.radiewcare.com/register/${this.id}`
        console.log(this.doctors);

        this.doctors = this.doctors.sort((a, b) => this.removeAccents(a.name).localeCompare(this.removeAccents(b.name)))
      });
    });
  }

  async getDoctorData() {
    return await this.doctorsService.getDoctorData(this.userData.id).then((data) => {
      this.doctorData = data.data();
      console.log(this.doctorData);
    });
  }

  onSearchChange(query: string) {
    if (query.length > 0) {
      this.queryDoctors = this.doctors.filter((doctor) =>
        this.removeAccents(doctor.name.toLowerCase()).includes(this.removeAccents(query.toLowerCase()))
      );
    } else {
      this.queryDoctors = null;
    }
  }

  removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  isValid() {
    return this.name !== null && this.name !== undefined && this.name.trim().length > 0;
  }

  save() {
    if (this.isValid()) {
      this.clinicsService.update(this.id, {
        name: this.name
      }).then(async () => {
        await this.router.navigate(['/clinics']);
        this.toastService.show("success", "Clínica actualizada con éxito");
      }).catch((error) => {
        this.toastService.show("danger", "Error al editar la clínica: " + error);
      })
    }
  }

  ngOnDestroy() {
    if (this.doctorsSub) {
      this.doctorsSub.unsubscribe();
    }
    if (this.userData) {
      this.userSub.unsubscribe();
    }
  }

}
