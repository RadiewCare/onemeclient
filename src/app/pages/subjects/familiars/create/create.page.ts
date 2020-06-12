import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastService } from "src/app/services/toast.service";
import { UsersService } from "src/app/services/users.service";
import { HistoriesService } from "src/app/services/histories.service";

@Component({
  selector: "app-create",
  templateUrl: "./create.page.html",
  styleUrls: ["./create.page.scss"]
})
export class CreatePage implements OnInit {
  id: string;

  /* Parentesco */
  grade: string;
  relationship: string;
  familyBranch: string;

  /* Datos biométricos */
  genre: string;
  birthDate: string;
  height: number;
  weight: number;
  populationGroup: string;
  skin: string;
  hair: string;
  eyes: string;
  imc: number;
  androidFat: number;
  highBloodPressure: number;
  lowBloodPressure: number;
  alergies: string;
  foodIntolerance: string;
  intestinalDisorders: string;
  children: number;
  menarcheAge: number;
  menopausalAge: number;
  sop: boolean;
  vaginalSpotting: boolean;

  /* Hábitos de vida */
  smoker: boolean;
  alcohol: boolean;
  otherDrugs: string;
  medicines: boolean;
  solarExposition: string;
  workExposition: string;
  physicalActivity: string;

  /* Antecedentes */
  cancer: boolean;
  neurodegeneratives: boolean;
  autoinmunes: boolean;
  cardioDisease: boolean;
  infertility: boolean;

  /* Otros antecedentes */
  otherBackground: string;

  /* Tratamiento actual */
  currentTreatment: string;

  constructor(
    private usersService: UsersService,
    private historiesService: HistoriesService,
    private activatedRoute: ActivatedRoute,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.params.id;
  }

  resetForm() {
    this.relationship = undefined;
    this.familyBranch = undefined;
  }

  resetRelation() {
    this.familyBranch = undefined;
  }

  async save(): Promise<any> {
    if (this.grade !== undefined && this.relationship !== undefined) {
      const data = {
        grade: this.grade,
        relationship: this.relationship,
        familyBranch: this.familyBranch || null,
        genre: this.genre || null,
        birthDate: this.birthDate || null,
        height: this.height || null,
        weight: this.weight || null,
        populationGroup: this.populationGroup || null,
        skin: this.skin || null,
        hair: this.hair || null,
        eyes: this.eyes || null,
        imc: this.imc || null,
        androidFat: this.androidFat || null,
        highBloodPressure: this.highBloodPressure || null,
        lowBloodPressure: this.lowBloodPressure || null,
        alergies: this.alergies || null,
        foodIntolerance: this.foodIntolerance || null,
        intestinalDisorders: this.intestinalDisorders || null,
        children: this.children || null,
        menarcheAge: this.menarcheAge || null,
        menopausalAge: this.menopausalAge || null,
        sop: this.sop || null,
        vaginalSpotting: this.vaginalSpotting || null,
        smoker: this.smoker || null,
        alcohol: this.alcohol || null,
        otherDrugs: this.otherDrugs || null,
        medicines: this.medicines || null,
        solarExposition: this.solarExposition || null,
        workExposition: this.workExposition || null,
        physicalActivity: this.physicalActivity || null,
        cancer: this.cancer || null,
        neurodegeneratives: this.neurodegeneratives || null,
        autoinmunes: this.autoinmunes || null,
        cardioDisease: this.cardioDisease || null,
        infertility: this.infertility || null,
        otherBackground: this.otherBackground || null,
        currentTreatment: this.currentTreatment || null
      };
      this.historiesService
        .createHistory(this.id, data)
        .then(() => {
          this.router.navigate(["/subjects/familiars", this.id]);
          this.toastService.show("success", "Familiar creado con éxito");
        })
        .catch(() => {
          this.toastService.show("danger", "Error al crear el familiar");
        });
    } else {
      this.toastService.show(
        "danger",
        "Se debe completar como mínimo el grado y la relación de parentesco"
      );
    }
  }
}
