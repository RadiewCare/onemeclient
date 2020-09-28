import { Component, OnInit, OnDestroy } from "@angular/core";
import { AlertController, LoadingController } from "@ionic/angular";
import { ActivatedRoute, Router } from "@angular/router";
import { ReportsService } from "src/app/services/reports.service";
import { ToastService } from "src/app/services/toast.service";
import { Observable, Subscription } from "rxjs";
import { AuthService } from "src/app/services/auth.service";
import { TemplatesService } from "src/app/services/templates.service";
import { TablesService } from "src/app/services/tables.service";
import { DiseasesService } from "src/app/services/diseases.service";
import { LanguageService } from "src/app/services/language.service";
import { GeneticElementsService } from "src/app/services/genetic-elements.service";
import * as firebase from "firebase/app";
import { HistoriesService } from "src/app/services/histories.service";
import { ImageStudiesService } from "src/app/services/image-studies.service";
import { GeneticDataService } from "src/app/services/genetic-data.service";
import { AnalyticStudiesService } from "src/app/services/analytic-studies.service";
import { SubjectsService } from "src/app/services/subjects.service";

@Component({
  selector: "app-edit",
  templateUrl: "./edit.page.html",
  styleUrls: ["./edit.page.scss"],
})
export class EditPage implements OnInit, OnDestroy {
  id: string;

  // Usuario
  currentUser: any;
  userSub: Subscription;

  // Informe
  report$: Observable<any>;
  report: any;
  reportSub: Subscription;

  // Sujeto
  subjectId: string;
  subject$: Observable<any>;
  subject: any;
  subjectSub: Subscription;

  // Tablas
  tables$: Observable<any>;
  tables: any;
  realTables = [];
  tablesSub: Subscription;
  tablesBuilding = []; // Array de resultados
  resultsTables = [];

  // Doctor
  doctorsIds: string[];
  mainDoctorId: string;

  // Plantilla
  templateId: any;
  templates$: Observable<any>;
  templates: any;
  templatesSub: Subscription;

  // Familiares
  history: any;
  firstGradeFamiliars$: Observable<any>;
  secondGradeFamiliars$: Observable<any>;

  // Análisis clínico
  clinicAnalysis$: Observable<any>;
  clinicStudiesSub: Subscription;
  clinicStudies: any;

  // Análisis genético
  geneticAnalysis$: Observable<any>;
  mutations = [];
  polyMorphismsWithNoGenes = [];

  // Pruebas de imagen
  imageTests$: Observable<any>;

  loading: any;

  constructor(
    private reportsService: ReportsService,
    private activatedRoute: ActivatedRoute,
    private alertController: AlertController,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
    private templatesService: TemplatesService,
    private historiesService: HistoriesService,
    private imageStudiesService: ImageStudiesService,
    private geneticDataService: GeneticDataService,
    private analyticStudiesService: AnalyticStudiesService,
    private tablesService: TablesService,
    private diseasesService: DiseasesService,
    private geneticElementsService: GeneticElementsService,
    private subjectsService: SubjectsService,
    public lang: LanguageService,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.params.id;
  }

  ionViewDidEnter() {
    this.getUser().then(() => {
      this.getTemplates().then(() => {
        this.getReport().then(async () => {
          await this.getSubject();
          this.getTables().then(() => {
            this.buildTables()
              .then(() => this.loading.dismiss())
              .catch((error) => {
                this.loading.dismiss();
                console.error(error);

                this.toastService.show(
                  "danger",
                  "Alguna enfermedad de la tabla no está bien configurada - " +
                    error
                );
              }); // Punto clave
          });
        });
      });
    });
  }

  async getUser(): Promise<any> {
    this.loading = await this.loadingController.create({
      message: this.lang.isSpanish()
        ? "Recogiendo datos del informe, por favor espere"
        : "Retrieving report data, please wait",
    });
    this.loading.present();
    return new Promise((resolve) => {
      this.userSub = this.authService.user$.subscribe((user) => {
        this.currentUser = user;
        resolve();
      });
    });
  }

