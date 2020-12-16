import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CategoriesService } from 'src/app/services/categories.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
})
export class CategoriesPage implements OnInit, OnDestroy {

  categories = [];
  queryCategories: any;

  categoriesSub: Subscription;

  constructor(private categoriesService: CategoriesService) { }

  ngOnInit() {
    this.getCategories();
  }

  ionViewDidEnter() {

  }

  getCategories() {
    this.categoriesSub = this.categoriesService.getAll().subscribe(data => {
      this.categories = data;
      this.categories = this.categories.sort((a, b) => this.removeAccents(a.name).localeCompare(this.removeAccents(b.name)))
    });
  }

  onSearchChange(query: string) {
    if (query.length > 0) {
      this.queryCategories = this.categories.filter((analysisElement) =>
        this.removeAccents(analysisElement.name.toLowerCase()).includes(this.removeAccents(query.toLowerCase()))
      );
    } else {
      this.queryCategories = null;
    }
  }

  removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  ngOnDestroy(): void {
    if (this.categoriesSub) { this.categoriesSub.unsubscribe(); }
  }

}
