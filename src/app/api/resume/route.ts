import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { ensureBootstrapped } from "@/lib/bootstrap";
import { isEditablePlaceholder, serializeProfile } from "@/lib/profile-parser";

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (!current) {
      current = word;
    } else if (current.length + 1 + word.length <= maxChars) {
      current += ` ${word}`;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function GET() {
  try {
    await ensureBootstrapped();
    const raw = await prisma.siteProfile.findUnique({ where: { id: "default" } });
    if (!raw) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    const profile = serializeProfile(raw);

    if (profile.resumeUrl) {
      if (profile.resumeUrl.startsWith("/uploads/")) {
        const localPath = path.join(process.cwd(), "public", profile.resumeUrl.replace(/^\//, ""));
        try {
          const fileBytes = await fs.readFile(localPath);
          return new NextResponse(new Uint8Array(fileBytes), {
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": 'attachment; filename="Sanjana_Pandey_Resume.pdf"',
            },
          });
        } catch {
          // Fallback to generated PDF below if local file missing
        }
      } else if (profile.resumeUrl.startsWith("http")) {
        return NextResponse.redirect(profile.resumeUrl);
      }
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSerif = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

    const navy = rgb(0.055, 0.11, 0.21);
    const crimson = rgb(0.72, 0.14, 0.16);
    const charcoal = rgb(0.16, 0.18, 0.22);
    const muted = rgb(0.4, 0.43, 0.48);
    const rule = rgb(0.84, 0.86, 0.89);

    let y = 785;
    const left = 52;
    const right = 543;

    // Header bar
    page.drawText(profile.fullName.toUpperCase(), {
      x: left,
      y,
      size: 24,
      font: fontSerif,
      color: navy,
    });
    y -= 20;
    page.drawText(profile.designation, {
      x: left,
      y,
      size: 11,
      font: fontBold,
      color: crimson,
    });
    y -= 16;

    const contactParts = [profile.location];
    if (!isEditablePlaceholder(profile.email)) contactParts.push(profile.email);
    if (!isEditablePlaceholder(profile.phone)) contactParts.push(profile.phone);

    page.drawText(contactParts.join("  |  "), {
      x: left,
      y,
      size: 9.5,
      font: fontRegular,
      color: muted,
    });
    y -= 14;
    page.drawLine({
      start: { x: left, y },
      end: { x: right, y },
      thickness: 1.5,
      color: navy,
    });
    y -= 24;

    const drawSectionTitle = (title: string) => {
      page.drawText(title.toUpperCase(), {
        x: left,
        y,
        size: 10.5,
        font: fontBold,
        color: navy,
      });
      y -= 6;
      page.drawLine({
        start: { x: left, y },
        end: { x: right, y },
        thickness: 0.75,
        color: rule,
      });
      y -= 16;
    };

    // Profile Summary
    drawSectionTitle("Editorial Profile");
    for (const para of profile.biography.split(/\n+/).slice(0, 2)) {
      for (const line of wrapText(para, 92)) {
        page.drawText(line, { x: left, y, size: 10, font: fontRegular, color: charcoal });
        y -= 14;
      }
      y -= 4;
    }
    y -= 8;

    // Experience
    drawSectionTitle("Reporting Experience");
    page.drawText(`${profile.internshipRole} — ${profile.internshipChannel}`, {
      x: left,
      y,
      size: 11,
      font: fontBold,
      color: charcoal,
    });
    page.drawText(profile.internshipDuration, {
      x: right - 140,
      y,
      size: 9.5,
      font: fontRegular,
      color: muted,
    });
    y -= 16;
    for (const point of profile.internshipPoints) {
      for (const [idx, line] of wrapText(point, 86).entries()) {
        page.drawText(idx === 0 ? `•  ${line}` : `   ${line}`, {
          x: left + 6,
          y,
          size: 9.8,
          font: fontRegular,
          color: charcoal,
        });
        y -= 14;
      }
    }
    y -= 10;

    // Education
    drawSectionTitle("Education");
    for (const edu of profile.education) {
      page.drawText(edu.degree, { x: left, y, size: 10.8, font: fontBold, color: charcoal });
      page.drawText(edu.period, { x: right - 65, y, size: 9.5, font: fontRegular, color: muted });
      y -= 14;
      page.drawText(`${edu.institution} (${edu.location})`, {
        x: left,
        y,
        size: 9.8,
        font: fontRegular,
        color: muted,
      });
      y -= 18;
    }
    y -= 6;

    // Core Skills
    drawSectionTitle("Journalism & Broadcast Competencies");
    const skillText = profile.skills.map((s) => s.name).join("  •  ");
    for (const line of wrapText(skillText, 90)) {
      page.drawText(line, { x: left, y, size: 9.8, font: fontRegular, color: charcoal });
      y -= 14;
    }

    const pdfBytes = await pdfDoc.save();
    return new NextResponse(new Uint8Array(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="Sanjana_Pandey_Resume.pdf"',
      },
    });
  } catch (error) {
    console.error("GET /api/resume error:", error);
    return NextResponse.json({ error: "Failed to generate resume PDF." }, { status: 500 });
  }
}
