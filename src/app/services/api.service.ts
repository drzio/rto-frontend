import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);
  private apiUrl = `${this.configService.apiUrl}/applications`;

  getPublicStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/public/stats`);
  }

  submitApplication(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/apply`, data);
  }

  bookSlot(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/book-slot`, data);
  }

  submitExam(data: any): Observable<any> {
    return this.http.post(`${this.configService.apiUrl}/user/exam/submit`, data);
  }




  getMyApplications(): Observable<any> {
    return this.http.get(`${this.apiUrl}/my-applications`);
  }

  getLLDetails(llNo: string, dob?: string): Observable<any> {
    let url = `${this.apiUrl}/ll-details/${encodeURIComponent(llNo)}`;
    if (dob) {
      url += `?dob=${dob}`;
    }
    return this.http.get(url);
  }

  getDLDetails(dlNo: string, dob?: string): Observable<any> {
    let url = `${this.apiUrl}/dl-details/${encodeURIComponent(dlNo)}`;
    if (dob) {
      url += `?dob=${dob}`;
    }
    return this.http.get(url);
  }

  getSlotAvailability(): Observable<any> {
    return this.http.get(`${this.apiUrl}/slots/availability`);
  }

  getPublicContent(key: string): Observable<any> {
    return this.http.get(`${this.configService.apiUrl}/user/public/config/${key}`);
  }

  getContent(key: string): Observable<any> {
    return this.http.get(`${this.configService.apiUrl}/user/config/${key}`);
  }


  getHolidays(): Observable<any> {
    return this.http.get(`${this.configService.apiUrl}/user/config/holidays/all`);
  }

  submitDrivingTestResult(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/driving-test/submit`, data);
  }

  submitExamResult(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/exam/submit`, data);
  }

  retakeExam(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/retake-exam`, data);
  }

  getExamQuestions(): Observable<any> {
    return this.http.get(`${this.configService.apiUrl}/user/exam/questions`);
  }

  // Mobile Update
  sendUpdateMobileOtp(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/update-mobile/send-otp`, data);
  }

  verifyUpdateMobileOtp(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/update-mobile/verify-otp`, data);
  }

  downloadLicense(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download-license/${id}`, { responseType: 'blob' });
  }

  // Support
  createTicket(subject: string, message: string): Observable<any> {
    return this.http.post(`${this.configService.apiUrl}/support/create`, { subject, message });
  }

  getMyTickets(): Observable<any> {
    return this.http.get(`${this.configService.apiUrl}/support/my-tickets`);
  }

  replyToTicket(id: string, message: string, replyTo?: string): Observable<any> {
    return this.http.post(`${this.configService.apiUrl}/support/${id}/message`, { message, replyTo });
  }

  deleteMessage(ticketId: string, messageId: string, mode: string = 'everyone'): Observable<any> {
    return this.http.delete(`${this.configService.apiUrl}/support/${ticketId}/message/${messageId}?mode=${mode}`);
  }
  payApplicationFee(applicationId: string): Observable<any> {
    return this.http.post(`${this.configService.apiUrl}/payment/pay`, { applicationId });
  }

  downloadApplicationForm(data: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/print-form`, data, { responseType: 'blob' });
  }

  downloadApplicationReceipt(data: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/print-receipt`, data, { responseType: 'blob' });
  }
}
