import { Component, OnDestroy, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ImageTestsElementsService } from 'src/app/services/image-tests-elements.service';
@Component({
  selector: 'app-image-tests-elements',
  templateUrl: './image-tests-elements.page.html',
  styleUrls: ['./image-tests-elements.page.scss'],
})
export class ImageTestsElementsPage implements OnInit, OnDestroy {

  imageTestsElementsSub: Subscription;
  imageTestsElements: any;

  queryImageTestsElements: any;

  loading: any;

  constructor(
    private imageTestsElementsService: ImageTestsElementsService,
    public loadingController: LoadingController) { }

  ngOnInit() {
    this.queryImageTestsElements = null;
    this.presentLoading();
    this.imageTestsElementsSub = this.imageTestsElementsService.getImageTestElements().subscribe((data) => {
      this.imageTestsElements = data;
      this.imageTestsElements = this.imageTestsElements.sort(function (a, b) {
        var textA = a.name.toUpperCase();
        var textB = b.name.toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
      });
      this.imageTestsElements = this.imageTestsElements.sort((a, b) => this.removeAccents(a.name).localeCompare(this.removeAccents(b.name)))
      console.log(this.imageTestsElements);
      this.loadingController.dismiss();
      this.duplicates();
    });
  }

  duplicates() {
    const elementos = [];
    const repetidos = [];
    for (let index = 0; index < this.imageTestsElements.length; index++) {
      if (!elementos.includes(this.imageTestsElements[index].name)) {
        elementos.push(this.imageTestsElements[index].name)
      } else if (!repetidos.includes(this.imageTestsElements[index].name)) {
        repetidos.push(this.imageTestsElements[index].name)
      }
    }
    console.log(elementos, "elems");
    console.log(repetidos, "rep");
  }

  onSearchChange(query: string) {
    console.log(query);

    if (query.length > 0) {
      this.queryImageTestsElements = this.imageTestsElements.filter((test) =>
        this.removeAccents(test.name.toLowerCase()).includes(this.removeAccents(query.toLowerCase()))
      );
      console.log(this.queryImageTestsElements);
    } else {
      this.queryImageTestsElements = null;
    }
  }

  removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  async presentLoading() {
    this.loading = await this.loadingController.create({
      message: 'Cargando...'
    });
    await this.loading.present();
  }

  ngOnDestroy(): void {
    if (this.imageTestsElementsSub) {
      this.imageTestsElementsSub.unsubscribe();
    }
  }

}
