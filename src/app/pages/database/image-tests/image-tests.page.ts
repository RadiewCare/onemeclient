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
  constructor(private imageTestsService: ImageTestsService) {}

  ngOnInit() {
    this.imageTestsSub = this.imageTestsService
      .getImageTests()
      .subscribe((tests) => {
        this.imageTests = tests;
      });
  }

  onSearchChange(query: string) {
    console.log(query);

    if (query.length > 0) {
      this.queryImageTests = this.imageTests.filter((test) =>
        test.name.toLowerCase().includes(query.toLowerCase())
      );
      console.log(this.queryImageTests);
    } else {
      this.queryImageTests = null;
    }
  }

  ngOnDestroy() {
    this.imageTestsSub.unsubscribe();
  }
}
