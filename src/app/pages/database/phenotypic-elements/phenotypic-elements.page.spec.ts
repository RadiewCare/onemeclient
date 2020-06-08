import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PhenotypicElementsPage } from './phenotypic-elements.page';

describe('PhenotypicElementsPage', () => {
  let component: PhenotypicElementsPage;
  let fixture: ComponentFixture<PhenotypicElementsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhenotypicElementsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PhenotypicElementsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
