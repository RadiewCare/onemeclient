import { Component, OnInit, OnDestroy } from "@angular/core";
import { ToastService } from "src/app/services/toast.service";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription, Observable } from "rxjs";
import * as firebase from "firebase/app";
import { DiseasesService } from "src/app/services/diseases.service";
import { ClinicAnalysisElementsService } from "src/app/services/clinic-analysis-elements.service";
import { GeneticElementsService } from "src/app/services/genetic-elements.service";
import { ModalController, AlertController } from "@ionic/angular";
import { AddEpigeneticElementPage } from "./add-epigenetic-element/add-epigenetic-element.page";
import { AddMutationPage } from "./add-mutation/add-mutation.page";
import { AddImageTestPage } from "./add-image-test/add-image-test.page";
import { AddAnalysisElementPage } from "./add-analysis-element/add-analysis-element.page";
import { AddGeneticElementPage } from "./add-genetic-element/add-genetic-element.page";
import { MutationsService } from "src/app/services/mutations.service";
import { AddPhenotypicElementPage } from "./add-phenotypic-element/add-phenotypic-element.page";
import { ImportPage } from "./import/import.page";
import { ImageTestsElementsService } from 'src/app/services/image-tests-elements.service';
import { CategoriesService } from 'src/app/services/categories.service';
import { LabelsService } from 'src/app/services/labels.service';
import { SymptomsService } from 'src/app/services/symptoms.service';
import { LanguageService } from 'src/app/services/language.service';
import { SubjectsService } from 'src/app/services/subjects.service';
import * as moment from 'moment';
import { HpoService } from "src/app/services/hpo.service";

@Component({
  selector: "app-edit",
  templateUrl: "./edit.page.html",
  styleUrls: ["./edit.page.scss"]
})
export class EditPage implements OnInit, OnDestroy {
  id: string;
  name: any;
  initialName: any;
  notes: string;

  highRiskExplanation: string;
  mediumRiskExplanation: string;
  lowRiskExplanation: string;

  disease: any;
  diseaseSub: Subscription;

  geneticElements$: Observable<any>;
  geneticElements: any;
  geneticElementsSub: Subscription;

  imageTests$: Observable<any>;
  imageTests: any;
  imageTestsSub: Subscription;

  imageBiomarkers = [];
  imageTestsElements: any;
  imageTestsElementsSub: Subscription;
  imageTestsElements$: Observable<any>;

  isHereditary = false;
  hereditaryPonderation;


  queryLabel: string;
  queryCategory: string;

  categories = [];
  labels = [];

  suggestedCategories: any;
  suggestedLabels: any;

  relatedCategories: any;
  relatedLabels: any;

  /* Signos y s??ntomas */
  signsAndSymptoms = [];
  currentSignsAndSymptoms = [];
  querySignsAndSymptoms: string;
  querySignsAndSymptomsList = [];

  // IDS de la enfermedad en otros sistemas

  hpoId: string;
  omimId: string;
  orphaId: string;

  // Genes 
  currentGenes = [];
  genes = [];
  queryGenes = [];
  queryGenesList = [];
  genesIds = [];
  hpoData: any;

  constructor(
    private diseasesService: DiseasesService,
    private clinicAnalysisElementsService: ClinicAnalysisElementsService,
    private geneticElementsService: GeneticElementsService,
    private toastService: ToastService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private modalController: ModalController,
    private alertController: AlertController,
    private mutationsService: MutationsService,
    private imageTestsElementsService: ImageTestsElementsService,
    private categoriesService: CategoriesService,
    private labelsService: LabelsService,
    private symptomsService: SymptomsService,
    private subjectsService: SubjectsService,
    public lang: LanguageService,
    private hpoService: HpoService
  ) {
    this.id = this.activatedRoute.snapshot.paramMap.get("id");
  }