  async getReport(): Promise<any> {
    this.report$ = this.reportsService.getReport(this.currentUser.id, this.id);
    return new Promise((resolve) => {
      this.reportSub = this.report$.subscribe((report) => {
        this.report = report;
        console.log(this.report);

        this.subjectId = this.report.subject.id;
        this.templateId = this.report.template;
        this.doctorsIds = this.report.doctors;
        this.mainDoctorId = this.report.mainDoctor;
        resolve();
      });
    });
  }

  async getSubject(): Promise<any> {
    return new Promise((resolve) => {
      // Datos del sujeto
      this.subject$ = this.subjectsService.getSubject(this.subjectId);
      this.subjectSub = this.subject$.subscribe((subject) => {
        this.subject = subject;
        console.log(this.subject);

        this.mutations = subject.mutations;
        this.history = subject.history;
        resolve();
      });
      // Familiares
      this.firstGradeFamiliars$ = this.historiesService.getFirstGradeFamiliars(
        this.subjectId
      );
      this.secondGradeFamiliars$ = this.historiesService.getSecondGradeFamiliars(
        this.subjectId
      );
      // Análisis clínicos
      this.clinicAnalysis$ = this.analyticStudiesService.getAnalyticStudies(
        this.subjectId
      );
      this.clinicStudiesSub = this.clinicAnalysis$.subscribe((data) => {
        this.clinicStudies = data;
      });
      // Análisis genéticos
      this.geneticAnalysis$ = this.geneticDataService.getGeneticData(
        this.subjectId
      );
      // Pruebas de imagen
      this.imageTests$ = this.imageStudiesService.getImageAnalysis(
        this.subjectId
      );
    });
  }

  async getTemplates(): Promise<any> {
    return new Promise((resolve) => {
      this.templates$ = this.templatesService.getTemplates(this.currentUser.id);
      this.templatesSub = this.templates$.subscribe((data) => {
        this.templates = data;
        console.log(this.templates);

        resolve();
      });
    });
  }

  async getTables(): Promise<any> {
    return new Promise((resolve) => {
      this.tables$ = this.tablesService.getTables(this.currentUser.id);
      this.tablesSub = this.tables$.subscribe((tables) => {
        this.tables = tables;
        console.log(this.tables);

        resolve();
      });
    });
  }

