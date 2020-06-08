import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddPhenotypicElementPage } from './add-phenotypic-element.page';

describe('AddPhenotypicElementPage', () => {
  let component: AddPhenotypicElementPage;
  let fixture: ComponentFixture<AddPhenotypicElementPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddPhenotypicElementPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddPhenotypicElementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
