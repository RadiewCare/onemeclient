import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const moment = require('moment');

admin.initializeApp(functions.config().firebase);

import * as express from "express";
import * as cors from "cors";

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

/*
Para poner en createSubjectDataValidation
  signsAndSymptoms: Joi.array().items(Joi.object({
    accessionNumber: Joi.number(),
    date: Joi.string(),
    id: Joi.string(),
    name: Joi.string()
  })),
  diseases: Joi.array().items(Joi.object({
    id: Joi.string(),
    name: Joi.string()
  }))
*/

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

  if (
    (request.headers.authorization !== quibimKey) &&
    (request.headers.authorization !== actualpacsKey)
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
  console.log(request.query);

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
  console.log(request.query);

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
  console.log(request.body.mainDoctor, "ID del doctor");


  admin.firestore().collection(`doctors`).where('id', '==', request.body.mainDoctor).get().then(async (doctores) => {
    console.log("válido");

    const doctors = doctores.docs;

    if (doctors.length > 0) {
      let found = false;
      let subjectId;

      await admin.firestore().collection(`subjects`).where('mainDoctor', '==', request.body.mainDoctor).get().then(async (sujetos) => {
        const subjects = sujetos.docs;
        for await (const subject of subjects) {
          if (subject.data().identifier.trim().toLowerCase() === request.body.identifier.trim().toLowerCase()) {
            found = true;
            subjectId = subject.data().id;
          }
        }
      });

      if (found) {
        response.status(500).send({ message: "El identificador del sujeto ya está en uso en el doctor dado", id: subjectId })
      } else {
        request.body.createdAt = moment().format();
        request.body.hasImageAnalysis = true;
        admin.firestore()
          .collection("subjects")
          .add(request.body)
          .then((doc) => {
            admin.firestore().doc(`subjects/${doc.id}`).update({ id: doc.id })
              .then((success) => {
                request.body.id = doc.id;
                response.send({ "create": "ok", "id": doc.id });
              }).catch(() => {
                response.status(500).send({ error: "No se ha podido actualizar el sujeto, inténtelo de nuevo" })
              });
          }).catch(() => {
            response.status(500).send({ error: "No se ha podido actualizar el sujeto, inténtelo de nuevo" })
          });
      }
    } else {
      response.status(500).send({ error: "El id del doctor no existe" })
    }
  }).catch(() => {
    response.status(500).send({ error: "Error al consultar los doctores" })
  })
});

app.put("/editSubject", (request, response) => { // OK
  console.log(request.body);

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
  console.log(request.query);

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
  console.log(request.body);
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
  console.log(request.body);
  request.body.updatedAt = moment().format();
  admin.firestore().doc(`subjectImageTests/${request.body.id}`).update(request.body)
    .then((subjectImageTest) => {
      response.send({ "update": "ok", "subjectImageTest": request.body });
    }).catch((error) => {
      response.status(500).send({ error: "No se ha podido actualizar la prueba" })
    });
});

app.delete("/deleteSubjectImageTest", (request, response) => { // OK
  console.log(request.query);

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
  console.log(request.body);

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

app.delete("/deleteSubjectClinicAnalysis", (request, response) => { // OK
  console.log(request.query);

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
 * EXPORTACIÓN DE LA API COMO CLOUD FUNCTION
 */
export const api = functions.region('europe-west3').https.onRequest(app);