  async buildTables() {
    // Para cada tabla
    for await (const table of this.tables) {
      console.log(table.name);

      for await (const disease of table.diseases) {
        console.log(disease.name);

        // Se reinician los datos de la enfermedad que hay que guardar en el sujeto
        let oddRatio = 0;
        let productRatio = 1;
        let diseaseAverageOddRatio = 0;

        let numberOfElements = 0;

        let ratio;
        let explanation;

        const highRiskGenes = [];
        const lowRiskGenes = [];
        const mediumRiskGenes = [];

        // Se cogen los datos de la enfermedad
        const diseaseData = await this.diseasesService.getDiseaseData(
          disease.id
        );

        console.log("Datos de la enfermedad", diseaseData.data());
        console.log("Datos del sujeto", this.subject);

        // AQUÍ VA LA COMPARATIVA DE PRUEBAS ANALÍTICAS HECHAS CON LAS RELEVANTES PARA ESTA ENFERMEDAD
        const relevantClinicStudies = [];

        console.log("Analisis clinicos del sujeto", this.clinicStudies);

        if (
          this.subject.imageTests !== null &&
          this.subject.imageTests !== undefined &&
          this.subject.imageTests.length > 0
        ) {
          console.log("Pruebas de imagen del sujeto", this.subject.imageTests);
        }

        if (diseaseData.data().analysisElements) {
          diseaseData.data().analysisElements.forEach((diseaseAnalysis) => {
            this.clinicStudies.forEach((subjectAnalysis) => {
              subjectAnalysis.values.forEach((value) => {
                if (
                  diseaseAnalysis.name.toLowerCase() ===
                    value.name.toLowerCase() &&
                  !relevantClinicStudies.some(
                    (test) =>
                      test.name.toLowerCase() ===
                        diseaseAnalysis.name.toLowerCase() &&
                      test.value === value.value
                  )
                ) {
                  relevantClinicStudies.push(value);
                }
              });
            });
          });

          console.log(relevantClinicStudies);
        }

        // AQUÍ VA LA COMPARATIVA DE PRUEBAS DE IMÁGENES HECHAS CON LAS RELEVANTES PARA ESTA ENFERMEDAD
        const relevantImageTests = [];
        if (
          this.subject.imageTests !== null &&
          this.subject.imageTests !== undefined &&
          this.subject.imageTests.length > 0
        ) {
          this.subject.imageTests.forEach((subjectImageTest) => {
            if (diseaseData.data().imageTests) {
              console.log(diseaseData.data().imageTests);

              const subjectFilledValues = subjectImageTest.values.filter(
                (subjectValue) => subjectValue.status === "positive"
              );
              console.log(subjectFilledValues);

              diseaseData.data().imageTests.forEach((imTest) => {
                console.log(imTest);

                if (
                  subjectFilledValues.some(
                    (sfv) =>
                      sfv.name === imTest.test &&
                      imTest.value.includes(sfv.value)
                  )
                ) {
                  const relevantSubjectBiomarkers = subjectFilledValues.filter(
                    (sfv) =>
                      sfv.name === imTest.test &&
                      imTest.value.includes(sfv.value)
                  );
                  if (
                    !relevantImageTests.includes(relevantSubjectBiomarkers[0])
                  ) {
                    relevantImageTests.push(relevantSubjectBiomarkers[0]);
                  }
                }
              });
            }
          });
          console.log("Pruebas de imagen relevantes", relevantImageTests);
        }

        // CÁLCULO DEL ODD RATIO Y PRODUCT RATIO

        if (diseaseData.data().geneticElements) {
          // Se recorren los elementos genéticos de la enfermedad
          for await (const geneticElement of diseaseData.data()
            .geneticElements) {
            console.log(geneticElement.name);

            // Datos del elemento genético para obtener la variante
            const elementData = await this.geneticElementsService.getGeneticElementData(
              geneticElement.id
            );
            console.log(elementData.data());

            if (elementData.data().genes === null) {
              this.polyMorphismsWithNoGenes.push(
                elementData.data().geneticVariant.name
              );
            }

            // Busca una variante en el estudio genético del sujeeto que coincida con la estudiada en la tabla
            const variantQuery = await this.geneticDataService.getGeneticDataByVariantPromise(
              this.subjectId,
              elementData.data().geneticVariant.name
            );

            // Si se encuentra coincidencia se comparan los alelos del elemento genético con el del sujeto en esa variante
            if (variantQuery.docs.length > 0) {
              console.log(variantQuery.docs);

              const subjectVariant = variantQuery.docs[0].data();

              // Para cada riesgo:
              // 1. Se incrementa el número de variantes (para el calculo de la media de oddratios del sujeto en esa enfermedad)
              // 2. Se meten los genes en el array de genes de riesgo alto (para mostrar en el informe)
              // 3. Se suma el odd ratio de esa combinación de alelos al actual (para calcular la disposición)

              if (
                // Riesgo alto
                subjectVariant.alleles.father ===
                  elementData.data().highRiskAlleles.father &&
                subjectVariant.alleles.mother ===
                  elementData.data().highRiskAlleles.mother
              ) {
                if (elementData.data().genes) {
                  numberOfElements++;
                  elementData.data().genes.forEach((gen) => {
                    highRiskGenes.push(gen);
                  });
                  oddRatio = oddRatio + elementData.data().highRiskOddRatio;
                  productRatio =
                    productRatio * elementData.data().highRiskOddRatio;
                }
              } else if (
                // Riesgo medio
                subjectVariant.alleles.father ===
                  elementData.data().mediumRiskAlleles.father &&
                subjectVariant.alleles.mother ===
                  elementData.data().mediumRiskAlleles.mother
              ) {
                if (elementData.data().genes) {
                  numberOfElements++;
                  elementData.data().genes.forEach((gen) => {
                    mediumRiskGenes.push(gen);
                  });
                  oddRatio = oddRatio + elementData.data().mediumRiskOddRatio;
                  productRatio =
                    productRatio * elementData.data().mediumRiskOddRatio;
                }
              } else if (
                // Riesgo favorable
                subjectVariant.alleles.father ===
                  elementData.data().lowRiskAlleles.father &&
                subjectVariant.alleles.mother ===
                  elementData.data().lowRiskAlleles.mother
              ) {
                if (elementData.data().genes) {
                  numberOfElements++;
                  elementData.data().genes.forEach((gen) => {
                    lowRiskGenes.push(gen);
                  });
                  oddRatio = oddRatio + elementData.data().lowRiskOddRatio;
                  productRatio =
                    productRatio * elementData.data().lowRiskOddRatio;
                }
              }
            } else {
              console.log("No hay elementos genéticos");
            }
          } // Fin de bucle de elementos genéticos
        }

        console.log(this.polyMorphismsWithNoGenes);

        // Calculamos el oddratio del sujeto para la enfermedad (ya tenemos hecho el producto en cada paso)
        console.log(`or antes ${oddRatio}`);

        if (oddRatio !== 0) {
          oddRatio = oddRatio / numberOfElements;
        }
        console.log(`or: ${oddRatio} - dis: ${diseaseData.data().name}`);

        if (oddRatio > diseaseData.data().averageOddRatio) {
          explanation = diseaseData.data().highRiskExplanation;
          ratio = "high";
          await this.subjectsService
            .updateSubject(this.subjectId, {
              geneticDiseasesRatios: firebase.firestore.FieldValue.arrayUnion({
                id: diseaseData.data().id,
                name: diseaseData.data().name,
                disposition: "high",
                oddRatio: oddRatio,
                productRatio: productRatio,
              }),
            })
            .then(() => {
              // Recopilamos datos  de la enfermedad
              this.tablesBuilding.push({
                element: diseaseData.data().name || null,
                disposition: explanation,
                clinicStudies: this.clinicStudies,
                geneticElements: diseaseData.data().geneticElements || null,
                mutations: diseaseData.data().mutations || null,
                analysisElements: diseaseData.data().analysisElements || null,
                phenotypicElements:
                  diseaseData.data().phenotypicElements || null,
                explanation: diseaseData.data().explanation || null,
                imageTests: this.subject.imageTests || null,
                lowRiskGenes: lowRiskGenes,
                mediumRiskGenes: mediumRiskGenes,
                highRiskGenes: highRiskGenes,
                dispositionColor: ratio,
                relevantImageTests: relevantImageTests,
                relevantClinicStudies: relevantClinicStudies,
              });
            })
            .catch((error) => console.error(error));
        } else if (oddRatio < diseaseData.data().averageOddRatio) {
          explanation = diseaseData.data().lowRiskExplanation;
          ratio = "low";
          await this.subjectsService
            .updateSubject(this.subjectId, {
              geneticDiseasesRatios: firebase.firestore.FieldValue.arrayUnion({
                id: diseaseData.data().id,
                name: diseaseData.data().name,
                disposition: "low",
                oddRatio: oddRatio,
                productRatio: productRatio,
              }),
            })
            .then(() => {
              // Recopilamos datos  de la enfermedad
              this.tablesBuilding.push({
                element: diseaseData.data().name || null,
                disposition: explanation,
                clinicStudies: this.clinicStudies,
                geneticElements: diseaseData.data().geneticElements || null,
                mutations: diseaseData.data().mutations || null,
                analysisElements: diseaseData.data().analysisElements || null,
                phenotypicElements:
                  diseaseData.data().phenotypicElements || null,
                explanation: diseaseData.data().explanation || null,
                imageTests: this.subject.imageTests || null,
                lowRiskGenes: lowRiskGenes,
                mediumRiskGenes: mediumRiskGenes,
                highRiskGenes: highRiskGenes,
                dispositionColor: ratio,
                relevantImageTests: relevantImageTests,
                relevantClinicStudies: relevantClinicStudies,
              });
            })
            .catch((error) => console.error(error));
        } else {
          explanation = diseaseData.data().mediumRiskExplanation;
          ratio = "medium";
          await this.subjectsService
            .updateSubject(this.subjectId, {
              geneticDiseasesRatios: firebase.firestore.FieldValue.arrayUnion({
                id: diseaseData.data().id,
                name: diseaseData.data().name,
                disposition: "medium",
                oddRatio: oddRatio,
                productRatio: productRatio,
              }),
            })
            .then(() => {
              // Recopilamos datos  de la enfermedad
              this.tablesBuilding.push({
                element: diseaseData.data().name || null,
                disposition: explanation,
                clinicStudies: this.clinicStudies,
                geneticElements: diseaseData.data().geneticElements || null,
                mutations: diseaseData.data().mutations || null,
                analysisElements: diseaseData.data().analysisElements || null,
                phenotypicElements:
                  diseaseData.data().phenotypicElements || null,
                explanation: diseaseData.data().explanation || null,
                imageTests: this.subject.imageTests || null,
                lowRiskGenes: lowRiskGenes,
                mediumRiskGenes: mediumRiskGenes,
                highRiskGenes: highRiskGenes,
                dispositionColor: ratio,
                relevantImageTests: relevantImageTests,
                relevantClinicStudies: relevantClinicStudies,
              });
            })
            .catch((error) => console.error(error));
        }
        // Teniendo ya el odd ratio del sujeto para la enfermedad hay que recalcular el odd ratio
        // de la enfermedad en sí antes de compararla y sacar una disposición
        diseaseAverageOddRatio = await this.recalculateOddRatio(
          diseaseData.data(),
          oddRatio,
          productRatio
        );
      } // Fin de for de enfermedades
      this.realTables.push({
        name: table.name,
        shortcode: table.shortcode,
        rows: this.tablesBuilding,
      });

      this.tablesBuilding = [];
    } // Fin de for de tablas

    console.log("Tablas creadas:");
    console.log(this.realTables);

    // Aviso en caso de polimorfismos sin genes asociados al final del bucle para no molestar
    if (this.polyMorphismsWithNoGenes.length > 0) {
      this.lang.isSpanish()
        ? this.toastService.show(
            "danger",
            "Hay variantes en elementos genéticos que no tienen genes y se han ignorado, haga scroll al final para ver cuáles son"
          )
        : this.toastService.show(
            "danger",
            "There are genetic elements with variants with no genes, please scroll this page and check it out"
          );
    }
  }

