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
    });
  }

  onSearchChange(query: string) {
    if (query.length > 0) {
      this.queryCategories = this.categories.filter((analysisElement) =>
        analysisElement.name.toLowerCase().includes(query.toLowerCase())
      );
    } else {
      this.queryCategories = null;
    }
  }

  ngOnDestroy(): void {
    if (this.categoriesSub) { this.categoriesSub.unsubscribe(); }
  }

}
