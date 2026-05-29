/*
 * Copyright (c) 2026. All rights reserved.
 */
package com.catalogue.service;

import com.catalogue.entity.*;
import com.catalogue.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.*;
import java.nio.file.*;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PdfService {

    private final PdfJobRepository pdfJobRepository;
    private final CatalogueRepository catalogueRepository;
    private final CatalogueItemRepository catalogueItemRepository;

    @Async
    @Transactional
    public void generatePdfAsync(UUID jobId) {
        PdfJob job = pdfJobRepository.findById(jobId).orElse(null);
        if (job == null) return;

        job.setStatus(PdfJob.Status.PROCESSING);
        job.setStartedAt(ZonedDateTime.now());
        pdfJobRepository.save(job);

        try {
            String filePath = generatePdf(job.getCatalogue());
            job.setStatus(PdfJob.Status.DONE);
            job.setFileUrl(filePath);
            job.setCompletedAt(ZonedDateTime.now());
            log.info("PDF generated: jobId={}, path={}", jobId, filePath);
        } catch (Exception e) {
            log.error("PDF generation failed: jobId={}", jobId, e);
            job.setStatus(PdfJob.Status.FAILED);
            job.setErrorMsg(e.getMessage());
            job.setCompletedAt(ZonedDateTime.now());
        }

        pdfJobRepository.save(job);
    }

    private String generatePdf(Catalogue catalogue) throws Exception {
        List<CatalogueItem> items = catalogueItemRepository
                .findByCatalogueCatIdOrderByPageNumberAscPositionAsc(catalogue.getCatId());

        // Create output directory
        Path outputDir = Paths.get("./uploads/pdf");
        Files.createDirectories(outputDir);

        String fileName = "catalogue-" + catalogue.getCatId() + "-v" + catalogue.getVersion() + ".pdf";
        Path outputPath = outputDir.resolve(fileName);

        // iText7 PDF generation
        try (com.itextpdf.kernel.pdf.PdfWriter writer = new com.itextpdf.kernel.pdf.PdfWriter(outputPath.toFile());
             com.itextpdf.kernel.pdf.PdfDocument pdf = new com.itextpdf.kernel.pdf.PdfDocument(writer);
             com.itextpdf.layout.Document doc = new com.itextpdf.layout.Document(pdf,
                     "A3".equals(catalogue.getPageSize())
                             ? com.itextpdf.kernel.geom.PageSize.A3
                             : com.itextpdf.kernel.geom.PageSize.A4)) {

            // --- Cover page ---
            doc.add(new com.itextpdf.layout.element.Paragraph(catalogue.getName())
                    .setFontSize(28)
                    .setBold()
                    .setMarginBottom(12));

            if (catalogue.getDescription() != null) {
                doc.add(new com.itextpdf.layout.element.Paragraph(catalogue.getDescription())
                        .setFontSize(12)
                        .setMarginBottom(24));
            }

            doc.add(new com.itextpdf.layout.element.Paragraph(
                    "Generated: " + java.time.LocalDate.now())
                    .setFontSize(9)
                    .setFontColor(com.itextpdf.kernel.colors.ColorConstants.GRAY));

            // --- Item pages ---
            if (!items.isEmpty()) {
                doc.add(new com.itextpdf.layout.element.AreaBreak());

                // Determine grid from layout_json or template
                Object layoutObj = catalogue.getLayoutJson().get("columns");
                int columns = layoutObj instanceof Integer i ? i : 2;

                com.itextpdf.layout.element.Table table =
                        new com.itextpdf.layout.element.Table(columns)
                                .useAllAvailableWidth()
                                .setMarginBottom(20);

                for (CatalogueItem ci : items) {
                    Item item = ci.getItem();
                    String displayName  = ci.getCustomName()  != null ? ci.getCustomName()  : item.getName();
                    java.math.BigDecimal displayPrice = ci.getCustomPrice() != null ? ci.getCustomPrice() : item.getPrice();

                    com.itextpdf.layout.element.Cell cell =
                            new com.itextpdf.layout.element.Cell()
                                    .setPadding(10)
                                    .setBorder(new com.itextpdf.layout.borders.SolidBorder(
                                            com.itextpdf.kernel.colors.ColorConstants.LIGHT_GRAY, 0.5f));

                    // Item name
                    cell.add(new com.itextpdf.layout.element.Paragraph(displayName)
                            .setFontSize(11).setBold().setMarginBottom(4));

                    // SKU
                    if (item.getSku() != null) {
                        cell.add(new com.itextpdf.layout.element.Paragraph("SKU: " + item.getSku())
                                .setFontSize(8)
                                .setFontColor(com.itextpdf.kernel.colors.ColorConstants.GRAY)
                                .setMarginBottom(4));
                    }

                    // Description
                    String desc = ci.getCustomDesc() != null ? ci.getCustomDesc() : item.getShortDesc();
                    if (desc != null) {
                        cell.add(new com.itextpdf.layout.element.Paragraph(desc)
                                .setFontSize(9).setMarginBottom(6));
                    }

                    // Price
                    if (displayPrice != null) {
                        String currency = item.getCurrency() != null ? item.getCurrency() : "INR";
                        cell.add(new com.itextpdf.layout.element.Paragraph(
                                currency + " " + displayPrice.toPlainString())
                                .setFontSize(13).setBold()
                                .setFontColor(new com.itextpdf.kernel.colors.DeviceRgb(30, 100, 200)));
                    }

                    table.addCell(cell);
                }

                // Fill last row if needed
                int remainder = items.size() % columns;
                if (remainder != 0) {
                    for (int i = 0; i < columns - remainder; i++) {
                        table.addCell(new com.itextpdf.layout.element.Cell()
                                .setBorder(com.itextpdf.layout.borders.Border.NO_BORDER));
                    }
                }

                doc.add(table);
            }

            // Footer on last page
            doc.add(new com.itextpdf.layout.element.Paragraph(
                    catalogue.getEnterprise().getName() + " | " + items.size() + " items")
                    .setFontSize(8)
                    .setFontColor(com.itextpdf.kernel.colors.ColorConstants.GRAY)
                    .setTextAlignment(com.itextpdf.layout.properties.TextAlignment.CENTER));
        }

        return "/uploads/pdf/" + fileName;
    }
}
