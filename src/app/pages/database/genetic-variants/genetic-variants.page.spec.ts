import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GeneticVariantsPage } from './genetic-variants.page';

describe('GeneticVariantsPage', () => {
  let component: GeneticVariantsPage;
  let fixture: ComponentFixture<GeneticVariantsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneticVariantsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GeneticVariantsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