  ngOnInit() {
    this.diseaseSub = this.diseasesService
      .getDisease(this.id)
      .subscribe((disease) => {
        this.disease = disease;
        console.log(this.disease);

        this.name = disease.name;
        this.initialName = disease.name;
        this.notes = disease.notes;
        this.isHereditary = disease.isHereditary || false;
        this.hereditaryPonderation = disease.hereditaryPonderation || null;
        this.highRiskExplanation = disease.highRiskExplanation;
        this.mediumRiskExplanation = disease.mediumRiskExplanation;
        this.lowRiskExplanation = disease.lowRiskExplanation;

        this.relatedLabels = disease.relatedLabels || [];
        this.relatedCategories = disease.relatedCategories || [];
        this.currentSignsAndSymptoms = disease.signsAndSymptoms || [];
        this.currentGenes = disease.genes || [];
        this.genesIds = disease.genesIds || [];
        this.hpoData = disease.hpoData || null;
        this.hpoId = disease.hpoId || null;
        this.omimId = disease.omimId || null;
        this.orphaId = disease.orphaId || null;
        this.getBiomarkers();
      });
    this.getCategories();
    this.getLabels();
    this.getSignsAndSypmtoms();
  }

  ionViewDidEnter() {
    this.geneticElements$ = this.geneticElementsService.getGeneticElements();
    this.geneticElementsSub = this.geneticElements$.subscribe(
      (geneticElements) => {
        this.geneticElements = geneticElements;
      }
    );
  }

  async getBiomarkers() {
    const imageTestsElements = (await this.imageTestsElementsService.getImageTestElementsData()).docs.map(element => element.data());
    console.log(imageTestsElements);

    const resultBiomarkers = [];
    if (this.disease.imageBiomarkers) {
      for await (const diseaseBiomarker of this.disease.imageBiomarkers) {
        const result = imageTestsElements.filter(element => element.id === diseaseBiomarker.id);
        if (result.length > 0) {
          resultBiomarkers.push(result[0]);
          diseaseBiomarker.name = result[0].name;
          diseaseBiomarker.options = result[0].options;
        }
      }
    }
  }

  async getCategories() {
    const categories = await this.categoriesService.getAllData();
    categories.forEach(element => {
      this.categories.push(element.data());
    })
  }

  async getLabels() {
    const labels = await this.labelsService.getAllData();
    labels.forEach(element => {
      this.labels.push(element.data());
    })
  }

  async getSignsAndSypmtoms() {
    const symptoms = await this.symptomsService.getSymptomsData();
    symptoms.forEach(element => {
      this.signsAndSymptoms.push(element.data());
    })
  }

  addSignAndSymptom(signAndSypmtom: any) {
    this.symptomsService.updateSymptom(signAndSypmtom.id, {
      relatedDiseases: firebase.firestore.FieldValue.arrayUnion(this.id)
    })
    this.currentSignsAndSymptoms.push({ id: signAndSypmtom.id, name: signAndSypmtom.name });
    this.querySignsAndSymptomsList = [];
    this.querySignsAndSymptoms = null;
    this.diseasesService.updateDisease(this.id, {
      signsAndSymptoms: this.currentSignsAndSymptoms
    })
  }

  deleteSignAndSymptoms(index: any) {
    console.log(index, "indice del sintoma la borrar");

    this.symptomsService.updateSymptom(this.currentSignsAndSymptoms[index].id, {
      relatedDiseases: firebase.firestore.FieldValue.arrayRemove(this.id)
    })

    this.diseasesService.updateDisease(this.id, {
      signsAndSymptoms: this.currentSignsAndSymptoms
    })

    this.currentSignsAndSymptoms.splice(index, 1);

  }

  onChangeSignPonderation(index: any, value: any) {
    console.log(index, value);

    this.currentSignsAndSymptoms[index].ponderation = value;

    console.log(this.currentSignsAndSymptoms);
  }

  onQuerySignsAndSymptoms(query: string) {
    this.querySignsAndSymptomsList = this.signsAndSymptoms.filter(element => this.removeAccents(element.name.trim().toLowerCase()).includes(this.removeAccents(query.trim().toLowerCase())));
  }

  removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  async getBiomarkersValues() {
    const diseasesArray = [];
    const testElementsArray = []
    // Coger los biomarcadores de cada elemento de prueba e insertarlos dentro del array imageBiomarkers

    this.diseasesService.getDiseasesData().then(diseases => {
      this.imageTestsElementsService.getImageTestElementsData().then(async testElements => {
        // this.updateBiomarkers(diseases.docs, testElements.docs)

        // Recorrer los biomarkers de la enfermedad y coger los datos concreto de esa id

        for await (const disease of diseases.docs) {
          diseasesArray.push(disease.data())
        }

        for await (const element of testElements.docs) {
          testElementsArray.push(element.data())
        }


        for await (const disease of diseasesArray) {
          let index = 0;
          for await (const biomarker of disease.imageBiomarkers) {
            const result = testElementsArray.filter(element => element.id === biomarker.id);
            console.log(result);

            biomarker.options = result[0].options;
            if (disease.imageTests) {
              biomarker.values = disease.imageTests[index].value;
            } else {
              biomarker.values = [];
            }
            index = index + 1;
          }
        }

        setTimeout(async () => {
          console.log("updating");
          for await (const diseaseData of diseasesArray) {
            await this.diseasesService.updateDisease(diseaseData.id, {
              imageBiomarkers: diseaseData.imageBiomarkers
            }).then(() => console.log(diseaseData.id, diseaseData.name)).catch(error => console.error(error));
          }
          console.log("updated");
        }, 3000);
      })
    })
  }

  async updateBiomarkers(diseases, testElements) {
    const diseasesArray = [];
    const testElementsArray = []

    for await (const disease of diseases) {
      diseasesArray.push(disease.data())
    }

    for await (const element of testElements) {
      testElementsArray.push(element.data())
    }

    console.log(diseasesArray, testElementsArray);


    for await (const disease of diseasesArray) {

      const diseaseData = disease;
      console.log(diseaseData);

      if (diseaseData.imageTests && diseaseData.imageBiomarkers) {
        for await (const newImageTest of diseaseData.imageBiomarkers) {
          for await (const oldImageTest of diseaseData.imageTests) {
            if (testElementsArray.some(element => element.name === oldImageTest.test)) {
              console.log(oldImageTest.test);

              newImageTest.options = oldImageTest.options;
              newImageTest.values = oldImageTest.value;
            }
          }
        }
      }

      console.log(diseaseData.imageBiomarkers);

      if (diseaseData.imageBiomarkers) {
        await this.diseasesService.updateDisease(diseaseData.id, {
          imageBiomarkers: diseaseData.imageBiomarkers
        }).then(() => console.log(diseaseData.id, diseaseData.name)).catch(error => console.error(error));
      } else {
        await this.diseasesService.updateDisease(diseaseData.id, {
          imageBiomarkers: []
        }).then(() => console.log(diseaseData.id, diseaseData.name, "sin biomarcadores")).catch(error => console.error(error));
      }

    }
  }

  onCategoryChange(input: string) {
    if (input.length > 0) {
      this.suggestedCategories = this.categories.filter(cat =>
        this.removeAccents(cat.name.trim().toLowerCase()).includes(this.removeAccents(input.trim().toLowerCase()))
      );
    } else {
      this.suggestedCategories = null;
    }
  }

  onLabelChange(input: string) {
    if (input.length > 0) {
      this.suggestedLabels = this.labels.filter(lab =>
        this.removeAccents(lab.name.trim().toLowerCase()).includes(this.removeAccents(input.trim().toLowerCase()))
      );
    } else {
      this.suggestedLabels = null;
    }
  }


  async addCategory(category: any) {
    this.relatedCategories.push(category);
    this.queryCategory = null;

    this.diseasesService.updateDisease(this.id, {
      relatedCategories: this.relatedCategories
    }).then(() => {
      this.toastService.show("success", "Categor??a a??adida con ??xito")
    })

    // Referencias de categories
    this.categoriesService.update(category.id, {
      relatedDiseases: firebase.firestore.FieldValue.arrayUnion(this.id)
    })
  }

