import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CategoriesService } from 'src/app/services/categories.service';
import { ImageTestsService } from 'src/app/services/image-tests.service';
import { SubjectImageTestsService } from 'src/app/services/subject-image-tests.service';
import { SubjectsService } from 'src/app/services/subjects.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
})
export class CategoriesPage implements OnInit, OnDestroy {

  categories = [];
  queryCategories: any;

  categoriesSub: Subscription;

  imageTestsList = [];

  constructor(private categoriesService: CategoriesService, private imageTestsService: ImageTestsService, private subjectsService: SubjectsService, private subjectImageTestsService: SubjectImageTestsService) { }

  ngOnInit() {
    this.getCategories();
    // this.updateImageTests();
    // this.deleteNewImageTests();
    // this.updateSubjectImageTests;
  }

  ionViewDidEnter() {

  }

  async deleteNewImageTests() {
    const subjects = []
    this.subjectsService.getSubjectsData().then(async data => {
      for await (const doc of data.docs) {
        subjects.push(doc.data());
      }
      let contador = 0;
      for await (const subject of subjects) {
        this.subjectsService.updateSubject(subject.id, { subjectImageTests: [] }).then(() => {
          contador = contador + 1
          console.log(contador);
        })
      }
    })
  }

  async updateImageTests() {
    // Carga de los datos nuevos de cada imageTest
    this.imageTestsList = (await this.imageTestsService.getImageTestsData()).map(element => element = element.data());
    // console.log("PLANTILLAS DE PRUEBAS DE IMAGEN", this.imageTestsList);

    // Carga de la totalidad de los sujetos
    const subjects = []
    const contenedor = [];
    this.subjectsService.getSubjectsData().then(async data => {
      for await (const doc of data.docs) {
        subjects.push(doc.data());
      }
      // console.log("SUJETOS", subjects);
      console.log(subjects.length);
      console.log(subjects.filter(element => element.imageTests && element.imageTests.length > 0).length);

      let contador = 0;
      let contador2 = 0;
      for await (const subject of subjects) {
        // console.log("sujeto", subject.identifier);
        subject.imageTestsIds = [];
        if (subject.imageTests) {
          for await (const imageTest of subject.imageTests) {
            console.log(imageTest);

            const imageTestFromList = this.imageTestsList.filter(element => element.id === imageTest.imageTestId);
            if (imageTestFromList.length > 0) {
              subject.imageTestsIds.push(imageTestFromList[0].id)
              await this.subjectImageTestsService.create({
                subjectId: subject.id,
                imageTestId: imageTestFromList[0].id,
                values: imageTest.values || null,
                date: imageTest.date || null,
                shortcode: imageTest.shortcode || null,
                status: imageTest.status || null,
                accessionNumber: imageTest.accessionNumber || null,
                images: imageTest.images || null,
                quibimData: imageTest.quibimData || null
              });
              contador2 = contador2 + 1
              console.log(contador2);
            }
          }
          contador = contador + subject.imageTestsIds.length;
          contenedor.push({ subject: subject.id, imageTestIds: subject.imageTestsIds })
          // console.log("IDs DE LAS PRUEBAS", subject.imageTestsIds);
        }
      }
      console.log("SE ACABÓ");
      console.log(contenedor);
      console.log(contador);
    })

  }

  getCategories() {
    this.categoriesSub = this.categoriesService.getAll().subscribe(data => {
      this.categories = data;
      this.categories = this.categories.sort((a, b) => this.removeAccents(a.name).localeCompare(this.removeAccents(b.name)))
    });
  }

  onSearchChange(query: string) {
    if (query.length > 0) {
      this.queryCategories = this.categories.filter((analysisElement) =>
        this.removeAccents(analysisElement.name.toLowerCase()).includes(this.removeAccents(query.toLowerCase()))
      );
    } else {
      this.queryCategories = null;
    }
  }

  removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  ngOnDestroy(): void {
    if (this.categoriesSub) { this.categoriesSub.unsubscribe(); }
  }

}
