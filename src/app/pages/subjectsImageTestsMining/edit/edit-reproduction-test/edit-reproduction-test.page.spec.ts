import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EditReproductionTestPage } from './edit-reproduction-test.page';

describe('EditReproductionTestPage', () => {
  let component: EditReproductionTestPage;
  let fixture: ComponentFixture<EditReproductionTestPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditReproductionTestPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(EditReproductionTestPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
