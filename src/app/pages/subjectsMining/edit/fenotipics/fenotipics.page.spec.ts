import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FenotipicsPage } from './fenotipics.page';

describe('FenotipicsPage', () => {
  let component: FenotipicsPage;
  let fixture: ComponentFixture<FenotipicsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FenotipicsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FenotipicsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
