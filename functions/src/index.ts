import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

import * as nodemailer from "nodemailer";

const moment = require('moment');

admin.initializeApp(functions.config().firebase);

import * as express from "express";
import * as cors from "cors";

// const axios = require('axios');

const { validate, ValidationError, Joi } = require('express-validation');

const createSubjectDataValidation = {
  body: Joi.object({
    identifier: Joi.string()
      .required(),
    mainDoctor: Joi.string()
      .required(),
    history: Joi.object({
      centroReferente: Joi.string(),
      inicialesDelSujeto: Joi.string(),
      actualpacsId: Joi.string(),
      genre: Joi.string(),
      birthDate: Joi.string(),
      age: Joi.number(),
      otherBackground: Joi.string(),
      diseases: Joi.array().items(Joi.object({
        id: Joi.string(),
        name: Joi.string()
      })),
      signsAndSymptoms: Joi.array().items(Joi.object({
        accessionNumber: Joi.number(),
        date: Joi.string(),
        id: Joi.string(),
        name: Joi.string()
      }))
    })
  }),
}

/**
 * MIDDLEWARE DE AUTORIZACIÓN
 */
const auth = (
  request: express.Request,
  response: express.Response,
  next: any
) => {
  const actualpacsKey = "95149134-42ca-4b19-8c32-416eebef2dd0";
  const quibimKey = "cbf11d2f-9358-46bd-afd6-f6e893014731";
  // const oddityKey = "5c71da19-1573-4e6d-adb4-59d3c91c8592";
  const hsMedicaKey = "9fe3212a-6657-4bb6-9789-dd5ad8e3c049";

  if (
    (request.headers.authorization !== quibimKey) &&
    (request.headers.authorization !== actualpacsKey) &&
    (request.headers.authorization !== hsMedicaKey)
  ) {
    response.status(400).send("Operación no autorizada");
  }
  next();
};

/**
 * INICIALIZACIONES
 */
const app = express();
app.use(cors({ origin: true }));
app.use(auth);

app.use(function (error: any, request: express.Request, response: express.Response, next: any) {
  if (error instanceof ValidationError) {
    return response.status(error.statusCode).json(error)
  }
  return response.status(400).json(error)
})


/**
 * API ONE-ME
 */

/**
 * SUBJECTS
 */

app.get("/getSubjectById", (request, response) => { // OK

  admin.firestore().doc(`subjects/${request.query.id}`).get()
    .then((data: any) => {
      const subject = data.data();

      const result = {
        "id": subject.id,
        "identifier": subject.identifier,
        "history": subject.history || null,
        "createdAt": subject.createdAt || null,
        "updatedAt": subject.updatedAt || null
      }
      response.send({ "subject": result });
    }).catch(error => {
      response.status(500).send(error);
    })
});

app.get("/getSubjectsByDoctorId", (request, response) => { // OK
  admin.firestore().collection(`subjects`).where('mainDoctor', '==', request.query.doctorId).get()
    .then((data) => {
      let result: FirebaseFirestore.DocumentData[] = [];
      data.docs.forEach(element => {
        result.push(element.data());
      })
      result = result.map(element => {
        return {
          "id": element.id,
          "identifier": element.identifier,
          "createdAt": element.createdAt || null,
          "updatedAt": element.updatedAt || null
        }
      })
      response.send({ "subjects": result });
    }).catch(error => {
      response.status(500).send(error);
    })
});

app.post("/createSubject", validate(createSubjectDataValidation, {}, {}), (request, response) => { // OK

  let subjectId: string = "";
  let found = false;

  admin.firestore().collection(`subjects`).where('mainDoctor', '==', request.body.mainDoctor).get().then((sujetos) => {
    const subjects = sujetos.docs;
    if (subjects && subjects.length > 0) {

      const sujeto = subjects.map(element => element.data()).filter(element => element.identifier.trim().toLowerCase() === request.body.identifier.trim().toLowerCase());

      if (sujeto && sujeto.length > 0) {
        found = true;
        console.error("SUJETO REPETIDO CON ID: " + sujeto[0].id);
        subjectId = sujeto[0].id;
      }

      if (found) {

        console.error(sujeto[0]);
        response.status(500).send({ error: "El identificador del sujeto ya está en uso en el doctor dado", id: subjectId });

      } else {

        request.body.createdAt = moment().format();
        request.body.hasImageAnalysis = true;
        request.body.origin = "Actualpacs";

        const subjectRef = admin.firestore().collection("subjects").doc();

        if (subjectRef && subjectRef.id) {
          request.body.id = subjectRef.id;
          subjectRef.set(request.body)
            .then(() => {
              response.send({ "create": "ok", "id": subjectRef.id });
            }).catch(() => {
              console.error("No se ha podido actualizar el sujeto, inténtelo de nuevo");
              response.status(500).send({ error: "No se ha podido actualizar el sujeto, inténtelo de nuevo" })
            });
        } else {
          console.error("No se ha creado la id del sujeto");
          response.status(500).send({ error: "No se ha podido crear la id del sujeto" })
        }

      }
    } else {
      console.error("No se encuentran sujetos para el doctor dado");
      response.status(500).send({ error: "No se encuentran sujetos para el doctor dado" })
    }
  }).catch(() => {
    console.error("Error en la búsqueda de sujetos del doctor dado");
    response.status(500).send({ error: "Error en la búsqueda de sujetos del doctor dado" })
  });
});

app.put("/editSubject", (request, response) => { // OK

  admin.firestore().collection(`subjects`).where("mainDoctor", "==", request.body.mainDoctor).get().then((data) => {
    if (data.docs.length > 0) {
      admin.firestore().doc(`subjects/${request.body.id}`).update(request.body)
        .then((subject) => {
          response.send({ "update": "ok", "updatedData": request.body });
        }).catch((error) => {
          response.status(500).send({ error: "No se ha podido actualizar el sujeto" })
        });
    } else {
      response.status(500).send({ error: "El sujeto dado no existe para ese doctor" })
    }
  }).catch(() => {
    response.status(500).send({ error: "Error al consultar los sujetos" });
  })
});

app.delete("/deleteSubject", (request, response) => { // OK

  admin.firestore().collection(`subjects`).where("id", "==", request.query.id).get().then((data) => {
    if (data.docs.length > 0 && data.docs[0].data().mainDoctor === request.query.mainDoctor) {
      admin.firestore().doc(`subjects/${request.query.id}`).delete()
        .then(() => {
          response.send({ "delete": "ok" });
        }).catch((error) => {
          response.status(500).send({ error: "No se ha podido eliminar el sujeto" })
        });
    } else {
      response.status(500).send({ error: "El sujeto dado no existe" })
    }
  }).catch(() => {
    response.status(500).send({ error: "Error al consultar los sujetos" });
  })
});

/**
 * IMAGETESTS
 */

