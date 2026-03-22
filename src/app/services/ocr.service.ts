
import { Injectable } from '@angular/core';
import { createWorker } from 'tesseract.js';

@Injectable({
    providedIn: 'root'
})
export class OcrService {

    private worker: any;
    private workerReady: Promise<any> | null = null;

    constructor() {
        // Pre-initialize worker in background on app start
        this.workerReady = this.initWorker();
    }

    private async initWorker() {
        try {
            this.worker = await createWorker('eng');
        } catch (e) {
            console.error('OCR worker init failed:', e);
        }
    }

    async recognizeText(imageFile: File): Promise<string> {
        // Compress image first for faster OCR, but keep enough resolution for text reading (1600px, 90% quality)
        const compressed = await this.compressImage(imageFile, 1600, 0.9);

        // Wait for worker if not ready yet
        if (!this.worker) {
            await this.workerReady;
        }
        if (!this.worker) {
            this.worker = await createWorker('eng');
        }

        const ret = await this.worker.recognize(compressed);
        return ret.data.text;
    }

    // Compress and resize image before OCR — huge speed improvement
    private compressImage(file: File, maxSize: number, quality: number): Promise<Blob> {
        return new Promise((resolve) => {
            const img = new Image();
            const url = URL.createObjectURL(file);

            img.onload = () => {
                URL.revokeObjectURL(url);

                let w = img.width;
                let h = img.height;

                // Scale down if larger than maxSize
                if (w > maxSize || h > maxSize) {
                    if (w > h) {
                        h = Math.round((h * maxSize) / w);
                        w = maxSize;
                    } else {
                        w = Math.round((w * maxSize) / h);
                        h = maxSize;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d')!;
                ctx.drawImage(img, 0, 0, w, h);

                canvas.toBlob(
                    (blob) => resolve(blob || file),
                    'image/jpeg',
                    quality
                );
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                resolve(file); // Fallback to original
            };

            img.src = url;
        });
    }

    parseIdentityCard(text: string): any {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        const data: any = {};

        // Aadhar Regex (xxxx xxxx xxxx)
        const aadharRegex = /\b\d{4}\s\d{4}\s\d{4}\b/;
        const aadharMatch = text.match(aadharRegex);
        if (aadharMatch) {
            data.aadharNumber = aadharMatch[0].replace(/\s/g, '');
        } else {
            const aadharStrict = /\b\d{12}\b/;
            const match = text.match(aadharStrict);
            if (match) data.aadharNumber = match[0];
        }

        // DOB Regex (dd/mm/yyyy or dd-mm-yyyy)
        const dobRegex = /(\d{2}[-\/]\d{2}[-\/]\d{4})/;
        const dobMatch = text.match(dobRegex);
        if (dobMatch) {
            const parts = dobMatch[0].split(/[-\/]/);
            if (parts.length === 3) {
                if (parseInt(parts[0]) > 1900) {
                    data.dob = `${parts[0]}-${parts[1]}-${parts[2]}`;
                } else {
                    data.dob = `${parts[2]}-${parts[1]}-${parts[0]}`;
                }
            }
        }

        // Name Heuristic
        const ignoreWords = ['GOVERNMENT', 'INDIA', 'DOB', 'YEAR', 'MALE', 'FEMALE', 'FATHER', 'ADDRESS', 'AADHAAR'];

        for (let line of lines) {
            const upperLine = line.toUpperCase();
            if (ignoreWords.some(w => upperLine.includes(w))) continue;

            if (/^[A-Z][a-zA-Z\s]+$/.test(line) && line.length > 3) {
                if (!data.fullName) {
                    data.fullName = line;
                }
            }
        }

        // Address extraction
        const addrIdx = lines.findIndex(l => l.toLowerCase().startsWith('address'));
        if (addrIdx !== -1 && addrIdx + 1 < lines.length) {
            data.address = lines.slice(addrIdx + 1, addrIdx + 4).join(', ');
        }

        return data;
    }
}
