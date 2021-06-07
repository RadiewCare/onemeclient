import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GeneticsPage } from './genetics.page';

describe('GeneticsPage', () => {
  let component: GeneticsPage;
  let fixture: ComponentFixture<GeneticsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneticsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GeneticsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
