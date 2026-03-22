import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';
import { NavbarComponent } from '../../../components/navbar/navbar.component';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './support.html',
  styleUrl: './support.css'
})
export class Support implements OnInit, OnDestroy {
  tickets: any[] = [];
  selectedTicket: any = null;
  replyMessage: string = '';

  // New Ticket Form
  showNewTicketModal = false;
  newSubject = '';
  newMessage = '';

  // Message Actions State
  replyingTo: any = null;

  private apiService = inject(ApiService);
  private location = inject(Location);
  private toast = inject(ToastService);
  private pollInterval: any;

  ngOnInit() {
    this.loadTickets();
    // Auto-refresh every 10 seconds for new messages
    this.pollInterval = setInterval(() => this.loadTickets(), 10000);
  }

  ngOnDestroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  goBack() {
    this.location.back();
  }

  loadTickets() {
    this.apiService.getMyTickets().subscribe({
      next: (res: any) => {
        this.tickets = res.data || [];
        if (this.selectedTicket) {
          this.selectedTicket = this.tickets.find(t => t._id === this.selectedTicket._id) || null;
        }
      }
    });
  }

  selectTicket(ticket: any) {
    this.selectedTicket = ticket;
    this.replyingTo = null;
    this.markAsRead(ticket);
    this.scrollToBottom();
  }

  public scrollToMessage(msgId: string) {
    if (!msgId) return;
    setTimeout(() => {
      const element = document.getElementById('msg-' + msgId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('highlight-pulse');
        setTimeout(() => element.classList.remove('highlight-pulse'), 2000);
      }
    }, 100);
  }

  private scrollToBottom() {
    setTimeout(() => {
      const container = document.querySelector('.messages-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }

  createTicket() {
    if (!this.newSubject || !this.newMessage) return;

    this.apiService.createTicket(this.newSubject, this.newMessage).subscribe({
      next: (res: any) => {
        this.showNewTicketModal = false;
        this.newSubject = '';
        this.newMessage = '';
        if (res.data) {
          this.selectedTicket = res.data;
        }
        this.loadTickets();
        this.toast.success('Ticket created successfully!');
      },
      error: () => this.toast.error('Failed to create ticket')
    });
  }

  sendReply() {
    if (!this.replyMessage.trim() || !this.selectedTicket) return;

    const replyId = this.replyingTo ? this.replyingTo._id : undefined;

    this.apiService.replyToTicket(this.selectedTicket._id, this.replyMessage, replyId).subscribe({
      next: (res: any) => {
        this.replyMessage = '';
        this.replyingTo = null;
        if (res.data) {
          this.selectedTicket = res.data;
        }
        this.scrollToBottom();
        this.loadTickets();
        this.toast.success('Message sent!');
      },
      error: (err: any) => this.toast.error('Failed to send message')
    });
  }

  // Delete Modal State
  showDeleteModal = false;
  deletingMsgId: string = '';

  confirmDelete(msgId: string) {
    this.deletingMsgId = msgId;
    this.showDeleteModal = true;
  }

  cancelDelete() {
    this.showDeleteModal = false;
    this.deletingMsgId = '';
  }

  doDelete(mode: 'everyone' | 'me') {
    if (!this.deletingMsgId || !this.selectedTicket) return;

    this.apiService.deleteMessage(this.selectedTicket._id, this.deletingMsgId, mode).subscribe({
      next: (res: any) => {
        if (res.data) {
          this.selectedTicket = res.data;
        }
        this.loadTickets();
        this.toast.success(mode === 'everyone' ? 'Message deleted for everyone' : 'Message deleted for you');
        this.cancelDelete();
      },
      error: (err: any) => {
        console.error(err);
        this.toast.error(err.error?.message || 'Failed to delete message');
        this.cancelDelete();
      }
    });
  }

  setReply(msg: any) {
    this.replyingTo = msg;
    // Focus input
    setTimeout(() => {
      const input = document.querySelector('.message-input-bar input') as HTMLInputElement;
      if (input) input.focus();
    }, 100);
  }

  // Helper to find message by ID for reply display
  getMsgById(id: any) {
    if (!id || !this.selectedTicket?.messages) return null;
    const searchId = id.toString();
    return this.selectedTicket.messages.find((m: any) => m._id.toString() === searchId);
  }

  trackByMessage(index: number, item: any) {
    return item._id;
  }

  // Unread tracking via localStorage
  private getReadCount(ticketId: string): number {
    const data = localStorage.getItem('support_read_' + ticketId);
    return data ? parseInt(data, 10) : 0;
  }

  private markAsRead(ticket: any) {
    if (!ticket?.messages) return;
    localStorage.setItem('support_read_' + ticket._id, ticket.messages.length.toString());
  }

  getUnreadCount(ticket: any): number {
    if (!ticket?.messages) return 0;
    const readCount = this.getReadCount(ticket._id);
    const total = ticket.messages.length;
    if (total <= readCount) return 0;
    // Count only admin messages in the unread portion
    const unreadMsgs = ticket.messages.slice(readCount);
    return unreadMsgs.filter((m: any) => m.sender === 'Admin' && !m.isDeleted).length;
  }

  getLastMessage(ticket: any): string {
    if (!ticket?.messages || ticket.messages.length === 0) return 'No messages yet';
    const lastMsg = ticket.messages[ticket.messages.length - 1];
    if (lastMsg.isDeleted) return 'This message was deleted';
    const prefix = lastMsg.sender === 'User' ? 'You: ' : 'Admin: ';
    const text = lastMsg.message;
    return prefix + (text.length > 35 ? text.substring(0, 35) + '...' : text);
  }
}
