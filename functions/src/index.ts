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

app.post("/createGeneticReport", async (request, response) => { // OK
  request.body.createdAt = moment().format();
  console.log("create genetic");
  response.send({ "create": "ok" });

  /*
  for await (const element of request.body.data) {
    axios.post('https://couchdb.radiewcare-apps.es/genetic-data/',
      {
        "subjectId": element.subjectId,
        "#Reported": element["#Reported"],
        "ALoFT": element.ALoFT,
        "Affected Exon": element.body["Affected Exon"],
        "Alt": element.Alt,
        "Chr": element.Chr,
        "ClinVar Clinical Significance": element["ClinVar Clinical Significance"],
        "ClinVar Disease": element["ClinVar Disease"],
        "Comment": element.Comment,
        "Coordinate": element.Coordinate,
        "DEOGEN2": element["DEOGEN2"],
        "DG Prediction": element["DG Prediction"],
        "Exons Number": element["Exons Number"],
        "FATHMM": element["FATHMM"],
        "FATHMM-MKL": element["FATHMM-MKL"],
        "FATHMM-XF": element["FATHMM-XF"],
        "Gene": element.Gene,
        "Global review": element["Global review"],
        "HPO Term": element["HPO Term"],
        "ID dbSNP": element["ID dbSNP"],
        "LRT": element["LRT"],
        "MIM Number": element["MIM Number"],
        "Max Allele Freq": element["Max Allele Freq"],
        "Max Allele Freq Origin": element["Max Allele Freq Origin"],
        "Meta-LR": element["Meta-LR"],
        "Meta-SVM": element["Meta-SVM"],
        "Mutation Assesor": element["Mutation Assesor"],
        "Mutation Taster": element["Mutation Taster"],
        "OMIM Inheritance": element["OMIM Inheritance"],
        "OMIM Phenotype": element["OMIM Phenotype"],
        "PFAM Domain": element["PFAM Domain"],
        "PanelApp - Disease Group": element["PanelApp - Disease Group"],
        "PanelApp - Relevant Disorders": element["PanelApp - Relevant Disorders"],
        "Prediction": element["Prediction"],
        "Protein Effect": element["Protein Effect"],
        "Provean": element["Provean"],
        "Ref": element["Ref"],
        "RefSeq ID": element["RefSeq ID"],
        "Region": element["Region"],
        "SIFT": element["SIFT"],
        "SIFT 4G": element["SIFT 4G"],
        "Sample category": element["Sample category"],
        "Variant Type": element["Variant Type"],
        "Zygosity": element["Zygosity"],
        "c.Hgvs": element["c.Hgvs"],
        "p.Hgvs": element["p.Hgvs"]
      },
      {
        auth: {
          username: "api",
          password: "API_care2020"
        }
      })
  }

  admin.firestore()
    .collection("notifications")
    .add({
      subjectId: request.body.subjectId,
      mainDoctor: request.body.mainDoctor
    })
    .then((doc) => {
      admin.firestore().doc(`notifications/${doc.id}`).update({ id: doc.id })
        .then((success) => {
          response.send({ "create": "ok", "id": doc.id });
        }).catch(() => {
          response.status(500).send({ error: "No se ha podido crear" })
        });
    }).catch(() => {
      response.status(500).send({ error: "No se ha podido crear" })
    });
    */
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
/*
app.get("/createAssistantReport", (request, response) => { // OK
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

  let subjectDiseases = <any>[];
  let originalDiseases = <any>[];
  let diseasesList = <any>[];
  let exclusion = false;
  let selectedReport: any;
  let analyticStudy: any;
  let subjectAnaliticStudies = <any>[];
  let assistantReports: any;
  let combinedTests = <any>[];

  // FERTILIDAD
  let embryos: any;

  // ESTUDIO DE IMAGEN
  let imageTests: any;

  // ¿FILTROS? 
  let queryLabel: string;
  let queryCategory: string;
  let categories = <any>[];
  let labels = <any>[];
  let suggestedCategories: any;
  let suggestedLabels: any;
  let relatedCategories: any;
  let relatedLabels: any;
  let selectedCategories = <any>[];
  let selectedLabels = <any>[];
  let selectedCategoriesIds = <any>[];
  let selectedLabelsIds = <any>[];
  let originalImageTests: any;
  let originalReproductionTests: any;
  let imageTestsList = <any>[];
  let reproductionTests = <any>[];
  let excludedTests = <any>[];

  // BIOMARCADORES

  let imageBiomarkers = <any>[];
  let analyticBiomarkers = <any>[];
  let reproductionBiomarkers = <any>[];
  let confirmedDiseases = <any>[];
  let confirmedDiseasesList = <any>[];
  let excludedDiseases = <any>[];
  let excludedDiseaesList = <any>[];
  let isAdmin = false;

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
  // Categorías
  // Etiquetas 
  // Signos y síntomas
  // Enfermedades
  // Elementos de prueba de imagen
  // Elementos de analítica
  // 3. Coger datos del sujeto
  // subjectImageTests
  // reproductionTests
  // analyticStudy

  // Guardado

  const result = {
    subjectId: id,
    diseases: diseases || [],
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
      admin.firestore().doc(`assistantReports/${doc.id}`).update({ id: doc.id })
        .then((success) => {
          response.send({ "create": "ok", "report": result });
        }).catch(() => {
          response.status(500).send({ error: "No se ha podido crear el informe, inténtelo de nuevo" })
        });
    }).catch(() => {
      response.status(500).send({ error: "No se ha podido crear el informe, inténtelo de nuevo" })
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
