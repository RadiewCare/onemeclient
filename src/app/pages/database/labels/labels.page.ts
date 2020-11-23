import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LabelsService } from 'src/app/services/labels.service';

@Component({
  selector: 'app-labels',
  templateUrl: './labels.page.html',
  styleUrls: ['./labels.page.scss'],
})
export class LabelsPage implements OnInit {

  labels = [];
  queryLabels: any;

  labelsSub: Subscription;

  constructor(private labelsService: LabelsService) { }

  ngOnInit() {
    this.getCategories();
  }

  ionViewDidEnter() {

  }

  getCategories() {
    this.labelsSub = this.labelsService.getAll().subscribe(data => {
      this.labels = data;
    });
  }

  onSearchChange(query: string) {
    if (query.length > 0) {
      this.queryLabels = this.labels.filter((analysisElement) =>
        analysisElement.name.toLowerCase().includes(query.toLowerCase())
      );
    } else {
      this.queryLabels = null;
    }
  }

  ngOnDestroy(): void {
    if (this.labelsSub) { this.labelsSub.unsubscribe(); }
  }

}
