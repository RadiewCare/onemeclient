import { Component, OnInit, Input } from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { MutationsService } from "src/app/services/mutations.service";
import { DiseasesService } from "src/app/services/diseases.service";
import { ModalController } from "@ionic/angular";
import { ToastService } from "src/app/services/toast.service";

@Component({
  selector: "app-add-mutation",
  templateUrl: "./add-mutation.page.html",
  styleUrls: ["./add-mutation.page.scss"]
})
export class AddMutationPage implements OnInit {
  @Input() id: string;

  disease: any;
  mutations$: Observable<any>;
  mutations: any;
  mutationsData;
  mutationsSub: Subscription;

  constructor(
    private diseasesService: DiseasesService,
    private mutationsService: MutationsService,
    private modalController: ModalController,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.getDisease();
    this.getMutations();
  }

  getDisease() {
    this.diseasesService.getDiseaseData(this.id).then((diseaseData) => {
      this.disease = diseaseData.data();
    });
  }

  getMutations() {
    this.mutations$ = this.mutationsService.getMutations();
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  isValid() {
    if (this.mutationsData === undefined) {
      return false;
    } else {
      return true;
    }
  }

  save() {
    if (this.isValid()) {
      const array = [];
      this.mutationsData.forEach((element) => {
        array.push({ id: element.id, name: element.name });
      });
      const data = {
        mutations: array
      };
      this.diseasesService
        .updateDisease(this.disease.id, data)
        .then(() => {
          this.dismissModal();
          this.toastService.show("success", "Mutación añadida con éxito");
        })
        .catch(() => {
          this.toastService.show("danger", "Error al añadir la mutación");
        });
    } else {
      this.toastService.show(
        "danger",
        "Error: Hay campos erróneos o incompletos"
      );
    }
  }
}
