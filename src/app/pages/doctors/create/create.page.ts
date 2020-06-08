import { Component, OnInit } from "@angular/core";
import { ToastService } from "src/app/services/toast.service";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { UsersService } from "src/app/services/users.service";
import { LanguageService } from "src/app/services/language.service";

@Component({
  selector: "app-create",
  templateUrl: "./create.page.html",
  styleUrls: ["./create.page.scss"]
})
export class CreatePage implements OnInit {
  users: Observable<any>;
  selectedUserId: any;
  name: string;
  collaborator = false;
  admin = false;

  constructor(
    private doctorsService: UsersService,
    private usersService: UsersService,
    private toastService: ToastService,
    public lang: LanguageService,
    private router: Router
  ) {}

  ngOnInit() {}

  ionViewDidEnter() {
    this.users = this.usersService.getUsers();
  }

  async save(): Promise<any> {
    const data = {
      isDoctor: true,
      isCollaborator: this.collaborator,
      isAdmin: this.admin,
      name: this.name || null,
      sharedSubjectsPhenotypic: [],
      sharedSubjectsGenetic: [],
      sharedSubjectsAnalytic: [],
      sharedSubjectsImage: []
    };
    this.doctorsService
      .updateUser(this.selectedUserId, data)
      .then(() => {
        this.router.navigate(["/doctors"]).then(() => {
          this.toastService.show("success", "Doctor creado con éxito");
        });
      })
      .catch((error) => {
        this.toastService.show(
          "danger",
          "Error: No se ha podido crear el doctor" + error
        );
      });
  }
}
