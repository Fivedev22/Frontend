import { Component, OnInit } from '@angular/core';
import { PaymentService } from '../../../../services/payment.service';
import { ReservationService } from '../../../../services/reservation.service';
import { IPayment } from '../../../../interfaces/payment.interface';
import { IReservation } from '../../../../interfaces/reservation.interface';
import { MatTableDataSource } from '@angular/material/table';

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

  constructor(
    private paymentService: PaymentService,
    private reservationService: ReservationService
  ) {}

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

  generateIncomeReport() {
    const incomeByProperty: {
      [propertyId: string]: { income: number; propertyName: string };
    } = {};
  
    for (const payment of this.payments) {
      const propertyId = payment.property.reference_number;
      const propertyName = payment.property.property_name;
      const initialPrice = parseFloat(payment.booking.starting_price);
      const discount = parseFloat(payment.booking_discount || '0');
      const amount = initialPrice - discount;
  
      if (propertyId) {
        if (incomeByProperty[propertyId]) {
          incomeByProperty[propertyId].income += amount;
        } else {
          incomeByProperty[propertyId] = { income: amount, propertyName };
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
      const amount = parseFloat(payment.payment_amount_total);

      if (paymentType) {
        if (incomeByPaymentType[paymentType]) {
          incomeByPaymentType[paymentType] += amount;
        } else {
          incomeByPaymentType[paymentType] = amount;
        }
      }
    }

    const incomeByPaymentTypeReportData = Object.entries(
      incomeByPaymentType
    ).map(([paymentType, income]) => ({ paymentType, income }));
    this.incomeReport2 =
      new MatTableDataSource(incomeByPaymentTypeReportData) || [];
  }

  generateClientIncomeReport() {
    const clientIncomes: { [clientName: string]: number } = {};

    for (const payment of this.payments) {
      const firstName = payment.client.name;
      const lastName = payment.client.last_name;
    const amount = parseFloat(payment.payment_amount_total);

      if (firstName && lastName) {
        const clientName = `${firstName} ${lastName}`;

        if (clientIncomes[clientName]) {
          clientIncomes[clientName] += amount;
        } else {
          clientIncomes[clientName] = amount;
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
      'MÃ¡s de 2 semanas': 0,
      '1 mes': 0,
    };

    for (const payment of this.payments) {
      const checkInDate = new Date(payment.booking.check_in_date);
      const checkOutDate = new Date(payment.booking.check_out_date);

      if (checkInDate && checkOutDate) {
        const duration = this.calculateDuration(checkInDate, checkOutDate);
        const amount = parseFloat(payment.payment_amount_total);

        if (duration && durations.hasOwnProperty(duration)) {
          durations[duration] += amount;
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