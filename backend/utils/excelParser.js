import XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';
import JSZip from 'jszip';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ExcelParser {
  constructor() {
    this.supportedFormats = ['xlsx', 'xls', 'csv'];
    // Create images directory for storing extracted images
    const backendRoot = path.dirname(__dirname);
    this.imagesDir = path.join(backendRoot, 'public', 'product-images');
    
    // Ensure images directory exists
    if (!fs.existsSync(this.imagesDir)) {
      fs.mkdirSync(this.imagesDir, { recursive: true });
      console.log('✅ Created product-images directory:', this.imagesDir);
    }
  }

  /**
   * Parse Excel/CSV file and extract product data
   * @param {string} filePath - Path to the uploaded file
   * @param {string} originalName - Original filename
   * @returns {Object} Parsed data with products and metadata
   */
  async parseFile(filePath, originalName) {
    console.log(`🔍 CHECKPOINT 0.1: parseFile called with filePath: ${filePath}, originalName: ${originalName}`);
    try {
      const fileExt = path.extname(originalName).toLowerCase().substring(1);
      console.log(`🔍 CHECKPOINT 0.2: File extension: ${fileExt}`);
      
      if (!this.supportedFormats.includes(fileExt)) {
        throw new Error(`Unsupported file format: ${fileExt}`);
      }

      // Read the file
      console.log(`🔍 CHECKPOINT 0.3: Reading Excel file with XLSX...`);
      const workbook = XLSX.readFile(filePath);
      console.log(`🔍 CHECKPOINT 0.4: File read successfully`);
      
      // Get the first worksheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      console.log(`🔍 CHECKPOINT 0.5: Using worksheet: ${sheetName}`);
      
      // Convert to JSON
      console.log(`🔍 CHECKPOINT 0.6: Converting worksheet to JSON...`);
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: '',
        raw: false
      });
      console.log(`🔍 CHECKPOINT 0.7: JSON conversion complete. Rows: ${jsonData.length}`);

      if (jsonData.length === 0) {
        throw new Error('File is empty or contains no data');
      }

      // Extract headers (first row)
      console.log(`🔍 CHECKPOINT 0.8: Extracting headers from first row...`);
      console.log(`🔍 CHECKPOINT 0.8.1: Raw first row: ${JSON.stringify(jsonData[0])}`);
      const headers = jsonData[0].map(header => 
        header ? header.toString().trim().toLowerCase() : ''
      );
      console.log(`🔍 CHECKPOINT 0.9: Headers extracted (after lowercase): ${JSON.stringify(headers)}`);
      console.log(`🔍 CHECKPOINT 0.9.1: Looking for "part image" in headers...`);
      const partImageIndex = headers.findIndex(h => h.includes('part') && h.includes('image'));
      console.log(`🔍 CHECKPOINT 0.9.2: Found "part image" at index: ${partImageIndex !== -1 ? partImageIndex : 'NOT FOUND'}`);

      // Find column indices for required fields
      console.log(`🔍 CHECKPOINT 0.10: Mapping columns...`);
      const columnMap = this.mapColumns(headers);
      console.log(`🔍 CHECKPOINT 0.11: Column mapping complete: ${JSON.stringify(columnMap)}`);
      
      // Check if image column was found
      console.log(`🔍 CHECKPOINT 0.12: Checking if image column was found...`);
      if (columnMap.image === undefined || columnMap.image === null) {
        console.error('⚠️ WARNING: Image column not found in Excel headers!');
        console.error('⚠️ Headers:', headers);
        console.error('⚠️ Looking for variations: partimage, part image, image, photo, picture, img');
        console.log(`🔍 CHECKPOINT 0.13: Image column NOT FOUND in columnMap`);
      } else {
        console.log(`✅ Image column found at index ${columnMap.image} (header: "${headers[columnMap.image]}")`);
        console.log(`🔍 CHECKPOINT 0.14: Image column FOUND at index ${columnMap.image}`);
      }
      
      // Use file name (without extension) as category
      // If originalName is not provided, fall back to sheet name
      const fileName = originalName ? path.basename(originalName, path.extname(originalName)) : sheetName;
      const category = fileName.trim();
      
      // Parse data rows
      const products = [];
      const errors = [];
      
      console.log(`📊 Excel file has ${jsonData.length} total rows (including header)`);
      console.log(`📊 Processing ${jsonData.length - 1} data rows...`);
      
      // Extract images first if image column is found
      let extractedImages = {};
      console.log(`🔍 CHECKPOINT 1: Image column mapping - ${columnMap.image !== undefined && columnMap.image !== null ? `Found at index ${columnMap.image}` : 'NOT FOUND'}`);
      if (columnMap.image !== undefined && columnMap.image !== null) {
        if (fileExt === 'xlsx') {
          // For XLSX files, try to extract embedded images
          console.log('🖼️  ====== STARTING IMAGE EXTRACTION (XLSX) ======');
        console.log(`📋 Image column index: ${columnMap.image}, Column letter: ${this.getColumnLetter(columnMap.image)}`);
        console.log(`📁 Excel file path: ${filePath}`);
        try {
          const exceljsWorkbook = new ExcelJS.Workbook();
          await exceljsWorkbook.xlsx.readFile(filePath);
          const exceljsWorksheet = exceljsWorkbook.worksheets[0];
          
          // Debug: Check if worksheet has images
          console.log(`📂 Reading Excel file with ExcelJS...`);
          const allImages = exceljsWorksheet.getImages();
          console.log(`📸 Found ${allImages ? allImages.length : 0} images in worksheet`);
          
          // CRITICAL DEBUG: Log ALL image details
          if (allImages && allImages.length > 0) {
            console.log(`═══════════════════════════════════════════════════════`);
            console.log(`🔍 DEBUG: ALL IMAGES FOUND IN WORKSHEET:`);
            allImages.forEach((img, idx) => {
              console.log(`   Image ${idx}:`);
              console.log(`     - imageId: ${img.imageId}`);
              console.log(`     - name: ${img.name || 'N/A'}`);
              console.log(`     - extension: ${img.extension || 'N/A'}`);
              console.log(`     - range: ${img.range ? `top=${img.range.top}, bottom=${img.range.bottom}, left=${img.range.left}, right=${img.range.right}` : 'N/A'}`);
              console.log(`     - range (letters): ${img.range ? `${this.getColumnLetter(img.range.left)}${img.range.top}:${this.getColumnLetter(img.range.right)}${img.range.bottom}` : 'N/A'}`);
            });
            console.log(`═══════════════════════════════════════════════════════`);
          } else {
            console.log(`⚠️  WARNING: getImages() returned ${allImages ? 'empty array' : 'null/undefined'}`);
          }
          
            // Debug: Log workbook media info - try multiple ways to access
            let mediaArray = [];
          if (exceljsWorkbook.model && exceljsWorkbook.model.media) {
              mediaArray = exceljsWorkbook.model.media;
              console.log(`📦 Workbook.model.media has ${mediaArray.length} media items`);
            } else if (exceljsWorkbook.xlsx && exceljsWorkbook.xlsx.model && exceljsWorkbook.xlsx.model.media) {
              mediaArray = exceljsWorkbook.xlsx.model.media;
              console.log(`📦 Workbook.xlsx.model.media has ${mediaArray.length} media items`);
            } else {
              console.log(`⚠️  Workbook media not found in model or xlsx.model`);
            }
            
            if (mediaArray.length > 0) {
              mediaArray.forEach((media, idx) => {
                const bufferInfo = media.buffer ? 'present' : (media.target && media.target.buffer ? 'present (in target)' : 'missing');
                console.log(`   Media ${idx}: type=${media.type || 'unknown'}, name=${media.name || 'unknown'}, buffer=${bufferInfo}, index=${media.index !== undefined ? media.index : 'N/A'}`);
              });
          }
          
          if (allImages && allImages.length > 0) {
            console.log(`📸 Image locations:`, allImages.map(img => ({
              name: img.name,
              range: img.range ? `${this.getColumnLetter(img.range.left)}${img.range.top}:${this.getColumnLetter(img.range.right)}${img.range.bottom}` : 'unknown',
              extension: img.extension
            })));
          }
          
          // PRE-EXTRACTION: Try to extract ALL images from ZIP file directly
          // This is a fallback if ExcelJS's getImages() doesn't work
          let zipImages = {};
          try {
            console.log(`🔧 PRE-EXTRACTION: Attempting direct ZIP extraction to find all images...`);
            const fileBuffer = fs.readFileSync(filePath);
            const zip = await JSZip.loadAsync(fileBuffer);
            
            const imageFiles = Object.keys(zip.files).filter(name => 
              name.startsWith('xl/media/') && 
              !name.endsWith('/') &&
              (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.gif') || name.endsWith('.webp'))
            );
            
            if (imageFiles.length > 0) {
              console.log(`✅ PRE-EXTRACTION: Found ${imageFiles.length} image files in ZIP: ${imageFiles.slice(0, 5).join(', ')}${imageFiles.length > 5 ? '...' : ''}`);
              
              // Extract all images and store them indexed by position
              for (let imgIdx = 0; imgIdx < imageFiles.length; imgIdx++) {
                const imageFileName = imageFiles[imgIdx];
                const imageFile = zip.files[imageFileName];
                if (imageFile) {
                  const imageBuffer = await imageFile.async('nodebuffer');
                  
                  // Determine MIME type
                  let mimeType = 'image/png';
                  if (imageFileName.includes('.jpg') || imageFileName.includes('.jpeg')) {
                    mimeType = 'image/jpeg';
                  } else if (imageFileName.includes('.png')) {
                    mimeType = 'image/png';
                  } else if (imageFileName.includes('.gif')) {
                    mimeType = 'image/gif';
                  } else if (imageFileName.includes('.webp')) {
                    mimeType = 'image/webp';
                  }
                  
                  const base64Image = this.bufferToBase64(imageBuffer, mimeType);
                  // Store by index (0-based), will map to row number later
                  zipImages[imgIdx] = base64Image;
                  
                  if (imgIdx < 3) {
                    console.log(`   ✅ Extracted image ${imgIdx} (${imageFileName}): ${Math.round(base64Image.length / 1024)}KB`);
                  }
                }
              }
              console.log(`✅ PRE-EXTRACTION: Successfully extracted ${Object.keys(zipImages).length} images from ZIP`);
            } else {
              console.log(`⚠️  PRE-EXTRACTION: No image files found in xl/media/ folder`);
            }
          } catch (preExtractError) {
            console.log(`⚠️  PRE-EXTRACTION failed: ${preExtractError.message}`);
          }
          
          // Process each data row (skip header row, so start at row 2 in ExcelJS)
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            const rowNumber = i + 1; // Excel row number (1-based, including header)
            const colIndex = columnMap.image + 1; // ExcelJS is 1-based
            const colLetter = this.getColumnLetter(columnMap.image);
            
            // Find image that overlaps with this cell
            let cellImage = null;
            if (allImages && allImages.length > 0) {
              // DEBUG: Log what we're looking for
              if (i <= 3) {
                console.log(`🔍 Row ${rowNumber}: Looking for image in column ${colLetter} (index ${colIndex}, 0-based: ${columnMap.image})`);
              }
              
              cellImage = allImages.find(img => {
                if (!img.range) {
                  if (i <= 3) console.log(`   ⚠️  Image has no range property`);
                  return false;
                }
                // Check if image range includes our cell (rowNumber, colIndex)
                // ExcelJS range is 1-based, so we need to check correctly
                const top = img.range.top || 0;
                const bottom = img.range.bottom || 0;
                const left = img.range.left || 0;
                const right = img.range.right || 0;
                
                // DEBUG for first few rows
                if (i <= 3) {
                  console.log(`   Checking image: range ${this.getColumnLetter(left)}${top}:${this.getColumnLetter(right)}${bottom}`);
                  console.log(`   Our cell: ${colLetter}${rowNumber} (colIndex=${colIndex}, rowNumber=${rowNumber})`);
                  console.log(`   Match check: row ${rowNumber} >= ${top} && <= ${bottom} = ${rowNumber >= top && rowNumber <= bottom}`);
                  console.log(`   Match check: col ${colIndex} >= ${left} && <= ${right} = ${colIndex >= left && colIndex <= right}`);
                }
                
                // Check if image overlaps with our cell
                const rowMatch = rowNumber >= top && rowNumber <= bottom;
                const colMatch = colIndex >= left && colIndex <= right;
                
                if (rowMatch && colMatch) {
                  if (i <= 3) console.log(`   ✅ MATCH FOUND!`);
                  return true;
                }
                return false;
              });
              
              if (!cellImage && i <= 3) {
                console.log(`   ❌ No image found for row ${rowNumber}, column ${colLetter}`);
              }
            } else if (i <= 3) {
              console.log(`   ⚠️  No images available to search (allImages is ${allImages ? 'empty' : 'null/undefined'})`);
            }
            
              if (cellImage) {
                try {
                  // Try different ways to access the image buffer
                  let imageBuffer = null;
                  let imageType = null;
                  
                  // Try multiple methods to access the image buffer
                  // Method 1: Try accessing via model.media by index
                  if (exceljsWorkbook.model && exceljsWorkbook.model.media && cellImage.imageId !== undefined) {
                    const imageMedia = exceljsWorkbook.model.media[cellImage.imageId];
                    if (imageMedia) {
                      if (imageMedia.buffer) {
                        imageBuffer = imageMedia.buffer;
                        imageType = imageMedia.type;
                      } else if (imageMedia.target && imageMedia.target.buffer) {
                        imageBuffer = imageMedia.target.buffer;
                        imageType = imageMedia.target.type;
                      }
                    }
                  }
                  
                  // Method 2: Try finding by index in model.media array
                  if (!imageBuffer && exceljsWorkbook.model && exceljsWorkbook.model.media && cellImage.imageId !== undefined) {
                    const imageMedia = exceljsWorkbook.model.media.find(m => m.index === cellImage.imageId);
                    if (imageMedia) {
                      if (imageMedia.buffer) {
                        imageBuffer = imageMedia.buffer;
                        imageType = imageMedia.type;
                      } else if (imageMedia.target && imageMedia.target.buffer) {
                        imageBuffer = imageMedia.target.buffer;
                        imageType = imageMedia.target.type;
                      }
                    }
                  }
                  
                  // Method 3: Try accessing via workbook.xlsx.model.media
                  if (!imageBuffer && exceljsWorkbook.xlsx && exceljsWorkbook.xlsx.model && exceljsWorkbook.xlsx.model.media) {
                    if (cellImage.imageId !== undefined && exceljsWorkbook.xlsx.model.media[cellImage.imageId]) {
                      const imageMedia = exceljsWorkbook.xlsx.model.media[cellImage.imageId];
                      if (imageMedia && imageMedia.buffer) {
                        imageBuffer = imageMedia.buffer;
                        imageType = imageMedia.type;
                      }
                    }
                    
                    // Also try finding by index
                    if (!imageBuffer && cellImage.imageId !== undefined) {
                      const imageMedia = exceljsWorkbook.xlsx.model.media.find(m => m.index === cellImage.imageId);
                      if (imageMedia && imageMedia.buffer) {
                        imageBuffer = imageMedia.buffer;
                        imageType = imageMedia.type;
                      }
                    }
                  }
                  
                  // Method 4: Try accessing via worksheet's image collection
                  if (!imageBuffer && cellImage.imageId !== undefined) {
                    try {
                      // Try to get image by ID from worksheet
                      const worksheetImages = exceljsWorksheet.getImages();
                      const foundImage = worksheetImages.find(img => img.imageId === cellImage.imageId);
                      if (foundImage) {
                        // Try to get buffer from workbook media using the imageId
                        if (exceljsWorkbook.model && exceljsWorkbook.model.media) {
                          const mediaItem = exceljsWorkbook.model.media[foundImage.imageId];
                          if (mediaItem && mediaItem.buffer) {
                            imageBuffer = mediaItem.buffer;
                            imageType = mediaItem.type;
                          }
                        }
                      }
                    } catch {
                      // Ignore, try next method
                    }
                  }
                  
                  // Method 5: Try accessing workbook's xlsx zip file directly (if available)
                  if (!imageBuffer && exceljsWorkbook.xlsx) {
                    try {
                      // ExcelJS stores images in xl/media/ folder in the zip
                      // Try to access zip through different possible paths
                      const zip = exceljsWorkbook.xlsx.zip || 
                                  (exceljsWorkbook.xlsx.stream && exceljsWorkbook.xlsx.stream.zip) ||
                                  (exceljsWorkbook.xlsx.model && exceljsWorkbook.xlsx.model.zip);
                      
                      if (zip && zip.files) {
                        const imageFiles = Object.keys(zip.files).filter(name => name.startsWith('xl/media/'));
                        if (imageFiles.length > 0 && cellImage.imageId !== undefined) {
                          // Try to match by index (imageId might be 0-based or 1-based)
                          let imageFileName = imageFiles[cellImage.imageId];
                          if (!imageFileName && cellImage.imageId > 0) {
                            imageFileName = imageFiles[cellImage.imageId - 1];
                          }
                          if (!imageFileName) {
                            // Try finding by pattern
                            imageFileName = imageFiles.find(f => {
                              const match = f.match(/image(\d+)/);
                              return match && parseInt(match[1]) === cellImage.imageId;
                            });
                          }
                          
                          if (imageFileName) {
                            const imageFile = zip.files[imageFileName];
                            if (imageFile) {
                              // Try different ways to get the buffer
                              imageBuffer = imageFile._data || 
                                          (imageFile.asNodeBuffer && imageFile.asNodeBuffer()) ||
                                          (imageFile.data && imageFile.data);
                              
                              // Determine type from filename
                              if (imageFileName.includes('.jpg') || imageFileName.includes('.jpeg')) {
                                imageType = 'image/jpeg';
                              } else if (imageFileName.includes('.png')) {
                                imageType = 'image/png';
                              } else if (imageFileName.includes('.gif')) {
                                imageType = 'image/gif';
                              } else if (imageFileName.includes('.webp')) {
                                imageType = 'image/webp';
                              }
                            }
                          }
                        }
                      }
                    } catch (zipError) {
                      // Zip access might not be available or work differently
                      if (i < 3) {
                        console.log(`   Note: Could not access zip file for image extraction: ${zipError.message}`);
                      }
                    }
                  }
                  
                  // Method 6: DIRECT ZIP EXTRACTION - Read Excel file as ZIP and extract images
                  if (!imageBuffer) {
                    try {
                      console.log(`   🔧 Method 6: Trying direct ZIP extraction for row ${rowNumber}...`);
                      const fileBuffer = fs.readFileSync(filePath);
                      const zip = await JSZip.loadAsync(fileBuffer);
                      
                      // Get all image files from xl/media/
                      const imageFiles = Object.keys(zip.files).filter(name => 
                        name.startsWith('xl/media/') && 
                        !name.endsWith('/') &&
                        (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.gif') || name.endsWith('.webp'))
                      );
                      
                      if (imageFiles.length > 0) {
                        console.log(`   📦 Found ${imageFiles.length} image files in ZIP: ${imageFiles.join(', ')}`);
                        
                        // Try to match image by row number (images are usually numbered sequentially)
                        // For now, let's try to match by position - if we have multiple images, try to match by order
                        // This is a heuristic - we'll try image at position (rowNumber - 2) since row 1 is header
                        let imageIndex = rowNumber - 2; // rowNumber is 1-based, header is row 1, so first data row is 2
                        if (imageIndex >= 0 && imageIndex < imageFiles.length) {
                          const imageFileName = imageFiles[imageIndex];
                          console.log(`   🎯 Trying image file ${imageIndex}: ${imageFileName} for row ${rowNumber}`);
                          const imageFile = zip.files[imageFileName];
                          if (imageFile) {
                            imageBuffer = await imageFile.async('nodebuffer');
                            
                            // Determine type from filename
                            if (imageFileName.includes('.jpg') || imageFileName.includes('.jpeg')) {
                              imageType = 'image/jpeg';
                            } else if (imageFileName.includes('.png')) {
                              imageType = 'image/png';
                            } else if (imageFileName.includes('.gif')) {
                              imageType = 'image/gif';
                            } else if (imageFileName.includes('.webp')) {
                              imageType = 'image/webp';
                            }
                            
                            console.log(`   ✅ Successfully extracted image buffer from ZIP! Size: ${imageBuffer.length} bytes, Type: ${imageType}`);
                          }
                        } else {
                          // If we can't match by position, try all images and see which one matches the cell
                          // For now, let's just try the first image as a test
                          if (i < 3) {
                            console.log(`   ⚠️  Could not match image by position. Trying first available image...`);
                            const imageFileName = imageFiles[0];
                            const imageFile = zip.files[imageFileName];
                            if (imageFile) {
                              imageBuffer = await imageFile.async('nodebuffer');
                              if (imageFileName.includes('.jpg') || imageFileName.includes('.jpeg')) {
                                imageType = 'image/jpeg';
                              } else if (imageFileName.includes('.png')) {
                                imageType = 'image/png';
                              }
                              console.log(`   ✅ Extracted first available image: ${imageFileName}`);
                            }
                          }
                        }
                      } else {
                        if (i < 3) {
                          console.log(`   ⚠️  No image files found in xl/media/ folder`);
                        }
                      }
                    } catch (zipDirectError) {
                      if (i < 3) {
                        console.log(`   ❌ Direct ZIP extraction failed: ${zipDirectError.message}`);
                      }
                    }
                  }
                  
                  if (imageBuffer) {
                    // Get part number for naming
                    const partNumberRaw = this.getCellValue(row, columnMap.partNumber);
                    const partNumber = partNumberRaw ? partNumberRaw.trim() : `row_${rowNumber}`;
                    
                    // Determine MIME type
                    let mimeType = 'image/png';
                    if (imageType) {
                      if (imageType.includes('jpeg') || imageType.includes('jpg')) {
                        mimeType = 'image/jpeg';
                      } else if (imageType.includes('png')) {
                        mimeType = 'image/png';
                      } else if (imageType.includes('gif')) {
                        mimeType = 'image/gif';
                      } else if (imageType.includes('webp')) {
                        mimeType = 'image/webp';
                      }
                    } else {
                      // Try to determine from extension
                      const ext = cellImage.extension || 'png';
                      if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
                      else if (ext === 'png') mimeType = 'image/png';
                      else if (ext === 'gif') mimeType = 'image/gif';
                      else if (ext === 'webp') mimeType = 'image/webp';
                    }
                    
                    // Convert to base64 data URL for database storage
                    console.log(`🔍 CHECKPOINT 2.${rowNumber}: Converting image buffer to base64...`);
                    const base64Image = this.bufferToBase64(imageBuffer, mimeType);
                    console.log(`🔍 CHECKPOINT 3.${rowNumber}: Base64 conversion complete. Length: ${base64Image ? base64Image.length : 0} chars`);
                    extractedImages[rowNumber] = base64Image;
                    console.log(`🔍 CHECKPOINT 4.${rowNumber}: Stored base64 image in extractedImages[${rowNumber}]`);
                    
                    if (i < 5) {
                      console.log(`✅ Extracted image for row ${rowNumber} (${partNumber}): converted to base64 (${Math.round(base64Image.length / 1024)}KB)`);
                      console.log(`🔍 CHECKPOINT 5.${rowNumber}: Base64 preview: ${base64Image ? base64Image.substring(0, 100) + '...' : 'null'}`);
                  }
                } else {
                  if (i < 3) {
                      console.log(`⚠️  Image found for row ${rowNumber} but could not extract buffer. ImageId: ${cellImage.imageId}, Name: ${cellImage.name || 'N/A'}`);
                    }
                }
              } catch (imgError) {
                console.error(`❌ Error extracting image from row ${rowNumber}: ${imgError.message}`);
                console.error(`   Stack: ${imgError.stack}`);
              }
            } else {
              // Debug: Log when no image is found for first few rows
              if (i < 3) {
                  console.log(`⚠️  No embedded image found for row ${rowNumber}, cell ${colLetter}${rowNumber}`);
                  console.log(`   🔧 Trying direct ZIP extraction as fallback...`);
                }
              
              // FALLBACK: Use pre-extracted ZIP images if available
              // This handles cases where getImages() doesn't work but images exist in the file
              if (!extractedImages[rowNumber] && Object.keys(zipImages).length > 0) {
                // Try to match by row position (rowNumber - 2 because header is row 1, first data row is 2)
                let imageIndex = rowNumber - 2;
                if (imageIndex >= 0 && imageIndex < Object.keys(zipImages).length) {
                  const base64Image = zipImages[imageIndex];
                  if (base64Image) {
                    extractedImages[rowNumber] = base64Image;
                    
                    if (i < 5) {
                      const partNumberRaw = this.getCellValue(row, columnMap.partNumber);
                      const partNumber = partNumberRaw ? partNumberRaw.trim() : `row_${rowNumber}`;
                      console.log(`✅ FALLBACK: Using pre-extracted ZIP image ${imageIndex} for row ${rowNumber} (${partNumber}): ${Math.round(base64Image.length / 1024)}KB`);
                    }
                  }
                } else if (i < 3) {
                  console.log(`   ⚠️  Row ${rowNumber} imageIndex ${imageIndex} out of range (0-${Object.keys(zipImages).length - 1})`);
                }
              }
            }
          } // End of for loop
          
          console.log(`✅ Extracted ${Object.keys(extractedImages).length} embedded images from ${jsonData.length - 1} rows`);
          console.log(`═══════════════════════════════════════════════════════`);
          console.log(`🔍 CHECKPOINT IMAGE_EXTRACTION_SUMMARY: XLSX Image Extraction Complete`);
          console.log(`🔍 Total images extracted: ${Object.keys(extractedImages).length}`);
          console.log(`🔍 Total data rows: ${jsonData.length - 1}`);
          if (Object.keys(extractedImages).length > 0) {
            console.log(`🔍 Rows with images: ${Object.keys(extractedImages).join(', ')}`);
            const firstKey = Object.keys(extractedImages)[0];
            const firstImage = extractedImages[firstKey];
            console.log(`🔍 First image (row ${firstKey}): ${firstImage ? `base64 (${Math.round(firstImage.length / 1024)}KB)` : 'null'}`);
          } else {
            console.log(`⚠️  NO IMAGES EXTRACTED! extractedImages object is empty.`);
            console.log(`⚠️  This means images were not found in the Excel file or extraction failed.`);
          }
          console.log(`═══════════════════════════════════════════════════════`);
        } catch (exceljsError) {
          console.error(`⚠️  Error reading Excel with exceljs: ${exceljsError.message}`);
          console.error(`   Stack: ${exceljsError.stack}`);
          console.log('⚠️  Continuing without embedded image extraction...');
        }
        } else {
          // For CSV files, we'll extract image URLs/paths from cell values and convert to base64
          console.log(`📋 Image column found for ${fileExt.toUpperCase()} file - will extract and convert images to base64`);
          
          // Pre-process CSV rows to handle image URLs/paths
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            const rowNumber = i + 1;
            const imageCellValue = this.getCellValue(row, columnMap.image);
            
            if (imageCellValue && imageCellValue.trim()) {
              const imageValue = imageCellValue.trim();
              
              try {
                // Check if it's a URL
                if (imageValue.startsWith('http://') || imageValue.startsWith('https://')) {
                  // Download image from URL and convert to base64
                  try {
                    const base64Image = await this.downloadImageToBase64(imageValue);
                    extractedImages[rowNumber] = base64Image;
                    
                    if (i < 5) {
                      const partNumberRaw = this.getCellValue(row, columnMap.partNumber);
                      const partNumber = partNumberRaw ? partNumberRaw.trim() : `row_${rowNumber}`;
                      console.log(`✅ Downloaded image from URL for row ${rowNumber} (${partNumber}): converted to base64 (${Math.round(base64Image.length / 1024)}KB)`);
                    }
                  } catch (downloadError) {
                    console.error(`❌ Error downloading image from URL for row ${rowNumber}: ${downloadError.message}`);
                    // Continue without image
                  }
                } else {
                  // Try as local file path
                  let imageFilePath = null;
                  
                  // Try relative to uploaded file directory first
                  const uploadedFileDir = path.dirname(filePath);
                  const possibleImagePath = path.resolve(uploadedFileDir, imageValue);
                  
                  if (fs.existsSync(possibleImagePath)) {
                    imageFilePath = possibleImagePath;
                  } else if (fs.existsSync(imageValue)) {
                    // Try absolute path
                    imageFilePath = imageValue;
                  }
                  
                  if (imageFilePath) {
                    // Read local image file and convert to base64
                    const base64Image = this.readImageFileToBase64(imageFilePath);
                    if (base64Image) {
                      extractedImages[rowNumber] = base64Image;
                      
                      if (i < 5) {
                        const partNumberRaw = this.getCellValue(row, columnMap.partNumber);
                        const partNumber = partNumberRaw ? partNumberRaw.trim() : `row_${rowNumber}`;
                        console.log(`✅ Read image file for row ${rowNumber} (${partNumber}): converted to base64 (${Math.round(base64Image.length / 1024)}KB)`);
                      }
                    } else {
                      if (i < 3) {
                        console.log(`⚠️  Could not read image file for row ${rowNumber}: ${imageFilePath}`);
                      }
                    }
                  } else {
                    // Not a valid file path or URL, skip
                    if (i < 3) {
                      console.log(`⚠️  Image path/URL not found for row ${rowNumber}: ${imageValue}`);
                    }
                  }
                }
              } catch (error) {
                console.error(`❌ Error processing image for row ${rowNumber}: ${error.message}`);
              }
            }
          }
          
          // Summary for CSV
          console.log(`═══════════════════════════════════════════════════════`);
          console.log(`🔍 CHECKPOINT IMAGE_EXTRACTION_SUMMARY: CSV Image Extraction Complete`);
          console.log(`🔍 Total images extracted: ${Object.keys(extractedImages).length}`);
          console.log(`🔍 Total data rows: ${jsonData.length - 1}`);
          if (Object.keys(extractedImages).length > 0) {
            console.log(`🔍 Rows with images: ${Object.keys(extractedImages).join(', ')}`);
          } else {
            console.log(`⚠️  NO IMAGES EXTRACTED! extractedImages object is empty.`);
          }
          console.log(`═══════════════════════════════════════════════════════`);
        }
      } else {
        console.log('⚠️  Image column not found in file headers');
        console.log(`═══════════════════════════════════════════════════════`);
        console.log(`🔍 CHECKPOINT IMAGE_EXTRACTION_SUMMARY: NO IMAGE COLUMN FOUND`);
        console.log(`🔍 Column map: ${JSON.stringify(columnMap)}`);
        console.log(`═══════════════════════════════════════════════════════`);
      }
      
      console.log(`═══════════════════════════════════════════════════════`);
      console.log(`🔍 CHECKPOINT BEFORE_ROW_PROCESSING: About to process ${jsonData.length - 1} rows`);
      console.log(`🔍 extractedImages has ${Object.keys(extractedImages).length} entries`);
      console.log(`🔍 extractedImages keys: ${Object.keys(extractedImages).length > 0 ? Object.keys(extractedImages).slice(0, 10).join(', ') + (Object.keys(extractedImages).length > 10 ? '...' : '') : 'NONE'}`);
      console.log(`═══════════════════════════════════════════════════════`);
      
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        const rowNumber = i + 1;
        
        // Skip completely empty rows (all cells are empty or whitespace)
        const isEmptyRow = !row || row.every(cell => !cell || (typeof cell === 'string' && cell.trim() === ''));
        if (isEmptyRow) {
          console.log(`⏭️  Skipping empty row ${rowNumber}`);
          continue;
        }
        
        try {
          // Get extracted image path if available
          const extractedImagePath = extractedImages[rowNumber] || null;
          if (rowNumber <= 5 || extractedImagePath) {
            console.log(`🔍 CHECKPOINT 6.${rowNumber}: Before parseProductRow - extractedImagePath: ${extractedImagePath ? `base64 (${Math.round(extractedImagePath.length / 1024)}KB)` : 'null'}`);
            console.log(`🔍 CHECKPOINT 6.${rowNumber}.1: Checking extractedImages[${rowNumber}]: ${extractedImages[rowNumber] ? 'EXISTS' : 'NOT FOUND'}`);
          }
          const product = await this.parseProductRow(row, columnMap, rowNumber, category, extractedImagePath);
          if (rowNumber <= 5 || product.image) {
            console.log(`🔍 CHECKPOINT 7.${rowNumber}: After parseProductRow - product.image: ${product && product.image ? `base64 (${Math.round(product.image.length / 1024)}KB)` : 'null'}`);
          }
          if (product) {
            products.push(product);
            console.log(`🔍 CHECKPOINT 8.${rowNumber}: Product added to products array. Total products: ${products.length}`);
          } else {
            console.log(`⚠️  Row ${rowNumber} parsed but returned null`);
          }
        } catch (error) {
          console.log(`❌ Error parsing row ${rowNumber}: ${error.message}`);
          errors.push({
            row: rowNumber,
            error: error.message,
            data: row
          });
        }
      }
      
      console.log(`✅ Successfully parsed ${products.length} products, ${errors.length} errors`);

      return {
        success: true,
        data: {
          products,
          metadata: {
            totalRows: jsonData.length - 1,
            validProducts: products.length,
            errors: errors.length,
            fileName: originalName,
            sheetName,
            headers,
            columnMap
          },
          errors
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Map column headers to field names
   * @param {Array} headers - Array of header strings
   * @returns {Object} Column mapping object
   */
  mapColumns(headers) {
    const columnMap = {};
    
    // Define possible header variations
    const headerMappings = {
      id: ['id', 'product id', 'product_id', 'productid', 'uuid'],
      partNumber: ['part number', 'part no', 'partno', 'part_number', 'partnumber', 'sku', 'item code', 'itemcode'],
      description: ['description', 'desc', 'product description', 'product_desc', 'part description', 'part_description', 'name', 'product name', 'productname'],
      image: ['part image', 'partimage', 'image', 'photo', 'picture', 'img', 'part_image', 'product image', 'product_image'],
      category: ['category', 'cat', 'type', 'product type', 'product_type', 'group', 'product group'],
      price: ['price', 'cost', 'unit price', 'unit_price', 'selling price', 'selling_price', 'rate'],
      quantity: ['quantity', 'qty', 'stock', 'available', 'inventory'],
      unit: ['unit', 'uom', 'unit of measure', 'unit_of_measure'],
      brand: ['brand', 'manufacturer', 'make', 'company'],
      model: ['model', 'model number', 'model_number', 'version']
    };

    // Map headers to field names
    Object.keys(headerMappings).forEach(field => {
      const variations = headerMappings[field];
      console.log(`🔍 CHECKPOINT 0.10.${field}: Looking for field "${field}" with variations: ${variations.join(', ')}`);
      const index = headers.findIndex(header => {
        const match = variations.some(variation => header.includes(variation));
        if (match) {
          console.log(`🔍 CHECKPOINT 0.10.${field}: MATCH FOUND! Header "${header}" matches variation "${variations.find(v => header.includes(v))}"`);
        }
        return match;
      });
      if (index !== -1) {
        columnMap[field] = index;
        console.log(`🔍 CHECKPOINT 0.10.${field}: Mapped "${field}" to column index ${index} (header: "${headers[index]}")`);
      } else {
        console.log(`🔍 CHECKPOINT 0.10.${field}: No match found for "${field}"`);
      }
    });

    // Debug: Log the column mapping for verification
    console.log('📋 ====== COLUMN MAPPING DEBUG ======');
    console.log('📋 Headers found:', JSON.stringify(headers, null, 2));
    console.log('📋 Column mapping result:', JSON.stringify(columnMap, null, 2));
    
    // Check each field
    const requiredFields = ['id', 'partNumber', 'description', 'image'];
    requiredFields.forEach(field => {
      if (columnMap[field] !== undefined && columnMap[field] !== null) {
        console.log(`✅ ${field} found at index ${columnMap[field]} (header: "${headers[columnMap[field]]}")`);
      } else {
        console.error(`❌ ${field} NOT FOUND in column mapping!`);
      }
    });
    console.log('📋 ====================================');

    return columnMap;
  }

  /**
   * Parse a single product row
   * @param {Array} row - Data row
   * @param {Object} columnMap - Column mapping
   * @param {number} rowNumber - Row number for error reporting
   * @param {string} category - Category name from Excel sheet
   * @param {string|null} extractedImagePath - Path to extracted image from Excel (if any)
   * @returns {Object|null} Parsed product object
   */
  async parseProductRow(row, columnMap, rowNumber, category = 'General', extractedImagePath = null) {
    // Extract ID from Excel if provided, otherwise generate one
    const excelId = this.getCellValue(row, columnMap.id);
    
    // Extract basic required fields
    const partNumberRaw = this.getCellValue(row, columnMap.partNumber);
    const descriptionRaw = this.getCellValue(row, columnMap.description);
    
    // Trim and check for empty strings
    const partNumber = partNumberRaw ? partNumberRaw.trim() : '';
    const description = descriptionRaw ? descriptionRaw.trim() : '';

    // Validate required fields - but be more lenient
    // Allow rows with at least part number (description can be empty but warn)
    if (!partNumber) {
      throw new Error(`Missing required field: Part Number`);
    }

    // If description is empty, use a default or the part number
    const finalDescription = description || partNumber || 'No description';

    // Extract image - use extracted base64 image if available, otherwise null
    let image = null;
    console.log(`🔍 CHECKPOINT 9.${rowNumber}: parseProductRow called with extractedImagePath: ${extractedImagePath ? `base64 (${extractedImagePath.length} chars)` : 'null'}`);
    
    // First, use extracted base64 image if available (from Excel embedded images or CSV URLs/files)
    if (extractedImagePath) {
      // extractedImagePath now contains base64 data URL
      image = extractedImagePath;
      console.log(`🔍 CHECKPOINT 10.${rowNumber}: Using extracted base64 image. Image length: ${image.length} chars`);
      if (rowNumber <= 5) {
        const imageSize = image ? Math.round(image.length / 1024) : 0;
        console.log(`📸 Row ${rowNumber} - Using extracted base64 image (${imageSize}KB)`);
      }
    } else if (columnMap.image !== undefined && columnMap.image !== null) {
      // If no extracted image, check if cell has a value (for cases where extraction failed)
      const imageRaw = this.getCellValue(row, columnMap.image);
      
      // Only use cell value if it's already a base64 data URL
      if (imageRaw && imageRaw.trim().startsWith('data:image/')) {
        image = imageRaw.trim();
        if (rowNumber <= 5) {
          console.log(`📸 Row ${rowNumber} - Using base64 image from cell value`);
        }
      } else if (imageRaw && imageRaw.trim()) {
        // If it's not base64, it means extraction failed - log warning
        if (rowNumber <= 5) {
          console.log(`⚠️ Row ${rowNumber} - Image extraction failed, cell value: ${imageRaw.substring(0, 50)}...`);
        }
      }
      
      // Debug logging for first few products
      if (rowNumber <= 5) {
        console.log(`📸 Row ${rowNumber} - Part: ${partNumber}`);
        console.log(`📸 Image column index: ${columnMap.image}`);
        console.log(`📸 Has extracted image: ${extractedImagePath ? 'Yes' : 'No'}`);
        console.log(`📸 Image final value: ${image ? `base64 (${Math.round(image.length / 1024)}KB)` : '(null/empty)'}`);
      }
    } else {
      if (rowNumber <= 5) {
        console.log(`⚠️ Row ${rowNumber} - Image column not mapped`);
      }
    }

    // Use ID from Excel if provided, otherwise generate unique ID
    const id = excelId ? excelId.trim() : this.generateProductId(partNumber);

    // Final image value
    const finalImage = image;
    console.log(`🔍 CHECKPOINT 11.${rowNumber}: Final image value: ${finalImage ? `base64 (${finalImage.length} chars, starts with: ${finalImage.substring(0, 30)}...)` : 'null'}`);

    // Debug logging for first few products to check image extraction
    if (rowNumber <= 5) {
      console.log(`📤 Returning product with image: ${finalImage ? `base64 (${Math.round(finalImage.length / 1024)}KB)` : '(null)'}`);
    }

    const productObj = {
      id,
      partNumber: partNumber,
      description: finalDescription,
      image: finalImage, // Store base64 data URL
      category: category.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      rowNumber
    };
    
    console.log(`🔍 CHECKPOINT 12.${rowNumber}: Returning product object. Image field: ${productObj.image ? `base64 (${productObj.image.length} chars)` : 'null'}`);
    
    return productObj;
  }

  /**
   * Get cell value safely
   * @param {Array} row - Data row
   * @param {number} index - Column index
   * @returns {string} Cell value or empty string
   */
  getCellValue(row, index) {
    if (index === undefined || index === null) {
      return '';
    }
    // Check if the cell exists and has a value
    if (row[index] === undefined || row[index] === null || row[index] === '') {
      return '';
    }
    // Convert to string and trim
    const value = row[index].toString().trim();
    return value || '';
  }

  /**
   * Convert column index to Excel column letter (0-based index)
   * @param {number} index - Column index (0-based)
   * @returns {string} Excel column letter (A, B, C, ..., Z, AA, AB, etc.)
   */
  getColumnLetter(index) {
    let result = '';
    index++; // Convert to 1-based for Excel
    while (index > 0) {
      index--;
      result = String.fromCharCode(65 + (index % 26)) + result;
      index = Math.floor(index / 26);
    }
    return result;
  }

  /**
   * Parse price value
   * @param {string} value - Price string
   * @returns {number} Parsed price
   */
  parsePrice(value) {
    if (!value) return 0;
    
    // Remove currency symbols and commas
    const cleanValue = value.toString().replace(/[₹$€£,]/g, '');
    const parsed = parseFloat(cleanValue);
    
    return isNaN(parsed) ? 0 : Math.max(0, parsed);
  }

  /**
   * Parse number value
   * @param {string} value - Number string
   * @returns {number} Parsed number
   */
  parseNumber(value) {
    if (!value) return 0;
    
    const cleanValue = value.toString().replace(/,/g, '');
    const parsed = parseInt(cleanValue);
    
    return isNaN(parsed) ? 0 : Math.max(0, parsed);
  }

  /**
   * Generate unique product ID
   * @param {string} partNumber - Part number
   * @returns {string} Unique product ID
   */
  generateProductId(partNumber) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `prod_${partNumber.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}_${random}`;
  }

  /**
   * Convert image buffer to base64 data URL
   * @param {Buffer} buffer - Image buffer
   * @param {string} mimeType - MIME type (e.g., 'image/png', 'image/jpeg')
   * @returns {string} Base64 data URL
   */
  bufferToBase64(buffer, mimeType = 'image/png') {
    if (!buffer) return null;
    const base64 = buffer.toString('base64');
    return `data:${mimeType};base64,${base64}`;
  }

  /**
   * Download image from URL and convert to base64
   * @param {string} url - Image URL
   * @returns {Promise<string|null>} Base64 data URL or null if failed
   */
  async downloadImageToBase64(url) {
    return new Promise((resolve, reject) => {
      try {
        const urlObj = new URL(url);
        const client = urlObj.protocol === 'https:' ? https : http;
        
        client.get(url, (response) => {
          if (response.statusCode !== 200) {
            reject(new Error(`Failed to download image: ${response.statusCode}`));
            return;
          }

          const contentType = response.headers['content-type'] || 'image/jpeg';
          const chunks = [];

          response.on('data', (chunk) => {
            chunks.push(chunk);
          });

          response.on('end', () => {
            try {
              // eslint-disable-next-line no-undef
              const buffer = Buffer.concat(chunks);
              const base64 = this.bufferToBase64(buffer, contentType);
              resolve(base64);
            } catch (error) {
              reject(error);
            }
          });

          response.on('error', (error) => {
            reject(error);
          });
        }).on('error', (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Read local image file and convert to base64
   * @param {string} filePath - Path to image file
   * @returns {string|null} Base64 data URL or null if failed
   */
  readImageFileToBase64(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return null;
      }
      
      const buffer = fs.readFileSync(filePath);
      const ext = path.extname(filePath).toLowerCase();
      let mimeType = 'image/jpeg';
      
      if (ext === '.png') mimeType = 'image/png';
      else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
      else if (ext === '.gif') mimeType = 'image/gif';
      else if (ext === '.webp') mimeType = 'image/webp';
      
      return this.bufferToBase64(buffer, mimeType);
    } catch (error) {
      console.error(`Error reading image file ${filePath}:`, error.message);
      return null;
    }
  }

  /**
   * Validate file before parsing
   * @param {string} filePath - Path to file
   * @param {string} originalName - Original filename
   * @returns {Object} Validation result
   */
  validateFile(filePath, originalName) {
    try {
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new Error('File not found');
      }

      // Check file extension
      const fileExt = path.extname(originalName).toLowerCase().substring(1);
      if (!this.supportedFormats.includes(fileExt)) {
        throw new Error(`Unsupported file format: ${fileExt}. Supported formats: ${this.supportedFormats.join(', ')}`);
      }

      // Check file size (basic check)
      const stats = fs.statSync(filePath);
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (stats.size > maxSize) {
        throw new Error('File too large. Maximum size is 100MB.');
      }

      if (stats.size === 0) {
        throw new Error('File is empty');
      }

      return {
        success: true,
        message: 'File validation passed'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}
