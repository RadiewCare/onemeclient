import { Component, OnInit } from "@angular/core";
import { UsersService } from "src/app/services/users.service";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastService } from "src/app/services/toast.service";
import { Observable, Subscription } from "rxjs";
import { AlertController } from "@ionic/angular";
import { HistoriesService } from "src/app/services/histories.service";
import { DiseasesService } from 'src/app/services/diseases.service';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: "app-edit",
  templateUrl: "./edit.page.html",
  styleUrls: ["./edit.page.scss"]
})
export class EditPage implements OnInit {
  id: string;
  subjectId: string;

  familiar: any;
  familiar$: Observable<any>;
  familiarSub: Subscription;

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
    private toastService: ToastService,
    private router: Router,
    public lang: LanguageService,
    private diseasesService: DiseasesService,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.params.id;
    this.subjectId = this.activatedRoute.snapshot.params.subjectId;
    this.getDiseases();
  }

  ionViewDidEnter() {
    this.familiar$ = this.historiesService.getFamiliar(this.subjectId, this.id);
    this.familiarSub = this.familiar$.subscribe((data) => {
      this.familiar = data;
      this.grade = data.grade;
      this.relationship = data.relationship;
      this.familyBranch = data.familyBranch;
      this.genre = data.genre;
      this.birthDate = data.birthDate;
      this.height = data.height;
      this.weight = data.weight;
      this.populationGroup = data.populationGroup;
      this.skin = data.skin;
      this.bloodType = data.bloodType;
      this.rh = data.rh;
      this.hair = data.hair;
      this.eyes = data.eyes;
      this.imc = data.imc;
      this.androidFat = data.androidFat;
      this.highBloodPressure = data.highBloodPressure;
      this.lowBloodPressure = data.lowBloodPressure;
      this.alergies = data.alergies;
      this.foodIntolerance = data.foodIntolerance;
      this.intestinalDisorders = data.intestinalDisorders;
      this.children = data.children;
      this.menarcheAge = data.menarcheAge;
      this.menopausalAge = data.menopausalAge;
      this.sop = data.sop;
      this.vaginalSpotting = data.vaginalSpotting;
      this.smoker = data.smoker;
      this.alcohol = data.alcohol;
      this.otherDrugs = data.otherDrugs;
      this.medicines = data.medicines;
      this.solarExposition = data.solarExposition;
      this.workExposition = data.workExposition;
      this.physicalActivity = data.physicalActivity;
      this.cancer = data.cancer;
      this.neurodegeneratives = data.neurodegeneratives;
      this.autoinmunes = data.autoinmunes;
      this.cardioDisease = data.cardioDisease;
      this.infertility = data.infertility;
      this.diseases = data.diseaes || [];
      this.otherBackground = data.otherBackground;
      this.currentTreatment = data.currentTreatment;
    });
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

  addDisease(disease: any) {
    this.currentDiseases.push({ id: disease.id, name: disease.name });
    this.queryDiseaseList = [];
    this.queryDisease = null;
  }

  removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
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
        .updateHistory(this.subjectId, this.id, data)
        .then(() => {
          this.familiarSub.unsubscribe();
          this.router.navigate(["/subjects/familiars", this.subjectId]);
          this.toastService.show("success", "Familiar editado con éxito");
        })
        .catch(() => {
          this.toastService.show("danger", "Error al editar el familiar");
        });
    } else {
      this.toastService.show(
        "danger",
        "Se debe completar como mínimo el grado y la relación de parentesco"
      );
    }
  }

  async import(): Promise<any> { }

  async delete(): Promise<any> {
    const alert = await this.alertController.create({
      header: "¿Estás seguro?",
      message:
        "Pulse aceptar para eliminar el familiar. Se eliminarán todos los datos asociados.",
      buttons: [
        {
          text: "Cancelar",
          role: "cancel",
          cssClass: "secondary",
          handler: (blah) => { }
        },
        {
          text: "Aceptar",
          handler: () => {
            this.familiarSub.unsubscribe();
            this.historiesService
              .deleteHistory(this.subjectId, this.id)
              .then(() => {
                this.router.navigate(["/subjects/familiars", this.subjectId]);
                this.toastService.show(
                  "success",
                  "Familiar eliminado con éxito"
                );
              })
              .catch(() => {
                this.toastService.show(
                  "danger",
                  "Error al eliminar el familiar"
                );
              });
          }
        }
      ]
    });
    await alert.present();
  }
}
