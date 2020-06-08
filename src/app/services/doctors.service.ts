import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import * as firebase from "firebase/app";
import * as moment from "moment";
import { Observable } from "rxjs";
import { AuthService } from "./auth.service";

@Injectable({
  providedIn: "root"
})
export class DoctorsService {
  constructor(private db: AngularFirestore, private auth: AuthService) {}

  /**
   * Devuelve todos los doctores como observable
   * @param order Orden de los datos devueltos (opcional)
   */
  getDoctors(order?: string): Observable<any> {
    if (order) {
      return this.db
        .collection(`doctors`, (ref) => ref.orderBy(order))
        .valueChanges();
    } else {
      return this.db.collection(`doctors`).valueChanges();
    }
  }

  /**
   * Devuelve todos los doctores como promesa
   * @param order Orden de los datos devueltos (opcional)
   */
  getDoctorsData(order?: string): Promise<any> {
    if (order) {
      return this.db.firestore.collection(`doctors`).orderBy(order).get();
    } else {
    }
    return this.db.firestore.collection(`doctors`).get();
  }

  /**
   * Devuelve un doctor como observable
   * @param doctorId Identificador del doctor
   */
  getDoctor(doctorId: string) {
    return this.db.doc(`doctors/${doctorId}`).valueChanges();
  }

  /**
   * Devuelve un doctor como promesa
   * @param doctorId Identificador del doctor
   */
  getDoctorData(doctorId: string) {
    return this.db.firestore.doc(`doctors/${doctorId}`).get();
  }

  /**
   * Devuelve los doctores administradores como observable
   * @param order Orden de los datos devueltos (opcional)
   */
  getAdmins(order?: string) {
    if (order) {
      this.db.collection(`doctors`, (ref) =>
        ref.where("isAdmin", "==", true).orderBy(order)
      );
    } else {
      this.db.collection(`doctors`, (ref) => ref.where("isAdmin", "==", true));
    }
  }

  /**
   * Devuelve los doctores administradores como promesa
   * @param order Orden de los datos devueltos (opcional)
   */
  getAdminsData(order?: string) {
    if (order) {
      this.db.firestore
        .collection(`doctors`)
        .where("isAdmin", "==", true)
        .orderBy(order);
    } else {
      this.db.firestore.collection(`doctors`).where("isAdmin", "==", true);
    }
  }

  /**
   * Devuelve los doctores colaboradores como observable
   * @param order Orden de los datos devueltos (opcional)
   */
  getCollaborators(order?: string) {
    if (order) {
      this.db.collection(`doctors`, (ref) =>
        ref.where("isAdmin", "==", false).orderBy(order)
      );
    } else {
      this.db.collection(`doctors`, (ref) => ref.where("isAdmin", "==", false));
    }
  }

  /**
   * Devuelve los doctores colaboradores como promesa
   * @param order Orden de los datos devueltos (opcional)
   */
  getCollaboratorsData(order?: string) {
    if (order) {
      this.db.firestore
        .collection(`doctors`)
        .where("isAdmin", "==", false)
        .orderBy(order);
    } else {
      this.db.firestore.collection(`doctors`).where("isAdmin", "==", false);
    }
  }

  /**
   * Crea un doctor
   * @param data Datos del doctor a crear
   */
  createDoctor(data) {
    data.createdAt = moment().format();
    return this.db.collection(`doctors`).add(data);
  }

  /**
   * Registra un usuario y crea un doctor
   * @param name Nombre del doctor
   * @param email Correo del doctor
   * @param password Password del doctor
   */
  async registerDoctor(
    data: any,
    email: string,
    password: string
  ): Promise<any> {
    return await this.auth.emailSignUp(email, password, data, "doctor");
  }

  /**
   * Actualiza un doctor y sus dependencias
   * @param doctorId Identificador del doctor
   * @param data Datos del doctor a actualizar
   */
  updateDoctor(doctorId: string, data: any) {
    data.updatedAt = moment().format();
    return this.db.doc(`doctors/${doctorId}`).update(data);
  }

  /**
   * Elimina un doctor y sus dependencias
   * @param doctorId Identificador del doctor
   */
  async deleteDoctor(doctorId) {
    // TO DO: Eliminar dependencias
    // Las dependencias afectadas son sujetos y todo lo que cuelgue del doctor (informes,tablas y plantillas)
    // En sujeto hay que comprobar los sujetos cuyo main doctor es este doctor y poner como maindoctor a Fernando

    const promise1 = new Promise((resolve) => {
      this.db.firestore
        .collection(`doctors/${doctorId}/reports`)
        .get()
        .then((data) => {
          if (data.docs.length > 0) {
            data.docs.forEach((element) => {
              this.db
                .doc(`doctors/${doctorId}/reports/${element.data().id}`)
                .delete();
            });
          }
          resolve();
        });
    });

    const promise2 = new Promise((resolve) => {
      this.db.firestore
        .collection(`doctors/${doctorId}/tables`)
        .get()
        .then((data) => {
          if (data.docs.length > 0) {
            data.docs.forEach((element) => {
              this.db
                .doc(`doctors/${doctorId}/tables/${element.data().id}`)
                .delete();
            });
          }
          resolve();
        });
    });

    const promise3 = new Promise((resolve) => {
      this.db.firestore
        .collection(`doctors/${doctorId}/templates`)
        .get()
        .then((data) => {
          if (data.docs.length > 0) {
            data.docs.forEach((element) => {
              this.db
                .doc(`doctors/${doctorId}/templates/${element.data().id}`)
                .delete();
            });
          }
          resolve();
        });
    });

    Promise.all([promise1, promise2, promise3]).then(() => {
      this.db.doc(`doctors/${doctorId}`).delete();
    });
  }

