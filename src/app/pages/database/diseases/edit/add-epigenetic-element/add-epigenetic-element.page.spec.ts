import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddEpigeneticElementPage } from './add-epigenetic-element.page';

describe('AddEpigeneticElementPage', () => {
  let component: AddEpigeneticElementPage;
  let fixture: ComponentFixture<AddEpigeneticElementPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEpigeneticElementPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddEpigeneticElementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
