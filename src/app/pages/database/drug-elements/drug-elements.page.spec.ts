import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DrugElementsPage } from './drug-elements.page';

describe('DrugElementsPage', () => {
  let component: DrugElementsPage;
  let fixture: ComponentFixture<DrugElementsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DrugElementsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DrugElementsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