  /**
   * Concede a un doctor colaborador el acceso a unos datos determinados del sujeto
   * @param subjectId Identificador del sujeto
   * @param doctorId Identificador del doctor
   * @param access Datos a los que se da acceso
   */
  async grantSubjectAccess(
    subjectId: string,
    doctorId: string,
    access: string
  ): Promise<any> {
    switch (access) {
      case "phenotypic":
        return this.db.doc(`doctors/${doctorId}`).update({
          sharedSubjectsPhenotypic: firebase.firestore.FieldValue.arrayUnion({
            subjectId
          })
        });

      case "genetic":
        return this.db.doc(`doctors/${doctorId}`).update({
          sharedSubjectsGenetic: firebase.firestore.FieldValue.arrayUnion({
            subjectId
          })
        });

      case "analytic":
        return this.db.doc(`doctors/${doctorId}`).update({
          sharedSubjectsAnalytic: firebase.firestore.FieldValue.arrayUnion({
            subjectId
          })
        });

      case "image":
        return this.db.doc(`doctors/${doctorId}`).update({
          sharedSubjectsImage: firebase.firestore.FieldValue.arrayUnion({
            subjectId
          })
        });

      default:
        break;
    }
  }

  /**
   * Elimina a un doctor colaborador el acceso a unos datos determinados del sujeto
   * @param subjectId Identificador del sujeto
   * @param doctorId Identificador del doctor
   * @param access Datos a los que se da acceso
   */
  revokeSubjectAccess(
    subjectId: string,
    doctorId: string,
    access: string
  ): Promise<any> {
    switch (access) {
      case "phenotypic":
        return this.db.doc(`doctors/${doctorId}`).update({
          sharedSubjectsPhenotypic: firebase.firestore.FieldValue.arrayRemove(
            subjectId
          )
        });
      case "genetic":
        return this.db.doc(`doctors/${doctorId}`).update({
          sharedSubjectsGenetic: firebase.firestore.FieldValue.arrayRemove(
            subjectId
          )
        });
      case "analytic":
        return this.db.doc(`doctors/${doctorId}`).update({
          sharedSubjectsAnalytic: firebase.firestore.FieldValue.arrayRemove(
            subjectId
          )
        });
      case "image":
        return this.db.doc(`doctors/${doctorId}`).update({
          sharedSubjectsImage: firebase.firestore.FieldValue.arrayRemove(
            subjectId
          )
        });

      default:
        break;
    }
  }

  /**
   * Concede a un doctor colaborador el acceso a todos los datos del sujeto
   * @param subjectId Identificador del sujeto
   * @param doctorId Identificador del doctor
   */
  async grantAllSubjectAccess(
    subjectId: string,
    doctorId: string
  ): Promise<any> {
    await this.db.doc(`doctors/${doctorId}`).update({
      sharedSubjectsPhenotypic: firebase.firestore.FieldValue.arrayUnion(
        subjectId
      ),
      sharedSubjectsGenetic: firebase.firestore.FieldValue.arrayUnion(
        subjectId
      ),
      sharedSubjectsAnalytic: firebase.firestore.FieldValue.arrayUnion(
        subjectId
      ),
      sharedSubjectsImage: firebase.firestore.FieldValue.arrayUnion(subjectId)
    });
  }

  /**
   * Elimina a un doctor colaborador el acceso a todos los datos del sujeto
   * @param subjectId Identificador del sujeto
   * @param doctorId Identificador del doctor
   */
  async revokeAllSubjectAccess(
    subjectId: string,
    doctorId: string
  ): Promise<any> {
    await this.db.doc(`doctors/${doctorId}`).update({
      sharedSubjectsPhenotypic: firebase.firestore.FieldValue.arrayRemove(
        subjectId
      ),
      sharedSubjectsGenetic: firebase.firestore.FieldValue.arrayRemove(
        subjectId
      ),
      sharedSubjectsAnalytic: firebase.firestore.FieldValue.arrayRemove(
        subjectId
      ),
      sharedSubjectsImage: firebase.firestore.FieldValue.arrayRemove(subjectId)
    });
  }
}
