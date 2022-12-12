import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddReproductionTechniquePage } from './add-reproduction-technique.page';

describe('AddReproductionTechniquePage', () => {
  let component: AddReproductionTechniquePage;
  let fixture: ComponentFixture<AddReproductionTechniquePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddReproductionTechniquePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddReproductionTechniquePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