  async recalculateOddRatio(
    disease: any,
    subjectOddRatio: number,
    subjectProductRatio: number
  ): Promise<number> {
    console.log(disease);

    // Array del total de sujetos y del total de sujetos con una enfermedad concreta
    const subjects = [];
    const querySubjects = [];

    let resultRatio = 0;
    let productRatio = 1;

    let totalNumberofSubjects = 0;
    let totalNumberofSubjectsWithDisease = 0;

    const query = await this.subjectsService.getSubjectsData();

    for await (const doc of query.docs) {
      subjects.push(doc.data());
    }

    totalNumberofSubjects = await subjects.length;
    console.log(subjects);
    console.log(totalNumberofSubjects);

    if (
      disease.averageOddRatio !== null &&
      disease.averageOddRatio !== undefined &&
      disease.averageOddRatio > 0
    ) {
      // Recoger el número de sujetos con esa enfermedad en geneticDiseaseRatios
      for await (const subject of subjects) {
        if (
          subject.geneticDiseasesRatios !== null &&
          subject.geneticDiseasesRatios !== undefined &&
          subject.geneticDiseasesRatios.length > 0
        ) {
          let index = 0;
          for await (const diseaseRatio of subject.geneticDiseasesRatios) {
            console.log(diseaseRatio.id);
            console.log(disease.id);

            if (diseaseRatio.id === disease.id) {
              querySubjects.push({
                oddRatio: subject.geneticDiseasesRatios[index].oddRatio,
                productRatio: subject.geneticDiseasesRatios[index].productRatio,
              });
              totalNumberofSubjectsWithDisease++;
            }
            index++;
          }
        }
      }
      console.log(querySubjects);
      console.log(totalNumberofSubjectsWithDisease);

      // Recalcular el odd ratio de la enfermedad teniendo en cuenta el sujeto nuevo y los anteriores

      for await (const ratio of querySubjects) {
        resultRatio = resultRatio + ratio.oddRatio;
        productRatio = productRatio * ratio.productRatio;
      }

      resultRatio = resultRatio / querySubjects.length;

      this.diseasesService.updateDisease(disease.id, {
        averageOddRatio: resultRatio,
        averageProductRatio: productRatio,
      });

      return resultRatio;
    } else {
      // En este caso no hay oddRatio por lo que es el primero
      // Retornamos el odd ratio original (el único que hay ahora mismo)
      this.diseasesService.updateDisease(disease.id, {
        averageOddRatio: subjectOddRatio,
        averageProductRatio: subjectProductRatio,
      });

      return subjectOddRatio;
    }
  }

