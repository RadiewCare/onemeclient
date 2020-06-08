import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import { AuthService } from "./services/auth.service";
import { LanguageService } from "./services/language.service";
import { PopoverController, AlertController } from "@ionic/angular";
import { NotificationsPage } from "./components/notifications/notifications.page";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"]
})
export class AppComponent implements OnInit, OnDestroy {
  user$: any;
  userData: any;
  userSub: Subscription;
  doctorSub: Subscription;

  doctorData: any;

  hasNotifications = false;
  numberOfNotifications = 0;

  public selectedIndex = 0;
  public appPages = [
    {
      title: "Panel de control",
      url: "/dashboard",
      icon: "analytics",
      disabled: false,
      admin: false
    },
    {
      title: "Sujetos",
      url: "/subjects",
      icon: "person",
      disabled: false,
      admin: false
    },
    {
      title: "Doctores",
      url: "/doctors",
      icon: "people",
      disabled: false,
      admin: true
    },
    {
      title: "Informes",
      url: "/reports",
      icon: "document",
      disabled: false,
      admin: false
    },
    {
      title: "Tablas",
      url: "/tables",
      icon: "grid",
      disabled: false,
      admin: false
    },
    {
      title: "Plantillas",
      url: "/templates",
      icon: "create",
      disabled: false,
      admin: false
    },
    {
      title: "Base de datos",
      url: "/database",
      icon: "folder",
      disabled: false,
      admin: true
    },
    {
      title: "Estadísticas",
      url: "/statistics",
      icon: "pie-chart",
      disabled: false,
      admin: true
    }
  ];

  public appPagesEng = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: "analytics",
      disabled: false,
      admin: false
    },
    {
      title: "Subjects",
      url: "/subjects",
      icon: "person",
      disabled: false,
      admin: false
    },
    {
      title: "Doctors",
      url: "/doctors",
      icon: "people",
      disabled: false,
      admin: true
    },
    {
      title: "Reports",
      url: "/reports",
      icon: "document",
      disabled: false,
      admin: false
    },
    {
      title: "Tables",
      url: "/tables",
      icon: "grid",
      disabled: false,
      admin: false
    },
    {
      title: "Templates",
      url: "/templates",
      icon: "create",
      disabled: false,
      admin: false
    },
    {
      title: "Database",
      url: "/database",
      icon: "folder",
      disabled: false,
      admin: true
    },
    {
      title: "Statistics",
      url: "/statistics",
      icon: "pie-chart",
      disabled: false,
      admin: true
    }
  ];

  constructor(
    private auth: AuthService,
    public lang: LanguageService,
    private popoverController: PopoverController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.user$ = this.auth.user$;

    this.userSub = this.user$.subscribe((data) => {
      this.userData = data;
    });
  }

  async openNotifications(ev: any) {
    const popover = await this.popoverController.create({
      component: NotificationsPage,
      cssClass: "notifications",
      event: ev
    });
    return await popover.present();
  }

  async openSignOut() {
    const alert = await this.alertController.create({
      header: "Cerrar sesión",
      message: "¿Seguro que quieres cerrar sesión y salir?",
      buttons: [
        {
          text: "Cancelar",
          role: "cancel",
          cssClass: "secondary"
        },
        {
          text: "Aceptar",
          handler: () => {
            this.signOut();
          }
        }
      ]
    });
    return await alert.present();
  }

  isSelected(url: string) {
    return window.location.href.includes(url);
  }

  signOut() {
    this.auth.signOut();
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
    this.doctorSub.unsubscribe();
  }
}
