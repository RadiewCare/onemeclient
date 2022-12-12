import { Injectable } from "@angular/core";
import Typesense from 'typesense';
import Configuration, { NodeConfiguration, ConfigurationOptions } from '../../../node_modules/typesense/lib/Typesense/Configuration';

@Injectable({
    providedIn: "root"
})
export class TypesenseService {
    typeSense: any;
    constructor() 
        {
            // Create a client
            const typesense = new Typesense.Client({
                nodes: [
                  {
                    host: 'typesense.radiewcare-apps.es',
                    port: 8108,
                    protocol: 'https'
                  } as NodeConfiguration
                ],
                apiKey: '0tio1EwSATGTYjkJ6KuegITep2WsSpK8urJkTF2fF8CMU0gi',
                numRetries: 3, // A total of 4 tries (1 original try + 3 retries)
                connectionTimeoutSeconds: 10, // Set a longer timeout for large imports
                logLevel: 'debug'
              } as ConfigurationOptions);
            
            this.typeSense = typesense;
        }


}