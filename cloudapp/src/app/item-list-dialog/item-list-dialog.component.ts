import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-item-list-dialog',
  templateUrl: './item-list-dialog.component.html',
  styleUrls: ['./item-list-dialog.component.scss']
})
export class ItemListDialogComponent implements OnInit{
  chosenItem: string;

  constructor(
      public dialogRef: MatDialogRef<ItemListDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any)
  { }

  ngOnInit(): void {
    this.chosenItem = "0";
  }

  continueButtonClicked() {
    this.dialogRef.close(this.data.items[this.chosenItem]);
  }
}
