import { Component, OnDestroy, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { Observable, Subscription } from 'rxjs';
import { ImageTestsElementsService } from 'src/app/services/image-tests-elements.service';
import { ImageTestsService } from 'src/app/services/image-tests.service';

@Component({
  selector: 'app-image-tests-elements',
  templateUrl: './image-tests-elements.page.html',
  styleUrls: ['./image-tests-elements.page.scss'],
})
export class ImageTestsElementsPage implements OnInit, OnDestroy {

  imageTestsElementsSub: Subscription;
  imageTestsElements: any;

  queryImageTestsElements: any;

  constructor(private imageTestsService: ImageTestsService, private imageTestsElementsService: ImageTestsElementsService, public loadingController: LoadingController) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.queryImageTestsElements = null;
    this.presentLoading();
    this.imageTestsElementsSub = this.imageTestsElementsService.getImageTestElements().subscribe((data) => {
      this.imageTestsElements = data;
      this.imageTestsElements = this.imageTestsElements.sort(function (a, b) {
        var textA = a.name.toUpperCase();
        var textB = b.name.toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
      });
      console.log(this.imageTestsElements);
      this.loadingController.dismiss();
    });
  }

  onSearchChange(query: string) {
    console.log(query);

    if (query.length > 0) {
      this.queryImageTestsElements = this.imageTestsElements.filter((test) =>
        test.name.toLowerCase().includes(query.toLowerCase())
      );
      console.log(this.queryImageTestsElements);
    } else {
      this.queryImageTestsElements = null;
    }
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      message: 'Cargando...'
    });
    await loading.present();
  }


  ngOnDestroy(): void {
    this.imageTestsElementsSub.unsubscribe();
  }

}
