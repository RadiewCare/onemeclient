import { Injectable, OnDestroy } from "@angular/core";
import { Platform } from "@ionic/angular";
import { AuthService } from "./auth.service";
import { Observable, Subscription } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class LanguageService implements OnDestroy {
  public currentLanguage: string;
  public arrayLang: string[] = [
    "es",
    "es-AR",
    "es-BO",
    "es-CL",
    "es-CO",
    "es-CR",
    "es-DO",
    "es-EC",
    "es-EC",
    "es-ES",
    "es-GT",
    "es-HN",
    "es-MX",
    "es-NI",
    "es-PA",
    "es-PE",
    "es-PR",
    "es-PY",
    "es-SV",
    "es-UY",
    "es-VE"
  ];

  user$: Observable<any>;
  userSub: Subscription;
  userData: any;

  constructor(private platform: Platform, private auth: AuthService) {
    this.userSub = this.auth.user$.subscribe((data) => {
      if (data !== null) {
        this.userData = data;
        this.currentLanguage = this.userData.language;
      }
    });
  }

  public isSpanishCode(): boolean {
    if (this.arrayLang.includes(this.currentLanguage)) {
      return true;
    } else {
      return false;
    }
  }

  public isSpanish(): boolean {
    if (this.currentLanguage === "esp") {
      return true;
    } else {
      return false;
    }
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }
}