  async removeCategory(index: number, category: any) {
    this.relatedCategories.splice(index, 1);

    this.diseasesService.updateDisease(this.id, {
      relatedCategories: this.relatedCategories
    }).then(() => {
      this.toastService.show("success", "Categor??a eliminada con ??xito")
    })

    // Referencias de categories
    this.categoriesService.update(category.id, {
      relatedDiseases: firebase.firestore.FieldValue.arrayRemove(this.id)
    })
  }

  async addLabel(label: any) {
    this.relatedLabels.push(label);
    this.queryLabel = null;

    this.diseasesService.updateDisease(this.id, {
      relatedLabels: this.relatedLabels
    }).then(() => {
      this.toastService.show("success", "Etiqueta a??adida con ??xito")
    })

    // Referencias de labels
    this.labelsService.update(label.id, {
      relatedDiseases: firebase.firestore.FieldValue.arrayUnion(this.id)
    })
  }

  async removeLabel(index: number, label: any) {
    this.relatedLabels.splice(index, 1);

    this.diseasesService.updateDisease(this.id, {
      relatedLabels: this.relatedLabels
    }).then(() => {
      this.toastService.show("success", "Etiqueta eliminada con ??xito")
    })

    // Referencias de labels
    this.labelsService.update(label.id, {
      relatedDiseases: firebase.firestore.FieldValue.arrayRemove(this.id)
    })
  }

  async onQueryGenes(query: string) {
    this.queryGenesList = (await this.hpoService.search(query)).genes;
    console.log(this.queryGenesList);
  }

  addGene(gene: any) {
    this.currentGenes.push({ id: gene.entrezGeneId, name: gene.entrezGeneSymbol });
    this.genesIds.push(gene.entrezGeneId);
    this.queryGenesList = [];
    this.queryGenes = null;
  }

  deleteGene(index: any) {
    this.currentGenes.splice(index, 1);
    this.genesIds.splice(index, 1);
  }

  async syncIds() {
    let disease;

    if (this.hpoId) {
      disease = await this.hpoService.term(`HP:${this.hpoId}`);
    }
    if (this.omimId) {
      disease = await this.hpoService.disease(`OMIM:${this.omimId}`);
    }
    if (this.orphaId) {
      disease = await this.hpoService.disease(`ORPHA:${this.orphaId}`);
    }

    if (disease) {
      this.hpoData = disease;
      this.currentGenes = disease.geneAssoc.map(element => {
        return {
          id: element.entrezGeneId,
          name: element.entrezGeneSymbol
        }
      })

      console.log(disease);
    } else {
      this.toastService.show("danger", "No hay datos relacionados en HPO");
    }

  }

  /* MODIFICACIONES */

  async algoritmo() {
    // Se cogen los imageTests

    console.log(this.disease.imageTests, "imagetest originales");
    console.log(this.disease.imageBiomarkers, "imagebiomarkers");

    // Se mira si el campo test coincide con el nombre con alguno de los elementos de prueba de imagen

    const imageTestsElements = (await this.imageTestsElementsService.getImageTestElementsData()).docs.map(element => element.data());
    const imageTestsElementsNames = imageTestsElements.map(element => element = this.removeAccents(element.name.trim().toLowerCase()));
    console.log(imageTestsElements);

    for await (const test of this.disease.imageTests) {
      if (imageTestsElementsNames.includes(this.removeAccents(test.test.trim().toLowerCase()))) {
        console.log("se encuentra", test.test);

      } else {
        console.log("no se encuentra", test.test);
      }
    }

    // Si coincide se mete la info en formato imageBiomarkers
  }