app.get("/getImageTests", (request, response) => { // OK
  admin.firestore().collection(`imageTests`).get()
    .then((data) => {
      const result: FirebaseFirestore.DocumentData[] = [];
      data.docs.forEach(element => {
        result.push(element.data());
      })
      response.send({ "imageTests": result });
    }).catch(error => {
      response.status(500).send(error)
    })
});

app.get("/getImageTestById", (request, response) => { // OK
  admin.firestore().doc(`imageTests/${request.query.id}`).get()
    .then((data: any) => {
      const imageTest = data.data();
      response.send({ "imageTest": imageTest });
    }).catch(error => {
      response.status(500).send(error)
    })
});

app.get("/getImageTestByIdWithValues", (request, response) => { // OK
  admin.firestore().collection(`imageTestElements`).get()
    .then((data) => {
      let imageTestElements: FirebaseFirestore.DocumentData[] = [];
      imageTestElements = data.docs.map(element => element.data());

      admin.firestore().doc(`imageTests/${request.query.id}`).get()
        .then(async (imData: any) => {
          const imageTest = imData.data();

          for await (const itElement of imageTest.elements) {
            const found = imageTestElements.filter(element => element.id === itElement.id);

            if (found.length > 0) {
              const selected = found[0];
              itElement.defaultInput = selected.defaultInput;
              itElement.defaultOption = selected.defaultOption;
              itElement.falseInput = selected.falseInput;
              itElement.images = selected.images;
              itElement.isIllustrated = selected.isIllustrated;
              itElement.max = selected.max;
              itElement.min = selected.min;
              itElement.options = selected.options;
              itElement.positiveOptions = selected.positiveOptions;
              itElement.relatedDiseases = selected.relatedDiseases;
              itElement.relatedTests = selected.relatedTests;
              itElement.trueInput = selected.trueInput;
              itElement.type = selected.type;
              itElement.unit = selected.unit;
              itElement.updatedAt = selected.updatedAt;
            }
          }
          response.send({ "imageTest": imageTest });
        }).catch(error => {
          response.status(500).send(error)
        })

    }).catch(error => {
      response.status(500).send(error)
    })
});

app.get("/getImageTestElements", (request, response) => { // OK
  admin.firestore().collection(`imageTestElements`).get()
    .then((data) => {
      const result: FirebaseFirestore.DocumentData[] = [];
      data.docs.forEach(element => {
        result.push(element.data());
      })
      response.send({ "imageTestElements": result });
    }).catch(error => {
      response.status(500).send(error)
    })
});

app.get("/getImageTestElementById", (request, response) => { // OK
  admin.firestore().doc(`imageTestElements/${request.query.id}`).get()
    .then((data) => {
      const imageTestElement = data.data();
      response.send({ "imageTestElement": imageTestElement });
    }).catch(error => {
      response.status(500).send(error)
    })
});

/**
 * SUBJECTIMAGETESTS
 */

app.get("/getSubjectImageTestById", (request, response) => {
  admin.firestore().collection(`subjectImageTests`).where('id', '==', request.query.id).get()
    .then((data) => {
      let result: FirebaseFirestore.DocumentData[] = [];
      data.docs.forEach(element => {
        result.push(element.data());
      })
      result = result.map(element => {
        return {
          "id": element.id,
          "subjectId": element.subjectId,
          "imageTestId": element.imageTestId,
          "biomarkers": element.biomarkers || null,
          "date": element.date || null,
          "status": element.status || null,
          "quibimData ": element.quibimData || null,
          "images": element.images || null,
          "accessionNumber": element.accessionNumber || null,
          "values": element.values || null,
        }
      })
      response.send({ "subjectImageTest": result });
    }).catch(error => {
      response.status(500).send(error)
    })
});

app.get("/getSubjectImageTestsBySubjectId", (request, response) => {
  admin.firestore().collection(`subjectImageTests`).where('subjectId', '==', request.query.subjectId).get()
    .then((data) => {
      let result: FirebaseFirestore.DocumentData[] = [];
      data.docs.forEach(element => {
        result.push(element.data());
      })
      result = result.map(element => {
        return {
          "id": element.id,
          "subjectId": element.subjectId,
          "imageTestId": element.imageTestId,
          "biomarkers": element.biomarkers || null,
          "date": element.date || null,
          "status": element.status || null,
          "quibimData ": element.quibimData || null,
          "images": element.images || null,
          "accessionNumber": element.accessionNumber || null,
          "values": element.values || null
        }
      });
      response.send({ "subjectImageTest": result });
    }).catch(error => {
      response.status(500).send(error)
    })
});

app.post("/createSubjectImageTest", (request, response) => { // OK
  request.body.createdAt = moment().format();
  request.body.format = "new";
  admin.firestore()
    .collection("subjectImageTests")
    .add(request.body)
    .then((doc) => {
      admin.firestore().doc(`subjectImageTests/${doc.id}`).update({ id: doc.id })
        .then((success) => {
          response.send({ "create": "ok", "id": doc.id });
        }).catch(() => {
          response.status(500).send({ error: "No se ha podido crear la prueba, inténtelo de nuevo" })
        });
    }).catch(() => {
      response.status(500).send({ error: "No se ha podido crear la prueba, inténtelo de nuevo" })
    });
});

app.put("/editSubjectImageTest", (request, response) => { // OK
  request.body.updatedAt = moment().format();
  admin.firestore().doc(`subjectImageTests/${request.body.id}`).update(request.body)
    .then((subjectImageTest) => {
      response.send({ "update": "ok", "subjectImageTest": request.body });
    }).catch((error) => {
      response.status(500).send({ error: "No se ha podido actualizar la prueba" })
    });
});

app.delete("/deleteSubjectImageTest", (request, response) => { // OK
  admin.firestore().collection(`subjectImageTests`).where("id", "==", request.query.id).get().then((data) => {
    if (data.docs.length > 0) {
      admin.firestore().doc(`subjectImageTests/${request.query.id}`).delete()
        .then(() => {
          response.send({ "delete": "ok" });
        }).catch((error) => {
          response.status(500).send({ error: "No se ha podido eliminar la prueba" })
        });
    } else {
      response.status(500).send({ error: "La prueba dada no existe" })
    }
  }).catch(() => {
    response.status(500).send({ error: "Error al consultar las pruebas" });
  })
});

/**
 * SIGNOS Y SÍNTOMAS
 */

app.get("/getSignsAndSymptoms", (request, response) => { // OK
  admin.firestore().collection(`symptoms`).get()
    .then((data) => {
      const result: FirebaseFirestore.DocumentData[] = [];
      data.docs.forEach(element => {
        result.push(element.data());
      })
      response.send({ "symptoms": result });
    }).catch(error => {
      response.status(500).send(error)
    })
});

