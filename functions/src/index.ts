import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp(functions.config().firebase);

import * as express from "express";
import * as cors from "cors";

const { validate, ValidationError, Joi } = require('express-validation');

const createSubjectDataValidation = {
  body: Joi.object({
    subjectId: Joi.string()
      .required(),
    mainDoctor: Joi.string()
      .required(),
  }),
}

const editSubjectDataValidation = {
  body: Joi.object({
    subjectId: Joi.string()
      .required(),
  }),
}

const deleteSubjectDataValidation = {
  body: Joi.object({
    subjectId: Joi.string()
      .required(),
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

app.use(function (error: any, request: any, response: any, next: any) {
  if (error instanceof ValidationError) {
    return response.status(error.statusCode).json(error)
  }
  return response.status(500).json(error)
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
          "imageTests": element.imageTests || null
        }
      })
      response.send({ "subjects": result });
    }).catch(error => {
      response.status(500).send(error)
    })
});

app.post("/createSubject", validate(createSubjectDataValidation, {}, {}), (request, response) => {
  admin.firestore().collection(`subjects`).add(request.body)
    .then((data) => {
      response.send({ "subject": data });
    }).catch((error) => {
      response.status(500).send(error)
    });
});

app.post("/editSubject", validate(editSubjectDataValidation, {}, {}), (request, response) => {
  admin.firestore().doc(`subjects/${request.body.subjectId}`).update(request.body)
    .then((data) => {
      response.send({ "subject": data });
    }).catch((error) => {
      response.status(500).send(error)
    });
});

app.post("/deleteSubject", validate(deleteSubjectDataValidation, {}, {}), (request, response) => {
  admin.firestore().doc(`subjects/${request.body.subjectId}`)
    .delete().then(() => {
      response.send({ "delete": "ok" });
    }).catch((error) => {
      response.status(500).send(error)
    });
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
export const api = functions.region('europe-west3').https.onRequest(app);
