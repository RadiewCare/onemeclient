import { Injectable } from '@angular/core';
import { FirestoreService } from './classes/firestore-service';

@Injectable({
  providedIn: 'root'
})
export class SubjectImageTestsService extends FirestoreService {

  constructor() {
    super("subjectImageTests");
  }

}
