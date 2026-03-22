import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-faq',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './faq.component.html',
    styleUrls: ['./faq.component.css']
})
export class FaqComponent {
    faqs = [
        {
            question: 'How do I apply for a Learner License?',
            answer: 'You can apply for a Learner License by navigating to the "Services" section, selecting "New Learner License", and filling out the online application form.',
            isOpen: false
        },
        {
            question: 'What documents are required for vehicle registration?',
            answer: 'Typically, you need proof of identity, proof of address, sale certificate, valid insurance, and PUC certificate. Check the specific service page for a detailed list.',
            isOpen: false
        },
        {
            question: 'How can I check my application status?',
            answer: 'You can log in to your account and visit the "My Applications" section to track the real-time status of your request.',
            isOpen: false
        },
        {
            question: 'Is the online payment secure?',
            answer: 'Yes, we use a government-approved secure payment gateway for all transaction types.',
            isOpen: false
        },
        {
            question: 'What should I do if I fail the driving test?',
            answer: 'If you fail, you can re-apply for a test slot after 7 days from the date of failure.',
            isOpen: false
        }
    ];

    toggleFaq(index: number) {
        this.faqs[index].isOpen = !this.faqs[index].isOpen;
        // Optional: Close others when one is opened
        // this.faqs.forEach((faq, i) => {
        //   if (i !== index) faq.isOpen = false;
        // });
    }
}
