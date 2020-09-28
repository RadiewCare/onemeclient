import { Component, OnInit } from "@angular/core";
import { LanguageService } from "src/app/services/language.service";

@Component({
  selector: "app-documentation",
  templateUrl: "./documentation.page.html",
  styleUrls: ["./documentation.page.scss"]
})
export class DocumentationPage implements OnInit {
  constructor(public lang: LanguageService) {}

  ngOnInit() {}
}
