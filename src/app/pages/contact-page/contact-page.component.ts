import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // For ngClass check
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-contact-page',
    standalone: true,
    imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
    templateUrl: './contact-page.component.html',
    styleUrls: ['./contact-page.component.css']
})
export class ContactPageComponent implements OnInit {
    private toastService = inject(ToastService);

    ngOnInit() {
        window.scrollTo(0, 0);
    }

    handleSubmit() {
        this.toastService.success("Thank you for contacting us. We will get back to you soon!");
    }
}