  async migrateImageBiomarkers() {

    const diseasesResult = [];

    // Cogo la totalidad de los elementos de pruebas de imagen
    this.imageTestsElements$ = this.imageTestsElementsService.getImageTestElements();
    this.imageTestsElementsSub = this.imageTestsElements$.subscribe(imageTestsElements => {

      // Se mapea los elementos para que solo contengan el nombre
      const filteredBiomarkers = imageTestsElements.map(element => element.name);

      // Se coge la totalidad de las enfermedades
      this.diseasesService.getDiseasesData().then(async diseases => {

        // Se meten los resultados en un array
        const diseasesList = [];

        for await (const element of diseases.docs) {
          diseasesList.push(element.data());
        }

        // Se recorren las enfermedades

        for await (const disease of diseasesList) {

          // Si la enfermedad tienen imageTests (es decir, biomarcadores antiguos)
          if (disease.imageTests) {
            // Se mapean por el nombre del test (que debe de ser el mismo que el nombre del elemento de prueba)
            const filteredImageTests = disease.imageTests.map(element => element.test);

            console.log(disease.imageTests);
            console.log(filteredImageTests);

            // Se recorren los valores antiguos
            filteredImageTests.forEach(imageTest => {

              // Si entre las pruebas de imagen se encuentra
              if (filteredBiomarkers.includes(imageTest)) {
                const index = imageTestsElements.findIndex(element => element.name === imageTest);
                if (!disease.imageBiomarkers) {
                  disease.imageBiomarkers = [];
                }
                disease.imageBiomarkers.push({
                  id: imageTestsElements[index].id,
                  name: imageTestsElements[index].name,
                  order: 0
                })
              }
            });
            diseasesResult.push(disease);

            // update del disease

            if (disease.id && disease.imageBiomarkers) {
              // this.diseasesService.updateDisease(disease.id, { imageBiomarkers: disease.imageBiomarkers }); ESTE ES EL BUENO?
            }
          }

        }
        console.log("terminado", diseasesResult);

      })

      // this.diseasesService.updateDisease(this.id, { imageBiomarkers: this.imageBiomarkers });
    })
  }

  /* MODIFICACIONES */

  async addPhenotypicElement() {
    const modal = await this.modalController.create({
      component: AddPhenotypicElementPage,
      componentProps: {
        id: this.id
      }
    });
    return await modal.present();
  }

  deletePhenotypicConfig(index: string) {
    this.disease.phenotypicElements.splice(index, 1);
  }

  async addGeneticElement() {
    const modal = await this.modalController.create({
      component: AddGeneticElementPage,
      componentProps: {
        id: this.id
      }
    });
    return await modal.present();
  }

  async addAnalysisElement() {
    const modal = await this.modalController.create({
      component: AddAnalysisElementPage,
      componentProps: {
        id: this.id
      }
    });
    return await modal.present();
  }

  deleteRange(indexE: number, indexR: number) {
    this.disease.analysisElements[indexE].ranges.splice(indexR, 1);
    if (this.disease.analysisElements[indexE].ranges.length === 0) {
      this.disease.analysisElements[indexE].isCustom = false;
    }
  }

  async deleteAnalysisElement(diseaseId: string, elementId: string) {

    const selected = this.disease.analysisElements.find(element => element.id === elementId);

    this.clinicAnalysisElementsService.updateClinicAnalysisElement(selected.id, {
      relatedDiseases: firebase.firestore.FieldValue.arrayRemove(this.id)
    })

    const deleted = this.disease.analysisElements.filter(element => element.id !== elementId);

    this.diseasesService
      .updateDisease(diseaseId, {
        analysisElements: deleted
      })
      .then(() => {
        this.toastService.show(
          "success",
          "Prueba de laboratorio eliminada de la enfermedad"
        );
      })
      .catch((error) => {
        this.toastService.show(
          "danger",
          "Error al eliminar la prueba de laboratorio en la enfermedad" +
          error
        );
      });
  }

  async addImageTest() {
    const modal = await this.modalController.create({
      component: AddImageTestPage,
      componentProps: {
        id: this.id
      }
    });
    return await modal.present();
  }

