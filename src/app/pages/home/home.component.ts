import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeroComponent } from '../../components/hero/hero.component';
import { ServicesSectionComponent } from '../../components/services-section/services-section.component';
import { ProcessComponent } from '../../components/process/process.component';
import { TestimonialsComponent } from '../../components/testimonials/testimonials.component';
import { StatsComponent } from '../../components/stats/stats.component';
import { FaqComponent } from '../../components/faq/faq.component';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [
        CommonModule,
        NavbarComponent,
        HeroComponent,
        StatsComponent,
        ServicesSectionComponent,
        ProcessComponent,
        TestimonialsComponent,
        FaqComponent,
        FooterComponent
        // React Contact.js has Footer inside it (lines 56-71).
        // So if I include ContactComponent, I get Footer too?
        // Angular ContactComponent template line 56?
        // I didn't include Footer in ContactComponent HTML in Step 204 (Contact HTML). 
        // In React Contact.js, the footer was INSIDE the section.
        // I should add FooterComponent to ContactComponent or Home.
        // React Home.js puts Contact at the end.
        // React Contact.js HAS the footer inside it.
        // I removed it from ContactComponent HTML in my previous step? Let me check Step 204 content.
        // Yes, I ended with </section>. I didn't include the footer block.
        // I should add FooterComponent to Home or main layout.
        // I'll add FooterComponent to imports here and use it in template.
    ],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
    private http = inject(HttpClient); // Use direct http for test-connection as in React

    ngOnInit() {
        this.checkConnection();
    }

    checkConnection() {
        this.http.get('/api/auth/test-connection-placeholder').subscribe({
            next: (res) => console.log('Backend connection test:', res),
            error: (err) => console.log('Backend connection detected (even if 404):', err.status ? 'Connected' : 'Not Connected')
        });
    }
}
