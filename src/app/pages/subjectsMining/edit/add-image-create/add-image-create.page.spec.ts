import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddImageCreatePage } from './add-image-create.page';

describe('AddImageCreatePage', () => {
  let component: AddImageCreatePage;
  let fixture: ComponentFixture<AddImageCreatePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddImageCreatePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddImageCreatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
