import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-slot-booking',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './slot-booking.component.html',
    styleUrl: './slot-booking.component.css'
})
export class SlotBookingComponent implements OnInit {
    eligibleApp: any = null;
    selectedDate: string = '';
    selectedTimeSlot: string = '';
    loading = true;
    booking = false;
    slots: any = {};
    calendarDays: any[] = [];
    selectedDateObj: any = null;

    private apiService = inject(ApiService);
    private router = inject(Router);
    private toastService = inject(ToastService);

    capacity = 50; // Default
    holidays: string[] = []; // Store holiday dates "YYYY-MM-DD"

    ngOnInit() {
        this.fetchCapacity();
        this.fetchHolidays();
        this.fetchApplications();
    }

    fetchCapacity() {
        this.apiService.getContent('slot_capacity').subscribe({
            next: (res: any) => {
                if (res.success && res.value) {
                    this.capacity = parseInt(res.value, 10) || 50;
                    if (this.slots) this.generateCalendar();
                }
            },
            error: () => console.error('Failed to load capacity')
        });
    }

    fetchHolidays() {
        this.apiService.getHolidays().subscribe({
            next: (res: any) => {
                if (res.success) {
                    // Extract date strings
                    this.holidays = res.data.map((h: any) => new Date(h.date).toISOString().split('T')[0]);
                    if (this.slots) this.generateCalendar();
                }
            },
            error: () => console.error('Failed to load holidays')
        });
    }

    fetchApplications() {
        this.apiService.getMyApplications().subscribe({
            next: (res: any) => {
                if (res.success) {
                    this.eligibleApp = res.data.find((app: any) => app.status === 'Eligible for Slot Booking');
                    if (this.eligibleApp) {
                        this.fetchSlotAvailability();
                    }
                }
                this.loading = false;
            },
            error: (err: any) => {
                console.error('Error fetching apps:', err);
                this.loading = false;
            }
        });
    }

    fetchSlotAvailability() {
        this.apiService.getSlotAvailability().subscribe({
            next: (res: any) => {
                if (res.success) {
                    this.slots = res.data; // { "YYYY-MM-DD": count }
                    this.generateCalendar();
                }
            },
            error: (err: any) => console.error(err)
        });
    }

    generateCalendar() {
        const today = new Date();
        const days = [];

        for (let i = 1; i <= 30; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);

            const dateStr = d.toISOString().split('T')[0];
            const isSunday = d.getDay() === 0;
            const bookedCount = this.slots[dateStr] || 0;
            const isHoliday = this.holidays.includes(dateStr);

            let status = 'available';
            if (isSunday || isHoliday) status = 'holiday';
            else if (bookedCount >= this.capacity) status = 'full';

            days.push({
                date: dateStr,
                day: d.getDate(),
                weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
                status: status,
                slotsLeft: (isSunday || isHoliday) ? 0 : this.capacity - bookedCount
            });
        }
        this.calendarDays = days;
    }

    selectDate(day: any) {
        if (day.status !== 'available') return;
        this.selectedDate = day.date;
        this.selectedDateObj = day;
        this.selectedTimeSlot = ''; // Reset time slot on date change
    }

    selectTimeSlot(slot: string) {
        this.selectedTimeSlot = slot;
    }

    confirmBooking() {
        if (!this.selectedDate) {
            this.toastService.error('Please select a date');
            return;
        }

        // Strict Date Validation
        const selected = new Date(this.selectedDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time for comparison

        const maxDate = new Date();
        maxDate.setDate(today.getDate() + 30);

        if (selected < today) {
            this.toastService.error('Cannot book a slot in the past.');
            return;
        }
        if (selected > maxDate) {
            this.toastService.error('Booking allowed only for the next 30 days.');
            return;
        }

        if (!this.selectedTimeSlot) {
            this.toastService.error('Please select a time slot');
            return;
        }

        this.booking = true;
        this.apiService.bookSlot({
            applicationId: this.eligibleApp._id,
            testDate: this.selectedDate,
            timeSlot: this.selectedTimeSlot
        }).subscribe({
            next: (res: any) => {
                this.toastService.success('Slot Booked Successfully!');
                this.downloadReceipt(this.eligibleApp._id);
                // Optionally navigate after download, or just show success state
                setTimeout(() => {
                    this.router.navigate(['/dashboard']);
                }, 2000);
            },
            error: (err: any) => {
                console.error('Booking Error:', err);
                this.toastService.error(err.error?.message || 'Failed to book slot.');
                this.booking = false;
            }
        });
    }

    downloadReceipt(appId: string) {
        this.apiService.downloadApplicationReceipt({ applicationId: appId }).subscribe({
            next: (blob: Blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Receipt-${this.eligibleApp.applicationNo}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            },
            error: (err) => console.error("Receipt Download Error", err)
        });
    }

    get formattedAppId(): string {
        if (this.eligibleApp && this.eligibleApp._id) {
            return String(this.eligibleApp._id).slice(18, 24).toUpperCase();
        }
        return 'N/A';
    }
}
