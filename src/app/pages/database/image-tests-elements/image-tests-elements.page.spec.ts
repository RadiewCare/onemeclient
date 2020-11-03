import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ImageTestsElementsPage } from './image-tests-elements.page';

describe('ImageTestsElementsPage', () => {
  let component: ImageTestsElementsPage;
  let fixture: ComponentFixture<ImageTestsElementsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageTestsElementsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ImageTestsElementsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
