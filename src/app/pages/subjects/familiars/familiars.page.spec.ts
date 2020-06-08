import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FamiliarsPage } from './familiars.page';

describe('FamiliarsPage', () => {
  let component: FamiliarsPage;
  let fixture: ComponentFixture<FamiliarsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FamiliarsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FamiliarsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
