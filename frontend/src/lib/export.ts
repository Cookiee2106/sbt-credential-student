'use client';

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface Credential {
  id: string;
  name: string;
  description: string;
  status: string;
  verifyCode: string;
  issuedAt: string;
  tokenId: string;
  student: {
    name: string;
    email: string;
  };
  school?: string;
  grade?: string;
}

const getBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }
  return 'http://localhost:3001';
};

const generateHash = (credential: Credential): string => {
  const data = `${credential.verifyCode}${credential.name}${credential.student?.name}${credential.issuedAt}${credential.tokenId}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
};

const createPDFContent = (credential: Credential, hash: string): string => {
  const issueDate = credential.issuedAt 
    ? new Date(credential.issuedAt).toLocaleDateString('vi-VN') 
    : 'N/A';

  return `
    <div id="pdf-content" style="font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; background: white;">
      <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 30px; border-radius: 10px 10px 0 0; margin: -40px -40px 30px -40px;">
        <h1 style="color: white; margin: 0; text-align: center; font-size: 28px;">SBT Credential</h1>
        <p style="color: white; margin: 10px 0 0 0; text-align: center; font-size: 14px;">Soulbound Token Certificate</p>
      </div>
      
      <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 22px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
        ${credential.name}
      </h2>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 10px 0; font-weight: bold; color: #6b7280; width: 120px;">Student:</td>
          <td style="padding: 10px 0; color: #1f2937;">${credential.student?.name || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-weight: bold; color: #6b7280;">Email:</td>
          <td style="padding: 10px 0; color: #1f2937;">${credential.student?.email || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-weight: bold; color: #6b7280;">School:</td>
          <td style="padding: 10px 0; color: #1f2937;">${credential.school || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-weight: bold; color: #6b7280;">Grade:</td>
          <td style="padding: 10px 0; color: #1f2937;">${credential.grade || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-weight: bold; color: #6b7280;">Issue Date:</td>
          <td style="padding: 10px 0; color: #1f2937;">${issueDate}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-weight: bold; color: #6b7280;">Token ID:</td>
          <td style="padding: 10px 0; color: #1f2937; font-family: monospace;">${credential.tokenId ? `#${credential.tokenId}` : 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-weight: bold; color: #6b7280;">Verify Code:</td>
          <td style="padding: 10px 0; color: #1f2937; font-family: monospace; font-size: 12px;">${credential.verifyCode}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-weight: bold; color: #6b7280;">Document Hash:</td>
          <td style="padding: 10px 0; color: #1f2937; font-family: monospace; font-size: 12px; background: #fef3c7; padding: 5px; border-radius: 4px;">${hash}</td>
        </tr>
      </table>
      
      <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="font-weight: bold; color: #6b7280; margin: 0 0 8px 0;">Description:</p>
        <p style="color: #1f2937; margin: 0;">${credential.description || 'No description'}</p>
      </div>
      
      <div style="border-top: 2px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center;">
        <p style="color: #9ca3af; margin: 0; font-size: 12px;">
          This credential is verified on the blockchain.
        </p>
        <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 11px;">
          Verify at: ${getBaseUrl()}/verify/${credential.verifyCode}
        </p>
      </div>
    </div>
  `;
};

export const exportCredentialPDF = async (credential: Credential) => {
  const hash = generateHash(credential);
  
  try {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = createPDFContent(credential, hash);
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    tempDiv.style.width = '800px';
    document.body.appendChild(tempDiv);

    const element = tempDiv.querySelector('#pdf-content') as HTMLElement;
    
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    document.body.removeChild(tempDiv);

    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    
    pdf.save(`${credential.verifyCode}.pdf`);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head><title>Credential - ${credential.verifyCode}</title></head>
          <body>${createPDFContent(credential, hash)}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  }
};

export const getCredentialHash = (credential: Credential): string => {
  return generateHash(credential);
};

export const verifyCredentialHash = (credential: Credential, inputHash: string): boolean => {
  const hash = generateHash(credential);
  return hash.toLowerCase() === inputHash.toLowerCase();
};

export const shareToLinkedIn = (credential: Credential) => {
  const url = `${getBaseUrl()}/verify/${credential.verifyCode}`;
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  window.open(linkedInUrl, '_blank');
};

export const copyLink = (verifyCode: string) => {
  const url = `${getBaseUrl()}/verify/${verifyCode}`;
  navigator.clipboard.writeText(url);
};
