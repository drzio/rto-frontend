import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { OcrService } from '../../services/ocr.service'; // Import
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-apply-license',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './apply-license.component.html',
  styleUrl: './apply-license.component.css'
})
export class ApplyLicenseComponent implements OnInit {
  // Inject OCR Service
  private ocrService = inject(OcrService);

  formData: any = {
    fullName: '',
    fatherName: '', // Added
    aadharNumber: '',
    dob: '',
    bloodGroup: '',
    qualification: '', // Added
    identificationMarks: '', // Added
    permanentAddress: '', // Renamed
    presentAddress: '', // Added
    sameAddress: false, // Checkbox state
    gender: '',
    licenseType: 'Learning',
    learnerLicenseNo: '',
    oldLicenseNo: '',
    vehicleRegNo: '',
    vehicleModel: '',
    chassisNo: '',
    vehicleClass: { // Added for Checkboxes
      MCWG: false,
      LMV: false,
      HMV: false,
      HGMV: false,
      HPMV: false
    },
    reason: '',
    firNo: '',
    firDate: ''
  };

  currentConfig: any = {
    title: 'Apply for Learning License',
    description: 'Start your driving journey by applying for a Learner License.',
    type: 'learner-license',
    fees: 350,
    fields: ['personal', 'vehicleClassDetails'], // Added vehicleClassDetails
    documents: [
      { label: 'Address Proof (Aadhaar / Voter ID)', key: 'address_proof' },
      { label: 'Age Proof (School LC)', key: 'age_proof' },
      { label: 'Passport Size Photograph', key: 'photo' },
      { label: 'Signature', key: 'signature' } // Changed/Added
    ]
  };

  serviceConfigs: any = {
    'learner-license': {
      title: 'Apply for Learning License',
      description: 'Start your driving journey by applying for a Learner License. Ensure you have your age and address proof ready.',
      type: 'Learning',
      fees: 750,
      fields: ['personal', 'vehicleClassDetails'],
      documents: [
        { label: 'Address Proof (Aadhaar / Voter ID)', key: 'addressProof' },
        { label: 'Age Proof (School LC)', key: 'ageProof' },
        { label: 'Passport Size Photograph', key: 'photo' },
        { label: 'Signature', key: 'signature' }
      ]
    },
    'driving-license': {
      title: 'Apply for Permanent Driving License',
      description: 'Upgrade your Learner License to a Permanent Driving License.',
      type: 'Permanent',
      fees: 1000,
      fields: ['personal', 'learnerLicenseNo', 'vehicleClassDetails'],
      documents: [
        { label: 'Effective Valid Learner License', key: 'existingLicense' },
        { label: 'Passport Size Photograph', key: 'photo' }
      ]
    },
    'renew-license': {
      title: 'Apply for License Renewal',
      description: 'Renew your expired driving license.',
      type: 'Renewal',
      fees: 650,
      fields: ['personal', 'oldLicenseNo'],
      documents: [
        { label: 'Expired Driving License', key: 'old_license' },
        { label: 'Medical Certificate', key: 'medical_cert' },
        { label: 'Passport Size Photograph', key: 'photo' }
      ]
    },
    'duplicate-dl': {
      title: 'Apply for Duplicate Driving License',
      description: 'Apply for a duplicate license in case of loss, theft, or damage.',
      type: 'Duplicate License',
      fees: 200,
      fields: ['personal', 'oldLicenseNo', 'duplicateReason'],
      documents: [
        { label: 'FIR Copy (If Stolen/Lost)', key: 'fir_copy' },
        { label: 'Damaged License (If Damaged)', key: 'damaged_license' },
        { label: 'Affidavit', key: 'affidavit' }
      ]
    },
    'pay-tax': {
      title: 'Pay Vehicle Tax',
      description: 'Pay your vehicle road tax online.',
      type: 'Vehicle Tax',
      fees: 200,
      fields: ['vehicle'],
      documents: [ // Minimal docs for tax
        { label: 'RC Book Copy', key: 'rc_copy' },
        { label: 'Insurance Policy', key: 'insurance' }
      ]
    }
  };