  async deleteImageTest(diseaseId: string, index: number) {
    console.log(index);

    this.diseasesService.getDiseaseData(diseaseId).then((element) => {
      const removed = element.data().imageBiomarkers.splice(index, 1);;
      console.log(removed);

      this.diseasesService
        .updateDisease(diseaseId, {
          imageBiomarkers: firebase.firestore.FieldValue.arrayRemove(removed[0])
        })
        .then(async () => {
          await this.imageTestsElementsService.updateImageTestElement(removed[0].id, {
            relatedDiseases: firebase.firestore.FieldValue.arrayRemove(this.id)
          });
          this.toastService.show(
            "success",
            "Biomarcador de prueba de imagen eliminado de la enfermedad"
          );
        })
        .catch((error) => {
          this.toastService.show(
            "danger",
            "Error al eliminar el biomarcador de la prueba de imagen en la enfermedad" +
            error
          );
        });
    });
  }

  async addMutation() {
    const modal = await this.modalController.create({
      component: AddMutationPage,
      componentProps: {
        id: this.id
      }
    });
    return await modal.present();
  }

  async deleteMutation(diseaseId: string, mutationId: string) {
    this.mutationsService.getMutationData(mutationId).then((element) => {
      this.diseasesService
        .updateDisease(diseaseId, {
          mutations: firebase.firestore.FieldValue.arrayRemove({
            id: element.data().id,
            name: element.data().name
          })
        })
        .then(() => {
          this.toastService.show(
            "success",
            "Mutaci??n eliminada de la enfermedad"
          );
        })
        .catch((error) => {
          this.toastService.show(
            "danger",
            "Error al eliminar la mutaci??n en la enfermedad" + error
          );
        });
    });
  }

  async addEpigeneticElement() {
    const modal = await this.modalController.create({
      component: AddEpigeneticElementPage,
      componentProps: {
        id: this.id
      }
    });
    return await modal.present();
  }

  async deleteEpigeneticFeatures(
    diseaseId: string,
    epigeneticFeatureId: string
  ) { }

  async importGeneticElements() {
    const modal = await this.modalController.create({
      component: ImportPage,
      componentProps: {
        id: this.id
      }
    });
    return await modal.present();
  }

  onClinicConditionChange(index: any, condition: string) {
    this.disease.analysisElements[index].condition = condition;
    console.log(index, condition);
    console.log(this.disease.analysisElements[index]);
  }

  onSymptomConditionChange(index: any, ponderation: string) {
    console.log(ponderation);
    console.log(index);

    console.log(this.currentSignsAndSymptoms);

    this.currentSignsAndSymptoms[index].ponderation = ponderation;
    console.log(index, ponderation);
    console.log(this.currentSignsAndSymptoms[index]);
  }

  onImageConditionChange(indexBiomarker: any, indexValue: any, condition: string) {
    if (!this.disease.imageBiomarkers[indexBiomarker].conditions) {
      this.disease.imageBiomarkers[indexBiomarker].conditions = []
    }
    this.disease.imageBiomarkers[indexBiomarker].conditions[indexValue] = condition;
    console.log(this.disease.imageBiomarkers);
  }

  onImageBiomarkerValuesChange(index: any, values: any) {
    this.disease.imageBiomarkers[index].conditions = [];
  }

  save() {
    if (this.name.length !== 0) {
      const data = {
        name: this.name,
        notes: this.notes || null,
        phenotypicElements: this.disease.phenotypicElements || null,
        imageBiomarkers: this.disease.imageBiomarkers || null,
        analysisElements: this.disease.analysisElements || null,
        isHereditary: this.isHereditary,
        hereditaryPonderation: this.hereditaryPonderation,
        signsAndSymptoms: this.currentSignsAndSymptoms,
        updatedAt: moment().format(),
        genes: this.currentGenes,
        genesIds: this.genesIds,
        hpoId: this.hpoId || null,
        omimId: this.omimId || null,
        orphaId: this.orphaId || null,
        hpoData: this.hpoData || null
      }

      console.log(data);

      this.diseasesService
        .updateDisease(this.id, data)
        .then(async () => {
          // Actualizar el nombre de la enfermedad en las enfermedades del sujeto
          if (this.name !== this.initialName) {
            this.updateSubjectIfDiseaseNameChange();
          }
          this.toastService.show("success", "Enfermedad editada con ??xito");
        })
        .catch((error) => {
          this.toastService.show(
            "danger",
            "Error al editar la enfermedad: " + error
          );
        });
    } else {
      this.toastService.show("danger", "Error: Rellene todos los campos");
    }
  }