  getColor(state: string) {
    switch (state) {
      case "low":
        return "success";
      case "medium":
        return "warning";
      case "high":
        return "danger";
      default:
        break;
    }
  }

  isPhenotypicFound(element: any) {
    if (true) {
      return "primary";
    } else {
      return "danger";
    }
  }

  async delete(): Promise<any> {
    const alert = await this.alertController.create({
      header: "Eliminar informe",
      message: "¿Estás seguro?",
      buttons: [
        {
          text: "Cancelar",
          role: "cancel",
          cssClass: "secondary",
          handler: () => {},
        },
        {
          text: "Aceptar",
          handler: () => {
            this.router.navigate(["/reports"]);
            this.reportSub.unsubscribe();
            this.reportsService
              .deleteReport(this.currentUser.id, this.report.id)
              .then(() => {
                this.toastService.show(
                  "success",
                  "Informe eliminado con éxito"
                );
              })
              .catch(() => {
                this.toastService.show(
                  "danger",
                  "Ha ocurrido un error al eliminar el informe"
                );
              });
          },
        },
      ],
    });

    await alert.present();
  }

  async export(): Promise<any> {
    if (this.templateId) {
      return await this.reportsService.export(
        this.currentUser.id,
        this.id,
        this.templateId,
        this.realTables
      );
    } else {
      return await this.toastService.show("danger", "Seleccione plantilla");
    }
  }

  save() {
    this.reportsService
      .updateReport(this.currentUser.id, this.id, {
        template: this.templateId,
      })
      .then(() => {
        this.toastService.show(
          "success",
          "Nombre del informe actualizado con éxito"
        );
      })
      .catch(() => {
        this.toastService.show(
          "danger",
          "Error al actualizar el nombre del informe"
        );
      });
  }

  ngOnDestroy() {
    if (this.tablesSub) {
      this.tablesSub.unsubscribe();
    }
    if (this.subjectSub) {
      this.subjectSub.unsubscribe();
    }
    if (this.reportSub) {
      this.reportSub.unsubscribe();
    }
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
    if (this.clinicStudiesSub) {
      this.clinicStudiesSub.unsubscribe();
    }
  }
}
