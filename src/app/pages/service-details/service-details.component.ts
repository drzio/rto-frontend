import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
    selector: 'app-service-details',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './service-details.component.html',
    styleUrls: ['./service-details.component.css']
})
export class ServiceDetailsComponent implements OnInit {
    serviceId: string | null = null;
    service: any = null;

    private route = inject(ActivatedRoute);

    // Mock Database - should be shared service in real app
    servicesData: any = {
        'learner-license': {
            title: 'Learner License',
            description: 'Apply for a new Learner License to start your driving journey.',
            requirements: [
                'Proof of Address (Aadhaar / Voter ID / Passport)',
                'Proof of Age (School LC / Birth Certificate)',
                'Passport Size Photograph',
                'Form 1 (Physical Fitness Declaration)',
                'Form 1A (Medical Certificate) [If age > 40]'
            ],
            process: [
                'Fill online application (Form 2)',
                'Upload documents',
                'Book slot for LL Test',
                'Appear for computer-based test',
                'Download Learner License after passing'
            ],
            fees: '₹ 750/-',
            icon: 'fa-book-open'
        },
        'driving-license': {
            title: 'Driving License',
            description: 'Get your permanent Driving License after holding a Learner License for 30 days.',
            requirements: [
                'Effective Valid Learner License',
                'Form 4 (Application for License to Drive)',
                'Form 5 (Driving School Certificate) [For Transport/Commercial]',
                'Passport Size Photograph',
                'Proof of Address (If changed from LL)'
            ],
            process: [
                'Book DL Test Slot',
                'Visit RTO for Driving Test',
                'Bio-metric capture',
                'Receive DL by post'
            ],
            fees: '₹ 1000/-',
            icon: 'fa-id-card'
        },
        'vehicle-registration': {
            title: 'New Vehicle Registration',
            description: 'Register a new vehicle with the RTO. Ensure all dealer documents and insurance papers are in order.',
            requirements: [
                'Form 20 (Application for Registration)',
                'Form 21 (Sale Certificate)',
                'Form 22 (Road Worthiness Certificate)',
                'Valid Insurance Certificate',
                'Proof of Address',
                'Pan Card / Form 60'
            ],
            process: ['Dealer inspection', 'Payment of Tax', 'RC Book generation'],
            fees: '₹ 600/- + Tax',
            icon: 'fa-car'
        },
        'renew-license': {
            title: 'Renew License',
            description: 'Renew your expired Driving License to continue driving legally.',
            requirements: [
                'Original Expired Driving License',
                'Form 9 (Application for Renewal)',
                'Form 1A (Medical Certificate) [Mandatory if age > 40]',
                'Passport Size Photographs',
                'Proof of Address (If changed)'
            ],
            process: [
                'Fill Form 9 online',
                'Upload documents',
                'Book appointment for Bio-metrics (if required)',
                'Visit RTO for verification',
                'Receive Renewed DL by post'
            ],
            fees: '₹ 650/- (Fine applicable if > 1 year)',
            icon: 'fa-refresh'
        },
        'transfer-ownership': {
            title: 'Transfer Ownership',
            description: 'Transfer the ownership of a vehicle to a new owner.',
            requirements: [
                'Original RC Book',
                'Form 29 (Notice of Transfer)',
                'Form 30 (Report of Transfer)',
                'Valid Insurance Certificate',
                'PUC Certificate',
                'Address Proof of Buyer',
                'Pan Card of Buyer'
            ],
            process: [
                'Fill transfer application online',
                'Upload signed Forms 29 & 30',
                'Pay transfer fee',
                'Submit physical docs to RTO',
                'New RC dispatched to buyer'
            ],
            fees: '₹ 500/- for Bike, ₹ 1000/- for Car',
            icon: 'fa-exchange-alt'
        },
        'pay-tax': {
            title: 'Pay Vehicle Tax',
            description: 'Pay your pending vehicle road tax or lifetime tax easily.',
            requirements: [
                'Vehicle Registration Number',
                'Chassis Number (Last 5 digits)',
                'Previous Tax Receipt (if any)',
                'Valid Insurance Certificate'
            ],
            process: [
                'Enter Vehicle details',
                'Verify tax amount',
                'Pay online via Netbanking/Card',
                'Download Tax Receipt instantly'
            ],
            fees: '₹ 200/-',
            icon: 'fa-rupee-sign'
        },
        'fitness-certificate': {
            title: 'Fitness Certificate',
            description: 'Renew your vehicle fitness certificate (Mandatory for transport vehicles).',
            requirements: [
                'Form 20 / Old Fitness Certificate',
                'Original RC Book',
                'Valid Insurance Certificate',
                'PUC Certificate',
                'Professional Tax Paid Challan',
                'Speed Governor Certificate (if applicable)'
            ],
            process: [
                'Apply for renewal online',
                'Book inspection slot',
                'Vehicle Inspection by RTO Inspector',
                'Approval and Issue of Certificate'
            ],
            fees: '₹ 400/- for Auto, ₹ 800/- for Truck',
            icon: 'fa-heartbeat'
        },
        'international-permit': {
            title: 'International Driving Permit',
            description: 'Get a license to drive commercially or personally in foreign countries.',
            requirements: [
                'Valid Domestic Driving License',
                'Valid Passport',
                'Valid Visa',
                'Air Ticket',
                'Form 1A (Medical Certificate)'
            ],
            process: [
                'Fill IDP application',
                'Upload Passport & Visa',
                'Pay fees',
                'Visit RTO for verification',
                'Collect IDP (Validity 1 year)'
            ],
            fees: '₹ 1000/-',
            icon: 'fa-globe'
        },
        'noc-issue': {
            title: 'Issue NOC',
            description: 'Get a No Objection Certificate to re-register/transfer vehicle to another state.',
            requirements: [
                'Form 28 (3 Copies)',
                'Original RC Book',
                'Valid Insurance Certificate',
                'PUC Certificate',
                'Chassis & Engine Pencil Print',
                'Police NOC (if applicable)'
            ],
            process: [
                'Apply for NOC online',
                'Pay processing fee',
                'Submit documents to RTO',
                'Police verification clearance',
                'Receive NOC'
            ],
            fees: '₹ 100/-',
            icon: 'fa-file-contract'
        }
    };

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.serviceId = params.get('serviceId');
            if (this.serviceId && this.servicesData[this.serviceId]) {
                this.service = this.servicesData[this.serviceId];
            }
            window.scrollTo(0, 0);
        });
    }
}
