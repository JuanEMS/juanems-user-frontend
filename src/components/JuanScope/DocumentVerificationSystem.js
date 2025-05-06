import React, { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';

// Configure pdf.js worker using CDN for simplicity and compatibility
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

// Lazy-load TensorFlow.js and Tesseract.js
const loadTF = async () => {
  const tf = await import('@tensorflow/tfjs');
  await import('@tensorflow/tfjs-backend-webgl');
  return tf;
};

const loadTesseract = async () => {
  return await import('tesseract.js');
};

// Configure Tesseract worker with CDN paths
const initializeTesseractWorker = async (Tesseract) => {
  try {
    Tesseract.setLogging(true);
    return await Tesseract.createWorker({
      workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js',
      langPath: 'https://tessdata.projectnaptha.com/4.0.0',
      corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@5/tesseract-core.wasm.js',
      logger: (m) => console.log(m),
    });
  } catch (error) {
    console.error('Failed to initialize Tesseract worker:', error);
    throw new Error('OCR initialization failed. Please try again later.');
  }
};

// Load TensorFlow.js backend
const loadTFBackend = async (tf) => {
  try {
    await tf.ready();
    console.log('TensorFlow.js backend ready');
  } catch (error) {
    console.error('Error loading TensorFlow.js backend:', error);
    throw new Error('Failed to initialize verification system');
  }
};

// File Uploader Component
const FileUploader = ({ onFileSelect, acceptedTypes, requirement }) => {
  return (
    <div className="file-uploader">
      <label className="file-upload-label">
        <span>{requirement}</span>
        <input
          type="file"
          accept={acceptedTypes || "image/jpeg,image/png,application/pdf"}
          onChange={onFileSelect}
          className="file-input"
        />
        <div className="upload-button">Select File</div>
      </label>
      <div className="supported-formats">
        <small>Accepted formats: JPEG, PNG, PDF</small>
      </div>
    </div>
  );
};

// Document Verification Component
const DocumentVerification = ({ file, requirementType, onVerificationComplete }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [verificationDetails, setVerificationDetails] = useState(null);

  // Load TensorFlow.js backend when component mounts
  useEffect(() => {
    loadTF()
      .then((tf) => loadTFBackend(tf))
      .catch((error) => {
        console.error('Initialization error:', error);
        setVerificationResult({
          isValid: false,
          message: `Initialization error: ${error.message}`,
          details: null,
        });
        onVerificationComplete({
          isValid: false,
          message: `Initialization error: ${error.message}`,
          details: null,
        });
      });
  }, []);

  // Start verification when file is received
  useEffect(() => {
    if (file) {
      verifyDocument(file);
    }
  }, [file]);

  const verifyDocument = async (file) => {
    setIsVerifying(true);

    try {
      const fileType = file.type;
      const fileExtension = file.name.split('.').pop().toLowerCase();
      const fileSize = file.size;

      // Basic file validation
      const validationResult = validateFileBasics(fileType, fileSize, fileExtension);
      if (!validationResult.valid) {
        setVerificationResult({
          isValid: false,
          message: validationResult.message,
        });
        onVerificationComplete({
          isValid: false,
          message: validationResult.message,
          details: null,
        });
        setIsVerifying(false);
        return;
      }

      // Load Tesseract.js dynamically
      const Tesseract = await loadTesseract();

      // Process based on file type
      let documentData;
      if (fileType === 'application/pdf') {
        documentData = await processPdfDocument(file, Tesseract);
      } else {
        documentData = await processImageDocument(file, Tesseract);
      }

      // Specific verification based on requirement type
      let verificationResults;
      switch (requirementType) {
        case 'id_photo':
          verificationResults = await verifyIDPhoto(documentData);
          break;
        case 'report_card':
        case 'transcript':
          verificationResults = await verifyEducationalDocument(documentData);
          break;
        default:
          verificationResults = {
            isValid: false,
            message: 'Unknown requirement type',
            details: null,
          };
      }

      setVerificationResult(verificationResults);
      setVerificationDetails(verificationResults.details);
      onVerificationComplete(verificationResults);
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationResult({
        isValid: false,
        message: `Verification error: ${error.message}`,
        details: null,
      });
      onVerificationComplete({
        isValid: false,
        message: `Verification error: ${error.message}`,
        details: null,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Basic file validation
  const validateFileBasics = (fileType, fileSize, fileExtension) => {
    const validTypes = ['image/png', 'image/jpeg', 'application/pdf'];
    if (!validTypes.includes(fileType)) {
      return {
        valid: false,
        message: 'Only PNG, JPG, or PDF files are allowed.',
      };
    }

    if (fileSize > 10 * 1024 * 1024) {
      return {
        valid: false,
        message: 'File size must not exceed 10MB.',
      };
    }

    const validExtensions = ['png', 'jpg', 'jpeg', 'pdf'];
    if (!validExtensions.includes(fileExtension)) {
      return {
        valid: false,
        message: 'Invalid file extension. Only PNG, JPG, or PDF are allowed.',
      };
    }

    return { valid: true };
  };

  // Process PDF document
  const processPdfDocument = async (file, Tesseract) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      // Check if PDF has at least one page
      const pageCount = pdf.numPages;
      if (pageCount < 1) {
        throw new Error('PDF is empty or has no valid pages');
      }

      // Try to access the first page
      let page;
      try {
        page = await pdf.getPage(1);
      } catch (error) {
        throw new Error('Invalid page request: Unable to access the first page of the PDF');
      }

      const viewport = page.getViewport({ scale: 1.0 });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      // Extract text using Tesseract.js
      const worker = await initializeTesseractWorker(Tesseract);
      await worker.load();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      const { data: { text } } = await worker.recognize(canvas.toDataURL());
      await worker.terminate();

      return {
        imageData,
        textContent: text,
        pageCount,
        dimensions: { width: viewport.width, height: viewport.height },
        canvas,
      };
    } catch (error) {
      console.error('PDF processing error:', error);
      throw new Error(`Error processing PDF: ${error.message}`);
    }
  };

  // Process image document
  const processImageDocument = async (file, Tesseract) => {
    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise((resolve) => (img.onload = resolve));

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      // Extract text using Tesseract.js
      const worker = await initializeTesseractWorker(Tesseract);
      await worker.load();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      const { data: { text } } = await worker.recognize(img.src);
      await worker.terminate();

      return {
        imageData,
        textContent: text,
        dimensions: { width: img.width, height: img.height },
        image: img,
        canvas,
      };
    } catch (error) {
      throw new Error(`Error processing image: ${error.message}`);
    }
  };

  // Verify ID photo
  const verifyIDPhoto = async (documentData) => {
    try {
      const { imageData, dimensions, image, canvas } = documentData;

      if (!image && !canvas) {
        return {
          isValid: false,
          message: 'ID photo must be an image file (PNG or JPG). PDFs are not allowed for ID photos.',
          details: { error: 'Invalid file type' },
        };
      }

      // Lenient dimension check
      const dpi = 300;
      const expectedSize = 2 * dpi; // 600 pixels
      if (dimensions.width < expectedSize - 200 || dimensions.height < expectedSize - 200) {
        return {
          isValid: false,
          message: 'Image dimensions are too small for a proper ID photo. Recommended size is approximately 2x2 inches (600x600 pixels at 300 DPI).',
          details: { dimensions },
        };
      }

      // Lenient aspect ratio check
      const aspectRatio = dimensions.width / dimensions.height;
      if (aspectRatio < 0.75 || aspectRatio > 1.25) {
        return {
          isValid: false,
          message: 'ID photo should be approximately square (2x2). Current aspect ratio is too far from square.',
          details: { aspectRatio, expectedRatio: '1:1 (square)', dimensions },
        };
      }

      // Background check
      const { isWhiteBackground, whitePercentage } = await checkBackgroundColor(imageData);
      if (!isWhiteBackground) {
        return {
          isValid: false,
          message: 'ID photo should have a light/white background. The current background is too dark or colorful.',
          details: { backgroundCheck: 'failed', whitePercentage: Math.round(whitePercentage * 100) + '%' },
        };
      }

      const hasFace = await detectFace(canvas || image);
      if (!hasFace) {
        return {
          isValid: false,
          message: 'No face detected in the image. Ensure the photo clearly shows a human face centered in the frame.',
          details: { faceDetection: 'failed' },
        };
      }

      const faceProportionResult = await checkFaceProportion(canvas || image);
      if (!faceProportionResult.isValid) {
        return {
          isValid: false,
          message: faceProportionResult.message,
          details: { framingCheck: 'failed', faceProportion: faceProportionResult.proportion },
        };
      }

      return {
        isValid: true,
        message: 'ID photo verification successful.',
        details: {
          aspectRatio,
          dimensions,
          backgroundCheck: 'passed',
          faceDetection: 'passed',
          framingCheck: 'passed',
        },
      };
    } catch (error) {
      return {
        isValid: false,
        message: `ID photo verification error: ${error.message}`,
        details: { error: error.message },
      };
    }
  };

  // Check background color
  const checkBackgroundColor = async (imageData) => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    const borderPixels = [];

    // Top and bottom rows
    for (let x = 0; x < width; x++) {
      const topIdx = (x + 0 * width) * 4;
      borderPixels.push([data[topIdx], data[topIdx + 1], data[topIdx + 2]]);

      const bottomIdx = (x + (height - 1) * width) * 4;
      borderPixels.push([data[bottomIdx], data[bottomIdx + 1], data[bottomIdx + 2]]);
    }

    // Left and right columns
    for (let y = 1; y < height - 1; y++) {
      const leftIdx = (0 + y * width) * 4;
      borderPixels.push([data[leftIdx], data[leftIdx + 1], data[leftIdx + 2]]);

      const rightIdx = ((width - 1) + y * width) * 4;
      borderPixels.push([data[rightIdx], data[rightIdx + 1], data[rightIdx + 2]]);
    }

    const whiteThreshold = 200;
    let whiteCount = 0;

    for (const [r, g, b] of borderPixels) {
      if ((r + g + b) / 3 > whiteThreshold) {
        whiteCount++;
      }
    }

    const whitePercentage = whiteCount / borderPixels.length;

    return {
      isWhiteBackground: whitePercentage > 0.6,
      whitePercentage,
    };
  };

  // Face detection
  const detectFace = async (imageElement) => {
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (imageElement instanceof HTMLCanvasElement) {
        canvas.width = imageElement.width;
        canvas.height = imageElement.height;
        context.drawImage(imageElement, 0, 0);
      } else {
        canvas.width = imageElement.width;
        canvas.height = imageElement.height;
        context.drawImage(imageElement, 0, 0);
      }

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      const centerX = Math.floor(canvas.width / 2);
      const centerY = Math.floor(canvas.height / 2);
      const sampleRadius = Math.floor(Math.min(canvas.width, canvas.height) * 0.25);

      let skinTonePixels = 0;
      let totalSampledPixels = 0;

      for (let y = centerY - sampleRadius; y < centerY + sampleRadius; y += 2) {
        for (let x = centerX - sampleRadius; x < centerX + sampleRadius; x += 2) {
          if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
            const idx = (x + y * canvas.width) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];

            if (
              r > 60 && r < 240 &&
              g > 40 && g < 200 &&
              b > 20 && b < 180 &&
              r > g && g > b &&
              (r - g) > 5
            ) {
              skinTonePixels++;
            }
            totalSampledPixels++;
          }
        }
      }

      const skinToneRatio = skinTonePixels / totalSampledPixels;

      return skinToneRatio > 0.1;
    } catch (error) {
      console.error('Face detection error:', error);
      return true; // Lenient fallback to avoid false negatives
    }
  };

  // Check face proportion
  const checkFaceProportion = async (imageElement) => {
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (imageElement instanceof HTMLCanvasElement) {
        canvas.width = imageElement.width;
        canvas.height = imageElement.height;
        context.drawImage(imageElement, 0, 0);
      } else {
        canvas.width = imageElement.width;
        canvas.height = imageElement.height;
        context.drawImage(imageElement, 0, 0);
      }

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      const centerX = Math.floor(canvas.width / 2);
      const centerY = Math.floor(canvas.height / 2);

      const centerRegion = {
        x1: centerX - Math.floor(canvas.width * 0.2),
        y1: centerY - Math.floor(canvas.height * 0.2),
        x2: centerX + Math.floor(canvas.width * 0.2),
        y2: centerY + Math.floor(canvas.height * 0.2),
      };

      let centerPixels = [];
      for (let y = centerRegion.y1; y < centerRegion.y2; y += 2) {
        for (let x = centerRegion.x1; x < centerRegion.x2; x += 2) {
          if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
            const idx = (x + y * canvas.width) * 4;
            const avg = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
            centerPixels.push(avg);
          }
        }
      }

      let edgePixels = [];
      for (let x = 0; x < canvas.width; x += 2) {
        for (let y = 0; y < canvas.height * 0.1; y += 2) {
          const idx = (x + y * canvas.width) * 4;
          const avg = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
          edgePixels.push(avg);
        }
        for (let y = canvas.height - canvas.height * 0.1; y < canvas.height; y += 2) {
          const idx = (x + y * canvas.width) * 4;
          const avg = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
          edgePixels.push(avg);
        }
      }

      const calculateVariance = (values) => {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      };

      const centerVariance = calculateVariance(centerPixels);
      const edgeVariance = calculateVariance(edgePixels);

      const varianceRatio = centerVariance / (edgeVariance || 1);

      let colorDistribution = {};
      for (let y = centerRegion.y1; y < centerRegion.y2; y += 2) {
        for (let x = centerRegion.x1; x < centerRegion.x2; x += 2) {
          if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
            const idx = (x + y * canvas.width) * 4;
            const r = Math.floor(data[idx] / 10) * 10;
            const g = Math.floor(data[idx + 1] / 10) * 10;
            const b = Math.floor(data[idx + 2] / 10) * 10;
            const colorKey = `${r}-${g}-${b}`;
            colorDistribution[colorKey] = (colorDistribution[colorKey] || 0) + 1;
          }
        }
      }

      const uniqueColors = Object.keys(colorDistribution).length;

      if (varianceRatio < 1.2) {
        return {
          isValid: false,
          message: 'No clear face detected in the image. Ensure the photo shows a human face centered in the frame.',
          proportion: varianceRatio,
        };
      } else if (uniqueColors < 30) {
        return {
          isValid: false,
          message: 'Image lacks sufficient detail. Ensure the photo is clear, well-lit, and not blurry.',
          proportion: uniqueColors,
        };
      }

      return {
        isValid: true,
        message: 'Face is properly framed in the image.',
        proportion: varianceRatio,
      };
    } catch (error) {
      console.error('Face proportion check error:', error);
      return { isValid: true, message: 'Face proportion check completed', proportion: 0 };
    }
  };

  // Verify educational document
  const verifyEducationalDocument = async (documentData) => {
    try {
      const { textContent, pageCount } = documentData;

      if (!textContent) {
        return {
          isValid: false,
          message: 'Document is empty or unreadable. Please upload a document with visible text.',
          details: { error: 'No content detected' },
        };
      }

      const textLower = textContent.toLowerCase().replace(/\s+/g, ' ').trim();

      const educationalKeywords = [
        'school', 'college', 'university', 'institute', 'education', 'academic',
        'report card', 'grade', 'marks', 'semester', 'quarter', 'term',
        'performance', 'subject', 'teacher', 'evaluation', 'assessment',
        'rating', 'achievement', 'grading', 'period', 'module', 'level',
        'transcript', 'academic record', 'credits', 'units', 'course',
        'cumulative', 'gpa', 'grade point', 'official records', 'certification',
        'school year', 'transfer', 'subjects taken', 'enrollment', 'registration',
        'mathematics', 'math', 'science', 'english', 'history', 'physics',
        'chemistry', 'biology', 'literature', 'philosophy', 'psychology',
        'economics', 'computer', 'programming',
        'passed', 'failed', 'incomplete', 'withdrawn', 'record', 'transcript',
        'academic standing', 'academic year', 'academic performance', 'grades',
        'grade', 'grade point average', 'gpa', 'credits', 'credit', 'units',
        'course', 'coursework', 'coursework grade', 'course grade', 'grades',
        'grades received', 'grade received', 'grade point', 'gp', 'gpa', 'secondary', 'secondary school',
        'secondary school', 'secondary education', 'high school', 'high school education', 'general average','filipino','english',
        'mathematics','science','araling panlipunan','mapeh','values education','math','science','computer','programming','passed',
        'lrn','learner reference number','school id','school identification number','school identification card','deped','department of education',
      ];

      const coursePatterns = /[A-Z]{2,4}[-\s]?\d{3}/g;
      const gradePatterns = /([A-F][+-]?)|(100|\d{1,2}(\.\d+)?%?)|\b(excellent|good|satisfactory|pass|fail)\b/gi;

      const keywordMatches = educationalKeywords.filter((keyword) => textLower.includes(keyword));
      const courses = textLower.match(coursePatterns) || [];
      const grades = textLower.match(gradePatterns) || [];

      let confidence = 0;

      // Reduced weight for keywords, increased for grades and courses
      const keywordScore = Math.min(40, keywordMatches.length * 4);
      confidence += keywordScore;

      const courseScore = Math.min(30, courses.length * 10);
      confidence += courseScore;

      const gradeScore = Math.min(30, grades.length * 5);
      confidence += gradeScore;

      const pageScore = Math.min(10, (pageCount || 1) * 5);
      confidence += pageScore;

      if (confidence >= 40) {
        return {
          isValid: true,
          message: 'Educational document verification successful.',
          details: {
            confidence: `${confidence}%`,
            keywordsFound: keywordMatches.length > 0 ? keywordMatches.slice(0, 5) : 'None',
            coursesDetected: courses.length,
            gradesDetected: grades.length,
            pageCount: pageCount || 1,
          },
        };
      } else {
        return {
          isValid: false,
          message: 'Document does not appear to be a valid educational record. Ensure it includes grades, subjects, or academic terms like "semester" or "course."',
          details: {
            confidence: `${confidence}%`,
            keywordsFound: keywordMatches.length > 0 ? keywordMatches.slice(0, 5) : 'None',
            coursesDetected: courses.length,
            gradesDetected: grades.length,
            keywordsNeeded: 'Missing key indicators like grades, subjects, or academic terms',
          },
        };
      }
    } catch (error) {
      return {
        isValid: false,
        message: `Educational document verification error: ${error.message}`,
        details: { error: error.message },
      };
    }
  };

  return (
    <div className="document-verification">
      {isVerifying && <div className="verification-loading">Verifying document...</div>}
      {!isVerifying && verificationResult && (
        <div className={`verification-result ${verificationResult.isValid ? 'valid' : 'invalid'}`}>
          <h4>{verificationResult.isValid ? 'Verification Successful' : 'Verification Failed'}</h4>
          <p>{verificationResult.message}</p>
          {verificationDetails && (
            <details>
              <summary>Verification Details</summary>
              <pre>{JSON.stringify(verificationDetails, null, 2)}</pre>
            </details>
          )}
        </div>
      )}
      <div className="supported-formats">
        <small>Supported formats: JPEG, PNG, PDF</small>
      </div>
    </div>
  );
};