app.get("/getSignAndSymptomById", (request, response) => { // OK
  admin.firestore().doc(`symptoms/${request.query.id}`).get()
    .then((data: any) => {
      const symptom = data.data();
      response.send({ "symptom": symptom });
    }).catch(error => {
      response.status(500).send(error)
    })
});

/**
 * PRUEBAS DE ANÁLISIS DEL SUJETO
 */

app.get("/getSubjectClinicAnalysis", (request, response) => { // OK
  admin.firestore().collection(`subjects/${request.query.id}/analysisStudies`).get()
    .then((data) => {
      const result: FirebaseFirestore.DocumentData[] = [];
      data.docs.forEach(element => {
        result.push(element.data());
      })
      response.send({ "clinicAnalysis": result });
    }).catch(error => {
      response.status(500).send(error)
    })
});

app.post("/createSubjectClinicAnalysis", (request, response) => { // OK
  request.body.createdAt = moment().format();
  request.body.format = "actualpacs";
  request.body.relatedCategories = [];
  request.body.relatedLabels = [];
  request.body.shortcode = "[ANA" + Math.floor(Math.random() * 1000 + 1).toString(10) + "]";

  admin.firestore().doc(`subjects/${request.body.id}`)
    .collection("analysisStudies")
    .add(request.body)
    .then((doc) => {
      admin.firestore().doc(`subjects/${request.body.id}/analysisStudies/${doc.id}`).update({ id: doc.id })
        .then((success) => {
          response.send({ "create": "ok", "clinicAnalysisId": doc.id });
        }).catch(() => {
          response.status(500).send({ error: "No se ha podido crear la prueba, inténtelo de nuevo" })
        });
    }).catch(() => {
      response.status(500).send({ error: "No se ha podido crear la prueba, inténtelo de nuevo" })
    });
});

app.put("/editSubjectClinicAnalysis", (request, response) => { // OK
  request.body.updatedAt = moment().format();

  admin.firestore().doc(`subjects/${request.body.subjectId}/analysisStudies/${request.body.id}`)
    .update(request.body)
    .then((doc) => {
      response.send({ "update": "ok", "clinicAnalysis": request.body });
    }).catch(() => {
      response.status(500).send({ error: "No se ha podido actualizar la prueba, inténtelo de nuevo" })
    });
});

app.delete("/deleteSubjectClinicAnalysis", (request, response) => { // OK
  admin.firestore().collection(`subjects/${request.query.subjectId}/analysisStudies`).where("id", "==", request.query.id).get().then((data) => {
    if (data.docs.length > 0) {
      admin.firestore().doc(`subjects/${request.query.subjectId}/analysisStudies/${request.query.id}`).delete()
        .then(() => {
          response.send({ "delete": "ok" });
        }).catch((error) => {
          response.status(500).send({ error: "No se ha podido eliminar la prueba" })
        });
    } else {
      response.status(500).send({ error: "La prueba dada no existe" })
    }
  }).catch(() => {
    response.status(500).send({ error: "Error al consultar las pruebas" });
  })
});

/**
 * PRUEBAS DE ANÁLISIS
 */

app.get("/getClinicAnalysis", (request, response) => { // OK
  admin.firestore().collection(`clinicAnalysis`).get()
    .then((data) => {
      const result: FirebaseFirestore.DocumentData[] = [];
      data.docs.forEach(element => {
        result.push(element.data());
      })
      response.send({ "clinicAnalysis": result });
    }).catch(error => {
      response.status(500).send(error)
    })
});

app.get("/getClinicAnalysisById", (request, response) => { // OK
  admin.firestore().doc(`clinicAnalysis/${request.query.id}`).get()
    .then((data: any) => {
      const clinicAnalysis = data.data();
      response.send({ "clinicAnalysis": clinicAnalysis });
    }).catch(error => {
      response.status(500).send(error)
    })
});

/**
 * ELEMENTOS DE PRUEBAS DE ANÁLISIS
 */

app.get("/getClinicAnalysisElements", (request, response) => { // OK
  admin.firestore().collection(`clinicAnalysisElements`).get()
    .then((data) => {
      const result: FirebaseFirestore.DocumentData[] = [];
      data.docs.forEach(element => {
        result.push(element.data());
      })
      response.send({ "clinicAnalysisElements": result });
    }).catch(error => {
      response.status(500).send(error)
    })
});

app.get("/getClinicAnalysisElementById", (request, response) => { // OK
  admin.firestore().doc(`clinicAnalysisElements/${request.query.id}`).get()
    .then((data: any) => {
      const clinicAnalysisElement = data.data();
      response.send({ "clinicAnalysisElement": clinicAnalysisElement });
    }).catch(error => {
      response.status(500).send(error)
    })
});

/**
 * ENFERMEDADES
 */

app.get("/getDiseases", (request, response) => { // OK
  admin.firestore().collection(`diseases`).get()
    .then((data: any) => {
      let result = []
      result = data.docs.map((element: any) => {
        return { id: element.data().id, name: element.data().name }
      })
      response.send({ "diseases": result });
    }).catch(error => {
      response.status(500).send(error)
    })
});

app.get("/getDiseasesWithData", (request, response) => { // OK
  admin.firestore().collection(`diseases`).get()
    .then((data) => {
      const result: FirebaseFirestore.DocumentData[] = [];
      data.docs.forEach(element => {
        result.push(element.data());
      })
      response.send({ "diseases": result });
    }).catch(error => {
      response.status(500).send(error)
    })
});

/** 
 * CONTENEDORES DE PRUEBAS DE IMAGEN
 */

app.get("/getImageContainersBySubjectId", (request, response) => { // OK
  admin.firestore().collection(`imageTestsContainers`).where("subjectId", "==", request.query.id).get().then((data) => {
    const result: FirebaseFirestore.DocumentData[] = [];
    data.docs.forEach(element => {
      result.push(element.data());
    })
    response.send({ "imageContainers": result });
  }).catch((error) => {
    response.status(500).send({ error: "Error al consultar los contenedores del sujeto: " + error });
  })
});

app.post("/createImageContainer", (request, response) => { // OK
  request.body.createdAt = moment().format();
  admin.firestore()
    .collection("imageTestsContainers")
    .add(request.body)
    .then((doc) => {
      admin.firestore().doc(`imageTestsContainers/${doc.id}`).update({ id: doc.id })
        .then((success) => {
          response.send({ "create": "ok", "id": doc.id });
        }).catch(() => {
          response.status(500).send({ error: "No se ha podido crear el contenedor, inténtelo de nuevo" })
        });
    }).catch(() => {
      response.status(500).send({ error: "No se ha podido crear el contenedor, inténtelo de nuevo" })
    });
});

