import { Component, OnInit, Input } from "@angular/core";
import { ModalController } from "@ionic/angular";

@Component({
  selector: "app-show",
  templateUrl: "./show.page.html",
  styleUrls: ["./show.page.scss"]
})
export class ShowPage implements OnInit {
  @Input() image: any;
  constructor(private modalController: ModalController) {}

  ngOnInit() {}

  dismissModal() {
    this.modalController.dismiss();
  }
}
