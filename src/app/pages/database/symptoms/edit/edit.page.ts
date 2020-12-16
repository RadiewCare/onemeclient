import { Component, OnInit, OnDestroy } from "@angular/core";
import { SymptomsService } from "../../../../services/symptoms.service";
import { ToastService } from "../../../../services/toast.service";
import { Router, ActivatedRoute } from "@angular/router";
import * as moment from "moment";
import { AlertController } from "@ionic/angular";
import { Subscription } from "rxjs";
import { SubjectsService } from 'src/app/services/subjects.service';
import { DiseasesService } from 'src/app/services/diseases.service';

@Component({
  selector: "app-edit",
  templateUrl: "./edit.page.html",
  styleUrls: ["./edit.page.scss"]
})
export class EditPage implements OnInit, OnDestroy {
  id: string;
  name: string;
  initialName: string;
  symptom: any;
  symptomSub: Subscription;

  constructor(
    private symptomsService: SymptomsService,
    private toastService: ToastService,
    private router: Router,
    private alertController: AlertController,
    private activatedRoute: ActivatedRoute,
    private subjectsService: SubjectsService,
    private diseasesService: DiseasesService
  ) { }

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.paramMap.get("id");
    this.getSymptom();
  }

  getSymptom() {
    this.symptomSub = this.symptomsService
      .getSymptom(this.id)
      .subscribe((symptom) => {
        this.name = symptom.name;
        this.initialName = symptom.name;
      });
  }

  isValid(): boolean {
    if (this.name === undefined) {
      return false;
    } else {
      return true;
    }
  }

  async save() {
    if (this.isValid()) {
      this.symptom = {
        name: this.name,
        updatedAt: moment().format()
      };

      if (this.name !== this.initialName) {
        await this.updateSubjectIfSymptomNameChange();
      }

      return await this.symptomsService
        .updateSymptom(this.id, this.symptom)
        .then(() => {
          this.router.navigate(["/database/symptoms"]);
          this.toastService.show("success", "Síntoma editado con éxito");
        })
        .catch((error) => {
          this.toastService.show(
            "danger",
            "Error: Ha habido algún error al editar el síntoma, inténtelo más tarde: " +
            error
          );
        });
    } else {
      this.toastService.show(
        "danger",
        "Error: Hay campos erróneos o incompletos"
      );
    }
  }

  async updateSubjectIfSymptomNameChange() {
    console.log("entro");
    // Actualizar en el sujeto
    this.subjectsService.getSubjectsData().then(async data => {
      let subjects = data.docs.map(element => element = element.data())
        .filter(subject => subject.history && subject.history.signsAndSymptoms && subject.history.signsAndSymptoms.some(element => element.id === this.id));
      console.log(subjects);

      for await (const subject of subjects) {
        const index = subject.history.signsAndSymptoms.findIndex(element => element.id = this.id);
        console.log(index);

        subject.history.signsAndSymptoms[index].name = this.name;
        console.log(subject.history.signsAndSymptoms);

        this.subjectsService.updateSubject(subject.id, { history: subject.history })
      }
    })

    // Actualizar en las enfermedades
    this.diseasesService.getDiseasesData().then(async data => {
      let diseases = data.docs.map(element => element = element.data())
        .filter(disease => disease.signsAndSymptoms && disease.signsAndSymptoms.some(element => element.id === this.id));
      console.log(diseases);

      for await (const disease of diseases) {
        const index = disease.signsAndSymptoms.findIndex(element => element.id = this.id);
        console.log(index);

        disease.signsAndSymptoms[index].name = this.name;
        console.log(disease.signsAndSymptoms);

        this.diseasesService.updateDisease(disease.id, { signsAndSymptoms: disease.signsAndSymptoms })
      }
    })

  }

  updateSubjectIfSymptomIsDeleted() {
    // Actualizar en el sujeto
    this.subjectsService.getSubjectsData().then(async data => {
      let subjects = data.docs.map(element => element = element.data())
        .filter(subject => subject.history && subject.history.signsAndSymptoms && subject.history.signsAndSymptoms.some(element => element.id === this.id));
      console.log(subjects);

      for await (const subject of subjects) {
        const index = subject.history.signsAndSymptoms.findIndex(element => element.id = this.id);
        console.log(index);

        subject.history.signsAndSymptoms = subject.history.signsAndSymptoms.splice(index, 1);
        console.log(subject.history.signsAndSymptoms);

        this.subjectsService.updateSubject(subject.id, { signsAndSymptoms: subject.history.signsAndSymptoms })
      }
    })

    // Actualizar en las enfermedades
    this.diseasesService.getDiseasesData().then(async data => {
      let diseases = data.docs.map(element => element = element.data())
        .filter(disease => disease.signsAndSymptoms && disease.signsAndSymptoms.some(element => element.id === this.id));
      console.log(diseases);

      for await (const disease of diseases) {
        const index = disease.signsAndSymptoms.findIndex(element => element.id = this.id);
        console.log(index);

        disease.signsAndSymptoms = disease.signsAndSymptoms.splice(index, 1);
        console.log(disease.signsAndSymptoms);

        this.subjectsService.updateSubject(disease.id, { signsAndSymptoms: disease.signsAndSymptoms })
      }
    })
  }

  async delete() {
    const alert = await this.alertController.create({
      header: "¿Estás seguro?",
      message: "Pulse aceptar para eliminar el síntoma",
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
            this.symptomSub.unsubscribe();
            this.router.navigate(["/database/symptoms"]);
            this.symptomsService
              .deleteSymptom(this.id)
              .then(() => {
                this.updateSubjectIfSymptomIsDeleted();
                this.toastService.show(
                  "success",
                  "Síntoma eliminado con éxito"
                );
              })
              .catch(() => {
                this.toastService.show(
                  "danger",
                  "Error: Ha hablido algún error al eliminar el síntoma, inténtelo más tarde"
                );
              });
          }
        }
      ]
    });

    await alert.present();
  }

  ngOnDestroy(): void {
    if (this.symptomSub) {
      this.symptomSub.unsubscribe();
    }
  }
}