app.put("/editImageContainer", (request, response) => { // OK
  request.body.updatedAt = moment().format();
  admin.firestore().doc(`imageTestsContainers/${request.body.id}`).update(request.body)
    .then(() => {
      response.send({ "update": "ok", "imageContainer": request.body });
    }).catch((error) => {
      response.status(500).send({ error: "No se ha podido actualizar el contenedor" })
    });
});

app.get("/getAssisstantReportsBySubjectId", (request, response) => { // OK
  admin.firestore().collection(`assistantReports`).where("subjectId", "==", request.query.id).get().then((data) => {
    const result: FirebaseFirestore.DocumentData[] = [];
    data.docs.forEach(element => {
      result.push(element.data());
    })
    response.send({ "assistantReports": result });
  }).catch((error) => {
    response.status(500).send({ error: "Error al consultar los reportes del asistente del sujeto: " + error });
  })
});

app.post("/createNotification", (request, response) => { // OK
  request.body.createdAt = moment().format();
  admin.firestore()
    .collection("notifications")
    .add(request.body)
    .then((doc) => {
      admin.firestore().doc(`notifications/${doc.id}`).update({ id: doc.id })
        .then((success) => {
          response.send({ "create": "ok", "id": doc.id });
        }).catch(() => {
          response.status(500).send({ error: "No se ha podido crear el id de la notificación" })
        });
    }).catch(() => {
      response.status(500).send({ error: "No se ha podido crear la notificación, inténtelo de nuevo" })
    });
});

/**
 * ASISTENTE DE DIAGNÓSTICO
 */

app.get("/createAssistantReport", async (request, response) => {
  const result = {
    subjectId: request.query.id,
    diseases: [],
    confirmedDiseases: [],
    date: moment().format(),
    signsAndSymptoms: [],
    imageBiomarkers: [],
    reproductionBiomarkers: [],
    analyticBiomarkers: [],
  }
  admin.firestore()
    .collection("assistantReports")
    .add(result)
    .then((doc) => {
      admin.firestore().doc(`assistantReports/${doc.id}/`).update({ id: doc.id })
        .then((success) => {
          response.send({ "create": "ok", "report": result, "reportId": doc.id });
        }).catch((error) => {
          response.status(500).send({ message: "No se ha podido crear el informe, inténtelo de nuevo", error: error })
        });
    }).catch((error) => {
      response.status(500).send({ message: "No se ha podido crear el informe, inténtelo de nuevo", error: error })
    });
})

