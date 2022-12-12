import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastService } from "src/app/services/toast.service";
import { UsersService } from "src/app/services/users.service";
import { HistoriesService } from "src/app/services/histories.service";
import { DiseasesService } from 'src/app/services/diseases.service';
import { LanguageService } from 'src/app/services/language.service';

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
  bloodType: string;
  rh: string;

  /* Hábitos de vida */
  smoker: boolean;
  alcohol: boolean;
  otherDrugs: string;
  medicines: boolean;
  solarExposition: string;
  workExposition: string;
  physicalActivity: string;

  /* Enfermedades confirmadas */
  diseases = [];
  currentDiseases = [];
  queryDisease: string;
  queryDiseaseList = [];

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
    public lang: LanguageService,
    private toastService: ToastService,
    private diseasesService: DiseasesService,
    private router: Router
  ) { }

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.params.id;
    this.getDiseases();
  }

  resetForm() {
    this.relationship = undefined;
    this.familyBranch = undefined;
  }

  resetRelation() {
    this.familyBranch = undefined;
  }

  async getDiseases() {
    const diseases = await this.diseasesService.getDiseasesData();
    diseases.forEach(element => {
      this.diseases.push(element.data());
    })
  }

  removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  addDisease(disease: any) {
    this.currentDiseases.push({ id: disease.id, name: disease.name });
    this.queryDiseaseList = [];
    this.queryDisease = null;
  }

  deleteDisease(index: any) {
    this.currentDiseases = this.currentDiseases.splice(1, index);
  }

  onDiseaseQueryChange(query: string) {
    this.queryDiseaseList = this.diseases.filter(element => this.removeAccents(element.name.trim().toLowerCase()).includes(this.removeAccents(query.trim().toLowerCase())));
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
        bloodType: this.bloodType || null,
        rh: this.rh || null,
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
        currentTreatment: this.currentTreatment || null,
        diseases: this.currentDiseases || []
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
