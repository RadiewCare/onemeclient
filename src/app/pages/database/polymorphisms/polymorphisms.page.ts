import { Component, OnInit, ViewChild } from "@angular/core";
import { Subscription } from "rxjs";
import { IonSearchbar } from "@ionic/angular";
import { PolymorphismsService } from "src/app/services/polymorphisms.service";

@Component({
  selector: "app-polymorphisms",
  templateUrl: "./polymorphisms.page.html",
  styleUrls: ["./polymorphisms.page.scss"]
})
export class PolymorphismsPage implements OnInit {
  @ViewChild("searchbar", { static: false }) searchBar: IonSearchbar;

  geneticVariants: any;
  queryVariants: any;

  geneticVariantsSub: Subscription;

  variantChecked = true;
  mutationChecked = true;

  listView = true;

  gridApi: any;

  columnDefs = [
    {
      headerName: "Name",
      field: "name"
    },
    {
      headerName: "Formal name",
      field: "formalName"
    },
    {
      headerName: "Genes",
      field: "genes"
    },
    {
      headerName: "Type",
      field: "type"
    },
    {
      headerName: "Chromosome",
      field: "chromosome"
    },
    {
      headerName: "Position",
      field: "position"
    }
  ];
  defaultColDef = {
    resizable: true,
    sortable: true,
    filter: true,
    minWidth: 100
  };
  constructor(private polymporphismsService: PolymorphismsService) {}

  ngOnInit() {}

  ionViewDidEnter() {
    this.getGeneticVariants();
    setTimeout(() => {
      this.searchBar.setFocus();
    }, 400);
  }

  getGeneticVariants() {
    this.geneticVariantsSub = this.polymporphismsService
      .getPolymorphisms()
      .subscribe((geneticVariants) => {
        this.geneticVariants = geneticVariants;
      });
  }

  onSearchChange(query: string) {
    if (query.length > 0) {
      this.queryVariants = this.geneticVariants.filter((variant) =>
        variant.name.toLowerCase().includes(query.toLowerCase())
      );
    } else {
      this.queryVariants = null;
    }
  }

  changeView(option: string) {
    option === "list" ? (this.listView = true) : (this.listView = false);
  }

  sizeToFit() {
    this.gridApi.sizeColumnsToFit();
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.sizeToFit();
  }

  ionViewWillLeave() {
    this.geneticVariantsSub.unsubscribe();
  }
}
