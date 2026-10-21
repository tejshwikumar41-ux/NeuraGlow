'use client'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import html2canvas from 'html2canvas'

export async function exportToPDF(data, engineType) {
  if (!data) return null;
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.width
  const pageHeight = pdf.internal.pageSize.height
  
  // Cover page header
  pdf.setFillColor(79, 70, 229) // indigo
  pdf.rect(0, 0, pageWidth, 60, 'F')
  
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(28)
  pdf.setFont('helvetica', 'bold')
  pdf.text('NeuraGlow', 20, 30)
  
  pdf.setFontSize(12)
  pdf.text('AI-Powered Learning System', 20, 40)
  
  pdf.setTextColor(0, 0, 0)
  pdf.setFontSize(22)
  pdf.setFont('helvetica', 'bold')
  const cleanTopic = data.cleanTopic || data.title || 'Learning Topic'
  pdf.text(cleanTopic, 20, 90)
  
  pdf.setFontSize(11)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(100, 100, 100)
  pdf.text(`Category: ${data.category || 'General'}`, 20, 100)
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 108)
  
  let yPos = 130
  
  if (data.beginnerExplanation || data.simpleGoal) {
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Overview Goal', 20, yPos)
    yPos += 10
    
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'normal')
    const goalText = data.simpleGoal || data.beginnerExplanation?.oneLine || ''
    const lines = pdf.splitTextToSize(goalText, pageWidth - 40)
    pdf.text(lines, 20, yPos)
    yPos += lines.length * 6 + 10
  }
  
  // Add slides if present
  const slides = data.slides || data.ppt || []
  if (slides && slides.length > 0) {
    slides.forEach((slide, idx) => {
      pdf.addPage()
      
      pdf.setFillColor(79, 70, 229)
      pdf.rect(0, 0, pageWidth, 15, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(10)
      pdf.text(`Slide ${idx + 1} of ${slides.length}`, 20, 10)
      
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(20)
      pdf.setFont('helvetica', 'bold')
      pdf.text(slide.title || '', 20, 35)
      
      if (slide.subtitle) {
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'italic')
        pdf.setTextColor(100, 100, 100)
        pdf.text(slide.subtitle, 20, 45)
      }
      
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'normal')
      
      let bulletY = 60
      if (slide.bullets) {
        slide.bullets.forEach(bullet => {
          const bulletLines = pdf.splitTextToSize('• ' + bullet, pageWidth - 40)
          pdf.text(bulletLines, 20, bulletY)
          bulletY += bulletLines.length * 6 + 4
        })
      }
      
      if (slide.speakerNotes) {
        bulletY += 10
        pdf.setFillColor(243, 244, 246)
        pdf.rect(20, bulletY - 5, pageWidth - 40, 30, 'F')
        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'italic')
        pdf.setTextColor(80, 80, 80)
        pdf.text('SPEAKER NOTES:', 25, bulletY)
        const noteLines = pdf.splitTextToSize(slide.speakerNotes, pageWidth - 50)
        pdf.text(noteLines, 25, bulletY + 8)
      }
    })
  }
  
  // Save
  const filename = `NeuraGlow_${cleanTopic.replace(/\s+/g, '_')}.pdf`
  pdf.save(filename)
  return filename
}

export async function exportElementToPDF(elementId, filename) {
  const element = document.getElementById(elementId)
  if (!element) return
  
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff'
  })
  
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.width
  const imgHeight = (canvas.height * pageWidth) / canvas.width
  
  pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, imgHeight)
  pdf.save(filename || 'export.pdf')
}

export async function exportElementToPNG(elementId, filename) {
  const element = document.getElementById(elementId)
  if (!element) return
  
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff'
  })
  
  const link = document.createElement('a')
  link.download = filename || 'export.png'
  link.href = canvas.toDataURL('image/png')
  link.click()
}
