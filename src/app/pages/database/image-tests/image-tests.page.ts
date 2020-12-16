import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import { ImageTestsService } from "src/app/services/image-tests.service";

@Component({
  selector: "app-image-tests",
  templateUrl: "./image-tests.page.html",
  styleUrls: ["./image-tests.page.scss"]
})
export class ImageTestsPage implements OnInit, OnDestroy {

  imageTests: any;
  queryImageTests: any;
  imageTestsSub: Subscription;

  constructor(private imageTestsService: ImageTestsService) { }

  ngOnInit() {
    this.imageTestsSub = this.imageTestsService
      .getImageTests()
      .subscribe((tests) => {
        this.imageTests = tests;
        this.imageTests = this.imageTests.sort((a, b) => this.removeAccents(a.name).localeCompare(this.removeAccents(b.name)))
        console.log(this.imageTests);
        const filtered = this.imageTests.filter(element => !element.elements);
        console.log(filtered);

      });
  }

  onSearchChange(query: string) {
    console.log(query);

    if (query.length > 0) {
      this.queryImageTests = this.imageTests.filter((test) =>
        this.removeAccents(test.name.toLowerCase()).includes(this.removeAccents(query.toLowerCase()))
      );
      console.log(this.queryImageTests);
    } else {
      this.queryImageTests = null;
    }
  }

  removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  ngOnDestroy() {
    this.imageTestsSub.unsubscribe();
  }
}