/*

app.get("/createAssistantReportTest", async (request, response) => { // OK
  console.log(request.body);

  let id = request.query.id;

  let subject: any;
  let history: any;

  // Colecciones
  let diseases = <any>[];
  let clinicAnalysisElements: any;
  let signsAndSymptoms = <any>[];
  let clinicAnalysis: any;
  let imageTestsElements: any;
  let imageTests: any;
  let reproductionTests = <any>[];

  // Diagnosis


  let originalDiseases = <any>[];
  let subjectAnaliticStudies = <any>[];

  // BIOMARCADORES

  let imageBiomarkers = <any>[];
  let analyticBiomarkers = <any>[];
  let reproductionBiomarkers = <any>[];
  let confirmedDiseases = <any>[];
  let excludedDiseases = <any>[];

  // Lógica de diagnóstico

  // 1. Recoger datos del sujeto
  admin.firestore().doc(`subjects/${id}`).get()
    .then((data: any) => {
      subject = data.data();
      history = subject.history;
    }).catch(error => {
      response.status(500).send(error);
    })

  // 2. Coger colecciones de la base de datos
  // Signos y síntomas
  admin.firestore().collection(`symptoms`).get()
    .then((dataSymptoms) => {
      dataSymptoms.docs.forEach(element => {
        signsAndSymptoms.push(element.data());
      })
    }).catch(error => {
      response.status(500).send(error);
    })
  // Enfermedades
  admin.firestore().collection(`diseases`).get()
    .then((dataDiseases) => {
      dataDiseases.docs.forEach(element => {
        diseases.push(element.data());
        originalDiseases.push(element.data())
      })
    }).catch(error => {
      response.status(500).send(error);
    })
  // Elementos de prueba de imagen
  admin.firestore().collection(`imageTestElements`).get()
    .then((dataImageTestElements) => {
      dataImageTestElements.docs.forEach(element => {
        imageTestsElements.push(element.data());
      })
    }).catch(error => {
      response.status(500).send(error);
    })
  // Elementos de analítica
  admin.firestore().collection(`clinicAnalysisElements`).get()
    .then((dataClinicAnalysisElements) => {
      dataClinicAnalysisElements.docs.forEach(element => {
        clinicAnalysisElements.push(element.data());
      })
    }).catch(error => {
      response.status(500).send(error);
    })
  // 3. Coger datos del sujeto
  // subjectImageTests
  admin.firestore().collection(`subjectImageTests`).where("subjectId", "==", id).get()
    .then((dataSubjectImageTests) => {
      dataSubjectImageTests.docs.forEach(element => {
        imageTests.push(element.data());
      })
    }).catch(error => {
      response.status(500).send(error);
    })
  // reproductionTests
  admin.firestore().collection(`reproductionTests`).where("subjectId", "==", id).get()
    .then((dataReproductionTests) => {
      dataReproductionTests.docs.forEach(element => {
        reproductionTests.push(element.data());
      })
    }).catch(error => {
      response.status(500).send(error);
    })
  // analyticStudy
  admin.firestore().collection(`subjects/${id}/analysisStudies`).get()
    .then((dataClinicAnalysis) => {
      dataClinicAnalysis.docs.forEach(element => {
        clinicAnalysis.push(element.data());
      })
    }).catch(error => {
      response.status(500).send(error);
    })

  // 3. Diagnóstico

  // Recopilación de biomarcadores positivos

  for await (const analysis of subjectAnaliticStudies) {
    analysis.values.forEach((element: any) => {
      if (element.status === "high" || element.status === "low") {
        analyticBiomarkers.push(element)
      }
    });
  }

  for await (const test of imageTests) {
    if (test.status === "positive") {
      test.values.forEach((element: any) => {
        if (element.status === "positive") {
          imageBiomarkers.push(element);
        }
      });
    }
  }

  for await (const test of reproductionTests) {
    if (test.status === "positive") {
      test.values.forEach((element: any) => {
        if (element.status === "positive") {
          reproductionBiomarkers.push({
            id: element.id,
            name: test.name,
            status: element.status,
            value: element.value
          });
        }
      });
    }
  }

  // Recopilación de enfermdades relacionadas

  // ANÁLISIS
  let analysisDiseases = <any>[];
  let analysisDiseasesWithoutFrecuencies = <any>[];
  let relatedAnalysisBiomarkerFoundDiseases = <any>[];
  let relatedAnalysisBiomarkerFoundDiseasesWithValues = <any>[];

  for await (const biomarker of analyticBiomarkers) {

    let biomarkerFound = false;

    if (biomarker.format && biomarker.format == 'actualpacs') { // ANÁLISIS DESDE ACTUALPACS
      originalDiseases.forEach((disease: any) => {
        if (disease.analysisElements) {
          disease.analysisElements.forEach((biom: any) => {
            if (biom.id === biomarker.id) {
              let isRelevant = false;
              let ponderation = 0;

              // TRATAMIENTO NORMAL DEL ELEMENTO EN UNA ENFERMEDAD PERO SIN VALORES
              biomarkerFound = true;

              if (biom.condition) {
                ponderation = parseInt(biom.condition);
              }

              if (biom.relevancy) {
                if (biom.relevancy == "both" && (biomarker.status == "high" || biomarker.status == "low")) {
                  isRelevant = true;
                } else if (biom.relevancy == "superior" && biomarker.status == "high") {
                  isRelevant = true;
                } else if (biom.relevancy == "inferior" && biomarker.status == "low") {
                  isRelevant = true;
                }
              }

              if (ponderation == 5 && isRelevant) {
                console.log("PONDERACIÓN", ponderation);
                if (!confirmedDiseases.map((el: any) => el = el.disease).includes(disease.id)) {
                  confirmedDiseases.push({ disease: disease.id, name: disease.name, value: biomarker.status, ponderation: ponderation });
                } else {
                  confirmedDiseases.filter((el: any) => el.disease === disease.id)[0].value = confirmedDiseases.filter((el: any) => el.disease === disease.id)[0].value + "," + biomarker.status;
                }

                if (!relatedAnalysisBiomarkerFoundDiseasesWithValues.some((element: any) => element.disease == disease.id && element.value == element && element.ponderation == ponderation)) {
                  relatedAnalysisBiomarkerFoundDiseases.push(disease.id);
                  relatedAnalysisBiomarkerFoundDiseasesWithValues.push({ disease: disease.id, value: biomarker.status, ponderation: ponderation, testName: biomarker.name });
                }

              }

              if (ponderation > 1 && ponderation < 5 && isRelevant) {
                console.log("PONDERACIÓN", ponderation);

                if (!relatedAnalysisBiomarkerFoundDiseasesWithValues.some((element: any) => element.disease == disease.id && element.value == element && element.ponderation == ponderation)) {
                  relatedAnalysisBiomarkerFoundDiseases.push(disease.id);
                  relatedAnalysisBiomarkerFoundDiseasesWithValues.push({ disease: disease.id, value: biomarker.status, ponderation: ponderation, testName: biomarker.name });
                }
              }

              if (ponderation == 1 && isRelevant) {
                console.log("PONDERACIÓN", ponderation);
                if (!excludedDiseases.map((el: any) => el = el.disease).includes(disease.id)) {
                  excludedDiseases.push({ disease: disease.id, name: disease.name, testName: biomarker.name });
                }
              }

            }
          });
        }
      })
    } else { // ANÁLISIS DESDE ONE-ME
      originalDiseases.forEach((disease: any) => {
        if (disease.analysisElements) {
          disease.analysisElements.forEach((biom: any) => {
            if (biom.id === biomarker.id) {
              let isRelevant = false;
              let ponderation = 0;

              if (biom.ranges.length > 0) {
                // TO DO: TRATAR LOS RANGOS PERSONALIZADOS
                console.log("ENTRO CON RANGOS EN: ", biom);

                biomarkerFound = true;

                if (biom.condition) {
                  ponderation = parseInt(biom.condition);
                }

                biom.ranges.forEach((range: any) => {
                  if (range.relevancy) {
                    if (range.relevancy == "both" && (biomarker.value <= range.LIM_INF || biomarker.value >= range.LIM_SUP)) {
                      isRelevant = true;
                    } else if (range.relevancy == "superior" && biomarker.value >= range.LIM_SUP) {
                      isRelevant = true;
                    } else if (range.relevancy == "inferior" && biomarker.value <= range.LIM_INF) {
                      isRelevant = true;
                    }

                    if (ponderation == 5 && isRelevant) {
                      console.log("PONDERACIÓN", ponderation);
                      if (!confirmedDiseases.map((el: any) => el = el.disease).includes(disease.id)) {
                        confirmedDiseases.push({ disease: disease.id, name: disease.name, value: biomarker.value, ponderation: ponderation });
                      } else {
                        confirmedDiseases.filter((el: any) => el.disease === disease.id)[0].value = confirmedDiseases.filter((el: any) => el.disease === disease.id)[0].value + "," + biomarker.value;
                      }

                      if (!relatedAnalysisBiomarkerFoundDiseasesWithValues.some((element: any) => element.disease == disease.id && element.value == element && element.ponderation == ponderation)) {
                        relatedAnalysisBiomarkerFoundDiseases.push(disease.id);
                        relatedAnalysisBiomarkerFoundDiseasesWithValues.push({ disease: disease.id, value: biomarker.value, ponderation: ponderation, testName: biomarker.name });
                      }

                    }

                    if (ponderation > 1 && ponderation < 5 && isRelevant) {
                      console.log("PONDERACIÓN", ponderation);

                      if (!relatedAnalysisBiomarkerFoundDiseasesWithValues.some((element: any) => element.disease == disease.id && element.value == element && element.ponderation == ponderation)) {
                        relatedAnalysisBiomarkerFoundDiseases.push(disease.id);
                        relatedAnalysisBiomarkerFoundDiseasesWithValues.push({ disease: disease.id, value: biomarker.value, ponderation: ponderation, testName: biomarker.name });
                      }
                    }

                    if (ponderation == 1 && isRelevant) {
                      console.log("PONDERACIÓN", ponderation);
                      if (!excludedDiseases.map((el: any) => el = el.disease).includes(disease.id)) {
                        excludedDiseases.push({ disease: disease.id, name: disease.name, testName: biomarker.name });
                      }
                    }
                  }

                });


              } else { // TRATAMIENTO NORMAL DEL ELEMENTO EN UNA ENFERMEDAD
                biomarkerFound = true;

                if (biom.condition) {
                  ponderation = parseInt(biom.condition);
                }

                if (biom.relevancy) {
                  if (biom.relevancy == "both" && (biomarker.status == "high" || biomarker.status == "low")) {
                    isRelevant = true;
                  } else if (biom.relevancy == "superior" && biomarker.status == "high") {
                    isRelevant = true;
                  } else if (biom.relevancy == "inferior" && biomarker.status == "low") {
                    isRelevant = true;
                  }
                }

                if (ponderation == 5 && isRelevant) {
                  console.log("PONDERACIÓN", ponderation);
                  if (!confirmedDiseases.map((el: any) => el = el.disease).includes(disease.id)) {
                    confirmedDiseases.push({ disease: disease.id, name: disease.name, value: biomarker.value, ponderation: ponderation });
                  } else {
                    confirmedDiseases.filter((el: any) => el.disease === disease.id)[0].value = confirmedDiseases.filter((el: any) => el.disease === disease.id)[0].value + "," + biomarker.value;
                  }

                  if (!relatedAnalysisBiomarkerFoundDiseasesWithValues.some((element: any) => element.disease == disease.id && element.value == element && element.ponderation == ponderation)) {
                    relatedAnalysisBiomarkerFoundDiseases.push(disease.id);
                    relatedAnalysisBiomarkerFoundDiseasesWithValues.push({ disease: disease.id, value: biomarker.value, ponderation: ponderation, testName: biomarker.name });
                  }

                }

                if (ponderation > 1 && ponderation < 5 && isRelevant) {
                  console.log("PONDERACIÓN", ponderation);

                  if (!relatedAnalysisBiomarkerFoundDiseasesWithValues.some((element: any) => element.disease == disease.id && element.value == element && element.ponderation == ponderation)) {
                    relatedAnalysisBiomarkerFoundDiseases.push(disease.id);
                    relatedAnalysisBiomarkerFoundDiseasesWithValues.push({ disease: disease.id, value: biomarker.value, ponderation: ponderation, testName: biomarker.name });
                  }
                }

                if (ponderation == 1 && isRelevant) {
                  console.log("PONDERACIÓN", ponderation);
                  if (!excludedDiseases.map((el: any) => el = el.disease).includes(disease.id)) {
                    excludedDiseases.push({ disease: disease.id, name: disease.name, testName: biomarker.name });
                  }
                }
              }
            }
          });
        }
      })
    }

    if (biomarkerFound) {
      analysisDiseases = analysisDiseases.concat(relatedAnalysisBiomarkerFoundDiseases);
      relatedAnalysisBiomarkerFoundDiseases = [...new Set([...analysisDiseases, ...relatedAnalysisBiomarkerFoundDiseases])]
      analysisDiseasesWithoutFrecuencies = [...new Set([...analysisDiseases, ...relatedAnalysisBiomarkerFoundDiseases])]
    }

    console.log(analysisDiseasesWithoutFrecuencies);


  }


  // IMAGEN
  let imageDiseases = <any>[];
  let imageDiseasesWithoutFrecuencies = <any>[];
  let relatedBiomarkerFoundDiseases = <any>[];
  let relatedBiomarkerFoundDiseasesWithValues = <any>[];

  for await (const biomarker of imageBiomarkers) {

    let biomarkerFound = false;

    // si biomarkerFound tengo que buscar en las enfermedades para ver qué elements son y comparar el value

    originalDiseases.forEach((disease: any) => {
      if (disease.imageBiomarkers) {
        disease.imageBiomarkers.forEach((biom: any) => {
          if (biom.id === biomarker.id) {
            biomarker.value.forEach((element: any) => {
              if (biom.values.includes(element)) {
                const index = biom.values.findIndex((el: any) => el === element);

                console.log("ENCONTRADO", element);

                biomarkerFound = true;

                if (biom.conditions) {
                  const ponderation = biom.conditions[index];

                  if (ponderation == 5) {
                    if (!confirmedDiseases.map((el: any) => el = el.disease).includes(disease.id)) {
                      confirmedDiseases.push({ disease: disease.id, name: disease.name, value: element, ponderation: ponderation });
                    } else {
                      confirmedDiseases.filter((el: any) => el.disease === disease.id)[0].value = confirmedDiseases.filter((el: any) => el.disease === disease.id)[0].value + "," + element;
                    }

                    if (!relatedBiomarkerFoundDiseasesWithValues.some((el: any) => el.disease == disease.id && el.value == element && el.ponderation == ponderation)) {
                      relatedBiomarkerFoundDiseases.push(disease.id);
                      relatedBiomarkerFoundDiseasesWithValues.push({ disease: disease.id, value: element, ponderation: ponderation, testName: biomarker.name });
                    }

                  }

                  if (ponderation > 1 && ponderation < 5) {
                    if (!relatedBiomarkerFoundDiseasesWithValues.some((el: any) => el.disease == disease.id && el.value == element && el.ponderation == ponderation)) {
                      relatedBiomarkerFoundDiseases.push(disease.id);
                      relatedBiomarkerFoundDiseasesWithValues.push({ disease: disease.id, value: element, ponderation: ponderation, testName: biomarker.name });
                    }
                  }

                  if (ponderation == 1) {
                    if (!excludedDiseases.map((el: any) => el = el.disease).includes(disease.id)) {
                      excludedDiseases.push({ disease: disease.id, name: disease.name, testName: biomarker.name });
                    }
                  }
                }
              }
            })
          }
        });
      }
    })

    if (biomarkerFound) {
      imageDiseases = imageDiseases.concat(relatedBiomarkerFoundDiseases);
      relatedBiomarkerFoundDiseases = [...new Set([...imageDiseases, ...relatedBiomarkerFoundDiseases])]
      imageDiseasesWithoutFrecuencies = [...new Set([...imageDiseases, ...relatedBiomarkerFoundDiseases])]
    }

    console.log(imageDiseasesWithoutFrecuencies);


  }

  // REPRODUCCION
  let reproductionDiseases = <any>[];
  let reproductionDiseasesWithoutFrecuencies = <any>[];
  let relatedReproBiomarkerFoundDiseases = <any>[];
  let relatedReproBiomarkerFoundDiseasesWithValues = <any>[];

  for await (const biomarker of reproductionBiomarkers) {
    console.log(biomarker, "biomarcador de imagen para evaluar enfermedades");

    const biomarkerData = imageTestsElements.find((element: any) => element.id === biomarker.id);
    console.log(biomarkerData, "datos del biomarcador");

    let biomarkerFound = false;

    // si biomarkerFound tengo que buscar en las enfermedades para ver qué elements son y comparar el value

    originalDiseases.forEach((disease: any) => {
      if (disease.imageBiomarkers) {
        disease.imageBiomarkers.forEach((biom: any) => {
          if (biom.id === biomarker.id) {
            console.log(biom.id, biomarker.id);
            console.log(biomarker);

            if (typeof biomarker.value == "string" || typeof biomarker.value == "number") {
              if (biom.values.includes(biomarker.value)) {
                console.log("SE ENCUENTRA EL VALOR", biomarker.value);
                const index = biom.values.findIndex((el: any) => el === biomarker.value);
                biomarkerFound = true;

                if (biom.conditions) {
                  const ponderation = biom.conditions[index];

                  if (ponderation == 5) {
                    if (!confirmedDiseases.map((el: any) => el = el.disease).includes(disease.id)) {
                      confirmedDiseases.push({ disease: disease.id, name: disease.name, value: biomarker.value, ponderation: ponderation });
                    } else {
                      confirmedDiseases.filter((el: any) => el.disease === disease.id)[0].value = confirmedDiseases.filter((el: any) => el.disease === disease.id)[0].value + "," + biomarker.value;
                    }
                    if (!relatedReproBiomarkerFoundDiseasesWithValues.some((element: any) => element.disease == disease.id && element.value == element && element.ponderation == ponderation)) {
                      relatedReproBiomarkerFoundDiseases.push(disease.id);
                      relatedReproBiomarkerFoundDiseasesWithValues.push({ disease: disease.id, value: biomarker.value, ponderation: ponderation, testName: biomarker.name });
                    }
                  }

                  if (ponderation > 1 && ponderation < 5) {
                    if (!relatedReproBiomarkerFoundDiseasesWithValues.some((element: any) => element.disease == disease.id && element.value == element && element.ponderation == ponderation)) {
                      relatedReproBiomarkerFoundDiseases.push(disease.id);
                      relatedReproBiomarkerFoundDiseasesWithValues.push({ disease: disease.id, value: biomarker.value, ponderation: ponderation, testName: biomarker.name });
                    }
                  }

                  if (ponderation == 1) {
                    if (!excludedDiseases.map((el: any) => el = el.disease).includes(disease.id)) {
                      excludedDiseases.push({ disease: disease.id, name: disease.name });
                    }
                  }
                }

              }
            } else {
              biomarker.value.forEach((element: any) => {
                console.log("VALOR DEL BIOMARCADOR DE REPRODUCCIÓN", element);

                if (biom.values.includes(element)) {
                  console.log("SE ENCUENTRA EL VALOR", element);
                  const index = biom.values.findIndex((el: any) => el === element);
                  biomarkerFound = true;

                  if (biom.conditions) {
                    const ponderation = biom.conditions[index];

                    if (ponderation == 5) {
                      if (!confirmedDiseases.map((el: any) => el = el.disease).includes(disease.id)) {
                        confirmedDiseases.push({ disease: disease.id, name: disease.name, value: element, ponderation: ponderation });
                      } else {
                        confirmedDiseases.filter((el: any) => el.disease === disease.id)[0].value = confirmedDiseases.filter((el: any) => el.disease === disease.id)[0].value + "," + element;
                      }
                      if (!relatedReproBiomarkerFoundDiseasesWithValues.some((el: any) => el.disease == disease.id && el.value == element && el.ponderation == ponderation)) {
                        relatedReproBiomarkerFoundDiseases.push(disease.id);
                        relatedReproBiomarkerFoundDiseasesWithValues.push({ disease: disease.id, value: element, ponderation: ponderation, testName: biomarker.name });
                      }
                    }

                    if (ponderation > 1 && ponderation < 5) {
                      if (!relatedReproBiomarkerFoundDiseasesWithValues.some((el: any) => el.disease == disease.id && el.value == element && el.ponderation == ponderation)) {
                        relatedReproBiomarkerFoundDiseases.push(disease.id);
                        relatedReproBiomarkerFoundDiseasesWithValues.push({ disease: disease.id, value: element, ponderation: ponderation, testName: biomarker.name });
                      }
                    }

                    if (ponderation == 1) {
                      if (!excludedDiseases.map((el: any) => el = el.disease).includes(disease.id)) {
                        excludedDiseases.push({ disease: disease.id, name: disease.name });
                      }
                    }
                  }

                }
              })
            }


          }
        });
      }
    })

    if (biomarkerFound) {
      reproductionDiseases = reproductionDiseases.concat(relatedReproBiomarkerFoundDiseases);
      relatedBiomarkerFoundDiseases = [...new Set([...reproductionDiseases, ...relatedReproBiomarkerFoundDiseases])]
      reproductionDiseasesWithoutFrecuencies = [...new Set([...reproductionDiseases, ...relatedReproBiomarkerFoundDiseases])]
    }
  }
  console.log(reproductionDiseases, "bruto de de enfermedades relacionadas con los biomarcadores positivos de reproduccion");


  console.log(reproductionDiseasesWithoutFrecuencies, "total de enfermedades relacionadas con los biomarcadores positivos de reproducción");

  // SIGNOS Y SÍNTOMAS
  let signsDiseases = <any>[];
  let signsDiseasesWithoutFrecuencies = <any>[];
  let relatedSignsFoundDiseases = <any>[];
  let relatedSignsFoundDiseasesWithValues = <any>[];

  if (history && history.signsAndSymptoms) {
    for await (const sign of history.signsAndSymptoms) {

      let biomarkerFound = false;

      originalDiseases.forEach((disease: any) => {
        if (disease.signsAndSymptoms) {
          disease.signsAndSymptoms.forEach((biom: any) => {
            if (biom.id === sign.id) {
              let ponderation = 0;

              biomarkerFound = true;
              if (biom.condition) {
                ponderation = biom.condition;
              }

              if (biom.ponderation) {
                ponderation = biom.ponderation;
              }

              if (ponderation == 5) {
                if (!confirmedDiseases.map((el: any) => el = el.disease).includes(disease.id)) {
                  confirmedDiseases.push({ disease: disease.id, name: disease.name, value: sign.name, ponderation: ponderation });
                } else {
                  confirmedDiseases.filter((el: any) => el.disease === disease.id)[0].value = confirmedDiseases.filter((el: any) => el.disease === disease.id)[0].value + "," + sign.name;
                }

                if (!relatedSignsFoundDiseasesWithValues.some((element: any) => element.disease == disease.id && element.value == element && element.ponderation == ponderation)) {
                  relatedSignsFoundDiseases.push(disease.id);
                  relatedSignsFoundDiseasesWithValues.push({ disease: disease.id, value: sign.name, ponderation: ponderation, testName: sign.name });
                }

              }

              if (ponderation > 1 && ponderation < 5) {
                if (!relatedSignsFoundDiseasesWithValues.some((element: any) => element.disease == disease.id && element.value == element && element.ponderation == ponderation)) {
                  relatedSignsFoundDiseases.push(disease.id);
                  relatedSignsFoundDiseasesWithValues.push({ disease: disease.id, value: sign.name, ponderation: ponderation, testName: sign.name });
                }
              }

              if (ponderation == 1) {
                if (!excludedDiseases.map((el: any) => el = el.disease).includes(disease.id)) {
                  excludedDiseases.push({ disease: disease.id, name: disease.name, testName: sign.name });
                }
              }

            }
          });
        }
      })

      if (biomarkerFound) {
        signsDiseases = signsDiseases.concat(relatedSignsFoundDiseases);
        relatedSignsFoundDiseases = [...new Set([...signsDiseases, ...relatedSignsFoundDiseases])]
        signsDiseasesWithoutFrecuencies = [...new Set([...signsDiseases, ...relatedSignsFoundDiseases])]
      }
    }

    console.log(signsDiseases, "bruto de de enfermedades relacionadas con los sintomas");
    console.log(signsDiseasesWithoutFrecuencies, "total de enfermedades relacionadas con los sintomas");
  }

  // 

  const diseasesAux = analysisDiseases.concat(imageDiseases).concat(signsDiseases).concat(reproductionDiseases);
  const diseasesWithoutFrecuencies = [...new Set([...analysisDiseases, ...imageDiseases, ...signsDiseases, ...reproductionDiseases])]
  console.log(diseasesWithoutFrecuencies, "RESULTADO FINAL");

  const resultAux = <any>[];
  diseasesWithoutFrecuencies.forEach(async dis => {
    console.log(dis);

    console.log(diseases.find((disease: any) => disease.id === dis));
    if (diseasesAux.find((disease: any) => disease.id === dis)) {
      const toBePushed = diseasesAux.find((disease: any) => disease.id === dis);
      toBePushed.values = [];
      toBePushed.ponderation = 0;
      relatedAnalysisBiomarkerFoundDiseasesWithValues.forEach((relAna: any) => { // ANÁLISIS
        if (relAna.disease === dis) {
          console.log(relAna, "REL-ANA");
          console.log(toBePushed, "DISEASE CON ANALISIS PARA VER PONDERACION");
          if (relAna.ponderation && relAna.ponderation > 2) {
            toBePushed.ponderation = toBePushed.ponderation + parseInt(relAna.ponderation);
          } else if (relAna.ponderation && relAna.ponderation == 2) {
            toBePushed.ponderation = toBePushed.ponderation - parseInt(relAna.ponderation);
          }
          toBePushed.values.push(`${relAna.testName}: ${relAna.value}`);
        }
      })
      relatedBiomarkerFoundDiseasesWithValues.forEach((rel: any) => {
        if (rel.disease === dis) {
          console.log(rel, "REL-IMAGE");
          if (rel.ponderation && rel.ponderation > 2) {
            toBePushed.ponderation = toBePushed.ponderation + parseInt(rel.ponderation);
          } else if (rel.ponderation && rel.ponderation == 2) {
            toBePushed.ponderation = toBePushed.ponderation - parseInt(rel.ponderation);
          }
          toBePushed.values.push(`${rel.testName}: ${rel.value}`);
        }
      });
      relatedReproBiomarkerFoundDiseasesWithValues.forEach((relRepro: any) => {
        if (relRepro.disease === dis) {
          console.log(relRepro, "REL-REPRO");
          toBePushed.values.push(`${relRepro.testName}: ${relRepro.value}`);
          if (relRepro.ponderation && relRepro.ponderation > 2) {
            toBePushed.ponderation = toBePushed.ponderation + parseInt(relRepro.ponderation);
          } else if (relRepro.ponderation && relRepro.ponderation == 2) {
            toBePushed.ponderation = toBePushed.ponderation - parseInt(relRepro.ponderation);
          }
        }
      });
      relatedSignsFoundDiseasesWithValues.forEach((relSign: any) => {
        if (relSign.disease === dis) {
          console.log(relSign, "REL-SIGN");
          console.log(toBePushed, "DISEASE CON SINTOMAS PARA VER PONDERACION");

          toBePushed.values.push(`Signo o síntoma: ${relSign.value}`);
          if (relSign.ponderation && relSign.ponderation > 2) {
            toBePushed.ponderation = toBePushed.ponderation + parseInt(relSign.ponderation);
          } else if (relSign.ponderation && relSign.ponderation == 2) {
            toBePushed.ponderation = toBePushed.ponderation - parseInt(relSign.ponderation);
          }
        }
      })

      resultAux.push(
        {
          id: toBePushed.id,
          name: toBePushed.name,
          values: toBePushed.values || [],
          ponderation: toBePushed.ponderation
        }
      );
    }

  })

  for await (const dis of excludedDiseases) {

    for await (const element of resultAux) {

      if (element.id == dis.disease) {

        const index = resultAux.findIndex((el: any) => el.id === element.id);

        if (index > -1) {
          resultAux.splice(index, 1);
        }
      }
    }
  }

  for await (const element of resultAux) {
    element.frequency = element.values.length;
  }


  for await (const confirmedDisease of confirmedDiseases) {
    for await (const element of resultAux) {
      if (element.id == confirmedDisease.disease) {
        element.confirmedFrequency = element.confirmedFrequency ? element.confirmedFrequency + 1 : 1;
      }
    }
  }

  // 4. Guardado y respuesta
  const result = {
    subjectId: id,
    diseases: resultAux || [],
    confirmedDiseases: confirmedDiseases,
    date: moment().format(),
    signsAndSymptoms: history && history.signsAndSymptoms ? history.signsAndSymptoms : [],
    imageBiomarkers: imageBiomarkers || [],
    reproductionBiomarkers: reproductionBiomarkers || [],
    analyticBiomarkers: analyticBiomarkers || [],
  }
  admin.firestore()
    .collection("assistantReports")
    .add(result)
    .then((doc) => {
      admin.firestore().doc(`assistantReports/${doc.id}/`).update({ id: doc.id })
        .then((success) => {
          response.send({ "create": "ok", "report": result, "id": doc.id });
        }).catch((error) => {
          response.status(500).send({ message: "No se ha podido crear el informe, inténtelo de nuevo", error: error })
        });
    }).catch((error) => {
      response.status(500).send({ message: "No se ha podido crear el informe, inténtelo de nuevo", error: error })
    });
});
*/

