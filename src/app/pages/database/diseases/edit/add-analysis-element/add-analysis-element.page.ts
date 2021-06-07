import { Component, OnInit, Input } from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { DiseasesService } from "src/app/services/diseases.service";
import { ClinicAnalysisElementsService } from "src/app/services/clinic-analysis-elements.service";
import { ModalController } from "@ionic/angular";
import { ToastService } from "src/app/services/toast.service";
import { SynlabCatalogService } from "src/app/services/synlab-catalog.service";
import * as firebase from "firebase";

@Component({
  selector: "app-add-analysis-element",
  templateUrl: "./add-analysis-element.page.html",
  styleUrls: ["./add-analysis-element.page.scss"]
})
export class AddAnalysisElementPage implements OnInit {
  @Input() id: string;

  disease: any;
  analysisElements$: Observable<any>;
  analysisElements: any;
  analysisElementsData;
  analysisElementsSub: Subscription;

  relevancy: string = "both";

  isCustom = false;

  ranges = [];

  lowerLevel: number;
  upperLevel: number;
  lowerAge: number;
  upperAge: number;
  sex: string;
  metricUnit: any;
  intervaloEdad: string;

  metrics = ["ng/mL", "mg/24h", "ng/dL", "ug/L", "mg/g creat", "ug/mL", "g/L", "Título", "%", "mg/dL", "U/mL", "mg/L", "µmol/L", "TRU/mL", "UA", "kU/L", "GPL-U/mL", "MPL-U/mL", "Índice", "pg/mL", "U/L", "KUI/L", "mg/g crea", "RU/mL", "UI/mL", "EU/mL", "g/g crea", "umol/L", "mmol/mol crea", "gr/24h", "ug/g creat", "UA/mL", "nmol/min/mL", "ug/24h", "mg/g creatinina", "KU/L", "mmol/L", "ug/g heces", "pmol/L", "U/gHb/seg-1", "ug/24 h", "ug/g crea", "x10³/mm³", "mequ/L", "mEqu/24h", "nmol/24 h", "ng/mg", "ug/dL", "mg/24 h", "nmol/mmol Cr", "g/g creat", "µg/L", "Indice", "kRU/L", "UI/L", "ug GIP / gr", "mg/mmol Crea", "mmol/mol cr", "ug/g cabello", "ng/L", "ug Eq/mL", "UB", "mU/L", "mEq/L", "mg Xilosa", "% recuper", "IE", "ng/mg creat", "% de Hb", "ug/g pelo", "nmol/L", "U/g creat", "pg/min", "seg", "ng/mL/hora", "% hemólisis", "ng B12/L", "nmol/h/mL", "mg/g cre", "CFU/g", "mUI/mL", "g/5h", "UL/g Hb", "Cociente", "fmol/L", "ug/g de tej", "UI/g Hb", "UI/g Hgb", "AU/ml", "mL", "nmol/21h ", "U/dL", "g/100gr", "mg/g heces hum", "mg/gr crea", "APL/mL", "nmol/h/mg pr", "mU/mL", "por mil", "copias/mL", "mmol/mol creat", "mmol/molcrea", "nmol/min/mg pr", "mOsm/Kg", "pmol/mg prot", "nmol ECO/mM cr", "MPL/mL", "mol/mol crea", "ug/g de tejido", "Ratio", "ug/g Crea", "U/24h", "AU/mL", "mEq/24h", "umol/g creat", "NG/10^9 PLT", "mm", "umol/24h", "GPL/mL", "mg/mg", "g/24h", "ug/g de crea", "k/UL", "umol/g crea", "/ 10³ Hematíes", "U/g Hb", "% lisis celular", "mg/gr creat", "nmol/mL", "mOsm/mL", "U. arb./mL", "nmol/min/mg", "ug/g Hb", "U/g"];
  intervaloEdades = ["Años", "Días", "Horas", "Meses", "Semanas"];


  constructor(
    private diseasesService: DiseasesService,
    private analysisElementsService: ClinicAnalysisElementsService,
    private modalController: ModalController,
    private toastService: ToastService
  ) { }

  async ngOnInit() {
    this.metrics.sort();
    this.getDisease();
    this.getAnalysisElements();
  }

  getDisease() {
    this.diseasesService.getDiseaseData(this.id).then((diseaseData) => {
      this.disease = diseaseData.data();
    });
  }

  getAnalysisElements() {
    this.analysisElementsService.getClinicAnalysisElementsData().then(async (data) => {
      this.analysisElements = data.docs.map(el => el = el.data());
      console.log(this.analysisElements);

      this.analysisElements.map(element => {
        element.name = element.elementCode + " - " + element.name;
      });
    })
  }

  onSearch(event: any) {
    event.component.items = this.analysisElements;
    if (event.text.length > 0) {
      event.component.items = event.component.items.filter(e => this.removeAccents(e.name.toLowerCase()).includes(this.removeAccents(event.text.toLowerCase())));
    }
  }

  removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  addRange() {
    if (
      this.sex &&
      this.intervaloEdad &&
      this.metricUnit &&
      this.analysisElementsData &&
      this.relevancy
    ) {
      const data = {
        SEXO: this.sex,
        INTERVALO_INF_EDAD: this.lowerAge || 0,
        INTERVALO_SUP_EDAD: this.upperAge || 999,
        LIM_INF: this.lowerLevel || 0,
        LIM_SUP: this.upperLevel || 999,
        UNIDAD_INTERVALO_EDAD: this.intervaloEdad || null,
        UNIDAD: this.metricUnit || null,
        testId: this.analysisElementsData[0].id,
        CODIGO_T: this.analysisElementsData[0].elementCode,
        DESCRIPCION: this.analysisElementsData[0].name,
        relevancy: this.relevancy
      }
      console.log(this.analysisElementsData);

      console.log(data);

      this.ranges.push(data);
    } else {
      this.toastService.show(
        "danger",
        "Al menos debes introducir valor mínimo ó máximo"
      );
    }
  }

  deleteRange(index: number) {
    this.ranges.splice(index, 1);
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  isValid() {
    if (this.analysisElementsData === undefined) {
      return false;
    } else {
      return true;
    }
  }

  save() {
    if (this.isValid()) {
      const array = this.disease.analysisElements || [];
      this.analysisElementsData.forEach((element) => {
        array.push({
          id: element.id,
          name: element.name,
          ranges: this.ranges,
          isCustom: this.isCustom,
          relevancy: this.relevancy,
          format: "synlab"
        });
      });
      const data = {
        analysisElements: array
      };
      this.diseasesService
        .updateDisease(this.disease.id, data)
        .then(() => {
          data.analysisElements.forEach(element => {
            this.analysisElementsService.updateClinicAnalysisElement(element.id, {
              relatedDiseases: firebase.firestore.FieldValue.arrayUnion(this.disease.id)
            })
          });
          this.dismissModal();
          this.toastService.show(
            "success",
            "Elementos de análisis añadido con éxito"
          );
        })
        .catch(() => {
          this.toastService.show(
            "danger",
            "Error al añadir el elementos de análisis"
          );
        });
    } else {
      this.toastService.show(
        "danger",
        "Error: Hay campos erróneos o incompletos"
      );
    }
  }

  ngOnDestroy(): void {
    if (this.analysisElementsSub) {
      this.analysisElementsSub.unsubscribe();
    }
  }
}