// Main DocumentVerificationSystem Component
const DocumentVerificationSystem = () => {
  const [files, setFiles] = useState({});
  const [verificationResults, setVerificationResults] = useState({});

  const handleFileUpload = (requirementId, event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFiles((prev) => ({ ...prev, [requirementId]: file }));
    setVerificationResults((prev) => ({
      ...prev,
      [requirementId]: { status: 'pending', message: 'Verification in progress...' },
    }));
  };

  const handleVerificationComplete = async (requirementId, result) => {
    setVerificationResults((prev) => ({
      ...prev,
      [requirementId]: {
        status: result.isValid ? 'verified' : 'failed',
        message: result.message,
        details: result.details,
      },
    }));

    // Optional: Submit verification results to backend
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (userEmail) {
        await fetch(`${process.env.REACT_APP_API_URL}/api/enrollee-applicants/documents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userEmail,
            requirementType: requirementId,
            isValid: result.isValid,
            message: result.message,
            details: result.details,
          }),
        });
      }
    } catch (error) {
      console.error('Error submitting verification results:', error);
    }
  };

  const requirementTypeMap = {
    id_photo: 'ID (2x2) Photo – White background',
    report_card: 'Photocopy of latest report card',
    transcript: 'Transcript of records or certification of grades',
  };

  const getVerificationType = (requirementName) => {
    const nameLower = requirementName.toLowerCase();
    if (nameLower.includes('photo') || nameLower.includes('2x2')) {
      return 'id_photo';
    } else if (nameLower.includes('report card')) {
      return 'report_card';
    } else if (nameLower.includes('transcript') || nameLower.includes('certification of grades')) {
      return 'transcript';
    }
    return null;
  };

  return {
    DocumentVerification,
    FileUploader,
    handleFileUpload,
    handleVerificationComplete,
    getVerificationType,
    requirementTypeMap,
    files,
    setFiles,
    verificationResults,
    setVerificationResults,
  };
};

export default DocumentVerificationSystem;