/**
 * 
 */

app.get("/sendDoctorInvitation", async (request, response) => { // OK
  const email = request.query.email;
  const clinicId = request.query.clinicId;

  let transporter = nodemailer.createTransport({
    host: "mail.radiewcare.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: "noreply@radiewcare.com", // generated ethereal user
      pass: "Braun_noreply", // generated ethereal password
    },
  });

  try {
    const info = await transporter.sendMail({
      from: '"RadiewCare" <noreply@radiewcare.com>', // sender address
      to: `${email}`, // list of receivers
      subject: "Invitación a One-Me", // Subject line
      text: `Has recibido una invitación a One-Me by RadiewCare, puedes registrarte en: https://one-me.radiewcare.com/register/${clinicId}`, // plain text body
      html: `Has recibido una invitación a One-Me by RadiewCare, puedes registrarte en: <a href='https://one-me.radiewcare.com/register/${clinicId}'>https://one-me.radiewcare.com/register/${clinicId}</a>`, // html body
    });
    response.status(200).send(JSON.stringify(info));
  } catch (error) {
    response.status(500).send(JSON.stringify({
      message: "Error al enviar email",
    }))
  }

});

/**
 * EXPORTACIÓN DE LA API COMO CLOUD FUNCTION
 */
export const api = functions.runWith({ memory: "512MB", timeoutSeconds: 180 }).region('europe-west3').https.onRequest(app);
