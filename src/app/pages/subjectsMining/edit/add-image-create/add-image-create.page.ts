import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-image-create',
  templateUrl: './add-image-create.page.html',
  styleUrls: ['./add-image-create.page.scss'],
})
export class AddImageCreatePage implements OnInit {
  @Input() imageTestId: string;
  @Input() biomarkerId: string;
  @Input() field: number;
  @Input() value: any;

  imageTestElement: any;
  biomarker: any;

  indexOfBiomarker: any;

  id: string;
  indexTest: number;
  test: any;
  tests: any;
  currentSection: string;
  currentX: number;
  currentY: number;
  currentZ: number;
  preview: any;

  currentFiles: any;

  fileSubscription: Subscription;

  images = [];

  biomarkers = [];

  subject: any;

  constructor() { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    console.log(this.imageTestId);
    console.log(this.biomarkerId);
    console.log(this.field);
    console.log(this.value);
  }

  getData() {

  }

}
