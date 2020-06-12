import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp(functions.config().firebase);

import * as express from "express";
import * as cors from "cors";

/**
 * MIDDLEWARE
 */
const auth = (
  request: express.Request,
  response: express.Response,
  next: any
) => {
  if (request.headers.authorization !== "openapi") {
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
    subjectId
  };

  response.send(importResponse);
});

/**
 * ACTUALPACS API
 */

/**
 * createSubjectFromPacs
 */
app.post("/createSubjectFromPacs", (request, response) => {
  response.send("from pacs");
});

/**
 * EXPORTACIÓN DE LA API
 */
export const api = functions.https.onRequest(app);
