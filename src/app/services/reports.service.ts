import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { ToastService } from "./toast.service";
import * as moment from 'moment';
import { ImageTestsElementsService } from "./image-tests-elements.service";
import { DiseasesService } from "./diseases.service";


@Injectable({
  providedIn: "root",
})
export class ReportsService {
  doc: any;
  pageHeight: any;
  pageWidth: any;
  x = 40;
  y = 40;
  center: any;
  right: any;
  tables: any;
  tableBody = [];

  diseases = [];

  constructor(
    private db: AngularFirestore,
    private toastService: ToastService,
    private imageTestsElementsService: ImageTestsElementsService,
    private diseasesService: DiseasesService
  ) { }

  /**
   * Devuelve todos los informes de un usuario
   */
  getReports(userId: string): Observable<any> {
    return this.db
      .collection(`doctors/${userId}/reports`)
      .valueChanges({ idField: "id" });
  }

  /**
   * Recoge los datos de un informe
   * @param userId Identificador de usuario
   * @param reportId Identificador de informe
   */
  getReport(userId: string, reportId: string): Observable<any> {
    return this.db.doc(`doctors/${userId}/reports/${reportId}`).valueChanges();
  }

  /**
   * Recoge los datos de un informe
   * @param userId Identificador de usuario
   * @param reportId Identificador de informe
   */
  async getReportData(userId: string, reportId: string): Promise<any> {
    return this.db.firestore.doc(`doctors/${userId}/reports/${reportId}`).get();
  }

  /**
   * Crea un informe
   * @param userId: Datos del usuario
   * @param body Datos del informe
   */
  async createReport(userId: string, body: any): Promise<any> {
    this.db
      .collection(`doctors/${userId}/reports`)
      .add(body)
      .then((doc) => {
        this.db.doc(`doctors/${userId}/reports/${doc.id}`).update({
          id: doc.id,
        });
      });
  }

  /**
   * Actualiza un informe
   * @param userId Identificador del usuario
   * @param reportId Identificador del informe
   * @param body Datos del informe
   */
  async updateReport(
    userId: string,
    reportId: string,
    body: any
  ): Promise<any> {
    return await this.db
      .doc(`doctors/${userId}/reports/${reportId}`)
      .update(body);
  }

  /**
   * Elimina un informe
   * @param userId Identificador del usuario
   * @param reportId Identificador del informe
   */
  async deleteReport(userId: string, reportId: string): Promise<any> {
    return await this.db.doc(`doctors/${userId}/reports/${reportId}`).delete();
  }

  /**
   * Importa y guarda en la base de datos los datos gen??ticos del informe
   * @param id Identificador del informe
   * @param body Datos del informe a importar
   */
  async importGeneticData(id: string, data: any): Promise<any> {
    const transformedData = [];

    data.forEach((varianteGenetica) => {
      // Separamos el nombre de la variante
      const split = varianteGenetica.Name.split("(");
      const arrayGenes = [];
      if (varianteGenetica.Gene) {
        const splitGenes = varianteGenetica.Gene.split(", ");
        splitGenes.forEach((element) => {
          arrayGenes.push(element);
        });
      }

      // Descomponemos los alelos
      if (split.length > 1) {
        const alelo = split[1].substring(0, split[1].length - 1);
        const alelos = alelo.split(";");
        // Agregamos a la transformaci??n de datos
        transformedData.push({
          geneticVariant: split[0],
          alleles: {
            father: alelos[0],
            mother: alelos[1],
          },
          frequency: varianteGenetica.Freq === null ? 0 : varianteGenetica.Freq,
          magnitude: varianteGenetica.Magnitude,
          chromosome: varianteGenetica.Chrom,
          position: varianteGenetica.Pos,
          genes: arrayGenes,
        });
      } else {
        transformedData.push({
          geneticVariant: split[0],
          alleles: null,
          frequency: varianteGenetica.Freq === null ? 0 : varianteGenetica.Freq,
          magnitude: varianteGenetica.Magnitude,
          chromosome: varianteGenetica.Chrom,
          position: varianteGenetica.Pos,
          genes: arrayGenes,
        });
      }
    });
  }

