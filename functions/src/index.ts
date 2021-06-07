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
  }),
}

/*const deleteSubjectDataValidation = {
  body: Joi.object({
    id: Joi.string()
      .required(),
    mainDoctor: Joi.string()
      .required(),
  }),
}*/

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

  if ((request.headers.authorization !== quibimKey) &&
    (request.headers.authorization !== actualpacsKey)) {
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
 * API
 */

/**
* LISTA LOS SUJETOS DE UN DOCTOR DADO POR ID
*/
app.post("/listSubjects", (request, response) => {
  console.log(request);

  admin.firestore().collection(`subjects`).where('doctorId', '==', request.body.doctorId).get()
    .then((subjects) => {
      response.send(subjects);
    }).catch(error => {
      response.send(error)
    })
});

/**
 * CREA UN SUJETO EN UN DOCTOR DADO POR ID
 */
/*app.post("/createSubject", (request, response) => {
  console.log(request);

  admin.firestore().collection(`subjects`).where('doctorId', '==', request.body.doctorId).get()
    .then(() => {
      admin.firestore().collection(`subjects`).add(request.body)
        .then((data) => {
          response.send(data);
        }).catch(error => {
          response.send(error)
        })
    }).catch((error) => {
      response.send(error)
    })
});*/

/**
 * AÑADE DATOS DE QUIBIM EN UNA PRUEBA DE IMAGEN
 */
app.post("/addQuibimDataToImageTest", (request, response) => {
  console.log(request);
  let subjectData;

  admin.firestore().doc(`subjects/${request.body.subjectId}`).get()
    .then((subject): any => {
      subjectData = subject.data()
      if (subjectData !== undefined) {
        // Copiar los test y añadir el quibimdata en la posición adecuada

        // Actualizar el sujeto con los nuevos datos
        admin.firestore().doc(`subjects/${request.body.subjectId}`).update(subjectData.imageTests)
          .then((data) => {
            response.send(data)
          }).catch((error) => {
            response.send(error);
          })
      } else {
        response.send({ status: "error", message: "El sujeto no existe" });
      }
    }).catch(error => {
      response.send(error);
    });
});

/**
 * 
 * 1 
 *  a) El radiólogo pulsa el botón de One-Me 
 *  b) Se le muestra la totalidad de las pruebas de imagen para seleccionar
 *  c) Elige una y recoge los biomarcadores de la prueba
 *  d) El radiólogo lo rellena en Actualpacs
 * 2 
 *  a) La guarda en su sistema y en One-Me
 */

app.get("/getImageTests", (request, response) => {
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

app.get("/getSubjectsFromDoctorId", (request, response) => {
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
          "imageTests": element.imageTests || null,
          "history": element.history || null,
          "hasImageAnalysis": element.hasImageAnalysis || null,
          "createdAt": element.createdAt || null,
          "updatedAt": element.updatedAt || null
        }
      })
      response.send({ "subjects": result });
    }).catch(error => {
      response.status(500).send(error);
    })
});

app.get("/getSubject", (request, response) => {
  console.log(request.query);

  admin.firestore().doc(`subjects/${request.query.subjectId}`).get()
    .then((data: any) => {
      let subject = data.data();

      const result = {
        "id": subject.id,
        "identifier": subject.identifier,
        "imageTests": subject.imageTests || null,
        "history": subject.history || null,
        "hasImageAnalysis": subject.hasImageAnalysis || null,
        "createdAt": subject.createdAt || null,
        "updatedAt": subject.updatedAt || null
      }
      response.send({ "subject": result });
    }).catch(error => {
      response.status(500).send(error);
    })
});


app.post("/createSubject", validate(createSubjectDataValidation, {}, {}), (request, response) => {
  console.log(request.body);

  admin.firestore().collection(`subjects`).where('mainDoctor', '==', request.body.mainDoctor).get().then(async (data) => {
    const subjects = data.docs;

    if (subjects.length > 0) {
      let found = false;

      let subjectId;

      for await (const subject of subjects) {
        if (subject.data().identifier.trim().toLowerCase() === request.body.identifier.trim().toLowerCase()) {
          found = true;
          subjectId = subject.data().id;
        }
      }

      if (found) {
        response.status(500).send({ message: "El identificador del sujeto ya está en uso en el doctor dado", id: subjectId })
      } else {
        request.body.createdAt = moment().format();
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
    response.status(500).send({ error: "Error al consultar los sujetos" })
  })
});

app.put("/editSubject", (request, response) => {
  console.log(request.body);

  admin.firestore().collection(`subjects`).where("mainDoctor", "==", request.body.mainDoctor).get().then((data) => {
    if (data.docs.length > 0) {
      admin.firestore().doc(`subjects/${request.body.id}`).update(request.body)
        .then((subject) => {
          response.send({ "update": "ok" });
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

app.delete("/deleteSubject", (request, response) => {
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

// Revisar
app.post("/addImageTestToSubject", (request, response) => {
  const imageTest = request.body.imageTest;

  // TO DO: Comprobar validez de los datos introducidos
  if (imageTest.imageTestId &&
    imageTest.name &&
    imageTest.values &&
    imageTest.accessionNumber &&
    imageTest.source) {

    // Realizar acciones
    admin.firestore().doc(`subjects/${request.body.subjectId}`).get()
      .then((data) => {
        const subjectData = data.data();
        let imageTests = [];

        if (subjectData !== undefined) {
          if (subjectData.hasImageAnalysis) {
            imageTests = subjectData.imageTests
          }

          // TO DO: Calcular status global, status de los values, shortcode y dates.

          // Date
          imageTest.date = "";

          // Shortcode
          imageTest.shortcode = "";

          imageTest.status = "negative"

          // Status de los values

          for (const index of imageTest.values) {
            let positivo = false;

            // Para opciones
            if (imageTest.type === "multiple" && imageTest.positiveOptions.includes(imageTest.values[index].value)) {
              positivo = true;
            }

            // Para rangos

            // Para booleans

            if (positivo) {
              imageTest.status = "positive" // Global
            }
          }

          imageTests.push(imageTest);

          admin.firestore().doc(`subjects/${request.body.subjectId}`).update({ imageTests: imageTests })
            .then(() => { response.send({ "imageTest": imageTest }) })
            .catch((error) => { response.status(500).send(error) });
        }
      })
      .catch((error) => { response.status(500).send(error) });
  }
});

/**
 * EXPORTACIÓN DE LA API COMO CLOUD FUNCTION
 */
// export const api = functions.region('europe-west3').https.onRequest(app);