  private apiService = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);

  isSubmitting = false;
  errors: any = {};

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const type = params['type'];
      if (type && this.serviceConfigs[type]) {
        this.currentConfig = this.serviceConfigs[type];
        this.formData.licenseType = this.currentConfig.type;

        // Reset form data if needed or keep common fields
        if (type === 'vehicle-registration') {
          // Clear personal details if it's vehicle reg, or maybe auto-fill user details?
          // For now, keeping as is.
        }
      }
    });
  }

  // Address Checkbox Logic
  onAddressCheckChange() {
    if (this.formData.sameAddress) {
      this.formData.presentAddress = this.formData.permanentAddress;
    } else {
      this.formData.presentAddress = '';
    }
  }

  validateForm(): boolean {
    this.errors = {};
    let isValid = true;

    // Regex Patterns
    const nameRegex = /^[a-zA-Z\s]+$/;
    const aadharRegex = /^[0-9]{12}$/;
    const mobileRegex = /^[0-9]{10}$/; // Although not in form, good to have if needed
    const vehicleRegRegex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/; // e.g., GJ01AB1234
    const chassisRegex = /^[A-Z0-9]{17}$/; // standard 17 chars, but maybe loose for older? let's stick to alphanumeric min 10
    const looseChassisRegex = /^[A-Z0-9]{10,20}$/;
    const llRegex = /^[A-Z]{2}[0-9]{13,20}$|^[A-Z]{2}[0-9]+\/[0-9]+\/[0-9]+$/; // Matches GJ0120230000123 or GJ01/2023/123

    // 1. Personal Details Validation
    if (this.currentConfig.fields.includes('personal')) {
      // SKIP detailed validation for Permanent License & Renewal (Compact View)
      if (this.currentConfig.type === 'Permanent' || this.currentConfig.type === 'Renewal') {

        // Permanent: LL No Required
        if (this.currentConfig.type === 'Permanent' && !this.formData.learnerLicenseNo) {
          this.errors.learnerLicenseNo = 'Learner License Number is required.';
          isValid = false;
        }

        // Renewal: DL No Required
        if (this.currentConfig.type === 'Renewal' && !this.formData.oldLicenseNo) {
          this.errors.oldLicenseNo = 'Driving License Number is required.';
          isValid = false;
        }

        if (!this.formData.dob) {
          this.errors.dob = 'Date of Birth is required.';
          isValid = false;
        }
        if (!this.formData.fullName) {
          this.errors.fullName = 'Details must be fetched (Name missing).';
          isValid = false;
        }
      } else {
        // Standard Validation for other types
        if (!this.formData.fullName || this.formData.fullName.length < 3 || !nameRegex.test(this.formData.fullName)) {
          this.errors.fullName = 'Name must be at least 3 characters and contain only alphabets.';
          isValid = false;
        }
        if (!this.formData.fatherName || this.formData.fatherName.length < 3 || !nameRegex.test(this.formData.fatherName)) {
          this.errors.fatherName = "Father's Name must be at least 3 characters and contain only alphabets.";
          isValid = false;
        }
        if (!this.formData.dob) {
          this.errors.dob = 'Date of Birth is required.';
          isValid = false;
        }
        if (!this.formData.gender) {
          this.errors.gender = 'Gender is required.';
          isValid = false;
        }
        if (!this.formData.bloodGroup) {
          this.errors.bloodGroup = 'Blood Group is required.';
          isValid = false;
        }

        if (!this.formData.permanentAddress || this.formData.permanentAddress.length < 10) {
          this.errors.permanentAddress = 'Permanent Address must be at least 10 characters long.';
          isValid = false;
        }
        if (!this.formData.presentAddress || this.formData.presentAddress.length < 10) {
          this.errors.presentAddress = 'Present Address must be at least 10 characters long.';
          isValid = false;
        }
        if (!this.formData.aadharNumber || !aadharRegex.test(this.formData.aadharNumber)) {
          this.errors.aadharNumber = 'Aadhar Number must be exactly 12 digits.';
          isValid = false;
        }

        // Check Specific Fields based on Config
        if (this.currentConfig.fields.includes('learnerLicenseNo')) {
          if (!this.formData.learnerLicenseNo) {
            this.errors.learnerLicenseNo = 'Learner License Number is required.';
            isValid = false;
          } else if (this.formData.learnerLicenseNo.length < 10) {
            // Basic Length Check if Regex is too strict
            this.errors.learnerLicenseNo = 'Invalid Learner License Number format.';
            isValid = false;
          }
        }
        if (this.currentConfig.fields.includes('oldLicenseNo')) {
          if (!this.formData.oldLicenseNo || this.formData.oldLicenseNo.length < 10) {
            this.errors.oldLicenseNo = 'Valid Permit/Previous License Number is required.';
            isValid = false;
          }
        }
      }
    }

    // Vehicle Class Validation (LL Only)
    if (this.currentConfig.fields.includes('vehicleClassDetails')) {
      const selectedClasses = Object.keys(this.formData.vehicleClass).filter(k => this.formData.vehicleClass[k]);
      if (selectedClasses.length === 0) {
        this.errors.vehicleClass = 'Please select at least one vehicle class.';
        isValid = false;
      }
    }

    // Vehicle Details Validation
    if (this.currentConfig.fields.includes('vehicle')) {
      if (!this.formData.chassisNo || !looseChassisRegex.test(this.formData.chassisNo)) {
        this.errors.chassisNo = 'Chassis Number must be 10-20 alphanumeric characters.';
        isValid = false;
      }
      if (!this.formData.ownerName || this.formData.ownerName.length < 3) {
        this.errors.ownerName = 'Owner Name is required.';
        isValid = false;
      }
      if (!this.formData.address || this.formData.address.length < 10) {
        this.errors.address = 'Start is required.';
        isValid = false; // Typo in original? Keeping logic 'Address is required'
        this.errors.address = 'Vehicle Address must be valid.';
      }

      if (this.currentConfig.type === 'Registration') {
        if (!this.formData.vehicleModel) {
          this.errors.vehicleModel = 'Vehicle Model is required.';
          isValid = false;
        }
      } else {
        // Check Reg No for Tax/Transfer
        if (!this.formData.vehicleRegNo || !vehicleRegRegex.test(this.formData.vehicleRegNo)) {
          this.errors.vehicleRegNo = 'Invalid Registration Number (e.g. GJ01AB1234).';
          isValid = false;
        }
      }
    }

    // Duplicate DL Validation
    if (this.currentConfig.type === 'Duplicate License') {
      if (!this.formData.reason) {
        this.errors.reason = 'Please select a reason.';
        isValid = false;
      }
      if ((this.formData.reason === 'Stolen' || this.formData.reason === 'Lost') && !this.formData.firNo) {
        this.errors.firNo = 'FIR Number is required.';
        isValid = false;
      }
      if ((this.formData.reason === 'Stolen' || this.formData.reason === 'Lost') && !this.formData.firDate) {
        this.errors.firDate = 'FIR Date is required.';
        isValid = false;
      }
    }

    // Document Validation
    this.currentConfig.documents.forEach((doc: any) => {
      // Check if file is uploaded OR if it's auto-filled (like address proof from OCR)
      // OCR fills 'address_proof' in uploadedFiles, so this check works.
      if (!this.uploadedFiles[doc.key]) {
        this.errors[doc.key] = `${doc.label} is required.`;
        isValid = false;
      }
    });

    // Age Check
    if (this.formData.dob) {
      const dob = new Date(this.formData.dob);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      const minAge = this.formData.licenseType === 'Learning' ? 16 : 18;
      if (age < minAge) {
        this.errors.dob = `You must be at least ${minAge} years old.`;
        isValid = false;
      }
    }

    // Verify Aadhar Match with OCR
    if (!this.verifyAadharMatch()) {
      isValid = false;
    }

    return isValid;
  }

  async submitApplication() {
    // Auto-fetch details for Permanent/Renewal if user didn't click "Fetch Details"
    if ((this.currentConfig.type === 'Permanent' && !this.formData.fullName && this.formData.learnerLicenseNo && this.formData.dob) ||
      (this.currentConfig.type === 'Renewal' && !this.formData.fullName && this.formData.oldLicenseNo && this.formData.dob)) {

      this.toastService.info('Auto-fetching existing details...');
      try {
        await new Promise<void>((resolve, reject) => {
          if (this.currentConfig.type === 'Permanent') {
            this.apiService.getLLDetails(this.formData.learnerLicenseNo, this.formData.dob).subscribe({
              next: (res: any) => {
                if (res.success && res.data) {
                  this.formData.fullName = res.data.fullName;
                  this.formData.fatherName = res.data.fatherName;
                  this.formData.dob = res.data.dob ? res.data.dob.split('T')[0] : '';
                  this.formData.bloodGroup = res.data.bloodGroup;
                  this.formData.address = res.data.address;
                  this.formData.permanentAddress = res.data.permanentAddress || res.data.address;
                  this.formData.presentAddress = res.data.presentAddress;
                  this.formData.gender = res.data.gender;
                  this.formData.aadharNumber = res.data.aadharNumber;
                  if (res.data.vehicleClass) {
                    this.formData.vehicleClass = {};
                    res.data.vehicleClass.forEach((c: any) => this.formData.vehicleClass[c] = true);
                  }
                  resolve();
                } else reject(new Error('Details not found'));
              },
              error: (err: any) => reject(new Error(err.error?.message || 'Could not fetch details. Please check numbers/DOB.'))
            });
          } else {
            this.apiService.getDLDetails(this.formData.oldLicenseNo, this.formData.dob).subscribe({
              next: (res: any) => {
                if (res.success && res.data) {
                  this.formData.fullName = res.data.fullName;
                  this.formData.fatherName = res.data.fatherName;
                  this.formData.dob = res.data.dob ? res.data.dob.split('T')[0] : '';
                  this.formData.bloodGroup = res.data.bloodGroup;
                  this.formData.address = res.data.address;
                  this.formData.permanentAddress = res.data.permanentAddress || res.data.address;
                  this.formData.presentAddress = res.data.presentAddress;
                  this.formData.gender = res.data.gender;
                  this.formData.aadharNumber = res.data.aadharNumber;
                  resolve();
                } else reject(new Error('Details not found'));
              },
              error: (err: any) => reject(new Error(err.error?.message || 'Could not fetch details.'))
            });
          }
        });
      } catch (error: any) {
        this.toastService.error(error.message);
        return; // Stop submission if fetch failed
      }
    }

    if (!this.validateForm()) {
      this.toastService.error("Please fix the validation errors before submitting.");
      return;
    }

    // --- Use FormData for Multer ---
    const formData = new FormData();

    formData.append('licenseType', this.formData.licenseType);
    // Map to Short Service Names
    const serviceNameMap: any = {
      'Learning': 'Learning License',
      'Permanent': 'Driving License',
      'Renewal': 'Renew License',
      'Duplicate License': 'Duplicate License',
      'Vehicle Tax': 'Vehicle Tax'
    };
    formData.append('serviceName', serviceNameMap[this.formData.licenseType] || this.currentConfig.title);

    formData.append('status', 'Pending Verification');
    formData.append('paymentStatus', 'Pending'); // Initial Status

    let details: any = {};
    if (this.currentConfig.type === 'Registration') {
      details = {
        regNo: 'NEW',
        model: this.formData.vehicleModel, // Mapped to 'model'
        chassisNo: this.formData.chassisNo,
        ownerName: this.formData.fullName,
        address: this.formData.address
      };
      formData.append('vehicleDetails', JSON.stringify(details));
    } else if (this.currentConfig.fields.includes('vehicle')) {
      details = {
        regNo: this.formData.vehicleRegNo,
        chassisNo: this.formData.chassisNo,
        ownerName: this.formData.fullName,
        address: this.formData.address
      };
      formData.append('vehicleDetails', JSON.stringify(details));
    } else {
      details = {
        fullName: this.formData.fullName,
        fatherName: this.formData.fatherName, // Added
        dob: this.formData.dob,
        bloodGroup: this.formData.bloodGroup,
        permanentAddress: this.formData.permanentAddress, // Added
        presentAddress: this.formData.presentAddress, // Added
        address: this.formData.permanentAddress, // Fallback for old schema if any
        gender: this.formData.gender,
        aadharNumber: this.formData.aadharNumber,
        learnerLicenseNo: this.formData.learnerLicenseNo,
        oldLicenseNo: this.formData.oldLicenseNo
      };
      formData.append('personalDetails', JSON.stringify(details));

      // Append Vehicle Class for Learner License
      if (this.currentConfig.fields.includes('vehicleClassDetails')) {
        const selectedClasses = Object.keys(this.formData.vehicleClass).filter(k => this.formData.vehicleClass[k]);
        formData.append('vehicleClass', JSON.stringify(selectedClasses));
      }

      // Duplicate DL Fields
      if (this.currentConfig.type === 'Duplicate License') {
        formData.append('reason', this.formData.reason);
        if (this.formData.reason === 'Stolen' || this.formData.reason === 'Lost') {
          formData.append('firNo', this.formData.firNo);
          formData.append('firDate', this.formData.firDate);
        }
      }
    }

    // Append Documents
    this.currentConfig.documents.forEach((doc: any) => {
      if (this.uploadedFiles[doc.key]) {
        formData.append(doc.key, this.uploadedFiles[doc.key]);
      }
    });

    this.apiService.submitApplication(formData).subscribe({
      next: (res: any) => {
        this.toastService.success(`Application Initiated! Processing Payment...`);

        // Redirect to Payment Page with Application ID
        // Pass fees in state so payment page knows how much to charge
        this.router.navigate(['/payment', res.data._id], {
          state: { amount: this.currentConfig.fees }
        });
      },
      error: (err: any) => {
        console.error('Error submitting application:', err);
        const msg = err.error?.message || 'Submission Failed.';
        this.toastService.error(msg);
      }
    });
  }

  uploadedFiles: { [key: string]: File } = {};
  verifyingDocs: { [key: string]: boolean } = {};

  async onFileSelected(event: any, type: string) {
    const file = event.target.files[0];
    if (!file) return;

    // 1. Image Check
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      this.toastService.error('Please upload a valid file format (JPG, PNG, WEBP, or PDF).');
      event.target.value = '';
      return;
    }

    // Bypass OCR for PDFs since Tesseract only works on images
    if (file.type === 'application/pdf') {
      this.uploadedFiles[type] = file;
      this.errors[type] = null;
      this.toastService.success('PDF Document attached successfully!');
      return;
    }


    // 2. Duplicate Check - Restricted except for Address/Age Proof sharing
    const existingEntry = Object.entries(this.uploadedFiles).find(([key, f]) =>
      f.name === file.name && f.size === file.size && f.lastModified === file.lastModified
    );

    if (existingEntry) {
      const existingKey = existingEntry[0];
      const isSharingAllowed = (existingKey.toLowerCase().includes('address') && type.toLowerCase().includes('age')) ||
        (existingKey.toLowerCase().includes('age') && type.toLowerCase().includes('address'));

      if (!isSharingAllowed) {
        this.toastService.error(`This file is already uploaded as ${existingKey.replace(/([A-Z])/g, ' $1').trim()}.`);
        event.target.value = '';
        return;
      }
    }

    this.verifyingDocs[type] = true;
    this.toastService.info('Verifying document authenticity...');

    try {
      // Fast-fail timeout: Age Proofs (School LCs) have lots of text and take longer. 
      // Give Age proofs up to 6 seconds, others 2 seconds
      const timeoutLimit = type.toLowerCase().includes('age') ? 6000 : 2000;

      const ocrPromise = this.ocrService.recognizeText(file);
      const timeoutPromise = new Promise<string>((_, reject) => {
        setTimeout(() => reject(new Error('Document verification took too long. Please upload a clearer or smaller image so it verifies fast.')), timeoutLimit);
      });

      const text = await Promise.race([ocrPromise, timeoutPromise]);
      const upperText = text.toUpperCase();

      // --- OPTIMIZED ID DETECTION ---
      let isAadhar = false;
      let isVoterId = false;
      let isGovId = false;
      let isSchoolLC = false;
      let isBirthCert = false;
      let docName = 'Document';

      // 1. Aadhaar PRIORITIZED Check
      const aadharRegex = /\d{4}[-\s]?\d{4}[-\s]?\d{4}/;
      if (aadharRegex.test(text) || ['AADHAAR', 'UIDAI'].some(m => upperText.includes(m))) {
        isAadhar = true;
      }

      // 2. Voter ID PRIORITIZED Check
      if (['ELECTION', 'VOTER', 'EPIC', 'IDENTITY CARD', 'ELECTOR', 'FACSIMILE'].some(m => upperText.includes(m))) {
        isVoterId = true;
      }

      // 3. Classification - ONLY if not an ID
      if (!isAadhar && !isVoterId) {
        const lcMarkers = ['SCHOOL', 'LEAVING', 'LC', 'TRANSFER', 'DAKHAL', 'PATRA'];
        const birthMarkers = ['BIRTH', 'CERTIFICATE', 'JANMA', 'PRAMANA', 'JANANA', 'FORM 5', 'KARNATAKA', 'CHIEF'];

        if (lcMarkers.some(m => upperText.includes(m)) || (upperText.includes('SCHOOL') && upperText.includes('LEAVING'))) {
          isSchoolLC = true;
        }
        if (birthMarkers.some(m => upperText.includes(m)) || (upperText.includes('BIRTH') && upperText.includes('CERTIFICATE')) || (upperText.includes('CHIEF') && upperText.includes('REGISTRAR'))) {
          isBirthCert = true;
        }
      }

      // 4. Official Govt ID Markers (PAN, DL, Passport)
      const idMarkers = [
        'INCOME TAX', 'PAN CARD', 'PERMANENT ACCOUNT',
        'DRIVING LICENSE', 'STATE TRANSPORT', 'LICENCE TO DRIVE',
        'PASSPORT', 'REPUBLIC OF INDIA', 'INDIAN CITIZEN', 'REPUBLIC',
        'S.S.C', 'MARKSHEET'
      ];
      const foundIdMarkers = idMarkers.filter(m => upperText.includes(m));

      if (foundIdMarkers.length >= 1 || (upperText.includes('GOVERNMENT') && upperText.includes('INDIA'))) {
        isGovId = true;
      }

      // 5. Field Specific Validation Logic
      let isValid = false;
      const isAddressProof = type.toLowerCase().includes('address');
      const isAgeProof = type.toLowerCase().includes('age');

      if (isAddressProof) {
        // --- ADDRESS PROOF: ONLY AADHAAR OR VOTER ID ---
        if (isAadhar || isVoterId) {
          isValid = true;
          docName = isAadhar ? 'Aadhaar Card' : 'Voter ID';
        } else {
          throw new Error('Please upload a valid document or image.');
        }
      } else if (isAgeProof) {
        // --- AGE PROOF: ONLY SCHOOL LC ---
        if (isSchoolLC) {
          isValid = true;
          docName = 'School LC';
        } else {
          throw new Error('Please upload a valid document or image.');
        }
      } else if (type.toLowerCase().includes('proof') || ['existinglicense', 'old_license', 'rc_copy', 'medical_cert'].includes(type.toLowerCase())) {
        // Other Proofs: Aadhaar, Voter, LC, Birth Cert or any Gov ID
        if (isAadhar || isVoterId || isGovId || isSchoolLC || isBirthCert || text.length > 100) {
          isValid = true;
          docName = isAadhar ? 'Aadhaar Card' : (isSchoolLC ? 'School LC' : (isBirthCert ? 'Birth Certificate' : 'Document'));
        }
      } else if (type === 'photo' || type === 'signature') {
        // --- IMAGE SHAPE AND FACE DETECTION (For Photo and Signature) ---
        const hasIdMarkers = isAadhar || isVoterId || isGovId || isSchoolLC || isBirthCert;
        const alphanumericTextCount = text.replace(/[^a-zA-Z0-9]/g, '').length;

        let hasFace = false;
        let isFaceDetectionSupported = false;
        let isLandscape = false;

        try {
          const img = new Image();
          img.src = URL.createObjectURL(file);
          await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });

          // A signature or ID card is typically landscape (wider than tall). 
          // Passport photos must be portrait or perfect square.
          isLandscape = img.width > img.height * 1.05;

          // Use modern browser FaceDetection API if available
          if ('FaceDetector' in window) {
            isFaceDetectionSupported = true;
            const faceDetector = new (window as any).FaceDetector({ fastMode: true });

            const faces = await faceDetector.detect(img);
            if (faces.length > 0) {
              hasFace = true;
            }
          }
          URL.revokeObjectURL(img.src);
        } catch (e) {
          console.warn("Face detection failed or unsupported", e);
        }

        if (type === 'photo') {
          // Validation Rules:
          // 1. MUST NOT be a landscape image (Signatures and ID cards are wide, faces are tall)
          // 2. If Face API supported -> MUST have a face
          // 3. MUST NOT be a document (allow up to 80 chars for clothes/logos, but block heavy text)
          if (isLandscape) {
            throw new Error('Please upload a valid document or image.');
          } else if (isFaceDetectionSupported && !hasFace) {
            throw new Error('Please upload a valid document or image.');
          } else if (hasIdMarkers || alphanumericTextCount > 80 || upperText.includes('INDIA') || upperText.includes('GOVERNMENT') || upperText.includes('SARKAR')) {
            throw new Error('Please upload a valid document or image.');
          } else {
            isValid = true;
            docName = 'Passport Photograph';
          }
        } else {
          // --- STRICT SIGNATURE CHECK ---
          // 1. MUST be a landscape image (Signatures are wide, faces are usually tall)
          // 2. If Face API supported -> MUST NOT have a face
          // 3. MUST NOT be a document (signatures have very low text limits and no ID markers)
          if (!isLandscape) {
            throw new Error('Please upload a valid document or image.');
          } else if (isFaceDetectionSupported && hasFace) {
            throw new Error('Please upload a valid document or image.');
          } else if (hasIdMarkers || text.length > 40 || upperText.includes('INDIA') || upperText.includes('GOVERNMENT')) {
            throw new Error('Please upload a valid document or image.');
          } else {
            isValid = true;
            docName = 'Signature';
          }
        }
      } else {
        // Default catch-all
        isValid = isAadhar || isVoterId || isGovId || isSchoolLC || isBirthCert || text.length > 50;
      }

      if (!isValid) {
        throw new Error('Please upload a valid document or image.');
      }

      this.uploadedFiles[type] = file;
      this.errors[type] = null;
      this.toastService.success(`${docName} Verified Successfully!`);

    } catch (error: any) {
      console.error('Verification failed:', error);
      this.toastService.error(error.message || 'Invalid document uploaded. Please try again.');
      event.target.value = '';
      delete this.uploadedFiles[type];
    } finally {
      this.verifyingDocs[type] = false;
    }
  }

  // --- NEW FEATURES ---

  // 1. Fetch LL Details
  fetchDLDetails() {
    if (!this.formData.oldLicenseNo) {
      this.toastService.error('Please enter Permanent License Number');
      return;
    }
    if (!this.formData.dob) {
      this.toastService.error('Please enter Date of Birth to validate.');
      return;
    }

    this.apiService.getDLDetails(this.formData.oldLicenseNo, this.formData.dob).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.toastService.success('Details Fetched Successfully!');
          this.formData.fullName = res.data.fullName;
          this.formData.fatherName = res.data.fatherName;
          this.formData.dob = res.data.dob ? res.data.dob.split('T')[0] : '';
          this.formData.bloodGroup = res.data.bloodGroup;
          this.formData.address = res.data.address;
          this.formData.permanentAddress = res.data.permanentAddress || res.data.address;
          this.formData.presentAddress = res.data.presentAddress;
          this.formData.gender = res.data.gender;
          this.formData.aadharNumber = res.data.aadharNumber;
        }
      },
      error: (err: any) => {
        console.error(err);
        this.toastService.error(err.error?.message || 'Could not fetch details.');
      }
    });
  }

  fetchLLDetails() {
    if (!this.formData.learnerLicenseNo) {
      this.toastService.error('Please enter Learner License Number');
      return;
    }

    // For DL, DOB is required for validation
    if (this.currentConfig.type === 'Permanent' && !this.formData.dob) {
      this.toastService.error('Please enter Date of Birth to validate.');
      return;
    }

    this.apiService.getLLDetails(this.formData.learnerLicenseNo, this.formData.dob).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.toastService.success('Details Fetched Successfully!');
          // Auto-fill form
          this.formData.fullName = res.data.fullName;
          this.formData.fatherName = res.data.fatherName;
          this.formData.dob = res.data.dob ? res.data.dob.split('T')[0] : '';
          this.formData.bloodGroup = res.data.bloodGroup;
          this.formData.bloodGroup = res.data.bloodGroup;
          this.formData.address = res.data.address;
          this.formData.permanentAddress = res.data.permanentAddress || res.data.address;
          this.formData.presentAddress = res.data.presentAddress;
          this.formData.gender = res.data.gender;
          this.formData.aadharNumber = res.data.aadharNumber;

          this.formData.vehicleClass = {
            MCWG: false,
            LMV: false,
            HMV: false,
            HGMV: false,
            HPMV: false
          };
        }
      },
      error: (err: any) => {
        console.error(err);
        this.toastService.error(err.error?.message || 'Could not fetch details. Please check numbers/DOB.');
      }
    });
  }

  // 2. OCR Scan
  isScanning = false;
  scannedData: any = null; // Store scanned data for verification

  async scanDocument(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // 1. Image form check (Quick Fill needs images for OCR, no PDFs)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.toastService.error('Please upload a valid document or image.');
      event.target.value = '';
      return;
    }

    this.isScanning = true;
    try {
      const text = await this.ocrService.recognizeText(file);
      const upperText = text.toUpperCase();

      // --- PRIORITIZED DETECTION FOR QUICK FILL ---
      const aadharRegex = /\d{4}[-\s]?\d{4}[-\s]?\d{4}/;
      const isAadhar = aadharRegex.test(text) || ['AADHAAR', 'AADHAR', 'UIDAI', 'GOVERNMENT OF INDIA'].some(m => upperText.includes(m));

      const idMarkers = [
        'INCOME TAX', 'PAN CARD', 'PERMANENT ACCOUNT',
        'DRIVING LICENSE', 'STATE TRANSPORT', 'LICENCE TO DRIVE',
        'PASSPORT', 'REPUBLIC OF INDIA', 'INDIAN CITIZEN'
      ];
      const isIdProof = idMarkers.some(m => upperText.includes(m)) || (upperText.includes('GOVERNMENT') && upperText.includes('INDIA'));

      if (!isAadhar && !isIdProof) {
        throw new Error('Please upload a valid document or image.');
      }

      // --- EXTRACT DATA ---
      const extracted = this.ocrService.parseIdentityCard(text);
      this.scannedData = extracted;

      if (extracted.fullName) this.formData.fullName = extracted.fullName;
      if (extracted.dob) this.formData.dob = extracted.dob;
      if (extracted.address) {
        this.formData.permanentAddress = extracted.address;
      }

      if (extracted.aadharNumber) {
        // If the user already typed an aadhaar number, AND it's not empty, AND it doesn't match the OCR
        if (this.formData.aadharNumber && this.formData.aadharNumber.trim() !== '' && this.formData.aadharNumber !== extracted.aadharNumber) {
          this.toastService.error(`Mismatch! Entered Aadhar does not match Document.`);
        }
        this.formData.aadharNumber = extracted.aadharNumber;
      }

      this.toastService.success('Data Auto-filled from Document!');

      // Duplicate Check for auto-filled address proof
      const isDuplicate = Object.values(this.uploadedFiles).some(f => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified);
      if (!isDuplicate) {
        this.uploadedFiles['address_proof'] = file;
      }

    } catch (error: any) {
      console.error(error);
      this.toastService.error(error.message || 'Verification failed. Please upload a clear, valid document.');
      event.target.value = '';
    } finally {
      this.isScanning = false;
    }
  }

  // Add a verification check before submit (optional, but requested "Error if not match")
  verifyAadharMatch(): boolean {
    if (this.scannedData && this.scannedData.aadharNumber && this.formData.aadharNumber) {
      if (this.scannedData.aadharNumber !== this.formData.aadharNumber) {
        this.errors.aadharNumber = `Verification Failed: Details do not match the uploaded document (${this.scannedData.aadharNumber})`;
        return false;
      }
    }
    return true;
  }
}
