import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CategoriesService } from 'src/app/services/categories.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
})
export class CreatePage implements OnInit {

  categoryName: string = "";
  categories = [];

  constructor(private categoriesService: CategoriesService, private toastService: ToastService, private router: Router) { }

  ngOnInit() {
  }

  async ionViewDidEnter() {
    await this.categoriesService.getAllData().then(docs => {
      docs.forEach(element => {
        this.categories.push(element.data());
      });
    })
  }

  isValid() {
    const categoriesNames = this.categories.map(element => element = element.name.toLowerCase());

    if (
      categoriesNames.includes(this.categoryName.trim().toLowerCase()) ||
      this.categoryName.trim().length === 0
    ) {
      return false
    } else return true;
  }

  save() {
    if (this.isValid()) {
      this.categoriesService.create({ name: this.categoryName }).then(async () => {
        await this.toastService.show("success", "Categoría creada con éxito");
        this.router.navigate(["/database/categories"]);
      }).catch(error => {
        this.toastService.show("danger", "Error al crear la categoría: " + error);
      });
    } else {
      this.toastService.show("danger", "El nombre no es válido o ya existe");
    }
  }

}
