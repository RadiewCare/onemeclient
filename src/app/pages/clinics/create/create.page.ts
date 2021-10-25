import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClinicsService } from 'src/app/services/clinics.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
})
export class CreatePage implements OnInit {

  name: string;

  constructor(
    private clinicsService: ClinicsService,
    private toastService: ToastService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  save() {
    this.clinicsService.create({
      name: this.name
    }).then(async () => {
      await this.router.navigate(['/clinics']);
      this.toastService.show("success", "Clínica creada con éxito");
    }).catch((error) => {
      this.toastService.show("danger", "Error al crear la clínica: " + error);
    })
  }

}
