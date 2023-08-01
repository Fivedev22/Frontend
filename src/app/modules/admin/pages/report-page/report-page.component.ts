import { Component, OnInit } from '@angular/core';
import { PaymentService } from '../../../../services/payment.service';
import { IPayment } from '../../../../interfaces/payment.interface';
import { IReservation } from '../../../../interfaces/reservation.interface';
import { MatTableDataSource } from '@angular/material/table';
import * as XLSX from 'xlsx';



@Component({
  selector: 'app-report-page',
  templateUrl: './report-page.component.html',
  styleUrls: ['./report-page.component.css'],
})
export class ReportPageComponent implements OnInit {
  payments!: IPayment[];
  unpaidPayments!: IPayment[];
  reservations!: IReservation[];
  incomeReport!: MatTableDataSource<any>;
  incomeReport2!: MatTableDataSource<any>;
  clientIncomeReport!: MatTableDataSource<any>;
  displayedColumns: string[] = ['propertyId', 'propertyName', 'income'];
  displayedColumns2: string[] = ['paymentType', 'income'];
  displayedColumns3: string[] = ['clientName', 'income'];
  incomeReport3!: MatTableDataSource<any>;
  displayedColumns4: string[] = ['duration', 'income'];

  constructor(private paymentService: PaymentService) {}

  ngOnInit() {
    this.paymentService.findAllPaymentsPaid().subscribe(
      (payments) => {
        this.payments = payments;
        this.generateIncomeReport();
        this.generateIncomeByPaymentTypeReport();
        this.generateClientIncomeReport();
        this.generateDurationIncomeReport();
      },
      (error) => {
        console.error('Error al obtener los pagos:', error);
      }
    );
  }


  downloadTableAsExcel(tableData: any[], columns: string[], fileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(tableData, { header: columns });
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const downloadLink = document.createElement('a');
    const url = window.URL.createObjectURL(data);
    downloadLink.href = url;
    downloadLink.download = fileName + '.xlsx';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    window.URL.revokeObjectURL(url);
  }

  

  generateIncomeReport() {
    const incomeByProperty: {
      [propertyId: string]: { income: number; propertyName: string };
    } = {};

    for (const payment of this.payments) {
      const propertyId = payment.property.reference_number;
      const propertyName = payment.property.property_name;
      const initialPrice = parseFloat(payment.booking.starting_price);
      const discount = parseFloat(payment.booking_discount || '0');
      const discountedAmount = initialPrice - initialPrice * (discount / 100);

      if (propertyId) {
        if (incomeByProperty[propertyId]) {
          incomeByProperty[propertyId].income += discountedAmount;
        } else {
          incomeByProperty[propertyId] = {
            income: discountedAmount,
            propertyName,
          };
        }
      }
    }

    const incomeReportData = Object.entries(incomeByProperty).map(
      ([propertyId, { income, propertyName }]) => ({
        propertyId,
        propertyName,
        income,
      })
    );
    this.incomeReport = new MatTableDataSource(incomeReportData) || [];
  }

  generateIncomeByPaymentTypeReport() {
    const incomeByPaymentType: { [paymentType: string]: number } = {};

    for (const payment of this.payments) {
      const paymentType = payment.payment_type.payment_type_name;
      const startingPrice = parseFloat(payment.booking.starting_price);
      const discount = parseFloat(payment.booking_discount || '0');
      const discountedAmount = startingPrice - startingPrice * (discount / 100);

      if (paymentType) {
        if (incomeByPaymentType[paymentType]) {
          incomeByPaymentType[paymentType] += discountedAmount;
        } else {
          incomeByPaymentType[paymentType] = discountedAmount;
        }
      }
    }

    const incomeByPaymentTypeReportData = Object.entries(
      incomeByPaymentType
    ).map(([paymentType, income]) => ({
      paymentType,
      income,
    }));
    this.incomeReport2 =
      new MatTableDataSource(incomeByPaymentTypeReportData) || [];
  }

  generateClientIncomeReport() {
    const clientIncomes: { [clientName: string]: number } = {};

    for (const payment of this.payments) {
      const firstName = payment.client.name;
      const lastName = payment.client.last_name;
      const startingPrice = parseFloat(payment.booking.starting_price);
      const discount = parseFloat(payment.booking_discount || '0');
      const discountedAmount = startingPrice - startingPrice * (discount / 100);

      if (firstName && lastName) {
        const clientName = `${firstName} ${lastName}`;

        if (clientIncomes[clientName]) {
          clientIncomes[clientName] += discountedAmount;
        } else {
          clientIncomes[clientName] = discountedAmount;
        }
      }
    }

    const clientIncomeReportData = Object.entries(clientIncomes).map(
      ([clientName, income]) => ({ clientName, income })
    );
    this.clientIncomeReport =
      new MatTableDataSource(clientIncomeReportData) || [];
  }

  generateDurationIncomeReport() {
    const durations: { [key: string]: number } = {
      'Menos de una semana': 0,
      '1 semana': 0,
      '2 semanas': 0,
      'Más de 2 semanas': 0,
      '1 mes': 0,
    };

    for (const payment of this.payments) {
      const checkInDate = new Date(payment.booking.check_in_date);
      const checkOutDate = new Date(payment.booking.check_out_date);

      if (checkInDate && checkOutDate) {
        const duration = this.calculateDuration(checkInDate, checkOutDate);
        const startingPrice = parseFloat(payment.booking.starting_price);
        const discount = parseFloat(payment.booking_discount || '0');
        const discountedAmount =
          startingPrice - startingPrice * (discount / 100);

        if (duration && durations.hasOwnProperty(duration)) {
          durations[duration] += discountedAmount;
        }
      }
    }

    const durationIncomeReportData = Object.entries(durations).map(
      ([duration, income]) => ({ duration, income })
    );
    this.incomeReport3 = new MatTableDataSource(durationIncomeReportData) || [];
  }

  calculateDuration(checkInDate: Date, checkOutDate: Date): string {
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const diff = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    const duration = Math.round(diff / millisecondsPerDay);

    if (duration < 7) {
      return 'Menos de una semana';
    } else if (duration < 14) {
      return '1 semana';
    } else if (duration < 21) {
      return '2 semanas';
    } else if (duration < 28) {
      return '3 semanas';
    } else {
      return '1 mes';
    }
  }
}
