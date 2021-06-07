import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClinicAnalysisService } from 'src/app/services/clinic-analysis.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
})
export class CreatePage implements OnInit {
  name: string;
  testCode: string;

  constructor(
    private clinicAnalysisService: ClinicAnalysisService,
    private toastService: ToastService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  save() {
    if (this.name && this.testCode && this.name.length > 0 && this.testCode.length > 0) {
      this.clinicAnalysisService.create({
        name: this.name,
        testCode: this.testCode
      }).then(() => {
        this.toastService.show("success", "Creado con éxito");
        this.router.navigate(["/database/clinic-analysis"]);
      }).catch(error => {
        this.toastService.show("danger", "Error al crear: " + error);
      })
    } else {
      this.toastService.show("danger", "Rellene todos los campos");
    }

  }

}