  updateSubjectIfDiseaseNameChange() {
    this.subjectsService.getSubjectsData().then(async data => {
      let subjects = data.docs.map(element => element = element.data())
        .filter(subject => subject.history && subject.history.diseases && subject.history.diseases.some(element => element.id === this.id));
      console.log(subjects);

      for await (const subject of subjects) {
        const index = subject.history.diseases.findIndex(element => element.id = this.id);
        console.log(index);

        subject.history.diseases[index].name = this.name;
        console.log(subject.history.diseases);

        this.subjectsService.updateSubject(subject.id, { history: subject.history })
      }
    })
  }

  updateSubjectIfDiseaseIsDeleted() {
    this.subjectsService.getSubjectsData().then(async data => {
      let subjects = data.docs.map(element => element = element.data())
        .filter(subject => subject.history && subject.history.diseases && subject.history.diseases.some(element => element.id === this.id));
      console.log(subjects);

      for await (const subject of subjects) {
        const index = subject.history.diseases.findIndex(element => element.id = this.id);
        console.log(index);

        subject.history.diseases.splice(index, 1);
        console.log(subject.history.diseases);

        this.subjectsService.updateSubject(subject.id, { history: subject.history })
      }
    })
  }

  updateFamiliarSubjectIfDiseaseNameChange() {
    this.subjectsService.getSubjectsData().then(async data => {
      let subjects = data.docs.map(element => element = element.data())
        .filter(subject => subject.history && subject.history.diseases && subject.history.diseases.some(element => element.id === this.id));
      console.log(subjects);

      for await (const subject of subjects) {
        const index = subject.history.diseases.findIndex(element => element.id = this.id);
        console.log(index);

        subject.history.diseases[index].name = this.name;
        console.log(subject.history.diseases);

        this.subjectsService.updateSubject(subject.id, { history: subject.history })
      }
    })
  }

  udpateFamiliarSubjectIfDiseaseIsDeleted() {
    this.subjectsService.getSubjectsData().then(async data => {
      let subjects = data.docs.map(element => element = element.data())
        .filter(subject => subject.history && subject.history.diseases && subject.history.diseases.some(element => element.id === this.id));
      console.log(subjects);

      for await (const subject of subjects) {
        const index = subject.history.diseases.findIndex(element => element.id = this.id);
        console.log(index);

        subject.history.diseases.splice(index, 1);
        console.log(subject.history.diseases);

        this.subjectsService.updateSubject(subject.id, { history: subject.history })
      }
    })
  }

  async delete() {
    const alert = await this.alertController.create({
      header: "??Est??s seguro?",
      message:
        "Pulse aceptar para eliminar la enfermedad. Se perder??n todos los elementos gen??ticos asociados.",
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
            this.diseaseSub.unsubscribe();
            this.router.navigate(["/database/diseases"]);
            this.updateSubjectIfDiseaseIsDeleted();
            this.diseasesService
              .deleteDisease(this.id)
              .then(() => {
                this.toastService.show(
                  "success",
                  "Enfermedad eliminada con ??xito"
                );
              })
              .catch(() => {
                this.toastService.show(
                  "danger",
                  "Error al eliminar la enfermedad"
                );
              });
          }
        }
      ]
    });

    await alert.present();
  }

  ngOnDestroy() {
    if (this.imageTestsSub) {
      this.imageTestsSub.unsubscribe();
    }
    if (this.geneticElementsSub) {
      this.geneticElementsSub.unsubscribe();
    }
    if (this.diseaseSub) {
      this.diseaseSub.unsubscribe();
    }
    if (this.imageTestsElementsSub) {
      this.imageTestsElementsSub.unsubscribe();
    }
  }
}
