import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SynlabCatalogPage } from './synlab-catalog.page';

describe('SynlabCatalogPage', () => {
  let component: SynlabCatalogPage;
  let fixture: ComponentFixture<SynlabCatalogPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SynlabCatalogPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SynlabCatalogPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
