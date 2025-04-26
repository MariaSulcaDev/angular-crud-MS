import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/interfaces/product';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { SaveProductDlgComponent } from '../save-product-dlg/save-product-dlg.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-product-home',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule
  ],
  templateUrl: './product-home.component.html',
  styleUrl: './product-home.component.scss'
})
export class ProductHomeComponent implements OnInit {
  columns: string[] = ['image', 'name', 'description', 'currency', 'price', 'state', 'action'];
  dataSource: Product[] = [];

  // Filter properties
  nameFilter: string = '';
  stateFilter: string = '';
  currencyFilter: string = '';

  // State options según la documentación de la API
  states: string[] = ['DRAFT', 'PUBLISHED'];

  // Currency options según la documentación de la API
  currencies: string[] = ['PEN', 'USD'];

  // For search input debounce
  private searchSubject = new Subject<string>();

  productService = inject(ProductService);
  private dialog = inject(MatDialog);
  private snackbar = inject(MatSnackBar);

  ngOnInit(): void {
    this.getAll();

    // Set up debounced search
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.nameFilter = searchTerm;
      this.applyFilters();
    });

    console.log('Estados disponibles:', this.states);
    console.log('Monedas disponibles:', this.currencies);
  }

  getAll(): void {
    this.productService.getAll().subscribe(res => {
      console.log('Api response:', res.data);
      this.dataSource = res.data;
    });
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    // objeto de filtros
    const filters: any = {};

    if (this.nameFilter) {
      filters.name = this.nameFilter;
    }

    if (this.stateFilter) {
      filters.state = this.stateFilter;
    }

    if (this.currencyFilter) {
      filters.currency_code = this.currencyFilter;
    }

    console.log('Aplicando filtros:', filters);

    // metododel service con los filtros
    this.productService.getAll(filters).subscribe(res => {
      this.dataSource = res.data;
    });
  }

  clearFilters(): void {
    this.nameFilter = '';
    this.stateFilter = '';
    this.currencyFilter = '';
    this.getAll();
  }

  openProductDlg(product?: Product): void {
    const dialogRef = this.dialog.open(SaveProductDlgComponent, {
      width: '500px',
      data: product
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.getAll();
      }
    });
  }

  inactiveProduct(id: number) {
    this.productService.inactive(id).subscribe(res => {
      if (res.status) {
        this.getAll();
        this.snackbar.open('Se inactivo el producto', 'Aceptar');
      }
    });
  }
}
