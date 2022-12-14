import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-notifications",
  templateUrl: "./notifications.page.html",
  styleUrls: ["./notifications.page.scss"]
})
export class NotificationsPage implements OnInit {
  hasNotifications = false;
  numberOfNotifications = 0;
  notifications = [];

  constructor() {}

  ngOnInit() {}

  cleanNotifications() {}
}
