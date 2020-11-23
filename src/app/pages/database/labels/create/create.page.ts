import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LabelsService } from 'src/app/services/labels.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
})
export class CreatePage implements OnInit {

  labelName: string = "";
  labels = [];

  constructor(private labelsService: LabelsService, private toastService: ToastService, private router: Router) { }

  ngOnInit() {
  }

  async ionViewDidEnter() {
    await this.labelsService.getAllData().then(docs => {
      docs.forEach(element => {
        this.labels.push(element.data());
      });
    })
  }

  isValid() {
    const labelNames = this.labels.map(element => element = element.name.toLowerCase());

    if (
      labelNames.includes(this.labelName.trim().toLowerCase()) ||
      this.labelName.trim().length === 0
    ) {
      return false
    } else return true;
  }

  save() {
    if (this.isValid()) {
      this.labelsService.create({ name: this.labelName }).then(async () => {
        await this.toastService.show("success", "Etiqueta creada con éxito");
        this.router.navigate(["/database/labels"]);
      }).catch(error => {
        this.toastService.show("danger", "Error al crear la etiqueta: " + error);
      });
    } else {
      this.toastService.show("danger", "El nombre no es válido o ya existe");
    }
  }

}
