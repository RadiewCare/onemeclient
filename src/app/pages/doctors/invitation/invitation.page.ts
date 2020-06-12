import { Component, OnInit } from "@angular/core";
import { ModalController } from "@ionic/angular";

@Component({
  selector: "app-invitation",
  templateUrl: "./invitation.page.html",
  styleUrls: ["./invitation.page.scss"]
})
export class InvitationPage implements OnInit {
  constructor(private modalController: ModalController) {}

  ngOnInit() {}

  send() {}

  close() {
    this.modalController.dismiss();
  }
}
