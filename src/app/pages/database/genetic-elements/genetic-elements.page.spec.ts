import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GeneticElementsPage } from './genetic-elements.page';

describe('GeneticElementsPage', () => {
  let component: GeneticElementsPage;
  let fixture: ComponentFixture<GeneticElementsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneticElementsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GeneticElementsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
