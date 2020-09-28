import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp(functions.config().firebase);

import * as express from "express";
import * as cors from "cors";


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

/**
 * ONE-ME BACKEND FUNCTIONS
 */

/**
 * importGeneticDataFromPromethease
 */
app.post("/importGeneticDataFromPromethease", async (request, response) => {
  const data = request.body.data;
  const subjectId = request.body.subjectId;
  /*
  const transformedData = [];

  for await (const varianteGenetica of data) {
    // Separamos el nombre de la variante
    const split = varianteGenetica.Name.split("(");
    // Descomponemos los alelos
    if (split.length > 1) {
      const alelo = split[1].substring(0, split[1].length - 1);
      const alelos = alelo.split(";");
      // Agregamos a la transformación de datos
      transformedData.push({
        geneticVariant: split[0],
        alleles: {
          father: alelos[0],
          mother: alelos[1]
        },
        frequency: varianteGenetica.Freq === null ? 0 : varianteGenetica.Freq,
        magnitude: varianteGenetica.Magnitude
      });
    } else {
      transformedData.push({
        geneticVariant: split[0],
        alleles: null,
        frequency: varianteGenetica.Freq === null ? 0 : varianteGenetica.Freq,
        magnitude: varianteGenetica.Magnitude
      });
    }
  }

  const arr1 = transformedData.slice(0, transformedData.length / 4);
  const arr2 = transformedData.slice(
    transformedData.length / 4,
    transformedData.length / 2
  );
  const arr3 = transformedData.slice(
    transformedData.length / 2,
    transformedData.length - transformedData.length / 4
  );
  const arr4 = transformedData.slice(
    transformedData.length - transformedData.length / 4
  );

  if (transformedData.length > 0) {
    await admin
      .firestore()
      .doc(`subjects/${subjectId}`)
      .update({ numberOfVariants: transformedData.length });
  }

  const promise1 = new Promise(async (resolve) => {
    for await (const element of arr1) {
      await admin
        .firestore()
        .collection(`subjects/${subjectId}/geneticData`)
        .add(element);
    }
    resolve();
  });
  const promise2 = new Promise(async (resolve) => {
    for await (const element of arr2) {
      await admin
        .firestore()
        .collection(`subjects/${subjectId}/geneticData`)
        .add(element);
    }
    resolve();
  });
  const promise3 = new Promise(async (resolve) => {
    for await (const element of arr3) {
      await admin
        .firestore()
        .collection(`subjects/${subjectId}/geneticData`)
        .add(element);
    }
    resolve();
  });
  const promise4 = new Promise(async (resolve) => {
    for await (const element of arr4) {
      await admin
        .firestore()
        .collection(`subjects/${subjectId}/geneticData`)
        .add(element);
    }
    resolve();
  });

  return Promise.all([promise1, promise2, promise3, promise4])
    .then((importResponse) => {
      // Crear notificación en el usuario (TO DO)
      response.send(importResponse);
    })
    .catch((error) => {
      // Crear notificación en el usuario (TO DO)
      response.send(error);
    });*/
  const importResponse = {
    data,
    subjectId,
  };

  response.send(importResponse);
});

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
app.post("/createSubject", (request, response) => {
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
});

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
