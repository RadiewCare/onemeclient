import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TemplatesPage } from './templates.page';

describe('TemplatesPage', () => {
  let component: TemplatesPage;
  let fixture: ComponentFixture<TemplatesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TemplatesPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TemplatesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
