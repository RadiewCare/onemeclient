import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { ActivatedRoute } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { DocumentsService } from 'src/app/services/documents.service';
import { SubjectsService } from 'src/app/services/subjects.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.page.html',
  styleUrls: ['./documents.page.scss'],
})
export class DocumentsPage implements OnInit {
  id: string;
  subject: any;
  documents: any;
  currentFiles: any;
  fileSubscription: Subscription;
  fileInput: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private subjectsService: SubjectsService,
    private documentsService: DocumentsService,
    private toastService: ToastService,
    private storage: AngularFireStorage,
    private loadingController: LoadingController
  ) { }

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.params.id;
  }

  ionViewDidEnter() {
    this.getSubject();
  }

  getSubject() {
    this.subjectsService.getSubjectData(this.id).then(data => {
      this.subject = data.data();
      console.log(this.subject);
      this.getDocuments();
    })
  }

  async getDocuments() {
    this.documents = (await this.documentsService.getAllDataBySubject(this.id)).docs.map(element => element = element.data());
    console.log(this.documents);
  }

  download(index: string) {
    window.open(this.documents[index].url, '_blank');
  }

  loadFile(files: any) {
    this.currentFiles = files;
    console.log(this.currentFiles);

  }

  async save(): Promise<void> {
    return new Promise(async (resolve) => {
      const code = this.createFileCode();
      this.presentLoading();
      this.storage
        .upload(
          `/subjectBiomarkers/${code}${this.currentFiles[0].name}`,
          this.currentFiles[0]
        )
        .then(async () => {
          // Se guarda la url de la imagen en la actividad
          this.fileSubscription = this.storage
            .ref(`/subjectBiomarkers/${code}${this.currentFiles[0].name}`)
            .getDownloadURL()
            .subscribe(async data => {
              await this.documentsService.create({
                subjectId: this.id,
                fileName: this.currentFiles[0].name,
                url: data,
                code: code
              });
              this.currentFiles = null;
              this.fileInput = null;
              this.getDocuments();
              this.loadingController.dismiss();
              this.toastService.show("success", "Archivo guardado con éxito");
              resolve();
            });
        }).catch(error => {
          this.toastService.show("danger", `Error al subir el archivo: ${error}`);
          this.loadingController.dismiss();
        })
    })
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Subiendo archivo...',
    });
    await loading.present();
  }

  createFileCode() {
    const dictionary = ["A", "9", "B", "C", "8", "D", "F", "G", "H", "J", "1", "K", "L", "M", "N", "Ñ", "2", "P", "Q", "R", "S", "T", "V", "3", "W", "X", "Y", "Z", "a", "b",
      "4", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "ñ", "o", "5", "p", "q", "6", "r", "s", "t", "7", "u", "v", "w", "x", "y", "z"
    ];
    let returnedCode = "";

    for (let index = 0; index < 8; index++) {
      returnedCode += dictionary[Math.floor(Math.random() * dictionary.length - 1 + 1)];
    }

    return returnedCode;
  }

  async delete(index: string) {
    const id = this.documents[index].id;
    this.storage.ref(`/subjectBiomarkers/${this.documents[index].code}${this.documents[index].fileName}`).delete();
    this.documentsService.delete(id).then(() => {
      this.getDocuments();
      this.toastService.show("success", "Archivo eliminado con éxito");
    }).catch((error) => {
      this.toastService.show("danger", "Error al eliminar archivo en la base de datos: " + error);
    });
  }

  ngOnDestroy(): void {
    if (this.fileSubscription) {
      this.fileSubscription.unsubscribe();
    }
  }
}
