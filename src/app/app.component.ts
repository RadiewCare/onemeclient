import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import { AuthService } from "./services/auth.service";
import { LanguageService } from "./services/language.service";
import { PopoverController, AlertController, MenuController } from "@ionic/angular";
import { NotificationsPage } from "./components/notifications/notifications.page";
import { DoctorsService } from "./services/doctors.service";

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
  public appPagesDoctor = [
    {
      title: "Panel de control",
      titleEng: "Dashboard",
      url: "/dashboard",
      icon: "easel",
      disabled: false,
      role: "doctor"
    },
    {
      title: "Pacientes",
      titleEng: "Patients",
      url: "/subjects",
      icon: "person",
      disabled: false,
      role: "doctor"
    },
    {
      title: "Doctores",
      titleEng: "Doctors",
      url: "/doctors",
      icon: "people",
      disabled: false,
      role: "clinic-admin"
    },
    {
      title: "Registro de actividad",
      titleEng: "Activity Log",
      url: "/activity",
      icon: "list",
      disabled: false,
      role: "clinic-admin"
    }
   
  ];

  public appPagesAdmin = [
    {
      title: "Clínicas",
      titleEng: "Clinics",
      url: "/clinics",
      icon: "medical",
      disabled: false,
      role: "admin"
    },
    {
      title: "Base de datos",
      titleEng: "Database",
      url: "/database",
      icon: "folder",
      disabled: false,
      role: "admin"
    },
    {
      title: "Estadísticas",
      titleEng: "Statisitics",
      url: "/statistics",
      icon: "pie-chart",
      disabled: false,
      role: "admin"
    }
  ];
  public appPagesMining = [
    {
      title: "Pacientes",
      titleEng: "Patients",
      url: "/subjectsMining",
      icon: "pie-chart",
      disabled: false,
      role: "admin"
    },
    {
      title: "Pruebas de imagen",
      titleEng: "Subjects image test",
      url: "/subjectsImageTestsMining",
      icon: "pie-chart",
      disabled: false,
      role: "admin"
    }
  ];

  constructor(
    private auth: AuthService,
    public lang: LanguageService,
    private popoverController: PopoverController,
    private alertController: AlertController,
    private doctorService: DoctorsService
  ) { }

  ngOnInit() {
    this.user$ = this.auth.user$;

    this.userSub = this.user$.subscribe(async (data) => {
      this.userData = data;
      console.log(this.userData);

      this.doctorData = (await this.doctorService.getDoctorData(data.id)).data();
      console.log(this.doctorData);

      this.appPagesDoctor[3].url = `/activity/${this.doctorData.clinic}`;
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