  /**
   * Exporta a PDF los datos de la plantilla personalizados a los datos del sujeto
   * @param userId Identificador del doctor
   * @param reportId Identificador del informe
   * @param template Plantilla a usar
   */
  async export(
    userId: string,
    reportId: string,
    template: string,
    tableData: any
  ): Promise<any> {
    console.log(tableData);

    this.x = 40;
    this.y = 40;
    this.doc = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: "a4",
    });

    this.pageHeight =
      this.doc.internal.pageSize.height ||
      this.doc.internal.pageSize.getHeight();

    this.pageWidth =
      this.doc.internal.pageSize.width || this.doc.internal.pageSize.getWidth();

    this.center = this.pageHeight / 2;
    this.right = this.pageWidth - this.x;

    let blocks: any;
    this.tables = tableData;

    let identifier;

    await this.getReportData(userId, reportId).then((data) => {
      identifier = data.data().subject.identifier;
    });

    await this.db.firestore
      .collection(`doctors/${userId}/templates`)
      .doc(template)
      .get()
      .then(async (document) => {
        blocks = document.data().data.blocks;
        await this.renderBlocks(blocks, userId, reportId);
        await this.saveReport(identifier);
      });
  }

  async renderBlocks(blocks: any, userId: string, reportId: string) {
    for await (const block of blocks) {
      switch (block.type) {
        case "header":
          await this.renderHeader(block);
          break;

        case "paragraph":
          this.doc.setFontSize(10);
          const pattern = /\[(.*?)\]$/g;
          const patternAnalytics = /\[(ANA.*?)\]$/g;
          const patternImage = /\[(IMA.*?)\]$/g;

          if (patternAnalytics.test(block.data.text)) {
            // Anal??tica
            await this.renderAnalytics(block, userId, reportId);
          } else if (patternImage.test(block.data.text)) {
            // Pruebas de imagen
            await this.renderImageTests(block, userId, reportId);
          } else if (pattern.test(block.data.text)) {
            // Tabla
            await this.renderTable(block, userId, reportId);
          } else {
            // P??rrafo
            await this.renderText(block);
          }
          break;

        case "warning":
          await this.renderWarning(block);
          break;

        case "list":
          await this.renderList(block);
          break;

        case "image":
          await this.renderImage(block);

          break;

        case "delimiter":
          await this.renderDelimiter();
          break;

        default:
          break;
      }
    }
  }

  cleanString(block: string) {
    return block.replace(
      // tslint:disable-next-line: max-line-length
      /<((?=!\-\-)!\-\-[\s\S]*\-\-|((?=\?)\?[\s\S]*\?|((?=\/)\/[^.\-\d][^\/\]'"[!#$%&()*+,;<=>?@^`{|}~ ]*|[^.\-\d][^\/\]'"[!#$%&()*+,;<=>?@^`{|}~ ]*(?:\s[^.\-\d][^\/\]'"[!#$%&()*+,;<=>?@^`{|}~ ]*(?:=(?:"[^"]*"|'[^']*'|[^'"<\s]*))?)*)\s?\/?))>/gi,
      ""
    );
  }

  async renderHeader(block: any) {
    switch (block.data.level) {
      case 1:
        this.doc.setFontSize(20);
        break;
      case 2:
        this.doc.setFontSize(18);
        break;
      case 3:
        this.doc.setFontSize(16);
        break;
      case 4:
        this.doc.setFontSize(14);
        break;
      case 4:
        this.doc.setFontSize(12);
        break;
      case 6:
        this.doc.setFontSize(10);
        break;
      default:
        break;
    }
    // Limpiado de formato
    block.data.text = this.cleanString(block.data.text);
    // Pintado
    this.doc.text(block.data.text, this.x, this.y);
    this.y = this.y + 20;
  }

  async renderText(block: any) {
    block.data.text = this.cleanString(block.data.text);
    const splitText = this.doc.splitTextToSize(
      block.data.text,
      this.pageWidth - 2 * this.x
    );
    for await (const line of splitText) {
      this.doc.text(line, this.x, this.y);
      this.y = this.y + 10;
    }
    this.y = this.y + 10;
  }

  async renderSimpleText(text: string) {
    const splitText = this.doc.splitTextToSize(
      text,
      this.pageWidth - 2 * this.x
    );
    for await (const line of splitText) {
      this.doc.text(line, this.x, this.y);
      this.y = this.y + 10;
    }
  }

  async renderAnalytics(block: any, userId: string, reportId: string) {
    await this.db.firestore
      .doc(`doctors/${userId}/reports/${reportId}`)
      .get()
      .then(async (report) => {
        const subjectId = report.data().subject.id;
        await this.db.firestore
          .collection(`subjects/${subjectId}/clinicAnalysis`)
          .where("shortcode", "==", block.data.text)
          .get()
          .then(async (clinicAna) => {
            if (clinicAna.docs.length > 0) {
              console.log(clinicAna);

              console.log(clinicAna.docs);

              const analysis = clinicAna.docs[0].data();
              const body = [];
              const corporativo = [181, 64, 124];
              const verde = [198, 240, 214];
              const rojo = [255, 128, 128];
              const amarillo = [240, 246, 150];
              for await (const element of analysis.values) {
                let status = "";
                if (element.status !== "normal") {
                  status = "*";
                }
                if (element.value) {
                  body.push([
                    element.name,
                    element.value + " " + element.metricUnit + status,
                  ]);
                }
              }

              this.doc.autoTable({
                startY: this.y,
                columnStyles: {
                  0: {
                    cellWidth: 250,
                    fontSize: 9,
                  },
                  1: {
                    cellWidth: 100,
                    fontSize: 9,
                  },
                },
                didParseCell: (data) => {
                  console.log(data);

                  // Colores del encabezado
                  data.cell.styles.textColor = 0;
                  if (
                    data.cell.raw === "Elemento" ||
                    data.cell.raw === "Valor"
                  ) {
                    data.cell.styles.fillColor = corporativo;
                    data.cell.styles.textColor = 255;
                  }
                  // Colores de las disposiciones
                  if (data.column.index === 1) {
                    console.log(data.cell.text[0].includes("*"));
                    if (data.cell.text[0].includes("*")) {
                      data.cell.styles.fillColor = rojo;
                    }
                  }
                },
                head: [["Elemento", "Valor"]],
                body: body,
                // ...
              });
              body.forEach((row) => {
                this.y = this.y + 20;
              });
              this.y = this.y + 100;
              this.y = this.y + 10;
            } else {
              this.toastService.show(
                "danger",
                "Shortcode de an??lisis no encontrado"
              );
            }
          });
      });
  }

  async renderImageTests(block: any, userId: string, reportId: string) {
    await this.db.firestore
      .doc(`doctors/${userId}/reports/${reportId}`)
      .get()
      .then(async (report) => {
        console.log(report.data());

        const subject = report.data().subject.id;

        await this.db.firestore
          .doc(`subjects/${subject}`)
          .get()
          .then(async (subj) => {
            const subjectData = subj.data();
            console.log(subjectData);

            const testWithImages = subjectData.imageTests.filter(
              (element) =>
                element.shortcode === block.data.text &&
                element.images &&
                element.images.length > 0
            );
            if (testWithImages.length > 0) {
              console.log("hay im??genes");
              console.log(testWithImages);
              console.log(testWithImages[0]);

              for await (const img of testWithImages[0].images) {
                this.renderImage({ data: { url: img.url } });
              }
            }
          });
      });
  }

  toDataURL(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
      var reader = new FileReader();
      reader.onloadend = function () {
        callback(reader.result);
      }
      reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
  }

  async exportImageTest(imageTest: any, subjectData: any, mainDoctor: string, clinic: string, asociadas: boolean) {
    await this.getDiseases();
    console.log(imageTest);

    this.x = 40;
    this.y = 40;
    this.doc = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: "a4",
    });

    this.pageHeight =
      this.doc.internal.pageSize.height ||
      this.doc.internal.pageSize.getHeight();

    this.pageWidth =
      this.doc.internal.pageSize.width || this.doc.internal.pageSize.getWidth();

    // Logo
    var img = new Image();
    if (imageTest.relatedCategories.map(element => element = element.name).includes("Fertilidad")) {
      img.src = 'assets/images/logo-overture.jpg';
      this.doc.addImage(img, 'JPEG', this.x, this.y, 75, 40);
      this.y = this.y + 60;
    } else {
      img.src = 'assets/images/logo-microsound.jpg';
      this.doc.addImage(img, 'JPEG', this.x - 30, this.y, 125, 50);
      this.y = this.y + 70;
    }

    this.doc.setFontSize(10);
    // ID del paciente
    this.doc.text("Paciente: " + subjectData.identifier, this.x, this.y);
    this.y = this.y + 10;
    // Accession number
    if (imageTest.accessionNumber !== null) {
      this.doc.text("Accession number: " + imageTest.accessionNumber, this.x, this.y);
      this.y = this.y + 10;
    }
    // Nombre de la prueba
    this.doc.text("Nombre de la prueba: " + imageTest.name, this.x, this.y);
    this.y = this.y + 10;
    // Fecha de la prueba
    this.doc.text("Fecha de la prueba: " + moment(imageTest.date).format("DD/MM/YYYY"), this.x, this.y);
    this.y = this.y + 10;
    // Cl??nica y Doctor
    this.doc.text("Cl??nica: " + clinic, this.x, this.y);
    this.y = this.y + 10;
    this.doc.text("Doctor: " + mainDoctor, this.x, this.y);
    this.y = this.y + 20;

    // RENDERIZADO DE VALORES
    for await (const value of imageTest.values) {
      const splitTitle = this.doc.splitTextToSize(
        value.name,
        this.pageWidth - 2 * this.x
      );
      for await (const text of splitTitle) {
        if (text.length > 0) {
          if (this.y > this.pageHeight - 40) {
            this.renderDelimiter();
          }

          this.doc.setFont("helvetica", "normal");
          this.doc.setTextColor(0, 0, 0);
          // Nombre
          await this.doc.text(text + ":", this.x, this.y);
          this.y = this.y + 10;
        }
      }

      this.doc.setFont("helvetica", "normal")
      // Valor
      if (value.value) {
        if (value.status === "positive") {
          this.doc.setTextColor(255, 0, 0);
          await this.renderSimpleText("* " + value.value)
        } else {
          if (value.status === "negative") {
            this.doc.setTextColor(0, 0, 255);
          }
          if (value.status === "default") {
            this.doc.setTextColor(0, 0, 0);
          }
          await this.renderSimpleText(value.value);
        }
      }


      // Estado
      if (value.status) {
        // await this.doc.text(value.status === 'positive' ? "Estado: POSITIVO" : "Estado: NEGATIVO", this.x, this.y);
      } else {
        this.doc.setTextColor(0, 0, 0);
        await this.doc.text("Sin determinar", this.x, this.y);
        this.y = this.y + 10;
      }

      this.y = this.y + 10;
    }

    this.doc.setTextColor(0, 0, 0);

    // RENDERIZADO DE ENFERMEDADES RELACIONADAS
    const imageBiomarkers = [];
    for await (const element of imageTest.values) {
      if (element.status === "positive") {
        imageBiomarkers.push(element);
      }
    }

    let frecuencies = {};
    let imageTestsElements = (await this.imageTestsElementsService.getImageTestElementsData()).docs.map(element => element = element.data());
    let imageDiseases = [];
    let imageDiseasesWithoutFrecuencies = [];

    console.log(imageTestsElements, "previo for");

    for await (const biomarker of imageBiomarkers) {
      console.log(biomarker, "yei");

      const biomarkerData = imageTestsElements.find(element => element.id === biomarker.id);

      if (biomarkerData && biomarkerData.relatedDiseases) {
        imageDiseases = imageDiseases.concat(biomarkerData.relatedDiseases);
        imageDiseasesWithoutFrecuencies = [...new Set([...imageDiseases, ...biomarkerData.relatedDiseases])]
      }
    }
    console.log(imageDiseases, "bruto de de enfermedades relacionadas con los biomarcadores positivos de imagen");

    for await (const imageDisease of imageDiseases) {
      var num = imageDisease;
      frecuencies[num] = frecuencies[num] ? frecuencies[num] + 1 : 1;
    }

    console.log(imageDiseasesWithoutFrecuencies, "total de enfermedades relacionadas con los biomarcadores positivos de imagen");
    console.log(frecuencies, "frecuencias de enfermedades relacionadas con los biomarcadores positivos de imagen");

    let result = [];

    for await (const dis of imageDiseasesWithoutFrecuencies) {
      console.log(dis);

      console.log(this.diseases.find(disease => disease.id === dis));
      if (this.diseases.find(disease => disease.id === dis)) {
        const toBePushed = this.diseases.find(disease => disease.id === dis);
        toBePushed.frequency = frecuencies[dis];
        result.push(
          {
            id: toBePushed.id,
            name: toBePushed.name,
            frequency: toBePushed.frequency
          }
        );
      }
    }

    result = result.sort((a, b) => {
      if (a.frequency < b.frequency) {
        return 1;
      }
      if (a.frequency > b.frequency) {
        return -1;
      }
      return 0;
    });

    if (asociadas) {
      this.doc.addPage();
      this.x = 40;
      this.y = 40;

      await this.doc.text("ENFERMEDADES ASOCIADAS", this.x, this.y);
      this.y = this.y + 20;

      for await (const disease of result) {
        if (disease.name.length > 0) {
          if (this.y > this.pageHeight - 40) {
            this.renderDelimiter();
          }

          this.doc.setFont("helvetica", "normal");
          this.doc.setTextColor(0, 0, 0);
          // Nombre
          await this.doc.text(disease.name, this.x, this.y);
          this.y = this.y + 10;
        }
      }
    }

    this.saveReport(imageTest.name);
  }

  async getDiseases() {
    const diseases = await this.diseasesService.getDiseasesData();
    diseases.forEach(element => {
      this.diseases.push(element.data());
    })
    console.log(this.diseases, "Totalidad de las enfermedades");
  }

  async renderTable(block: any, userId: string, reportId: string) {
    const corporativo = [181, 64, 124];
    const verde = [198, 240, 214];
    const rojo = [255, 128, 128];
    const amarillo = [240, 246, 150];

    const arrayTable = this.tables.filter(
      (table) => table.shortcode === block.data.text
    );

    const body = [];

    // Este c??lculo deber??a de hacerse en alg??n momento en la pantalla de sujeto ??d??nde?
    for await (const table of arrayTable) {
      for await (const row of table.rows) {
        console.log(row);

        this.doc.setFontSize(14);
        this.doc.text("Estudio realizado para: " + row.element, this.x, this.y);
        this.y = this.y + 10;
        this.doc.setFontSize(10);
        this.doc.text(
          "Disposici??n gen??tica: " + row.disposition,
          this.x,
          this.y
        );
        this.y = this.y + 10;

        let favorables;
        let desfavorables;
        let riesgoMedio;

        if (row.lowRiskGenes.length > 0) {
          favorables = row.lowRiskGenes;
        } else {
          favorables = "Ninguno";
        }

        if (row.mediumRiskGenes.length > 0) {
          riesgoMedio = row.mediumRiskGenes;
        } else {
          riesgoMedio = "Ninguno";
        }

        if (row.highRiskGenes.length > 0) {
          desfavorables = row.highRiskGenes;
        } else {
          desfavorables = "Ninguno";
        }

        if (this.y > this.pageHeight - 40) {
          this.renderDelimiter();
        }

        // Favorables
        this.doc.text(
          "Alelos favorables en los genes: " + favorables,
          this.x,
          this.y
        );
        this.y = this.y + 10;

        if (this.y > this.pageHeight - 40) {
          this.renderDelimiter();
        }

        // Medios
        this.doc.text(
          "Alelos de riesgo medio en los genes: " + riesgoMedio,
          this.x,
          this.y
        );
        this.y = this.y + 10;

        if (this.y > this.pageHeight - 40) {
          this.renderDelimiter();
        }

        // Desfavorables
        this.doc.text(
          "Alelos desfavorables en los genes: " + desfavorables,
          this.x,
          this.y
        );
        this.y = this.y + 10;

        if (this.y > this.pageHeight - 40) {
          this.renderDelimiter();
        }

        // Pruebas de imagen
        this.doc.text("Hallazgos en pruebas de imagen: ", this.x, this.y);
        this.y = this.y + 10;

        if (row.relevantImageTests !== null) {
          const positiveImageTests = row.relevantImageTests.filter(
            (element) => element.status === "positive"
          );
          console.log(positiveImageTests);

          let positiveBiomarkers = "";
          for await (const imageTest of positiveImageTests) {
            positiveBiomarkers = positiveBiomarkers.concat(
              imageTest.name + ": " + imageTest.value + "\n"
            );
          }
          const splitTitle = this.doc.splitTextToSize(
            positiveBiomarkers,
            this.pageWidth - 2 * this.x
          );
          console.log(splitTitle);

          for await (const text of splitTitle) {
            if (text.length > 0) {
              if (this.y > this.pageHeight - 40) {
                this.renderDelimiter();
              }
              this.doc.text(text, this.x + 20, this.y);
              this.y = this.y + 10;
            }
          }

          if (row.relevantImageTests.length === 0) {
            this.doc.text("Sin datos relevantes", this.x + 20, this.y);
            this.y = this.y + 10;
          }
        }

        let analyticTestsString = "";
        if (row.analysisElements !== null) {
          console.log(row.relevantClinicStudies);
          if (row.relevantClinicStudies.length === 0) {
            analyticTestsString = analyticTestsString.concat(
              "Sin datos relevantes"
            );
          }

          for await (const analyticTest of row.relevantClinicStudies) {
            console.log(analyticTest);

            // Se recorre los elementos de an??lisis que son relevantes para esta enfermedad
            // El siguiente paso es concaternarlos al resultado
            if (
              analyticTest.status !== null &&
              analyticTest.status !== "normal"
            ) {
              analyticTestsString = analyticTestsString.concat(
                analyticTest.name +
                ": " +
                analyticTest.value +
                " " +
                analyticTest.metricUnit +
                " "
              );
            }
          }
        }

        if (this.y > this.pageHeight - 40) {
          this.renderDelimiter();
        }

        // An??lisis cl??nicos
        this.doc.text(
          "Hallazgos en an??lisis cl??nicos: " + analyticTestsString,
          this.x,
          this.y
        );
        this.y = this.y + 20;
      }
    }
  }

  async renderWarning(block: any) {
    this.doc.setFontSize(12);
    block.data.title = this.cleanString(block.data.title);
    this.doc.text(block.data.title, this.x, this.y);
    this.y = this.y + 15;
    this.doc.setFontSize(10);
    block.data.message = this.cleanString(block.data.message);
    this.doc.text(block.data.message, this.x, this.y);
    this.y = this.y + 20;
  }

  async renderList(block: any) {
    if (block.data.style === "ordered") {
      let i = 1;
      block.data.items.forEach((item) => {
        item = this.cleanString(item);
        this.doc.text(i + ") " + item, this.x + 20, this.y);
        this.y = this.y + 15;
        i++;
      });
      this.y = this.y + 5;
    } else {
      block.data.items.forEach((item) => {
        item = this.cleanString(item);
        this.doc.text("??? " + item, this.x + 20, this.y);
        this.y = this.y + 15;
      });
      this.y = this.y + 5;
    }
  }

  async renderImage(block: any) {
    console.log(block.data.url);

    const properties = this.doc.getImageProperties(block.data.url);
    block.data.url = this.cleanString(block.data.url);
    if (properties.width > 400) {
      if (properties.width * 0.5 > 400) {
        this.doc.addImage(
          block.data.url,
          "JPEG",
          this.center - 90 - (properties.width * 0.2) / 2,
          this.y,
          properties.width * 0.2,
          properties.height * 0.2,
          null,
          "NONE",
          0
        );
        this.y = this.y + properties.height * 0.2 + 40;
      } else {
        this.doc.addImage(
          block.data.url,
          "JPEG",
          this.center - 90 - (properties.width * 0.5) / 2,
          this.y,
          properties.width * 0.5,
          properties.height * 0.5,
          null,
          "NONE",
          0
        );
        this.y = this.y + properties.height * 0.5 + 40;
      }
    } else {
      this.doc.addImage(
        block.data.url,
        "JPEG",
        this.center - 90 - (properties.width * 0.5) / 2,
        this.y,
        properties.width * 0.5,
        properties.height * 0.5,
        null,
        "NONE",
        0
      );
      this.y = this.y + properties.height + 40;
    }
  }

  async renderDelimiter() {
    this.doc.addPage();
    this.y = 40;
  }

  async saveReport(identifier) {
    this.doc.save(identifier + ".pdf");
  }
}
