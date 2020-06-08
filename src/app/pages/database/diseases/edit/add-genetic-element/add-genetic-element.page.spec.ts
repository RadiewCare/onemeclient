import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddGeneticElementPage } from './add-genetic-element.page';

describe('AddGeneticElementPage', () => {
  let component: AddGeneticElementPage;
  let fixture: ComponentFixture<AddGeneticElementPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddGeneticElementPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddGeneticElementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
